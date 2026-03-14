import React from "react";
import { X, Plus, Save, Link, ExternalLink } from "lucide-react";

export const ItemModal = ({
  mode,
  item,
  setItem,
  categories,
  monthError,
  onSave,
  onClose
}) => {

  if (!item) return null;

  const isEdit = mode === "edit";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e)=>e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
      >

        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="font-bold text-lg">
            {isEdit ? "Edycja wpisu" : "Dodaj wpis"}
          </h3>

          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full">
            <X size={20}/>
          </button>
        </div>

        <div
		  className="space-y-3"
		  onKeyDown={(e)=>{
			if(e.key==="Enter") onSave();
		  }}
		>

          <select
            className="w-full p-2.5 rounded-lg border"
            value={item.category}
            onChange={(e)=>setItem({...item,category:e.target.value})}
          >
            <option value="">Wybierz kategorię...</option>
            {categories.map(cat=>(
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <input
            placeholder="Opis"
            className="w-full p-2.5 rounded-lg border"
            value={item.description}
            onChange={(e)=>setItem({...item,description:e.target.value})}
          />

          {/* LINK FIELD */}
          <div className="flex items-center gap-2">

            <div className="relative flex-1">
              <Link
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="url"
                placeholder="https://link-do-dokumentu.pl"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border"
                value={item.link || ""}
                onChange={(e)=>setItem({...item,link:e.target.value})}
              />
            </div>

            {item.link && (
              <button
                onClick={()=>{
                  const url = item.link.startsWith("http")
                    ? item.link
                    : `https://${item.link}`;

                  window.open(url,"_blank");
                }}
                className="p-2 rounded-lg border hover:bg-slate-100 text-slate-500"
                title="Otwórz link"
              >
                <ExternalLink size={16}/>
              </button>
            )}

          </div>

          <div className="grid grid-cols-2 gap-2">

            <div className="bg-emerald-50 p-3 rounded-xl border">

              <label className="text-[10px] font-bold text-emerald-600 uppercase">
                Przychód plan
              </label>

              <input
                type="number"
                className="w-full p-2 rounded border"
                value={item.incomePlanned}
                onChange={(e)=>setItem({...item,incomePlanned:e.target.value})}
              />

              <label className="text-[10px] font-bold text-emerald-600 uppercase mt-2 block">
                Przychód real
              </label>

              <input
                type="number"
                className="w-full p-2 rounded border"
                value={item.incomeReal}
                onChange={(e)=>setItem({...item,incomeReal:e.target.value})}
              />

            </div>

            <div className="bg-red-50 p-3 rounded-xl border">

              <label className="text-[10px] font-bold text-red-600 uppercase">
                Koszt plan
              </label>

              <input
                type="number"
                className="w-full p-2 rounded border"
                value={item.expensePlanned}
                onChange={(e)=>setItem({...item,expensePlanned:e.target.value})}
              />

              <label className="text-[10px] font-bold text-red-600 uppercase mt-2 block">
                Koszt real
              </label>

              <input
                type="number"
                className="w-full p-2 rounded border"
                value={item.expenseReal}
                onChange={(e)=>setItem({...item,expenseReal:e.target.value})}
              />

            </div>

          </div>

<label className="flex items-center gap-2 text-sm font-semibold">
  <input
    type="checkbox"
    checked={item.gantt}
    onChange={(e)=>setItem({...item,gantt:e.target.checked})}
  />
  Uwzględnij w diagramie Gantta
</label>

{item.gantt && (
  <div className="grid grid-cols-2 gap-4 border-t pt-4">

    <div className="bg-indigo-50 p-3 rounded-xl border">

      <label className="text-[10px] font-bold text-indigo-600 uppercase">
        Start plan
      </label>

      <input
        type="date"
        className="w-full p-2 border rounded"
        value={item.startPlanned}
        onChange={(e)=>setItem({...item,startPlanned:e.target.value})}
      />

      <label className="text-[10px] font-bold text-indigo-600 uppercase mt-2 block">
        Koniec plan
      </label>

      <input
        type="date"
        className="w-full p-2 border rounded"
        value={item.endPlanned}
        onChange={(e)=>setItem({...item,endPlanned:e.target.value})}
      />

    </div>


    <div className="bg-emerald-50 p-3 rounded-xl border">

      <label className="text-[10px] font-bold text-emerald-600 uppercase">
        Start real
      </label>

      <input
        type="date"
        className="w-full p-2 border rounded"
        value={item.startReal}
        onChange={(e)=>setItem({...item,startReal:e.target.value})}
      />

      <label className="text-[10px] font-bold text-emerald-600 uppercase mt-2 block">
        Koniec real
      </label>

      <input
        type="date"
        className="w-full p-2 border rounded"
        value={item.endReal}
        onChange={(e)=>setItem({...item,endReal:e.target.value})}
      />

    </div>

  </div>
)}

{item.gantt && (
  <div>

    <label className="text-xs font-semibold text-slate-500">
      Liczba osób realizujących
    </label>

    <input
      type="number"
      min="1"
      className="w-full p-2 border rounded"
      value={item.teamSize}
      onChange={(e)=>setItem({...item,teamSize:e.target.value})}
    />

  </div>
)}

          <select
            className="w-full p-2.5 rounded-lg border"
            value={item.status}
            onChange={(e)=>setItem({...item,status:e.target.value})}
          >
            <option value="planowane">Planowane</option>
            <option value="zrealizowane">Zrealizowane</option>
          </select>

          {monthError && (
            <div className="text-red-500 text-sm">{monthError}</div>
          )}

          <button
            onClick={onSave}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            {isEdit ? <Save size={18}/> : <Plus size={18}/>}
            {isEdit ? "Zapisz zmiany" : "Dodaj wpis"}
          </button>

        </div>
      </div>
    </div>
  );
};