import AppLogo from "../../components/ui/AppLogo";

import { useState } from "react";
import { auth } from "../../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function Register({ onBack }) {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [confirm,setConfirm] = useState("");
  const [orgName,setOrgName] = useState("");
  const [error,setError] = useState("");

  const register = async () => {

    setError("");

    if(!email || !password || !confirm || !orgName){
      setError("Wypełnij wszystkie pola");
      return;
    }

    if(password !== confirm){
      setError("Hasła nie są takie same");
      return;
    }

    try{

      // zapisujemy nazwę organizacji do wykorzystania w AuthContext
      localStorage.setItem("newOrgName",orgName);

      await createUserWithEmailAndPassword(auth,email,password);

    }catch(err){

  if(err.code === "auth/email-already-in-use"){
    setError("Konto z tym adresem email już istnieje");
  }
  else if(err.code === "auth/invalid-email"){
    setError("Podaj poprawny adres email");
  }
  else if(err.code === "auth/weak-password"){
    setError("Hasło musi mieć minimum 6 znaków");
  }
  else if(err.code === "auth/missing-email"){
    setError("Podaj adres email");
  }
  else{
    console.error(err);
    setError("Nie udało się utworzyć konta");
  }

}

  };

  return(

    <div className="min-h-screen bg-slate-50 flex items-center justify-center">

      <div className="flex flex-col items-center w-full">

        <AppLogo center />

        <div className="bg-white p-8 rounded-xl shadow w-96 space-y-4">

          <h2 className="text-xl font-bold text-center">
            Rejestracja
          </h2>

          <input
            placeholder="Email"
            className="w-full border p-2 rounded"
            value={email}
            onChange={e=>setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Hasło"
            className="w-full border p-2 rounded"
            value={password}
            onChange={e=>setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Powtórz hasło"
            className="w-full border p-2 rounded"
            value={confirm}
            onChange={e=>setConfirm(e.target.value)}
          />

          <input
            placeholder="Nazwa organizacji"
            className="w-full border p-2 rounded"
            value={orgName}
            onChange={e=>setOrgName(e.target.value)}
          />

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={register}
            className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
          >
            Załóż konto
          </button>

          <button
            onClick={onBack}
            className="w-full text-sm text-slate-500"
          >
            Powrót do logowania
          </button>

        </div>

      </div>

    </div>

  );

}