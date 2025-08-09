// API configuration and utility functions
const API = import.meta.env.VITE_API_BASE || "http://localhost:5001";

// Helper function for handling API responses
async function handleResponse(response) {
  if (!response.ok && response.status !== 404) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Health check
export async function fetchHealth() {
  try {
    const response = await fetch(`${API}/api/health`);
    return handleResponse(response);
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
}

// Fetch workflow definition
export async function fetchWorkflow() {
  try {
    const response = await fetch(`${API}/api/workflow`);
    return handleResponse(response);
  } catch (error) {
    console.error('Failed to fetch workflow:', error);
    throw error;
  }
}

// Fetch all cases
export async function fetchCases() {
  try {
    const response = await fetch(`${API}/api/cases`);
    return handleResponse(response);
  } catch (error) {
    console.error('Failed to fetch cases:', error);
    throw error;
  }
}

// Fetch single case by ID
export async function fetchCase(id) {
  try {
    const response = await fetch(`${API}/api/cases/${id}`);
    const data = await handleResponse(response);
    if (data.error === 'not_found') {
      throw new Error('Case not found');
    }
    return data;
  } catch (error) {
    console.error(`Failed to fetch case ${id}:`, error);
    throw error;
  }
}

// Search policies
export async function searchPolicies(q) {
  try {
    const params = new URLSearchParams({ q });
    const response = await fetch(`${API}/api/policies/search?${params}`);
    return handleResponse(response);
  } catch (error) {
    console.error('Failed to search policies:', error);
    throw error;
  }
}

// Post decision for a case
export async function postDecision(id, payload) {
  try {
    const response = await fetch(`${API}/api/cases/${id}/decision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Failed to post decision for case ${id}:`, error);
    throw error;
  }
}

// Review bank statement
export async function reviewBankStatement(caseId, statementId, payload) {
  try {
    const response = await fetch(`${API}/api/cases/${caseId}/bank-statements/${statementId}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Failed to review bank statement ${statementId} for case ${caseId}:`, error);
    throw error;
  }
}

// Review occupation form
export async function reviewOccupationForm(caseId, payload) {
  try {
    const response = await fetch(`${API}/api/cases/${caseId}/occupation-form/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Failed to review occupation form for case ${caseId}:`, error);
    throw error;
  }
}

// Get documents for a case
export async function fetchDocuments(caseId) {
  try {
    const response = await fetch(`${API}/api/cases/${caseId}/documents`);
    return handleResponse(response);
  } catch (error) {
    console.error(`Failed to fetch documents for case ${caseId}:`, error);
    throw error;
  }
}

// Upload document for a case
export async function uploadDocument(caseId, documentData, file) {
  try {
    // Use FormData to send the actual file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', documentData.name);
    formData.append('type', documentData.type);
    formData.append('category', documentData.category);
    formData.append('size', documentData.size.toString());
    
    const response = await fetch(`${API}/api/cases/${caseId}/documents`, {
      method: 'POST',
      // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
      body: formData,
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Failed to upload document for case ${caseId}:`, error);
    throw error;
  }
}

// Delete document from a case
export async function deleteDocument(caseId, documentId) {
  try {
    const response = await fetch(`${API}/api/cases/${caseId}/documents/${documentId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Failed to delete document ${documentId} for case ${caseId}:`, error);
    throw error;
  }
}
