import { useState, useEffect } from 'react';

export const useGoogleCalendar = () => {
    const [isSignedIn, setIsSignedIn] = useState(false);
    return {
        isSignedIn
    }
}