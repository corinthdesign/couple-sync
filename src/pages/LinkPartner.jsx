import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export default function PartnerLinkPage() {
  const { user } = useAuth();
  const [partnerCode, setPartnerCode] = useState('');
  const [linkStatus, setLinkStatus] = useState('');
  const pageTitle = "Your Partner";
  const pageIcon = <img alt="" height="15px" src="/icons/heart-solid.svg" />;

  const generateCode = async () => {
    // Check if a code already exists
    const { data: existing, error: fetchError } = await supabase
      .from('partner_codes')
      .select('code')
      .eq('user_id', user.id)
      .single();
  
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing code:', fetchError.message);
      setLinkStatus('Failed to check existing code.');
      return;
    }
  
    const code = existing?.code || (user.id.slice(0, 6) + Math.random().toString(36).substring(2, 8)).toUpperCase();
  
    // Save or overwrite the code
    const { error: upsertError } = await supabase
      .from('partner_codes')
      .upsert({ user_id: user.id, code });
  
    if (upsertError) {
      console.error('Error saving code:', upsertError.message);
      setLinkStatus('Error saving code.');
    } else {
      try {
        await navigator.clipboard.writeText(code);
        setLinkStatus('Copied to clipboard!');
      } catch (err) {
        setLinkStatus(`Here’s your code: ${code} (copy failed)`);
      }
    }
  };
  
  
  

  const linkPartner = async () => {
    const cleanedCode = partnerCode.trim().toUpperCase();
    const { data, error } = await supabase
      .from('partner_codes')
      .select('user_id')
      .eq('code', cleanedCode)
      .maybeSingle();
  
    console.log('Partner lookup result:', { data, error });
  
    if (!data?.user_id) {
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
      <h1 className="pageTitle">{ pageIcon }{ pageTitle }</h1>
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
      </div>
    </div>
  );
}
