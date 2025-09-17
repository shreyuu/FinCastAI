import React, { useState } from "react";
import axios from "axios";

const SignupForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dob: "",
    gender: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/signup", formData);
      alert("Signup successful!");
    } catch (error) {
      console.error(error);
      alert("Signup failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="signup-form">
      <input type="text" name="name" placeholder="Name" required onChange={handleChange} />
      <input type="email" name="email" placeholder="Email" required onChange={handleChange} />
      <input type="date" name="dob" required onChange={handleChange} />
      <select name="gender" required onChange={handleChange}>
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default SignupForm;
