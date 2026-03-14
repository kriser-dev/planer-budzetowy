import { useAuth } from "./features/auth/AuthContext";
import Login from "./features/auth/Login";
import SelectOrganization from "./components/organization/SelectOrganization";
import OrganizationSwitcher from "./components/organization/OrganizationSwitcher";
import Register from "./features/auth/Register";
import ResetPassword from "./features/auth/ResetPassword";

import React, { useState, useMemo } from 'react';
import { Settings, ChevronRight, ChevronLeft } from 'lucide-react';

// Firebase imports
import { signOut, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "./config/firebase";
import { doc, setDoc } from 'firebase/firestore';

// Importy komponentów
import { ItemModal } from "./components/forms/ItemModal";
import { MonthStatsCards } from './components/views/MonthStatsCards';
import { MonthlyOperationsTable } from './components/views/MonthlyOperationsTable';
import { SettingsView } from './components/views/SettingsView';
import { QuarterlyView } from './components/views/QuarterlyView';
import { YearlyView } from './components/views/YearlyView';
import { GanttView } from './components/views/GanttView';
import { ConfirmModal } from "./components/modals/ConfirmModal";
import { CategoryMigrationModal } from "./components/modals/CategoryMigrationModal";

// Importy pomocniczych funkcji i stałych
import { 
  months, 
  quarters, 
  defaultCategories, 
  defaultData, 
  defaultFixedCosts, 
  emptyNewItem, 
  emptyNewFixedCost 
} from './utils/constants';

// Importy hooków
import { useFirebaseSync } from './hooks/useFirebaseSync';

// Importy funkcji pomocniczych
import { generateYearlyChartData } from './utils/calculations';

const App = () => {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  const oobCode = params.get("oobCode");

  if(mode === "resetPassword" && oobCode){
    return <ResetPassword oobCode={oobCode} />;
  }
	
  const { user, orgId, role, memberships } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  
  const [modalMode,setModalMode] = useState(null);
  const [modalItem,setModalItem] = useState(null);
  
  const [confirmData,setConfirmData] = useState(null);
  const [categoryMigration,setCategoryMigration] = useState(null);

  const logout = async () => {
	await signOut(auth);
  };
  
  const changePassword = async () => {
    if(!user?.email){
      alert("Brak emaila użytkownika");
      return;
    }

    try{
      await sendPasswordResetEmail(auth, user.email, {
        url: window.location.origin + "/reset-password",
        handleCodeInApp: true
      });
	  
      alert("Wysłano email do zmiany hasła");
    }catch(err){
      console.error(err);
      alert("Błąd wysyłania emaila");
    }
  };

  const [activeTab, setActiveTab] = useState('miesieczny');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState('all');
  const [ganttMode,setGanttMode] = useState("month");
  const [initialized, setInitialized] = useState(false);
  const [orgName, setOrgName] = useState("");

  // Walidacja - stany błędów
  const [monthError, setMonthError] = useState('');
  const [fixedCostError, setFixedCostError] = useState('');
  const [categoryError, setCategoryError] = useState('');

  const [categories, setCategories] = useState(defaultCategories);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState("");

  const [fixedCostsRegistry, setFixedCostsRegistry] = useState(defaultFixedCosts);
  const [fixedCostOverrides, setFixedCostOverrides] = useState({});
  const [data, setData] = useState(defaultData);
  const [newFixedCost, setNewFixedCost] = useState(emptyNewFixedCost);

  const currentQuarterIdx = Math.floor(selectedMonth / 3);
  
  // Firebase synchronizacja
  useFirebaseSync({
    orgId,
    initialized,
    setInitialized,
    setData,
    setCategories,
    setFixedCostsRegistry,
    setFixedCostOverrides,
    setOrgName,
    data,
    categories,
    fixedCostsRegistry,
    fixedCostOverrides,
    selectedYear
  });

  // Drukowanie
  const handlePrint = () => {
    window.focus();
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Funkcje pomocnicze
  const getFixedCostsForMonth = (m, y) => {
    return fixedCostsRegistry.map(fc => {
      const overrideKey = `${fc.id}-${m}-${y}`;
      const override = fixedCostOverrides[overrideKey];
      if (override && override.deleted) return null;
      const finalAmount = override ? override.amount : fc.amount;
      return {
        ...fc,
        isFixed: true,
        incomePlanned: 0,
        incomeReal: 0,
        expensePlanned: fc.amount,
        expenseReal: finalAmount,
        status: 'zrealizowane',
        link: ''
      };
    }).filter(Boolean);
  };

  const calculateStats = (monthIdx, yearVal) => {
    const monthItems = data.filter(item => item.month === monthIdx && item.year === yearVal);
    const monthFixedCosts = getFixedCostsForMonth(monthIdx, yearVal);
    
    const stats = { 
      przychodyReal: 0, 
      przychodyPlan: 0, 
      kosztyReal: 0, 
      kosztyPlan: 0 
    };

    monthFixedCosts.forEach(fc => {
      stats.kosztyReal += fc.expenseReal;
      stats.kosztyPlan += fc.expensePlanned;
    });

    monthItems.forEach(item => {
      stats.przychodyReal += (parseFloat(item.incomeReal) || 0);
      stats.przychodyPlan += (parseFloat(item.incomePlanned) || 0);
      stats.kosztyReal += (parseFloat(item.expenseReal) || 0);
      stats.kosztyPlan += (parseFloat(item.expensePlanned) || 0);
    });

    const wynikReal = stats.przychodyReal - stats.kosztyReal;
    const wynikPlan = stats.przychodyPlan - stats.kosztyPlan;
    return { ...stats, wynikReal, wynikPlan };
  };

  const calculateQuarterStats = (qIdx, yearVal) => {
    const qMonths = quarters[qIdx].months;
    return qMonths.reduce((acc, mIdx) => {
      const ms = calculateStats(mIdx, yearVal);
      return {
        przychodyReal: acc.przychodyReal + ms.przychodyReal,
        przychodyPlan: acc.przychodyPlan + ms.przychodyPlan,
        kosztyReal: acc.kosztyReal + ms.kosztyReal,
        kosztyPlan: acc.kosztyPlan + ms.kosztyPlan,
        wynikReal: acc.wynikReal + ms.wynikReal,
        wynikPlan: acc.wynikPlan + ms.wynikPlan
      };
    }, { przychodyReal: 0, przychodyPlan: 0, kosztyReal: 0, kosztyPlan: 0, wynikReal: 0, wynikPlan: 0 });
  };

  const yearlyStats = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => i).reduce((acc, mIdx) => {
      const ms = calculateStats(mIdx, selectedYear);
      return {
        przychodyReal: acc.przychodyReal + ms.przychodyReal,
        przychodyPlan: acc.przychodyPlan + ms.przychodyPlan,
        kosztyReal: acc.kosztyReal + ms.kosztyReal,
        kosztyPlan: acc.kosztyPlan + ms.kosztyPlan,
        wynikReal: acc.wynikReal + ms.wynikReal,
        wynikPlan: acc.wynikPlan + ms.wynikPlan
      };
    }, { przychodyReal: 0, przychodyPlan: 0, kosztyReal: 0, kosztyPlan: 0, wynikReal: 0, wynikPlan: 0 });
  }, [data, fixedCostsRegistry, fixedCostOverrides, selectedYear]);

  const addItem = () => {

  if (!modalItem.category || !modalItem.description) {
    setMonthError('Pola Kategoria i Opis są obowiązkowe.');
    return;
  }

  setMonthError('');

  setData([
    ...data,
    {
      id: Date.now(),
      ...modalItem,
      incomePlanned: parseFloat(modalItem.incomePlanned) || 0,
      incomeReal: parseFloat(modalItem.incomeReal) || 0,
      expensePlanned: parseFloat(modalItem.expensePlanned) || 0,
      expenseReal: parseFloat(modalItem.expenseReal) || 0,
      month: selectedMonth,
      year: selectedYear
    }
  ]);

  setModalMode(null);
  setModalItem(null);

};

  const addFixedCost = () => {
    if (!newFixedCost.category || !newFixedCost.description || !newFixedCost.amount) {
      setFixedCostError('Kategoria, Opis i Kwota są obowiązkowe.');
      return;
    }
    setFixedCostError('');
    setFixedCostsRegistry([...fixedCostsRegistry, { 
      ...newFixedCost, 
      id: `fc-${Date.now()}`, 
      amount: parseFloat(newFixedCost.amount) 
    }]);
    setNewFixedCost(emptyNewFixedCost);
  };

  const addCategory = () => {
    if(!newCategoryName.trim()) {
      setCategoryError('Podaj nazwę kategorii.');
      return;
    }
    setCategoryError('');
    setCategories([...categories, newCategoryName.trim()]);
    setNewCategoryName('');
  };

  const inviteUser = async () => {
    if(!inviteEmail){
      setInviteError("Podaj email użytkownika");
      return;
    }

    if(!inviteEmail.includes("@")){
      setInviteError("Nieprawidłowy email");
      return;
    }

    setInviteError("");

    const inviteId = crypto.randomUUID();

    await setDoc(doc(db,"invites",inviteId),{
      email: inviteEmail,
      orgId: orgId,
      role: "user",
      createdAt: new Date(),
      used: false
    });

    setInviteEmail("");
  };

  const deleteMonthItem = (item) => {
    if (item.isFixed) {
      const overrideKey = `${item.id}-${selectedMonth}-${selectedYear}`;
      setFixedCostOverrides({ ...fixedCostOverrides, [overrideKey]: { amount: 0, deleted: true } });
    } else {
      setData(data.filter(d => d.id !== item.id));
    }
  };
  
const migrateCategory = (oldCategory,newCategory)=>{

  const opsCount = data.filter(d=>d.category===oldCategory).length;
  const fixedCount = fixedCostsRegistry.filter(f=>f.category===oldCategory).length;

  // migracja operacji
  setData(
    data.map(item =>
      item.category === oldCategory
        ? { ...item, category:newCategory }
        : item
    )
  );

  // migracja kosztów stałych
  setFixedCostsRegistry(
    fixedCostsRegistry.map(cost =>
      cost.category === oldCategory
        ? { ...cost, category:newCategory }
        : cost
    )
  );

  setCategoryMigration(null);

  setConfirmData({
    title:"Migracja zakończona",
    message:`Przeniesiono ${opsCount} operacji i ${fixedCount} kosztów stałych.`,
    type:"info"
  });

};

const handleSaveEdit = () => {

  if (modalItem.isFixed) {

    setFixedCostOverrides({
      ...fixedCostOverrides,
      [`${modalItem.id}-${selectedMonth}-${selectedYear}`]: {
        amount: parseFloat(modalItem.expenseReal),
        deleted:false
      }
    });

  } else {

    setData(data.map(item =>
      item.id === modalItem.id
      ? {
          ...modalItem,
          incomePlanned: parseFloat(modalItem.incomePlanned) || 0,
          incomeReal: parseFloat(modalItem.incomeReal) || 0,
          expensePlanned: parseFloat(modalItem.expensePlanned) || 0,
          expenseReal: parseFloat(modalItem.expenseReal) || 0
        }
      : item
    ));

  }

  setModalMode(null);
  setModalItem(null);

};

  const currentMonthData = useMemo(() => 
    data.filter(item => item.month === selectedMonth && item.year === selectedYear), 
    [data, selectedMonth, selectedYear]
  );
  
  const currentMonthFixed = useMemo(() => 
    getFixedCostsForMonth(selectedMonth, selectedYear), 
    [fixedCostsRegistry, fixedCostOverrides, selectedMonth, selectedYear]
  );
  
  const monthStats = useMemo(() => 
    calculateStats(selectedMonth, selectedYear), 
    [currentMonthData, currentMonthFixed]
  );

  const filteredItems = useMemo(() => {
    const all = [...currentMonthFixed, ...currentMonthData];
    if (statusFilter === 'all') return all;
    return all.filter(i => i.status === statusFilter);
  }, [currentMonthFixed, currentMonthData, statusFilter]);

  const handleExportCSV = () => {
    const headers = ['Kategoria', 'Opis', 'Przychod Plan', 'Przychod Real', 'Koszt Plan', 'Koszt Real', 'Status'];
    const rows = filteredItems.map(item => [
      item.category,
      item.description || '',
      item.incomePlanned,
      item.incomeReal,
      item.expensePlanned,
      item.expenseReal,
      item.status
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `budzet_${months[selectedMonth]}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const yearlyChartData = useMemo(() => 
    generateYearlyChartData(months, data, fixedCostsRegistry, fixedCostOverrides, selectedYear),
    [data, fixedCostsRegistry, fixedCostOverrides, selectedYear]
  );

  const ganttItems = useMemo(() => 
    data.filter(item => item.gantt),
  [data]);

  // Login
  if (!user) {
    if(showRegister){
      return <Register onBack={() => setShowRegister(false)} />;
    }
    return <Login onRegister={() => setShowRegister(true)} />;
  }

  // Wybór organizacji
  if (!orgId && memberships.length > 1) {
	return <SelectOrganization />;
  }
  
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { 
            background: white; 
            padding: 0; 
            font-size: 10px;
            margin: 0;
          }
          .print-container { 
            width: 100%; 
            border: 1px solid #eee; 
            border-radius: 0; 
            overflow: visible;
            page-break-inside: avoid;
          }
          table { 
            width: 100% !important; 
            border-collapse: collapse;
            page-break-inside: auto;
          }
          tr { 
            page-break-inside: avoid; 
            page-break-after: auto; 
          }
          thead { 
            display: table-header-group; 
          }
          th, td { 
            border: 1px solid #e2e8f0 !important; 
            padding: 4px 6px !important; 
            text-align: left;
            font-size: 9px !important;
          }
          .print-header { 
            margin-bottom: 20px; 
            border-bottom: 2px solid #4f46e5; 
            padding-bottom: 10px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
          }
          .print-stats {
            display: block !important;
            margin-bottom: 20px;
            padding: 10px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
          }
          @page {
            margin: 1cm;
            size: A4;
          }
        }
        .print-only { display: none; }
        .print-stats { display: none; }
      `}</style>

      {/* Sekcja tylko do druku */}
      <div className="print-only print-stats">
        <h1 style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '10px'}}>PLANER 360° - Budżet</h1>
        <p style={{fontSize: '12px', marginBottom: '5px'}}>{months[selectedMonth]} {selectedYear}</p>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '10px'}}>
          <div>
            <p style={{fontSize: '9px', color: '#10b981', fontWeight: 'bold'}}>Przychody (Real)</p>
            <p style={{fontSize: '14px', fontWeight: 'bold'}}>{monthStats.przychodyReal.toLocaleString()} zł</p>
          </div>
          <div>
            <p style={{fontSize: '9px', color: '#ef4444', fontWeight: 'bold'}}>Koszty (Real)</p>
            <p style={{fontSize: '14px', fontWeight: 'bold'}}>{monthStats.kosztyReal.toLocaleString()} zł</p>
          </div>
          <div>
            <p style={{fontSize: '9px', color: '#4f46e5', fontWeight: 'bold'}}>Wynik (Real)</p>
            <p style={{fontSize: '14px', fontWeight: 'bold', color: monthStats.wynikReal >= 0 ? '#10b981' : '#ef4444'}}>
              {monthStats.wynikReal.toLocaleString()} zł
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Modal wstawiania */}
<ItemModal
  mode={modalMode}
  item={modalItem}
  setItem={setModalItem}
  categories={categories}
  monthError={monthError}
  onClose={()=>{
    setModalMode(null);
    setModalItem(null);
  }}
  onSave={()=>{
    if(modalMode==="add"){
      addItem();
    }else{
      handleSaveEdit();
    }
  }}
/>

{confirmData && (
  <ConfirmModal
    title={confirmData.title}
    message={confirmData.message}
	type={confirmData.type}
	extraAction={confirmData.extraAction}
    onConfirm={()=>{
      confirmData.action?.();
      setConfirmData(null);
    }}
    onCancel={()=>setConfirmData(null)}
  />
)}

{categoryMigration && (
  <CategoryMigrationModal
    oldCategory={categoryMigration}
    categories={categories}
    onCancel={()=>setCategoryMigration(null)}
    onMigrate={(target)=>migrateCategory(categoryMigration,target)}
  />
)}

        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 no-print">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter">
              PLANER <span className="text-indigo-600">360°</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Budżet & Analiza Danych</p>
          </div>
          <div className="flex items-center gap-3">
			<OrganizationSwitcher />
            <div className="flex bg-white rounded-xl shadow-sm border p-1">
              <button 
                onClick={() => setActiveTab('miesieczny')} 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'miesieczny' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-100'
                }`}
              >
                Miesiąc
              </button>
              <button 
                onClick={() => setActiveTab('kwartalny')} 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'kwartalny' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-100'
                }`}
              >
                Kwartał
              </button>
              <button 
                onClick={() => setActiveTab('roczny')} 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'roczny' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-100'
                }`}
              >
                Rok
              </button>
			  
			  <button 
                onClick={() => setActiveTab('gantt')} 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'gantt' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-100'
                }`}
              >
				Gantt
			  </button>
			  
              <button 
                onClick={() => setActiveTab('ustawienia')} 
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  activeTab === 'ustawienia' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-100'
                }`}
              >
                <Settings size={16} />
              </button>
            </div>
			<button
			  onClick={logout}
			  className="px-4 py-2 text-sm font-bold rounded-lg border hover:bg-slate-100 transition"
			>
			   Wyloguj
			</button>
          </div>
        </header>

        {activeTab === 'ustawienia' ? (
          <SettingsView 
            role={role}
            categories={categories}
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            categoryError={categoryError}
            addCategory={addCategory}
            setCategories={setCategories}
            fixedCostsRegistry={fixedCostsRegistry}
            newFixedCost={newFixedCost}
            setNewFixedCost={setNewFixedCost}
            fixedCostError={fixedCostError}
            addFixedCost={addFixedCost}
            setFixedCostsRegistry={setFixedCostsRegistry}
            inviteEmail={inviteEmail}
            setInviteEmail={setInviteEmail}
            inviteError={inviteError}
            inviteUser={inviteUser}
            user={user}
            orgName={orgName}
            changePassword={changePassword}
			data={data}
			setConfirmData={setConfirmData}
			setCategoryMigration={setCategoryMigration}
          />
        ) : activeTab === 'miesieczny' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <section className="bg-white p-5 rounded-2xl shadow-sm border no-print space-y-5">
<div className="flex items-center justify-between">

  <button 
    onClick={() => changeMonth("prev")} 
    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
  >
    <ChevronLeft size={20} />
  </button>

  <div className="text-center font-bold">
    {months[selectedMonth]} {selectedYear}
  </div>

  <button 
    onClick={() => changeMonth("next")} 
    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
  >
    <ChevronRight size={20} />
  </button>

</div>

                <MonthStatsCards monthStats={monthStats} />
              </section>

<button
  onClick={()=>{
    setModalMode("add");
    setModalItem({...emptyNewItem});
  }}
  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
>
  Dodaj wpis
</button>

            </div>

            <div className="lg:col-span-3">
<MonthlyOperationsTable 
  filteredItems={filteredItems}
  statusFilter={statusFilter}
  setStatusFilter={setStatusFilter}
  setEditingItem={(item)=>{
    setModalMode("edit");
    setModalItem(item);
  }}
  deleteMonthItem={deleteMonthItem}
  setConfirmData={setConfirmData}
  handleExportCSV={handleExportCSV}
  months={months}
  selectedMonth={selectedMonth}
  selectedYear={selectedYear}
/>
            </div>
          </div>
        ) : activeTab === 'kwartalny' ? (
          <QuarterlyView 
            quarters={quarters}
            currentQuarterIdx={currentQuarterIdx}
            selectedYear={selectedYear}
            months={months}
            calculateStats={calculateStats}
            handlePrint={handlePrint}
          />
		  
		) : activeTab === 'gantt' ? (

		  <GanttView
			data={ganttItems}
			selectedYear={selectedYear}
			selectedMonth={selectedMonth}
			months={months}
			quarters={quarters}
			ganttMode={ganttMode}
			setGanttMode={setGanttMode}
		  />  
		  
        ) : (
		
          <YearlyView 
            selectedYear={selectedYear}
            yearlyStats={yearlyStats}
            quarters={quarters}
            calculateQuarterStats={calculateQuarterStats}
            yearlyChartData={yearlyChartData}
            handlePrint={handlePrint}
          />
        )}
      </div>
    </div>
  );
};

export default App;
