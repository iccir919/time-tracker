import React from 'react';
import { useGoogleCalendar } from './hooks/useGoogleCalendar';
import SignInScreen from './components/SignInScreen';
import Header from './components/Header';

const App = () => {
    const {
        isSignedIn,
        handleSignIn,
        handleSignOut
    } = useGoogleCalendar();


    if (!isSignedIn) {
      return <SignInScreen onSignIn={handleSignIn} />
    }

    return (
      <div className="min-h-screen bg-slate-300 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <Header onSignOut={handleSignOut} />
          </div>
        </div>
      </div>
    )
}

export default App;