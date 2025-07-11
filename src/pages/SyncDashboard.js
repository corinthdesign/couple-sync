import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import { useAuth } from '../contexts/AuthContext.js';
import MetricAverage from '../components/MetricAverage.js';

export default function SyncDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [partnerId, setPartnerId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [userMetrics, setUserMetrics] = useState([]);
  const [partnerMetrics, setPartnerMetrics] = useState([]);
  const pageTitle = "Our Relational Sync";
  const pageIcon = <img alt="" height="15px" src="/logo512.png" />;

  const checkRelationship = useCallback(async () => {
    const { data, error } = await supabase
      .from('relationships')
      .select('user_a, user_b')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

    if (error || !data || data.length === 0) return;

    const relationship = data[0];
    const partnerId = relationship.user_a === user.id ? relationship.user_b : relationship.user_a;
    setPartnerId(partnerId);
  }, [user.id]);

  const fetchProfilesAndMetrics = useCallback(async () => {
    if (!user?.id) return;

    const promises = [
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      partnerId ? supabase.from('profiles').select('*').eq('id', partnerId).single() : Promise.resolve({ data: null }),
      supabase.from('metrics').select('*').eq('user_id', user.id),
      partnerId ? supabase.from('metrics').select('*').eq('user_id', partnerId) : Promise.resolve({ data: [] }),
    ];

    const [{ data: userProfile }, { data: partnerProfile }, { data: userMetrics }, { data: partnerMetrics }] = await Promise.all(promises);

    setUserProfile(userProfile);
    setPartnerProfile(partnerProfile);
    setUserMetrics(userMetrics || []);
    setPartnerMetrics(partnerMetrics || []);
  }, [user.id, partnerId]);

  useEffect(() => {
    checkRelationship();
  }, [checkRelationship]);

  useEffect(() => {
    fetchProfilesAndMetrics();
  }, [fetchProfilesAndMetrics]);

  function AverageDifference({ userMetrics, partnerMetrics }) {
    function calcAverage(metrics) {
      if (!metrics || metrics.length === 0) return null;

      let total = 0;
      let weightSum = 0;

      metrics.forEach((metric) => {
        const numericWeight = parseFloat(metric.weight ?? '1');
        const value = metric.scale_type === 'percentage'
          ? metric.value
          : (metric.value / 10) * 100;

        total += value * numericWeight;
        weightSum += numericWeight;
      });

      return total / weightSum;
    }

    const userAvg = calcAverage(userMetrics);
    const partnerAvg = calcAverage(partnerMetrics);

    if (userAvg === null || partnerAvg === null) return 0;

    return Math.round(userAvg - partnerAvg);
  }

  const rawDifference = AverageDifference({ userMetrics, partnerMetrics });
  const clampedDiff = Math.min(Math.abs(rawDifference), 100);
  const shift = (clampedDiff / 100) * 50;

  const syncPercent = 100 - clampedDiff;

  const glowIntensity = 1 - clampedDiff / 100;
  const glowOpacity = glowIntensity * 1;
  const boxShadow = `0 0 20px rgba(255, 98, 210, ${glowOpacity})`;

  const partnerLinked = !!partnerId && !!partnerProfile;

  return (
    <div className="couples-dashboard">
      <h1 className="pageTitle">{pageIcon}{pageTitle}</h1>
      <div className="couple-header">
        <img alt="" height="50px" src="/logo512.png" />
        <h1>CoupleSync</h1>
      </div>
      <div className="couple-columns">
        <div className="person">
          <img src={userProfile?.photo_url || "/images/defaultUser.png"} className="userPhoto" alt="You" />
          <MetricAverage metrics={userMetrics} />
        </div>
        <div className="person">
          <img src={partnerLinked && partnerProfile?.photo_url ? partnerProfile.photo_url : "/images/defaultUser.png"} className="userPhoto" alt="Partner" />
          {partnerLinked ? (
            <MetricAverage metrics={partnerMetrics} />
          ) : (
            <div className="not-linked">
              <p className="not-linked-message" style={{padding: '0 0 1em 0'}}>
                Link with your partner on the <strong>Partner</strong> page
              </p>
              <button className="btn primary" onClick={() => navigate('/link')}>Go to Partner Page</button>
            </div>
          )}
        </div>
      </div>
      <div className="couple-columns">
        <div className="sync-wrapper" style={{ position: 'relative', height: '150px', marginTop: '2rem' }}>
          {partnerLinked && (
            <>
              <img
                className="sync-gif"
                src="/images/userSync.gif"
                alt="User"
                style={{
                  transform: `translateX(calc(-50% - ${shift}px))`,
                  left: '50%',
                  top: 0,
                  position: 'absolute',
                  height: '150px',
                  opacity: 0.6,
                  borderRadius: '1000px',
                  transition: 'transform 0.5s ease, box-shadow 0.3s ease',
                  transitionDelay: '0.5s',
                  boxShadow
                }}
              />
              <img
                className="sync-gif"
                src="/images/partnerSync.gif"
                alt="Partner"
                style={{
                  transform: `translateX(calc(-50% + ${shift}px))`,
                  left: '50%',
                  top: 0,
                  position: 'absolute',
                  height: '150px',
                  opacity: 0.6,
                  borderRadius: '1000px',
                  transition: 'transform 0.5s ease, box-shadow 0.3s ease',
                  transitionDelay: '0.5s',
                  boxShadow
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: syncPercent === 100 ? '#ff62d2' : '#444',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  pointerEvents: 'none',
                  zIndex: 2,
                  textAlign: 'center',
                }}
              >
                {syncPercent === 100 ? "You're in Sync" : `${syncPercent}% in Sync`}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
