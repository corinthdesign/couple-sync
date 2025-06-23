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
      let { data, error } = await supabase
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

  const handleEditSave = async (updatedMetric) => {
    const { error } = await supabase
      .from('metrics')
      .update({
        name: updatedMetric.name,
        scale_type: updatedMetric.scale_type,
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

    const { error } = await supabase
      .from('metrics')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

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
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow-lg w-80"
        >
          <h2 className="text-xl font-bold mb-4">Add New Metric</h2>
          <label className="block mb-2">Name</label>
          <input
            type="text"
            className="border p-2 w-full mb-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label className="block mb-2">Type</label>
          <select
            className="border p-2 w-full mb-4"
            value={scaleType}
            onChange={(e) => setScaleType(e.target.value)}
          >
            <option value="number">0-10 Scale</option>
            <option value="percentage">Percentage (0-100%)</option>
          </select>
          <label className="block mb-2">Icon (Coming Soon)</label>
          <input
            type="text"
            className="border p-2 w-full mb-4"
            placeholder="Icon name or emoji"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            disabled
          />
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 rounded border"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">
              Add
            </button>
          </div>
        </form>
      </div>
    );
  }

  function EditMetricModal({ isOpen, onClose, onSave, onDelete, metric, isProtected }) {
    const [name, setName] = useState(metric?.name || '');
    const [scaleType, setScaleType] = useState(metric?.scale_type || 'number');

    useEffect(() => {
      setName(metric?.name || '');
      setScaleType(metric?.scale_type || 'number');
    }, [metric]);

    if (!isOpen || !metric) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave({ id: metric.id, name: name.trim(), scale_type: scaleType });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg w-80">
          <h2 className="text-xl font-bold mb-4">Edit Metric</h2>
          <label className="block mb-2">Name</label>
          <input
            type="text"
            className="border p-2 w-full mb-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isProtected}
          />
          <label className="block mb-2">Type</label>
          <select
            className="border p-2 w-full mb-4"
            value={scaleType}
            onChange={(e) => setScaleType(e.target.value)}
            disabled={isProtected}
          >
            <option value="number">0-10 Scale</option>
            <option value="percentage">Percentage (0-100%)</option>
          </select>
          <div className="flex justify-between">
            {!isProtected && (
              <button
                type="button"
                onClick={() => onDelete(metric.id)}
                className="text-red-600"
              >
                Delete
              </button>
            )}
            <div className="space-x-3">
              <button type="button" onClick={onClose} className="border px-3 py-1 rounded">
                Cancel
              </button>
              <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Dashboard</h1>
      {metrics.map((metric) => (
        <div key={metric.id} className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <label className="font-medium">{metric.name}</label>
            <button
              onClick={() => openEditModal(metric)}
              className="text-sm text-gray-500 hover:text-black"
              title="Edit"
            >
              ⚙️
            </button>
          </div>
          <input
            type="range"
            min={0}
            max={metric.scale_type === 'percentage' ? 100 : 10}
            value={metric.value}
            onChange={(e) => handleSliderChange(metric.id, Number(e.target.value))}
            className="w-full"
          />
          <div className="text-sm text-gray-700">Value: {metric.value}</div>
        </div>
      ))}

      <button
        onClick={saveMetrics}
        disabled={saving}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full mb-4"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>

      <button
        onClick={() => setModalOpen(true)}
        className="bg-green-600 text-white px-4 py-2 rounded w-full"
      >
        Add New Metric
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
        isProtected={
          metricToEdit?.name === 'Words of Affirmation' ||
          metricToEdit?.name === 'Acts of Service' ||
          metricToEdit?.name === 'Receiving Gifts' ||
          metricToEdit?.name === 'Quality Time' ||
          metricToEdit?.name === 'Physical Touch'
        }
      />
    </div>
  );
}
