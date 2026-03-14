import { useState } from "react";
import { X, ArrowRight } from "lucide-react";

export const CategoryMigrationModal = ({
  oldCategory,
  categories,
  onMigrate,
  onCancel
}) => {

  const [target,setTarget] = useState("");

  const available = categories.filter(c => c !== oldCategory);

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e)=>e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6"
      >

        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">
            Migracja operacji
          </h3>

          <button onClick={onCancel}>
            <X size={18}/>
          </button>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          Przenieś operacje z kategorii:
        </p>

        <div className="font-bold text-indigo-600 mb-4">
          {oldCategory}
        </div>

        <select
          className="w-full p-2 border rounded-lg mb-6"
          value={target}
          onChange={(e)=>setTarget(e.target.value)}
        >
          <option value="">Wybierz kategorię...</option>

          {available.map(cat=>(
            <option key={cat} value={cat}>{cat}</option>
          ))}

        </select>

        <div className="flex justify-end gap-3">

          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg"
          >
            Anuluj
          </button>

          <button
            disabled={!target}
            onClick={()=>onMigrate(target)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <ArrowRight size={16}/>
            Migruj
          </button>

        </div>

      </div>
    </div>
  );
};