export const GOOGLE_CONFIG = {
    CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    API_KEY: import.meta.env.VITE_GOOGLE_API_KEY,
  SCOPES: 'https://www.googleapis.com/auth/calendar.readonly',
  DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
};