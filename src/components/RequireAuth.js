import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (loading) return; // still loading auth state

      if (!user) {
        navigate('/login');
        return;
      }

      try {
        await ensureProfileExists(user.id);

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_complete')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Profile fetch error:', error);
        }

        if (!profile?.onboarding_complete && location.pathname !== '/onboarding') {
          navigate('/onboarding');
        }
      } catch (err) {
        console.error('Error in RequireAuth:', err);
      } finally {
        setCheckingProfile(false);
      }
    };

    const ensureProfileExists = async (userId) => {
      const { data } = await supabase.from('profiles').select('id').eq('id', userId).single();
      if (!data) {
        await supabase.from('profiles').insert([{ id: userId }]);
      }
    };

    checkProfile();
  }, [user, loading, location.pathname, navigate]);

  if (loading || checkingProfile) {
    return <p>Checking session...</p>;
  }

  return children;
}
