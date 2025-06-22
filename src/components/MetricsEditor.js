import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export default function MetricsEditor() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [saving, setSaving] = useState(false);

  // Fetch user's metrics on mount
  useEffect(() => {
    async function fetchMetrics() {
      let { data, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('user_id', user.id);
      if (error) {
        console.error('Error fetching metrics:', error);
      } else {
        // Add a local 'value' field to track slider position
        const withValues = data.map((m) => ({
          ...m,
          value: m.value ?? 5, // default 5 if no value yet
        }));
        setMetrics(withValues);
      }
    }
    fetchMetrics();
  }, [user.id]);

  // Handle slider change
  const handleSliderChange = (id, newValue) => {
    setMetrics((prev) =>
      prev.map((m) => (m.id === id ? { ...m, value: newValue } : m))
    );
  };

  // Save updated metrics values to Supabase
  const saveMetrics = async () => {
    setSaving(true);
    const updates = metrics.map(({ id, value }) => ({
      id,
      value,
    }));

    const { error } = await supabase.from('metrics').upsert(updates, {
      onConflict: ['id'],
    });

    if (error) {
      alert('Error saving metrics: ' + error.message);
    } else {
      alert('Metrics updated!');
    }
    setSaving(false);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Update Your Metrics</h2>
      {metrics.map((metric) => (
        <div key={metric.id} className="mb-6">
          <label className="block mb-1">{metric.name}</label>
          <input
            type="range"
            min={0}
            max={10}
            value={metric.value}
            onChange={(e) => handleSliderChange(metric.id, Number(e.target.value))}
            className="w-full"
          />
          <div>{metric.value}</div>
        </div>
      ))}
      <button
        onClick={saveMetrics}
        disabled={saving}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}