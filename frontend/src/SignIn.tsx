import React, { useState } from 'react';
import investmentImage from './assets/photo/potosss.jpg';
import { useNavigate } from 'react-router-dom';

const SignInPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const [loginMessage, setLoginMessage] = useState('');
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formData);

    // Send a request to the backend to check if the credentials are valid
    try {
      const response = await fetch('http://localhost:3001/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setLoginMessage('Login successful!');
        localStorage.setItem("user", JSON.stringify(data.user)); // Save user info
        setTimeout(() => {
          setLoginMessage('');
          navigate('/dashboard');
        }, 2000);
      } else {
        alert('Login failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Server error. Please try again later.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen w-screen bg-primary p-4 flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-7xl bg-white m-0 flex flex-row items-center gap-12 h-screen border-2 border-black rounded-3xl">
        {/* Left side content */}
        <div className="flex-1 text-left">
          <h1 className="text-4xl font-bold text-black mb-6 pl-72 pt-12">Trade Your Plan Not Emotion!</h1>
          <p className="text-black -mt-4 mb-8 pl-80">Join our community of investors and share your investment journey</p>
          <img src={investmentImage} alt="Investment illustration" className="pl-64 max-w-full h-screen w-screen" />
        </div>

        {/* Right side form */}
        <div className="flex-1 w-full max-w-md flex justify-center pr-56">
          <div className="bg-white p-8 rounded-3xl h-96 shadow-2xl shadow-black/10 w-full text-center">
            <h2 className="text-4xl font-semibold mb-2 text-center font-nova-bold text-black">Welcome back</h2>
            <p className="text-black">Welcome back! Please enter your details.</p>
            <form onSubmit={handleSubmit}>
              <label htmlFor="email" className="block text-left w-24 font-bold mt-2.5 mr-96 text-black">Email</label>
              <div className="flex flex-col gap-4 items-center">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-white text-black px-4 py-3 border border-gray-300 rounded-lg text-base text-left focus:outline-none focus:border-primary focus:shadow-lg focus:shadow-blue-100"
                />

                <label htmlFor="password" className="block text-left w-24 font-bold mt-2.5 mr-96 text-black">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-white text-black px-4 py-3 border border-gray-300 rounded-lg text-base text-left focus:outline-none focus:border-primary focus:shadow-lg focus:shadow-blue-100"
                />
              </div>

              <a href="#" className="text-right w-full block my-2.5 text-primary no-underline">Forgot password</a>

              <button type="submit" className="w-full py-3 bg-primary text-white border-none rounded-3xl text-base cursor-pointer transition-colors hover:bg-primary">Login</button>

              <button className="w-full py-3 bg-white border border-gray-300 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#EA4335" d="M12 5.04c1.44 0 2.88.49 4.13 1.46l3.01-3.02C17.12 1.77 14.63.85 12 .85c-4.1 0-7.65 2.34-9.38 5.75l3.52 2.73c.84-2.51 3.18-4.29 5.86-4.29z"/>
                  <path fill="#34A853" d="M23.15 12.34c0-.81-.07-1.59-.21-2.34H12v4.42h6.29c-.27 1.44-1.09 2.66-2.32 3.48l3.36 2.61c1.96-1.82 3.09-4.49 3.09-7.67z"/>
                  <path fill="#FBBC05" d="M5.14 14.48c-.21-.63-.33-1.31-.33-2.01c0-.7.12-1.37.33-2.01l-3.52-2.73c-.72 1.44-1.12 3.06-1.12 4.74s.4 3.3 1.12 4.74l3.52-2.73z"/>
                  <path fill="#4285F4" d="M12 23.15c3.04 0 5.59-1.01 7.45-2.73l-3.36-2.61c-.93.62-2.12.99-4.09.99c-2.68 0-5.02-1.78-5.86-4.29l-3.52 2.73c1.73 3.41 5.28 5.75 9.38 5.75z"/>
                </svg>
              </button>
            </form>
             {loginMessage && <div className={`mt-2.5 p-2.5 text-center rounded-lg text-sm transition-opacity duration-500 ${loginMessage.includes('successful') ? 'bg-white text-green-500' : 'bg-red-500 text-white'}`}>{loginMessage}</div>}

            <p className="text-gray-600 text-sm mb-4">Don't have an account? <a href="#" onClick={() => navigate('/about')} className="text-primary no-underline font-bold">Sign up for free</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
