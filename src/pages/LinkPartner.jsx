import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import MetricAverage from '../components/MetricAverage';

const VerticalMeter = ({ percentage }) => {
  const capped = Math.max(0, Math.min(100, percentage));
  return (
    <div className="vertical-meter">
      <div
        className="vertical-meter-fill"
        style={{
          height: `${capped}%`,
        }}
      />
    </div>
  );
};

export default function PartnerLinkPage() {
  const { user } = useAuth();
  const [partnerCode, setPartnerCode] = useState('');
  const [linkStatus, setLinkStatus] = useState('');
  const [partnerLinked, setPartnerLinked] = useState(false);
  const [partnerId, setPartnerId] = useState(null);
  const [partnerMetrics, setPartnerMetrics] = useState([]);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [partnerPhotoUrl, setPartnerPhotoUrl] = useState(null);
  const pageTitle = "Your Partner";
  const pageIcon = <img alt="" height="15px" src="/icons/heart-solid.svg" />;

  const generateCode = async () => {
    const code = user.id.slice(0, 6).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase();
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
    const { data, error } = await supabase
      .from('partner_codes')
      .select('user_id')
      .eq('code', partnerCode.toUpperCase())
      .maybeSingle();

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
      setPartnerId(partnerId);
    }
  };

  const checkRelationship = useCallback(async () => {
    const { data, error } = await supabase
      .from('relationships')
      .select('user_a, user_b')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

    if (error) {
      console.error('Error checking relationship:', error);
      return;
    }

    if (data.length > 0) {
      const relationship = data[0];
      const partnerId = relationship.user_a === user.id ? relationship.user_b : relationship.user_a;
      setPartnerLinked(true);
      setPartnerId(partnerId);
    }
  }, [user.id]);

  const fetchPartnerData = useCallback(async () => {
    if (!partnerId) return;

    const [{ data: metrics, error: metricsError }, { data: profile, error: profileError }] = await Promise.all([
      supabase.from('metrics').select('*').eq('user_id', partnerId),
      supabase.from('profiles').select('*').eq('id', partnerId).single()
    ]);

    if (metricsError) console.error('Error fetching metrics:', metricsError);
    if (profileError) console.error('Error fetching profile:', profileError);

    setPartnerMetrics(metrics || []);
    setPartnerProfile(profile || null);

    if (profile?.photo_url) {
      const { data: publicData } = supabase.storage.from('photos').getPublicUrl(profile.photo_url);
      setPartnerPhotoUrl(publicData?.publicUrl || null);
    }
  }, [partnerId]);

  useEffect(() => {
    checkRelationship();
  }, [checkRelationship]);

  useEffect(() => {
    fetchPartnerData();
  }, [fetchPartnerData]);

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
            <div className="pageMessage">
              {partnerPhotoUrl && <img src={partnerProfile?.photo_url || "/images/defaultUser.png"} alt="Profile" className="userPhoto small" />}
              <h2>{partnerProfile?.full_name}</h2>
            </div>

            <div className="average"><h2 className="averageMessage">Their love tank is at</h2><MetricAverage metrics={partnerMetrics} /></div>

            <div className="metric-grid">
              {partnerMetrics.map((metric) => (
                <div key={metric.id} className="metric-block partner">
                  <div className="metric-subblock">
                    <div className="metric-header">
                      <span className="metric-name">
                        {metric.icon && Icons[metric.icon] && (
                          <FontAwesomeIcon icon={Icons[metric.icon]} className="metric-icon" />
                        )}
                        &nbsp;{metric.name}
                      </span>
                    </div>
                    <div className="metric-value">{metric.value}%</div>
                  </div>
                  <div className="metric-subblock">
                    <VerticalMeter percentage={metric.value} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
