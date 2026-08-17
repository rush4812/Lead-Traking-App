import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

const LeadModal = ({ isOpen, onClose, onSave, leadToEdit }) => {
  const isEditing = Boolean(leadToEdit);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'new'
  });

  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (leadToEdit) {
      setFormData({
        name: leadToEdit.name || '',
        email: leadToEdit.email || '',
        phone: leadToEdit.phone || '',
        status: leadToEdit.status || 'new'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        status: 'new'
      });
    }
    setErrors([]);
  }, [leadToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    // Client-side quick validation
    const clientErrors = [];
    if (!formData.name.trim()) clientErrors.push('Name is required');
    if (!formData.email.trim()) clientErrors.push('Email is required');
    if (!formData.phone.trim()) clientErrors.push('Phone is required');

    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(formData, leadToEdit?.id);
      onClose();
    } catch (err) {
      if (err.errors && err.errors.length > 0) {
        setErrors(err.errors);
      } else {
        setErrors([err.message || 'Failed to save lead']);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEditing ? 'Edit Lead' : 'Create New Lead'}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {errors.length > 0 && (
          <div className="alert-banner alert-danger">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>
              {errors.map((err, idx) => (
                <div key={idx}>{err}</div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="lead-name">Full Name *</label>
            <input
              id="lead-name"
              name="name"
              type="text"
              className="form-input"
              placeholder="e.g. Rahul Patel"
              value={formData.name}
              onChange={handleChange}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="lead-email">Email Address *</label>
            <input
              id="lead-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="e.g. rahul@gmail.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="lead-phone">Phone Number *</label>
            <input
              id="lead-phone"
              name="phone"
              type="text"
              className="form-input"
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="lead-status">Lead Status</label>
            <select
              id="lead-status"
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="btn-save-lead" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadModal;
