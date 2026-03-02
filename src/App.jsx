import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  Settings,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  X,
  Save,
  ExternalLink,
  Pencil,
  Printer,
  Info,
  List,
  Download,
  PieChart,
  Link as LinkIcon,
  Target,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

// Firebase imports
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const Tooltip = ({ children, text }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex items-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded shadow-xl whitespace-nowrap z-[100] animate-in fade-in zoom-in-95 font-medium">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
        </div>
      )}
    </div>
  );
};

const InfoIcon = ({ text }) => (
  <Tooltip text={text}>
    <Info size={14} className="text-slate-300 hover:text-indigo-500 cursor-help transition-colors ml-1.5" />
  </Tooltip>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('miesieczny');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [editingItem, setEditingItem] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Walidacja - stany błędów
  const [monthError, setMonthError] = useState('');
  const [fixedCostError, setFixedCostError] = useState('');
  const [categoryError, setCategoryError] = useState('');

  const [categories, setCategories] = useState(['Sprzedaż Usług', 'Projekt X', 'Marketing', 'Edukacja', 'Inne']);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [fixedCostsRegistry, setFixedCostsRegistry] = useState([
    { id: 'f1', category: 'Biuro', description: 'Główne biuro', amount: 3000 },
    { id: 'f2', category: 'Wynagrodzenia', description: 'Zespół dev', amount: 8000 },
    { id: 'f3', category: 'Inne', description: 'Adobe, Slack, Github', amount: 500 }
  ]);

  const [fixedCostOverrides, setFixedCostOverrides] = useState({});

  const [data, setData] = useState([
    { 
      id: 1, 
      category: 'Sprzedaż Usług', 
      description: 'Przykładowa faktura', 
      incomePlanned: 15000, 
      incomeReal: 15500, 
      expensePlanned: 200, 
      expenseReal: 200, 
      status: 'zrealizowane', 
      month: 1, 
      year: 2024, 
      link: '' 
    }
  ]);

  const [newItem, setNewItem] = useState({ 
    category: '', 
    description: '', 
    incomePlanned: '', 
    incomeReal: '', 
    expensePlanned: '', 
    expenseReal: '', 
    status: 'planowane', 
    link: '' 
  });

  const [newFixedCost, setNewFixedCost] = useState({ category: '', description: '', amount: '' });

  const months = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
  const quarters = [
    { label: 'I Kwartał', months: [0, 1, 2] },
    { label: 'II Kwartał', months: [3, 4, 5] },
    { label: 'III Kwartał', months: [6, 7, 8] },
    { label: 'IV Kwartał', months: [9, 10, 11] }
  ];

  const currentQuarterIdx = Math.floor(selectedMonth / 3);

  // ========== FIREBASE PERSISTENCE ==========
  
  // Ładowanie danych z Firestore
  useEffect(() => {
    const loadDataFromFirestore = async () => {
      try {
        const docRef = doc(db, 'budgets', 'mainBudget');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const firestoreData = docSnap.data();
          if (firestoreData.data) setData(firestoreData.data);
          if (firestoreData.categories) setCategories(firestoreData.categories);
          if (firestoreData.fixedCostsRegistry) setFixedCostsRegistry(firestoreData.fixedCostsRegistry);
          if (firestoreData.fixedCostOverrides) setFixedCostOverrides(firestoreData.fixedCostOverrides);
        }
      } catch (error) {
        console.error('Błąd ładowania danych z Firestore:', error);
      }
    };

    loadDataFromFirestore();
  }, []);

  // Synchronizacja danych z Firestore przy każdej zmianie
  useEffect(() => {
    const saveDataToFirestore = async () => {
      try {
        const docRef = doc(db, 'budgets', 'mainBudget');
        await setDoc(docRef, {
          data,
          categories,
          fixedCostsRegistry,
          fixedCostOverrides,
          lastUpdated: new Date().toISOString()
        });
      } catch (error) {
        console.error('Błąd zapisu danych do Firestore:', error);
      }
    };

    // Debounce - zapisuj po 1 sekundzie od ostatniej zmiany
    const timeoutId = setTimeout(() => {
      saveDataToFirestore();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [data, categories, fixedCostsRegistry, fixedCostOverrides]);

  // ========== ULEPSZONE DRUKOWANIE ==========
  
  const handlePrint = () => {
    window.focus();
    setTimeout(() => {
      window.print();
    }, 200);
  };

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
    // Walidacja
    if (!newItem.category || !newItem.description) {
      setMonthError('Pola Kategoria i Opis są obowiązkowe.');
      return;
    }
    
    setMonthError('');
    setData([...data, { 
      id: Date.now(), 
      ...newItem, 
      incomePlanned: parseFloat(newItem.incomePlanned) || 0,
      incomeReal: parseFloat(newItem.incomeReal) || 0,
      expensePlanned: parseFloat(newItem.expensePlanned) || 0,
      expenseReal: parseFloat(newItem.expenseReal) || 0,
      month: selectedMonth, 
      year: selectedYear 
    }]);
    setNewItem({ 
      category: '', 
      description: '', 
      incomePlanned: '', 
      incomeReal: '', 
      expensePlanned: '', 
      expenseReal: '', 
      status: 'planowane', 
      link: '' 
    });
  };

  const addFixedCost = () => {
    if (!newFixedCost.category || !newFixedCost.description || !newFixedCost.amount) {
      setFixedCostError('Kategoria, Opis i Kwota są obowiązkowe.');
      return;
    }
    setFixedCostError('');
    setFixedCostsRegistry([...fixedCostsRegistry, { ...newFixedCost, id: `fc-${Date.now()}`, amount: parseFloat(newFixedCost.amount) }]);
    setNewFixedCost({category:'', description:'', amount:''});
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

  const deleteMonthItem = (item) => {
    if (item.isFixed) {
      const overrideKey = `${item.id}-${selectedMonth}-${selectedYear}`;
      setFixedCostOverrides({ ...fixedCostOverrides, [overrideKey]: { amount: 0, deleted: true } });
    } else {
      setData(data.filter(d => d.id !== item.id));
    }
  };

  const currentMonthData = useMemo(() => data.filter(item => item.month === selectedMonth && item.year === selectedYear), [data, selectedMonth, selectedYear]);
  const currentMonthFixed = useMemo(() => getFixedCostsForMonth(selectedMonth, selectedYear), [fixedCostsRegistry, fixedCostOverrides, selectedMonth, selectedYear]);
  const monthStats = useMemo(() => calculateStats(selectedMonth, selectedYear), [currentMonthData, currentMonthFixed]);

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

  const yearlyChartData = useMemo(() => {
    return months.map((m, idx) => {
      const s = calculateStats(idx, selectedYear);
      return { name: m.substring(0, 3), Zysk: s.wynikReal, Przychody: s.przychodyReal, Koszty: s.kosztyReal };
    });
  }, [data, fixedCostsRegistry, fixedCostOverrides, selectedYear]);

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
            <p style={{fontSize: '14px', fontWeight: 'bold', color: monthStats.wynikReal >= 0 ? '#10b981' : '#ef4444'}}>{monthStats.wynikReal.toLocaleString()} zł</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Modal edycji */}
        {editingItem && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-slate-900 no-print">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="font-bold text-lg">Edycja: {editingItem.category}</h3>
                <button onClick={() => setEditingItem(null)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20}/></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase">Opis</label>
                     <input className="w-full p-2 border rounded-lg text-sm" value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})} />
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-xl space-y-2 border border-emerald-100">
                    <label className="text-[10px] font-bold text-emerald-600 uppercase">Przychód (Plan)</label>
                    <input type="number" className="w-full p-2 border rounded-lg text-sm" value={editingItem.incomePlanned} onChange={e => setEditingItem({...editingItem, incomePlanned: e.target.value})} />
                    <label className="text-[10px] font-bold text-emerald-600 uppercase">Przychód (Real)</label>
                    <input type="number" className="w-full p-2 border rounded-lg text-sm font-bold" value={editingItem.incomeReal} onChange={e => setEditingItem({...editingItem, incomeReal: e.target.value})} />
                  </div>
                  <div className="bg-red-50 p-3 rounded-xl space-y-2 border border-red-100">
                    <label className="text-[10px] font-bold text-red-600 uppercase">Koszt (Plan)</label>
                    <input type="number" className="w-full p-2 border rounded-lg text-sm" value={editingItem.expensePlanned} onChange={e => setEditingItem({...editingItem, expensePlanned: e.target.value})} />
                    <label className="text-[10px] font-bold text-red-600 uppercase">Koszt (Real)</label>
                    <input type="number" className="w-full p-2 border rounded-lg text-sm font-bold" value={editingItem.expenseReal} onChange={e => setEditingItem({...editingItem, expenseReal: e.target.value})} />
                  </div>
                </div>
                {!editingItem.isFixed && (
                   <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Status globalny:</label>
                    <select className="flex-1 p-2 border rounded-lg text-sm" value={editingItem.status} onChange={e => setEditingItem({...editingItem, status: e.target.value})}>
                      <option value="planowane">Planowane</option>
                      <option value="zrealizowane">Zrealizowane</option>
                    </select>
                   </div>
                )}
                <button onClick={() => {
                  if (editingItem.isFixed) {
                    setFixedCostOverrides({...fixedCostOverrides, [`${editingItem.id}-${selectedMonth}-${selectedYear}`]: { amount: parseFloat(editingItem.expenseReal), deleted: false }});
                  } else {
                    setData(data.map(item => item.id === editingItem.id ? {
                      ...editingItem, 
                      incomePlanned: parseFloat(editingItem.incomePlanned) || 0,
                      incomeReal: parseFloat(editingItem.incomeReal) || 0,
                      expensePlanned: parseFloat(editingItem.expensePlanned) || 0,
                      expenseReal: parseFloat(editingItem.expenseReal) || 0
                    } : item));
                  }
                  setEditingItem(null);
                }} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700">
                  <Save size={18}/> Zapisz zmiany
                </button>
              </div>
            </div>
          </div>
        )}

        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 no-print">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter">PLANER <span className="text-indigo-600">360°</span></h1>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Budżet & Analiza Danych</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white rounded-xl shadow-sm border p-1">
              <button onClick={() => setActiveTab('miesieczny')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'miesieczny' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-100'}`}>Miesiąc</button>
              <button onClick={() => setActiveTab('kwartalny')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'kwartalny' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-100'}`}>Kwartał</button>
              <button onClick={() => setActiveTab('roczny')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'roczny' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-100'}`}>Rok</button>
              <button onClick={() => setActiveTab('ustawienia')} className={`px-4 py-2 rounded-lg text-sm transition-all ${activeTab === 'ustawienia' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-100'}`}><Settings size={16} /></button>
            </div>
          </div>
        </header>

        {activeTab === 'ustawienia' ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
              <section className="bg-white p-8 rounded-2xl shadow-sm border">
                <div className="flex items-center mb-6">
                  <h2 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
                    <Settings size={20}/> Koszty Stałe
                    <InfoIcon text="Definiuj wydatki powtarzające się co miesiąc, jak czynsz czy subskrypcje." />
                  </h2>
                </div>
                <div className="space-y-3">
                  <select className="w-full p-2.5 rounded-lg border bg-slate-50 text-sm" value={newFixedCost.category} onChange={e => setNewFixedCost({...newFixedCost, category: e.target.value})}>
                    <option value="">Wybierz kategorię...</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <input placeholder="Opis (np. Numer faktury, Cel)" className="w-full p-2.5 rounded-lg border text-sm" value={newFixedCost.description} onChange={e => setNewFixedCost({...newFixedCost, description: e.target.value})} />
                  <div className="flex gap-2">
                    <input type="number" placeholder="Kwota" className="flex-1 p-2.5 rounded-lg border font-bold text-sm" value={newFixedCost.amount} onChange={e => setNewFixedCost({...newFixedCost, amount: e.target.value})} />
                    <button onClick={addFixedCost} className="bg-indigo-600 text-white px-4 rounded-lg font-bold hover:bg-indigo-700 transition-colors"><Plus size={20}/></button>
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
                        <span className="font-bold text-slate-700 text-sm">{cost.category}</span>
                        <span className="text-[10px] text-slate-400">{cost.description}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-red-500">-{cost.amount.toLocaleString()} zł</span>
                        <button onClick={() => setFixedCostsRegistry(fixedCostsRegistry.filter(f => f.id !== cost.id))} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section className="bg-white p-8 rounded-2xl shadow-sm border">
                <div className="flex items-center mb-6">
                  <h2 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
                    <List size={20}/> Kategorie Wpisów
                    <InfoIcon text="Zarządzaj listą kategorii dostępnych przy dodawaniu nowych operacji." />
                  </h2>
                </div>
                <div className="flex gap-2 mb-2">
                  <input placeholder="Nowa kategoria" className="flex-1 p-2.5 rounded-lg border text-sm" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
                  <button onClick={addCategory} className="bg-indigo-600 text-white px-4 rounded-lg font-bold hover:bg-indigo-700 transition-colors">Dodaj</button>
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
                      <button onClick={() => setCategories(categories.filter(c => c !== cat))} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                    </div>
                  ))}
                </div>
              </section>
           </div>
        ) : activeTab === 'miesieczny' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <section className="bg-white p-5 rounded-2xl shadow-sm border no-print space-y-5">
                <div className="flex items-center justify-between">
                  <button onClick={() => setSelectedMonth(prev => prev === 0 ? 11 : prev - 1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft size={20} /></button>
                  <div className="text-center font-bold">{months[selectedMonth]} {selectedYear}</div>
                  <button onClick={() => setSelectedMonth(prev => prev === 11 ? 0 : prev + 1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronRight size={20} /></button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest border-b border-emerald-100 pb-1">
                    <Wallet size={14} /> Realizacja (Faktyczne)
                    <InfoIcon text="Podsumowanie rzeczywiście otrzymanych wpłat i poniesionych kosztów." />
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-[9px] text-emerald-700 font-bold uppercase mb-1">Bilans Rzeczywisty</p>
                    <p className={`text-2xl font-black ${monthStats.wynikReal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{monthStats.wynikReal.toLocaleString()} zł</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-emerald-100">
                      <div>
                        <p className="text-[8px] text-emerald-700 uppercase">Przychody</p>
                        <p className="text-[11px] font-black">+{monthStats.przychodyReal.toLocaleString()} zł</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-emerald-700 uppercase">Koszty</p>
                        <p className="text-[11px] font-black">-{monthStats.kosztyReal.toLocaleString()} zł</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest border-b border-indigo-100 pb-1">
                    <Target size={14} /> Planowanie (Założenia)
                    <InfoIcon text="Podsumowanie Twoich celów finansowych i przewidywanych wydatków." />
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <p className="text-[9px] text-indigo-700 font-bold uppercase mb-1">Bilans Planowany</p>
                    <p className={`text-2xl font-black ${monthStats.wynikPlan >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>{monthStats.wynikPlan.toLocaleString()} zł</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-indigo-100">
                      <div>
                        <p className="text-[8px] text-indigo-700 uppercase">Przychody (P)</p>
                        <p className="text-[11px] font-black">+{monthStats.przychodyPlan.toLocaleString()} zł</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-indigo-700 uppercase">Koszty (P)</p>
                        <p className="text-[11px] font-black">-{monthStats.kosztyPlan.toLocaleString()} zł</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
                  <button onClick={handlePrint} className="flex items-center justify-center gap-2 p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors"><Printer size={16} /> PDF</button>
                  <button onClick={handleExportCSV} className="flex items-center justify-center gap-2 p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors"><Download size={16} /> Excel</button>
                </div>
              </section>

              <section className="bg-white p-6 rounded-2xl shadow-sm border no-print">
                <div className="flex items-center mb-4 border-b pb-2">
                  <h3 className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Nowy Wpis (Hybrydowy)</h3>
                  <InfoIcon text="Dodaj nową operację finansową. Możesz określić plan i realizację osobno." />
                </div>
                <div className="space-y-3">
                  <select className={`w-full p-2.5 rounded-lg border bg-slate-50 text-sm transition-colors ${monthError && !newItem.category ? 'border-red-300' : ''}`} value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                    <option value="">Wybierz kategorię...</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <input placeholder="Opis wpisu" className={`w-full p-2.5 rounded-lg border bg-slate-50 text-sm transition-colors ${monthError && !newItem.description ? 'border-red-300' : ''}`} value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                  
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 space-y-2">
                    <p className="text-[9px] font-bold text-emerald-700 uppercase">Sekcja Przychodu</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" placeholder="Plan" className="p-2 rounded border text-xs" value={newItem.incomePlanned} onChange={e => setNewItem({...newItem, incomePlanned: e.target.value})} />
                      <input type="number" placeholder="Realizacja" className="p-2 rounded border text-xs font-bold" value={newItem.incomeReal} onChange={e => setNewItem({...newItem, incomeReal: e.target.value})} />
                    </div>
                  </div>

                  <div className="p-3 bg-red-50 rounded-xl border border-red-100 space-y-2">
                    <p className="text-[9px] font-bold text-red-700 uppercase">Sekcja Kosztu</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" placeholder="Plan" className="p-2 rounded border text-xs" value={newItem.expensePlanned} onChange={e => setNewItem({...newItem, expensePlanned: e.target.value})} />
                      <input type="number" placeholder="Realizacja" className="p-2 rounded border text-xs font-bold" value={newItem.expenseReal} onChange={e => setNewItem({...newItem, expenseReal: e.target.value})} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-slate-50 p-2 border rounded text-slate-400"><LinkIcon size={14} /></div>
                    <input placeholder="Link URL" className="flex-1 p-2 rounded border bg-slate-50 text-xs" value={newItem.link} onChange={e => setNewItem({...newItem, link: e.target.value})} />
                  </div>

                  <button onClick={addItem} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md mt-2"><Plus size={18} className="inline mr-2" /> Dodaj wpis</button>
                  
                  {monthError && (
                    <div className="flex items-center gap-2 text-red-500 text-[11px] font-bold text-center justify-center animate-pulse">
                      <AlertCircle size={14}/> {monthError}
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="lg:col-span-3">
              <section className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
                  <div className="flex items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <List size={18} /> Rejestr Operacji
                      <InfoIcon text="Pełna lista transakcji w wybranym miesiącu, w tym koszty stałe i zmienne." />
                    </h3>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {['all', 'planowane', 'zrealizowane'].map(f => (
                      <button key={f} onClick={() => setStatusFilter(f)} className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${statusFilter === f ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>
                        {f === 'all' ? 'Wszystkie' : f === 'planowane' ? 'W trakcie' : 'Zakończone'}
                      </button>
                    ))}
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
                            {item.status === 'zrealizowane' ? <CheckCircle2 size={16} className="text-emerald-500"/> : <Clock size={16} className="text-amber-500"/>}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{item.category}</span>
                              {item.link && (
                                <a href={item.link.startsWith('http') ? item.link : `https://${item.link}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-600 no-print">
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{item.description}</p>
                          </td>
                          <td className="px-4 py-4 text-slate-400 font-mono">{(item.incomePlanned || 0).toLocaleString()} zł</td>
                          <td className="px-4 py-4 font-mono font-bold text-emerald-600 bg-emerald-50/20">{(item.incomeReal || 0).toLocaleString()} zł</td>
                          <td className="px-4 py-4 text-slate-400 font-mono">{(item.expensePlanned || 0).toLocaleString()} zł</td>
                          <td className="px-4 py-4 font-mono font-bold text-red-500 bg-red-50/20">{(item.expenseReal || 0).toLocaleString()} zł</td>
                          <td className="px-4 py-4 text-right no-print">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => setEditingItem(item)} className="p-2 text-slate-300 hover:text-indigo-600"><Pencil size={14}/></button>
                              <button onClick={() => deleteMonthItem(item)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        ) : activeTab === 'kwartalny' ? (
          <div className="space-y-6 animate-in fade-in">
             <div className="flex justify-between items-center no-print">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  {quarters[currentQuarterIdx].label} {selectedYear}
                  <InfoIcon text="Zbiorcze zestawienie wyników dla bieżącego kwartału z podziałem na plan i realizację." />
                </h2>
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md transition-colors hover:bg-indigo-700"><Printer size={16} /> Pobierz PDF</button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quarters[currentQuarterIdx].months.map((mIdx) => {
                  const s = calculateStats(mIdx, selectedYear);
                  return (
                    <div key={mIdx} className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                      <h4 className="font-bold text-slate-400 uppercase text-[10px] mb-2 tracking-widest border-b pb-2">{months[mIdx]}</h4>
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
                          <span className={`text-xl font-black ${s.wynikReal >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>{s.wynikReal.toLocaleString()} zł</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
             </div>

             <section className="bg-white p-8 rounded-3xl border shadow-sm">
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
                <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={quarters[currentQuarterIdx].months.map(mIdx => ({ name: months[mIdx], Przychody: calculateStats(mIdx, selectedYear).przychodyReal, Koszty: calculateStats(mIdx, selectedYear).kosztyReal }))}>
                        <defs>
                          <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                          <linearGradient id="colorK" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
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
        ) : (
          <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center no-print">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  Podsumowanie Roku {selectedYear}
                  <InfoIcon text="Kompleksowy widok rentowności Twojej firmy w przekroju całego roku z podziałem na kwartały." />
                </h2>
                <div className="flex gap-2">
                  <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md transition-colors hover:bg-indigo-700"><Printer size={16} /> Pobierz PDF</button>
                </div>
             </div>

            {/* Sekcja: Kwoty Roczne */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="bg-white p-6 rounded-2xl border shadow-sm">
                  <p className="text-[10px] font-black text-emerald-600 uppercase mb-1 flex items-center gap-1"><ArrowUpRight size={14}/> Przychody Roczne</p>
                  <div className="space-y-1">
                    <p className="text-2xl font-black">{yearlyStats.przychodyReal.toLocaleString()} zł</p>
                    <p className="text-xs text-slate-400 font-mono">Cel: {yearlyStats.przychodyPlan.toLocaleString()} zł</p>
                  </div>
               </div>
               <div className="bg-white p-6 rounded-2xl border shadow-sm">
                  <p className="text-[10px] font-black text-red-500 uppercase mb-1 flex items-center gap-1"><ArrowDownRight size={14}/> Koszty Roczne</p>
                  <div className="space-y-1">
                    <p className="text-2xl font-black">{yearlyStats.kosztyReal.toLocaleString()} zł</p>
                    <p className="text-xs text-slate-400 font-mono">Plan: {yearlyStats.kosztyPlan.toLocaleString()} zł</p>
                  </div>
               </div>
               <div className="bg-indigo-600 p-6 rounded-2xl border border-indigo-500 shadow-sm text-white">
                  <p className="text-[10px] font-black text-indigo-200 uppercase mb-1">Zysk (Realny)</p>
                  <div className="space-y-1">
                    <p className="text-2xl font-black">{yearlyStats.wynikReal.toLocaleString()} zł</p>
                    <p className="text-xs text-indigo-300 font-mono">Śr. m-c: {(yearlyStats.wynikReal / 12).toFixed(0).toLocaleString()} zł</p>
                  </div>
               </div>
               <div className="bg-white p-6 rounded-2xl border shadow-sm border-indigo-100">
                  <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Zysk (Planowany)</p>
                  <div className="space-y-1">
                    <p className="text-2xl font-black text-slate-800">{yearlyStats.wynikPlan.toLocaleString()} zł</p>
                    <p className="text-xs text-slate-400 font-mono">Realizacja: {((yearlyStats.wynikReal / (yearlyStats.wynikPlan || 1)) * 100).toFixed(1)}%</p>
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
                           <td className="px-6 py-4 text-emerald-600 font-bold font-mono">+{qs.przychodyReal.toLocaleString()} zł</td>
                           <td className="px-6 py-4 text-slate-400 font-mono">{qs.kosztyPlan.toLocaleString()} zł</td>
                           <td className="px-6 py-4 text-red-500 font-bold font-mono">-{qs.kosztyReal.toLocaleString()} zł</td>
                           <td className="px-6 py-4 text-right">
                             <span className={`inline-block px-3 py-1 rounded-full font-black text-xs ${qs.wynikReal >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
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

            <section className="bg-white p-8 rounded-3xl shadow-sm border">
               <div className="flex justify-between items-start mb-8">
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                    <TrendingUp className="text-indigo-600" /> Analiza Trendu
                    <InfoIcon text="Wykres trendu zysku netto oraz przychodów v poszczególnych miesiącach." />
                  </h3>
               </div>
               <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="Zysk" stroke="#4f46e5" strokeWidth={4} dot={{ r: 6, fill: '#4f46e5', stroke: '#fff' }} />
                    <Line type="monotone" dataKey="Przychody" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="Koszty" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
               </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
