import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export default function PartnerLinkPage() {
  const { user } = useAuth();
  const [partnerId, setPartnerId] = useState(null);
  const [partnerMetrics, setPartnerMetrics] = useState([]);
  const [partnerCode, setPartnerCode] = useState('');
  const [linkStatus, setLinkStatus] = useState('');

  // 🔄 Check for existing relationship on load
  useEffect(() => {
    const checkExistingRelationship = async () => {
      const { data, error } = await supabase
        .from('relationships')
        .select('user_a, user_b')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

      if (error) {
        console.error('Relationship fetch error:', error);
        return;
      }

      const match = data?.[0];
      if (match) {
        const partner = match.user_a === user.id ? match.user_b : match.user_a;
        setPartnerId(partner);
        fetchPartnerMetrics(partner);
      }
    };

    checkExistingRelationship();
  }, [user.id]);

  const fetchPartnerMetrics = async (partnerId) => {
    const { data, error } = await supabase
      .from('metrics')
      .select('name, value')
      .eq('user_id', partnerId);

    if (error) {
      console.error('Failed to fetch partner metrics:', error);
    } else {
      setPartnerMetrics(data);
    }
  };

  const generateCode = async () => {
    const code =
      user.id.slice(0, 6).toUpperCase() +
      Math.random().toString(36).substring(2, 8).toUpperCase();

    const { error } = await supabase
      .from('partner_codes')
      .upsert({ user_id: user.id, code }, { onConflict: ['user_id'] });

    if (error) {
      console.error('Error saving code:', error.message);
      setLinkStatus('Error generating code.');
    } else {
      try {
        await navigator.clipboard.writeText(code);
        setLinkStatus('Copied to clipboard!');
      } catch {
        setLinkStatus('Code generated, but failed to copy');
      }
    }
  };

  const linkPartner = async () => {
    const code = partnerCode.toUpperCase().trim();
    const { data, error } = await supabase
      .from('partner_codes')
      .select('user_id')
      .eq('code', code)
      .single();

    console.log('Lookup result:', data, error);

    if (error || !data) {
      return setLinkStatus('Invalid code');
    }

    const partnerId = data.user_id;
    const { error: relError } = await supabase
      .from('relationships')
      .insert([{ user_a: user.id, user_b: partnerId }]);

    if (relError) {
      console.error('Failed to link partner:', relError);
      setLinkStatus('Linking failed');
    } else {
      setLinkStatus('Partner linked!');
      setPartnerId(partnerId);
      fetchPartnerMetrics(partnerId);
    }
  };

  return (
    <div className="page-content">
      <h1 className="titleh1">Your Partner</h1>
      <div className="dashboard">
        {partnerId ? (
          <div className="metric-block">
            <h2 className="pageMessage">Your Partner's Metrics</h2>
            <ul>
              {partnerMetrics.map((m, i) => (
                <li key={i} className="syncNum">
                  {m.name}: {m.value}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            <div className="pageMessage">
              <h2>You haven't linked a partner yet!</h2>
            </div>

            <div className="metric-block">
              <h3>Give this code to your partner</h3>
              <button onClick={generateCode} className="add-btn">
                {linkStatus || 'Get Your Unique Code'}
              </button>
            </div>

            <div className="metric-block modal-form">
              <label><h3>Enter Partner's Code:</h3></label>
              <input
                type="text"
                value={partnerCode}
                onChange={(e) => setPartnerCode(e.target.value)}
                placeholder="e.g., ABC123"
              />
              <button onClick={linkPartner} className="save-btn">
                Link Partner
              </button>
            </div>

            {linkStatus && <p className="syncNum">{linkStatus}</p>}
          </>
        )}
      </div>
    </div>
  );
}
