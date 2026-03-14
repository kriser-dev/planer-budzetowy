import { useEffect, useState } from "react";
import { useAuth } from "../../features/auth/AuthContext";
import { db, auth } from "../../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function OrganizationSwitcher() {

  const { memberships, orgId, selectOrganization } = useAuth();

  const [open,setOpen] = useState(false);
  const [orgs,setOrgs] = useState([]);

  useEffect(()=>{

    const load = async () => {

      const arr = await Promise.all(

        memberships.map(async (m)=>{

          const snap = await getDoc(doc(db,"organizations",m.orgId));

          if(!snap.exists()) return null;

          const data = snap.data();

          return {
            id:m.orgId,
            role:m.role,
            name:data.name || m.orgId,
            membership:m
          };

        })

      );

      setOrgs(arr.filter(Boolean));

    };

    if(memberships.length){
      load();
    }

  },[memberships]);

  const current = orgs.find(o=>o.id === orgId);


  // =================================
  // TWORZENIE NOWEJ ORGANIZACJI
  // =================================

  const createOrganization = async () => {

    const name = prompt("Podaj nazwę organizacji");

    if(!name) return;

    try{

      const orgId = crypto.randomUUID();
      const membershipId = crypto.randomUUID();

      const user = auth.currentUser;

      if(!user) return;

      // tworzymy organizację
      await setDoc(doc(db,"organizations",orgId),{
        name,
        owner:user.uid,
        createdAt:new Date().toISOString()
      });

      // tworzymy membership admina
      const membership = {
        userId:user.uid,
        orgId,
        role:"admin",
        createdAt:new Date().toISOString()
      };

      await setDoc(doc(db,"memberships",membershipId),membership);

      // przełączamy organizację
      selectOrganization({
        id:membershipId,
        ...membership
      });

      setOpen(false);

    }catch(err){

      console.error("Błąd tworzenia organizacji",err);

    }

  };


  return (

    <div className="relative">

      <button
        onClick={()=>setOpen(!open)}
        className="px-3 py-2 bg-white border rounded-xl text-sm font-bold hover:bg-slate-50"
      >
        {current?.name || "Organizacja"}
      </button>

      {open && (

        <div className="absolute right-0 mt-2 w-56 bg-white border rounded-xl shadow-lg z-50">

          {orgs.map(org=>(

            <button
              key={org.id}
              onClick={()=>{
                selectOrganization(org.membership);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm"
            >

              <div className="font-bold">
                {org.name}
              </div>

              <div className="text-xs text-slate-400">
                {org.role}
              </div>

            </button>

          ))}

          {/* separator */}
          <div className="border-t my-1"></div>

          {/* utwórz organizację */}

          <button
            onClick={createOrganization}
            className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-bold text-indigo-600"
          >
            + Utwórz organizację
          </button>

        </div>

      )}

    </div>

  );

}