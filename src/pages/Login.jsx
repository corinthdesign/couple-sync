import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.js';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        navigate('/');
      }
    };

    checkSession();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Check your email for the magic login link! ✨');
    }
  };

  return (
    <div className="page-container" id="welcome">
      <div id="greeting">
        <h1>❤️</h1>
        <h1>Welcome to Couple Sync</h1>
        <h3>An app created to keep your marriage in sync ♾️</h3>
      </div>

      <div id="intake">
        <form onSubmit={handleLogin}>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="What's Your Email?"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="button secondary">
            Send Magic Link
          </button>
        </form>

        {message && <p className="mt-4">{message}</p>}
      </div>
    </div>
  );
}

export default Login;
