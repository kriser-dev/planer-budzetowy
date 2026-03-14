// Funkcja obliczająca statystyki dla danego miesiąca i roku
export const calculateStats = (data, fixedCostsRegistry, fixedCostOverrides, monthIdx, year) => {
  const filteredData = data.filter(item => item.month === monthIdx && item.year === year);
  
  const przychodyPlan = filteredData.reduce((acc, item) => acc + (parseFloat(item.incomePlanned) || 0), 0);
  const przychodyReal = filteredData.reduce((acc, item) => acc + (parseFloat(item.incomeReal) || 0), 0);
  const kosztyZmiennePlan = filteredData.reduce((acc, item) => acc + (parseFloat(item.expensePlanned) || 0), 0);
  const kosztyZmienneReal = filteredData.reduce((acc, item) => acc + (parseFloat(item.expenseReal) || 0), 0);
  
  const monthKey = `${year}-${monthIdx}`;
  const overridesForMonth = fixedCostOverrides[monthKey] || {};
  const kosztyStale = fixedCostsRegistry.reduce((acc, fc) => {
    const val = overridesForMonth[fc.id] !== undefined ? overridesForMonth[fc.id] : fc.amount;
    return acc + (parseFloat(val) || 0);
  }, 0);
  
  const kosztyPlan = kosztyZmiennePlan + kosztyStale;
  const kosztyReal = kosztyZmienneReal + kosztyStale;
  
  return {
    przychodyPlan,
    przychodyReal,
    kosztyPlan,
    kosztyReal,
    wynikPlan: przychodyPlan - kosztyPlan,
    wynikReal: przychodyReal - kosztyReal
  };
};

// Funkcja obliczająca statystyki kwartalne
export const calculateQuarterStats = (quarters, data, fixedCostsRegistry, fixedCostOverrides, quarterIdx, year) => {
  const quarter = quarters[quarterIdx];
  let przychodyPlan = 0, przychodyReal = 0, kosztyPlan = 0, kosztyReal = 0;
  
  quarter.months.forEach(mIdx => {
    const s = calculateStats(data, fixedCostsRegistry, fixedCostOverrides, mIdx, year);
    przychodyPlan += s.przychodyPlan;
    przychodyReal += s.przychodyReal;
    kosztyPlan += s.kosztyPlan;
    kosztyReal += s.kosztyReal;
  });
  
  return {
    przychodyPlan,
    przychodyReal,
    kosztyPlan,
    kosztyReal,
    wynikPlan: przychodyPlan - kosztyPlan,
    wynikReal: przychodyReal - kosztyReal
  };
};

// Funkcja obliczająca statystyki roczne
export const calculateYearlyStats = (quarters, data, fixedCostsRegistry, fixedCostOverrides, year) => {
  let przychodyPlan = 0, przychodyReal = 0, kosztyPlan = 0, kosztyReal = 0;
  
  quarters.forEach((_, idx) => {
    const qs = calculateQuarterStats(quarters, data, fixedCostsRegistry, fixedCostOverrides, idx, year);
    przychodyPlan += qs.przychodyPlan;
    przychodyReal += qs.przychodyReal;
    kosztyPlan += qs.kosztyPlan;
    kosztyReal += qs.kosztyReal;
  });
  
  return {
    przychodyPlan,
    przychodyReal,
    kosztyPlan,
    kosztyReal,
    wynikPlan: przychodyPlan - kosztyPlan,
    wynikReal: przychodyReal - kosztyReal
  };
};

// Funkcja generująca dane dla wykresów rocznych
export const generateYearlyChartData = (months, data, fixedCostsRegistry, fixedCostOverrides, year) => {
  return months.map((monthName, mIdx) => {
    const s = calculateStats(data, fixedCostsRegistry, fixedCostOverrides, mIdx, year);
    return {
      name: monthName,
      Zysk: s.wynikReal,
      Przychody: s.przychodyReal,
      Koszty: s.kosztyReal
    };
  });
};
