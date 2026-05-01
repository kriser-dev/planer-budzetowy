import React from 'react';
import { Settings, List, Plus, Trash2, AlertCircle } from 'lucide-react';
import { InfoIcon } from "../../components/ui/UIComponents";
import OrganizationUsers from "../../components/organization/OrganizationUsers";
import InvitesPanel from "../../components/organization/InvitesPanel";
import { APP_INFO } from "../../utils/appInfo";

export const SettingsView = ({
  role,
  categories,
  newCategoryName,
  setNewCategoryName,
  categoryError,
  addCategory,
  setCategories,
  fixedCostsRegistry,
  newFixedCost,
  setNewFixedCost,
  fixedCostError,
  addFixedCost,
  setFixedCostsRegistry,
  inviteEmail,
  setInviteEmail,
  inviteError,
  inviteUser,
  user,
  orgName,
  changePassword,
  data,
  setConfirmData,
  setCategoryMigration,
  setOrgName,
  updateOrganizationName
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
      <section className="bg-white p-8 rounded-2xl shadow-sm border">
        <div className="flex items-center mb-6">
          <h2 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <Settings size={20}/> Koszty stałe
            <InfoIcon text="Definiuj wydatki powtarzające się co miesiąc, jak czynsz czy subskrypcje." />
          </h2>
        </div>
        <div className="space-y-3">
          <select 
            className="w-full p-2.5 rounded-lg border bg-slate-50 text-sm" 
            value={newFixedCost.category} 
            onChange={e => setNewFixedCost({...newFixedCost, category: e.target.value})}
          >
            <option value="">Wybierz kategorię...</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <input 
            placeholder="Opis (np. Numer faktury, Cel)" 
            className="w-full p-2.5 rounded-lg border text-sm" 
            value={newFixedCost.description} 
            onChange={e => setNewFixedCost({...newFixedCost, description: e.target.value})} 
          />
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="Kwota" 
              className="flex-1 p-2.5 rounded-lg border font-bold text-sm" 
              value={newFixedCost.amount} 
              onChange={e => setNewFixedCost({...newFixedCost, amount: e.target.value})} 
            />
            <button 
              onClick={addFixedCost} 
              className="bg-indigo-600 text-white px-4 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
            >
              <Plus size={20}/>
            </button>
          </div>
          {fixedCostError && (
            <div className="flex items-center gap-2 text-red-500 text-[11px] font-bold animate-pulse">
              <AlertCircle size={14}/> {fixedCostError}
            </div>
          )}
        </div>
        <div className="mt-6 space-y-2">
          {fixedCostsRegistry.map(cost => (
            <div key={cost.id} className="flex justify-between items-center p-3 border rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex flex-col">
                <span className="font-bold text-slate-700 text-sm">{cost.description}</span>
                <span className="text-[10px] text-slate-400">{cost.category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-red-500">-{cost.amount.toLocaleString()} zł</span>
<button 
  onClick={()=>{
    setConfirmData({
      title:"Usuń koszt stały",
      message:`Czy na pewno chcesz usunąć koszt "${cost.description}"?`,
      action:()=>setFixedCostsRegistry(
        fixedCostsRegistry.filter(f => f.id !== cost.id)
      )
    });
  }}
  className="text-slate-300 hover:text-red-500 transition-colors"
>
  <Trash2 size={16} />
</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      <section className="bg-white p-8 rounded-2xl shadow-sm border">
        <div className="flex items-center mb-6">
          <h2 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <List size={20}/> Kategorie wpisów
            <InfoIcon text="Zarządzaj listą kategorii dostępnych przy dodawaniu nowych operacji." />
          </h2>
        </div>
        <div className="flex gap-2 mb-2">
          <input 
            placeholder="Nowa kategoria" 
            className="flex-1 p-2.5 rounded-lg border text-sm" 
            value={newCategoryName} 
            onChange={e => setNewCategoryName(e.target.value)} 
          />
          <button 
            onClick={addCategory} 
            className="bg-indigo-600 text-white px-4 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
          >
            Dodaj
          </button>
        </div>
        {categoryError && (
          <div className="flex items-center gap-2 text-red-500 text-[11px] font-bold mb-4 animate-pulse">
            <AlertCircle size={14}/> {categoryError}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {categories.map(cat => (
            <div key={cat} className="flex justify-between p-2.5 border rounded-lg bg-slate-50">
              <span className="text-xs font-bold">{cat}</span>
<button 
onClick={()=>{

  const usedOps = data.filter(d => d.category === cat).length;
  const usedFixed = fixedCostsRegistry.filter(f => f.category === cat).length;
  const usedCount = usedOps + usedFixed;

if(usedCount > 0){

setConfirmData({
  title:"Nie można usunąć kategorii",
  message:`Kategoria "${cat}" jest używana w ${usedOps} operacjach i ${usedFixed} kosztach stałych.`,
  type:"info",
  extraAction:{
    label:"Migruj operacje",
    action:()=>setCategoryMigration(cat)
  }
});

return;
}

  setConfirmData({
    title:"Usuń kategorię",
    message:`Czy na pewno chcesz usunąć kategorię "${cat}"?`,
    action:()=>setCategories(
      categories.filter(c => c !== cat)
    )
  });

}}
  className="text-slate-300 hover:text-red-500 transition-colors"
>
  <Trash2 size={14}/>
</button>
            </div>
          ))}
        </div>
      </section>
      
      {role === "admin" && (
        <section className="bg-white p-8 rounded-2xl shadow-sm border">
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-bold text-indigo-600">
              Zaproś użytkownika
            </h2>
          </div>
          <div className="space-y-3">
            <input
              placeholder="Email użytkownika"
              className="w-full p-2.5 rounded-lg border text-sm"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
            />
            {inviteError && (
              <div className="text-red-500 text-sm text-center">
                {inviteError}
              </div>
            )}
            <button
              onClick={inviteUser}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold"
            >
              Zaproś użytkownika
            </button>
          </div>
        </section>
      )}
      
      {role === "admin" && <InvitesPanel />}
      
      <OrganizationUsers />
      
{role === "admin" && (
<section className="bg-white p-8 rounded-2xl shadow-sm border">
  <div className="flex items-center mb-6">
    <h2 className="text-xl font-bold text-indigo-600">
      Organizacja
    </h2>
  </div>

  <div className="space-y-3">

    <label className="text-sm text-slate-500 font-semibold">
      Nazwa organizacji
    </label>

    <div className="flex gap-2">
      <input
        className="flex-1 p-2.5 rounded-lg border text-sm"
        value={orgName || ""}
        onChange={(e)=>setOrgName(e.target.value)}
      />

      <button
        onClick={updateOrganizationName}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
      >
        Zapisz
      </button>
    </div>

  </div>
</section>
)}	  
	  
      <section className="bg-white p-8 rounded-2xl shadow-sm border">
        <div className="flex items-center mb-6">
          <h2 className="text-xl font-bold text-indigo-600">
            Informacje o użytkowniku
          </h2>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500">Email</span>
            <span className="font-mono">{user?.email}</span>
          </div>

<div className="flex justify-between border-b pb-2">
  <span className="text-slate-500">Organizacja</span>
  <span className="font-bold">{orgName || "ładowanie..."}</span>
</div>

          <div className="flex justify-between">
            <span className="text-slate-500">Rola</span>
            <span className="font-bold">{role || "brak"}</span>
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={changePassword}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600"
            >
              Zmień hasło
            </button>

            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-100 rounded-lg text-sm"
            >
              Odśwież sesję
            </button>
          </div>
        </div>
      </section>
	  
	  {/* Informacje o aplikacji */}
<section className="bg-white p-8 rounded-2xl shadow-sm border">
  <div className="flex items-center mb-6">
    <h2 className="text-xl font-bold text-indigo-600">
      Informacje o aplikacji
    </h2>
  </div>

  <div className="space-y-2 text-sm">
    <div className="flex justify-between border-b pb-2">
      <span className="text-slate-500 font-semibold">Nazwa</span>
      <span className="font-bold text-slate-800">
        {APP_INFO.name}
      </span>
    </div>

    <div className="flex justify-between border-b pb-2">
      <span className="text-slate-500 font-semibold">Autor</span>
      <span className="font-bold text-slate-800">
        {APP_INFO.author}
      </span>
    </div>

    <div className="flex justify-between border-b pb-2">
      <span className="text-slate-500 font-semibold">Wersja</span>
      <span className="font-bold text-slate-800">
        {APP_INFO.version}
      </span>
    </div>
	
	<div className="flex justify-between">
      <span className="text-slate-500 font-semibold">Operacje</span>
      <span className="font-bold text-slate-800">
        {data.length}
      </span>
    </div>
	
  </div>
</section>

    </div>
  );
};
