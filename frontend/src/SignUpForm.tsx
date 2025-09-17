import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css'; // Add your styling
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
    <div className="signup-container">
      <div className="main-content1">
        <div className="left-content">
          <h1>Trade Your Plan Not Emotion!</h1>
          <p>Join our community of investors and share your investment journey</p>
          <img src={investmentImage} alt="Investment illustration" />
        </div>

        <div className="form-wrappers">
          <div className="form-containers">
            <h2>Get started</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-fieldss">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  onChange={handleInputChange}
                  value={formData.name}
                  required
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  onChange={handleInputChange}
                  value={formData.email}
                  required
                />

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={handleInputChange}
                  value={formData.password}
                  required
                />

                <div className="birth-date">
                  <label>Date Of Birth</label>
                  <div className="date-selects">
                    <select 
                      name="birth_day" 
                      onChange={handleInputChange} 
                      value={formData.birthDate.day} 
                      required
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

                <div className="gender-optionss">
                  <label>
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
                  <label>
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

                <button type="submit" onClick={handleSubmit} className="submit-btn" >
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