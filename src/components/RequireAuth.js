// src/components/RequireAuth.js
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function RequireAuth({ children }) {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login');
      }
      setChecking(false);
    });
  }, [navigate]);

  if (checking) return <p>Loading...</p>;

  return children;
}