// src/pages/Dashboard.js
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient.js';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const [metrics, setMetrics] = useState([]);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetchMetrics();
  }, [user]);

  const fetchMetrics = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('partner_id')
      .eq('id', user.id)
      .single();

    const ids = [user.id];
    if (profile?.partner_id) ids.push(profile.partner_id);

    const { data, error } = await supabase
      .from('metrics')
      .select('*')
      .in('user_id', ids);

    if (error) console.error(error);
    else setMetrics(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading) return <p className="p-4">Checking login status...</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl">Welcome, {user.name}</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Log Out
        </button>
      </div>

      <h2 className="text-lg mb-2">Your Metrics</h2>
      {metrics.map((metric) => (
        <div key={metric.id} className="border p-2 mb-2">
          <div>{metric.name} ({metric.user_id.slice(0, 5)})</div>
          <input
            type="range"
            min="0"
            max={metric.scale_type === 'percentage' ? 100 : 10}
            defaultValue={metric.latest_value || 0}
            disabled={metric.user_id !== user.id}
            onMouseUp={async (e) => {
              await supabase.from('metric_updates').insert({
                user_id: metric.user_id,
                metric_id: metric.id,
                value: parseInt(e.target.value)
              });
            }}
          />
        </div>
      ))}
    </div>
  );
}


