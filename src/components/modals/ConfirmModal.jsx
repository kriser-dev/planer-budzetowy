import { X, Trash2 } from "lucide-react";

export const ConfirmModal = ({
  title,
  message,
  type = "confirm",   // confirm | info
  onConfirm,
  onCancel,
  extraAction
}) => {

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
          <h3 className="font-bold text-lg text-slate-800">
            {title}
          </h3>

          <button
            onClick={onCancel}
            className="p-1 hover:bg-slate-100 rounded-full"
          >
            <X size={18}/>
          </button>
        </div>

        <p className="text-sm text-slate-500 mb-6">
          {message}
        </p>

<div className="flex justify-end gap-3">

  {type === "confirm" ? (
    <>
      <button
        onClick={onCancel}
        className="px-4 py-2 rounded-lg border hover:bg-slate-100 text-sm"
      >
        Anuluj
      </button>

      {extraAction && (
        <button
          onClick={()=>{
			//setTimeout(()=>extraAction.action(),0);
            extraAction.action();
            onCancel();
          }}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700"
        >
          {extraAction.label}
        </button>
      )}

      <button
        onClick={()=>{
          onConfirm();
          onCancel();
        }}
        className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-bold flex items-center gap-2 hover:bg-red-700"
      >
        <Trash2 size={16}/>
        Usuń
      </button>
    </>
  ) : (
    <>
      {extraAction && (
        <button
          onClick={()=>{
            extraAction.action();
            onCancel();
          }}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700"
        >
          {extraAction.label}
        </button>
      )}

      <button
        onClick={onCancel}
        className="px-6 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700"
      >
        OK
      </button>
    </>
  )}

</div>

      </div>
    </div>
  );
};