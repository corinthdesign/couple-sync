import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import MetricAverage from '../components/MetricAverage';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [metricToEdit, setMetricToEdit] = useState(null);
  const pageTitle = "CoupleSync";
  const pageIcon = <img alt="" height="15px" src="/logo512.png" />;

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
      prev.map((m) =>
        m.id === id ? { ...m, value: parseFloat(newValue) } : m
      )
    );
  };

  const iconOptions = Object.entries(Icons)
  .filter(([key, val]) => key.startsWith('fa') && val.iconName)
  .map(([key, val]) => ({
    name: key,         // e.g. 'faHeart'
    label: val.iconName, // e.g. 'heart'
    icon: val,
  }));

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

  const handleEditSave = async (updatedMetric) => {
    const { error } = await supabase
      .from('metrics')
      .update({
        name: updatedMetric.name,
        scale_type: updatedMetric.scale_type,
        icon: updatedMetric.icon,
      })
      .eq('id', updatedMetric.id)
      .eq('user_id', user.id);

    if (error) {
      alert(`Error updating metric: ${error.message}`);
      return;
    }

    setMetrics((prev) =>
      prev.map((m) =>
        m.id === updatedMetric.id ? { ...m, ...updatedMetric } : m
      )
    );
    setEditModalOpen(false);
  };

  const handleDeleteMetric = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this metric?');
    if (!confirm) return;

    const { data, error } = await supabase
      .from('metrics')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

      console.log('Deleted metric result:', data, error);

    if (error) {
      alert(`Error deleting metric: ${error.message}`);
      return;
    }

    setMetrics((prev) => prev.filter((m) => m.id !== id));
    setEditModalOpen(false);
  };

  function AddMetricModal({ isOpen, onClose, onSave }) {
    const [name, setName] = useState('');
    const [scaleType, setScaleType] = useState('number');
    const [icon, setIcon] = useState('');
    const [iconSearch, setIconSearch] = useState('');

    const filteredIcons = iconOptions.filter(({ name, label }) =>
      name.toLowerCase().includes(iconSearch.toLowerCase()) ||
      label.toLowerCase().includes(iconSearch.toLowerCase())
    );

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
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

          <label>Scale</label>
          <select value={scaleType} onChange={(e) => setScaleType(e.target.value)}>
            <option value="number">0–10</option>
            <option value="percentage">Percentage</option>
          </select>

          <label>Select Icon</label>
          <input
            type="text"
            placeholder="Search icons..."
            value={iconSearch}
            onChange={(e) => setIconSearch(e.target.value)}
            className="icon-search-input"
          />
          <div className="icon-grid">
            {filteredIcons.map(({ name, icon: faIcon }) => (
              <button
                key={name}
                type="button"
                className={`icon-button ${icon === name ? 'selected' : ''}`}
                onClick={() => setIcon(name)}
                title={faIcon.iconName}
              >
                <FontAwesomeIcon icon={faIcon} />
              </button>
            ))}
          </div>

          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="btn secondary">Cancel</button>
            <button type="submit" className="btn primary">Add</button>
          </div>
        </form>
      </div>
    );
  }

  function EditMetricModal({ isOpen, onClose, onSave, onDelete, metric }) {
    const [name, setName] = useState(metric?.name || '');
    const [scaleType, setScaleType] = useState(metric?.scale_type || 'number');
    const [icon, setIcon] = useState(metric?.icon || '');
    const [iconSearch, setIconSearch] = useState('');

    useEffect(() => {
      setName(metric?.name || '');
      setScaleType(metric?.scale_type || 'number');
      setIcon(metric?.icon || '');
    }, [metric]);

    const filteredIcons = iconOptions.filter(({ name, label }) =>
      name.toLowerCase().includes(iconSearch.toLowerCase()) ||
      label.toLowerCase().includes(iconSearch.toLowerCase())
    );

    if (!isOpen || !metric) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave({ id: metric.id, name: name.trim(), scale_type: scaleType, icon });
    };

    const isProtected = ['Words of Affirmation', 'Acts of Service', 'Receiving Gifts', 'Quality Time', 'Physical Touch'].includes(metric.name);

    return (
      <div className="modal-overlay">
        <form className="modal" onSubmit={handleSubmit}>
          <h2>Edit Metric</h2>

          <label>Name</label>
          <input
            type="text"
            value={name}
            disabled={isProtected}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Scale</label>
          <select
            value={scaleType}
            disabled={isProtected}
            onChange={(e) => setScaleType(e.target.value)}
          >
            <option value="number">0–10</option>
            <option value="percentage">Percentage</option>
          </select>
          <label>Select Icon</label>
          <input
            type="text"
            placeholder="Search icons..."
            value={iconSearch}
            onChange={(e) => setIconSearch(e.target.value)}
            className="icon-search-input"
          />
          <div className="icon-grid">
            {filteredIcons.map(({ name, icon: faIcon }) => (
              <button
                key={name}
                type="button"
                className={`icon-button ${icon === name ? 'selected' : ''}`}
                onClick={() => setIcon(name)}
                title={faIcon.iconName}
              >
                <FontAwesomeIcon icon={faIcon} />
              </button>
            ))}
          </div>

          <div className="modal-buttons space-between">
            {!isProtected && (
              <button
                type="button"
                onClick={() => onDelete(metric.id)}
                className="btn danger"
              >
                Delete
              </button>
            )}
            <div className="modal-buttons">
              <button type="button" onClick={onClose} className="btn secondary">
                Cancel
              </button>
              <button type="submit" className="btn primary">Save</button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="page-content">
     <h1 className="pageTitle">{ pageIcon }{ pageTitle }</h1>
      <div className="dashboard">
        <MetricAverage metrics={metrics} />
        <div className="metric-grid">
          {metrics.map((metric) => (
            <div
  key={metric.id}
  className="metric-block"
  onClick={(e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newValue = Math.round(
      (clickX / rect.width) * (metric.scale_type === 'percentage' ? 100 : 10)
    );
    handleSliderChange(metric.id, newValue);
  }}
>
  <input
    type="range"
    min={0}
    max={metric.scale_type === 'percentage' ? 100 : 10}
    value={metric.value}
    onChange={(e) => handleSliderChange(metric.id, Number(e.target.value))}
    className="full-slider"
  />

  <div className="metric-header">
    <span className="metric-name">
      {metric.icon && Icons[metric.icon] && (
        <FontAwesomeIcon icon={Icons[metric.icon]} className="metric-icon" />
      )}
      &nbsp;{metric.name}
    </span>
    <button onClick={(e) => {
      e.stopPropagation();
      openEditModal(metric);
    }} className="edit-btn">
      <img height="15px" alt="" src="/icons/gear-solid.svg" />
    </button>
  </div>

  <div className="metric-subblock">
    <div className="metric-value">{metric.value}</div>
  </div>
</div>
          ))}
        </div>

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

        <EditMetricModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSave={handleEditSave}
          onDelete={handleDeleteMetric}
          metric={metricToEdit}
        />
      </div>
    </div>
  );
}
