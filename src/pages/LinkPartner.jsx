import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function PartnerLinkPage() {
  const { user } = useAuth();
  const [partnerCode, setPartnerCode] = useState('');
  const [linkStatus, setLinkStatus] = useState('');
  const [partnerLinked, setPartnerLinked] = useState(false);
  const [partnerMetrics, setPartnerMetrics] = useState([]);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const pageTitle = "Your Partner";
  const pageIcon = <img alt="" height="15px" src="/icons/heart-solid.svg" />;

  const generateCode = async () => {
    const code = (user.id.slice(0, 6) + Math.random().toString(36).substring(2, 8)).toUpperCase();
    const { error } = await supabase.from('partner_codes').upsert({ user_id: user.id, code });

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
    const cleanedCode = partnerCode.trim().toUpperCase();
    const { data, error } = await supabase
      .from('partner_codes')
      .select('user_id')
      .eq('code', cleanedCode)
      .single();

    console.log('Partner lookup result:', { data, error });

    if (error || !data) {
      return setLinkStatus('Invalid code');
    }

    const partnerId = data.user_id;

    const { error: relError } = await supabase
      .from('relationships')
      .insert([{ user_a: partnerId, user_b: user.id }]);

    if (relError) {
      setLinkStatus('Failed to link partner');
    } else {
      setLinkStatus('Partner linked!');
      setPartnerLinked(true);
      fetchPartnerData(partnerId);
    }
  };

  const fetchPartnerData = async (partnerId) => {
    const { data: metricsData, error: metricsError } = await supabase
      .from('metrics')
      .select('*')
      .eq('user_id', partnerId);

    if (!metricsError) {
      setPartnerMetrics(metricsData);
    } else {
      console.error('Error fetching partner metrics:', metricsError);
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', partnerId)
      .single();

    if (!profileError) {
      setPartnerProfile(profileData);
    } else {
      console.error('Error fetching partner profile:', profileError);
    }
  };

  const checkRelationship = useCallback(async () => {
    const { data, error } = await supabase
      .from('relationships')
      .select('*')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

    if (error) {
      console.error('Error checking relationship:', error);
      return;
    }

    if (!data || data.length === 0) return;

    const match = data[0];
    const partnerId = match.user_a === user.id ? match.user_b : match.user_a;
    setPartnerLinked(true);
    fetchPartnerData(partnerId);
  }, [user.id]);

  useEffect(() => {
    if (user?.id) checkRelationship();
  }, [user?.id, checkRelationship]);

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
                placeholder="e.g., ABCD12"
              />
              <button onClick={linkPartner} className="save-btn">
                Link Partner
              </button>
            </div>
          </>
        ) : (
          <>
            {partnerProfile && (
              <div className="pageMessage">
                <h2>Partner: {partnerProfile.name}</h2>
                {partnerProfile.avatar_url && (
                  <img src={partnerProfile.avatar_url} alt="Partner avatar" className="avatar" />
                )}
              </div>
            )}
            <div className="metric-grid">
              {partnerMetrics.map((metric) => (
                <div key={metric.id} className="metric-block">
                  <div className="metric-header">
                    <span className="metric-name">
                      {metric.icon && Icons[metric.icon] && (
                        <FontAwesomeIcon icon={Icons[metric.icon]} className="metric-icon" />
                      )}
                      &nbsp;{metric.name}
                    </span>
                  </div>
                  <div className="metric-subblock">
                    <div className="metric-value">{metric.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {linkStatus && !partnerLinked && <p className="syncNum">{linkStatus}</p>}
      </div>
    </div>
  );
}
