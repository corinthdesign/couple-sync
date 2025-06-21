// Onboarding.js
import { useState } from 'react';
import { supabase } from '../supabaseClient.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    console.log('Submitting profile:', name);

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: name,
        onboarding_complete: true,
      });

    if (error) {
      alert('Error saving: ' + error.message);
      setSubmitting(false);
    } else {
      console.log('Profile saved! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 500);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
      <p className="mb-2">Let’s get your profile set up.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
