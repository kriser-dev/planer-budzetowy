// Nazwy miesięcy
export const months = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

// Definicje kwartałów
export const quarters = [
  { label: 'I Kwartał', months: [0, 1, 2] },
  { label: 'II Kwartał', months: [3, 4, 5] },
  { label: 'III Kwartał', months: [6, 7, 8] },
  { label: 'IV Kwartał', months: [9, 10, 11] }
];

// Domyślne kategorie
export const defaultCategories = [
  'Sprzedaż Usług', 
  'Projekt X', 
  'Marketing', 
  'Edukacja', 
  'Inne'
];

// Domyślne dane przykładowe
export const defaultData = [
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
];

// Domyślne koszty stałe
export const defaultFixedCosts = [
  { id: 'f1', category: 'Biuro', description: 'Główne biuro', amount: 3000 },
  { id: 'f2', category: 'Wynagrodzenia', description: 'Zespół dev', amount: 8000 },
  { id: 'f3', category: 'Inne', description: 'Adobe, Slack, Github', amount: 500 }
];

// Pusty nowy element
export const emptyNewItem = { 
  category: '', 
  description: '', 
  incomePlanned: '', 
  incomeReal: '', 
  expensePlanned: '', 
  expenseReal: '', 
  status: 'planowane', 
  link: '',
  gantt: false,
  startPlanned: "",
  endPlanned: "",
  startReal: "",
  endReal: "",
  teamSize: 1  
};

// Pusty nowy koszt stały
export const emptyNewFixedCost = { 
  category: '', 
  description: '', 
  amount: '' 
};
