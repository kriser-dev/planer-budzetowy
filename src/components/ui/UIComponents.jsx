import React, { useState } from 'react';
import { Info } from 'lucide-react';

export const Tooltip = ({ children, text }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex items-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded shadow-xl whitespace-nowrap z-[100] animate-in fade-in zoom-in-95 font-medium">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
        </div>
      )}
    </div>
  );
};

export const InfoIcon = ({ text }) => (
  <Tooltip text={text}>
    <Info size={14} className="text-slate-300 hover:text-indigo-500 cursor-help transition-colors ml-1.5" />
  </Tooltip>
);
