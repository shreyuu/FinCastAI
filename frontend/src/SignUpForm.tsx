import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import investmentImage from "./assets/photo/potosss.jpg";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    birthDate: { day: "", month: "", year: "" },
    gender: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    if (!formData.name || !formData.email || !formData.gender || !formData.password) return false;
    if (!formData.birthDate.day || !formData.birthDate.month || !formData.birthDate.year) return false;
    if (!/\S+@\S+\.\S+/.test(formData.email)) return false;
    if (formData.password.length < 6) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (!validate()) {
      setErrorMsg("Please fill all fields correctly.");
      return;
    }
    setLoading(true);
    const dob = `${formData.birthDate.year}-${formData.birthDate.month}-${formData.birthDate.day}`;
    const user = { ...formData, dob, email: formData.email.trim().toLowerCase() };
    try {
      const response = await fetch("http://localhost:3001/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      if (response.ok) {
        setSuccessMsg("Signup successful! Redirecting...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        const err = await response.json();
        setErrorMsg(err.error || "Signup failed.");
      }
    } catch {
      setErrorMsg("Server error.");
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("birth_")) {
      const dateField = name.split("_")[1];
      setFormData((prev) => ({
        ...prev,
        birthDate: { ...prev.birthDate, [dateField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="min-h-screen w-screen bg-primary flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-lg flex overflow-hidden">
        <div className="flex-1 p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-4 text-primary">Create your account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="input-field"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="input-field"
            />
            <div className="flex gap-2">
              <select
                name="birth_day"
                value={formData.birthDate.day}
                onChange={handleInputChange}
                required
                className="input-field">
                <option value="">DD</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={String(day).padStart(2, "0")}>
                    {day}
                  </option>
                ))}
              </select>
              <select
                name="birth_month"
                value={formData.birthDate.month}
                onChange={handleInputChange}
                required
                className="input-field">
                <option value="">MM</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={String(month).padStart(2, "0")}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                name="birth_year"
                value={formData.birthDate.year}
                onChange={handleInputChange}
                required
                className="input-field">
                <option value="">YYYY</option>
                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <option key={year} value={String(year)}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-4">
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={formData.gender === "Male"}
                  onChange={handleInputChange}
                  required
                />{" "}
                Male
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={formData.gender === "Female"}
                  onChange={handleInputChange}
                  required
                />{" "}
                Female
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Other"
                  checked={formData.gender === "Other"}
                  onChange={handleInputChange}
                  required
                />{" "}
                Other
              </label>
            </div>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 6 chars)"
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
              {loading ? "Signing up..." : "Sign Up"}
            </button>
            {errorMsg && <div className="text-red-600 text-sm">{errorMsg}</div>}
            {successMsg && <div className="text-green-600 text-sm">{successMsg}</div>}
          </form>
        </div>
        <div className="flex-1 bg-primary flex items-center justify-center">
          <img src={investmentImage} alt="Investment" className="max-w-full h-auto rounded-3xl" />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
