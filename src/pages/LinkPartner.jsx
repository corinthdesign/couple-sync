import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export default function PartnerLinkPage() {
  const { user } = useAuth();
  const [partnerCode, setPartnerCode] = useState('');
  const [linkStatus, setLinkStatus] = useState('');
  const [partnerLinked, setPartnerLinked] = useState(false);
  const [partnerId, setPartnerId] = useState(null);
  const [partnerMetrics, setPartnerMetrics] = useState([]);

  const pageTitle = "Your Partner";
  const pageIcon = <img alt="" height="15px" src="/icons/heart-solid.svg" />;

  const generateCode = async () => {
    const code = (user.id.slice(0, 6) + Math.random().toString(36).substring(2, 8)).toUpperCase();

    const { error } = await supabase
      .from('partner_codes')
      .upsert({ user_id: user.id, code }, { onConflict: ['user_id'] });

    console.log('Generated code:', code);

    if (error) {
      console.error('Error saving code:', error.message);
      setLinkStatus('Error generating code.');
    } else {
      try {
        await navigator.clipboard.writeText(code);
        setLinkStatus('Copied to clipboard!');
      } catch (err) {
        setLinkStatus('Code generated, but failed to copy');
      }
    }
  };

  const linkPartner = async () => {
    const normalizedCode = partnerCode.trim().toUpperCase();

    const { data, error } = await supabase
      .from('partner_codes')
      .select('user_id')
      .eq('code', normalizedCode)
      .single();

    console.log('Partner lookup result:', { data, error });

    if (error || !data) {
      return setLinkStatus('Invalid code');
    }

    const foundPartnerId = data.user_id;

    const { error: relError } = await supabase
      .from('relationships')
      .insert([{ user_a: foundPartnerId, user_b: user.id }]);

    if (relError) {
      setLinkStatus('Failed to link partner');
    } else {
      setLinkStatus('Partner linked!');
      setPartnerLinked(true);
      setPartnerId(foundPartnerId);
      fetchPartnerMetrics(foundPartnerId);
    }
  };

  const checkRelationship = async () => {
    const { data, error } = await supabase
      .from('relationships')
      .select('*')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

    if (error) {
      console.error('Error checking relationship:', error);
      return;
    }

    if (data && data.length > 0) {
      const relationship = data[0];
      const partnerId = relationship.user_a === user.id ? relationship.user_b : relationship.user_a;
      setPartnerLinked(true);
      setPartnerId(partnerId);
      fetchPartnerMetrics(partnerId);
    }
  };

  const fetchPartnerMetrics = async (partnerId) => {
    const { data, error } = await supabase
      .from('metrics')
      .select('name, value')
      .eq('user_id', partnerId);

    if (!error && data) {
      setPartnerMetrics(data);
    } else {
      console.error('Failed to fetch partner metrics:', error);
    }
  };

  useEffect(() => {
    checkRelationship();
  }, [user.id]);

  return (
    <div className="page-content">
      <h1 className="pageTitle">{pageIcon}{pageTitle}</h1>
      <div className="dashboard">
        {!partnerLinked ? (
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
                placeholder="e.g., abcd12"
              />
              <button onClick={linkPartner} className="save-btn">
                Link Partner
              </button>
            </div>
          </>
        ) : (
          <div className="metric-block">
            <h3>Partner's Metrics</h3>
            <ul>
              {partnerMetrics.map((metric, index) => (
                <li key={index} className="syncNum">
                  {metric.name}: {metric.value}
                </li>
              ))}
            </ul>
          </div>
        )}

        {linkStatus && !partnerLinked && <p className="syncNum">{linkStatus}</p>}
      </div>
    </div>
  );
}
