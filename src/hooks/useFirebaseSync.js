import { useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useFirebaseSync = ({
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
}) => {
  // Ładowanie danych budżetu z Firestore
  useEffect(() => {
    if(!orgId) return;
    const docRef = doc(db,'organizations',orgId,'budgets',selectedYear.toString());
    const unsub = onSnapshot(docRef, async (docSnap) => {
      if(docSnap.exists()){
        const firestoreData = docSnap.data();
        if (firestoreData.data) setData(firestoreData.data);
        if (firestoreData.categories) setCategories(firestoreData.categories);
        if (firestoreData.fixedCostsRegistry) setFixedCostsRegistry(firestoreData.fixedCostsRegistry);
        if (firestoreData.fixedCostOverrides) setFixedCostOverrides(firestoreData.fixedCostOverrides);
        setInitialized(true);
      } else {
        await setDoc(docRef,{
          data: [],
          categories: [],
          fixedCostsRegistry: [],
          fixedCostOverrides: {},
          createdAt: new Date().toISOString()
        });
        setInitialized(true);
      }
    });
    return () => unsub();
  },[orgId, selectedYear]);

  // Ładowanie nazwy organizacji
  useEffect(() => {
    if (!orgId) return;

    const orgRef = doc(db, "organizations", orgId);
    const unsub = onSnapshot(orgRef, (snap) => {
      if (snap.exists()) {
        setOrgName(snap.data().name);
      }
    });

    return () => unsub();
  }, [orgId]);

  // Synchronizacja danych z Firestore przy każdej zmianie
  useEffect(() => {
    const saveDataToFirestore = async () => {
      if(!orgId || !initialized) return;
      try {
        const docRef = doc(db, 'organizations', orgId, 'budgets', selectedYear.toString());
        await setDoc(docRef, {
          data,
          categories,
          fixedCostsRegistry,
          fixedCostOverrides,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      } catch (error) {
        console.error('Błąd zapisu danych do Firestore:', error);
      }
    };

    // Debounce - zapisuj po 1 sekundzie od ostatniej zmiany
    const timeoutId = setTimeout(() => {
      saveDataToFirestore();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [data, categories, fixedCostsRegistry, fixedCostOverrides, orgId, initialized, selectedYear]);
};
