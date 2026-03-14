import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

import {
  doc,
  setDoc,
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  updateDoc
} from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [orgId, setOrgId] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const selectOrganization = (membership) => {

    setOrgId(membership.orgId);
    setRole(membership.role);

    localStorage.setItem("activeOrgId",membership.orgId);

  };

  useEffect(() => {

    let unsubMemberships = null;

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {

      console.log("AUTH STATE CHANGED", firebaseUser);

      if(unsubMemberships){
        unsubMemberships();
        unsubMemberships = null;
      }

      if (!firebaseUser) {

        setUser(null);
        setMemberships([]);
        setOrgId(null);
        setRole(null);
        setLoading(false);

        return;
      }

      // ===== OBSŁUGA ZAPROSZEŃ =====

      if(firebaseUser.email){

        const invitesQ = query(
          collection(db,"invites"),
          where("email","==",firebaseUser.email),
          where("used","==",false)
        );

        const invitesSnap = await getDocs(invitesQ);

        for(const inviteDoc of invitesSnap.docs){

          const invite = inviteDoc.data();

          const membershipId = crypto.randomUUID();

          await setDoc(doc(db,"memberships",membershipId),{
            userId: firebaseUser.uid,
            email: firebaseUser.email,
            orgId: invite.orgId,
            role: invite.role || "user",
            createdAt: new Date().toISOString()
          });

          await updateDoc(doc(db,"invites",inviteDoc.id),{
            used:true
          });

        }

      }

      const q = query(
        collection(db,"memberships"),
        where("userId","==",firebaseUser.uid)
      );

      unsubMemberships = onSnapshot(q, async (snap) => {

        let mems = snap.docs.map(d=>({
          id:d.id,
          ...d.data()
        }));

        // ===== AUTO UZUPEŁNIENIE EMAILA (dla starych membershipów)

        mems.forEach(async (m) => {

          if (!m.email && firebaseUser.email) {

            await setDoc(
              doc(db,"memberships",m.id),
              { email: firebaseUser.email },
              { merge:true }
            );

          }

        });

        // ===== JEŚLI BRAK ORGANIZACJI → UTWÓRZ NOWĄ

if(mems.length === 0){

  const newOrgName = localStorage.getItem("newOrgName") || "Moja organizacja";

  // sprawdzenie czy organizacja już istnieje
  const orgQuery = query(
    collection(db,"organizations"),
    where("name","==",newOrgName)
  );

  const orgSnap = await getDocs(orgQuery);

  let orgToUseId;

  if(!orgSnap.empty){

    // organizacja istnieje → użyj jej
    orgToUseId = orgSnap.docs[0].id;

  }else{

    // organizacja nie istnieje → utwórz nową
    orgToUseId = crypto.randomUUID();

    await setDoc(doc(db,"organizations",orgToUseId),{
      name:newOrgName,
      owner:firebaseUser.uid,
      createdAt:new Date().toISOString()
    });

  }

  localStorage.removeItem("newOrgName");

const membershipId = crypto.randomUUID();

let roleToAssign = "admin";

if(orgSnap && !orgSnap.empty){
  // organizacja już istnieje → zwykły użytkownik
  roleToAssign = "user";
}

const newMembership = {
  userId:firebaseUser.uid,
  email:firebaseUser.email,
  orgId:orgToUseId,
  role:roleToAssign,
  createdAt:new Date().toISOString()
};

await setDoc(doc(db,"memberships",membershipId),newMembership);

  mems = [{id:membershipId,...newMembership}];

}

        setMemberships(mems);

        const savedOrg = localStorage.getItem("activeOrgId");

        if(savedOrg){

          const found = mems.find(m=>m.orgId === savedOrg);

          if(found){
            setOrgId(found.orgId);
            setRole(found.role);
          }

        }else if(mems.length === 1){

          setOrgId(mems[0].orgId);
          setRole(mems[0].role);

        }else{

          setOrgId(null);
          setRole(null);

        }

        setUser(firebaseUser);
        setLoading(false);

      });

    });

    return () => {

      if(unsubMemberships){
        unsubMemberships();
      }

      unsubAuth();

    };

  },[]);

  useEffect(()=>{

    console.log("AUTH UPDATED",{
      user,
      orgId,
      role,
      memberships
    });

  },[user,orgId,role,memberships]);

  return (

    <AuthContext.Provider
      value={{
        user,
        orgId,
        role,
        memberships,
        loading,
        selectOrganization
      }}
    >
      {!loading && children}
    </AuthContext.Provider>

  );

}