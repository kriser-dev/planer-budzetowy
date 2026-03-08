import { useEffect, useState } from "react";
import { db } from "./firebase";
import { useAuth } from "./AuthContext";

import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

export default function OrganizationUsers(){

  const { orgId, role } = useAuth();

  const [users,setUsers] = useState([]);

  useEffect(()=>{

    if(!orgId) return;

    const q = query(
      collection(db,"memberships"),
      where("orgId","==",orgId)
    );

    const unsub = onSnapshot(q,(snap)=>{

      const arr = snap.docs.map(d=>({
        id:d.id,
        ...d.data()
      }));

      setUsers(arr);

    });

    return ()=>unsub();

  },[orgId]);

  return(

    <div className="bg-white p-8 rounded-2xl shadow-sm border">

      <h2 className="text-xl font-bold text-indigo-600 mb-6">
        Użytkownicy organizacji
      </h2>

      <div className="space-y-3">

        {users.map(user=>(

          <div
            key={user.id}
            className="flex justify-between items-center border p-3 rounded-xl"
          >

            <div>

              <div className="text-sm font-medium">
				{user.email ?? user.userId ?? "nieznany użytkownik"}
			  </div>

              <div className="text-xs text-slate-400">
                rola: {user.role}
              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}