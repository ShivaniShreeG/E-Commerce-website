import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import BASE_URL from "../api";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
  });
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval;
    if (isOtpSent && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, timer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage("");
    setSuccess(false);
  };

  const handleOtpChange = (e) => setOtp(e.target.value);

  const sendOtpRequest = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone, email: formData.email }),
      });

      const data = await res.json();
      console.log("OTP response:", data);

      if (res.ok && data.success) {
        setMessage("OTP sent to your email.");
        setSuccess(true);
        setIsOtpSent(true);
        setTimer(60);
      } else {
        setMessage(data.message || "Failed to send OTP");
        setSuccess(false);
      }
    } catch (err) {
      console.error("OTP Send Error:", err);
      setMessage("Server unreachable or network error");
      setSuccess(false);
    }
    setLoading(false);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!formData.email.endsWith(".com")) {
      setMessage("Email must end with .com");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    await sendOtpRequest();
  };

  const handleResendOtp = async () => {
    await sendOtpRequest();
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, otp }),
      });

      const data = await res.json();
      console.log("Verify response:", data);

      if (res.ok && data.success) {
        setMessage("Registered successfully");
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data.message || "Invalid OTP or registration failed");
        setSuccess(false);
      }
    } catch (err) {
      console.error("Verify Error:", err);
      setMessage("Server unreachable or network error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-sky-200 to-sky-100 px-4 py-10">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Create Account
        </h2>

        {message && (
          <div
            className={`flex items-center justify-center gap-2 text-sm mb-4 font-semibold ${
              success || message.toLowerCase().includes("otp")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {(success || message.toLowerCase().includes("otp")) && (
              <FiCheckCircle className="text-xl" />
            )}
            {message}
          </div>
        )}

        {!isOtpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            {["name", "email", "phone", "address", "password", "confirmPassword"].map((field) => (
              <div className="relative" key={field}>
                <input
                  type={field.includes("password") ? "password" : "text"}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="peer w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  required
                />
                <label
                  className={`absolute left-3 px-1 bg-white transition-all text-xs text-gray-500
                    ${formData[field] ? "top-[-8px]" : "top-3 text-sm"} 
                    peer-focus:top-[-8px] peer-focus:text-xs peer-focus:text-sky-600`}
                >
                  {field === "confirmPassword"
                    ? "Confirm Password"
                    : field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-lg font-semibold transition duration-200 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndRegister} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={otp}
                onChange={handleOtpChange}
                className="peer w-full p-3 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
              <label
                className={`absolute left-3 px-1 bg-white text-xs text-gray-500 transition-all
                  ${otp ? "top-[-8px]" : "top-3 text-sm"} 
                  peer-focus:top-[-8px] peer-focus:text-xs peer-focus:text-sky-600`}
              >
                OTP
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-lg font-semibold transition duration-200 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Verifying..." : "Verify & Register"}
            </button>

            {timer > 0 ? (
              <p className="text-gray-600 text-sm mt-2">
                Resend OTP in <span className="font-semibold">{timer}s</span>
              </p>
            ) : (
              <button
  type="button"
  onClick={handleResendOtp}
  disabled={loading}
  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2 mt-3 rounded-lg font-semibold shadow-sm transition duration-200"
>
  Resend OTP
</button>
            )}
          </form>
        )}

        <p className="mt-4 text-sm text-gray-700">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-sky-600 font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;
