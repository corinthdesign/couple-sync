import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function PartnerLinkPage() {
  const { user } = useAuth();
  const [partnerCode, setPartnerCode] = useState('');
  const [linkStatus, setLinkStatus] = useState('');
  const [isLinked, setIsLinked] = useState(false);
  const [setPartnerId] = useState(null);
  const [partnerMetrics, setPartnerMetrics] = useState([]);
  const [partnerProfile, setPartnerProfile] = useState(null);

  useEffect(() => {
    checkRelationship();
  }, [user.id]);

  const checkRelationship = async () => {
    const { data, error } = await supabase
      .from('relationships')
      .select('user_a, user_b')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

    if (error) {
      console.error('Error checking relationship:', error);
      return;
    }

    const relationship = data.find(
      (rel) => rel.user_a === user.id || rel.user_b === user.id
    );

    if (relationship) {
      const partner = relationship.user_a === user.id ? relationship.user_b : relationship.user_a;
      setIsLinked(true);
      setPartnerId(partner);
      fetchPartnerMetrics(partner);
      fetchPartnerProfile(partner);
    }
  };

  const generateCode = async () => {
    const code = (user.id.slice(0, 6) + Math.random().toString(36).substring(2, 8)).toUpperCase();
    const { error } = await supabase.from('partner_codes').upsert({ user_id: user.id, code });
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
    const codeToCheck = partnerCode.trim().toUpperCase();
    const { data, error } = await supabase
      .from('partner_codes')
      .select('user_id')
      .eq('code', codeToCheck)
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
      setIsLinked(true);
      setPartnerId(partnerId);
      fetchPartnerMetrics(partnerId);
      fetchPartnerProfile(partnerId);
    }
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
      .select('full_name, photo_url')
      .eq('id', partnerId)
      .single();

    if (!error && data) {
      setPartnerProfile(data);
    } else {
      console.error('Failed to fetch partner profile:', error);
    }
  };

  return (
    <div className="page-content">
      <h1 className="pageTitle">
        <img alt="" height="15px" src="/icons/heart-solid.svg" /> Your Partner
      </h1>
      <div className="dashboard">
        {!isLinked ? (
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
          <div className="metric-block">
            <h2 className="syncNum">
              {partnerProfile?.full_name}
            </h2>
            {partnerProfile?.photo_url && (
              <img
                src={partnerProfile.photo_url}
                alt="Partner photo"
                className="photo"
              />
            )}
            <div className="metric-grid">
              {partnerMetrics.map((metric) => (
                <div key={metric.id} className="metric-block">
                  <div className="metric-header">
                    <span className="metric-name">
                      {metric.icon && Icons[metric.icon] && (
                        <FontAwesomeIcon
                          icon={Icons[metric.icon]}
                          className="metric-icon"
                        />
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
          </div>
        )}

        {linkStatus && !isLinked && <p className="syncNum">{linkStatus}</p>}
      </div>
    </div>
  );
}
