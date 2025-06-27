import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export default function PartnerLinkPage() {
  const { user } = useAuth();
  const [generatedCode, setGeneratedCode] = useState('');
  const [partnerCode, setPartnerCode] = useState('');
  const [linkStatus, setLinkStatus] = useState('');

  const generateCode = async () => {
    const code = user.id.slice(0, 6) + Math.random().toString(36).substring(2, 8);

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
    const { data, error } = await supabase
      .from('partner_codes')
      .select('user_id')
      .eq('code', partnerCode)
      .single();

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
    }
  };

  return (
    <div className="page-content">
      <h1 className="titleh1">Your Partner</h1>
      <div className="dashboard">
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

        {linkStatus && <p className="syncNum">{linkStatus}</p>}
      </div>
    </div>
  );
}
