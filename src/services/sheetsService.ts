import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";
import { Appointment } from "./appointmentService";

// Initialize Firebase App without duplicating
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request the Sheets scope
provider.addScope("https://www.googleapis.com/auth/spreadsheets");

// Keep access token strictly in memory
let cachedAccessToken: string | null = null;
let isSigningIn = false;

/**
 * Sync active auth listener
 */
export const initSheetsAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Triggers official Google Sign-In popup with required Sheets scopes
 */
export const googleSignInForSheets = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to extract OAuth access token");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error("Cooper Sheets OAuth error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Accessor for cached token
 */
export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Triggers sign out
 */
export const logoutSheets = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  localStorage.removeItem("cuh_spreadsheet_id");
  localStorage.removeItem("cuh_spreadsheet_url");
};

/**
 * Resolves or creates the Cooper sheet
 */
export const getOrCreateSpreadsheet = async (accessToken: string): Promise<{ id: string; url: string }> => {
  const cachedId = localStorage.getItem("cuh_spreadsheet_id");
  const cachedUrl = localStorage.getItem("cuh_spreadsheet_url");

  if (cachedId && cachedUrl) {
    return { id: cachedId, url: cachedUrl };
  }

  // Create a new spreadsheet using standard Google Sheets API
  const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        title: "Cooper Hospital Appointments",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Sheets creation gateway failed: ${response.statusText}`);
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl;

  // Add structured medical headers (Name, Phone, Department, Doctor, Slot, Date) matching the spreadsheet layout exactly
  const headerResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:F1?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [
          [
            "Name",
            "Phone",
            "Department",
            "Doctor",
            "Slot",
            "Date"
          ],
        ],
      }),
    }
  );

  if (!headerResponse.ok) {
    console.warn("Could not write header row, but spreadsheet is created:", headerResponse.statusText);
  }

  localStorage.setItem("cuh_spreadsheet_id", spreadsheetId);
  localStorage.setItem("cuh_spreadsheet_url", spreadsheetUrl);

  return { id: spreadsheetId, url: spreadsheetUrl };
};

/**
 * Appends a list of appts directly to the sheet
 */
export const appendAppointmentsToSheet = async (
  appointments: Appointment[],
  accessToken: string
): Promise<void> => {
  const { id: spreadsheetId } = await getOrCreateSpreadsheet(accessToken);

  const rows = appointments.map((apt) => [
    apt.patientName,
    apt.patientPhone,
    apt.department,
    apt.doctorName,
    apt.slot,
    apt.date,
  ]);

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A:F:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: rows,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Could not append appointments: ${response.statusText}`);
  }
};
