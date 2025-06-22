// Onboarding.js
import { useState } from 'react';
import { supabase } from '../supabaseClient.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const loveLanguages = [
  'Words of Affirmation',
  'Acts of Service',
  'Receiving Gifts',
  'Quality Time',
  'Physical Touch'
];

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [primaryLoveLang, setPrimaryLoveLang] = useState('');
  const [secondaryLoveLang, setSecondaryLoveLang] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!primaryLoveLang || !secondaryLoveLang || primaryLoveLang === secondaryLoveLang) {
      alert('Please select two different love languages.');
      setSubmitting(false);
      return;
    }

    // Upload profile photo if provided
    let photoUrl = null;
    if (photoFile) {
      const {error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(`avatars/${user.id}`, photoFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        alert('Error uploading photo: ' + uploadError.message);
        setSubmitting(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('profile_photos')
        .getPublicUrl(`avatars/${user.id}`);
      photoUrl = publicUrlData.publicUrl;
    }

    // Save profile
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        full_name: name,
        nickname,
        top_love_language: primaryLoveLang,
        second_love_language: secondaryLoveLang,
        photo_url: photoUrl,
        onboarding_complete: true,
      },
      { onConflict: ['id'] }
    );

    if (profileError) {
      alert('Error saving: ' + profileError.message);
      setSubmitting(false);
      return;
    }

    // Insert weighted love language metrics
    await supabase.from('metrics').insert([
      {
        user_id: user.id,
        name: primaryLoveLang,
        scale_type: 'number',
        weight: 2,
      },
      {
        user_id: user.id,
        name: secondaryLoveLang,
        scale_type: 'number',
        weight: 2,
      },
    ]);

    navigate('/');
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
          placeholder="Full name"
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Nickname"
          className="w-full border p-2 rounded"
        />
        <div>
          <label className="block font-medium">Primary Love Language</label>
          <select
            value={primaryLoveLang}
            onChange={(e) => setPrimaryLoveLang(e.target.value)}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select...</option>
            {loveLanguages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium">Secondary Love Language</label>
          <select
            value={secondaryLoveLang}
            onChange={(e) => setSecondaryLoveLang(e.target.value)}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select...</option>
            {loveLanguages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium">Upload a profile photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files[0])}
            className="w-full"
          />
        </div>
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
