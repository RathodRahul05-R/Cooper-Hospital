// Pre-existing Portal Types
export interface Doctor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  social: {
    facebook?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
  };
  featuredColor: string;
  tagline: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  summary: string;
  image: string;
  readTime: string;
  date: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  image: string;
  rating: number;
}

export interface AppointmentFormInput {
  specialty: string;
  location: string;
  serviceType: string;
  serviceDetail: string;
  availabilityDate: string;
  availabilityTime: string;
  patientName: string;
  patientEmail: string;
}

// New Ava Clinical Assistant Types
export interface Message {
  id: string;
  sender: "user" | "ava" | "system";
  text: string;
  timestamp: string;
  status?: "sending" | "sent" | "read";
  cardType?: "appointment";
}

export interface HistorySession {
  id: string;
  type: "text" | "voice";
  title: string;
  subtitle: string;
  date: string;
}

export interface SymptomGuide {
  id: string;
  symptomEn: string;
  symptomTe: string;
  descriptionEn: string;
  descriptionTe: string;
  homeCareEn: string;
  homeCareTe: string;
  redFlagsEn: string;
  redFlagsTe: string;
}

