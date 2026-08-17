import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Clock,
  FileText,
  AlertCircle,
  MessageSquarePlus
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

const LeadDetailPage = ({
  leadId,
  onBack,
  onEditLead,
  onDeleteLead,
  onStatusUpdated
}) => {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Note Form State
  const [noteContent, setNoteContent] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [noteError, setNoteError] = useState(null);

  const fetchLeadDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getLead(leadId);
      setLead(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leadId) {
      fetchLeadDetails();
    }
  }, [leadId]);

  const handleQuickStatusChange = async (newStatus) => {
    try {
      const res = await api.updateLead(leadId, { status: newStatus });
      setLead((prev) => ({ ...prev, status: res.data.status }));
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) {
      setNoteError('Note content cannot be empty.');
      return;
    }

    try {
      setIsSubmittingNote(true);
      setNoteError(null);
      await api.addNote(leadId, noteContent.trim());
      setNoteContent('');
      await fetchLeadDetails(); // Refetch to show the new note
    } catch (err) {
      setNoteError(err.message || 'Failed to add note');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="table-wrapper state-box">
        <div className="spinner"></div>
        <div className="state-title">Loading Lead Details...</div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="table-wrapper state-box">
        <div className="state-icon" style={{ color: '#fb7185' }}>
          <AlertCircle size={40} />
        </div>
        <div className="state-title">Lead Not Found</div>
        <p style={{ color: '#fb7185', marginBottom: '20px' }}>{error || 'Unable to find the requested lead record.'}</p>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Leads
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* 1. Top Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button className="btn btn-secondary" onClick={onBack} id="btn-back-to-leads">
          <ArrowLeft size={16} />
          <span>Back to All Leads</span>
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => onEditLead(lead)} id="btn-detail-edit">
            <Edit2 size={14} />
            <span>Edit Lead</span>
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => onDeleteLead(lead)} id="btn-detail-delete">
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* 2. Lead Header & Profile Card */}
      <div className="detail-header" style={{ flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{lead.name}</h1>
              <StatusBadge status={lead.status} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Lead ID: #{lead.id}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Change Status:</span>
            <select
              className="filter-select"
              value={lead.status}
              onChange={(e) => handleQuickStatusChange(e.target.value)}
              id="select-quick-status"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>

        {/* Lead Details Grid */}
        <div className="detail-info-grid" style={{ width: '100%' }}>
          <div className="detail-info-item">
            <div className="detail-info-label">Email Address</div>
            <div className="detail-info-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={15} color="var(--primary)" />
              <a href={`mailto:${lead.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                {lead.email}
              </a>
            </div>
          </div>

          <div className="detail-info-item">
            <div className="detail-info-label">Phone Number</div>
            <div className="detail-info-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={15} color="var(--primary)" />
              <span>{lead.phone}</span>
            </div>
          </div>

          <div className="detail-info-item">
            <div className="detail-info-label">Date Created</div>
            <div className="detail-info-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} color="var(--primary)" />
              <span>{formatTimestamp(lead.createdAt)}</span>
            </div>
          </div>

          <div className="detail-info-item">
            <div className="detail-info-label">Total Notes</div>
            <div className="detail-info-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={15} color="var(--primary)" />
              <span>{lead.notes?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Notes Section */}
      <div className="notes-container">
        <div className="notes-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Activity Notes & Timeline</h2>
            <span
              style={{
                fontSize: '12px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#a5b4fc',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}
            >
              {lead.notes?.length || 0}
            </span>
          </div>
        </div>

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} style={{ marginBottom: '24px' }}>
          {noteError && (
            <div className="alert-banner alert-danger">
              <AlertCircle size={16} />
              <span>{noteError}</span>
            </div>
          )}

          <div className="form-group">
            <textarea
              id="textarea-note-content"
              className="form-textarea"
              placeholder="Log a call note, customer requirement, or next step..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isSubmittingNote}
              id="btn-add-note"
            >
              <MessageSquarePlus size={15} />
              <span>{isSubmittingNote ? 'Saving Note...' : 'Add Note'}</span>
            </button>
          </div>
        </form>

        {/* Notes List */}
        {(!lead.notes || lead.notes.length === 0) ? (
          <div className="state-box" style={{ padding: '30px 20px', background: 'rgba(255, 255, 255, 0.01)', borderRadius: 'var(--radius-md)' }}>
            <div className="state-title" style={{ fontSize: '15px' }}>No notes available</div>
            <p style={{ fontSize: '13px' }}>Add the first note above to begin tracking communications with {lead.name}.</p>
          </div>
        ) : (
          <div className="notes-list">
            {lead.notes.map((note) => (
              <div key={note.id} className="note-item" id={`note-card-${note.id}`}>
                <div className="note-time" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={13} />
                  <span>{formatTimestamp(note.createdAt)}</span>
                </div>
                <div className="note-text">{note.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadDetailPage;
