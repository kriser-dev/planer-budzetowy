import React from 'react';
import { 
  Printer, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart3, 
  TrendingUp 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';
import { InfoIcon } from "../../components/ui/UIComponents";

export const YearlyView = ({ 
  selectedYear, 
  yearlyStats, 
  quarters, 
  calculateQuarterStats, 
  yearlyChartData, 
  handlePrint 
}) => {
  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          Podsumowanie Roku {selectedYear}
          <InfoIcon text="Kompleksowy widok rentowności Twojej firmy w przekroju całego roku z podziałem na kwartały." />
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={handlePrint} 
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md transition-colors hover:bg-indigo-700"
          >
            <Printer size={16} /> Pobierz PDF
          </button>
        </div>
      </div>

      {/* Sekcja: Kwoty Roczne */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-[10px] font-black text-emerald-600 uppercase mb-1 flex items-center gap-1">
            <ArrowUpRight size={14}/> Przychody Roczne
          </p>
          <div className="space-y-1">
            <p className="text-2xl font-black">{yearlyStats.przychodyReal.toLocaleString()} zł</p>
            <p className="text-xs text-slate-400 font-mono">Cel: {yearlyStats.przychodyPlan.toLocaleString()} zł</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-[10px] font-black text-red-500 uppercase mb-1 flex items-center gap-1">
            <ArrowDownRight size={14}/> Koszty Roczne
          </p>
          <div className="space-y-1">
            <p className="text-2xl font-black">{yearlyStats.kosztyReal.toLocaleString()} zł</p>
            <p className="text-xs text-slate-400 font-mono">Plan: {yearlyStats.kosztyPlan.toLocaleString()} zł</p>
          </div>
        </div>
        <div className="bg-indigo-600 p-6 rounded-2xl border border-indigo-500 shadow-sm text-white">
          <p className="text-[10px] font-black text-indigo-200 uppercase mb-1">Zysk (Realny)</p>
          <div className="space-y-1">
            <p className="text-2xl font-black">{yearlyStats.wynikReal.toLocaleString()} zł</p>
            <p className="text-xs text-indigo-300 font-mono">
              Śr. m-c: {(yearlyStats.wynikReal / 12).toFixed(0).toLocaleString()} zł
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm border-indigo-100">
          <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Zysk (Planowany)</p>
          <div className="space-y-1">
            <p className="text-2xl font-black text-slate-800">{yearlyStats.wynikPlan.toLocaleString()} zł</p>
            <p className="text-xs text-slate-400 font-mono">
              Realizacja: {((yearlyStats.wynikReal / (yearlyStats.wynikPlan || 1)) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Sekcja: Zestawienie Kwartalne */}
      <section className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 size={18} className="text-indigo-600" /> Dane Kwartalne
            <InfoIcon text="Podsumowanie finansowe podzielone na cztery kwartały roku." />
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-widest">
              <tr>
                <th className="px-6 py-4">Kwartał</th>
                <th className="px-6 py-4">Przychody (P)</th>
                <th className="px-6 py-4">Przychody (R)</th>
                <th className="px-6 py-4">Koszty (P)</th>
                <th className="px-6 py-4">Koszty (R)</th>
                <th className="px-6 py-4 text-right">Zysk (R)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quarters.map((q, idx) => {
                const qs = calculateQuarterStats(idx, selectedYear);
                return (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{q.label}</td>
                    <td className="px-6 py-4 text-slate-400 font-mono">{qs.przychodyPlan.toLocaleString()} zł</td>
                    <td className="px-6 py-4 text-emerald-600 font-bold font-mono">
                      +{qs.przychodyReal.toLocaleString()} zł
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono">{qs.kosztyPlan.toLocaleString()} zł</td>
                    <td className="px-6 py-4 text-red-500 font-bold font-mono">
                      -{qs.kosztyReal.toLocaleString()} zł
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span 
                        className={`inline-block px-3 py-1 rounded-full font-black text-xs ${
                          qs.wynikReal >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {qs.wynikReal.toLocaleString()} zł
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white p-8 rounded-3xl shadow-sm border min-w-0">
        <div className="flex justify-between items-start mb-8">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
            <TrendingUp className="text-indigo-600" /> Analiza Trendu
            <InfoIcon text="Wykres trendu zysku netto oraz przychodów w poszczególnych miesiącach." />
          </h3>
        </div>
        <div className="h-80 w-full min-w-0">
          <ResponsiveContainer width="99%" height={320}>
            <LineChart data={yearlyChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Line 
                type="monotone" 
                dataKey="Zysk" 
                stroke="#4f46e5" 
                strokeWidth={4} 
                dot={{ r: 6, fill: '#4f46e5', stroke: '#fff' }} 
              />
              <Line 
                type="monotone" 
                dataKey="Przychody" 
                stroke="#10b981" 
                strokeWidth={2} 
                dot={false} 
                strokeDasharray="5 5" 
              />
              <Line 
                type="monotone" 
                dataKey="Koszty" 
                stroke="#ef4444" 
                strokeWidth={2} 
                dot={false} 
                strokeDasharray="5 5" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};
