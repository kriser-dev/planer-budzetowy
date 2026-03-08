export default function AppLogo({ center = false }) {

  return (
    <div className={center ? "text-center mb-8" : ""}>
      <h1 className="text-3xl font-black text-slate-800 tracking-tighter">
        PLANER <span className="text-indigo-600">360°</span>
      </h1>

      <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">
        Budżet & Analiza Danych
      </p>
    </div>
  );

}