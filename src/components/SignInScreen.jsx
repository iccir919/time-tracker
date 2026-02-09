import React from 'react';

const SignInScreen = ({ onSignIn }) => {
    return (
        <div className="min-h-screen bg-slate-300 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                <div className="text-6xl mb-6">
                    📅
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Time Tracker</h1>
                <p className="text-gray-600 mb-8">
                    Track your time spent in calendar events across weeks, months, and years
                </p>
                <button
                    onClick={onSignIn}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                >
                    Sign in with Google
                </button>
                <p className="text-xs text-gray-500 mt-4">
                    We only read your calendar events. Your data stays private.
                </p>
            </div>
        </div>
    )
}

export default SignInScreen;