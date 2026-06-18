import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  FileSpreadsheet,
  LogOut,
  ExternalLink,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Lock,
  Database
} from "lucide-react";
import { User } from "firebase/auth";
import {
  googleSignInForSheets,
  initSheetsAuth,
  logoutSheets,
  getOrCreateSpreadsheet,
  appendAppointmentsToSheet,
  getCachedAccessToken
} from "../services/sheetsService";
import { appointmentService } from "../services/appointmentService";

interface GoogleSheetsSyncProps {
  portalAppointments?: Array<{
    specialty: string;
    location: string;
    serviceType: string;
    serviceDetail: string;
    availabilityDate: string;
    availabilityTime: string;
    patientName: string;
    patientEmail: string;
  }>;
  isDarkMode?: boolean;
}

export const GoogleSheetsSync: React.FC<GoogleSheetsSyncProps> = ({ portalAppointments = [], isDarkMode = false }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(null);
  const [syncCount, setSyncCount] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Sync current oauth state on mount
    const unsub = initSheetsAuth(
      (currentUser, activeToken) => {
        setUser(currentUser);
        setToken(activeToken);
        const url = localStorage.getItem("cuh_spreadsheet_url");
        if (url) {
          setSpreadsheetUrl(url);
        }
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsub();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const result = await googleSignInForSheets();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        // Pre-fetch or create sheet
        const sheets = await getOrCreateSpreadsheet(result.accessToken);
        setSpreadsheetUrl(sheets.url);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Google login failed. Please ensure cookies are allowed.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutSheets();
      setUser(null);
      setToken(null);
      setSpreadsheetUrl(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualSync = async () => {
    const activeToken = token || getCachedAccessToken();
    if (!activeToken) {
      setErrorMsg("Authentication required to sync data.");
      return;
    }

    setIsSyncing(true);
    setErrorMsg(null);

    try {
      // 1. Gather all scheduler appointments from local database service
      const localAppointments = appointmentService.getAppointments();

      // Convert portal appointments into unified schema
      const mappedPortalAppts = portalAppointments.map((pa, idx) => ({
        id: `portal-${idx}`,
        department: pa.specialty,
        doctorName: pa.serviceType || "Assigned Medical Officer",
        date: pa.availabilityDate,
        slot: pa.availabilityTime,
        patientName: pa.patientName,
        patientPhone: pa.patientEmail || "Not Provided",
        createdAt: new Date().toISOString()
      }));

      const allAppointmentsToSync = [...localAppointments, ...mappedPortalAppts];

      if (allAppointmentsToSync.length === 0) {
        setErrorMsg("No clinical appointments found to sync.");
        setIsSyncing(false);
        return;
      }

      await appendAppointmentsToSheet(allAppointmentsToSync, activeToken);
      setSyncCount(allAppointmentsToSync.length);
      const sheets = await getOrCreateSpreadsheet(activeToken);
      setSpreadsheetUrl(sheets.url);

      setTimeout(() => {
        setSyncCount(0);
      }, 5000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Sync failed. Check spreadsheet access permissions.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={`border rounded-2xl p-4 shadow-sm relative overflow-hidden transition-all duration-300 ${
      isDarkMode 
        ? "bg-gradient-to-br from-slate-900 to-[#0e1628] border-slate-800" 
        : "bg-gradient-to-br from-slate-50 to-blue-50/40 border-blue-200/50"
    }`}>
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-[#0266c8]/5 rounded-full filter blur-xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
          <div>
            <span className={`text-[11.5px] font-black tracking-wide uppercase block ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>
              Google Sheets Synchronization
            </span>
            <span className={`text-[9.5px] font-mono font-medium block ${isDarkMode ? "text-slate-450" : "text-slate-500"}`}>
              REAL-TIME CLINICAL LEDGER
            </span>
          </div>
        </div>

        {user && (
          <button
            onClick={handleLogout}
            title="Disconnect Google Account"
            className={`p-1 px-2 border rounded-md transition-colors text-[9px] font-black font-mono flex items-center gap-1 cursor-pointer ${
              isDarkMode 
                ? "border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-red-400" 
                : "border-slate-200/80 hover:bg-slate-100/90 text-slate-500 hover:text-red-600"
            }`}
          >
            <LogOut className="w-3 h-3" /> DISCONNECT
          </button>
        )}
      </div>

      {user ? (
        <div className="space-y-3">
          {/* Linked Account Status */}
          <div className={`flex items-center justify-between p-2.5 border rounded-xl transition-colors ${
            isDarkMode ? "bg-slate-950/80 border-slate-800" : "bg-white border-slate-200/60"
          }`}>
            <div className="flex items-center gap-2">
              <img
                src={user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
                alt={user.displayName || "Google"}
                className={`w-7 h-7 rounded-full border ${isDarkMode ? "border-slate-800" : "border-slate-200/85"}`}
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <p className={`text-[11px] font-extrabold truncate leading-none ${isDarkMode ? "text-slate-250" : "text-slate-800"}`}>
                  {user.displayName}
                </p>
                <p className="text-[9.5px] text-slate-400 select-all font-mono truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <span className="text-[9px] font-black text-emerald-400 bg-emerald-950/35 px-2 py-0.5 rounded-full border border-emerald-900/40 flex items-center gap-0.5 animate-pulse">
              ● SYNC ACTIVE
            </span>
          </div>

          {/* Connected Spreadsheet Info */}
          {spreadsheetUrl ? (
            <div className={`border rounded-xl p-2.5 flex items-center justify-between transition-colors ${
              isDarkMode ? "bg-emerald-950/15 border-emerald-900/30" : "bg-emerald-55/50 border-emerald-200/50"
            }`}>
              <div className="flex items-center gap-2 min-w-0">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <p className={`text-[10px] font-black leading-none ${isDarkMode ? "text-slate-250" : "text-slate-800"}`}>Connected Spreadsheet</p>
                  <p className="text-[9px] text-slate-400 font-medium truncate mt-0.5">Cooper Hospital Appointments</p>
                </div>
              </div>
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className={`shrink-0 p-1.5 rounded-lg shadow-sm flex items-center gap-0.5 text-[9.5px] font-extrabold transition-all border ${
                  isDarkMode 
                    ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-blue-400" 
                    : "bg-white border-slate-200 text-[#0266c8] hover:bg-slate-50"
                }`}
              >
                <span>Sheet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <p className="text-[10px] text-slate-400 font-medium">
              Generating secure clinical Google Sheet...
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2.5">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className={`flex-1 text-white p-2 text-[10.5px] font-extrabold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                isDarkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-[#0266c8] hover:bg-blue-600"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : "Sync Local Database"}
            </button>
          </div>

          {/* Sync Celebration Feedback */}
          {syncCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border p-2 rounded-lg text-[10.5px] font-bold flex items-center gap-1.5 transition-colors ${
                isDarkMode 
                  ? "bg-emerald-950/40 border-emerald-990 text-emerald-300" 
                  : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Successfully exported {syncCount} appointments to your Google Sheet!</span>
            </motion.div>
          )}
        </div>
      ) : (
        <div className={`text-center py-3 border rounded-xl space-y-3.5 p-3 transition-colors ${
          isDarkMode ? "bg-slate-950/80 border-slate-800" : "bg-white border-slate-200/70"
        }`}>
          <p className="text-[11px] text-slate-400 font-medium leading-normal px-1">
            Access secure bi-directional clinical data feeds by authorizing your Google account. Saved coordinates auto-append securely.
          </p>

          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className={`w-full flex items-center justify-center gap-2 p-2 rounded-xl text-[11px] font-extrabold transition-all shadow-sm cursor-pointer disabled:opacity-50 ${
              isDarkMode 
                ? "bg-slate-900 hover:bg-slate-800 border-slate-805 text-slate-200" 
                : "bg-slate-50 hover:bg-slate-100 border-slate-250 text-slate-750"
            }`}
          >
            {isLoggingIn ? (
              <div className={`w-3.5 h-3.5 border border-t-transparent rounded-full animate-spin ${isDarkMode ? "border-slate-300" : "border-slate-600"}`} />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
            )}
            <span>Sign in with Google</span>
          </button>
        </div>
      )}

      {/* Error Alert panel */}
      {errorMsg && (
        <p className={`text-[10px] font-semibold mt-2.5 border px-2.5 py-1 rounded-lg ${
          isDarkMode 
            ? "bg-red-950/25 border-red-900/40 text-red-450" 
            : "bg-red-500/10 border-red-550 text-red-650"
        }`}>
          ⚠️ {errorMsg}
        </p>
      )}
    </div>
  );
};
