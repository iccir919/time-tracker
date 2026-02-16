import { GOOGLE_CONFIG } from '../config/googleConfig';

class GoogleCalendarService {
  constructor() {
    this.isInitialized = false;
    this.accessToken = null;
    this.tokenClient = null;
    this.tokenExpiresAt = null;
  }

  // Initialize Google API
  async initialize() {
    return new Promise((resolve, reject) => {
      // Load both GIS (for auth) and GAPI (for Calendar API)
      const gisScript = document.createElement('script');
      gisScript.src = 'https://accounts.google.com/gsi/client';
      gisScript.async = true;
      gisScript.defer = true;
      
      const gapiScript = document.createElement('script');
      gapiScript.src = 'https://apis.google.com/js/api.js';
      
      gisScript.onload = () => {
        gapiScript.onload = async () => {
          await this.initializeGapi();
          this.initializeGis();
          this.isInitialized = true;
          
          // Try to restore saved session
          this.restoreSession();
          
          resolve();
        };
        gapiScript.onerror = () => reject(new Error('Failed to load GAPI'));
        document.body.appendChild(gapiScript);
      };
      
      gisScript.onerror = () => reject(new Error('Failed to load GIS'));
      document.body.appendChild(gisScript);
    });
  }

  // Initialize GAPI client (for Calendar API calls)
  async initializeGapi() {
    return new Promise((resolve, reject) => {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: GOOGLE_CONFIG.API_KEY,
            discoveryDocs: GOOGLE_CONFIG.DISCOVERY_DOCS,
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // Initialize Google Identity Services (for OAuth)
  initializeGis() {
    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CONFIG.CLIENT_ID,
      scope: GOOGLE_CONFIG.SCOPES,
      callback: (response) => {
        if (response.error) {
          console.error('Token error:', response);
          return;
        }
        
        // Store token and expiration
        this.accessToken = response.access_token;
        this.tokenExpiresAt = Date.now() + (response.expires_in * 1000);
        
        // Persist to localStorage
        this.saveSession();
        
        // Set the token for GAPI client
        window.gapi.client.setToken({ access_token: this.accessToken });
        
        // Trigger any pending callbacks
        if (this.signInCallback) {
          this.signInCallback(true);
        }
      },
    });
  }

  // Save session to localStorage
  saveSession() {
    try {
      localStorage.setItem('google_access_token', this.accessToken);
      localStorage.setItem('google_token_expires_at', this.tokenExpiresAt.toString());
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  // Restore session from localStorage
  restoreSession() {
    try {
      const savedToken = localStorage.getItem('google_access_token');
      const savedExpiry = localStorage.getItem('google_token_expires_at');
      
      if (savedToken && savedExpiry) {
        const expiresAt = parseInt(savedExpiry, 10);
        
        // Check if token is still valid (with 5 min buffer)
        if (Date.now() < expiresAt - (5 * 60 * 1000)) {
          this.accessToken = savedToken;
          this.tokenExpiresAt = expiresAt;
          
          // Set the token for GAPI client
          window.gapi.client.setToken({ access_token: this.accessToken });
          
          console.log('Session restored from localStorage');
          
          // Trigger callback if app is waiting for sign in state
          if (this.signInCallback) {
            this.signInCallback(true);
          }
          
          return true;
        } else {
          // Token expired, clear it
          this.clearSession();
          console.log('Saved token expired');
        }
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
    }
    return false;
  }

  // Clear session from localStorage
  clearSession() {
    try {
      localStorage.removeItem('google_access_token');
      localStorage.removeItem('google_token_expires_at');
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  // Check if user is signed in
  isSignedIn() {
    // Check if token exists and is not expired
    if (this.accessToken && this.tokenExpiresAt) {
      return Date.now() < this.tokenExpiresAt;
    }
    return false;
  }

  // Sign in
  signIn() {
    return new Promise((resolve) => {
      this.signInCallback = resolve;
      // Request access token (only prompt if needed)
      this.tokenClient.requestAccessToken({ prompt: '' });
    });
  }

  // Sign out
  signOut() {
    if (this.accessToken) {
      window.google.accounts.oauth2.revoke(this.accessToken, () => {
        console.log('Access token revoked');
      });
      this.accessToken = null;
      this.tokenExpiresAt = null;
      window.gapi.client.setToken(null);
      
      // Clear from localStorage
      this.clearSession();
    }
  }

  // Fetch calendar list
  async fetchCalendarList() {
    if (!this.isSignedIn()) {
      throw new Error('Not signed in');
    }

    try {
      const response = await window.gapi.client.calendar.calendarList.list();
      
      // Format the calendar data
      return response.result.items.map(cal => ({
        id: cal.id,
        name: cal.summary,
        primary: cal.primary || false,
        backgroundColor: cal.backgroundColor,
        foregroundColor: cal.foregroundColor,
      }));
    } catch (error) {
      console.error('Error fetching calendar list:', error);
      // Fallback to primary calendar if list fetch fails
      return [{
        id: 'primary',
        name: 'Primary Calendar',
        primary: true,
      }];
    }
  }

  // Fetch events from calendar
  async fetchEvents(timeMin, timeMax, calendarId = 'primary') {
    if (!this.isSignedIn()) {
      throw new Error('Not signed in');
    }

    try {
      const response = await window.gapi.client.calendar.events.list({
        calendarId: calendarId,
        timeMin: timeMin,
        timeMax: timeMax,
        showDeleted: false,
        singleEvents: true,
        maxResults: 2500,
        orderBy: 'startTime',
      });

      return response.result.items || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const googleCalendarService = new GoogleCalendarService();
export { googleCalendarService };