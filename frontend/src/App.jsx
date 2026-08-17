import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import LeadsListPage from './pages/LeadsListPage';
import LeadDetailPage from './pages/LeadDetailPage';
import LeadModal from './components/LeadModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import api from './services/api';
import { CheckCircle } from 'lucide-react';

function App() {
  // Navigation & View State
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'detail'
  const [selectedLeadId, setSelectedLeadId] = useState(null);

  // Data & Filter State
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState(null);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Flash / Toast Notifications
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch leads from backend
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getLeads({ search, status: statusFilter });
      setLeads(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load leads from server');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 200); // 200ms debounce for search input

    return () => clearTimeout(timer);
  }, [fetchLeads]);

  // Handle Save Lead (Create or Update)
  const handleSaveLead = async (formData, editId) => {
    if (editId) {
      // Update existing lead (PATCH)
      const res = await api.updateLead(editId, formData);
      showToast(`Lead '${res.data.name}' updated successfully!`);
    } else {
      // Create new lead (POST)
      const res = await api.createLead(formData);
      showToast(`Lead '${res.data.name}' created successfully!`);
    }
    await fetchLeads();
  };

  // Handle Delete Lead
  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    try {
      setIsDeleting(true);
      await api.deleteLead(leadToDelete.id);
      showToast(`Lead '${leadToDelete.name}' deleted successfully.`);
      setLeadToDelete(null);
      if (currentView === 'detail' && selectedLeadId === leadToDelete.id) {
        setCurrentView('list');
        setSelectedLeadId(null);
      }
      await fetchLeads();
    } catch (err) {
      alert(err.message || 'Failed to delete lead');
    } finally {
      setIsDeleting(false);
    }
  };

  // Navigation handlers
  const handleViewLead = (id) => {
    setSelectedLeadId(id);
    setCurrentView('detail');
  };

  const handleGoHome = () => {
    setCurrentView('list');
    setSelectedLeadId(null);
  };

  const handleOpenCreateModal = () => {
    setLeadToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lead) => {
    setLeadToEdit(lead);
    setIsModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar
        onOpenCreateModal={handleOpenCreateModal}
        onGoHome={handleGoHome}
      />

      {/* Global Success Notification Toast */}
      {toast && (
        <div className="alert-banner alert-success" style={{ animation: 'modalFadeIn 0.2s ease' }}>
          <CheckCircle size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main>
        {currentView === 'list' ? (
          <LeadsListPage
            leads={leads}
            loading={loading}
            error={error}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onViewLead={handleViewLead}
            onEditLead={handleOpenEditModal}
            onDeleteLead={(lead) => setLeadToDelete(lead)}
            onOpenCreateModal={handleOpenCreateModal}
          />
        ) : (
          <LeadDetailPage
            leadId={selectedLeadId}
            onBack={handleGoHome}
            onEditLead={handleOpenEditModal}
            onDeleteLead={(lead) => setLeadToDelete(lead)}
            onStatusUpdated={fetchLeads}
          />
        )}
      </main>

      {/* Create / Edit Lead Modal */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLead}
        leadToEdit={leadToEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(leadToDelete)}
        onClose={() => setLeadToDelete(null)}
        onConfirm={handleConfirmDelete}
        leadName={leadToDelete?.name || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default App;
