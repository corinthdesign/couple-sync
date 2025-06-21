import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export default function Onboarding() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (loading || !user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_complete')
        .eq('id', user.id)
        .single();

      if (profile?.onboarding_complete) {
        navigate('/');
      }
    };
    checkOnboarding();
  }, [user, loading, navigate]);

  const handleSubmit = async () => {
    setSubmitting(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name, onboarding_complete: true })
      .eq('id', user.id);

    if (error) {
      alert('Error saving: ' + error.message);
      setSubmitting(false);
    } else {
      navigate('/');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Welcome! Let’s get started.</h1>
      <input
        className="border p-2 w-full mb-4"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {submitting ? 'Saving...' : 'Continue'}
      </button>
    </div>
  );
}
