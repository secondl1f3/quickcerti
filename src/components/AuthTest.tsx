import React, { useState } from 'react';
import { makeAuthenticatedRequest } from '../config/api';

interface AuthTestProps {
  onClose: () => void;
}

export const AuthTest: React.FC<AuthTestProps> = ({ onClose }) => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAuthentication = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    // Check if token exists
    const token = localStorage.getItem('auth_token');
    if (!token) {
      addResult('❌ No auth_token found in localStorage');
      setIsLoading(false);
      return;
    }
    
    addResult('✅ Found auth_token in localStorage');
    addResult(`Token preview: ${token.substring(0, 20)}...`);
    
    // Test API endpoints
    const endpoints = [
      { name: 'Designs', endpoint: '/designs' },
      { name: 'Public Templates', endpoint: '/templates/public' },
      { name: 'User Templates', endpoint: '/templates/my-templates' }
    ];
    
    for (const { name, endpoint } of endpoints) {
      try {
        addResult(`🔄 Testing ${name} (${endpoint})...`);
        const response = await makeAuthenticatedRequest(endpoint);
        
        if (response.ok) {
          addResult(`✅ ${name}: Success (${response.status})`);
        } else {
          const errorText = await response.text();
          addResult(`❌ ${name}: Failed (${response.status}) - ${errorText}`);
        }
      } catch (error) {
        addResult(`❌ ${name}: Network error - ${error}`);
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Authentication Test</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          {testResults.length === 0 ? (
            <p className="text-gray-500">Click "Test API Authentication" to start</p>
          ) : (
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Note:</strong> This test checks if Bearer tokens are being sent correctly.</p>
          <p>Make sure you're signed in and your backend is running on http://localhost:8080</p>
        </div>
      </div>
    </div>
  );
};