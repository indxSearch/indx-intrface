'use client';

import { SearchErrorBoundary, SearchProvider, SearchInput, SearchResults } from '@indxsearch/intrface';
import { useState } from 'react';

type TestScenario = {
  name: string;
  description: string;
  config: {
    url: string;
    token: string;
    dataset: string;
  };
  expectedError?: string;
};

export default function ErrorTestPage() {
  const [scenario, setScenario] = useState<string>('valid');

  const validUrl = process.env.NEXT_PUBLIC_INDX_URL || 'http://localhost:38171';
  const validToken = process.env.NEXT_PUBLIC_INDX_TOKEN || '';

  const scenarios: Record<string, TestScenario> = {
    valid: {
      name: '✅ Valid Configuration',
      description: 'All credentials correct - should load successfully',
      config: {
        url: validUrl,
        token: validToken,
        dataset: 'pokedex'
      }
    },
    missingToken: {
      name: '❌ Missing Token',
      description: 'Token not provided - should show token required error',
      config: {
        url: validUrl,
        token: '',
        dataset: 'pokedex'
      },
      expectedError: 'Authentication token is required'
    },
    invalidToken: {
      name: '❌ Invalid Token Format',
      description: 'Token with only 2 parts - should show format validation error',
      config: {
        url: validUrl,
        token: 'invalid.token',
        dataset: 'pokedex'
      },
      expectedError: 'Invalid token format'
    },
    expiredToken: {
      name: '❌ Expired/Invalid Token',
      description: 'Valid format but expired - should show 401 error',
      config: {
        url: validUrl,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0In0.fakesignature',
        dataset: 'pokedex'
      },
      expectedError: 'Authentication failed (401)'
    },
    wrongDataset: {
      name: '❌ Dataset Not Found',
      description: 'Non-existent dataset - should show 404 error',
      config: {
        url: validUrl,
        token: validToken,
        dataset: 'nonexistent-dataset-name-12345'
      },
      expectedError: 'Dataset not found'
    },
    wrongUrl: {
      name: '❌ Wrong Server URL',
      description: 'Invalid port - should show network error',
      config: {
        url: 'http://localhost:99999',
        token: validToken,
        dataset: 'pokedex'
      },
      expectedError: 'Network error / Failed to connect'
    },
    missingUrl: {
      name: '❌ Missing URL',
      description: 'URL not provided - should show URL required error',
      config: {
        url: '',
        token: validToken,
        dataset: 'pokedex'
      },
      expectedError: 'INDX server URL is required'
    },
    missingDataset: {
      name: '❌ Missing Dataset',
      description: 'Dataset name not provided - should show dataset required error',
      config: {
        url: validUrl,
        token: validToken,
        dataset: ''
      },
      expectedError: 'Dataset name is required'
    }
  };

  const currentScenario = scenarios[scenario] || scenarios.valid;

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ marginBottom: '1rem' }}>🧪 Error Handling Test Page</h1>

      <p style={{
        marginBottom: '2rem',
        color: '#666',
        backgroundColor: '#f0f0f0',
        padding: '1rem',
        borderRadius: '4px'
      }}>
        This page lets you test all error handling scenarios. Select a scenario below and check the browser console for detailed error messages.
        Open the console: <strong>F12</strong> or <strong>Cmd+Option+I</strong> (Mac) / <strong>Ctrl+Shift+I</strong> (Windows)
      </p>

      <div style={{
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px'
      }}>
        <h2 style={{ marginTop: 0 }}>Test Scenario</h2>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold'
          }}>
            Select Scenario:
          </label>
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            style={{
              padding: '0.5rem',
              fontSize: '1rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              width: '100%',
              maxWidth: '500px'
            }}
          >
            {Object.entries(scenarios).map(([key, s]) => (
              <option key={key} value={key}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{
          padding: '1rem',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px',
          marginTop: '1rem'
        }}>
          <div><strong>Description:</strong> {currentScenario.description}</div>
          {currentScenario.expectedError && (
            <div style={{ marginTop: '0.5rem', color: '#c33' }}>
              <strong>Expected Error:</strong> {currentScenario.expectedError}
            </div>
          )}
        </div>

        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#f0f0f0',
          borderRadius: '4px',
          fontSize: '0.9rem',
          fontFamily: 'monospace'
        }}>
          <div><strong>Current Config:</strong></div>
          <div>URL: {currentScenario.config.url || '(empty)'}</div>
          <div>Token: {currentScenario.config.token ? `${currentScenario.config.token.substring(0, 20)}...` : '(empty)'}</div>
          <div>Dataset: {currentScenario.config.dataset || '(empty)'}</div>
        </div>
      </div>

      <div style={{
        padding: '1rem',
        backgroundColor: '#ffe',
        border: '2px solid #ffc',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <strong>📋 What to check:</strong>
        <ul style={{ marginBottom: 0, paddingLeft: '1.5rem' }}>
          <li>Open browser console to see detailed error messages</li>
          <li>Look for emoji indicators: ✅ (success), ❌ (error), 💡 (suggestion)</li>
          <li>Verify error messages include specific fix instructions</li>
          <li>Check if SearchErrorBoundary shows graceful error UI</li>
        </ul>
      </div>

      <div style={{
        border: '2px solid #ddd',
        borderRadius: '8px',
        padding: '1rem',
        backgroundColor: '#fff'
      }}>
        <h2 style={{ marginTop: 0 }}>Search Interface</h2>

        <SearchErrorBoundary key={scenario}>
          <SearchProvider
            url={currentScenario.config.url}
            token={currentScenario.config.token}
            dataset={currentScenario.config.dataset}
            allowEmptySearch={true}
            enableFacets={false}
          >
            <div style={{ marginBottom: '1rem' }}>
              <SearchInput />
            </div>

            <SearchResults fields={['name']} resultsPerPage={10}>
              {(item: Record<string, any>) => (
                <div>
                  <h2>{item.name || 'No name'}</h2>
                </div>
              )}
            </SearchResults>
          </SearchProvider>
        </SearchErrorBoundary>
      </div>

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '4px',
        fontSize: '0.9rem'
      }}>
        <strong>💡 Tips:</strong>
        <ul style={{ marginBottom: 0, paddingLeft: '1.5rem' }}>
          <li>Errors are logged to console with clear messages and fix suggestions</li>
          <li>The SearchErrorBoundary catches initialization errors gracefully</li>
          <li>Try switching between scenarios to see different error messages</li>
          <li>For network errors, ensure your INDX server is running</li>
        </ul>
      </div>
    </div>
  );
}
