import { GOOGLE_CONFIG } from '../config/googleConfig';

class GoogleCalendarService {
  constructor() {
    this.isInitialized = false;
    this.accessToken = null;
    this.tokenClient = null;
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
        this.accessToken = response.access_token;
        // Set the token for GAPI client
        window.gapi.client.setToken({ access_token: this.accessToken });
        // Trigger any pending callbacks
        if (this.signInCallback) {
          this.signInCallback(true);
        }
      },
    });
  }

  // Check if user is signed in
  isSignedIn() {
    return this.accessToken !== null;
  }

  // Sign in
  signIn() {
    return new Promise((resolve) => {
      this.signInCallback = resolve;
      // Request access token
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  // Sign out
  signOut() {
    if (this.accessToken) {
      window.google.accounts.oauth2.revoke(this.accessToken, () => {
        console.log('Access token revoked');
      });
      this.accessToken = null;
      window.gapi.client.setToken(null);
    }
  }

  // Listen to sign-in state changes
  listenToSignInChanges(callback) {
    // Store callback for when token changes
    this.stateChangeCallback = callback;
  }

  // Fetch list of user's calendars
  async fetchCalendarList() {
    try {
      const response = await window.gapi.client.calendar.calendarList.list({
        minAccessRole: 'reader',
        showHidden: false,
      });
      
      return (response.result.items || []).map(cal => ({
        id: cal.id,
        name: cal.summary,
        primary: cal.primary || false,
        backgroundColor: cal.backgroundColor,
        foregroundColor: cal.foregroundColor,
      }));
    } catch (error) {
      console.error('Calendar list error:', error);
      
      // Fallback: If calendar list fails, return primary calendar
      return [{
        id: 'primary',
        name: 'Primary Calendar',
        primary: true,
        backgroundColor: '#4285f4',
        foregroundColor: '#ffffff',
      }];
    }
  }

  // Fetch calendar events from specific calendar
  async fetchEvents(timeMin, timeMax, calendarId = 'primary') {
    try {
      const response = await window.gapi.client.calendar.events.list({
        calendarId: calendarId,
        timeMin: timeMin,
        timeMax: timeMax,
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 2500
      });
      return response.result.items || [];
    } catch (error) {
      throw new Error('Failed to fetch calendar events');
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();
