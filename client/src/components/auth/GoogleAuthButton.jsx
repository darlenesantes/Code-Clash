import React, { useEffect, useRef, useState } from 'react';
import authService from '../../services/api/authService';

const GoogleAuthButton = ({ onSuccess, onError, disabled = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');
  const buttonRef = useRef(null);
  const callbacksRef = useRef({ onSuccess, onError, disabled });
  const requestPendingRef = useRef(false);
  callbacksRef.current = { onSuccess, onError, disabled };

  useEffect(() => {
    let active = true;
    const buttonContainer = buttonRef.current;

    const reportLoadError = () => {
      if (!active) return;
      const message = 'Unable to load Google Sign-In. Please refresh and try again.';
      setLoadError(message);
      callbacksRef.current.onError(message);
    };

    const handleGoogleResponse = async (response) => {
      if (!active || callbacksRef.current.disabled || requestPendingRef.current) return;
      if (!response.credential) {
        callbacksRef.current.onError('No credential received from Google');
        return;
      }
      requestPendingRef.current = true;
      setIsLoading(true);
      try {
        const result = await authService.googleAuth(response.credential);
        if (!active) return;
        if (result.success) {
          callbacksRef.current.onSuccess(result.user);
        } else {
          callbacksRef.current.onError(result.error || 'Authentication failed');
        }
      } catch (error) {
        if (active) callbacksRef.current.onError('Authentication failed. Please try again.');
      } finally {
        requestPendingRef.current = false;
        if (active) setIsLoading(false);
      }
    };

    const initializeGoogleSignIn = () => {
      if (!active) return;
      try {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID?.trim(),
          callback: handleGoogleResponse,
          auto_select: false,
          ux_mode: 'popup'
        });
        window.google.accounts.id.renderButton(buttonContainer, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          width: Math.min(400, Math.max(200, buttonContainer.clientWidth || 320))
        });
        setGoogleLoaded(true);
      } catch (error) {
        reportLoadError();
      }
    };

    let script;
    if (window.google?.accounts?.id) {
      initializeGoogleSignIn();
    } else {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      script.onerror = reportLoadError;
      document.head.appendChild(script);
    }

    return () => {
      active = false;
      if (script) {
        script.onload = null;
        script.onerror = null;
        script.remove();
      }
      buttonContainer.replaceChildren();
    };
  }, []);

  useEffect(() => {
    // Prevent mouse and keyboard interaction while a login request is pending.
    buttonRef.current.inert = disabled || isLoading;
  }, [disabled, isLoading]);

  return (
    <div className="w-full">
      <div
        ref={buttonRef}
        aria-busy={isLoading}
        aria-disabled={disabled || isLoading}
        className={`flex justify-center ${disabled || isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      />
      <div role="status" className="text-sm text-gray-400 mt-2 text-center">
        {loadError || (isLoading ? 'Signing in...' : !googleLoaded ? 'Loading Google Services...' : '')}
      </div>
    </div>
  );
};

export default GoogleAuthButton;
