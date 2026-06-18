import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface FloatingButtonProps {
  isOpen: boolean;
  onClick: () => void;
  showBadge?: boolean;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({ isOpen, onClick, showBadge = true }) => {
  const [badgeDismissed, setBadgeDismissed] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {showBadge && !isOpen && !badgeDismissed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute bottom-16 right-0 bg-[#00bda5] text-white text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase px-4.5 py-3 rounded-full shadow-2xl border border-teal-300/20 whitespace-nowrap mb-2 flex items-center gap-2 leading-none font-sans"
          >
            <span>Patient Representative Chat & Call</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setBadgeDismissed(true);
              }}
              className="ml-1 text-white/80 hover:text-white cursor-pointer hover:scale-110 active:scale-95 transition-all text-[12px] font-bold select-none leading-none flex items-center justify-center p-0.5"
            >
              ×
            </button>
            {/* Tooltip triangle tail pointing down to the helper button */}
            <div className="absolute top-full right-6 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#00bda5]"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        id="ava-floating-btn"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl cursor-pointer transition-all relative outline-none border-none bg-transparent"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-white shadow-lg"
            >
              <X size={22} className="shrink-0" strokeWidth={2.5} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-14 h-14 rounded-full p-[3px] bg-gradient-to-tr from-purple-500 via-indigo-400 to-blue-500 shadow-xl relative"
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-800 border-2 border-white transition-all">
                <img 
                  referrerPolicy="no-referrer"
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150" 
                  alt="Patient Representative Avatar" 
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
              {/* Online glowing pulsing indicator */}
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-md">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
