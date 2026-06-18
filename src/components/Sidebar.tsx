import React from "react";
import { Phone, MapPin, Building, ShieldCheck, ExternalLink, Calendar, Heart } from "lucide-react";

interface SidebarProps {
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  return (
    <div className="w-full h-full bg-slate-900 text-slate-100 flex flex-col border-r border-white/10 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#0266c8] flex items-center justify-center text-white shrink-0 font-bold text-sm shadow-md">
          CUH
        </div>
        <div>
          <h2 className="text-xs font-black tracking-wider uppercase text-white leading-tight">
            Cooper University
          </h2>
          <span className="text-[9.5px] font-mono text-slate-400 block -mt-0.5 font-bold uppercase tracking-widest text-[#0266c8]">
            Health Care
          </span>
        </div>
      </div>

      {/* Directory lists */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 scrollbar-thin">
        {/* Support contacts */}
        <div className="space-y-2">
          <span className="text-[9.5px] font-mono tracking-widest text-[#0266c8] font-bold block uppercase px-1">
            Emergency Hotlines
          </span>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2.5">
            <a href="tel:911" className="flex items-center justify-between text-xs font-bold hover:text-red-400 transition-colors">
              <span className="text-slate-200">Critical Emergency</span>
              <span className="text-red-500 font-mono">911</span>
            </a>
            <hr className="border-white/5" />
            <a href="tel:1-800-826-6737" className="flex items-center justify-between text-xs hover:text-blue-400 transition-colors">
              <span className="text-slate-300">Cooper Scheduling</span>
              <span className="text-slate-400 font-mono text-[11px] font-semibold">1-800-8-COOPER</span>
            </a>
            <hr className="border-white/5" />
            <a href="tel:856-342-2000" className="flex items-center justify-between text-xs hover:text-blue-400 transition-colors">
              <span className="text-slate-300">Main Switchboard</span>
              <span className="text-slate-400 font-mono text-[11px] font-semibold">856.342.2000</span>
            </a>
          </div>
        </div>

        {/* Clinical Centers */}
        <div className="space-y-2">
          <span className="text-[9.5px] font-mono tracking-widest text-[#0266c8] font-bold block uppercase px-1">
            Clinical Hubs
          </span>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs space-y-2.5">
            <div className="flex items-start gap-2">
              <Building size={12} className="text-blue-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-200">MD Anderson Cancer Center</h4>
                <p className="text-[10px] text-slate-400">Cooper Specialized Oncology Hub</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Building size={12} className="text-blue-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-200">Cooper Medical School</h4>
                <p className="text-[10px] text-slate-400">CMSRU Clinical Academic Facility</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Heart size={12} className="text-blue-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-200">Cooper Neurological Institute</h4>
                <p className="text-[10px] text-slate-400">Neuroscience, Brain, & Spine Care</p>
              </div>
            </div>
          </div>
        </div>

        {/* Physical Coordinates */}
        <div className="space-y-2">
          <span className="text-[9.5px] font-mono tracking-widest text-[#0266c8] font-bold block uppercase px-1">
            Camden Campus Coordinates
          </span>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs space-y-1">
            <div className="flex gap-2">
              <MapPin size={12} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-300 leading-normal">
                Cooper University Hospital<br />
                One Cooper Plaza<br />
                Camden, NJ 08103
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="p-3 bg-white/5 border-t border-white/10 text-center flex items-center justify-center gap-1.5 shrink-0">
        <ShieldCheck size={12} className="text-[#0266c8]" />
        <span className="text-[10px] font-mono text-slate-400 font-bold">
          COOPER SECURE LINK v1.0
        </span>
      </div>
    </div>
  );
};
