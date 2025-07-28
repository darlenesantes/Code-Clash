import React, { useEffect, useState } from 'react';
import authService from '../../services/api/authService'; // FIXED: Capital S in Services

const GoogleAuthButton = ({ onSuccess, onError, disabled = false, children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = () => {
      if (window.google) {
        setGoogleLoaded(true);
        initializeGoogleAuth();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google) {
          setGoogleLoaded(true);
          initializeGoogleAuth();
        }
      };
      script.onerror = () => {
        console.error('Failed to load Google Identity Services script');
        onError('Failed to load Google authentication. Please check your connection.');
      };
      document.head.appendChild(script);
    };

    const initializeGoogleAuth = () => {
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      
      console.log('Google Client ID:', clientId); // DEBUG
      
      if (!clientId) {
        console.error('Google Client ID not found in environment variables');
        onError('Google authentication is not configured properly.');
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false,
        });
        
        console.log('Google Auth initialized successfully'); // DEBUG
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
        onError('Failed to initialize Google authentication.');
      }
    };

    loadGoogleScript();
  }, [onError]);

  const handleGoogleResponse = async (response) => {
    console.log('Google response received:', response); // DEBUG
    setIsLoading(true);
    
    try {
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      // Send the credential token to our backend
      console.log('Sending credential to backend...'); // DEBUG
      const result = await authService.googleAuth(response.credential);
      
      console.log('Backend response:', result); // DEBUG
      
      if (result.success) {
        onSuccess(result.user);
      } else {
        onError(result.error || 'Google authentication failed');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      onError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    console.log('Google button clicked'); // DEBUG
    console.log('Google loaded:', googleLoaded, 'Window.google:', !!window.google); // DEBUG
    
      if (!googleLoaded || isLoading || disabled) {
        return;
      }

    try {
      console.log('Showing Google prompt...'); // DEBUG
      window.google.accounts.id.prompt((notification) => {
        console.log('Google prompt notification:', notification); // DEBUG
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to renderButton approach if prompt fails
          console.log('Prompt failed, trying renderButton...'); // DEBUG
          renderGoogleButton();
        }
      });
    } catch (error) {
      console.error('Failed to show Google prompt:', error);
      renderGoogleButton(); // Fallback
    }
  };

  const renderGoogleButton = () => {
    try {
      // Clear any existing button
      const buttonContainer = document.getElementById('google-signin-button');
      if (buttonContainer) {
        buttonContainer.innerHTML = '';
        
        window.google.accounts.id.renderButton(
          buttonContainer,
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'rectangular',
            click_listener: true,
          }
        );
      }
    } catch (error) {
      console.error('Failed to render Google button:', error);
      onError('Failed to show Google login. Please try again.');
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={disabled || isLoading || !googleLoaded}
        className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        {children || (isLoading ? 'Signing in...' : 'Continue with Google')}
      </button>
      
      {/* Hidden container for fallback Google button */}
      <div id="google-signin-button" style={{ display: 'none' }}></div>
    </>
  );
};

export default GoogleAuthButton;