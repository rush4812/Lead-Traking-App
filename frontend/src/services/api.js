const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Helper to handle fetch responses and standardized error messages
 */
async function handleResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || `HTTP Error ${response.status}: ${response.statusText}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.errors = data?.errors || [];
    throw error;
  }

  return data;
}

export const api = {
  // 1. Fetch leads with optional search and status filters
  async getLeads(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);

    const url = `${API_BASE_URL}/leads${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  // 2. Fetch single lead by ID (includes notes)
  async getLead(id) {
    const res = await fetch(`${API_BASE_URL}/leads/${id}`);
    return handleResponse(res);
  },

  // 3. Create a new lead
  async createLead(leadData) {
    const res = await fetch(`${API_BASE_URL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
    return handleResponse(res);
  },

  // 4. Partial update for a lead
  async updateLead(id, leadData) {
    const res = await fetch(`${API_BASE_URL}/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
    return handleResponse(res);
  },

  // 5. Delete a lead
  async deleteLead(id) {
    const res = await fetch(`${API_BASE_URL}/leads/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // 6. Fetch notes for a lead
  async getNotes(leadId) {
    const res = await fetch(`${API_BASE_URL}/leads/${leadId}/notes`);
    return handleResponse(res);
  },

  // 7. Add a new note to a lead
  async addNote(leadId, content) {
    const res = await fetch(`${API_BASE_URL}/leads/${leadId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    return handleResponse(res);
  }
};

export default api;
