import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import investmentImage from "./assets/photo/potosss.jpg";

const SignInPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const navigate = useNavigate();

  const validate = () => /\S+@\S+\.\S+/.test(formData.email) && formData.password.length >= 6;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginMessage("");
    if (!validate()) {
      setLoginMessage("Please enter a valid email and password.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setLoginMessage("Login successful!");
        localStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => navigate("/dashboard"), 1200);
      } else {
        setLoginMessage(data.error || "Login failed.");
      }
    } catch {
      setLoginMessage("Server error. Please try again later.");
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen w-screen bg-primary flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-lg flex overflow-hidden">
        <div className="flex-1 p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-4 text-primary">Welcome back</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="input-field"
            />
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="input-field pr-10"
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-sm"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Toggle password visibility">
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            {loginMessage && (
              <div
                className={`text-center text-sm mt-2 ${
                  loginMessage.includes("successful") ? "text-green-600" : "text-red-600"
                }`}>
                {loginMessage}
              </div>
            )}
            <p className="text-gray-600 text-sm mt-4">
              Don't have an account?{" "}
              <span className="text-primary font-bold cursor-pointer" onClick={() => navigate("/about")}>
                Sign up for free
              </span>
            </p>
          </form>
        </div>
        <div className="flex-1 bg-primary flex items-center justify-center">
          <img src={investmentImage} alt="Investment" className="max-w-full h-auto rounded-3xl" />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
