import { useState } from "react";
import { auth } from "./firebase";
import { confirmPasswordReset } from "firebase/auth";
import AppLogo from "./AppLogo";

export default function ResetPassword({ oobCode }) {

  const [password,setPassword] = useState("");
  const [confirm,setConfirm] = useState("");
  const [error,setError] = useState("");
  const [success,setSuccess] = useState(false);

  const resetPassword = async () => {

    setError("");

    if(!password || !confirm){
      setError("Wypełnij wszystkie pola");
      return;
    }

    if(password !== confirm){
      setError("Hasła nie są takie same");
      return;
    }

    if(password.length < 6){
      setError("Hasło musi mieć min. 6 znaków");
      return;
    }

    try{

      await confirmPasswordReset(auth,oobCode,password);

      setSuccess(true);

    }catch(err){

      console.error(err);
      setError("Link resetu jest nieprawidłowy lub wygasł");

    }

  };

  if(success){
    return(
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <AppLogo center />
          <div className="bg-white p-8 rounded-xl shadow w-96">
            <h2 className="text-xl font-bold text-indigo-600 mb-4">
              Hasło zostało zmienione
            </h2>
            <p className="text-sm text-slate-500">
              Możesz się teraz zalogować.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return(

    <div className="min-h-screen flex items-center justify-center bg-slate-50">

      <div className="text-center">

        <AppLogo center />

        <div className="bg-white p-8 rounded-xl shadow w-96 space-y-4">

          <h2 className="text-xl font-bold text-center">
            Ustaw nowe hasło
          </h2>

          <input
            type="password"
            placeholder="Nowe hasło"
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

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={resetPassword}
            className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
          >
            Zmień hasło
          </button>

        </div>

      </div>

    </div>

  );

}