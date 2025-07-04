// Profile.js
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import timezones from '../utils/timezones'; // Assumes you have a timezone list

const loveLanguageOptions = [
  'Words of Affirmation',
  'Acts of Service',
  'Receiving Gifts',
  'Quality Time',
  'Physical Touch'
];

const pageTitle = "Profile";
const pageIcon = <img alt="" height="15px" src="/icons/user-solid-pink.svg" />;

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [topLoveLanguage, setTopLoveLanguage] = useState('');
  const [secondLoveLanguage, setSecondLoveLanguage] = useState('');
  const [timezone, setTimezone] = useState('');
  const [relationshipStartDate, setRelationshipStartDate] = useState('');
  const [photoFile, setAvatarFile] = useState(null);
  const [photoUrl, setAvatarUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
      } else {
        setFullName(data.full_name || '');
        setNickname(data.nickname || '');
        setTopLoveLanguage(data.top_love_language || '');
        setSecondLoveLanguage(data.second_love_language || '');
        setTimezone(data.timezone || '');
        setRelationshipStartDate(data.relationship_start_date || '');

        if (data.photo_url) {
          const { data: publicData } = supabase.storage.from('photos').getPublicUrl(data.photo_url);
          setAvatarUrl(publicData?.publicUrl || null);
        }

        setEmail(user.email);
      }

      setLoading(false);
    }

    loadProfile();
  }, [user.id, user.email]);

  console.log(user.id);

  const handleAvatarUpload = async () => {
    if (!photoFile || !user) return null;

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    if (!accessToken) {
      console.error('No access token available for upload.');
      return null;
    }

    const path = `${user.id}/${photoFile.name}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(path, photoFile, {
        cacheControl: '3600',
        upsert: true,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

    if (uploadError) {
      console.error('Photo upload failed:', uploadError.message);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from('photos')
      .getPublicUrl(path);

    return publicData?.publicUrl || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const photoPath = await handleAvatarUpload();

    const { error } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        full_name: fullName,
        nickname,
        top_love_language: topLoveLanguage,
        second_love_language: secondLoveLanguage,
        timezone,
        relationship_start_date: relationshipStartDate,
        photo_url: photoPath ?? undefined,
      },
      { onConflict: ['id'] }
    );

    if (error) {
      alert('Error saving profile: ' + error.message);
    } else {
      alert('Profile updated successfully!');
      navigate('/');
    }

    setSaving(false);
  };

  if (loading) return <div className="p-4">Loading profile...</div>;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="page-content">
      <div className="p-4 max-w-md mx-auto">
        <h1 className="pageTitle">{ pageIcon }{ pageTitle }</h1>
        <div className="metric-block">
          <form onSubmit={handleSubmit} className="modal-form">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="w-full border p-2 rounded"
            />
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Preferred nickname"
              className="w-full border p-2 rounded"
            />
            <input
              type="email"
              value={email}
              disabled
              className="w-full border p-2 rounded bg-gray-100 text-gray-500"
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

            <div>
              <label className="block mb-1">Time Zone</label>
              <select
                className="w-full border p-2 rounded"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                <option value="">Select your time zone</option>
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">Relationship Start Date</label>
              <input
                type="date"
                value={relationshipStartDate}
                onChange={(e) => setRelationshipStartDate(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Upload New Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files[0])}
                className="w-full"
              />
              {photoUrl && (
                <img src={photoUrl} alt="Current Photo" className="mt-2 h-24 w-24 rounded-full object-cover" />
              )}
            </div>

            <button
              type="submit"
              className="add-btn bg-blue-600 text-white px-4 py-2 rounded w-full"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>

            <button onClick={handleLogout} className="logout-button">
              <div><img alt="" height="15px" src="/icons/right-from-bracket-solid.svg" /></div>
              <span>Logout</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
