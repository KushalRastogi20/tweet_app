"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { email, password } = formData;
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('All fields are required.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.status === 200) {
        // Store the JWT token in localStorage (or any secure storage)
        localStorage.setItem('token', data.token);
        setSuccess('Login successful!');
        
        setTimeout(() => {
          router.push('/dashboard'); // Redirect to dashboard after login
        }, 2000);
      } else {
        setError(data.message || 'Invalid login credentials');
      }
    } catch (error) {
      setError('Something went wrong');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={email} onChange={onChange} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" name="password" value={password} onChange={onChange} required />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
