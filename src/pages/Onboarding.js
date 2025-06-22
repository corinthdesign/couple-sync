// Onboarding.js
import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const loveLanguageOptions = [
  'Words of Affirmation',
  'Acts of Service',
  'Receiving Gifts',
  'Quality Time',
  'Physical Touch'
];

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [topLoveLanguage, setTopLoveLanguage] = useState('');
  const [secondLoveLanguage, setSecondLoveLanguage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          full_name: fullName,
          nickname,
          top_love_language: topLoveLanguage,
          second_love_language: secondLoveLanguage,
          onboarding_complete: true,
        },
        { onConflict: ['id'] }
      );

    if (profileError) {
      alert('Error saving: ' + profileError.message);
      setSubmitting(false);
      return;
    }

    const { error: metricError } = await supabase.from('metrics').insert([
      {
        user_id: user.id,
        name: topLoveLanguage,
        scale_type: 'number',
        weight: 2,
      },
      {
        user_id: user.id,
        name: secondLoveLanguage,
        scale_type: 'number',
        weight: 2,
      }
    ]);

    if (metricError) {
      alert('Error creating metrics: ' + metricError.message);
      setSubmitting(false);
      return;
    }

    navigate('/');
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Preferred nickname"
          className="w-full border p-2 rounded"
        />
        <div>
          <label className="block mb-1">Top Love Language</label>
          <select
            value={topLoveLanguage}
            onChange={(e) => setTopLoveLanguage(e.target.value)}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select...</option>
            {loveLanguageOptions.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Second Love Language</label>
          <select
            value={secondLoveLanguage}
            onChange={(e) => setSecondLoveLanguage(e.target.value)}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select...</option>
            {loveLanguageOptions
              .filter((lang) => lang !== topLoveLanguage)
              .map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : 'Complete Onboarding'}
        </button>
      </form>
    </div>
  );
}