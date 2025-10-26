/**
 * Application Configuration
 * Handles environment-specific settings for development and production
 */

// API URL Configuration
// In development: uses localhost:8000
// In production: uses environment variable or falls back to localhost
export const API_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://civicagent-backend.onrender.com' // Render production API
    : 'http://localhost:8000');

// Application base URL used for Supabase OAuth redirects
export const SITE_URL = 
  process.env.NEXT_PUBLIC_SITE_URL || 
  (process.env.NODE_ENV === 'production'
    ? 'https://civicagent.vercel.app'
    : 'http://localhost:3000');

// Supabase Configuration (already handled by .env.local)
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// App Configuration
export const APP_NAME = 'CivicAgent';
export const APP_DESCRIPTION = 'AI-Powered Civic Complaint Management System';

// Feature Flags
export const FEATURES = {
  enableAIAnalysis: true,
  enableEmailNotifications: true,
  enableMapView: true,
  enableDarkMode: true,
} as const;

// API Endpoints (all will be prefixed with API_URL)
export const ENDPOINTS = {
  // Auth
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
  },
  
  // Complaints
  COMPLAINTS: {
    LIST: '/complaints/',
    CREATE: '/complaints/',
    DETAIL: (id: string) => `/complaints/${id}`,
    FEEDBACK: (id: string) => `/complaints/${id}/feedback`,
    EXPLANATION: (id: string) => `/complaints/${id}/explanation`,
  },
  
  // Admin
  ADMIN: {
    COMPLAINTS: '/admin/complaints',
    UPDATE_STATUS: (id: string) => `/admin/complaints/${id}`,
    STATS: '/admin/dashboard/stats',
  },
} as const;

// Helper function to build full API URL
export function buildApiUrl(endpoint: string): string {
  return `${API_URL}${endpoint}`;
}

// Helper function to check if we're in production
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

// Helper function to check if we're in development
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}
