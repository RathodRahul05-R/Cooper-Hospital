import { Doctor } from "../types";
import { DOCTORS } from "../data";

export interface Appointment {
  id: string;
  department: string;
  doctorName: string;
  doctorAvatar?: string;
  date: string;
  slot: string;
  patientName: string;
  patientPhone: string;
  createdAt: string;
}

class AppointmentService {
  private STORAGE_KEY = "cuh_ava_appointments";

  // Available Departments
  getDepartments(): string[] {
    return [
      "General Cardiology",
      "Cooper Neurological Institute",
      "MD Anderson Cancer Center",
      "Geriatric Rehabilitation",
      "Palliative & Supportive Care",
      "General Surgery Desk"
    ];
  }

  // Get Doctors by Department
  getDoctorsByDepartment(department: string): Doctor[] {
    const matched = DOCTORS.filter((doc) => {
      const role = doc.role.toLowerCase();
      const text = department.toLowerCase();
      
      if (text.includes("cardiology") && role.includes("cardio")) return true;
      if (text.includes("neurological") && role.includes("neuro")) return true;
      if (text.includes("cancer") && role.includes("oncol")) return true;
      if (text.includes("geriatric") && role.includes("geriat")) return true;
      if (text.includes("palliative") && role.includes("palli")) return true;
      if (text.includes("surgery") && role.includes("surgeon")) return true;

      return false;
    });

    // Fallback to all doctors if no match
    return matched.length > 0 ? matched : DOCTORS;
  }

  // Generate Slots
  getAvailableSlots(date: string): string[] {
    // Generate standard hospital hours
    return [
      "09:00 AM",
      "10:15 AM",
      "11:30 AM",
      "01:00 PM",
      "02:15 PM",
      "03:30 PM",
      "04:45 PM"
    ];
  }

  // Save Booked Appointment
  async bookAppointment(appointmentData: Omit<Appointment, "id" | "createdAt">): Promise<Appointment> {
    // Artificial latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newAppointment: Appointment = {
      ...appointmentData,
      id: `apt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const existing = this.getAppointments();
    const updated = [newAppointment, ...existing];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));

    // Send to Google Apps Script if VITE_GOOGLE_SCRIPT_URL is provided
    const scriptUrl = (import.meta as any).env.VITE_GOOGLE_SCRIPT_URL;
    if (scriptUrl) {
      try {
        console.log("Sending appointment payload to Google Apps Script webhook:", newAppointment);
        // We use mode: 'no-cors' by default because Google Apps Script redirects across domains,
        // and standard fetch can feel like a CORS block unless mode is configured safely.
        await fetch(scriptUrl, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newAppointment),
        });
        console.log("Appointment successfully dispatched to Google Apps Script!");
      } catch (scriptErr) {
        console.error("Google Apps Script sync failed:", scriptErr);
      }
    }

    // Dispatch a custom window event in case other components want to listen
    const event = new CustomEvent("cuh-appointment-booked", { detail: newAppointment });
    window.dispatchEvent(event);

    return newAppointment;
  }

  // Retrieve Sessions
  getAppointments(): Appointment[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Delete appointment
  deleteAppointment(id: string): void {
    const existing = this.getAppointments();
    const updated = existing.filter((apt) => apt.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }
}

export const appointmentService = new AppointmentService();
