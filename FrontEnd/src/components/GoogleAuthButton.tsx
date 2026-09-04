'use client';

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { useAuth } from '../context/AuthContext';

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleAuthButtonProps {
  mode?: 'signin' | 'signup';
  text?: string;
  onError?: (error: string) => void;
  onSuccess?: (role: string) => void;
  disabled?: boolean;
  className?: string;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  mode = 'signin',
  text,
  onError,
  onSuccess,
  disabled = false,
  className = '',
}) => {
  const { googleSignin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const hiddenButtonRef = useRef<HTMLDivElement>(null);

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '962661916997-eiccgd36rosm6b6hvt3618571l6b7ci2.apps.googleusercontent.com';

  const handleCredentialResponse = async (response: any) => {
    if (!response || !response.credential) {
      onError?.('No credential received from Google');
      return;
    }

    setIsLoading(true);
    try {
      const userRole = await googleSignin(response.credential);
      onSuccess?.(userRole);
    } catch (err: any) {
      console.error('[GoogleAuthButton] Error during authentication:', err);
      onError?.(err?.message || 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const initGoogle = () => {
    if (typeof window === 'undefined' || !window.google?.accounts?.id) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (hiddenButtonRef.current) {
        hiddenButtonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(hiddenButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 400,
          text: mode === 'signup' ? 'signup_with' : 'continue_with',
          shape: 'rectangular',
        });
      }
    } catch (err) {
      console.error('[GoogleAuthButton] Failed to initialize Google Identity Services:', err);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      setIsScriptLoaded(true);
      initGoogle();
    }
  }, []);

  const handleButtonClick = () => {
    if (disabled || isLoading) return;

    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      // Trigger Google One Tap / Account chooser prompt if overlay wasn't directly triggered
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.warn('[GoogleAuth] Prompt not displayed, reason:', notification.getNotDisplayedReason?.());
        }
      });
    } else {
      onError?.('Google Sign-In is still loading. Please try again in a moment.');
    }
  };

  const defaultText = mode === 'signup' ? 'Sign up with Google' : 'Continue with Google';

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          setIsScriptLoaded(true);
          initGoogle();
        }}
      />

      <div className={`relative overflow-hidden rounded-xl ${className}`}>
        {/* Visible Custom Styled Button matching TaskNera Design System */}
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={disabled || isLoading}
          className="w-full py-3 px-4 bg-white hover:bg-slate-50 disabled:opacity-60 text-brand-charcoal font-semibold text-sm rounded-xl border border-slate-300 shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-4 h-4 text-brand-charcoal" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                className="w-5 h-5 flex-shrink-0"
                style={{ width: '20px', height: '20px', minWidth: '20px', minHeight: '20px' }}
              >
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.28a7.16 7.16 0 0 1 0-4.56V6.57H1.25a11.97 11.97 0 0 0 0 10.86l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.57l4.03 3.15c.95-2.83 3.6-4.97 6.72-4.97z"
                />
              </svg>
              <span>{text || defaultText}</span>
            </>
          )}
        </button>

        {/* Real Google rendered button rendered transparently directly on top */}
        <div
          ref={hiddenButtonRef}
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full flex items-center justify-center opacity-[0.0001] overflow-hidden ${
            isLoading || disabled || !isScriptLoaded ? 'pointer-events-none' : 'cursor-pointer pointer-events-auto'
          }`}
          style={{ transform: 'scale(1.15)', transformOrigin: 'center' }}
        />
      </div>
    </>
  );
};
