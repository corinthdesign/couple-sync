// 5. src/pages/Dashboard.js [updated to fetch partner's metrics too] 
import { useEffect, useState, useCallback } from 'react'; import { supabase } from '../supabaseClient'; import { useNavigate } from 'react-router-dom'; import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() { const [metrics, setMetrics] = useState([]); const navigate = useNavigate(); const { user, loading } = useAuth();

const fetchMetrics = useCallback(async () => { if (!user) return;

const { data: partnerData } = await supabase
  .from('profiles')
  .select('partner_id')
  .eq('id', user.id)
  .single();

const ids = [user.id];
if (partnerData?.partner_id) ids.push(partnerData.partner_id);

const { data, error } = await supabase
  .from('metrics')
  .select('*')
  .in('user_id', ids);

if (error) console.error(error);
else setMetrics(data);

}, [user]);

useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

if (loading) return <p className="p-4">Checking login status...</p>;

return ( <div className="p-4"> <h1 className="text-xl mb-4">Your Metrics</h1> {metrics.map((metric) => ( <div key={metric.id} className="border p-2 mb-2"> <div>{metric.name} ({metric.user_id.slice(0, 5)})</div> <div> <input type="range" min="0" max={metric.scale_type === 'percentage' ? 100 : 10} defaultValue={metric.latest_value || 0} disabled={metric.user_id !== user.id} onMouseUp={async (e) => { await supabase.from('metric_updates').insert({ user_id: metric.user_id, metric_id: metric.id, value: parseInt(e.target.value) }); }} /> </div> </div> ))} </div> ); }

