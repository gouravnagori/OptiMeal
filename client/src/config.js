// API Configuration
// In production, set VITE_API_URL environment variable (e.g., https://my-backend.onrender.com)
// Locally, it defaults to '' which uses the Vite proxy
export const API_URL = import.meta.env.VITE_API_URL || '';
