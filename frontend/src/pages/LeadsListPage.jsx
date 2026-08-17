import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  FileText,
  Mail,
  Phone,
  Calendar,
  Users,
  UserCheck,
  PhoneCall,
  UserX,
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const LeadsListPage = ({
  leads,
  loading,
  error,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  onViewLead,
  onEditLead,
  onDeleteLead,
  onOpenCreateModal
}) => {
  // Compute overview stats from leads
  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    contacted: leads.filter((l) => l.status === 'contacted').length,
    qualified: leads.filter((l) => l.status === 'qualified').length,
    lost: leads.filter((l) => l.status === 'lost').length
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Reset to page 1 whenever the filtered leads change
    setCurrentPage(1);
  }, [leads]);

  const totalPages = Math.ceil(leads.length / itemsPerPage);
  const currentLeads = leads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div>
      {/* 1. Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Users size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Leads</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--status-new-bg)', color: 'var(--status-new-text)' }}>
            <Users size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.new}</div>
            <div className="stat-label">New Inquiries</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--status-contacted-bg)', color: 'var(--status-contacted-text)' }}>
            <PhoneCall size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.contacted}</div>
            <div className="stat-label">Contacted</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--status-qualified-bg)', color: 'var(--status-qualified-text)' }}>
            <UserCheck size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.qualified}</div>
            <div className="stat-label">Qualified</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--status-lost-bg)', color: 'var(--status-lost-text)' }}>
            <UserX size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.lost}</div>
            <div className="stat-label">Lost</div>
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="controls-bar">
        <div className="search-box">
          <Search size={18} color="var(--text-dim)" />
          <input
            id="input-search"
            type="text"
            placeholder="Search leads by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={16} color="var(--text-dim)" />
          <select
            id="select-status-filter"
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      {/* 3. Table / View States */}
      {loading ? (
        <div className="table-wrapper state-box">
          <div className="spinner"></div>
          <div className="state-title">Loading Leads...</div>
          <p>Connecting to backend API & SQLite database</p>
        </div>
      ) : error ? (
        <div className="table-wrapper state-box">
          <div className="state-icon" style={{ color: '#fb7185' }}>
            <AlertCircle size={40} />
          </div>
          <div className="state-title">Unable to Load Leads</div>
          <p style={{ color: '#fb7185', marginBottom: '16px' }}>{error}</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="table-wrapper state-box">
          <div className="state-icon">
            <FolderOpen size={44} />
          </div>
          <div className="state-title">No leads found</div>
          <p style={{ marginBottom: '20px' }}>
            {search || statusFilter !== 'all'
              ? 'Try adjusting your search or status filter criteria.'
              : 'Get started by creating your first sales lead.'}
          </p>
          <button className="btn btn-primary" onClick={onOpenCreateModal}>
            Add First Lead
          </button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Lead Name</th>
                <th>Contact Info</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentLeads.map((lead) => (
                <tr key={lead.id} id={`lead-row-${lead.id}`}>
                  <td>
                    <div className="lead-name-cell">{lead.name}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div className="lead-meta-cell">
                        <Mail size={14} />
                        <span>{lead.email}</span>
                      </div>
                      <div className="lead-meta-cell">
                        <Phone size={14} />
                        <span>{lead.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={lead.status} />
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: 'var(--bg-card-subtle)',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <FileText size={13} />
                      {lead.notesCount || 0}
                    </span>
                  </td>
                  <td>
                    <div className="lead-meta-cell">
                      <Calendar size={14} />
                      <span>{formatDate(lead.createdAt)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onViewLead(lead.id)}
                        title="View Details & Notes"
                        id={`btn-view-${lead.id}`}
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onEditLead(lead)}
                        title="Edit Lead"
                        id={`btn-edit-${lead.id}`}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => onDeleteLead(lead)}
                        title="Delete Lead"
                        id={`btn-delete-${lead.id}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {leads.length > 0 && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default LeadsListPage;
