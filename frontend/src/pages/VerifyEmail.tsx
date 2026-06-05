// src/pages/VerifyEmail.tsx
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No verification token found.");
      return;
    }

    fetch(`http://localhost:5000/api/auth/verify-email?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setStatus("error");
          setMessage(data.error);
        } else {
          setStatus("success");
          setMessage(data.message);
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f3f0]">
      <div className="bg-white rounded-2xl shadow p-10 max-w-sm w-full text-center">
        {status === "loading" && (
          <>
            <Loader2 size={40} className="animate-spin text-[#800000] mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Verifying your email...</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-gray-900 font-medium text-lg mb-2">Email Verified!</h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <Link to="/login" className="bg-[#800000] text-[#FFD700] px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#660000] transition-colors">
              Go to Login
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-gray-900 font-medium text-lg mb-2">Verification Failed</h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <Link to="/register" className="bg-[#800000] text-[#FFD700] px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#660000] transition-colors">
              Back to Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
}