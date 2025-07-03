import { useState, useEffect } from 'react';
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
  const pageTitle = 'Your Partner';
  const pageIcon = <img alt="" height="15px" src="/icons/heart-solid.svg" />;

  useEffect(() => {
    checkRelationship();
  }, [user.id]);

  const checkRelationship = async () => {
    const { data, error } = await supabase
      .from('relationships')
      .select('*')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

    if (error) {
      console.error('Error checking relationship:', error);
      return;
    }

    if (!data || data.length === 0) {
      return;
    }

    const relationship = data[0];
    const partnerId = relationship.user_a === user.id ? relationship.user_b : relationship.user_a;

    fetchPartnerProfile(partnerId);
    fetchPartnerMetrics(partnerId);
    setPartnerLinked(true);
  };

  const fetchPartnerMetrics = async (partnerId) => {
    const { data, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('user_id', partnerId);

    if (!error && data) {
      setPartnerMetrics(data);
    } else {
      console.error('Failed to fetch partner metrics:', error);
    }
  };

  const fetchPartnerProfile = async (partnerId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', partnerId)
      .single();

    if (!error && data) {
      setPartnerProfile(data);
    } else {
      console.error('Failed to fetch partner profile:', error);
    }
  };

  const generateCode = async () => {
    const code = (user.id.slice(0, 6) + Math.random().toString(36).substring(2, 8)).toUpperCase();

    const { error } = await supabase
      .from('partner_codes')
      .upsert({ user_id: user.id, code });

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
      .eq('code', normalizedCode);

    console.log('Partner lookup result:', { data, error });

    if (error || !data || data.length === 0) {
      return setLinkStatus('Invalid code');
    }

    const partnerId = data[0].user_id;

    const { error: relError } = await supabase
      .from('relationships')
      .insert([{ user_a: partnerId, user_b: user.id }]);

    if (relError) {
      setLinkStatus('Failed to link partner');
    } else {
      setLinkStatus('Partner linked!');
      setPartnerLinked(true);
      fetchPartnerProfile(partnerId);
      fetchPartnerMetrics(partnerId);
    }
  };

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
                placeholder="e.g., ABC123"
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
                <h2>{partnerProfile.full_name}</h2>
                {partnerProfile.avatar_url && (
                  <img
                    src={partnerProfile.avatar_url}
                    alt="Partner Avatar"
                    className="partner-avatar"
                    height="80"
                  />
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
