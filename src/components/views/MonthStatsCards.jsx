import React from 'react';
import { Wallet, Target, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { InfoIcon } from "../../components/ui/UIComponents";

export const MonthStatsCards = ({ monthStats }) => {
  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest border-b border-emerald-100 pb-1">
          <Wallet size={14} /> Realizacja (Faktyczne)
          <InfoIcon text="Podsumowanie rzeczywiście otrzymanych wpłat i poniesionych kosztów." />
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
          <p className="text-[10px] text-emerald-600 font-black uppercase flex items-center gap-1">
            <ArrowUpRight size={12}/> Przychody
          </p>
          <p className="text-2xl font-black text-emerald-600 mt-1">+{monthStats.przychodyReal.toLocaleString()} zł</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
          <p className="text-[10px] text-red-600 font-black uppercase flex items-center gap-1">
            <ArrowDownRight size={12}/> Koszty
          </p>
          <p className="text-2xl font-black text-red-600 mt-1">-{monthStats.kosztyReal.toLocaleString()} zł</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 rounded-xl text-white border-2 border-white shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black uppercase text-indigo-100">Wynik</p>
              <p className={`text-3xl font-black mt-1 ${monthStats.wynikReal < 0 ? 'text-red-200' : ''}`}>{monthStats.wynikReal.toLocaleString()} zł</p>
            </div>
            <TrendingUp size={32} className="text-indigo-200" />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest border-b border-indigo-100 pb-1">
          <Target size={14} /> Planowane
          <InfoIcon text="Twoje założenia budżetowe na dany miesiąc." />
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border">
          <p className="text-[10px] text-slate-400 font-black uppercase">Przychody</p>
          <p className="text-xl font-mono text-slate-600 mt-1">+{monthStats.przychodyPlan.toLocaleString()} zł</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border">
          <p className="text-[10px] text-slate-400 font-black uppercase">Koszty</p>
          <p className="text-xl font-mono text-slate-600 mt-1">-{monthStats.kosztyPlan.toLocaleString()} zł</p>
        </div>
        <div className="bg-white p-4 rounded-xl border-2 border-indigo-200">
          <p className="text-[10px] text-indigo-400 font-black uppercase">Wynik (Plan)</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{monthStats.wynikPlan.toLocaleString()} zł</p>
        </div>
      </div>
    </>
  );
};
