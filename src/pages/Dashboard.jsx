import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMetrics() {
      let { data, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching metrics:', error);
      } else {
        const withValues = data.map((m) => ({
          ...m,
          value: m.value ?? 5,
        }));
        setMetrics(withValues);
      }
    }

    fetchMetrics();
  }, [user.id]);

  const handleSliderChange = (id, newValue) => {
    setMetrics((prev) =>
      prev.map((m) => (m.id === id ? { ...m, value: newValue } : m))
    );
  };

  const saveMetrics = async () => {
    setSaving(true);
    for (let metric of metrics) {
      const { error } = await supabase
        .from('metrics')
        .update({ value: metric.value })
        .eq('id', metric.id)
        .eq('user_id', user.id);

      if (error) {
        alert(`Error updating metric "${metric.name}": ${error.message}`);
        setSaving(false);
        return;
      }
    }
    alert('Metrics updated!');
    setSaving(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert('Logout failed: ' + error.message);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Dashboard</h1>
      {metrics.map((metric) => (
        <div key={metric.id} className="mb-6">
          <label className="block mb-1 font-medium">{metric.name}</label>
          <input
            type="range"
            min={0}
            max={10}
            value={metric.value}
            onChange={(e) => handleSliderChange(metric.id, Number(e.target.value))}
            className="w-full"
          />
          <div className="text-sm text-gray-700">Value: {metric.value}</div>
        </div>
      ))}
      <button
        onClick={saveMetrics}
        disabled={saving}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>

      <button
        onClick={handleLogout}
        className="mt-6 bg-red-600 text-white px-4 py-2 rounded w-full"
      >
        Log Out
      </button>
    </div>
  );
}
