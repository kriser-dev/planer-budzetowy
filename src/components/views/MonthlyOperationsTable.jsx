import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Pencil, 
  Trash2,
  List,
  Download
} from 'lucide-react';
import { InfoIcon } from "../../components/ui/UIComponents";

export const MonthlyOperationsTable = ({ 
  filteredItems, 
  statusFilter, 
  setStatusFilter, 
  setEditingItem, 
  deleteMonthItem,
  setConfirmData,
  handleExportCSV,
  months,
  selectedMonth,
  selectedYear
}) => {
  return (
    <section className="bg-white rounded-2xl shadow-sm border overflow-hidden">
      <div className="px-6 py-4 border-b flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
        <div className="flex items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <List size={18} /> Rejestr Operacji
            <InfoIcon text="Pełna lista transakcji w wybranym miesiącu, w tym koszty stałe i zmienne." />
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['all', 'planowane', 'zrealizowane'].map(f => (
              <button 
                key={f} 
                onClick={() => setStatusFilter(f)} 
                className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${statusFilter === f ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                {f === 'all' ? 'Wszystkie' : f === 'planowane' ? 'W trakcie' : 'Zakończone'}
              </button>
            ))}
          </div>
          <button 
            onClick={handleExportCSV} 
            className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors"
          >
            <Download size={14}/> CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto print-container">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 border-b text-slate-400 text-[9px] font-black uppercase tracking-widest">
            <tr>
              <th className="px-4 py-4 no-print">S</th>
              <th className="px-4 py-4">Pozycja</th>
              <th className="px-4 py-4 bg-emerald-50/50 text-emerald-700">Przychód (P)</th>
              <th className="px-4 py-4 bg-emerald-100/50 text-emerald-800">Przychód (R)</th>
              <th className="px-4 py-4 bg-red-50/50 text-red-700">Koszt (P)</th>
              <th className="px-4 py-4 bg-red-100/50 text-red-800">Koszt (R)</th>
              <th className="px-4 py-4 text-right no-print">Opcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item, idx) => (
              <tr key={item.id || idx} className={`group ${item.isFixed ? 'bg-indigo-50/20' : 'hover:bg-slate-50'}`}>
                <td className="px-4 py-4 no-print">
                  {item.status === 'zrealizowane' ? 
                    <CheckCircle2 size={16} className="text-emerald-500"/> : 
                    <Clock size={16} className="text-amber-500"/>
                  }
                </td>
<td className="px-4 py-4">
  <div className="font-semibold text-slate-800 truncate max-w-[200px]">
    {item.description}
  </div>

  <div className="flex items-center gap-2 mt-1">
    <span className="text-[10px] text-slate-400 uppercase tracking-wide">
      {item.category}
    </span>

    {item.link && (
      <a 
        href={item.link.startsWith('http') ? item.link : `https://${item.link}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-indigo-400 hover:text-indigo-600 no-print"
      >
        <ExternalLink size={12} />
      </a>
    )}
  </div>
</td>

                <td className="px-4 py-4 text-slate-400 font-mono">{(item.incomePlanned || 0).toLocaleString()} zł</td>
                <td className="px-4 py-4 font-mono font-bold text-emerald-600 bg-emerald-50/20">{(item.incomeReal || 0).toLocaleString()} zł</td>
                <td className="px-4 py-4 text-slate-400 font-mono">{(item.expensePlanned || 0).toLocaleString()} zł</td>
                <td className="px-4 py-4 font-mono font-bold text-red-500 bg-red-50/20">{(item.expenseReal || 0).toLocaleString()} zł</td>
                <td className="px-4 py-4 text-right no-print">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setEditingItem(item)} className="p-2 text-slate-300 hover:text-indigo-600">
                      <Pencil size={14}/>
                    </button>
<button
  onClick={()=>{
    setConfirmData({
      title:"Usuń wpis",
      message:"Czy na pewno chcesz usunąć ten wpis?",
      action:()=>deleteMonthItem(item)
    });
  }}
  className="p-2 text-slate-300 hover:text-red-500"
>
  <Trash2 size={14}/>
</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
