import React from 'react';
import { useNavigate } from 'react-router-dom';
import investmentImage from './assets/photo/potosss.jpg'; // Add image path

const SignupPage = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    birthDate: {
      day: '',
      month: '',
      year: ''
    },
    gender: '',
    password: ''
    
  });

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    // Format the birthDate as 'YYYY-MM-DD'
    const { day, month, year } = formData.birthDate;
    const dob = `${year}-${month}-${day}`;

    const user = {
      name: formData.name,
      email: formData.email.trim().toLowerCase(), 
      dob,// Normalize email
      gender: formData.gender,
      password: formData.password,
    };

    try {
      // Send POST request to backend API
      const response = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });

      if (response.ok) {
        //const data = await response.json();
        alert('User created:');
        // Navigate to another page on successful signup
        navigate('/login');
      } else {
        const err = await response.json();
        alert('Signup failed: ' + err.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Server error.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle birth date fields
    if (name === 'birth_day' || name === 'birth_month' || name === 'birth_year') {
      const dateField = name.split('_')[1]; // Extract 'day', 'month', or 'year'
      setFormData(prev => ({
        ...prev,
        birthDate: {
          ...prev.birthDate,
          [dateField]: value
        }
      }));
    } else {
      // Handle all other fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="min-h-screen w-screen bg-primary p-4 flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-7xl bg-white m-0 flex flex-row items-center gap-12 h-screen border-2 border-black rounded-3xl">
        <div className="flex-1 text-left">
          <h1 className="text-4xl font-bold text-black mb-6 pl-72 pt-12">Trade Your Plan Not Emotion!</h1>
          <p className="text-black -mt-4 mb-8 pl-80">Join our community of investors and share your investment journey</p>
          <img src={investmentImage} alt="Investment illustration" className="pl-64 max-w-full h-screen w-screen" />
        </div>

        <div className="flex-1 w-full max-w-lg flex justify-center pr-56">
          <div className="bg-white p-8 rounded-3xl h-96 shadow-2xl shadow-black/10 w-full text-center">
            <h2 className="text-4xl font-semibold mb-6 text-center font-nova-bold text-black">Get started</h2>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4 items-center">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  onChange={handleInputChange}
                  value={formData.name}
                  required
                  className="w-3/5 bg-white text-black px-4 py-3 border border-gray-300 rounded-lg text-base text-left focus:outline-none focus:border-primary focus:shadow-lg focus:shadow-blue-100"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  onChange={handleInputChange}
                  value={formData.email}
                  required
                  className="w-3/5 bg-white text-black px-4 py-3 border border-gray-300 rounded-lg text-base text-left focus:outline-none focus:border-primary focus:shadow-lg focus:shadow-blue-100"
                />

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={handleInputChange}
                  value={formData.password}
                  required
                  className="w-3/5 bg-white text-black px-4 py-3 border border-gray-300 rounded-lg text-base text-left focus:outline-none focus:border-primary focus:shadow-lg focus:shadow-blue-100"
                />

                <div className="pl-20 w-3/4 text-center">
                  <label className="block mb-2 text-black text-sm">Date Of Birth</label>
                  <div className="grid grid-cols-3 gap-2 text-black">
                    <select 
                      name="birth_day" 
                      onChange={handleInputChange} 
                      value={formData.birthDate.day} 
                      required
                      className="bg-white text-black px-2 py-2 border border-gray-300 rounded-lg text-sm text-left focus:outline-none focus:border-primary"
                    >
                      <option value="">DD</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={String(day).padStart(2, '0')}>
                          {day}
                        </option>
                      ))}
                    </select>
                    <select 
                      name="birth_month" 
                      onChange={handleInputChange} 
                      value={formData.birthDate.month} 
                      required
                      className="bg-white text-black px-2 py-2 border border-gray-300 rounded-lg text-sm text-left focus:outline-none focus:border-primary"
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={String(month).padStart(2, '0')}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <select 
                      name="birth_year" 
                      onChange={handleInputChange} 
                      value={formData.birthDate.year} 
                      required
                      className="bg-white text-black px-2 py-2 border border-gray-300 rounded-lg text-sm text-left focus:outline-none focus:border-primary"
                    >
                      <option value="">YYYY</option>
                      {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={String(year)}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="w-full flex gap-8 pl-2.5 flex-row justify-end">
                  <label className="flex items-center gap-2 text-gray-600 text-sm">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      onChange={handleInputChange}
                      checked={formData.gender === 'Male'}
                      required
                    />
                    <span>Male</span>
                  </label>
                  <label className="flex items-center gap-2 text-gray-600 text-sm">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      onChange={handleInputChange}
                      checked={formData.gender === 'Female'}
                    />
                    <span>Female</span>
                  </label>
                </div>

                <button type="submit" onClick={handleSubmit} className="w-3/5 py-3 bg-primary text-white border-none rounded-3xl text-base cursor-pointer transition-colors hover:bg-primary">
                  Sign up to Vexter
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;