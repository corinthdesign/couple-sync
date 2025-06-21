// src/contexts/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../SupabaseClient.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Checking Supabase session...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Session data:', session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });
  
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state change:', session);
      setSession(session);
      setUser(session?.user ?? null);
    });
  
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
