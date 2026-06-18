import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Stethoscope,
  User,
  Calendar,
  Clock,
  Phone,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  CalendarDays,
  Sparkles,
  Search,
  Activity
} from "lucide-react";
import { Doctor } from "../types";
import { appointmentService, Appointment } from "../services/appointmentService";
import { getCachedAccessToken, appendAppointmentsToSheet } from "../services/sheetsService";

interface AppointmentCardProps {
  onSuccess?: (appointment: Appointment) => void;
  onCancel?: () => void;
}

type Step = "department" | "doctor" | "date" | "slot" | "name" | "phone" | "confirm" | "completed";

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ onSuccess, onCancel }) => {
  const [step, setStep] = useState<Step>("department");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  
  const [isBooking, setIsBooking] = useState(false);
  const [bookedDetails, setBookedDetails] = useState<Appointment | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const language = window.localStorage.getItem("lang") === "te" ? "te" : "en";

  // Available lists
  const departments = appointmentService.getDepartments();
  const doctors = selectedDept ? appointmentService.getDoctorsByDepartment(selectedDept) : [];
  const slots = selectedDate ? appointmentService.getAvailableSlots(selectedDate) : [];

  // Reset doctor selection if department changes
  useEffect(() => {
    setSelectedDoc(null);
  }, [selectedDept]);

  const handleNext = () => {
    setErrorMsg("");
    switch (step) {
      case "department":
        if (!selectedDept) {
          setErrorMsg(language === "te" ? "దయచేసి ఒక విభాగాన్ని ఎంచుకోండి" : "Please select a clinical department");
          return;
        }
        setStep("doctor");
        break;
      case "doctor":
        if (!selectedDoc) {
          setErrorMsg(language === "te" ? "దయచేసి ఒక వైద్యుడిని ఎంచుకోండి" : "Please choose a physician");
          return;
        }
        setStep("date");
        break;
      case "date":
        if (!selectedDate) {
          setErrorMsg(language === "te" ? "దయచేసి తేదీని ఎంచుకోండి" : "Please choose a preferred schedule date");
          return;
        }
        // Validate date isn't in past
        const selected = new Date(selectedDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selected < today) {
          setErrorMsg(language === "te" ? "దయచేసి భవిష్యత్ తేదీని ఎంచుకోండి" : "Please specify a future-facing date");
          return;
        }
        setStep("slot");
        break;
      case "slot":
        if (!selectedSlot) {
          setErrorMsg(language === "te" ? "దయచేసి ఒక సమయాన్ని ఎంచుకోండి" : "Please check an available time slot");
          return;
        }
        setStep("name");
        break;
      case "name":
        if (!patientName.trim()) {
          setErrorMsg(language === "te" ? "దయచేసి రోగి పేరు నమోదు చేయండి" : "Please input the patient name");
          return;
        }
        setStep("phone");
        break;
      case "phone":
        if (!patientPhone.trim() || patientPhone.length < 10) {
          setErrorMsg(language === "te" ? "దయచేసి సరైన ఫోన్ నెంబర్ నమోదు చేయండి (10 అంకెలు)" : "Please support a valid 10-digit mobile contact");
          return;
        }
        setStep("confirm");
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    setErrorMsg("");
    switch (step) {
      case "doctor":
        setStep("department");
        break;
      case "date":
        setStep("doctor");
        break;
      case "slot":
        setStep("date");
        break;
      case "name":
        setStep("slot");
        break;
      case "phone":
        setStep("name");
        break;
      case "confirm":
        setStep("phone");
        break;
      default:
        break;
    }
  };

  const handleBookingConfirm = async () => {
    if (!selectedDept || !selectedDoc || !selectedDate || !selectedSlot || !patientName || !patientPhone) {
      setErrorMsg("Missing info, please restart card steps.");
      return;
    }

    setIsBooking(true);
    setErrorMsg("");
    try {
      const booked = await appointmentService.bookAppointment({
        department: selectedDept,
        doctorName: selectedDoc.name,
        doctorAvatar: selectedDoc.avatar,
        date: selectedDate,
        slot: selectedSlot,
        patientName: patientName,
        patientPhone: patientPhone
      });

      // Try syncing to Google Sheets if token exists
      const sheetsToken = getCachedAccessToken();
      if (sheetsToken) {
        try {
          await appendAppointmentsToSheet([booked], sheetsToken);
        } catch (sheetsErr) {
          console.error("Auto sheets sync failed during scheduling wizard:", sheetsErr);
        }
      }

      setBookedDetails(booked);
      setStep("completed");
      if (onSuccess) {
        onSuccess(booked);
      }
    } catch (err) {
      setErrorMsg("Booking gateway error, please retry.");
    } finally {
      setIsBooking(false);
    }
  };

  const getStepIndex = (): number => {
    const steps: Step[] = ["department", "doctor", "date", "slot", "name", "phone", "confirm", "completed"];
    return steps.indexOf(step) + 1;
  };

  return (
    <div className="w-full bg-slate-50 border border-slate-250/90 rounded-2xl shadow-md p-3 text-left overflow-hidden relative">
      {/* Absolute Glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#0266c8]/5 rounded-full filter blur-xl pointer-events-none" />

      {/* Top indicator bar */}
      {step !== "completed" && (
        <div className="flex flex-col gap-1.5 mb-3.5 border-b border-slate-200/60 pb-2">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black tracking-widest text-[#0266c8] font-mono">
              🏥 COOPER SCHEDULER WIZARD
            </span>
            <span className="text-[9.5px] font-extrabold text-slate-500 font-mono bg-slate-200/70 px-2 py-0.5 rounded-full">
              {getStepIndex()} / 7
            </span>
          </div>

          {/* Symmetrical timeline line */}
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#0266c8] to-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${(getStepIndex() / 7) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Wizard Steps Viewport */}
      <div>
        <AnimatePresence mode="wait">
          {step === "department" && (
            <motion.div
              key="step-dept"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="space-y-2"
            >
              <label className="text-[11.5px] font-black text-slate-800 uppercase tracking-wide flex items-center gap-1">
                <Stethoscope size={13} className="text-[#0266c8]" />
                {language === "te" ? "విభాగం ఎంచుకోండి (Department)" : "Step 1: Select Specialty Department"}
              </label>
              <div className="grid grid-cols-1 gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                {departments.map((dept) => {
                  const isSelected = selectedDept === dept;
                  return (
                    <button
                      key={dept}
                      onClick={() => setSelectedDept(dept)}
                      className={`text-left p-2.5 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                          : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      <span>{dept}</span>
                      {isSelected && <CheckCircle2 size={12} className="text-white" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === "doctor" && (
            <motion.div
              key="step-doc"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="space-y-2"
            >
              <label className="text-[11.5px] font-black text-slate-800 uppercase tracking-wide flex items-center gap-1">
                <User size={13} className="text-[#0266c8]" />
                {language === "te" ? "వైద్యుడిని ఎంచుకోండి (Physician)" : "Step 2: Choose Available Physician"}
              </label>
              <div className="grid grid-cols-1 gap-1.5 max-h-[200px] overflow-y-auto pr-1">
                {doctors.map((doc) => {
                  const isSelected = selectedDoc?.id === doc.id;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`text-left p-2 rounded-xl border text-[11px] transition-all flex items-center gap-2.5 cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                          : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      <img
                        referrerPolicy="no-referrer"
                        src={doc.avatar}
                        alt={doc.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200/80 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`font-black truncate ${isSelected ? "text-white" : "text-slate-800"}`}>
                          {doc.name}
                        </p>
                        <p className={`text-[9.5px] truncate ${isSelected ? "text-blue-100" : "text-slate-500 font-medium"}`}>
                          {doc.role}
                        </p>
                      </div>
                      {isSelected && <CheckCircle2 size={12} className="text-white ml-auto shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === "date" && (
            <motion.div
              key="step-date"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="space-y-2"
            >
              <label className="text-[11.5px] font-black text-slate-800 uppercase tracking-wide flex items-center gap-1">
                <Calendar size={13} className="text-[#0266c8]" />
                {language === "te" ? "తేదీ ఎంచుకోండి (Date)" : "Step 3: Access Schedule Date"}
              </label>
              <div className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-2">
                <p className="text-[10px] text-slate-500 font-medium leading-normal">
                  {language === "te" 
                    ? "కింది బటన్ క్లిక్ చేసి అనుకూలమైన తేదీని ఎంచుకోండి" 
                    : "Configure a calendar date for your appointment below:"}
                </p>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 p-2 text-[11px] font-black border border-slate-200 rounded-lg outline-none focus:border-[#0266c8] transition-colors"
                />
              </div>
            </motion.div>
          )}

          {step === "slot" && (
            <motion.div
              key="step-slot"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="space-y-2"
            >
              <label className="text-[11.5px] font-black text-slate-800 uppercase tracking-wide flex items-center gap-1">
                <Clock size={13} className="text-[#0266c8]" />
                {language === "te" ? "సమయం ఎంచుకోండి (Time Slot)" : "Step 4: Select Appointment Slot"}
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                {slots.map((sl) => {
                  const isSelected = selectedSlot === sl;
                  return (
                    <button
                      key={sl}
                      onClick={() => setSelectedSlot(sl)}
                      className={`text-center p-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                          : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {sl}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === "name" && (
            <motion.div
              key="step-name"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="space-y-2"
            >
              <label className="text-[11.5px] font-black text-slate-800 uppercase tracking-wide flex items-center gap-1">
                <User size={13} className="text-[#0266c8]" />
                {language === "te" ? "రోగి పూర్తి పేరు (Patient Name)" : "Step 5: Provide Patient Full Name"}
              </label>
              <div className="bg-white border border-slate-200 p-2.5 rounded-xl space-y-2.5">
                <input
                  type="text"
                  placeholder={language === "te" ? "ఉదా: రాము నాయక్" : "e.g., Jane Cooper"}
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-slate-50 p-2 text-[11px] font-bold border border-slate-200 rounded-lg outline-none focus:border-[#0266c8] transition-colors"
                />
                <p className="text-[9px] text-slate-400 font-medium italic">
                  Ensure the name exactly matches legal photo ID documents for medical registration desk verification.
                </p>
              </div>
            </motion.div>
          )}

          {step === "phone" && (
            <motion.div
              key="step-phone"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="space-y-2"
            >
              <label className="text-[11.5px] font-black text-slate-800 uppercase tracking-wide flex items-center gap-1">
                <Phone size={13} className="text-[#0266c8]" />
                {language === "te" ? "ఫోన్ నెంబర్ (Mobile Number)" : "Step 6: Patient Contact Hotline"}
              </label>
              <div className="bg-white border border-slate-200 p-2.5 rounded-xl space-y-2.5">
                <input
                  type="tel"
                  placeholder="e.g., 8563422000"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, ""))}
                  maxLength={12}
                  className="w-full bg-slate-50 p-2 text-[11px] font-bold border border-slate-200 rounded-lg outline-none focus:border-[#0266c8] transition-colors"
                />
                <p className="text-[9px] text-slate-400 font-medium italic">
                  We will send a bilingual confirmation SMS message to coordinate clinical entrance steps.
                </p>
              </div>
            </motion.div>
          )}

          {step === "confirm" && (
            <motion.div
              key="step-confirm"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="space-y-2.5"
            >
              <label className="text-[11.5px] font-black text-slate-800 uppercase tracking-wide flex items-center gap-1">
                <Activity size={13} className="text-emerald-500" />
                {language === "te" ? "వివరాల నిర్ధారణ (Confirm Details)" : "Step 7: Confirm Booking Schedule"}
              </label>
              <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5 text-[11px]">
                <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Specialty</span>
                    <span className="font-extrabold text-slate-800">{selectedDept}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Physician</span>
                    <span className="font-extrabold text-slate-800">{selectedDoc?.name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Date</span>
                    <span className="font-extrabold text-slate-800">{selectedDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Time Slot</span>
                    <span className="font-extrabold text-slate-800">{selectedSlot}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Patient</span>
                    <span className="font-extrabold text-slate-800">{patientName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Contact</span>
                    <span className="font-extrabold text-[#0266c8]">{patientPhone}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === "completed" && (
            <motion.div
              key="step-complete"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-4 space-y-3"
            >
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-xl">
                <CheckCircle2 size={24} className="animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[13px] font-black text-slate-900 uppercase">
                  {language === "te" ? "వైద్య అపాయింట్‌మెంట్ ఖరారైంది!" : "Clinical Booking Confirmed!"}
                </h4>
                <p className="text-[10.5px] text-slate-500 px-3 font-medium">
                  {language === "te"
                    ? "మీ అపాయింట్‌మెంట్ విజయవంతంగా షెడ్యూల్ చేయబడింది. దయచేసి సమయానికి 15 నిమిషాల ముందే హాజరుకాగలరు."
                    : `Thank you, ${bookedDetails?.patientName}. Your appointment for ${bookedDetails?.department} on ${bookedDetails?.date} at ${bookedDetails?.slot} with ${bookedDetails?.doctorName} is structured.`}
                </p>
              </div>

              <div className="bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-slate-600 font-mono text-[9px] max-w-xs mx-auto text-left leading-normal space-y-0.5">
                <p>📍 **Cooper Plaza Hub**: One Cooper Plaza, Camden</p>
                <p>⏱️ **Check-In Desk**: Please report 15 mins early with Photo ID</p>
                <p>🆔 **Reference ID**: <span className="font-bold text-slate-900">{bookedDetails?.id}</span></p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error alerts */}
      {errorMsg && (
        <p className="text-[10.5px] text-red-600 font-semibold mt-2.5 bg-red-500/10 border border-red-500/25 px-2.5 py-1.5 rounded-lg">
          ⚠️ {errorMsg}
        </p>
      )}

      {/* Control Navigation Action Bar */}
      {step !== "completed" && (
        <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-200/60 mt-3 bg-white/40 rounded-b-xl -mx-3 -mb-3 p-3">
          {step !== "department" ? (
            <button
              onClick={handleBack}
              disabled={isBooking}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-[10.5px] font-extrabold flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-all font-mono"
            >
              <ChevronLeft size={11} /> {language === "te" ? "వెనుకకు" : "Back"}
            </button>
          ) : (
            <span className="text-[9.5px] text-slate-400 font-semibold italic">Cooper Care Assist</span>
          )}

          {step === "confirm" ? (
            <button
              onClick={handleBookingConfirm}
              disabled={isBooking}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg text-[10.5px] flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-50 transition-all"
            >
              {isBooking ? (
                <>
                  <div className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin" />
                  {language === "te" ? "షెడ్యూల్ చేస్తోంది..." : "Confirming Visit..."}
                </>
              ) : (
                <>
                  <Sparkles size={11} /> {language === "te" ? "కన్ఫర్మ్ చేయండి" : "Secure Appointment"}
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-[#0266c8] hover:bg-blue-600 text-white font-extrabold rounded-lg text-[10.5px] flex items-center gap-1 shadow-sm cursor-pointer transition-all"
            >
              {language === "te" ? "తరువాతి స్టెప్" : "Continue"} <ChevronRight size={11} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
