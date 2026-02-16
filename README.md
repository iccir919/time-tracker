# 📅 Time Tracker

A beautiful, privacy-focused web application that analyzes your Google Calendar to show exactly where your time goes. Built with React and powered by the Google Calendar API.

![Calendar Time Tracker](https://img.shields.io/badge/React-18.2-blue) ![Google Calendar API](https://img.shields.io/badge/Google%20Calendar-API-green) ![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

### 📊 Time Analysis
- **Flexible Time Ranges**: View your calendar by week, month, year, or custom date range
- **Visual Charts**: Interactive stacked bar, stacked area, individual line, or individual bar charts
- **Event Breakdown**: See your top 10 event types with percentage breakdowns and color-coded visualizations
- **Smart Filtering**: Click any event to filter the chart and see just that event type

### 📈 Comparison Mode
- **Previous Period**: Compare to last week, last month, or last year
- **Year-over-Year**: See how your time usage has changed
- **Custom Comparisons**: For custom date ranges, compare to the previous period or same period last year
- **Event-by-Event Analysis**: See exactly which events increased, decreased, or are new

### 🎨 Clean Design
- **Black & White Interface**: Professional, minimal aesthetic
- **Google Color Palette**: Charts use Google's primary colors (Blue, Red, Yellow, Green, etc.)
- **Responsive**: Works beautifully on desktop and mobile
- **Day-of-Week Labels**: Chart shows "Mon, Feb 10" for better context

### 🔒 Privacy First
- **Client-Side Only**: All processing happens in your browser
- **No Data Storage**: Your calendar data never leaves your device
- **Read-Only Access**: Only reads your calendar, never modifies anything
- **OAuth 2.0**: Secure Google authentication

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- A Google Cloud Project with Calendar API enabled
- OAuth 2.0 credentials (Client ID)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/iccir919/time-tracker.git
cd time-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Google OAuth**

Create a file `src/config/googleConfig.js`:

```javascript
export const GOOGLE_CONFIG = {
  CLIENT_ID: 'your-client-id.apps.googleusercontent.com',
  API_KEY: 'your-api-key',
  DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
  SCOPES: 'https://www.googleapis.com/auth/calendar.readonly'
};
```

**To get your credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials (Web application)
5. Add `http://localhost:3000` to authorized JavaScript origins
6. Copy your Client ID and API Key

4. **Start the development server**
```bash
npm start
```

5. **Open your browser**
Navigate to `http://localhost:5173`

## 📖 Usage Guide

### First Time Setup
1. Click "Sign in with Google"
2. Grant calendar read permissions
3. Select which calendar to analyze (defaults to primary)

### Viewing Your Data

**Time Range Selection:**
- **Week**: Last 7 days
- **Month**: Last 30 days  
- **Year**: Last 365 days
- **Custom**: Pick any date range

**Chart Options:**
- **Stacked vs Individual**: See total composition or compare individual events
- **Bar vs Line**: Choose your preferred visualization style

**Filtering:**
- Click any event in the breakdown to filter the chart
- Click again or "Clear Filter" to reset

### Comparison Analysis

By default, shows comparison to the previous period:
- Week view → compares to last week
- Month view → compares to last month
- Year view → compares to last year
- Custom ranges → compares to equal-length previous period

Toggle to "Year Ago" to compare the same period from last year.

## 🏗️ Project Structure

```
calendar-tracker-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── CalendarSelector.jsx      # Calendar dropdown
│   │   ├── ChartTypeToggle.jsx       # Chart style controls
│   │   ├── ComparisonStats.jsx       # Comparison section
│   │   ├── DateRangeDisplay.jsx      # Shows current date range
│   │   ├── DateRangePicker.jsx       # Custom date modal
│   │   ├── EmptyState.jsx            # No events message
│   │   ├── ErrorMessage.jsx          # Error display
│   │   ├── EventsBreakdown.jsx       # Event list with colors
│   │   ├── Header.jsx                # App header
│   │   ├── LoadingSpinner.jsx        # Loading state
│   │   ├── SignInScreen.jsx          # Google sign-in
│   │   ├── TimeRangeSelector.jsx     # Week/Month/Year buttons
│   │   └── TimeSeriesChart.jsx       # Main chart component
│   ├── hooks/
│   │   └── useGoogleCalendar.js      # Main calendar logic hook
│   ├── utils/
│   │   ├── chartUtils.js             # Chart data generation
│   │   ├── comparisonUtils.js        # Comparison calculations
│   │   ├── dateUtils.js              # Date range helpers
│   │   ├── googleCalendarService.js  # Google API wrapper
│   │   ├── multiLineChartUtils.js    # Multi-event chart data
│   │   └── statsUtils.js             # Statistics calculations
│   ├── config/
│   │   └── googleConfig.js           # Google API credentials
│   ├── App.jsx                       # Main app component
│   └── index.js                      # App entry point
├── package.json
└── README.md
```

## 🛠️ Technical Details

### Built With
- **React 18.2** - UI framework
- **Recharts** - Chart library
- **Google Calendar API** - Calendar data access
- **Google Identity Services** - OAuth authentication
- **Tailwind CSS** - Styling (via utility classes)

### Key Features Implementation

**Chart Data Processing:**
- Events grouped by summary (event name)
- Top 10 events shown individually
- Remaining events grouped as "Other"
- Missing days filled with 0 values for continuous timeline
- Colors assigned from Google palette

**Comparison Algorithm:**
1. Fetch events from comparison period
2. Calculate stats for both periods
3. Match events by name
4. Calculate change (absolute + percentage)
5. Mark new events that didn't exist in comparison period

**Authentication Flow:**
1. Initialize Google API libraries
2. Create OAuth token client
3. Request user consent
4. Store access token in memory
5. Auto-refresh if expired (tokens last ~1 hour)

## 🔐 Security & Privacy

### What We Access
- ✅ Read your calendar events (title, start time, end time)
- ❌ We do NOT access event descriptions, locations, or attendees
- ❌ We do NOT store your data anywhere
- ❌ We do NOT modify your calendar

### Data Handling
- All processing happens client-side in your browser
- No backend server involved
- No analytics or tracking
- Access token stored only in browser memory
- Sign out completely revokes access

### Recommended Practices
- Only grant access to calendars you want to analyze
- Sign out when done on shared computers
- Revoke access anytime via [Google Account Settings](https://myaccount.google.com/permissions)

## 🎨 Customization

### Changing Colors
Edit `src/utils/multiLineChartUtils.js`:
```javascript
const COLORS = [
  '#4285F4', // Blue - change to your color
  '#EA4335', // Red
  // ... add more colors
];
```

### Adjusting Event Limit
Edit `src/utils/statsUtils.js`:
```javascript
.slice(0, 10) // Change 10 to your desired limit
```

### Modifying Time Ranges
Edit `src/utils/dateUtils.js`:
```javascript
export const getDateRange = (timeRange) => {
  // Customize your date range logic
};
```

## 🐛 Troubleshooting

### "Failed to initialize Google API"
- Check that your API Key and Client ID are correct in `googleConfig.js`
- Ensure Google Calendar API is enabled in your Cloud Project
- Verify authorized origins include your domain

### "No events found"
- Check that your calendar has events in the selected date range
- Ensure you've granted calendar read permissions
- Try selecting a different calendar from the dropdown

### Charts not displaying
- Check browser console for errors
- Ensure you have events in the selected time period
- Try refreshing the page

### Comparison shows "Loading..."
- Wait a few seconds for comparison data to fetch
- Check that you have events in the comparison period
- Verify your internet connection

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Google Calendar API for providing calendar access
- Recharts for the beautiful chart library
- The React team for an amazing framework
- Google for their color palette inspiration

## 📧 Contact

For questions or feedback, please open an issue in the repository.

---

**Built with ❤️ to help you understand where your time goes**