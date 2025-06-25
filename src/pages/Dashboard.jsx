import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [metricToEdit, setMetricToEdit] = useState(null);

  useEffect(() => {
    async function fetchMetrics() {
      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('user_id', user.id);
      if (error) {
        console.error('Error fetching metrics:', error);
        setMetrics([]);
      } else {
        const withValues = (data ?? []).map((m) => ({
          ...m,
          value: m.value ?? 5,
        }));
        setMetrics(withValues);
      }
    }

    fetchMetrics();
  }, [user.id]);

  const handleSliderChange = (id, newValue) => {
    setMetrics((prev) =>
      prev.map((m) => (m.id === id ? { ...m, value: newValue } : m))
    );
  };

  const saveMetrics = async () => {
    setSaving(true);
    for (let metric of metrics) {
      const { error } = await supabase
        .from('metrics')
        .update({ value: metric.value })
        .eq('id', metric.id)
        .eq('user_id', user.id);

      if (error) {
        alert(`Error updating metric "${metric.name}": ${error.message}`);
        setSaving(false);
        return;
      }
    }
    alert('Metrics updated!');
    setSaving(false);
  };

  const handleAddMetric = async ({ name, scale_type, icon }) => {
    const { data, error } = await supabase
      .from('metrics')
      .insert([
        {
          user_id: user.id,
          name,
          scale_type,
          icon,
          value: scale_type === 'percentage' ? 50 : 5,
        },
      ])
      .select();

    if (error) {
      alert(`Error adding metric: ${error.message}`);
    } else {
      const inserted = (data ?? []).map((m) => ({
        ...m,
        value: m.value ?? (m.scale_type === 'percentage' ? 50 : 5),
      }));
      setMetrics((prev) => [...prev, ...inserted]);
      setModalOpen(false);
    }
  };

  const openEditModal = (metric) => {
    setMetricToEdit(metric);
    setEditModalOpen(true);
  };

  function AddMetricModal({ isOpen, onClose, onSave }) {
    const [name, setName] = useState('');
    const [scaleType, setScaleType] = useState('number');
    const [icon, setIcon] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!name.trim()) return alert('Please enter a name');
      onSave({ name: name.trim(), scale_type: scaleType, icon });
      setName('');
      setScaleType('number');
      setIcon('');
    };

    return (
      <div className="modal-overlay">
        <form className="modal" onSubmit={handleSubmit}>
          <h2>Add New Metric</h2>

          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Scale</label>
          <select
            value={scaleType}
            onChange={(e) => setScaleType(e.target.value)}
          >
            <option value="number">0–10</option>
            <option value="percentage">Percentage</option>
          </select>

          <label>Icon (coming soon)</label>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="Emoji or icon name"
            disabled
          />

          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="btn secondary">
              Cancel
            </button>
            <button type="submit" className="btn primary">Add</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="dashboard">
        <h1>Your Dashboard</h1>

        {metrics.map((metric) => (
          <div key={metric.id} className="metric-block">
            <div className="metric-header">
              <span className="metric-name">{metric.name}</span>
              <button onClick={() => openEditModal(metric)} className="edit-btn">⚙️</button>
            </div>
            <input
              type="range"
              min={0}
              max={metric.scale_type === 'percentage' ? 100 : 10}
              value={metric.value}
              onChange={(e) => handleSliderChange(metric.id, Number(e.target.value))}
            />
            <div className="metric-value">Value: {metric.value}</div>
          </div>
        ))}

        <button onClick={saveMetrics} disabled={saving} className="save-btn">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

        <button onClick={() => setModalOpen(true)} className="add-btn">
          ➕ Add New Metric
        </button>

        <AddMetricModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleAddMetric}
        />
      </div>
    </div>
  );
}
