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
        if (!loading && !user) {
            navigate('/login');
          }
      
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('onboarding_complete')
            .eq('id', user.id)
            .single();
      
          if (error && error.code !== 'PGRST116') { // 'PGRST116' = no rows found error
            console.error(error);
          }

          await ensureProfileExists(user.id)
      
          if (!profile?.onboarding_complete && location.pathname !== '/onboarding') {
            navigate('/onboarding');
          }
        } catch (err) {
          console.error(err);
        } finally {
          setCheckingProfile(false); // <-- always run this to stop loading state
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

  if (loading || checkingProfile) return <p>Checking session...</p>;

  return children;
}
