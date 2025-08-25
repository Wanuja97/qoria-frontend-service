"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import axios from 'axios';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted with:', { email, password: '***' });

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.post(`${apiUrl}/auth/login`, {
        email,
        password
      });

      console.log('API Response:', response);
      const data = response.data;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('authUser', JSON.stringify(data.data.user));
        localStorage.setItem('isAuthenticated', 'true');
      }

      if (response.status === 200 && data?.data?.token) {
        console.log('Login successful');
        
        toast.success('Login successful!', {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        router.push('/dashboard/overview');
        
      } else if (response.status === 401) {
        console.log('Login failed: Unauthorized');
        toast.error('Invalid credentials. Please try again.', {
          position: "top-right",
          autoClose: 4000,
        });
      } else {
       
        toast.error('Login failed. Please try again.', {
          position: "top-right",
          autoClose: 4000,
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid credentials or network issue. Please try again', {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="m@example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-[#2c3892] hover:bg-[#242d75] disabled:bg-[#9aa0c7] disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
      >
        Login
      </button>

    </form>
  );
};