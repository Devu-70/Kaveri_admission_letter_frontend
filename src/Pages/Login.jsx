import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../config/config';
import { jwtDecode } from 'jwt-decode';
import bgVideo from '../assets/video-new.mp4';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await axios.post(`${config.apiUrl}/users/login`, {
        email,
        password,
      });

      const token = response.data?.token;

      if (token) {
        const decoded = jwtDecode(token);
        const role = decoded?.role;

        if (role === 'manager') {
          localStorage.setItem('token', token);
          navigate('/', { state: { token } });
        } else {
          setErrorMsg('Access denied. You are not Authorized.');
        }
      } else {
        setErrorMsg('Invalid token received.');
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        className="absolute top-0 left-0 w-full h-full object-cover z-[-2]"
      >
        <source src={bgVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/80 backdrop-brightness-50 z-[-1]"></div>

      {/* Login Form */}
      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md px-6"
      >
        <h2 className="text-xl mb-2 text-center">Welcome to Kaveri Institutions</h2>
        <hr className="mb-4 border-neutral-600" />

        {errorMsg && (
          <div className="mb-4 text-red-500 text-sm text-center">{errorMsg}</div>
        )}

        <div className="mb-4">
          <label className="block mb-1 text-sm text-gray-200">Email</label>
          <input
            type="email"
            className="w-full px-4 py-2 bg-white/10 text-white rounded-2xl outline-none shadow-md focus:ring-2 focus:ring-yellow-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6 relative">
          <label className="block mb-1 text-sm text-gray-200">Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            className="w-full px-4 py-2 bg-white/10 text-white rounded-2xl outline-none shadow-md focus:ring-2 focus:ring-yellow-400 pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] cursor-pointer text-white"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 transition rounded-2xl text-white font-semibold shadow-lg flex items-center justify-center"
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
              ></path>
            </svg>
          ) : (
            'Login'
          )}
        </button>
      </form>
    </div>
  );
};

export default Login;
