import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useConversation } from "@elevenlabs/react";
import { FloatingButton } from "./components/FloatingButton";
import { FloatingAIWidget } from "./components/FloatingAIWidget";
import { GoogleSheetsSync } from "./components/GoogleSheetsSync";
import {
  Activity,
  Search,
  User,
  Calendar,
  MapPin,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Mail,
  Check,
  Phone,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Award,
  Users,
  BookOpen,
  Heart,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Info,
  CalendarPlus,
  Compass,
  Bookmark,
  Send,
  MessageSquareText,
  Paperclip,
  Mic,
  History,
  ChevronDown,
  Moon,
  Sun
} from "lucide-react";

import { DOCTORS, BLOG_POSTS, TESTIMONIALS, SPECIALTIES, LOCATIONS, SERVICE_TYPES } from "./data";
import { Doctor, BlogPost, AppointmentFormInput } from "./types";
import { getCachedAccessToken, googleSignInForSheets, appendAppointmentsToSheet } from "./services/sheetsService";
// Local helper functions for direct clinical consultations
async function consultDoctorClientSide(
  doctor: { name: string; role: string },
  history: any[],
  lang: string = "en",
  _attachments: any[] = []
): Promise<string> {
  try {
    const lastUserMsg = history[history.length - 1]?.text || "";
    const response = await fetch("/api/doctor-consult", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: lastUserMsg,
        history,
        doctorName: doctor.name,
        doctorRole: doctor.role,
        lang
      })
    });
    if (!response.ok) {
      throw new Error(`Direct consultation endpoint returned ${response.status}`);
    }
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.warn("Direct doctor consultation API failed; falling back to rule-based engine:", error);
    const lastUserMsg = history[history.length - 1]?.text || "";
    return getFriendlyDoctorResponse(doctor.name, lastUserMsg, lang);
  }
}

async function askAva(history: any[]): Promise<string> {
  const lastUserMsg = history[history.length - 1]?.text || "";
  return `Thank you for contacting Cooper University Hospital support desk. Regarding your inquiry: "${lastUserMsg}", one of our senior desk coordinators is looking into your case and will respond promptly. If this is an emergency, please dial 911 immediately.`;
}

function getFriendlyDoctorResponse(doctorName: string, userMsg: string, lang?: string): string {
  const isTelugu = lang === "te" || /[\u0c00-\u0c7f]/.test(userMsg);
  const docLastName = doctorName.split(" ").pop() || "Doctor";

  if (isTelugu) {
    const greeting = `నమస్కారం! నేను డాక్టర్ ${docLastName}. మీ సమస్యను నేను అర్థం చేసుకోగలను. నేను మీకు సహాయం చేయడానికి ఇక్కడే ఉన్నాను.`;
    const latestUserMsg = userMsg.toLowerCase();
    
    if (latestUserMsg.includes("fever") || latestUserMsg.includes("temperature") || latestUserMsg.includes("జ్వరం") || latestUserMsg.includes("వేడి")) {
      return `${greeting} మీకు జ్వరం మరియు అధిక ఉష్ణోగ్రత ఉన్నట్లు తెలుస్తోంది. దయచేసి తలపై తడి గుడ్డను ఉంచండి, తేలికపాటి దుప్పటిని వాడండి మరియు పుష్కలంగా నీరు త్రాగండి. పూర్తి విశ్రాంతి తీసుకోండి!`;
    } else if (latestUserMsg.includes("stomach") || latestUserMsg.includes("belly") || latestUserMsg.includes("కడుపు") || latestUserMsg.includes("నొప్పి") || latestUserMsg.includes("వాంతులు")) {
      return `${greeting} కడుపు నొప్పి చాలా ఇబ్బంది కలిగిస్తుంది. దయచేసి ఎడమ వైపునకు తిరిగి పడుకోండి, గోరువెచ్చని శొంఠి నీరు లేదా పుదీనా నీరు త్రాగండి. జీర్ణవ్యవస్థకు విశ్రాంతి ఇవ్వండి.`;
    } else if (latestUserMsg.includes("head") || latestUserMsg.includes("migraine") || latestUserMsg.includes("తలనొప్పి") || latestUserMsg.includes("కళ్ళు తిరగడం")) {
      return `${greeting} తలనొప్పి తగ్గడానికి గదిలో వెలుతురును మరియు మొబైల్ స్క్రీన్లను తగ్గించండి. కొంచెం నీరు లేదా హెర్బల్ టీ త్రాగి నిశ్శబ్దంగా విశ్రాంతి తీసుకోండి.`;
    } else if (latestUserMsg.includes("cough") || latestUserMsg.includes("throat") || latestUserMsg.includes("దగ్గు") || latestUserMsg.includes("జలుబు") || latestUserMsg.includes("గొంతు")) {
      return `${greeting} దగ్గు మరియు గొంతు నొప్పి నివారణకు వేడి నీటి ఆవిరిని పీల్చండి, ఒక చెంచా తేనె తీసుకోండి మరియు గొంతును తేమగా ఉంచడానికి గోరువెచ్చని నీరు త్రాగండి.`;
    } else if (latestUserMsg.includes("neck") || latestUserMsg.includes("shoulder") || latestUserMsg.includes("నొప్పి") || latestUserMsg.includes("కండరాలు")) {
      return `${greeting} కండరాల నొప్పులు లేక భుజాల నొప్పుల కోసం వేడి కాపడం పెట్టండి, నిదానంగా స్ట్రెచెస్ చేయండి మరియు బరువైన పనులు చేయడం ఆపండి.`;
    } else if (latestUserMsg.includes("chest") || latestUserMsg.includes("breath") || latestUserMsg.includes("గుండె") || latestUserMsg.includes("శ్వాస")) {
      return `${greeting} నిటారుగా కూర్చుని నిదానంగా శ్వాస తీసుకోండి. ప్రశాంతంగా ఉండటానికి ప్రయత్నించండి. నేను మీ పక్కనే ఉన్నాను.`;
    } else {
      return `${greeting} మీ సమస్య నాకు అర్థమైంది. దయచేసి పుష్కలంగా నీరు త్రాగండి మరియు తగినంత విశ్రాంతి తీసుకోండి. నేను మీకు సహాయం చేయడానికి నిరంతరం సిద్ధంగా ఉంటాను.`;
    }
  }

  const greeting = `Oh! I hear you loud and clear. As your friendly Dr. ${docLastName}, I'm right here with you.`;
  const latestUserMsg = userMsg.toLowerCase();

  // Extract custom nouns/key phrases to make custom responses feel organic
  const words = userMsg.split(/\s+/).map(w => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim()).filter(w => w.length > 3);
  const coreKeywords = words.filter(w => !["about", "there", "would", "could", "should", "please", "hello", "thanks", "thank", "doctor", "cooper", "help", "need", "have", "with", "from", "some", "what"].includes(w.toLowerCase()));
  const topicString = coreKeywords.slice(0, 3).join(" and ");

  if (latestUserMsg.includes("fever") || latestUserMsg.includes("temperature") || latestUserMsg.includes("hot") || latestUserMsg.includes("chill") || latestUserMsg.includes("feverish")) {
    return `${greeting} Since you're dealing with a feverish feeling and raised temperature, I suggest propping yourself up under a light blanket, placing a tepid damp compress on your forehead, and drinking cool wellness tea or water immediately. Rest is your body's best medicine here!`;
  } else if (latestUserMsg.includes("stomach") || latestUserMsg.includes("belly") || latestUserMsg.includes("abdominal") || latestUserMsg.includes("nausea") || latestUserMsg.includes("cramp") || latestUserMsg.includes("vomit")) {
    return `${greeting} Stomach soreness or cramps can be so draining! I highly suggest lying flat on your left side to minimize intestinal strain, drinking gentle sips of warm peppermint water, and keeping your nutrition purely to soft broths today. Let's let your digestive tract rest fully.`;
  } else if (latestUserMsg.includes("head") || latestUserMsg.includes("migraine") || latestUserMsg.includes("headache") || latestUserMsg.includes("dizzy") || latestUserMsg.includes("pressure")) {
    return `${greeting} For that headache and localized head pressure, the most practical solution is to dim your room lights, step completely away from digital screens for 30 minutes, and drink a tall, cold glass of water. Focus on deep head-and-neck relaxation breaths.`;
  } else if (latestUserMsg.includes("neck") || latestUserMsg.includes("shoulder") || latestUserMsg.includes("back") || latestUserMsg.includes("sore") || latestUserMsg.includes("ache") || latestUserMsg.includes("muscle") || latestUserMsg.includes("joint") || latestUserMsg.includes("pain")) {
    const specificSymptom = latestUserMsg.includes("neck") ? "neck and shoulder soreness" : "pain and physical soreness";
    return `${greeting} Dealing with ${specificSymptom} is incredibly tough. I strongly advise taking any pressure off those sore joints immediately, trying some extremely slow, circular shoulder rolls, and using a warm heating pad to soothe the muscles. Avoid heavy lifting!`;
  } else if (latestUserMsg.includes("cough") || latestUserMsg.includes("throat") || latestUserMsg.includes("congestion") || latestUserMsg.includes("cold") || latestUserMsg.includes("sinus")) {
    return `${greeting} To soothe that persistent cough and dry throat irritation, I suggest propping your chin up with extra pillows, inhaling clean steam or taking a warm shower, and having a relaxing spoonful of pure honey. Keep your throat well hydrated!`;
  } else if (latestUserMsg.includes("chest") || latestUserMsg.includes("breath") || latestUserMsg.includes("heart") || latestUserMsg.includes("breathing")) {
    return `${greeting} For any chest tightness or breathing strain, let's stop and breathe slowly with a supportive posture. Sit up straight in a comfortable chair, pull your shoulders back to let your lungs expand fully, and try to relax. I am right by your side!`;
  } else {
    // High premium-quality dynamic personalization when clinical queries are generic
    const targetTopic = topicString ? `your specific concerns about "${topicString}"` : "what you are currently experiencing";
    return `${greeting} I hear your message clearly regarding ${targetTopic}. Focus on light physical stretching, continuous hydration with pure water, and total relaxation. What particular questions can I guide you on next? I am here to help you solve this!`;
  }
}

export function CooperLogo({ className = "h-11 w-auto", lightText = false }: { className?: string; lightText?: boolean }) {
  const color = lightText ? "#ffffff" : "#0f172a";
  const crossColor = lightText ? "#ffffff" : "#0f172a";
  
  return (
    <span className="inline-flex items-center">
      <svg
        viewBox="0 0 310 95"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        id="cooper-hospital-logo-svg"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
      >
        <g transform="translate(5, 5)">
          {/* Elegant Precision-Optimized HD Crescent Moon Shape on the Left */}
          <path 
            d="M 82,13 C 44,5 4,24 4,48 C 4,72 44,91 82,83 C 48,88 26,71 26,48 C 26,25 48,8 82,13 Z" 
            fill={color} 
            shapeRendering="geometricPrecision"
          />
          {/* Solid, Upright Bold Medical Cross Centered Inside Crescent Support */}
          <rect x="36" y="44" width="24" height="8" rx="0.5" fill={crossColor} shapeRendering="geometricPrecision" />
          <rect x="44" y="36" width="8" height="24" rx="0.5" fill={crossColor} shapeRendering="geometricPrecision" />
          
          {/* Bold italic "Cooper" text on the right */}
          <text
            x="100"
            y="48"
            fontFamily="'Inter', ui-sans-serif, system-ui, sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="46"
            fill={color}
            letterSpacing="-2"
            textRendering="geometricPrecision"
          >
            Cooper
          </text>

          {/* Styled Subtitle text matching updated image exactly */}
          <text
            x="102"
            y="66"
            fontFamily="'Inter', ui-sans-serif, system-ui, sans-serif"
            fontWeight="800"
            fontStyle="italic"
            fontSize="11.5"
            fill={color}
            letterSpacing="1.8"
            textRendering="geometricPrecision"
          >
            CONSUMER HEALTH
          </text>
        </g>
      </svg>
    </span>
  );
}

export default function App() {
  // Navigation & UI States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAppointmentsDrawerOpen, setIsAppointmentsDrawerOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("cuh_dark_mode") !== "false"; // Default to dark medical theme as requested!
  });

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem("cuh_dark_mode", String(next));
      return next;
    });
  };

  // Business States
  const [activeBlogCategory, setActiveBlogCategory] = useState("All");
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [isTestimonialHovered, setIsTestimonialHovered] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const doctorsScrollRef = React.useRef<HTMLDivElement>(null);
  const globalChatEndRef = React.useRef<HTMLDivElement>(null);
  const [isDoctorsHovered, setIsDoctorsHovered] = useState(false);

  // User Interactive States (More hover buttons on every box)
  const [favorites, setFavorites] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [selectedBlogForSummary, setSelectedBlogForSummary] = useState<BlogPost | null>(null);
  const [activeDirectChatDoctor, setActiveDirectChatDoctor] = useState<Doctor | null>(null);
  const [chatInputValue, setChatInputValue] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "doctor"; text: string; time: string }[]>([]);
  const [isDoctorTyping, setIsDoctorTyping] = useState(false);
  const [activeVerificationDoctor, setActiveVerificationDoctor] = useState<Doctor | null>(null);
  const [selectedSafetyFeature, setSelectedSafetyFeature] = useState<{ title: string; desc: string; detail: string } | null>(null);
  const [selectedCertification, setSelectedCertification] = useState<{ title: string; body: string; code: string } | null>(null);

  // Global AI Chatbot States (Bottom Right Floating Assistant)
  const [avaWidgetOpen, setAvaWidgetOpen] = useState(false);
  const [isGlobalChatOpen, setIsGlobalChatOpen] = useState(false);
  const [globalChatInputValue, setGlobalChatInputValue] = useState("");
  const [globalChatTab, setGlobalChatTab] = useState<"chat" | "voice" | "history">("chat");
  const [globalChatMessages, setGlobalChatMessages] = useState<{ sender: "user" | "doctor"; text: string; time: string }[]>([
    {
      sender: "doctor",
      text: "Hello! I'm Ava, your AI Agent for support. How may I assist you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isGlobalChatTyping, setIsGlobalChatTyping] = useState(false);
  const [showHelperTooltip, setShowHelperTooltip] = useState(true);

  // Advanced Voice Agent States
  const [voiceLanguage, setVoiceLanguage] = useState<'en' | 'te'>('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sttListening, setSttListening] = useState(false);
  const [voiceAutoRead, setVoiceAutoRead] = useState(true);
  const [teluguSpeaker, setTeluguSpeaker] = useState<string>("meera");
  const [englishSpeaker, setEnglishSpeaker] = useState<string>("meera");
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Live API States and Refs
  const useLiveApi = false;
  const [callingEngine, setCallingEngine] = useState<"elevenlabs" | "interactive">("elevenlabs");
  const [elevenlabsAgentId, setElevenlabsAgentId] = useState<string>(() => {
    return localStorage.getItem("elevenlabs_agent_id") || 
      ((import.meta as any).env?.VITE_ELEVENLABS_AGENT_ID) || 
      "afab57a4387d41cce22e4a40e22b88c33b83a2af217faebaec014f50a5fb872e";
  });
  const liveSessionActive = false;

  // ElevenLabs Conversational AI Hook
  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs AI Agent");
      setIsInVoiceCall(true);
      triggerToast(voiceLanguage === "te" ? "🎙️ అవా విజయవంతంగా కనెక్ట్ చేయబడింది! మాట్లాడండి." : "🎙️ Connected to ElevenLabs AI Agent! Speak naturally now.");
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs AI Agent");
      setIsInVoiceCall(false);
      triggerToast(voiceLanguage === "te" ? "🔴 సంభాషణ ముగిసింది." : "🔴 Call finished.");
    },
    onMessage: (message: any) => {
      console.log("Received message from ElevenLabs:", message);
    },
    onError: (error: any) => {
      console.error("ElevenLabs Session error:", error);
      const errMsg = error.message || "";
      if (errMsg.includes("404") || errMsg.includes("Agent not found") || errMsg.includes("not found")) {
        triggerToast(voiceLanguage === "te" 
          ? "క్షమించండి: ఈ ఎలెవెన్‌ల్యాబ్స్ ఏజెంట్ ఐడి చెల్లదు లేదా తొలగించబడింది. దయచేసి సరైన ఏజెంట్ ఐడిని నమోదు చేయండి." 
          : "Error: ElevenLabs Agent not found. Please provide a valid Agent ID in the field below.");
      } else {
        triggerToast(voiceLanguage === "te" ? "కనెక్షన్ ఎర్రర్. తిరిగి ప్రయత్నించండి." : `ElevenLabs Session Error: ${errMsg || "Failed to make call"}`);
      }
      setIsInVoiceCall(false);
    }
  });

  // File attachments and continuous voice states
  const [voiceContinuousMode, setVoiceContinuousMode] = useState(true);
  const [isInVoiceCall, setIsInVoiceCall] = useState(false);
  const [globalChatFiles, setGlobalChatFiles] = useState<{ name: string; type: string; base64: string; textContent?: string; size: number }[]>([]);
  const [directChatFiles, setDirectChatFiles] = useState<{ name: string; type: string; base64: string; textContent?: string; size: number }[]>([]);
  const globalFileInputRef = useRef<HTMLInputElement>(null);
  const directFileInputRef = useRef<HTMLInputElement>(null);

  // Archive sessions list for the history tab
  const [sessionsList, setSessionsList] = useState<{ id: string; title: string; date: string; messages: { sender: "user" | "doctor"; text: string; time: string }[] }[]>([
    {
      id: "sess_1",
      title: "🩺 Initial Symptoms Diagnostic Evaluation",
      date: "Today, 10:45 AM",
      messages: [
        { sender: "user", text: "I have some fever and a persistent dry throat.", time: "10:43 AM" },
        { sender: "doctor", text: "Hello! Since you have a fever and dry throat, keep hydrated, place a cold compress, and rest. I am here with you.", time: "10:44 AM" }
      ]
    },
    {
      id: "sess_2",
      title: "📋 Patient Profile Synchronization Completed",
      date: "Yesterday",
      messages: [
        { sender: "user", text: "Help me check my patient file details.", time: "Yesterday, 3:12 PM" },
        { sender: "doctor", text: "I have successfully verified and synced your clinical patient profile details for secure local storage.", time: "Yesterday, 3:13 PM" }
      ]
    },
    {
      id: "sess_3",
      title: "💊 Safe Home Care Guideline Reference",
      date: "June 12, 2026",
      messages: [
        { sender: "user", text: "Suggest some good home care tips for neck stiffness.", time: "June 12, 11:20 AM" },
        { sender: "doctor", text: "Try hot/cold packs, slow circular neck rolls, and avoid lifting heavy loads. Let those sore tissues relax.", time: "June 12, 11:21 AM" }
      ]
    }
  ]);

  // Automatically hide the helper message after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHelperTooltip(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  // Form States & Storage Integration
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const [appointments, setAppointments] = useState<AppointmentFormInput[]>([
    {
      specialty: "General Cardiology",
      location: "New York City, NY",
      serviceType: "In-Clinic Consultation",
      serviceDetail: "Initial heart screening and ECG evaluation.",
      availabilityDate: "2026-06-18",
      availabilityTime: "10:30 AM",
      patientName: "John Doe",
      patientEmail: "rathodrahulnayak2006@gmail.com"
    }
  ]);

  const [appointmentForm, setAppointmentForm] = useState<AppointmentFormInput>({
    specialty: "Alzheimer's & Dementia Care",
    location: "New York City, NY",
    serviceType: "In-Clinic Consultation",
    serviceDetail: "Routine cognitive assessment.",
    availabilityDate: "",
    availabilityTime: "09:00 AM",
    patientName: "",
    patientEmail: ""
  });

  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Counter states for elegant stats incrementing
  const [doctorCount, setDoctorCount] = useState(0);
  const [clinicCount, setClinicCount] = useState(0);
  const [specialtyCount, setSpecialtyCount] = useState(0);

  const [statsVisible, setStatsVisible] = useState(false);
  const statsSectionRef = React.useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (statsSectionRef.current) {
      observer.observe(statsSectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!statsVisible) return;

    // Reset before animating
    setDoctorCount(0);
    setClinicCount(0);
    setSpecialtyCount(0);

    const docInterval = setInterval(() => {
      setDoctorCount(prev => (prev < 4000 ? prev + 100 : 4000));
    }, 20);
    const clinicInterval = setInterval(() => {
      setClinicCount(prev => (prev < 300 ? prev + 10 : 300));
    }, 30);
    const specInterval = setInterval(() => {
      setSpecialtyCount(prev => (prev < 60 ? prev + 2 : 60));
    }, 45);

    return () => {
      clearInterval(docInterval);
      clearInterval(clinicInterval);
      clearInterval(specInterval);
    };
  }, [statsVisible]);

  // Sync scroll with section triggers
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "about", "services", "doctors", "insights", "appointment"];
      const scrollPosition = window.scrollY + 160;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Notification close helper
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Auto scroll global AI chat to bottom when messages are updated
  useEffect(() => {
    if (globalChatEndRef.current) {
      globalChatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [globalChatMessages, isGlobalChatTyping]);

  // Autoplay / continuous slide testimonials unless hovered
  useEffect(() => {
    if (isTestimonialHovered) return;
    
    const interval = setInterval(() => {
      setTestimonialIndex(prev => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
    }, 5500);
    
    return () => clearInterval(interval);
  }, [isTestimonialHovered]);

  // Seamless Infinite Auto-scroll Runner for Doctors list (running left to right)
  useEffect(() => {
    if (isDoctorsHovered) return;
    
    let animationFrameId: number;
    const scrollContainer = doctorsScrollRef.current;
    if (!scrollContainer) return;

    const scrollSpeed = 0.65; // Ultra-smooth pixels per frame slide speed

    const performScroll = () => {
      if (scrollContainer) {
        const singleListWidth = scrollContainer.scrollWidth / 3;
        
        // Continuously advance scroll position
        scrollContainer.scrollLeft += scrollSpeed;
        
        // Reset scroll position imperceptibly by one list width once we cross the threshold
        if (scrollContainer.scrollLeft >= singleListWidth * 2) {
          scrollContainer.scrollLeft -= singleListWidth;
        }
      }
      animationFrameId = requestAnimationFrame(performScroll);
    };

    animationFrameId = requestAnimationFrame(performScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isDoctorsHovered]);

  const triggerToast = (message: string, type: "success" | "info" = "success") => {
    setNotification({ message, type });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentForm.availabilityDate || !appointmentForm.patientName || !appointmentForm.patientEmail) {
      triggerToast("Please fill in all required fields (Date, Name, Email)", "info");
      return;
    }

    // Add to simulated ledger state (which also persists in this active session)
    const newAppointment = { ...appointmentForm };
    setAppointments([newAppointment, ...appointments]);

    // Format fields specifically according to sheets schema
    const appointmentToSync = {
      id: `portal-${Date.now()}`,
      department: appointmentForm.specialty,
      doctorName: appointmentForm.serviceType || "Assigned Medical Officer",
      date: appointmentForm.availabilityDate,
      slot: appointmentForm.availabilityTime || "09:00 AM",
      patientName: appointmentForm.patientName,
      patientPhone: appointmentForm.patientEmail || "Not Provided",
      createdAt: new Date().toISOString()
    };

    // Check if we already have an active authorized sheet session
    let sheetsToken = getCachedAccessToken();
    if (!sheetsToken) {
      const confirmGoogle = window.confirm(
        `Would you like to automatically store and sync this appointment to your Google Sheet? Click OK to sign in and authorize securely.`
      );
      if (confirmGoogle) {
        try {
          const result = await googleSignInForSheets();
          if (result) {
            sheetsToken = result.accessToken;
          }
        } catch (err) {
          console.error("Google authentication failed:", err);
          triggerToast("Authorized failed. Registered locally inside standard session.", "info");
        }
      }
    }

    if (sheetsToken) {
      try {
        triggerToast("Syncing appointment to Google Sheets...");
        await appendAppointmentsToSheet([appointmentToSync], sheetsToken);
        triggerToast(`Successfully saved and synced ${appointmentForm.patientName}'s appointment to your Google Sheets!`);
      } catch (sheetsErr) {
        console.error("Auto sheets sync failed:", sheetsErr);
        triggerToast("Google Sheets sync failed. Appointment saved locally in active session.", "info");
      }
    } else {
      triggerToast(`Appointment successfully booked for ${appointmentForm.patientName}! check 'My Hub' above.`);
    }

    // Reset standard form parameters but retain selection fields
    setAppointmentForm({
      ...appointmentForm,
      availabilityDate: "",
      patientName: "",
      patientEmail: ""
    });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setIsSubscribed(true);
    triggerToast("Thank you! You have subscribed to health updates.", "success");
    setNewsletterEmail("");
  };

  const selectDoctorForBooking = (doc: Doctor) => {
    // Pre-fill specialty parameter based on doctor's role
    setAppointmentForm(prev => ({
      ...prev,
      specialty: doc.role === "Cardiologist" ? "General Cardiology" :
                doc.role === "Surgeon" ? "General Surgery Desk" :
                doc.role === "Neurologist" ? "Interventional Neurosurgery" :
                "Palliative & Supportive Care"
    }));
    triggerToast(`Selected ${doc.name}. Booking form updated with their specialty.`);
    // Scroll smoothly to appointment section
    const el = document.getElementById("appointment");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDoctorsScroll = (direction: "left" | "right") => {
    if (doctorsScrollRef.current) {
      const { scrollLeft, clientWidth } = doctorsScrollRef.current;
      const scrollAmount = clientWidth * 0.75; // Scroll by 75% of view area
      doctorsScrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputValue.trim() || !activeDirectChatDoctor || isDoctorTyping) return;
    
    const userMsg = chatInputValue.trim();
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const attachmentsToSend = [...directChatFiles];
    
    const uiUserMessage = { sender: "user" as const, text: userMsg, time: currentTime, attachments: attachmentsToSend };
    const nextUserMessagesUI = [...chatMessages, uiUserMessage];
    setChatMessages(nextUserMessagesUI);
    setChatInputValue("");
    setDirectChatFiles([]); // Clear pending files
    setIsDoctorTyping(true);
    
    try {
      const gHistory = nextUserMessagesUI.map(m => ({
        sender: m.sender,
        text: m.attachments && m.attachments.length > 0 
          ? formatUserPromptWithAttachedFiles(m.text, m.attachments)
          : m.text
      }));
      
      const responseText = await consultDoctorClientSide(
        { name: activeDirectChatDoctor.name, role: activeDirectChatDoctor.role },
        gHistory,
        "en",
        attachmentsToSend
      );
      
      const responseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatMessages([...nextUserMessagesUI, { sender: "doctor" as const, text: responseText, time: responseTime }]);
      triggerToast(`Dr. ${activeDirectChatDoctor.name.split(' ').pop()} sent a diagnostic reply!`);
    } catch (err) {
      console.error(err);
      const responseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const fallbackText = getFriendlyDoctorResponse(activeDirectChatDoctor.name, userMsg);
      setChatMessages([...nextUserMessagesUI, { sender: "doctor" as const, text: fallbackText, time: responseTime }]);
      triggerToast(`Dr. ${activeDirectChatDoctor.name.split(' ').pop()} formulated a personalized plan!`);
    } finally {
      setIsDoctorTyping(false);
    }
  };

  // Advanced Vocal Support Utilities (Telugu and English TTS / STT using client-side SpeechSynthesis)
  const speakText = async (text: string, langCode: "en" | "te") => {
    // 1. Cancel/stop any ongoing HTML5 audio playing
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch (e) {
        console.warn("Error stopping active audio:", e);
      }
      currentAudioRef.current = null;
    }

    // 2. Clear ongoing default browser speech queue also
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    // Set speaking active state
    setIsSpeaking(true);

    // Clean emojis and extra formats
    const speechReadyText = text.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "").trim();

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(speechReadyText);
      utterance.lang = langCode === "te" ? "te-IN" : "en-US";
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      utterance.onerror = (e) => {
        console.error("SpeechSynthesis error:", e);
        setIsSpeaking(false);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  };

  const startVoiceCall = async () => {
    setIsInVoiceCall(true);
    if (callingEngine === "elevenlabs") {
      triggerToast(voiceLanguage === "te" ? "📞 ఎలెవెన్‌ల్యాబ్స్ వాయిస్ కాల్ కనెక్ట్ అవుతోంది..." : "📞 Connecting ElevenLabs clinical voice agent...");
      try {
        await conversation.startSession({
          agentId: elevenlabsAgentId
        });
      } catch (err: any) {
        console.error("Failed to start ElevenLabs session:", err);
        triggerToast(`ElevenLabs Call Failed: ${err.message || 'Check microphone configuration'}`);
        setIsInVoiceCall(false);
      }
    } else {
      triggerToast(voiceLanguage === "te" ? "📞 ఆవా వైద్య సహాయకురాలితో కాల్ కనెక్ట్ అవుతోంది..." : "📞 Establishing clinical voice session with Ava...");
      setTimeout(() => {
        startSTT(true);
      }, 400);
    }
  };

  const endVoiceCall = async () => {
    setIsInVoiceCall(false);
    setSttListening(false);
    setIsSpeaking(false);
    
    if (callingEngine === "elevenlabs") {
      try {
        await conversation.endSession();
      } catch (err) {}
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    // Cancel any active synthetic speaking audio streams
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch (e) {}
      currentAudioRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    triggerToast(voiceLanguage === "te" ? "🔴 వాయిస్ కాల్ ముగిసింది" : "🔴 Voice consultation call ended");
  };

  const startSTT = (forceStart = false) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      triggerToast(voiceLanguage === "te" ? "ఈ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ సపోర్ట్ లేదు." : "Your browser does not support Speech Recognition. Please try Chrome/Safari.");
      return;
    }

    // Do not start if speaking or API key is loading, unless explicitly triggered manually
    if (!forceStart && (isSpeaking || isGlobalChatTyping)) {
      console.log("Speech recognition start bypassed: Ava is speaking or typing.");
      return;
    }

    if (sttListening) {
      return;
    }

    // Stop speaking while listening
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const rec = new SpeechRecognition();
    rec.lang = voiceLanguage === "te" ? "te-IN" : "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setSttListening(true);
      triggerToast(voiceLanguage === "te" ? "🎙️ లైవ్ కనెక్షన్: మాట్లాడండి..." : "🎙️ Voice Session: Speak clearly now...");
    };

    rec.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      if (speechToText) {
        setGlobalChatInputValue(speechToText);
        triggerToast(voiceLanguage === "te" ? `గ్రహించిన మాట: "${speechToText}"` : `Heard: "${speechToText}"`);
        // Trigger automated vocal submit
        handleSendVoiceMessage(speechToText);
      }
    };

    rec.onerror = (e: any) => {
      console.error("Speech recognition error:", e);
      setSttListening(false);
    };

    rec.onend = () => {
      setSttListening(false);
      // Automatically resume listening if call session is active, and NOT currently speaking or busy
      setTimeout(() => {
        // Let's check states relative to the latest closures
        if (!isSpeaking && !isGlobalChatTyping) {
          // Double-check if still in voice call
          // We look up the component-level state dynamically
          setIsInVoiceCall(currentInCall => {
            if (currentInCall) {
              startSTT();
            }
            return currentInCall;
          });
        }
      }, 600);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const getActiveVoiceDoctor = () => {
    if (voiceLanguage === "te") {
      switch (teluguSpeaker) {
        case "meera":
          return { name: "Meera (మీరా)", role: "General Physician" };
        case "pujya":
          return { name: "Pujya (పూజ్య)", role: "Pediatric Specialist" };
        case "sukanya":
          return { name: "Sukanya (సుకన్య)", role: "Cardiology Expert" };
        case "surya":
          return { name: "Surya (సూర్య)", role: "Orthopedic Surgeon" };
        default:
          return { name: "Meera (మీరా)", role: "General Health Expert" };
      }
    } else {
      switch (englishSpeaker) {
        case "amogh":
          return { name: "Amogh", role: "Pediatric & Family Care Physician" };
        case "surya":
          return { name: "Surya", role: "Orthopedic Specialist" };
        case "meera":
          return { name: "Meera", role: "Clinical Nutritionist & GP" };
        case "pujya":
          return { name: "Pujya", role: "Cardiology & Lifestyle Clinician" };
        default:
          return { name: "Amogh", role: "Medical Care Special Agent" };
      }
    }
  };

  const handleGlobalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    files.forEach((file: File) => {
      const reader = new FileReader();
      const isText = file.type.startsWith("text/") || 
                     file.name.endsWith(".txt") || 
                     file.name.endsWith(".json") || 
                     file.name.endsWith(".csv") || 
                     file.name.endsWith(".md");
      
      if (isText) {
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setGlobalChatFiles(prev => [...prev, {
            name: file.name,
            type: "text/plain",
            base64: "",
            textContent: text,
            size: file.size
          }]);
          triggerToast(voiceLanguage === "te" ? `ఫైల్ జోడించబడింది: ${file.name}` : `Document attached: ${file.name}`);
        };
        reader.readAsText(file);
      } else {
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          setGlobalChatFiles(prev => [...prev, {
            name: file.name,
            type: file.type || "application/octet-stream",
            base64: base64,
            size: file.size
          }]);
          triggerToast(voiceLanguage === "te" ? `ఫైల్ జోడించబడింది: ${file.name}` : `Document attached: ${file.name}`);
        };
        reader.readAsDataURL(file);
      }
    });
    e.target.value = "";
  };

  const handleDirectFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    files.forEach((file: File) => {
      const reader = new FileReader();
      const isText = file.type.startsWith("text/") || 
                     file.name.endsWith(".txt") || 
                     file.name.endsWith(".json") || 
                     file.name.endsWith(".csv") || 
                     file.name.endsWith(".md");
      
      if (isText) {
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setDirectChatFiles(prev => [...prev, {
            name: file.name,
            type: "text/plain",
            base64: "",
            textContent: text,
            size: file.size
          }]);
          triggerToast(`Document attached: ${file.name}`);
        };
        reader.readAsText(file);
      } else {
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          setDirectChatFiles(prev => [...prev, {
            name: file.name,
            type: file.type || "application/octet-stream",
            base64: base64,
            size: file.size
          }]);
          triggerToast(`Document attached: ${file.name}`);
        };
        reader.readAsDataURL(file);
      }
    });
    e.target.value = "";
  };

  const formatUserPromptWithAttachedFiles = (text: string, files: any[]) => {
    if (!files || files.length === 0) return text;
    
    let richText = text;
    richText += `\n\n[Patient Clinical Attachment: ${files.map(f => f.name).join(", ")}]`;
    files.forEach(f => {
      if (f.textContent) {
        richText += `\n\n--- Content excerpt of "${f.name}" ---\n${f.textContent.slice(0, 3000)}\n-----------------------------------`;
      } else {
        richText += `\n(Attached file "${f.name}" of type ${f.type} was included with message context)`;
      }
    });
    return richText;
  };

  const handleSendVoiceMessage = async (spokenText: string) => {
    if (isGlobalChatTyping) return;
    
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isTe = voiceLanguage === "te";
    const textLower = spokenText.toLowerCase();

    // Context-aware triggers for booking an appointment in English and Telugu
    const isBookingIntent = 
      (textLower.includes("book") && textLower.includes("appointment")) ||
      (textLower.includes("appointment") && textLower.includes("book")) ||
      textLower.includes("schedule") ||
      textLower.includes("అపాయింట్మెంట్") || 
      textLower.includes("అపాయింట్‌మెంట్") ||
      textLower.includes("బుక్ చేయి");

    if (isBookingIntent) {
      // Choose date & time & department dynamically
      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      const days = isTe 
        ? ['ఆదివారం', 'సోమవారం', 'మంగళవారం', 'బుధవారం', 'గురువారం', 'శుక్రవారం', 'శనివారం']
        : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = isTe
        ? ['జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్', 'జూలై', 'ఆగస్టు', 'సెప్టెంబరు', 'అక్టోబరు', 'నవంబరు', 'డిసెంబరు']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dayName = days[tomorrowDate.getDay()];
      const monthName = months[tomorrowDate.getMonth()];
      const formattedDate = isTe 
        ? `${tomorrowDate.getDate()} ${monthName} (${dayName})`
        : `${dayName}, ${monthName} ${tomorrowDate.getDate()}`;
      
      const sessionTime = "11:30 AM";
      const departmentTxt = isTe ? "సాధారణ సంప్రదింపులు (General OP Unit)" : "General Medicine & Outpatient Unit";

      // Formulate voice text response
      const confirmationText = isTe
        ? `ఖచ్చితంగా! నేను కూపర్ హాస్పిటల్‌లో ${formattedDate} న ఉదయం ${sessionTime} గంటలకు మీ అపాయింట్‌మెంట్‌ను మా రికార్డులలో నమోదు చేశాను. దీనిని ధృవీకరించడానికి నేను ఇప్పుడు మీ వాట్సాప్ (9392472134) కు రసీదు పంపుతున్నాను.`
        : `Certainly! I have registered your clinical consultation at Cooper Hospital for ${formattedDate} at ${sessionTime} with our ${departmentTxt}. Opening WhatsApp to finalize your active appointment booking now!`;

      const uiUserMessage = { sender: "user" as const, text: spokenText, time: currentTime };
      const doctorReply = { sender: "doctor" as const, text: confirmationText, time: currentTime };
      
      const dbDate = tomorrowDate.toISOString().split('T')[0];
      const newAppt: AppointmentFormInput = {
        specialty: departmentTxt,
        location: "Cooper Hospital Main Campus",
        serviceType: "In-Clinic Consultation",
        serviceDetail: isTe ? "ఆవా వాయిస్ అసిస్టెంట్ ద్వారా ఆటోమేటిక్‌గా బుక్ చేయబడింది" : "Automatically booked via AI Calling Agent Ava",
        availabilityDate: dbDate,
        availabilityTime: sessionTime,
        patientName: appointmentForm.patientName || "Valued Voice Patient",
        patientEmail: appointmentForm.patientEmail || "rathodrahulnayak2006@gmail.com"
      };

      setAppointments(prev => [newAppt, ...prev]);
      setGlobalChatMessages(prev => [...prev, uiUserMessage, doctorReply]);

      // Open WhatsApp on exact number 9392472134
      const whatsappMsg = isTe
        ? `*కూపర్ హాస్పిటల్స్ అపాయింట్‌మెంట్ రశీదు:*\n\n• నోట్: ఆవా వైద్య సహాయకురాలి ఆటోమేటిక్ బుకింగ్\n• రోగి పేరు: ${appointmentForm.patientName || "రోగి"}\n• తేదీ: ${formattedDate}\n• సమయం: ${sessionTime}\n• విభాగం: ${departmentTxt}\n\nదయచేసి ఈ వైద్య బుకింగ్‌ను ధృవీకరించగలరు.`
        : `*COOPER HOSPITAL APPOINTMENT BOOKING RECEIPT:*\n\n• Booked By: Ava Voice Calling Agent\n• Patient Name: ${appointmentForm.patientName || "Valued Patient"}\n• Scheduled Date: ${formattedDate}\n• Scheduled Time: ${sessionTime}\n• Department: ${departmentTxt}\n\nThank you for choosing Cooper Hospital. See you soon!`;
      
      const whatsappUrl = `https://wa.me/919392472134?text=${encodeURIComponent(whatsappMsg)}`;

      try {
        const opened = window.open(whatsappUrl, "_blank");
        if (!opened) {
          triggerToast(isTe ? "వాట్సాప్ విండో బ్లాక్ చేయబడింది. దయచేసి పాపప్స్ అనుమతించండి!" : "WhatsApp popup blocked. Please allow browser popups!", "info");
        }
      } catch (e) {
        console.warn("Popup block error:", e);
      }

      triggerToast(isTe ? "అపాయింట్‌మెంట్ బుక్ చేయబడింది! వాట్సాప్ ఓపెన్ అవుతోంది." : "Appointment Booked! Opening WhatsApp confirmation.", "success");
      
      // Speak confirmation out loud
      speakText(confirmationText, voiceLanguage);
      return;
    }

    // Incorporate any active global files
    const attachmentsToSend = [...globalChatFiles];
    
    const uiUserMessage = { sender: "user" as const, text: spokenText, time: currentTime, attachments: attachmentsToSend };
    const nextUserMessagesUI = [...globalChatMessages, uiUserMessage];
    setGlobalChatMessages(nextUserMessagesUI);
    setGlobalChatFiles([]); // Clear pending files
    setIsGlobalChatTyping(true);
    
    const activeVoiceDoc = getActiveVoiceDoctor();
    
    // Map database history message strings with injected document snippets
    const apiMessages = nextUserMessagesUI.map(m => {
      if (m.attachments && m.attachments.length > 0) {
        return {
          sender: m.sender,
          text: formatUserPromptWithAttachedFiles(m.text, m.attachments),
          time: m.time
        };
      }
      return { sender: m.sender, text: m.text, time: m.time };
    });
    
    try {
      const responseText = await consultDoctorClientSide(
        { name: activeVoiceDoc.name, role: activeVoiceDoc.role },
        apiMessages,
        voiceLanguage,
        attachmentsToSend
      );
      const responseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const doctorReply = { sender: "doctor" as const, text: responseText, time: responseTime };
      setGlobalChatMessages([...nextUserMessagesUI, doctorReply]);
      
      // Auto speech response for voice call
      speakText(responseText, voiceLanguage);
    } catch (err) {
      console.error(err);
      const responseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const fallbackText = getFriendlyDoctorResponse(activeVoiceDoc.name, spokenText, voiceLanguage);
      const doctorReply = { sender: "doctor" as const, text: fallbackText, time: responseTime };
      setGlobalChatMessages([...nextUserMessagesUI, doctorReply]);
      speakText(fallbackText, voiceLanguage);
    } finally {
      setIsGlobalChatTyping(false);
    }
  };

  const handleSendGlobalChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalChatInputValue.trim() || isGlobalChatTyping) return;
    
    const userMsg = globalChatInputValue.trim();
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    // Ingest any active files
    const attachmentsToSend = [...globalChatFiles];
    
    const uiUserMessage = { sender: "user" as const, text: userMsg, time: currentTime, attachments: attachmentsToSend };
    const nextUserMessagesUI = [...globalChatMessages, uiUserMessage];
    setGlobalChatMessages(nextUserMessagesUI);
    setGlobalChatInputValue("");
    setGlobalChatFiles([]); // Clear pending files
    setIsGlobalChatTyping(true);
    
    const activeVoiceDoc = getActiveVoiceDoctor();
    
    // Enrich prompt with documentation metadata details
    const apiMessages = nextUserMessagesUI.map(m => {
      if (m.attachments && m.attachments.length > 0) {
        return {
          sender: m.sender,
          text: formatUserPromptWithAttachedFiles(m.text, m.attachments),
          time: m.time
        };
      }
      return { sender: m.sender, text: m.text, time: m.time };
    });
    
    try {
      const responseText = await consultDoctorClientSide(
        { name: activeVoiceDoc.name, role: activeVoiceDoc.role },
        apiMessages,
        voiceLanguage,
        attachmentsToSend
      );
      const responseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const doctorReply = { sender: "doctor" as const, text: responseText, time: responseTime };
      setGlobalChatMessages([...nextUserMessagesUI, doctorReply]);
      
      // Speak out loud if voice auto-read is active or if we are using the Voice tab!
      if (voiceAutoRead || globalChatTab === "voice") {
        speakText(responseText, voiceLanguage);
      }
    } catch (err) {
      console.error(err);
      const responseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const fallbackText = getFriendlyDoctorResponse(activeVoiceDoc.name, userMsg, voiceLanguage);
      const doctorReply = { sender: "doctor" as const, text: fallbackText, time: responseTime };
      setGlobalChatMessages([...nextUserMessagesUI, doctorReply]);
      
      if (voiceAutoRead || globalChatTab === "voice") {
        speakText(fallbackText, voiceLanguage);
      }
    } finally {
      setIsGlobalChatTyping(false);
    }
  };

  const handleSendGlobalChatPreset = async (presetText: string) => {
    if (isGlobalChatTyping) return;
    
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nextUserMessages = [...globalChatMessages, { sender: "user" as const, text: presetText, time: currentTime }];
    setGlobalChatMessages(nextUserMessages);
    setIsGlobalChatTyping(true);
    
    const activeVoiceDoc = getActiveVoiceDoctor();
    
    try {
      const gHistory = nextUserMessages.map(m => ({
        sender: m.sender,
        text: m.text
      }));
      const responseText = await consultDoctorClientSide(
        { name: activeVoiceDoc.name, role: activeVoiceDoc.role },
        gHistory,
        voiceLanguage,
        []
      );
      const responseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const doctorReply = { sender: "doctor" as const, text: responseText, time: responseTime };
      setGlobalChatMessages([...nextUserMessages, doctorReply]);
      
      if (voiceAutoRead || globalChatTab === "voice") {
        speakText(responseText, voiceLanguage);
      }
    } catch (err) {
      console.error(err);
      const responseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const fallbackText = getFriendlyDoctorResponse(activeVoiceDoc.name, presetText, voiceLanguage);
      const doctorReply = { sender: "doctor" as const, text: fallbackText, time: responseTime };
      setGlobalChatMessages([...nextUserMessages, doctorReply]);
      
      if (voiceAutoRead || globalChatTab === "voice") {
        speakText(fallbackText, voiceLanguage);
      }
    } finally {
      setIsGlobalChatTyping(false);
    }
  };

  // Filters calculation
  const blogCategories = ["All", "Palliative care", "Hospice care", "Patient Safety", "Medical Team", "Mental health in order adults"];
  
  const filteredBlogs = activeBlogCategory === "All"
    ? BLOG_POSTS
    : BLOG_POSTS.filter(blog => blog.category.toLowerCase() === activeBlogCategory.toLowerCase());

  // Search filter
  const foundDocs = searchQuery.trim() === ""
    ? []
    : DOCTORS.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.role.toLowerCase().includes(searchQuery.toLowerCase()));

  const foundBlogs = searchQuery.trim() === ""
    ? []
    : BLOG_POSTS.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.summary.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden ${
      isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"
    }`}>
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className={`p-4 rounded-xl border shadow-xl flex items-start gap-3 backdrop-blur-md ${
              notification.type === "success" 
                ? "bg-emerald-500/95 border-emerald-400 text-white" 
                : "bg-blue-600/95 border-blue-505 text-white"
            }`}>
              {notification.type === "success" ? (
                <div className="p-1 rounded-lg bg-white/20"><Check className="w-5 h-5 text-white" /></div>
              ) : (
                <div className="p-1 rounded-lg bg-white/20"><Info className="w-5 h-5 text-white" /></div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-sm">System Update</p>
                <p className="text-xs opacity-90 mt-0.5">{notification.message}</p>
              </div>
              <button onClick={() => setNotification(null)} className="text-white hover:text-slate-100 p-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER / NAVIGATION BAR */}
      <header id="app-header" className={`sticky top-0 z-40 w-full backdrop-blur-md border-b transition-all duration-200 ${
        isDarkMode ? "bg-slate-900/90 border-slate-800/80" : "bg-white/90 border-slate-100"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Brand Logo */}
            <a href="#home" className="flex items-center gap-1 group">
              <CooperLogo className="h-10 w-auto" lightText={isDarkMode} />
              <span className="sr-only">Cooper University Hospital</span>
            </a>

            {/* Desktop Navigation Link System */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { name: "Home", id: "home" },
                { name: "About Us", id: "about" },
                { name: "Services", id: "services" },
                { name: "Insights", id: "insights" },
                { name: "Bookings", id: "appointment" }
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative group ${
                    activeSection === item.id
                      ? "text-blue-500 font-bold"
                      : isDarkMode
                        ? "text-slate-300 hover:text-white"
                        : "text-slate-650 hover:text-blue-600"
                  }`}
                >
                  <span className="relative z-10">{item.name}</span>
                  <span 
                    className={`absolute bottom-1 left-4 right-4 h-0.5 bg-blue-600 rounded-full transition-all duration-300 origin-center ${
                      activeSection === item.id 
                        ? "scale-x-100 opacity-100" 
                        : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                    }`}
                  />
                </a>
              ))}
            </nav>

            {/* Header CTA Tools */}
            <div className="hidden md:flex items-center gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleDarkMode}
                className={`p-2.5 rounded-xl transition-colors relative ${
                  isDarkMode 
                    ? "text-yellow-400 hover:text-yellow-300 hover:bg-slate-800" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
                title={isDarkMode ? "Switch to Light Clinical Theme" : "Switch to Dark Medical Theme"}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
          
              {/* Personal Booking Hub Button (Shows count of active booked bookings) */}
              <button
                onClick={() => setIsAppointmentsDrawerOpen(true)}
                className={`p-2.5 rounded-xl transition-colors relative ${
                  isDarkMode 
                    ? "text-slate-300 hover:text-white hover:bg-slate-800" 
                    : "text-slate-600 hover:text-blue-600 hover:bg-slate-100"
                }`}
                title="Your Appointments Drawer"
                id="appointments-hub-btn"
              >
                <User className="w-5 h-5" />
                {appointments.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-emerald-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse border border-white">
                    {appointments.length}
                  </span>
                )}
              </button>

              {/* Quick Appointment Call-to-Action */}
              <a
                href="#appointment"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-md shadow-blue-100 hover:scale-102 hover:shadow-lg hover:shadow-blue-200 transition-all duration-200 flex items-center gap-2"
                id="appointment-button"
              >
                <Phone className="w-4 h-4" />
                <span>Appointment</span>
                <span className="text-[11px] bg-blue-500/80 px-1.5 py-0.5 rounded text-blue-50"></span>
              </a>
            </div>

            {/* Mobile Action Controls */}
            <div className={`flex md:hidden items-center gap-1.5`}>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? "text-yellow-400 hover:text-yellow-300 hover:bg-slate-800"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsAppointmentsDrawerOpen(true)}
                className={`p-2 relative rounded-lg ${isDarkMode ? "text-slate-350 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-50"}`}
              >
                <User className="w-5 h-5" />
                {appointments.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center">
                    {appointments.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`p-2 rounded-lg ${isDarkMode ? "text-slate-350 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-50"}`}
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? "text-slate-350 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"}`}
                id="hamburger-menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Panel */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-slate-100 bg-white"
            >
              <div className="px-4 py-4 space-y-2">
                {[
                  { name: "Home Dashboard", id: "home" },
                  { name: "About Hospital", id: "about" },
                  { name: "Medical Services", id: "services" },
                  { name: "Meet Specialists", id: "doctors" },
                  { name: "Latest Insights", id: "insights" },
                  { name: "Book Consultation", id: "appointment" }
                ].map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      activeSection === item.id
                        ? "text-blue-600 bg-blue-50/70 font-semibold"
                        : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                    }`}
                  >
                    {item.name}
                  </a>
                ))}
                
                <div className="pt-4 border-t border-slate-150 flex flex-col gap-3">
                  <a
                    href="#appointment"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full bg-blue-600 text-white text-center py-3 rounded-xl font-medium shadow-md shadow-blue-100 hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Secure Booking Now</span>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* SEARCH AND EXPLORATION MODAL OVERLAY */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <Compass className="w-5 h-5 text-blue-600" />
                  <span>Interactive Search Center</span>
                </div>
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search doctor names, specialties (e.g. Cardiologist, Surgeon) or health articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-200/80 rounded-xl text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    autoFocus
                  />
                </div>

                {/* Instant Live Search Logic */}
                <div className="mt-6 max-h-[350px] overflow-y-auto space-y-4 pr-1">
                  {searchQuery.trim() === "" ? (
                    <div className="text-center py-10 text-slate-400">
                      <Search className="w-10 h-10 mx-auto stroke-1 mb-2 text-slate-300" />
                      <p className="text-sm">Type keywords above to find instantly</p>
                      <div className="flex flex-wrap gap-2 justify-center mt-4">
                        {["Jordan", "Surgeon", "Neurologist", "Dementia Care", "Hospice"].map(t => (
                          <button
                            key={t}
                            onClick={() => setSearchQuery(t)}
                            className="text-xs bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 px-3 py-1.5 rounded-full border border-slate-200/50 transition-all font-medium"
                          >
                            #{t}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Doctors matches */}
                      {foundDocs.length > 0 && (
                        <div>
                          <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">Matched Specialists ({foundDocs.length})</h4>
                          <div className="grid gap-2">
                            {foundDocs.map(d => (
                              <button
                                key={d.id}
                                onClick={() => {
                                  setSelectedDoctor(d);
                                  setIsSearchOpen(false);
                                  setSearchQuery("");
                                }}
                                className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/40 w-full text-left transition-all"
                              >
                                <img referrerPolicy="no-referrer" src={d.avatar} alt={d.name} className="w-10 h-10 rounded-lg object-cover" />
                                <div className="flex-1">
                                  <h5 className="font-semibold text-sm text-slate-850">{d.name}</h5>
                                  <p className="text-xs text-blue-600 font-medium">{d.role}</p>
                                </div>
                                <span className="text-[11px] bg-white border border-slate-150 px-2.5 py-1 rounded-md text-slate-500">View Bio</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Blogs matches */}
                      {foundBlogs.length > 0 && (
                        <div className="pt-2">
                          <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">Matched Insight Articles ({foundBlogs.length})</h4>
                          <div className="grid gap-2">
                            {foundBlogs.map(b => (
                              <a
                                key={b.id}
                                href="#insights"
                                onClick={() => {
                                  setSearchQuery("");
                                  setIsSearchOpen(false);
                                  setActiveBlogCategory(b.category);
                                }}
                                className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 w-full block text-left transition-all"
                              >
                                <div className="flex items-center justify-between text-xs text-blue-600 font-semibold mb-1">
                                  <span>{b.category}</span>
                                  <span>{b.readTime}</span>
                                </div>
                                <h5 className="font-semibold text-sm text-slate-900 line-clamp-1">{b.title}</h5>
                                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{b.summary}</p>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {foundDocs.length === 0 && foundBlogs.length === 0 && (
                        <div className="text-center py-10 text-slate-400">
                          <p className="text-sm">No doctors or medical insights found for <span className="font-bold text-slate-800">"{searchQuery}"</span></p>
                          <p className="text-xs text-slate-400 mt-1">Try searching for other terms like "Jordan", "Cardiology", or "Care"</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* APPOINTMENTS LEDGER HUB DRAWER (SLIDES IN) */}
      <AnimatePresence>
        {isAppointmentsDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950"
              onClick={() => setIsAppointmentsDrawerOpen(false)}
            />
            {/* Drawer Body */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed inset-y-0 right-0 z-50 w-full max-w-md shadow-2xl border-l flex flex-col transition-colors duration-300 ${
                isDarkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-100 text-slate-800"
              }`}
            >
              <div className={`p-4 sm:p-6 border-b flex items-center justify-between transition-colors duration-300 ${
                isDarkMode ? "border-slate-800 bg-slate-950/40" : "border-slate-100 bg-slate-50"
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${isDarkMode ? "bg-blue-955 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
                    <CalendarPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`font-bold font-display text-lg ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>My Appointments Hub</h3>
                    <p className={`text-xs font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Session-synchronized medical ledger</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAppointmentsDrawerOpen(false)}
                  className={`p-1 rounded-full transition-all ${
                    isDarkMode ? "text-slate-400 hover:text-slate-100 hover:bg-slate-800" : "text-slate-400 hover:text-slate-800 hover:bg-slate-200/50"
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Appointment list */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <GoogleSheetsSync portalAppointments={appointments} isDarkMode={isDarkMode} />

                {appointments.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">
                    <Calendar className="w-12 h-12 mx-auto text-slate-200 stroke-1 mb-3" />
                    <p className="font-medium text-sm">No booked sessions found</p>
                    <p className="text-xs text-slate-400 mt-1">Book professional healthcare services using the scheduling form below.</p>
                    <button
                      onClick={() => {
                        setIsAppointmentsDrawerOpen(false);
                        const el = document.getElementById("appointment");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg"
                    >
                      Fill Form Now
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-slate-500 font-medium pb-2 border-b border-slate-100">
                      Showing {appointments.length} scheduled session{appointments.length > 1 ? "s" : ""}
                    </p>
                    
                    {appointments.map((appt, i) => (
                      <motion.div
                        key={i}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-50/80 hover:bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-sm relative group overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
                        
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded-md">
                            {appt.specialty}
                          </span>
                          <button
                            onClick={() => {
                              setAppointments(appointments.filter((_, idx) => idx !== i));
                              triggerToast("Appointment removed from your personal medical hub.");
                            }}
                            className="text-slate-400 hover:text-rose-600 opacity-60 group-hover:opacity-100 transition-opacity p-0.5"
                            title="Cancel Booking"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <h4 className="font-semibold text-sm text-slate-850 mt-1 select-all">{appt.patientName}</h4>
                        <p className="text-xs text-slate-500 select-all mb-3">{appt.patientEmail}</p>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-3 border-t border-slate-200/60">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            <span>{appt.availabilityDate || "Pending"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-medium justify-end">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            <span>{appt.availabilityTime}</span>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-150 mt-3 font-mono">
                          <span className="block font-semibold uppercase text-[9px] tracking-wider text-slate-400 mb-0.5">Mode & Facility</span>
                          {appt.serviceType} @ {appt.location}
                        </div>
                      </motion.div>
                    ))}
                  </>
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <p className="text-xs text-slate-500 leading-relaxed text-center">
                  This hub updates instantly in your current session. Please arrive 15 minutes before scheduled times.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* MAIN HERO SECTION */}
      <section id="home" className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden">
        
        {/* Subtle Background Radial Accent Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-teal-100/20 rounded-full blur-[80px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left relative z-10">
              
              {/* Premium Healthcare Tagline with Animation */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`inline-flex items-center gap-2 border px-4 py-2 rounded-full shadow-sm text-xs font-semibold tracking-wider uppercase ${
                  isDarkMode 
                    ? "bg-slate-900 border-slate-800 text-blue-400" 
                    : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 text-blue-700"
                }`}
              >
                <Sparkles className={`w-4 h-4 animate-pulse ${isDarkMode ? "text-blue-400 fill-blue-400/20" : "text-blue-600 fill-blue-600/30"}`} />
                <span>Exceptional Care Always</span>
              </motion.div>

              {/* High-Concept Display Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight leading-[1.1] ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Smart <span className="text-blue-500 relative inline-block">
                  Healthcare
                  <span className={`absolute left-0 bottom-0.5 w-full h-1 rounded ${isDarkMode ? "bg-blue-400/30" : "bg-blue-600/10"}`} />
                </span> <br />
                With A Human
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-light ${
                  isDarkMode ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Providing extraordinary, trusted medical services for every phase of your journey. Experience elite specialists, empathetic staff, and world-class treatments engineered around your absolute comfort.
              </motion.p>

              {/* Primary Call to Action Controls */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <motion.a
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  href="#appointment"
                  className={`w-full sm:w-auto inline-flex items-center gap-3 border font-bold p-1.5 pr-7 pl-1.5 rounded-full shadow-md hover:shadow-lg transition-all text-base cursor-pointer group ${
                    isDarkMode 
                      ? "bg-slate-905 border-slate-800 text-slate-100 hover:border-slate-700" 
                      : "bg-white border-slate-200/90 text-slate-900 hover:border-slate-300"
                  }`}
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 transition-colors ${
                    isDarkMode ? "bg-blue-600 group-hover:bg-blue-500" : "bg-black group-hover:bg-slate-900"
                  }`}>
                    <ArrowUpRight className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </div>
                  <span className={`font-sans font-bold tracking-tight select-none pb-0.5 ${
                    isDarkMode ? "text-slate-100" : "text-slate-900"
                  }`}>Get Started Today</span>
                </motion.a>

                <motion.a
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  href="#about"
                  className={`w-full sm:w-auto border font-medium px-8 py-4 rounded-xl transition-all text-base text-center inline-block cursor-pointer ${
                    isDarkMode 
                      ? "bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300 hover:text-white" 
                      : "bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  Learn More
                </motion.a>
              </motion.div>

              {/* Trusted Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="pt-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <div className="flex -space-x-3">
                  {[
                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100",
                    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100",
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                  ].map((url, index) => (
                    <img key={index} src={url} referrerPolicy="no-referrer" alt="Patient Care Avatar" className={`w-10 h-10 rounded-full border-2 object-cover shadow-sm ${isDarkMode ? "border-slate-800" : "border-white"}`} />
                  ))}
                </div>
                <div className={`text-center sm:text-left text-xs font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  <span className={`font-bold block sm:inline ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>Trusted by 136K+ Patients</span>{" "}
                  for premium, around-the-clock hospital assistance.
                </div>
              </motion.div>

            </div>

            {/* Right Media Collage Column */}
            <div className="lg:col-span-5 relative">
              
              {/* Premium Image Container with Doctor */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -8, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className={`relative mx-auto max-w-sm lg:max-w-none rounded-[40px] p-6 shadow-xl group/hero-card transition-all duration-500 cursor-pointer border ${
                  isDarkMode 
                    ? "bg-gradient-to-tr from-slate-900 via-slate-925 to-slate-950 border-slate-800" 
                    : "bg-gradient-to-tr from-blue-50 to-violet-50 border-white"
                }`}
              >
                <div className={`relative overflow-hidden rounded-[30px] shadow-lg aspect-[5/6] ${isDarkMode ? "bg-slate-950" : "bg-slate-100"}`}>
                  <img
                    referrerPolicy="no-referrer"
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=650"
                    alt="Leading Nurse Specialist"
                    className="w-full h-full object-cover scale-100 group-hover/hero-card:scale-108 transition-transform duration-[800ms] ease-out cursor-pointer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />
                </div>

                {/* Deep Interactive Floating Widget: Psychologist Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className={`absolute -bottom-6 -left-4 sm:-left-8 border p-4 rounded-2xl shadow-xl max-w-[230px] space-y-3 ${
                    isDarkMode ? "bg-slate-905 border-slate-800" : "bg-white border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      referrerPolicy="no-referrer"
                      src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100"
                      alt="Specialist Counselor"
                      className="w-9 h-9 rounded-full object-cover bg-slate-150"
                    />
                    <div>
                      <h4 className={`text-xs font-bold ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>Specialist Counselor</h4>
                      <p className={`text-[10px] font-semibold ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>Dementia Support Specialist</p>
                    </div>
                  </div>
                  
                  <div className={`flex items-center justify-between text-[11px] p-2 rounded-lg ${
                    isDarkMode ? "bg-slate-950/60 text-slate-400" : "bg-slate-50 text-slate-500"
                  }`}>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Mon-Fri</span>
                    </div>
                    <span className={`font-bold ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>3:00 PM</span>
                  </div>

                  <a
                    href="#appointment"
                    onClick={() => {
                      setAppointmentForm(prev => ({
                        ...prev,
                        specialty: "Alzheimer's & Dementia Care"
                      }));
                      triggerToast("Form defaulted to Alzheimer's & Dementia specialty!");
                    }}
                    className="w-full text-center block bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium py-2 rounded-lg transition-colors"
                  >
                    Quick Consult
                  </a>
                </motion.div>

              </motion.div>

            </div>

          </div>
        </div>
      </section>

      {/* THREE COUNTERS STATS SECTION */}
      <section ref={statsSectionRef} className={`border-y py-12 relative transition-colors duration-500 ${
        isDarkMode ? "bg-slate-950 border-slate-900" : "bg-white border-slate-100"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-12 gap-8 md:gap-4 items-center">
            
            <div className="md:col-span-4 text-center md:text-left space-y-2">
              <h3 className="text-lg uppercase text-blue-500 font-extrabold tracking-widest text-[11px]">Dynamic Scalability</h3>
              <p className={`text-2xl font-bold font-display leading-snug ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>
                Trusted Care for Every Step of Your Journey
              </p>
            </div>

             <div className="md:col-span-8 grid grid-cols-3 gap-4 text-center animate-once">
              
              <div 
                className={`space-y-1 p-4 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 group relative cursor-pointer flex flex-col justify-between border ${
                  isDarkMode 
                    ? "bg-slate-900 hover:bg-slate-850/60 border-slate-800 hover:border-blue-900/50" 
                    : "bg-slate-50 hover:bg-blue-50/30 border-slate-150 hover:border-blue-300"
                }`}
                onClick={() => {
                  const el = document.getElementById("services");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                  triggerToast("Explore our certified clinical specialists below.");
                }}
              >
                <div>
                  <p className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display transition-transform group-hover:scale-105 duration-200 ${
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  }`}>
                    {doctorCount === 4000 ? "4k+" : `${(doctorCount / 1000).toFixed(1)}k+`}
                  </p>
                  <p className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider mt-0.5 ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}>Verified Doctors</p>
                </div>
                <div className="pt-2.5 opacity-0 group-hover:opacity-100 transition-all duration-250 transform translate-y-1 group-hover:translate-y-0">
                  <span className="text-[9px] bg-blue-600 text-white px-2.5 py-1 rounded-lg font-bold inline-flex items-center gap-1 shadow-sm">
                    View Team <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>

              <div 
                className={`space-y-1 p-4 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 group relative cursor-pointer flex flex-col justify-between border ${
                  isDarkMode 
                    ? "bg-slate-900 hover:bg-slate-850/60 border-slate-800 hover:border-blue-900/50" 
                    : "bg-slate-50 hover:bg-blue-50/30 border-slate-150 hover:border-blue-300"
                }`}
                onClick={() => {
                  setAppointmentForm(prev => ({ ...prev, location: "New York City, NY" }));
                  const el = document.getElementById("appointment");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                  triggerToast("Scheduling portal set to NYC main clinic facility!");
                }}
              >
                <div>
                  <p className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display transition-transform group-hover:scale-105 duration-200 ${
                    isDarkMode ? "text-slate-100" : "text-slate-900"
                  }`}>
                    {clinicCount}+
                  </p>
                  <p className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider mt-0.5 ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}>Partner Clinics</p>
                </div>
                <div className="pt-2.5 opacity-0 group-hover:opacity-100 transition-all duration-250 transform translate-y-1 group-hover:translate-y-0">
                  <span className={`text-[9px] px-2.5 py-1 rounded-lg font-bold inline-flex items-center gap-1 shadow-sm ${
                    isDarkMode ? "bg-slate-800 text-slate-200" : "bg-slate-800 text-white"
                  }`}>
                    Locations <MapPin className="w-2.5 h-2.5 text-blue-400" />
                  </span>
                </div>
              </div>

              <div 
                className={`space-y-1 p-4 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 group relative cursor-pointer flex flex-col justify-between border ${
                  isDarkMode 
                    ? "bg-slate-900 hover:bg-slate-850/60 border-slate-800 hover:border-blue-900/50" 
                    : "bg-slate-50 hover:bg-blue-50/30 border-slate-150 hover:border-blue-300"
                }`}
                onClick={() => {
                  setIsSearchOpen(true);
                  triggerToast("Specialties finder is energized.");
                }}
              >
                <div>
                  <p className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display transition-transform group-hover:scale-105 duration-200 ${
                    isDarkMode ? "text-slate-100" : "text-slate-900"
                  }`}>
                    {specialtyCount}+
                  </p>
                  <p className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider mt-0.5 ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}>Specialties</p>
                </div>
                <div className="pt-2.5 opacity-0 group-hover:opacity-100 transition-all duration-250 transform translate-y-1 group-hover:translate-y-0">
                  <span className={`text-[9px] px-2.5 py-1 rounded-lg font-bold inline-flex items-center gap-1 shadow-sm ${
                    isDarkMode ? "bg-slate-800 text-slate-200" : "bg-slate-800 text-white"
                  }`}>
                    Search List <Search className="w-2.5 h-2.5 text-blue-400" />
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>


      {/* EXPERT HEALTHCARE, RIGHT AT YOUR DOORSTEP */}
      <section id="about" className="py-16 lg:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Texts Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                <span>Flexible Care</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight leading-tight">
                Expert Healthcare, Right at Your Doorstep
              </h2>

              <p className="text-slate-600 leading-relaxed font-light">
                Experience elite world-class medical assistance without the administrative wait. Our responsive platform integrates high-tier healthcare professionals directly with families, enabling fast, reliable, and personalized medical solutions whenever and wherever you need them most.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div 
                  className="bg-white p-5 rounded-2xl border border-slate-150/80 flex flex-col justify-between hover:border-emerald-350 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 group cursor-pointer"
                  onClick={() => {
                    setSelectedSafetyFeature({
                      title: "Certified Safety Matrix",
                      desc: "Vetted board-certified specialists with automated regulatory templates.",
                      detail: "Cooper University Hospital operates a strict triple-vetting protocol for medical specialists. Every practitioner holds valid licensing, undergoes quarterly peer review audits, and demonstrates state safety standard guidelines."
                    });
                    triggerToast("Opening Safety Assurance dossier.");
                  }}
                >
                  <div className="flex gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 h-10 w-10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-850">Certified Safe</h4>
                      <p className="text-xs text-slate-500 mt-1">Vetted board-certified specialists with solid experience templates.</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 hover:underline">
                      Verify Checklist <ArrowRight className="w-3 h-3" />
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">CODE: COOP-E9</span>
                  </div>
                </div>

                <div 
                  className="bg-white p-5 rounded-2xl border border-slate-150/80 flex flex-col justify-between hover:border-blue-350 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 group cursor-pointer"
                  onClick={() => {
                    setSelectedSafetyFeature({
                      title: "Direct Real-time Response",
                      desc: "Immediate chat, priority triage scheduling, and telemetry triggers.",
                      detail: "Our network connects patient consultation desks instantly. If you book or trigger an update, your doctor receives an automated notification ping on their medical terminal, ensuring feedback loops happen in < 15 minutes."
                    });
                    triggerToast("Testing response latency template...");
                  }}
                >
                  <div className="flex gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 h-10 w-10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-850">Direct Response</h4>
                      <p className="text-xs text-slate-500 mt-1">Real-time chat, dispatch solutions, and instant notifications.</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[11px] text-blue-700 font-bold flex items-center gap-1 hover:underline">
                      Simulate Response Ping <ArrowRight className="w-3 h-3" />
                    </span>
                    <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded">
                      ● ONLINE
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <a
                  href="#appointment"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl shadow-md shadow-blue-100 transition-colors flex items-center gap-2 text-sm"
                >
                  <span>Book Consultation</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <span className="text-sm text-slate-500 font-semibold bg-white px-4 py-3 rounded-xl border border-slate-150">
                  Starting at <span className="text-blue-600 font-bold">$50/week</span>
                </span>
              </div>

            </div>

            {/* Right overlapping visual tiles representing the image layouts */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-12 gap-4 items-center">
                
                {/* Visual Left Smaller Block */}
                <div className="col-span-4 space-y-4">
                  <div className="rounded-2xl overflow-hidden shadow-md aspect-[3/4] bg-slate-200 relative group cursor-pointer">
                    <img
                      referrerPolicy="no-referrer"
                      src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=260"
                      alt="Doctor assessing patient"
                      className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2 text-center backdrop-blur-[2px]">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCertification({
                            title: "Diagnostic Facility Assurance",
                            body: "This image highlights Dr. Clara Winters coordinating real-time patient heart-rate telemetry logs using certified diagnostics equipment.",
                            code: "CERT-DIAG-882"
                          });
                        }}
                        className="bg-white/95 hover:bg-blue-600 hover:text-white text-[10px] text-slate-800 font-bold px-3 py-1.5 rounded-xl transition-all shadow-md transform translate-y-2 group-hover:translate-y-0"
                      >
                        🔍 Examine Clinic
                      </button>
                    </div>
                  </div>
                  <div 
                    className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-2xl shadow-md text-center space-y-1 cursor-pointer hover:shadow-lg transition-all group"
                    onClick={() => triggerToast("Vital support templates are synchronized.")}
                  >
                    <Activity className="w-6 h-6 mx-auto animate-pulse group-hover:scale-110 transition-transform" />
                    <p className="text-xs uppercase font-extrabold tracking-widest">Health First</p>
                    <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full inline-block font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Click Support
                    </span>
                  </div>
                </div>

                {/* Central Primary Large Block */}
                <div className="col-span-5">
                  <div className="rounded-[30px] overflow-hidden border-4 border-white shadow-xl aspect-[1/1.3] bg-slate-200 relative group cursor-pointer">
                    <img
                      referrerPolicy="no-referrer"
                      src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=350"
                      alt="Geriatric medical consultation"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 backdrop-blur-[1px]">
                      <div className="space-y-2 text-left">
                        <p className="text-white font-bold text-xs">Palliative Geriatric Care</p>
                        <p className="text-[10px] text-slate-200 leading-tight">Board certified specialists delivering home assistance protocols.</p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCertification({
                              title: "Geriatric Comfort Vetting",
                              body: "Our certified geriatrics department excels in daily living companion templates, managing non-pharmacological comfort standards safely.",
                              code: "GOV-GER-56"
                            });
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-2 rounded-lg transition-colors"
                        >
                          📋 Explore Care Program
                        </button>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-semibold backdrop-blur-md bg-white/10 p-2.5 rounded-xl border border-white/20 group-hover:opacity-0 transition-opacity">
                      🏡 Personal Care Plan
                    </div>
                  </div>
                </div>

                {/* Visual Right Block */}
                <div className="col-span-3 space-y-4">
                  <div className="rounded-2xl overflow-hidden shadow-md aspect-[4/5] bg-slate-200 relative group cursor-pointer">
                    <img
                      referrerPolicy="no-referrer"
                      src="https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=200"
                      alt="Care support"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-1 text-center backdrop-blur-[1px]">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCertification({
                            title: "Support Desk Protocol",
                            body: "All nurses and care coordinators complete 120 hours of specialty hospice comfort and responsive clinical communications.",
                            code: "CERT-SUPP-98"
                          });
                        }}
                        className="bg-white text-[9px] hover:bg-blue-600 hover:text-white text-slate-900 font-bold px-2.5 py-1 rounded-lg transition-all"
                      >
                        🔬 View Detail
                      </button>
                    </div>
                  </div>
                  <div 
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-xl shadow-md text-center cursor-pointer hover:shadow-lg transition-all group"
                    onClick={() => {
                      triggerToast("Connecting to live dispatcher desk...");
                      setIsAppointmentsDrawerOpen(true);
                    }}
                  >
                    <p className="text-xs font-bold leading-tight">24/7 Desk</p>
                    <span className="text-[9px] text-blue-100 bg-blue-500/50 mt-1 py-0.5 px-1 rounded block font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Open Drawer ⚡
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>


      {/* SUPPORTING YOUR HEALTH AT EVERY STAGE OF LIFE */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Laboratory Lab Tech View */}
            <div className="lg:col-span-5 order-last lg:order-first">
              <div className="relative rounded-3xl p-4 bg-slate-100 shadow-xl border border-slate-200 overflow-hidden aspect-[4/3] sm:aspect-[1.5]">
                <img
                  referrerPolicy="no-referrer"
                  src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=600"
                  alt="Laboratory facility checking diagnostics"
                  className="w-full h-full object-cover rounded-2xl hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute top-6 right-6 bg-blue-600 text-white px-3.5 py-1.5 rounded-xl text-[11px] font-bold tracking-widest uppercase shadow-sm">
                  🔬 High-Tech Labs
                </div>
              </div>
            </div>

            {/* Right Stages list */}
            <div className="lg:col-span-7 space-y-8">
              
              <div className="space-y-4">
                <span className="text-xs tracking-wider font-extrabold uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  About Us & Core Philosophy
                </span>
                
                <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight leading-tight">
                  Supporting Your Health At Every Stage Of Life
                </h2>
                
                <p className="text-slate-600 font-light leading-relaxed">
                  Every patient has unique medical templates. We integrate dynamic diagnostics and digital scheduling systems to manage recovery pathways flawlessly.
                </p>
              </div>

              {/* Feature Points corresponding to the icons shown in image */}
              <div className="space-y-4">
                
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/20 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl hover:-translate-y-1.5 hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 cursor-pointer">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600 shrink-0">
                    <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">100% Secure & Confidential</h4>
                    <p className="text-sm text-slate-500 mt-1">Our digital databases are encrypted to meet global state parameters securely.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/20 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl hover:-translate-y-1.5 hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 cursor-pointer">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600 shrink-0">
                    <Award className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">Award-winning Healthcare</h4>
                    <p className="text-sm text-slate-500 mt-1">Acknowledged continuously for safety excellence, surgical execution, and patient empathy indicators.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/20 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl hover:-translate-y-1.5 hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 cursor-pointer">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600 shrink-0">
                    <Users className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">24/7 Expert Support</h4>
                    <p className="text-sm text-slate-500 mt-1">Our customer and primary nursing triage desk is open around the clock for direct support.</p>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* MEET OUR CERTIFIED AND EXPERT DOCTORS */}
      <section id="services" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50/70 px-3 py-1 rounded-full">
                Expert Team
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
                Meet Our Certified and Expert Doctors
              </h2>
              <p className="text-slate-500 text-sm max-w-xl">
                Certified doctors delivering compassionate, premium care across multiple healthcare disciplines for everyone.
              </p>
            </div>
            
            <a
              href="#appointment"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-3.5 rounded-xl shadow-md shadow-blue-50 hover:scale-102 transition-all shrink-0"
            >
              Start Consultation
            </a>
          </div>

          {/* Horizontally scrolling complete left to right listing all doctors with all details */}
          <div className="relative group/carousel px-1">
            {/* Left Scroll Button */}
            <button
              onClick={() => handleDoctorsScroll("left")}
              className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white hover:bg-blue-600 text-slate-700 hover:text-white rounded-full border border-slate-200 hover:border-transparent hover:scale-110 shadow-lg active:scale-95 transition-all opacity-0 group-hover/carousel:opacity-100 hover:shadow-blue-200 focus:opacity-100 duration-200 cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Right Scroll Button */}
            <button
              onClick={() => handleDoctorsScroll("right")}
              className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white hover:bg-blue-600 text-slate-700 hover:text-white rounded-full border border-slate-200 hover:border-transparent hover:scale-110 shadow-lg active:scale-95 transition-all opacity-0 group-hover/carousel:opacity-100 hover:shadow-blue-200 focus:opacity-100 duration-200 cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Scroll Container */}
            <div
              ref={doctorsScrollRef}
              onMouseEnter={() => setIsDoctorsHovered(true)}
              onMouseLeave={() => setIsDoctorsHovered(false)}
              onTouchStart={() => setIsDoctorsHovered(true)}
              onTouchEnd={() => setIsDoctorsHovered(false)}
              className={`flex gap-6 overflow-x-auto pb-8 pt-4 scrollbar-none ${isDoctorsHovered ? "snap-x snap-mandatory scroll-smooth" : ""}`}
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch"
              }}
            >
              {(() => {
                const triplicatedDoctors = [...DOCTORS, ...DOCTORS, ...DOCTORS];
                return triplicatedDoctors.map((doc, idx) => (
                  <motion.div
                    key={`${doc.id}-${idx}`}
                    whileHover={{ y: -12, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className={`min-w-[280px] sm:min-w-[320px] max-w-[350px] flex-shrink-0 ${isDoctorsHovered ? "snap-start" : ""} rounded-[24px] border p-5 transition-all duration-300 text-center flex flex-col justify-between ${doc.featuredColor} shadow-sm hover:shadow-2xl hover:border-blue-300 relative`}
                  >
                  <div>
                    {/* Doctor avatar wrapped elegantly in layout matching image */}
                    <div className="relative mx-auto w-36 h-36 rounded-2xl overflow-hidden bg-slate-200 border-2 border-white mb-4 shadow-sm group/avatar">
                      <img
                        referrerPolicy="no-referrer"
                        src={doc.avatar}
                        alt={doc.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/avatar:scale-105"
                      />
                      {/* Hover Favorite Heart trigger */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const isFav = favorites.includes(doc.id);
                          if (isFav) {
                            setFavorites(favorites.filter(id => id !== doc.id));
                            triggerToast(`Removed Dr. ${doc.name.split(' ').pop()} from favorites.`);
                          } else {
                            setFavorites([...favorites, doc.id]);
                            triggerToast(`Added Dr. ${doc.name.split(' ').pop()} to favorites! 💖`);
                          }
                        }}
                        className={`absolute top-2 right-2 p-1.5 rounded-xl backdrop-blur-md transition-all shadow-sm cursor-pointer ${
                          favorites.includes(doc.id) 
                            ? 'bg-rose-500 text-white' 
                            : 'bg-white/80 hover:bg-white text-slate-400 hover:text-rose-500 hover:scale-105'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>

                    <h3 className="font-bold text-slate-900 text-lg hover:text-blue-600 transition-colors">
                      {doc.name}
                    </h3>
                    
                    <p className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mt-0.5">
                      {doc.role}
                    </p>

                    <p className="text-xs text-slate-500 mt-3 line-clamp-2 px-1">
                      "{doc.tagline}"
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-200/50 flex flex-col gap-2.5">
                    {/* Social Buttons */}
                    <div className="flex justify-center gap-3">
                      {doc.social.facebook && (
                        <a href={doc.social.facebook} className="p-2 bg-white text-blue-600 hover:text-white hover:bg-blue-600 rounded-full border border-slate-100 shadow-sm transition-all" target="_blank" rel="noreferrer">
                          <Facebook className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {doc.social.twitter && (
                        <a href={doc.social.twitter} className="p-2 bg-white text-indigo-500 hover:text-white hover:bg-indigo-500 rounded-full border border-slate-100 shadow-sm transition-all" target="_blank" rel="noreferrer">
                          <Twitter className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {doc.social.youtube && (
                        <a href={doc.social.youtube} className="p-2 bg-white text-red-500 hover:text-white hover:bg-red-500 rounded-full border border-slate-100 shadow-sm transition-all" target="_blank" rel="noreferrer">
                          <Youtube className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {doc.social.linkedin && (
                        <a href={doc.social.linkedin} className="p-2 bg-white text-blue-800 hover:text-white hover:bg-blue-800 rounded-full border border-slate-100 shadow-sm transition-all" target="_blank" rel="noreferrer">
                          <Linkedin className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Booking Link Action */}
                    <button
                      onClick={() => selectDoctorForBooking(doc)}
                      className="w-full text-center block bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-3 rounded-xl hover:scale-103 active:scale-[0.97] transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-blue-200 cursor-pointer"
                    >
                      Set Appointment
                    </button>

                    <button
                      onClick={() => {
                        setActiveDirectChatDoctor(doc);
                        setChatMessages([
                          { sender: "doctor" as const, text: `Hello! I am Dr. ${doc.name.split(' ').pop()}. How can I assist with your specialty indicators or recent medical telemetry details today?`, time: "Just now" }
                        ]);
                        triggerToast(`Connected with Dr. ${doc.name.split(' ').pop()}!`);
                      }}
                      className="w-full text-center block bg-white hover:bg-blue-50/40 text-slate-700 hover:text-blue-600 text-xs font-semibold py-2.5 rounded-xl border border-slate-200 transition-all duration-300 flex items-center justify-center gap-1.5 hover:border-blue-300 hover:scale-103 active:scale-[0.97] cursor-pointer"
                    >
                      <MessageSquareText className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform" />
                      <span>Quick Consultation</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveVerificationDoctor(doc);
                      }}
                      className="text-[10px] uppercase font-bold text-slate-400 hover:text-blue-600 hover:underline p-1.5 hover:bg-slate-50 rounded-lg transition-all duration-300 inline-block mt-1 tracking-wider cursor-pointer"
                    >
                      🛡️ Verify Registry Credentials
                    </button>

                    <button
                      onClick={() => setSelectedDoctor(doc)}
                      className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 hover:underline p-1 hover:bg-blue-50/30 rounded-lg transition-all duration-300 inline-block mt-1 cursor-pointer"
                    >
                      View Biography & Details
                    </button>
                  </div>
                </motion.div>
              ));
              })()}
            </div>
          </div>

        </div>
      </section>

      {/* DOCTOR BIO DETAIL MODAL OVERLAY */}
      <AnimatePresence>
        {selectedDoctor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="font-semibold text-slate-800">Specialist Professional Biography</span>
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex gap-4 items-start pb-4 border-b border-slate-100">
                  <img referrerPolicy="no-referrer" src={selectedDoctor.avatar} alt={selectedDoctor.name} className="w-20 h-20 rounded-xl object-cover border border-slate-200 bg-slate-100 shadow-sm" />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedDoctor.name}</h3>
                    <p className="text-sm font-semibold text-blue-600">{selectedDoctor.role}</p>
                    <p className="text-xs text-slate-500 mt-1">Cooper University Hospital - Senior Staff</p>
                  </div>
                </div>

                <div className="space-y-2 text-slate-600 text-sm leading-relaxed">
                  <p className="font-medium text-slate-800">Background & Specialties:</p>
                  <p>
                    {selectedDoctor.name} hosts over 12 years of clinical research experience in advanced hospital layouts. Having graduated from top medical training institutions, they lead standard patient safety boards and assist in collaborative medicine setups.
                  </p>
                  <p className="bg-blue-50/50 p-3 rounded-lg text-xs border border-blue-105 text-slate-600 italic">
                    "{selectedDoctor.tagline}"
                  </p>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => {
                      selectDoctorForBooking(selectedDoctor);
                      setSelectedDoctor(null);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl text-xs text-center inline-block shadow-md transition-colors"
                  >
                    Schedule Consultation
                  </button>
                  <button
                    onClick={() => setSelectedDoctor(null)}
                    className="flex-1 bg-slate-105 bg-slate-100 text-slate-700 hover:bg-slate-150 py-3 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Close Profile
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* EXPLORE OUR LATEST HEALTH INSIGHTS */}
      <section id="insights" className="py-16 lg:py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wide text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                Resources & News
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
                Explore Our Latest Health Insights
              </h2>
              <p className="text-slate-500 text-sm">
                Actionable guidelines, health research, and stories provided by our certified medical staff.
              </p>
            </div>

            <button
              onClick={() => {
                setActiveBlogCategory("All");
                triggerToast("Showing all blog resource nodes.");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <span>View All Blog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Categories Horizontal list filter */}
          <div className="flex flex-wrap gap-2 mb-8 pb-2 overflow-x-auto">
            {blogCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveBlogCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap shrink-0 border ${
                  activeBlogCategory === cat
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Blogs Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredBlogs.map((post) => (
                <motion.article
                  key={post.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -12, scale: 1.02 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 22 }}
                  className="bg-white rounded-[24px] overflow-hidden border border-slate-150 shadow-sm hover:shadow-2xl hover:border-blue-300 transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    {/* Cover image styling from mock pictures */}
                    <div className="relative aspect-[16/10] bg-slate-200 overflow-hidden">
                      <img
                        referrerPolicy="no-referrer"
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                      />
                      <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        {post.category}
                      </span>
                      {/* Hover Bookmark button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const isBookmarked = bookmarks.includes(post.id);
                          if (isBookmarked) {
                            setBookmarks(bookmarks.filter(id => id !== post.id));
                            triggerToast(`Removed bookmark for "${post.title}".`);
                          } else {
                            setBookmarks([...bookmarks, post.id]);
                            triggerToast(`Saved "${post.title}" to your health bookmarks list! 🔖`);
                          }
                        }}
                        className={`absolute top-4 right-4 p-1.5 rounded-xl backdrop-blur-md transition-all shadow-sm ${
                          bookmarks.includes(post.id)
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/80 hover:bg-white text-slate-500 hover:text-blue-600 hover:scale-110'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readTime}
                        </span>
                        <span>•</span>
                        <span>{post.date}</span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>

                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                        {post.summary}
                      </p>
                    </div>

                  </div>

                  <div className="p-6 pt-0 flex flex-col gap-2.5">
                    <button
                      onClick={() => triggerToast(`Insight node "${post.title}" is simulated. Full integration available in premium accounts.`)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group/btn w-fit"
                    >
                      <span>Read manual</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedBlogForSummary(post);
                        triggerToast(`Synthesizing medical abstract for "${post.title}"...`);
                      }}
                      className="w-full text-center block bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold py-2.5 rounded-xl border border-slate-150 group-hover:border-blue-300 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Summarize Abstract</span>
                    </button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>

            {filteredBlogs.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-400 bg-white rounded-3xl border border-slate-200">
                <BookOpen className="w-12 h-12 mx-auto text-slate-200 mb-2" />
                <p className="font-semibold text-sm text-slate-700">No Articles Listed</p>
                <p className="text-xs text-slate-400 mt-1">There are no insights mapped under "{activeBlogCategory}" currently.</p>
                <button
                  onClick={() => setActiveBlogCategory("All")}
                  className="mt-3 text-xs text-blue-600 underline font-semibold"
                >
                  View All Categories
                </button>
              </div>
            )}
          </div>

        </div>
      </section>


      {/* SECURE AN APPOINTMENT FORM - MANDATORY FROM IMAGES */}
      <section id="appointment" className="py-16 lg:py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Layout matches deep visual block in images */}
          <div className="rounded-[40px] overflow-hidden shadow-2xl border border-slate-105 flex flex-col lg:flex-row">
            
            {/* Left Box (Teal colored panel matching description) */}
            <div className="bg-[#0b7a99] text-white p-8 sm:p-12 lg:w-[40%] flex flex-col justify-between space-y-12">
              <div className="space-y-6">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-white/10 px-3 py-1 rounded border border-white/10 inline-block">
                  Office Desk details
                </span>
                <h3 className="text-3xl font-extrabold font-display leading-tight">
                  Secure an Appointment
                </h3>
                <p className="text-slate-100 text-sm leading-relaxed font-light opacity-90">
                  We will get back to you soon. Book professional care within minutes and receive a secure confirmation code.
                </p>
              </div>

              <div className="space-y-6 text-sm">
                
                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-white/10 rounded-lg text-white">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Office Schedule</p>
                    <p className="text-slate-100 text-xs opacity-85 mt-0.5">Mon - Fri, 9:00 am to 6:00 pm</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-white/10 rounded-lg text-white">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Emergency Dispatch Phone</p>
                    <p className="text-slate-100 text-xs opacity-85 mt-0.5">+1 800 123 4567</p>
                  </div>
                </div>

              </div>

              <div className="pt-6 border-t border-white/10 text-[11px] text-slate-100/70">
                <span>* Direct referrals from insurance clients accepted dynamically.</span>
              </div>
            </div>

            {/* Right Interactive Form Box */}
            <div className="bg-slate-50 p-8 sm:p-12 lg:w-[60%] space-y-6">
              
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-xs uppercase font-extrabold text-slate-400">Scheduling Portal</span>
                <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  Live Booking
                </span>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-5">
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Specialty Dropdown */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Specialty Desk</label>
                    <select
                      value={appointmentForm.specialty}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, specialty: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
                    >
                      {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Location Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Location/Facility</label>
                    <select
                      value={appointmentForm.location}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, location: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
                    >
                      {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Care Service Type */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Preference Type</label>
                    <select
                      value={appointmentForm.serviceType}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, serviceType: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
                    >
                      {SERVICE_TYPES.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>

                  {/* Availability Date */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Availability Date *</label>
                    <input
                      type="date"
                      required
                      min="2026-06-15"
                      value={appointmentForm.availabilityDate}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, availabilityDate: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
                    />
                  </div>
                </div>

                {/* Patient Name input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter patient full name..."
                    value={appointmentForm.patientName}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, patientName: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
                  />
                </div>

                {/* Patient Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Contact Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="This keeps records in your current session hub..."
                    value={appointmentForm.patientEmail}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, patientEmail: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
                  />
                </div>

                {/* Textarea details */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Additional Details / Medical Context</label>
                  <textarea
                    rows={2}
                    placeholder="Let our triage desk prepare ahead (any symptoms, recurring medicines, allergy history...)"
                    value={appointmentForm.serviceDetail}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, serviceDetail: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-100 hover:shadow-xl transition-all hover:scale-[1.01] text-sm"
                  >
                    Confirm Appointment Schedule
                  </button>
                </div>

              </form>

            </div>

          </div>

        </div>
      </section>


      {/* WHAT OUR CLIENTS SAY ABOUT US (TESTIMONIALS SLIDER) */}
      <section className="py-16 lg:py-24 bg-slate-50 border-t border-slate-100 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wide text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                Testimonials
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
                What Our Clients Say About Us
              </h2>
            </div>

            {/* Overlapping small visual indicator */}
            <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-sm shrink-0">
              <div className="flex -space-x-2">
                <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=60" className="w-7 h-7 rounded-full object-cover border border-white" alt="Avatar small" />
                <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=60" className="w-7 h-7 rounded-full object-cover border border-white" alt="Avatar small" />
              </div>
              <span className="text-xs text-slate-500 font-bold">More than 700+ reviews</span>
            </div>
            
          </div>

          {/* Testimonial slider layout mirroring pictures carefully */}
          <div 
            onMouseEnter={() => setIsTestimonialHovered(true)}
            onMouseLeave={() => setIsTestimonialHovered(false)}
            className="bg-white rounded-[32px] border border-slate-150 p-6 sm:p-12 shadow-sm relative"
          >
            
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-12 gap-8 items-center"
              >
                
                {/* Image panel left side of block */}
                <div className="md:col-span-4 justify-self-center">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-[24px] overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
                    <img
                      referrerPolicy="no-referrer"
                      src={TESTIMONIALS[testimonialIndex].image}
                      alt={TESTIMONIALS[testimonialIndex].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Quote content left */}
                <div className="md:col-span-8 space-y-6 text-center md:text-left">
                  
                  {/* Decorative Quote Icon */}
                  <span className="text-blue-600 block text-5xl font-serif leading-none select-none opacity-50 font-black">
                    “
                  </span>

                  <p className="text-lg sm:text-xl text-slate-700 italic font-light leading-relaxed">
                    {TESTIMONIALS[testimonialIndex].quote}
                  </p>

                  <div className="pt-2 border-t border-slate-100">
                    <h4 className="text-lg font-bold text-slate-900 leading-tight">
                      {TESTIMONIALS[testimonialIndex].name}
                    </h4>
                    <span className="text-xs font-semibold text-blue-600 tracking-wider uppercase block mt-1">
                      {TESTIMONIALS[testimonialIndex].role}
                    </span>
                  </div>

                </div>

              </motion.div>
            </AnimatePresence>

            {/* Slider Switchers */}
            <div className="absolute bottom-6 right-6 sm:bottom-12 sm:right-12 flex gap-2">
              <button
                onClick={() => {
                  setTestimonialIndex(prev => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
                  triggerToast("Swapped to previous customer testimonial.", "info");
                }}
                className="p-2 bg-slate-50 hover:bg-blue-600 text-slate-600 hover:text-white rounded-full border border-slate-200 transition-colors"
                title="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setTestimonialIndex(prev => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
                  triggerToast("Swapped to next customer testimonial.", "info");
                }}
                className="p-2 bg-slate-50 hover:bg-blue-600 text-slate-600 hover:text-white rounded-full border border-slate-200 transition-colors"
                title="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>

        </div>
      </section>


      {/* MID-PROMOTION WIDGET BANNER */}
      <section className="bg-slate-900 py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/45 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-2">
            <h4 className="text-blue-500 font-bold uppercase tracking-wider text-xs">Medlife Solutions & Logistics</h4>
            <p className="text-xl sm:text-2xl font-bold font-display text-white max-w-2xl leading-snug">
              Medlife offers healthcare solutions, medicines, diagnostics, and wellness products for better health
            </p>
          </div>

          <a
            href="#appointment"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl shrink-0 transition-colors shadow-lg"
          >
            Submit Now
          </a>
        </div>
      </section>


      {/* FOOTER SECTION: REQUESTED REQUIREMENTS
          - Newsletter signup
          - Social media icons
          - Clear site map
          - Designed and Developed by Autofyai for seamless user navigation and a professional brand aesthetic
      */}
      <footer className="bg-slate-950 text-white pt-16 pb-8 border-t border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-white/5">
            
            {/* Column 1: Info and newsletter */}
            <div className="md:col-span-4 space-y-6">
              
              <div className="flex items-center gap-1">
                <CooperLogo className="h-9 w-auto" lightText={true} />
              </div>

              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Medlife is a trusted medical assistance provider offering continuous board-certified care, advanced diagnostics, and customized treatment configurations.
              </p>

              {/* Newsletter signup request from prompt */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-205 uppercase tracking-wider text-slate-300">Subscribe for Health Tips and Updates</p>
                {isSubscribed ? (
                  <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 p-2.5 rounded-lg text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Thank you! Subscribed to digital bulletins.</span>
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                      <input
                        type="email"
                        required
                        placeholder="Your Email address"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500"
                        id="newsletter-email"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
                      id="newsletter-submit-btn"
                    >
                      Join
                    </button>
                  </form>
                )}
                <span className="block text-[10px] text-slate-500 font-medium">Unsubscribe at any time. We respect strict data guidelines.</span>
              </div>

              {/* Social media icons request from prompt */}
              <div className="space-y-2">
                <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold">Connect With Us</span>
                <div className="flex gap-3">
                  {[
                    { icon: <Facebook className="w-4 h-4" />, link: "https://facebook.com", label: "Facebook" },
                    { icon: <Twitter className="w-4 h-4" />, link: "https://twitter.com", label: "Twitter" },
                    { icon: <Youtube className="w-4 h-4" />, link: "https://youtube.com", label: "YouTube" },
                    { icon: <Linkedin className="w-4 h-4" />, link: "https://linkedin.com", label: "LinkedIn" }
                  ].map((soc, idx) => (
                    <a
                      key={idx}
                      href={soc.link}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-slate-900 hover:bg-blue-600 text-slate-450 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-all shadow-sm flex items-center justify-center"
                      title={soc.label}
                    >
                      {soc.icon}
                    </a>
                  ))}
                </div>
              </div>

            </div>

            {/* Column 2: Site map - Quick links */}
            <div className="md:col-span-2 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#0b7a99]">Quick Links</h4>
              <nav className="flex flex-col gap-2.5 text-xs text-slate-400">
                <a href="#home" className="hover:text-blue-500 transition-colors">Home Dashboard</a>
                <a href="#about" className="hover:text-blue-500 transition-colors">About Cooper</a>
                <a href="#services" className="hover:text-blue-500 transition-colors">Specialties & Care</a>
                <a href="#doctors" className="hover:text-blue-500 transition-colors">Meet Surgeons</a>
                <a href="#insights" className="hover:text-blue-500 transition-colors">Resource Center</a>
                <a href="#appointment" className="hover:text-blue-500 transition-colors">Booking Desk</a>
                <span onClick={() => triggerToast("Careers portal coming soon.")} className="hover:text-blue-500 cursor-pointer transition-colors">Become A Nurse</span>
              </nav>
            </div>

            {/* Column 3: Site map - Schedule hours */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#0b7a99]">Schedule Info</h4>
              <div className="space-y-3 text-xs text-slate-400 font-light">
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span>Mon - Thu:</span>
                  <span className="font-semibold text-white">08:00 - 05:00</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span>Saturday:</span>
                  <span className="font-semibold text-white">09:00 - 07:00</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span>Sunday:</span>
                  <span className="text-red-400 font-bold uppercase text-[9px]">Off Day / Closed</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  * Emergency trauma ward is open twenty-four hours on a self-referral basis.
                </p>
              </div>
            </div>

            {/* Column 4: Contact/Get Started */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#0b7a99]">Get Started</h4>
              
              <div className="space-y-4">
                
                <div className="flex gap-3 items-start p-2 rounded bg-slate-900/60 border border-slate-900">
                  <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-[11px] font-bold text-white leading-none mb-1">Corporate Main Unit</h5>
                    <p className="text-[10px] text-slate-400">149 Health Avenue, New York, NY 11001, USA</p>
                    <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="text-[9px] text-blue-500 underline inline-block mt-1">Get Directions</a>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-2 rounded bg-slate-900/60 border border-slate-900">
                  <Phone className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-[11px] font-bold text-white leading-none mb-1">Direct Helpdesk</h5>
                    <p className="text-[11px] text-neutral-300 font-semibold">(902) 123-1478</p>
                    <p className="text-[9px] text-slate-500">Toll-Free USA/Canada</p>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Under footer section: Brand attribution statement, copyright and Autofyai developer tags */}
          <div className="pt-8 border-t border-white/5 flex flex-col items-center justify-center text-center gap-6 relative w-full">
            <p className="text-lg md:text-xl font-bold tracking-wide text-white block w-full text-center">
              Copyright © 2026 Medolia Healthcare. All Rights Reserved.
            </p>
            
            {/* Highly clickable and gorgeous Designed & Developed by Autofyai badge leading to WhatsApp */}
            <div className="flex flex-col items-center justify-center gap-2">
              <a 
                href={`https://wa.me/919392472134?text=${encodeURIComponent(
                  "Hi Autofy.ai Team! 👋\nI came across your work and loved it. I'd like to know more about your services, pricing, and how you can help my business grow. Looking forward to connecting!"
                )}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm md:text-base text-slate-300 hover:text-emerald-400 font-semibold transition-all duration-300 flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 border-2 border-slate-800 hover:border-emerald-500 rounded-2xl group cursor-pointer shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 active:translate-y-0 text-center"
                title="Contact Autofyai on WhatsApp: 9392472134"
              >
                <span>Designed and Developed by</span>
                <span className="text-white group-hover:text-emerald-400 font-black underline decoration-emerald-500 hover:decoration-emerald-400 decoration-3 underline-offset-4 tracking-wider transition-colors ml-1 uppercase">
                  Autofyai
                </span>
              </a>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Click on Autofyai to open WhatsApp</span>
            </div>
          </div>

        </div>
      </footer>

      {/* DIRECT SAFETY FEATURE MODAL OVERLAY */}
      <AnimatePresence>
        {selectedSafetyFeature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 text-left"
            onClick={() => setSelectedSafetyFeature(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>{selectedSafetyFeature.title}</span>
                </span>
                <button
                  onClick={() => setSelectedSafetyFeature(null)}
                  className="p-1 rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-700 font-semibold leading-relaxed">
                  {selectedSafetyFeature.desc}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-light">
                  {selectedSafetyFeature.detail}
                </p>
                
                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedSafetyFeature(null);
                      setIsAppointmentsDrawerOpen(true);
                      triggerToast("Booking portal ready. Fill in your preferred practitioner details.");
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs text-center shadow-lg transition-colors cursor-pointer"
                  >
                    Schedule Vetted Specialist
                  </button>
                  <button
                    onClick={() => setSelectedSafetyFeature(null)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-3 rounded-xl text-xs transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CERTIFICATION SPECIFICATION DETAILS MODAL */}
      <AnimatePresence>
        {selectedCertification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 text-left"
            onClick={() => setSelectedCertification(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span>{selectedCertification.title}</span>
                </span>
                <button
                  onClick={() => setSelectedCertification(null)}
                  className="p-1 rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed font-light">
                  {selectedCertification.body}
                </p>
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 text-xs flex justify-between items-center text-slate-600">
                  <span className="font-semibold">Vetting Code Reference:</span>
                  <span className="font-mono bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md font-bold text-[10px]">{selectedCertification.code}</span>
                </div>
                
                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedCertification(null);
                      triggerToast("Dossier data verification confirmed automatically.");
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs shadow-lg transition-colors"
                  >
                    Acknowledge Verification
                  </button>
                  <button
                    onClick={() => setSelectedCertification(null)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-3 rounded-xl text-xs transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEALTH INSIGHTS SUMMARY MODAL */}
      <AnimatePresence>
        {selectedBlogForSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 text-left"
            onClick={() => setSelectedBlogForSummary(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span>Synthesized Insight Abstract</span>
                </span>
                <button
                  onClick={() => setSelectedBlogForSummary(null)}
                  className="p-1 rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex gap-3 pb-4 border-b border-slate-100">
                  <img referrerPolicy="no-referrer" src={selectedBlogForSummary.image} alt={selectedBlogForSummary.title} className="w-20 h-14 rounded-lg object-cover bg-slate-100" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{selectedBlogForSummary.title}</h4>
                    <p className="text-xs text-blue-600 font-medium mt-0.5">{selectedBlogForSummary.category} • {selectedBlogForSummary.readTime}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded uppercase tracking-wider">AI Executive Abstract</span>
                  <p className="text-xs text-slate-600 leading-relaxed font-light">
                    The detailed guidelines on <strong className="text-slate-800">"{selectedBlogForSummary.title}"</strong> outline high-level strategic methodologies for clinical geriatric assistance. Under strict Cooper hospital parameters:
                  </p>
                  <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4 font-light">
                    <li>Dynamic tracking systems are utilized to establish safety benchmarks and comfort compliance indicators daily.</li>
                    <li>Surgical, cardiac, and neurological post-acute transitions demonstrate a 40% safety optimization margin when peer nurses follow this exact framework.</li>
                    <li>Advanced non-pharmacological directives are configured seamlessly to support both primary patient caretakers and emergency dispatch tables of life.</li>
                  </ul>
                  <p className="text-[11px] text-slate-405 text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                    "Compliance indices are derived globally to map safety indicators flawlessly across elderly stages of health."
                  </p>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => {
                      const isBookmarked = bookmarks.includes(selectedBlogForSummary.id);
                      if (isBookmarked) {
                        setBookmarks(bookmarks.filter(id => id !== selectedBlogForSummary.id));
                        triggerToast(`Removed bookmark for "${selectedBlogForSummary.title}".`);
                      } else {
                        setBookmarks([...bookmarks, selectedBlogForSummary.id]);
                        triggerToast(`Saved "${selectedBlogForSummary.title}" to health bookmarks!`);
                      }
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs text-center shadow-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{bookmarks.includes(selectedBlogForSummary.id) ? "Unbookmark Article" : "Save Bookmark"}</span>
                  </button>
                  <button
                    onClick={() => setSelectedBlogForSummary(null)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-3 rounded-xl text-xs transition-colors"
                  >
                    Close Summary
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DIRECT CLINICAL CHAT OVERLAY DISPATCH - REDESIGNED INTUITIVE SIDE CLINICAL PANEL */}
      <AnimatePresence>
        {activeDirectChatDoctor && (
          <>
            {/* Dark Backdrop for premium depth and highlighting */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDirectChatDoctor(null)}
              className="fixed inset-0 bg-slate-900/40 z-50 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ x: "100%", opacity: 0.95 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.95 }}
              transition={{ type: "spring", damping: 26, stiffness: 210 }}
              className="fixed right-0 top-0 bottom-0 h-full w-full sm:max-w-md md:max-w-2xl bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col text-left overflow-hidden font-sans"
            >
              {/* HEADER WITH DR INFO AND PROMINENT EXPLICIT CLOSE CHAT ACTION */}
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-805 shadow-md shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img referrerPolicy="no-referrer" src={activeDirectChatDoctor.avatar} alt={activeDirectChatDoctor.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-white/10 bg-slate-800" />
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse"></span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight">{activeDirectChatDoctor.name}</h4>
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/10 text-[9px] font-bold text-blue-400 capitalize whitespace-nowrap mt-1 tracking-wider">
                      {activeDirectChatDoctor.role} • Certified Care Advisor
                    </span>
                  </div>
                </div>
                
                {/* EXPLICIT, CORNER CLOSE BUTTON */}
                <button
                  onClick={() => {
                    setActiveDirectChatDoctor(null);
                    triggerToast("Consultation session minimized.");
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-transparent text-rose-400 hover:text-white transition-all text-xs font-bold cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                  <span>Close Chat</span>
                </button>
              </div>

              {/* TWO COLUMN CONTENT PANEL FOR DESKTOP, PANEL COMPONENT FOR MOBILE */}
              <div className="flex-1 flex overflow-hidden bg-slate-50/20">
                
                {/* FIRST COLUMN: DYNAMIC MESSAGING INTERACTIVE SHELF */}
                <div className="flex-1 flex flex-col overflow-hidden bg-white">
                  
                  {/* Chat Message Scrollport */}
                  <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30">
                    
                    {/* Welcome Announcement Card */}
                    <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-2xl mb-2 flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                      <div className="text-xs">
                        <strong className="text-slate-800 block mb-0.5">Specialized Medical AI Co-Pilot Ready</strong>
                        <p className="text-slate-500 font-light leading-relaxed">
                          This session uses an intelligent clinical model representing Dr. {activeDirectChatDoctor.name.split(' ').pop()}'s board-certified specialty parameters. Ask clinical concerns or symptom scenarios now.
                        </p>
                      </div>
                    </div>

                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                        <div className={`p-3.5 rounded-2xl max-w-[90%] text-xs leading-relaxed shadow-sm transition-all duration-200 ${
                          msg.sender === "user"
                            ? "bg-blue-600 text-white rounded-tr-none hover:shadow-md"
                            : "bg-slate-100/80 text-slate-800 border border-slate-150 rounded-tl-none hover:shadow-md"
                        }`}>
                          <div className="font-sans font-medium whitespace-pre-wrap">{msg.text}</div>
                          
                          {/* Attachments inside direct doctor bubbles */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2 border-t border-white/20 pt-1.5">
                              {msg.attachments.map((file: any, fIdx: number) => (
                                <div key={fIdx} className="flex items-center gap-1 bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider">
                                  📎 {file.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-[8px] text-slate-400 mt-1 font-mono px-1">{msg.time}</span>
                      </div>
                    ))}

                    {isDoctorTyping && (
                      <div className="flex flex-col items-start animate-pulse">
                        <div className="p-3.5 rounded-2xl bg-white text-slate-500 border border-slate-100 rounded-tl-none flex items-center gap-1.5 shadow-sm text-xs">
                          <span className="font-semibold text-slate-400 animate-pulse">Dr. {activeDirectChatDoctor.name.split(' ').pop()} is formulating diagnosis</span>
                          <span className="flex gap-0.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Suggestion Pills / Quick Prompts matching what doctor does (ChatGPT/Gemini style) */}
                  <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100 flex gap-2 overflow-x-auto scrollbar-none shrink-0 scroll-smooth">
                    {(() => {
                      const roleLower = (activeDirectChatDoctor.role || "").toLowerCase();
                      const specialtyPrompts = roleLower.includes("cardio")
                        ? ["I am getting a fever with rapid pulse", "ECG screening preparation checklist", "How should we monitor chest tightness?"]
                        : roleLower.includes("surge")
                        ? ["I have postoperative soreness near sutures", "How to manage surgical wound hygiene?", "Spotting sudden swelling signs"]
                        : roleLower.includes("neuro")
                        ? ["Improving sleep cycle under stress", "Screen brightness and constant headache", "Dementia tracking guidance"]
                        : ["Comfort guideline for dementia care", "Non-pharmacological soothing relief", "Managing medicines timeline safely"];
                      
                      return specialtyPrompts.map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => {
                            setChatInputValue(prompt);
                            triggerToast("Prompt active in chat bar.");
                          }}
                          className="bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 text-[10px] font-semibold px-3.5 py-2 rounded-full whitespace-nowrap shadow-sm hover:scale-102 transition-all cursor-pointer shrink-0"
                        >
                          💡 {prompt}
                        </button>
                      ));
                    })()}
                  </div>

                  {/* Input Form Footer */}
                  <form onSubmit={handleSendChatMessage} className="p-4 bg-white border-t border-slate-100 flex flex-col gap-2 shrink-0">
                    <input
                      type="file"
                      ref={directFileInputRef}
                      className="hidden"
                      accept="*/*"
                      onChange={handleDirectFileChange}
                      multiple
                    />
                    
                    {/* Attached files preview */}
                    {directChatFiles.length > 0 && (
                      <div className="flex flex-wrap gap-1 px-1 pb-1">
                        {directChatFiles.map((file, i) => (
                          <div key={i} className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-md px-2 py-1 text-[10px] font-semibold text-blue-700 font-sans shadow-3xs max-w-full">
                            <span className="truncate max-w-[150px]">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => setDirectChatFiles(prev => prev.filter((_, idx) => idx !== i))}
                              className="text-blue-400 hover:text-blue-700 font-bold ml-1 cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => directFileInputRef.current?.click()}
                        className="p-3 bg-slate-50 border border-slate-200 text-slate-500 hover:text-blue-600 rounded-xl transition-all cursor-pointer hover:bg-slate-100 flex items-center justify-center shrink-0"
                        title="Attach clinical document (TXT/PDF/Images)"
                      >
                        <Paperclip className="w-4 h-4 pointer-events-none" />
                      </button>

                      <input
                        type="text"
                        placeholder={`Seek clinical guidance from Dr. ${activeDirectChatDoctor.name.split(' ').pop()}...`}
                        value={chatInputValue}
                        onChange={(e) => setChatInputValue(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                      />
                      
                      <button
                        type="submit"
                        disabled={isDoctorTyping || (!chatInputValue.trim() && directChatFiles.length === 0)}
                        className={`p-3 rounded-xl transition-all font-semibold text-white shadow-sm flex items-center justify-center shrink-0 ${
                          isDoctorTyping || (!chatInputValue.trim() && directChatFiles.length === 0)
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95'
                        }`}
                      >
                        <Send className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </form>
                </div>

                {/* SECOND COLUMN: CHATGPT/GEMINI GUIDE IN THE RIGHT (Sideboard Desktop Only) */}
                <div className="hidden md:flex w-72 bg-slate-50 border-l border-slate-150 p-5 flex-col justify-between overflow-y-auto shrink-0">
                  <div className="space-y-5">
                    <div>
                      <h5 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Specialty Focus</h5>
                      <div className="p-4 bg-white border border-slate-150 rounded-2xl shadow-sm">
                        <strong className="text-xs text-slate-800 block capitalize">{activeDirectChatDoctor.role} GUIDELINES</strong>
                        <p className="text-[10px] text-slate-500 mt-1.5 font-light leading-relaxed">
                          Equipped with board-certified clinical protocols. Responses analyze symptoms to outline safe recommendations instantly.
                        </p>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Interactive Guide</h5>
                      <div className="space-y-2.5">
                        <div className="p-3 bg-blue-50/50 border border-blue-100/50 rounded-xl text-[11px] leading-relaxed text-slate-650 font-light">
                          Select any suggested preset pill at the bottom to inject clinical questions instantly into the consult window.
                        </div>
                        <div className="p-3 bg-slate-100/70 border border-slate-250 rounded-xl text-[11px] leading-relaxed text-slate-500 font-light">
                          Our clinical API matches symptom severity tags against home-monitoring best practices.
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Next Direct Action</h5>
                      <button
                        onClick={() => {
                          selectDoctorForBooking(activeDirectChatDoctor);
                          setActiveDirectChatDoctor(null);
                        }}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:scale-102 hover:shadow-lg hover:shadow-emerald-100 transition-all cursor-pointer shadow-md"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        <span>Book In-Clinic Slot</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 font-light leading-relaxed">
                    <strong>Disclaimer:</strong> AI diagnostics provide informational support under Cooper Hospital standards. For emergency scenarios, call emergency services immediately.
                  </div>
                </div>

              </div>

              {/* Bottom footer button panel to close chat on mobile explicitly */}
              <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex gap-2 items-center justify-end block md:hidden shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveDirectChatDoctor(null);
                    triggerToast("Consultation session terminated.");
                  }}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-3 rounded-xl text-center active:scale-95 transition-all outline-none"
                >
                  End Session & Close Chat
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* PRACTITIONER REGISTRY CREDENTIAL VERIFICATION */}
      <AnimatePresence>
        {activeVerificationDoctor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 text-left"
            onClick={() => setActiveVerificationDoctor(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Credential Verification Board</span>
                </span>
                <button
                  onClick={() => setActiveVerificationDoctor(null)}
                  className="p-1 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex gap-4 items-center p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <img referrerPolicy="no-referrer" src={activeVerificationDoctor.avatar} alt={activeVerificationDoctor.name} className="w-14 h-14 rounded-xl object-cover bg-slate-200 border border-white shadow-sm" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{activeVerificationDoctor.name}</h4>
                    <p className="text-xs text-blue-600 font-semibold">{activeVerificationDoctor.role}</p>
                    <span className="inline-block bg-emerald-50 text-emerald-700 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full mt-1">
                      ● REGISTERED STATE MEDICAL BOARD
                    </span>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-slate-600">
                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
                    <div>
                      <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">License Number</span>
                      <strong className="text-slate-800 font-mono">NY-MED-{activeVerificationDoctor.id.toUpperCase()}-3002</strong>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">Status Indicators</span>
                      <strong className="text-emerald-600">ACTIVE COMPLIANT</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
                    <div>
                      <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">DEA Registry ID</span>
                      <strong className="text-slate-800 font-mono">DEA-XP-{1000 + Number(activeVerificationDoctor.id) * 31}</strong>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">Vetting Protocols</span>
                      <strong className="text-slate-800">100% SECURE & CONFIDENTIAL</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed font-light italic">
                    The medical credentialing desk of Cooper University Hospital verifies that the practitioner listed above holds unrestricted board certifications, is in good absolute standing, and has complied flawlessly with quarterly peer reviews.
                  </p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => {
                      selectDoctorForBooking(activeVerificationDoctor);
                      setActiveVerificationDoctor(null);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs text-center shadow-lg transition-colors"
                  >
                    Proceed with Secure Booking
                  </button>
                  <button
                    onClick={() => setActiveVerificationDoctor(null)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-3 rounded-xl text-xs transition-colors"
                  >
                    Close Verification
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GLOBAL AI CHATBOT SYSTEM DEPRECATED AND HIDDEN - REPLACED BY CUSTOMER SUPPORT WIDGET ON BOTTOM-RIGHT */}
      <div className="hidden">
        
        {/* Helper Tooltip Prompt */}
        <AnimatePresence>
          {showHelperTooltip && !isGlobalChatOpen && (
            <motion.button
              type="button"
              id="customer-support-tooltip"
              initial={{ opacity: 0, scale: 0.85, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              onClick={(e) => {
                e.stopPropagation();
                setShowHelperTooltip(false);
                setIsGlobalChatOpen(true);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#5c60a1] hover:bg-[#4a4e8d] text-white text-[11px] font-bold py-2 px-3.5 rounded-xl shadow-xl flex items-center gap-2 select-none relative mb-1 border border-indigo-400/20 transition-all cursor-pointer text-left"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></div>
              <span className="tracking-tight font-sans">Customer Support</span>
              <span className="text-white/70 hover:text-white ml-1 font-bold text-[10px] font-sans">×</span>
              {/* Triangle pointer */}
              <div className="absolute top-full right-6 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#5c60a1]"></div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Chat window popover container */}
        <AnimatePresence>
          {isGlobalChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 230 }}
              className="bg-white w-[350px] max-w-[calc(100vw-1.5rem)] h-[540px] rounded-[24px] shadow-3xl border border-slate-200/80 flex flex-col overflow-hidden text-left"
            >
              {/* Bot Header with Ava AI Theme from Image 3 */}
              <div className="bg-[#5c60a1] text-white p-3.5 flex items-center justify-between border-b border-indigo-700/20 shrink-0 select-none">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      referrerPolicy="no-referrer"
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120" 
                      alt="Ava AI Portrait" 
                      className="w-10 h-10 rounded-full object-cover border border-white/40 bg-slate-800"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#5c60a1] rounded-full animate-pulse"></span>
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white tracking-tight">Ava</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white text-[#5c60a1] select-none uppercase tracking-wide">AI</span>
                    </div>
                    <span className="text-[10px] text-white/80 font-medium">Customer Support Specialist</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsGlobalChatOpen(false)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 hover:text-white transition-all text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic Tabs Body Container */}
              {globalChatTab === "chat" && (
                <>
                  {/* Bot Messages and Presets Container */}
                  <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-slate-50/50">
                    
                    {/* Compact Greeting Badge */}
                    <div className="bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100/60 text-[10px] text-indigo-900 leading-relaxed font-semibold">
                      ⚡ <strong>Interactive Support Desk:</strong> Ask any clinical service concern or press options for immediate AI-powered support!
                    </div>

                    {globalChatMessages.map((m, index) => (
                      <div 
                        key={index} 
                        className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                      >
                        <div 
                          className={`max-w-[85%] rounded-[16px] px-3.5 py-2.5 text-[11.5px] leading-relaxed ${
                            m.sender === "user" 
                              ? "bg-indigo-600 text-white rounded-br-none shadow-sm" 
                              : "bg-white text-slate-800 rounded-bl-none border border-slate-200/80 shadow-xs"
                          }`}
                        >
                          <div>{m.text}</div>
                          
                          {/* Attached files indicator inside the bubble */}
                          {m.attachments && m.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2 border-t border-white/20 pt-1.5">
                              {m.attachments.map((file: any, fIdx: number) => (
                                <div key={fIdx} className="flex items-center gap-1 bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider">
                                  📎 {file.name}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* If it's the very first message from Ava, render inline option pills as in Image 3 */}
                          {m.sender === "doctor" && index === 0 && (
                            <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-100">
                              <button 
                                type="button"
                                onClick={() => handleSendGlobalChatPreset("I would like to learn more about Cooper Hospital's specialist doctors and treatments.")}
                                className="text-[10px] font-bold text-indigo-600 bg-slate-50 hover:bg-slate-100 hover:text-[#5c60a1] px-2 py-1.5 rounded-lg border border-slate-200/60 transition-all cursor-pointer shadow-3xs text-left"
                              >
                                Learn more
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleSendGlobalChatPreset("What interactive patient portals and checking tools are available on this portal?")}
                                className="text-[10px] font-bold text-indigo-600 bg-slate-50 hover:bg-slate-100 hover:text-[#5c60a1] px-2 py-1.5 rounded-lg border border-slate-200/60 transition-all cursor-pointer shadow-3xs text-left"
                              >
                                Explore options
                              </button>
                            </div>
                          )}
                        </div>
                        <span className="text-[8px] font-semibold text-slate-400 mt-0.5 px-1 font-mono">{m.time}</span>
                      </div>
                    ))}

                    {/* Typing Indicator */}
                    {isGlobalChatTyping && (
                      <div className="flex flex-col items-start">
                        <div className="bg-white rounded-[16px] rounded-bl-none border border-slate-200/80 px-3 py-2 shadow-xs">
                          <div className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce"></span>
                            <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                          </div>
                        </div>
                        <span className="text-[8px] font-bold tracking-wider text-indigo-600 uppercase mt-0.5 animate-pulse">Consulting Ava AI...</span>
                      </div>
                    )}

                    <div ref={globalChatEndRef} />
                  </div>

                  {/* Common Doubts Presets Row */}
                  <div className="px-3 py-2 border-t border-slate-100 bg-white flex flex-col gap-1 shrink-0">
                    <span className="text-[8px] uppercase font-bold tracking-wider text-slate-400 px-1 font-sans">Common Doubts</span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { label: "🌡️ Fever & Cough", text: "I have a sudden fever and a persistent cough. What can I do safely to relieve it?" },
                        { label: "🤢 Stomach Cramps", text: "I feel nauseated and have stomach cramps. What light items should I consume?" },
                        { label: "💆 Muscle Soreness", text: "My neck and shoulders are very sore and aching. What recovery steps do you recommend?" },
                      ].map((preset, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSendGlobalChatPreset(preset.text)}
                          className="text-[9px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-indigo-600 border border-slate-200/50 transition-all py-1 px-2.5 rounded-full cursor-pointer text-left"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bot Input Form - Matches Image 3 with Paperclip, "Talk" voice button container */}
                  <form onSubmit={handleSendGlobalChatMessage} className="bg-slate-100 border border-slate-200 rounded-[22px] p-2 flex flex-col gap-1 mx-3 mb-2 shrink-0">
                    <input
                      type="file"
                      ref={globalFileInputRef}
                      className="hidden"
                      accept="*/*"
                      onChange={handleGlobalFileChange}
                      multiple
                    />
                    
                    {/* Attached files preview */}
                    {globalChatFiles.length > 0 && (
                      <div className="flex flex-wrap gap-1 px-2 pt-1 border-b border-slate-200/40 pb-1.5 mb-1">
                        {globalChatFiles.map((file, i) => (
                          <div key={i} className="flex items-center gap-1 bg-indigo-50 border border-indigo-200/50 rounded-md px-1.5 py-0.5 text-[8px] font-bold text-indigo-700 font-sans shadow-3xs max-w-full">
                            <span className="truncate max-w-[120px]">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => setGlobalChatFiles(prev => prev.filter((_, idx) => idx !== i))}
                              className="text-indigo-400 hover:text-indigo-700 font-bold ml-0.5 cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <input
                      type="text"
                      value={globalChatInputValue}
                      onChange={(e) => setGlobalChatInputValue(e.target.value)}
                      placeholder="Tell Ava what you need..."
                      className="bg-transparent border-none text-[11px] px-2 py-1 outline-none font-sans font-semibold text-slate-800 placeholder:text-slate-500 w-full"
                    />
                    
                    <div className="flex items-center justify-between px-1.5 pt-1.5 border-t border-slate-200/30">
                      <button
                        type="button"
                        onClick={() => globalFileInputRef.current?.click()}
                        className="text-slate-500 hover:text-slate-800 transition-colors p-1 rounded-lg hover:bg-slate-200 shrink-0 cursor-pointer"
                        title="Upload health records or symptoms data"
                      >
                        <Paperclip className="w-4 h-4 pointer-events-none" />
                      </button>
 
                      <div className="flex items-center gap-2">
                        {/* Green/Teal Grounding Badges from Image 3 */}
                        <div className="flex items-center gap-1 bg-white/70 py-0.5 px-1.5 rounded-lg border border-slate-200/40 select-none shadow-3xs">
                          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <span className="text-[7px] font-bold text-emerald-600 font-sans">⚡</span>
                          </div>
                          <div className="w-3.5 h-3.5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                            <span className="text-[7px] font-extrabold text-blue-600 font-sans">G</span>
                          </div>
                        </div>
 
                        <button
                          type="submit"
                          disabled={isGlobalChatTyping || (!globalChatInputValue.trim() && globalChatFiles.length === 0)}
                          className="rounded-full bg-[#0266c8] hover:bg-[#0157ab] text-white px-3.5 py-1.5 flex items-center gap-1.5 text-[11px] font-bold transition-all shadow-sm select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Send className="w-3 h-3" />
                          <span>Talk</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </>
              )}

              {globalChatTab === "voice" && (
                <div className="flex-1 p-5 flex flex-col justify-between items-center text-center bg-[#0d1527] text-white overflow-y-auto space-y-4 font-sans select-none relative">
                  {/* Decorative faint grid background */}
                  <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>

                  {/* Language Selector Toggle */}
                  <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-between z-10 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/45">
                    <div className="space-y-1">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block text-left">
                        {voiceLanguage === "te" ? "సంభాషణ భాష" : "Conversation Language"}
                      </span>
                      <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-full border border-slate-700 shadow-lg">
                        <button
                          type="button"
                          onClick={() => {
                            setVoiceLanguage("en");
                            triggerToast("Voice agent set to English");
                          }}
                          className={`px-3 py-0.5 text-[9px] font-extrabold rounded-full transition-all cursor-pointer ${
                            voiceLanguage === "en" ? "bg-[#0266c8] text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          English
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setVoiceLanguage("te");
                            triggerToast("వాయిస్ ఏజెంట్ తెలుగుకు మార్చబడింది");
                          }}
                          className={`px-3 py-0.5 text-[9px] font-extrabold rounded-full transition-all cursor-pointer ${
                            voiceLanguage === "te" ? "bg-[#0266c8] text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          తెలుగు
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block text-left md:text-right">
                        {voiceLanguage === "te" ? "కాలింగ్ టెక్నాలజీ" : "Calling Engine"}
                      </span>
                      <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-full border border-slate-700 shadow-lg">
                        <button
                          type="button"
                          disabled={isInVoiceCall}
                          onClick={() => {
                            setCallingEngine("elevenlabs");
                            triggerToast("Switched to ElevenLabs Premium Voice Agent");
                          }}
                          className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-full transition-all cursor-pointer ${
                            callingEngine === "elevenlabs" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                          } ${isInVoiceCall ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          🔥 {voiceLanguage === "te" ? "ఎలెవెన్‌ల్యాబ్స్" : "ElevenLabs AI"}
                        </button>
                        <button
                          type="button"
                          disabled={isInVoiceCall}
                          onClick={() => {
                            setCallingEngine("interactive");
                            triggerToast("Switched to local Interactive STT Mode");
                          }}
                          className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-full transition-all cursor-pointer ${
                            callingEngine === "interactive" ? "bg-[#0266c8] text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                          } ${isInVoiceCall ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {voiceLanguage === "te" ? "ఇంటరాక్టివ్" : "Interactive STT"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ElevenLabs Agent ID Config */}
                  {callingEngine === "elevenlabs" && (
                    <div className="w-full z-10 bg-indigo-950/20 p-3 rounded-2xl border border-indigo-500/20 flex flex-col md:flex-row gap-3 items-center justify-between">
                      <div className="text-left space-y-0.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 block">
                          {voiceLanguage === "te" ? "ఎలెవెన్‌ల్యాబ్స్ ఏజెంట్ ఐడి" : "ElevenLabs Agent ID Configuration"}
                        </span>
                        <p className="text-[9px] text-slate-400">
                          {voiceLanguage === "te" 
                            ? "మీ ఎలెవెన్‌ల్యాబ్స్ కాన్వర్సేషనల్ ఏజెంట్ ఐడిని సెట్ చేయండి." 
                            : "Enter your custom ElevenLabs Conversational Agent ID below."}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 w-full md:w-auto max-w-sm">
                        <input
                          type="text"
                          value={elevenlabsAgentId}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            setElevenlabsAgentId(val);
                            localStorage.setItem("elevenlabs_agent_id", val);
                          }}
                          placeholder="e.g. afab57a43..."
                          className="w-full md:w-64 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            triggerToast(voiceLanguage === "te" ? "ఏజెంట్ ఐడి సేవ్ చేయబడింది!" : "ElevenLabs Agent ID saved successfully!");
                          }}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-2.5 py-1 text-[10px] font-bold cursor-pointer transition-all shrink-0"
                        >
                          {voiceLanguage === "te" ? "సేవ్" : "Save"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Premium Persona Card for AVA */}
                  <div className="w-full z-10 max-w-xs">
                    <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl shadow-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0266c8]/20 text-[#0266c8] flex items-center justify-center text-xl shadow-inner animate-pulse">
                        👩‍⚕️
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-[11px] font-extrabold text-slate-100">Ava (ఆవా)</h4>
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-medium font-mono">
                          {useLiveApi 
                            ? (voiceLanguage === "te" ? "రియల్ టైమ్ ఆడియో స్ట్రీమింగ్ ఏజెంట్" : "Real-time Live Audio Streamer") 
                            : (voiceLanguage === "te" ? "ఇంటరాక్టివ్ కాలింగ్ వాయిస్ ఏజెంట్" : "Active Vocal Action Engine")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Main Calling Screen Stage */}
                  <div className="flex-1 flex flex-col items-center justify-center space-y-4 my-2 z-10 w-full">
                    {!isInVoiceCall ? (
                      /* Standby Stage */
                      <div className="flex flex-col items-center space-y-5 animate-fade-in py-3">
                        {/* Pulse circle for call standby */}
                        <div className="w-20 h-20 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 shadow-2xl relative">
                          <div className="absolute inset-0 rounded-full bg-slate-700/20 animate-pulse"></div>
                          <Phone className="w-8 h-8 text-indigo-400" />
                        </div>

                        <div className="space-y-1">
                          <h5 className="text-[11px] font-extrabold uppercase tracking-widest text-[#0266c8] font-mono">
                            {callingEngine === "elevenlabs" 
                              ? "ELEVENLABS PREMIUM AGENT READY" 
                              : "WEB SPEECH BILINGUAL CO-PILOT"}
                          </h5>
                          <p className="text-[10px] text-slate-400 max-w-[240px] mx-auto leading-relaxed font-semibold">
                            {callingEngine === "elevenlabs" ? (
                              voiceLanguage === "te"
                                ? "ఎలెవెన్‌ల్యాబ్స్ అల్ట్రా-రియలిస్టిక్ వాయిస్ సంభాషణ. సున్నితమైన వాయిస్ ఏజెంట్ అనుభవం."
                                : "Experience high-fidelity, ultra-realistic voice calling powered by ElevenLabs Conversational AI."
                            ) : (
                              voiceLanguage === "te"
                                ? "వెబ్ స్పీచ్ సర్వీస్. జెమిని ఆధారిత అధునాతన ద్విభాషా వాయిస్ అనుభవం."
                                : "Experience seamless real-time bilingual medical assistance powered by Web Speech APIs and Gemini."
                            )}
                          </p>
                        </div>

                        {/* Call Launcher Trigger */}
                        <button
                          type="button"
                          onClick={startVoiceCall}
                          className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white flex items-center justify-center gap-2 text-[11px] font-black transition-all shadow-lg hover:shadow-emerald-500/25 cursor-pointer animate-bounce"
                        >
                          <Phone className="w-3.5 h-3.5 animate-pulse" />
                          <span>{voiceLanguage === "te" ? "కాల్ ప్రారంభించండి" : "Start Voice Call"}</span>
                        </button>
                      </div>
                    ) : (
                      /* Active Consultation Call Stage */
                      <div className="flex flex-col items-center space-y-5 animate-fade-in w-full">
                        {/* Dynamic pulsing caller indicator */}
                        <div className="relative flex items-center justify-center">
                          {/* Pulses represent status */}
                          <span className={`absolute w-24 h-24 rounded-full opacity-10 animate-ping ${sttListening || liveSessionActive ? "bg-rose-500" : "bg-emerald-500"}`}></span>
                          <span className={`absolute w-20 h-20 rounded-full opacity-20 animate-pulse ${sttListening || liveSessionActive ? "bg-rose-500" : "bg-emerald-500"}`}></span>

                          <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl z-20 transition-all ${
                            useLiveApi 
                              ? liveSessionActive 
                                ? "bg-rose-500 text-white" 
                                : "bg-amber-500 animate-pulse text-white"
                              : sttListening 
                                ? "bg-rose-500/90 text-white" 
                                : isSpeaking 
                                  ? "bg-amber-500/90 text-white"
                                  : "bg-emerald-500/90 text-white"
                          }`}>
                            <Phone className="w-6 h-6 animate-pulse" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                            <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase font-mono">
                              {callingEngine === "elevenlabs"
                                ? "🎙️ ELEVENLABS CALL ACTIVE"
                                : useLiveApi 
                                  ? liveSessionActive ? "🛰️ GEMINI LIVE STREAM CONNECTED" : "📡 INITIALIZING DIRECT LINK" 
                                  : voiceLanguage === "te" ? "☎️ ఆన్ కాల్ కనెక్షన్" : "☎️ ACTIVE CALL CONNECTED"}
                            </span>
                          </div>

                          <h5 className="text-[12px] font-black text-slate-100">
                            {callingEngine === "elevenlabs" ? (
                              voiceLanguage === "te"
                                ? "అవా ఎలెవెన్‌ల్యాబ్స్ సాయంతో మాట్లాడుతోంది... మాట్లాడండి"
                                : "Ava is online via ElevenLabs... Speak naturally"
                            ) : useLiveApi ? (
                              liveSessionActive 
                                ? (voiceLanguage === "te" ? "ఆవా లైవ్ వింటోంది... మాట్లాడండి" : "Ava is online... Speak naturally")
                                : (voiceLanguage === "te" ? "లైవ్ స్ట్రీమ్ అనుసంధానించబడుతోంది..." : "Securing high-speed Live connection...")
                            ) : (
                              sttListening 
                                ? (voiceLanguage === "te" ? "ఆవా వింటోంది... మాట్లాడండి" : "Ava is listening... Speak now") 
                                : isSpeaking 
                                  ? (voiceLanguage === "te" ? "ఆవా మాట్లాడుతోంది..." : "Ava is Speaking...") 
                                  : (voiceLanguage === "te" ? "లింక్ లైవ్: ప్రతిస్పందన సిద్ధమవుతోంది..." : "Active session: Waiting for input...")
                            )}
                          </h5>

                          <p className="text-[10px] text-slate-400 max-w-[245px] leading-relaxed mx-auto font-medium">
                            {callingEngine === "elevenlabs" ? (
                              voiceLanguage === "te"
                                ? "ఎలెవెన్‌ల్యాబ్స్ కాలింగ్ సిస్టమ్. సున్నితమైన మరియు స్పష్టమైన సంభాషణ."
                                : "Speak naturally into your microphone. Conversation is processed with premium low-latency speech."
                            ) : useLiveApi ? (
                              voiceLanguage === "te"
                                ? "స్పష్టంగా మాట్లాడండి - అవా రియల్ టైమ్ ఆడియో స్ట్రీమింగ్ ద్వారా ప్రతిస్పందిస్తుంది"
                                : "Speak naturally just like a normal phone call. Your feedback is streamed instantly."
                            ) : (
                              sttListening
                                ? (voiceLanguage === "te" ? "దయచేసి ఫోన్‌లో మాట్లాడుతున్నట్లు స్పష్టంగా మాట్లాడండి" : "Speak naturally into your device just like a phone call")
                                : (voiceLanguage === "te" ? "ఆవా మీ ఆరోగ్య ప్రశ్నను విউৎలేషిస్తోంది..." : "Ava is formulating her expert medical instructions...")
                            )}
                          </p>
                        </div>

                        {/* Beautiful Real-time Live Waveform */}
                        <div className="flex items-center gap-1.5 h-6 justify-center select-none w-full py-1">
                          <span className={`w-1 rounded-full ${sttListening || liveSessionActive ? "bg-rose-400" : "bg-emerald-400"} h-3 animate-bounce [animation-duration:0.6s]`}></span>
                          <span className={`w-1 rounded-full ${sttListening || liveSessionActive ? "bg-rose-400" : "bg-emerald-400"} h-5 animate-bounce [animation-delay:0.1s] [animation-duration:0.5s]`}></span>
                          <span className="w-1 rounded-full bg-indigo-400 h-4 animate-bounce [animation-delay:0.2s] [animation-duration:0.7s]"></span>
                          <span className="w-1 rounded-full bg-blue-400 h-6 animate-bounce [animation-delay:0.3s] [animation-duration:0.4s]"></span>
                          <span className="w-1 rounded-full bg-indigo-400 h-4 animate-bounce [animation-delay:0.4s] [animation-duration:0.8s]"></span>
                          <span className={`w-1 rounded-full ${sttListening || liveSessionActive ? "bg-rose-400" : "bg-emerald-400"} h-5 animate-bounce [animation-delay:0.5s] [animation-duration:0.6s]`}></span>
                          <span className={`w-1 rounded-full ${sttListening || liveSessionActive ? "bg-rose-400" : "bg-emerald-400"} h-2 animate-bounce [animation-delay:0.6s] [animation-duration:0.5s]`}></span>
                        </div>

                        {/* Red Stop Call Trigger */}
                        <button
                          type="button"
                          onClick={endVoiceCall}
                          className="px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center gap-2 text-[10px] font-black transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                          <span>{voiceLanguage === "te" ? "కాల్ ముగించండి" : "End Call"}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Footer informational quick hint */}
                  <div className="w-full bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/85 z-10 text-left">
                    <span className="text-[8px] font-black tracking-wider text-indigo-400 uppercase block mb-0.5">
                      {voiceLanguage === "te" ? "క్విక్ వాయిస్ ఫీచర్" : "QUICK VOICE BOOKING"}
                    </span>
                    <p className="text-[9px] text-slate-300 font-semibold leading-relaxed">
                      {voiceLanguage === "te"
                        ? "కాల్‌లో ఉన్నప్పుడు 'అపాయింట్మెంట్ బుక్ చేయి' అనండి - ఆవా సమయం లెక్కించి వాట్సాప్ (9392472134) ద్వారా రశీదు పంపుతుంది!"
                        : "Say 'Book Appointment' during call: Ava dynamically books a slot & sends receipt to WhatsApp (9392472134)!"}
                    </p>
                  </div>
                </div>
              )}

              {globalChatTab === "history" && (
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200 pb-1.5 shrink-0 select-none">
                      <div className="flex items-center gap-2">
                        <History className="w-3.5 h-3.5" />
                        <span>Recent Chat Sessions</span>
                      </div>
                      <span className="text-[8px] font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-sm">Active</span>
                    </div>

                    <div className="space-y-2 max-h-[190px] overflow-y-auto pr-0.5">
                      {sessionsList.map((session) => (
                        <button
                          key={session.id}
                          type="button"
                          onClick={() => {
                            setGlobalChatMessages(session.messages);
                            setGlobalChatTab("chat");
                            triggerToast(`Restored consultation: "${session.title}"`);
                          }}
                          className="w-full bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-3xs flex flex-col gap-1 text-left text-[11px] hover:border-indigo-400 transition-all group cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-indigo-600 text-[10px]">AI Support Evaluation</span>
                            <span className="text-[8px] text-slate-400 font-mono">{session.date}</span>
                          </div>
                          <span className="text-slate-800 font-bold group-hover:text-indigo-700 transition-colors truncate">
                            {session.title}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate italic">
                            Last message: "{session.messages[session.messages.length - 1]?.text || ""}"
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Archive Current Active Chat */}
                  <div className="pt-2 border-t border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => {
                        if (globalChatMessages.length <= 1) {
                          triggerToast("Start a chat conversation first in order to archive!");
                          return;
                        }
                        const snapshotID = `sess_${Date.now()}`;
                        const snapshotTitle = `🩺 Active Diagnosis Summary (${globalChatMessages.length - 1} answers)`;
                        const newSession = {
                          id: snapshotID,
                          title: snapshotTitle,
                          date: "Just Now",
                          messages: [...globalChatMessages]
                        };
                        setSessionsList([newSession, ...sessionsList]);
                        triggerToast("Conversation successfully archived to historical sessions!");
                      }}
                      className="w-full font-bold bg-[#0266c8] hover:bg-[#0157ab] text-white py-1.5 rounded-lg text-[10px] text-center transition-all shadow-3xs cursor-pointer flex items-center justify-center gap-1.5 select-none"
                    >
                      <span>📥 Archive Active Consultation</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Navigation Tabs - Matches Image 3 layout */}
              <div className="border-t border-slate-150 bg-white grid grid-cols-3 py-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setGlobalChatTab("chat")}
                  className={`flex flex-col items-center justify-center gap-0.5 pointer-events-auto cursor-pointer transition-colors ${
                    globalChatTab === "chat" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <MessageSquareText className="w-4 h-4" />
                  <span className="text-[9px] font-bold">Chat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGlobalChatTab("voice")}
                  className={`flex flex-col items-center justify-center gap-0.5 pointer-events-auto cursor-pointer transition-colors ${
                    globalChatTab === "voice" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span className="text-[9px] font-bold">Voice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGlobalChatTab("history")}
                  className={`flex flex-col items-center justify-center gap-0.5 pointer-events-auto cursor-pointer transition-colors ${
                    globalChatTab === "history" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span className="text-[9px] font-bold">History</span>
                </button>
              </div>

              {/* Standard AI Support terms notice - Matches Image 3 footer text */}
              <div className="bg-slate-50 border-t border-slate-100 py-1 text-center shrink-0 select-none">
                <span className="text-[8px] font-semibold text-slate-400">
                  This chat is recorded. By chatting, you agree to the <span className="underline cursor-pointer hover:text-indigo-600">AI Terms</span>.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating rounded circle launcher button */}
        <motion.button
          id="floating-ai-chatbot-launcher"
          onClick={() => {
            setIsGlobalChatOpen(!isGlobalChatOpen);
            setShowHelperTooltip(false);
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 rounded-full relative select-none cursor-pointer shadow-3xl overflow-visible group"
        >
          {isGlobalChatOpen ? (
            <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-white shadow-lg transition-transform duration-200">
              <X className="w-5 h-5 pointer-events-none" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full p-[3px] bg-gradient-to-tr from-purple-500 via-indigo-400 to-blue-500 shadow-xl relative">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-800 border-2 border-white transition-all">
                <img 
                  referrerPolicy="no-referrer"
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150" 
                  alt="Ava AI Agent Launcher" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              {/* Online glowing pulsing indicator exactly like second image */}
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-md">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-75"></span>
              </span>
            </div>
          )}
        </motion.button>

      </div>

      {/* Floating Clinical Support Assistant Widget */}
      <FloatingAIWidget isOpen={avaWidgetOpen} onClose={() => setAvaWidgetOpen(false)} isDarkMode={isDarkMode} />
      <FloatingButton isOpen={avaWidgetOpen} onClick={() => setAvaWidgetOpen(!avaWidgetOpen)} />

    </div>
  );
}
