'use client';
import React, { useState, useEffect, useRef } from 'react';
import { SearchProvider } from '@indxsearch/intrface';

/**
 * SecureSearchProvider - Demo-specific wrapper for SearchProvider
 *
 * This component handles authentication via Next.js API routes, keeping
 * credentials secure on the server. It fetches a token and then renders
 * the underlying SearchProvider from @indxsearch/intrface.
 *
 * This pattern keeps the indx-intrface package framework-agnostic while
 * allowing Next.js apps to use secure server-side authentication.
 */

type SecureSearchProviderProps = {
  children: React.ReactNode;
  url: string;
  dataset: string;
  allowEmptySearch?: boolean;
  maxResults?: number;
  facetDebounceDelayMillis?: number;
  enableFacets?: boolean;
  coverageDepth?: number;
  removeDuplicates?: boolean;
  enableCoverage?: boolean;
  enableDebugLogs?: boolean;
};

export function SecureSearchProvider({
  children,
  url,
  dataset,
  ...searchProps
}: SecureSearchProviderProps) {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const hasAuthenticated = useRef(false);

  useEffect(() => {
    // Prevent double authentication in StrictMode
    if (hasAuthenticated.current) return;
    hasAuthenticated.current = true;

    const authenticate = async () => {
      try {
        // Step 1: Call Next.js API route to login (credentials stay on server)
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          credentials: 'include',
        });

        if (!loginRes.ok) {
          throw new Error('Login via API route failed');
        }

        const loginData = await loginRes.json();

        // Step 2: Call Next.js API route to create/open dataset session
        const sessionRes = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            token: loginData.token,
            dataset
          })
        });

        if (!sessionRes.ok) {
          throw new Error('Session creation via API route failed');
        }

        // Authentication complete! Save token
        setAuthToken(loginData.token);
      } catch (error) {
        console.error('[SecureSearchProvider] Authentication failed:', error);
      }
    };

    authenticate();
  }, [dataset]);

  // Don't render SearchProvider until auth is complete
  if (!authToken) {
    return <div>Authenticating...</div>;
  }

  return (
    <SearchProvider
      email="" // Not used when preAuthenticatedToken is provided
      password="" // Not used when preAuthenticatedToken is provided
      url="/api/proxy" // Proxy needed to forward cookies cross-domain
      dataset={dataset}
      preAuthenticatedToken={authToken}
      {...searchProps}
    >
      {children}
    </SearchProvider>
  );
}
