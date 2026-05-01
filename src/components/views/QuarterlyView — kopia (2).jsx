import React from 'react';
import { Printer, PieChart } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';
import { InfoIcon } from "../../components/ui/UIComponents";

export const QuarterlyView = ({ 
  quarters, 
  currentQuarterIdx, 
  selectedYear, 
  months, 
  calculateStats, 
  handlePrint 
}) => {

  // Obliczenie sumarycznych statystyk dla całego kwartału
  const quarterSummary = quarters[currentQuarterIdx].months.reduce((acc, mIdx) => {
    const s = calculateStats(mIdx, selectedYear);
    return {
      przychodyReal: acc.przychodyReal + (s.przychodyReal || 0),
      przychodyPlan: acc.przychodyPlan + (s.przychodyPlan || 0),
      kosztyReal: acc.kosztyReal + (s.kosztyReal || 0),
      kosztyPlan: acc.kosztyPlan + (s.kosztyPlan || 0),
      wynikReal: acc.wynikReal + (s.wynikReal || 0)
    };
  }, {
    przychodyReal: 0,
    przychodyPlan: 0,
    kosztyReal: 0,
    kosztyPlan: 0,
    wynikReal: 0
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          {quarters[currentQuarterIdx].label} {selectedYear}
          <InfoIcon text="Zbiorcze zestawienie wyników dla bieżącego kwartału z podziałem na plan i realizację." />
        </h2>
        <button 
          onClick={handlePrint} 
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md transition-colors hover:bg-indigo-700"
        >
          <Printer size={16} /> Pobierz PDF
        </button>
      </div>
      
      {/* Zestawienie poszczególnych miesięcy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quarters[currentQuarterIdx].months.map((mIdx) => {
          const s = calculateStats(mIdx, selectedYear);
          return (
            <div key={mIdx} className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
              <h4 className="font-bold text-slate-400 uppercase text-[10px] mb-2 tracking-widest border-b pb-2">
                {months[mIdx]}
              </h4>
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">Przychody</span>
                    <span className="text-[9px] text-emerald-600/60 font-medium">REAL vs PLAN</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-black text-emerald-600">+{s.przychodyReal.toLocaleString()}</span>
                    <span className="text-xs text-emerald-400 font-mono">{s.przychodyPlan.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3 bg-red-50/50 rounded-xl border border-red-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-red-700 uppercase">Koszty</span>
                    <span className="text-[9px] text-red-600/60 font-medium">REAL vs PLAN</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-black text-red-500">-{s.kosztyReal.toLocaleString()}</span>
                    <span className="text-xs text-red-400 font-mono">{s.kosztyPlan.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <span className="font-bold uppercase text-[9px] text-slate-400">Zysk</span>
                  <span className={`text-xl font-black ${s.wynikReal >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                    {s.wynikReal.toLocaleString()} zł
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* NOWA SEKCJA: Podsumowanie całego kwartału */}
      <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm space-y-4">
        <h4 className="font-bold text-indigo-500 uppercase text-[11px] mb-2 tracking-widest border-b pb-2">
          Podsumowanie: {quarters[currentQuarterIdx].label}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Przychody Całkowite</span>
              <span className="text-[9px] text-emerald-600/60 font-medium">REAL vs PLAN</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xl font-black text-emerald-600">+{quarterSummary.przychodyReal.toLocaleString()}</span>
              <span className="text-xs text-emerald-400 font-mono">{quarterSummary.przychodyPlan.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 bg-red-50/50 rounded-xl border border-red-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-red-700 uppercase">Koszty Całkowite</span>
              <span className="text-[9px] text-red-600/60 font-medium">REAL vs PLAN</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xl font-black text-red-500">-{quarterSummary.kosztyReal.toLocaleString()}</span>
              <span className="text-xs text-red-400 font-mono">{quarterSummary.kosztyPlan.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
             <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-slate-600 uppercase">Zysk Całkowity</span>
            </div>
            <div className="flex justify-end items-baseline mt-1">
              <span className={`text-2xl font-black ${quarterSummary.wynikReal >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                {quarterSummary.wynikReal.toLocaleString()} zł
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sekcja wykresu */}
      <section className="bg-white p-8 rounded-3xl border shadow-sm min-w-0">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-600">
            <PieChart size={20}/> Rentowność Kwartału
            <InfoIcon text="Graficzne przedstawienie relacji przychodów do kosztów w skali kwartału." />
          </h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Przychody Real</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Koszty Real</span>
            </div>
          </div>
        </div>
        <div className="h-64 w-full min-w-0">
          <ResponsiveContainer width="99%" height={250}>
            <AreaChart data={quarters[currentQuarterIdx].months.map(mIdx => ({
              name: months[mIdx],
              Przychody: calculateStats(mIdx, selectedYear).przychodyReal,
              Koszty: calculateStats(mIdx, selectedYear).kosztyReal
            }))}>
              <defs>
                <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorK" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Area type="monotone" dataKey="Przychody" stroke="#10b981" fill="url(#colorP)" strokeWidth={2} />
              <Area type="monotone" dataKey="Koszty" stroke="#ef4444" fill="url(#colorK)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};