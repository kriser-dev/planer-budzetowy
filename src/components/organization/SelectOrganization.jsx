import { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../features/auth/AuthContext";
import AppLogo from "../../components/ui/AppLogo";

export default function SelectOrganization() {

  const { memberships, selectOrganization } = useAuth();
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

  return(

    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">

      <div className="w-full max-w-md">

        {/* LOGO */}
        <AppLogo center />

        <div className="bg-white p-8 rounded-2xl shadow-sm border space-y-5">

          <h2 className="text-lg font-bold text-center text-slate-700">
            Wybierz organizację
          </h2>

          <div className="space-y-3">

            {orgs.map(org=>(

              <button
                key={org.id}
                onClick={()=>selectOrganization(org.membership)}
                className="w-full border rounded-xl p-4 text-left hover:bg-slate-50 transition"
              >

                <div className="font-bold text-slate-800">
                  {org.name}
                </div>

                <div className="text-xs text-slate-400 mt-1">
                  rola: {org.role}
                </div>

              </button>

            ))}

          </div>

        </div>

      </div>

    </div>

  );

}