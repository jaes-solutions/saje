import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        navigate("/dashboard");
      }
    };

    checkUser();
  }, [navigate]);

  const handleAuth = async () => {
    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    if (isSignup) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) return alert(error.message);
      alert("Check your email to confirm signup");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return alert(error.message);

      if (!keepSignedIn) {
        await supabase.auth.signOut(); // optional behavior
      }

      navigate("/dashboard");
    }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/dashboard",
      },
    });
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Enter your email first");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/",
    });

    if (error) alert(error.message);
    else alert("Password reset email sent");
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
        <h1 className="text-3xl font-bold mb-2">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h1>
        <p className="text-gray-400 mb-6 text-sm">
          {isSignup
            ? "Start managing your invoices"
            : "Login to access your dashboard"}
        </p>

        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 rounded-lg mb-5 hover:bg-gray-200 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="px-3 text-xs text-gray-400">OR</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-3 rounded-lg bg-black border border-white/10 focus:outline-none"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-3 rounded-lg bg-black border border-white/10 focus:outline-none"
          onChange={(e) => setPassword(e.target.value)}
        />

        {!isSignup && (
          <div className="flex items-center justify-between text-sm mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={() => setKeepSignedIn(!keepSignedIn)}
              />
              Keep me signed in
            </label>

            <button
              onClick={handleForgotPassword}
              className="text-blue-400 hover:underline"
            >
              Forgot password?
            </button>
          </div>
        )}

        <button
          onClick={handleAuth}
          className="w-full bg-blue-500 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
        >
          {isSignup ? "Create Account" : "Login"}
        </button>

        <p className="text-center text-sm text-gray-400 mt-6">
          {isSignup ? "Already have an account?" : "Don’t have an account?"}
          <span
            onClick={() => setIsSignup(!isSignup)}
            className="text-blue-400 cursor-pointer ml-2"
          >
            {isSignup ? "Login" : "Sign up"}
          </span>
        </p>
      </div>
    </div>
  );
}
