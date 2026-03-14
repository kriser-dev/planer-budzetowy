import { useState } from "react";
import { auth } from "../../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import AppLogo from "../../components/ui/AppLogo";

export default function Login({ onRegister }) {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");

  const login = async () => {

    setError("");

    if(!email && !password){
      setError("Podaj email i hasło");
      return;
    }

    if(!email){
      setError("Podaj email");
      return;
    }

    if(!password){
      setError("Podaj hasło");
      return;
    }

    try{

      await signInWithEmailAndPassword(auth,email,password);

    }catch(err){

      if(err.code === "auth/user-not-found"){
        setError("Użytkownik nie istnieje");
      }else if(err.code === "auth/wrong-password"){
        setError("Nieprawidłowe hasło");
      }else{
        setError("Błąd logowania");
      }

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">

      <div className="w-full max-w-md">

        {/* LOGO APLIKACJI */}
        <AppLogo center />

        <div className="bg-white p-8 rounded-2xl shadow-sm border space-y-5">

          <h2 className="text-lg font-bold text-center text-slate-700">
            Logowanie
          </h2>

          <input
            placeholder="Email"
            className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={email}
            onChange={e=>setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Hasło"
            className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={password}
            onChange={e=>setPassword(e.target.value)}
          />

          {error && (
            <div className="text-red-500 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <button
            onClick={login}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            Zaloguj
          </button>

		  <button
			onClick={onRegister}
			className="w-full text-sm text-slate-500 mt-2"
		  >
			Nie masz konta? Zarejestruj się
		  </button>

        </div>

      </div>

    </div>

  );

}