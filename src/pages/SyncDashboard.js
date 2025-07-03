import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import MetricAverage from '../components/MetricAverage';

export default function SyncDashboard() {
  const { user } = useAuth();
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
    if (!user?.id || !partnerId) return;

    const [{ data: userProfile }, { data: partnerProfile }, { data: userMetrics }, { data: partnerMetrics }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('profiles').select('*').eq('id', partnerId).single(),
      supabase.from('metrics').select('*').eq('user_id', user.id),
      supabase.from('metrics').select('*').eq('user_id', partnerId),
    ]);

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

  return (
    <div className="couples-dashboard">
             <h1 className="pageTitle">{ pageIcon }{ pageTitle }</h1>
      <div className="couple-header">
        <img alt="" height="50px" src="/logo512.png" />
        <h1>CoupleSync</h1>
      </div>
      <div className="couple-columns">
        <div className="person">
          {userProfile?.photo_url && <img src={userProfile.photo_url} className="userPhoto" alt="You" />}
          <MetricAverage metrics={userMetrics} />
        </div>
        <div className="person">
          {partnerProfile?.photo_url && <img src={partnerProfile.photo_url} className="userPhoto" alt="Partner" />}
          <MetricAverage metrics={partnerMetrics} />
        </div>
      </div>
    </div>
  );
}
