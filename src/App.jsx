import React from 'react';
import { useGoogleCalendar } from './hooks/useGoogleCalendar';
import SignInScreen from './components/SignInScreen';

const App = () => {
    const {
        isSignedIn
    } = useGoogleCalendar();
    console.log(isSignedIn)
    if (!isSignedIn) {
      return <SignInScreen />
    }
}

export default App;