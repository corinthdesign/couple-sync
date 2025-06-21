import React from 'react';

// src/pages/Login.js
import { useState } from 'react';
import { supabase } from '../supabaseClient';

function Login() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin, // Will go to / on your site
      },
    });

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Check your email for the login link!');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          className="border p-2 mr-2"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Send Magic Link
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}

      <div id="welcome">
      <div id="greeting">
        <h1>❤️</h1>
        <h1>Welcome to Couple Sync</h1>
        <h3>An app created to keep your marriage in sync ♾️</h3>
      </div>
      <div id="intake">
        <div>
          <label for="email">What's Your Email?</label>
          <input id="email" type="text" value="" name="email"></input>
        </div>
        <div id="signin">
        {/* <button class="button secondary">Sign In</button> */}
          <button class="button primary">Send Magic Link</button>
        </div>
      </div>
    </div>
    </div>

  );
}


export default Login;

