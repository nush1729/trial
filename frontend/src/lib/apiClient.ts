// src/lib/apiClient.ts

const API_BASE_URL = "http://localhost:5000/api";

// Helper function for making API requests
async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'An API error occurred');
  }
  
  if (response.status === 204) {
    return;
  }

  return response.json();
}

// --- API Functions ---

// Patients
export const getPatients = () => request('/patients');
export const getPatientById = (id: string) => request(`/patients/${id}`);
export const createPatient = (data: any) => request('/patients', { method: 'POST', body: JSON.stringify(data) });
export const updatePatient = (id: string, data: any) => request(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePatient = (id: string) => request(`/patients/${id}`, { method: 'DELETE' });

// Locations
export const getLocations = () => request('/locations');
export const createLocation = (data: any) => request('/locations', { method: 'POST', body: JSON.stringify(data) });
export const updateLocation = (id: string, data: any) => request(`/locations/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteLocation = (id: string) => request(`/locations/${id}`, { method: 'DELETE' });

// Case Records
export const getCaseRecords = () => request('/case_records');
export const getCaseRecordsByPatient = (patientId: string) => request(`/case_records/patient/${patientId}`);
export const createCaseRecord = (data: any) => request('/case_records', { method: 'POST', body: JSON.stringify(data) });
export const updateCaseRecord = (id: string, data: any) => request(`/case_records/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCaseRecord = (id: string) => request(`/case_records/${id}`, { method: 'DELETE' });

// Vaccinations
export const getVaccinations = () => request('/vaccinations');
export const getVaccinationsByPatient = (patientId: string) => request(`/vaccinations/patient/${patientId}`);
export const createVaccination = (data: any) => request('/vaccinations', { method: 'POST', body: JSON.stringify(data) });
export const updateVaccination = (id: string, data: any) => request(`/vaccinations/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteVaccination = (id: string) => request(`/vaccinations/${id}`, { method: 'DELETE' });

// Stats & Login
export const getDashboardStats = () => request('/stats/dashboard');
export const getStateStats = () => request('/stats/states');
// *** THIS IS THE MAIN CHANGE ***
// Unified login function for both admins and patients
export const login = (credentials: any) => request('/login', { method: 'POST', body: JSON.stringify(credentials) });


// Predictions
export const getPredictionStates = () => request('/predict/states');
export const getPredictions = (state: string) => request(`/predict/${state}`);