'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { analyzeIncident, AnalysisResponse, IncidentPayload } from '@/utils/api';
import Loader from './Loader';

export default function IncidentForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    incident_no: '',
    short_description: '',
    long_description: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!formData.incident_no.trim() || !formData.short_description.trim() || !formData.long_description.trim()) {
      setError('All fields are required');
      return;
    }

    setIsLoading(true);

    try {
      const payload: IncidentPayload = {
        incident_no: formData.incident_no,
        short_description: formData.short_description,
        long_description: formData.long_description,
      };

      console.log('Sending request to analyze incident:', payload);
      const response: AnalysisResponse = await analyzeIncident(payload);
      console.log('Received response from API:', response);

      // Store the response data in localStorage to avoid URL length limits
      const storageKey = `incident-analysis-${Date.now()}`;
      console.log('Storing data with key:', storageKey);
      localStorage.setItem(storageKey, JSON.stringify(response));
      
      // Verify data was stored
      const storedData = localStorage.getItem(storageKey);
      if (!storedData) {
        throw new Error('Failed to store data in localStorage');
      }
      console.log('Data successfully stored in localStorage');

      // Small delay to ensure data is persisted before navigation
      await new Promise(resolve => setTimeout(resolve, 100));

      const queryParams = new URLSearchParams({
        key: storageKey,
        incident_no: formData.incident_no,
        short_description: formData.short_description,
      });

      const resultUrl = `/result?${queryParams.toString()}`;
      console.log('Navigating to:', resultUrl);
      router.push(resultUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze incident. Please try again.';
      console.error('Error during incident analysis:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Incident Analysis</h1>

        {isLoading && (
          <div className="mb-6">
            <Loader />
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="incident_no" className="block text-sm text-gray-600 mb-2">
              Incident Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="incident_no"
              name="incident_no"
              value={formData.incident_no}
              onChange={handleInputChange}
              placeholder="e.g., INC-001234"
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="short_description" className="block text-sm text-gray-600 mb-2">
              Short Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="short_description"
              name="short_description"
              value={formData.short_description}
              onChange={handleInputChange}
              placeholder="Brief summary of the incident"
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="long_description" className="block text-sm text-gray-600 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="long_description"
              name="long_description"
              value={formData.long_description}
              onChange={handleInputChange}
              placeholder="Detailed description of the incident"
              rows={5}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Incident'}
          </button>
        </form>
      </div>
    </div>
  );
}