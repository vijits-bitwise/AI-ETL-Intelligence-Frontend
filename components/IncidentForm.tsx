'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { analyzeIncident, AnalysisResponse, IncidentPayload, StoredAnalysis } from '@/utils/api';
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

  // ── unchanged logic ───────────────────────────────────────────────────────
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

      const storageKey = `incident-analysis-${Date.now()}`;
      console.log('Storing data with key:', storageKey);
      // Store { payload, response } so the result page can pass the payload to /chat for regeneration
      const storedAnalysis: StoredAnalysis = { payload, response };
      localStorage.setItem(storageKey, JSON.stringify(storedAnalysis));

      const storedData = localStorage.getItem(storageKey);
      if (!storedData) throw new Error('Failed to store data in localStorage');
      console.log('Data successfully stored in localStorage');

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
  // ── end unchanged logic ───────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* App header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-md">
            {/* Shield-check icon */}
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">AI ETL Intelligence</h1>
          <p className="mt-1 text-sm text-slate-500">AI-powered incident resolution for ETL operations</p>
        </div>

        {/* Form card */}
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Submit Incident</h2>
          <p className="mt-1 text-sm text-slate-500">Provide the incident details below to generate an AI analysis.</p>

          {/* Loading state */}
          {isLoading && (
            <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50 py-6">
              <Loader />
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="mt-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Incident Number */}
            <div>
              <label htmlFor="incident_no" className="block text-sm font-medium text-slate-700">
                Incident Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="incident_no"
                name="incident_no"
                value={formData.incident_no}
                onChange={handleInputChange}
                placeholder="e.g., INC9347965"
                disabled={isLoading}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            {/* Short Description */}
            <div>
              <label htmlFor="short_description" className="block text-sm font-medium text-slate-700">
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
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            {/* Long Description */}
            <div>
              <label htmlFor="long_description" className="block text-sm font-medium text-slate-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="long_description"
                name="long_description"
                value={formData.long_description}
                onChange={handleInputChange}
                placeholder="Detailed description including error messages, affected streams, and any relevant context"
                rows={5}
                disabled={isLoading}
                className="mt-1.5 w-full resize-none rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {isLoading ? 'Analyzing…' : 'Analyze Incident'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Powered by AI · For ETL support engineers
        </p>
      </div>
    </div>
  );
}
