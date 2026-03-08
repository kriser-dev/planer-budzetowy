import { useEffect, useState } from "react";
import { db } from "./firebase";
import { useAuth } from "./AuthContext";

import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc
} from "firebase/firestore";

export default function InvitesPanel(){

  const { orgId } = useAuth();

  const [invites,setInvites] = useState([]);

  useEffect(()=>{

    if(!orgId) return;

    const q = query(
      collection(db,"invites"),
      where("orgId","==",orgId)
    );

    const unsub = onSnapshot(q,(snap)=>{

      const arr = snap.docs.map(d=>({
        id:d.id,
        ...d.data()
      }));

      setInvites(arr);

    });

    return ()=>unsub();

  },[orgId]);

  const cancelInvite = async (id) => {

    await deleteDoc(doc(db,"invites",id));

  };

  return(

    <div className="bg-white p-8 rounded-2xl shadow-sm border">

      <h2 className="text-xl font-bold text-indigo-600 mb-6">
        Zaproszenia
      </h2>

      {invites.length === 0 && (

        <div className="text-sm text-slate-400">
          Brak aktywnych zaproszeń
        </div>

      )}

      <div className="space-y-3">

        {invites.map(invite=>(

          <div
            key={invite.id}
            className="flex justify-between items-center border p-3 rounded-xl"
          >

            <div>

              <div className="font-mono text-sm">
                {invite.email}
              </div>

              <div className="text-xs text-slate-400">
                {invite.used ? "zaakceptowane" : "oczekujące"}
              </div>

            </div>

            <button
              onClick={()=>cancelInvite(invite.id)}
              className="text-red-500 text-xs font-bold"
            >
              anuluj
            </button>

          </div>

        ))}

      </div>

    </div>

  );

}