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
