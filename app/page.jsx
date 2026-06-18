"use client";

import React, { useState } from "react";
import VoiceAssistant from "../components/VoiceAssistant";
import { 
  ShieldCheck, 
  Heart, 
  Activity, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  ChevronRight, 
  Sparkles, 
  CheckCircle, 
  PhoneCall,
  Search,
  BookOpen,
  Mail,
  Linkedin,
  Facebook,
  Twitter
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("all");

  const hospitalStats = [
    { title: "Specialist Doctors", value: "240+", desc: "Board-certified experts" },
    { title: "Patient Satisfaction", value: "99.4%", desc: "Highly rated in feedback" },
    { title: "Years of Care", value: "115+", desc: "Historical trust & service" },
    { title: "Clinic Locations", value: "12+", desc: "Accessible branches near you" }
  ];

  const coreServices = [
    {
      title: "Cardiology",
      desc: "Advanced bypass, valve surgery, rhythm care and hypertension management.",
      timings: "Mon - Sat: 8:00 AM - 6:00 PM"
    },
    {
      title: "Orthopedics & Spine",
      desc: "Comprehensive hip replacement, knee rehabilitation, and joint pain therapies.",
      timings: "Mon - Fri: 9:00 AM - 5:00 PM"
    },
    {
      title: "Pediatrics Nursing",
      desc: "Trusted neonatology care, primary milestones monitoring and pediatric emergency.",
      timings: "24/7 Support Active"
    },
    {
      title: "Gastroenterology",
      desc: "Modern endoscopy, digestion diagnostics and specialized liver treatments.",
      timings: "Mon - Sat: 10:00 AM - 4:00 PM"
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white" id="cooper-next-page">
      {/* Top Professional Header Bar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40" id="page-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Activity className="w-5.5 h-4.5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block leading-tight">
                University Care
              </span>
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">
                Cooper Hospital
              </h1>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#services" className="hover:text-blue-600 transition-colors">Our Services</a>
            <a href="#about" className="hover:text-blue-600 transition-colors">Why Cooper</a>
            <a href="#ava-intelligence" className="hover:text-blue-600 transition-colors flex items-center gap-1.5 text-blue-600">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Meet Ava AI</span>
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="bg-blue-50 text-blue-600 font-bold px-4 py-2 rounded-xl text-xs hover:bg-blue-100 transition-colors"
            >
              Patient Portal
            </button>
            <a
              href="#telephony"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4.5 py-2.5 rounded-xl text-xs transition-colors py-2 flex items-center gap-2 shadow-md shadow-blue-600/10"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Showcase with Ava AI Callout */}
      <section className="bg-gradient-to-b from-blue-50/70 via-white to-slate-50/30 pt-12 pb-20 px-4 md:px-8 border-b border-slate-100/60" id="hero-showcase">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-blue-100/50 border border-blue-200/50 text-blue-700 font-bold px-3 py-1.5 rounded-full text-xs">
              <ShieldCheck className="w-4 h-4 text-blue-600 animate-pulse" />
              <span>Joint Commission Accredited Medical Hospital</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Clinical Expertise. <span className="text-blue-600">Compassionate Care.</span> Trusted Outcomes.
            </h2>

            <p className="text-md text-slate-500 leading-relaxed max-w-xl font-medium">
              Cooper University Hospital offers comprehensive clinical, emergency, and primary family healthcare services globally. Our facilities combine state-of-the-art medical technology with patient-centric service workflows.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <a 
                href="#services" 
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Explore Departments</span>
                <ChevronRight className="w-4 h-4" />
              </a>

              <a 
                href="#ava-intelligence" 
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Talk to Ava, AI Assistant</span>
              </a>
            </div>

            {/* Quick check indicators */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4">
              {[
                "24/7 Urgent Care Help",
                "Advanced Lab Diagnostics",
                "Languages: English & తెలుగు"
              ].map((txt, index) => (
                <div key={index} className="flex items-center gap-2 text-slate-600 text-xs font-semibold">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{txt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Hero Interactive Callout Column */}
          <div className="lg:col-span-5" id="ava-intelligence">
            <div className="bg-white rounded-3xl p-6.5 shadow-2xl border border-slate-100 relative overflow-hidden text-left space-y-6">
              {/* Radial gradient glow background */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-blue-100/40 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center justify-between">
                <span className="bg-blue-100 text-blue-700 font-bold uppercase text-[9px] tracking-widest px-2.5 py-1 rounded-full">
                  Meet Your AI Assistant
                </span>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-200/30">
                    <Sparkles className="w-5 h-5 text-blue-600 animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-none">Ava Voice Concierge</h3>
                    <p className="text-[11px] text-slate-400 font-bold">Bilingual Patient Support Specialist</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed pt-2">
                  Ava is our advanced hospital voice assistant running live on Gemini 2.5 Flash. She assists you hands-free in scheduling doctor visits, routing clinical emergencies, examining symptoms, and translating medical directions.
                </p>
              </div>

              {/* Languages Supported */}
              <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 space-y-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wide">English & తెలుగు Supported Seamlessly</h4>
                <div className="flex gap-2.5">
                  <div className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] font-bold text-slate-400 block">Patient Response</span>
                    <span className="text-xs font-black text-slate-800">"Who is online today?"</span>
                  </div>
                  <div className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] font-bold text-slate-400 block">రోగి ప్రతిస్పందన</span>
                    <span className="text-xs font-black text-slate-800">"అపాయింట్‌మెంట్ ఎలా?"</span>
                  </div>
                </div>
              </div>

              {/* Call-to-action button to trigger the Ava Assistant floating drawer/modal */}
              <button
                type="button"
                onClick={() => {
                  const floatingBtn = document.getElementById("ava-floating-btn");
                  if (floatingBtn) {
                    floatingBtn.click();
                  } else {
                    alert("Click the blue widget button at the bottom right corner of your webpage to initiate your live voices conversation with Ava.");
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-4 rounded-xl text-xs transition-all shadow-lg hover:shadow-blue-600/25 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                <span>Launch Voice Assistant Now</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Hospital Metrics Dashboard Stats */}
      <section className="py-12 bg-white border-b border-slate-100" id="metrics-dashboard">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {hospitalStats.map((stat, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 text-left space-y-1">
                <span className="text-3xl font-black text-blue-600 block tracking-tight">
                  {stat.value}
                </span>
                <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                  {stat.title}
                </h5>
                <p className="text-[11px] text-slate-400 font-medium">
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clinical Departments & Scheduled Timings */}
      <section className="py-16 bg-slate-50" id="services">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-10">
          <div className="text-left space-y-2 max-w-2xl">
            <span className="text-blue-600 text-xs font-bold uppercase tracking-wider block">
              Core Specialties
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Medical Specialties & Departments
            </h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              We offer board-certified physician consultation across major therapeutic clinical divisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreServices.map((service, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between h-48 group hover:border-blue-500/20"
              >
                <div className="space-y-2">
                  <h4 className="text-md font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </h4>
                  <p className="text-[11.5px] text-slate-400 leading-relaxed font-semibold">
                    {service.desc}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-50 text-[10px] font-bold text-slate-800">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>{service.timings}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-4 md:px-8 border-t border-slate-900 text-sm font-medium">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-left">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-md font-black text-white">Cooper Hospital</h4>
            </div>
            <p className="text-xs text-slate-500 leading-normal">
              Trustworthy medical care, emergency response and doctor scheduling for your family wellness since 1911.
            </p>
          </div>

          <div className="space-y-3.5">
            <h5 className="text-[11px] font-black uppercase text-slate-200 tracking-wider">Clinical Branches</h5>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" /> Cooper Plaza Main, Camden, NJ</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" /> Haddonfield Primary Care Office</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" /> Cherry Hill Pediatric Wellness Center</li>
            </ul>
          </div>

          <div className="space-y-3.5">
            <h5 className="text-[11px] font-black uppercase text-slate-200 tracking-wider">Connect Out Loud</h5>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500 hover:text-white transition-all"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500 hover:text-white transition-all"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500 hover:text-white transition-all"><Linkedin className="w-4 h-4" /></a>
            </div>
            <div className="text-[10px] text-slate-500 leading-relaxed font-bold">
              Call us directly at <strong>(856) 342-2000</strong>
            </div>
          </div>

          <div className="space-y-3.5">
            <h5 className="text-[11px] font-black uppercase text-slate-200 tracking-wider">Clinical Accreditation</h5>
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl block text-slate-400">
              <span className="text-[9.5px] font-black uppercase tracking-wider text-rose-500 block">Emergency response callout</span>
              <p className="text-[9.5px] text-slate-500 leading-normal pt-1 font-semibold">
                If you are undergoing severe medical shock, heart pressure, or pediatric urgency, report to nearby clinical centers or dial 911 immediately.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-900/80 flex flex-wrap justify-between items-center text-xs text-slate-500">
          <p>© 2026 Cooper University Hospital. All rights registered globally.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-slate-300">Privacy Information</a>
            <a href="#" className="hover:text-slate-300">Nondiscrimination Statement</a>
          </div>
        </div>
      </footer>

      {/* Production-Ready Floating Voice Assistant Widget mounting here */}
      <VoiceAssistant />
    </main>
  );
}
