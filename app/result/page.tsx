'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import ResultCard from '@/components/ResultCard';
import ChatPanel from '@/components/ChatPanel';
import { AnalysisResponse, StoredAnalysis } from '@/utils/api';

function ResultContent() {
  const searchParams = useSearchParams();
  const storageKey = searchParams.get('key');
  const incidentNo = searchParams.get('incident_no') || '';
  const shortDescription = searchParams.get('short_description') || undefined;

  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Chat state ────────────────────────────────────────────────────────────
  const [chatOpen, setChatOpen] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResponse | null>(null);
  const [isUpdated, setIsUpdated] = useState(false);

  const handleAnalysisUpdated = useCallback((updated: AnalysisResponse) => {
    setCurrentAnalysis(updated);
    setIsUpdated(true);
  }, []);

  useEffect(() => {
    if (!storageKey) {
      setError('No results key provided');
      setLoading(false);
      return;
    }

    // Small delay to ensure component is mounted and localStorage is accessible
    const timer = setTimeout(() => {
      try {
        console.log('Attempting to retrieve storage key:', storageKey);
        console.log('Current port:', window.location.port);
        const storedData = localStorage.getItem(storageKey);

        if (!storedData) {
          console.error('No data found for storage key:', storageKey);
          console.log('Available keys in localStorage:', Object.keys(localStorage));
          console.log('Total localStorage items:', localStorage.length);
          throw new Error(`Data not found in storage. Looking for key: "${storageKey}"`);
        }

        console.log('Data retrieved successfully, parsing...');
        const parsed = JSON.parse(storedData);

        // Backward-compat: old shape is raw AnalysisResponse (has incident_info at root)
        // New shape is StoredAnalysis: { payload, response }
        let analysisResponse: AnalysisResponse;
        if (parsed && 'incident_info' in parsed) {
          // Old shape — raw AnalysisResponse
          analysisResponse = parsed as AnalysisResponse;
        } else {
          // New shape — StoredAnalysis
          const stored = parsed as StoredAnalysis;
          analysisResponse = stored.response;
        }

        setData(analysisResponse);
        setCurrentAnalysis(analysisResponse);

        // Clean up the stored data after use
        localStorage.removeItem(storageKey);
        console.log('Data cleaned up from storage');
      } catch (err) {
        console.error('Error loading results:', err);
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to load results: ${errorMsg}. Make sure you're using the same browser tab/window.`);
      } finally {
        setLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [storageKey]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-3">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Failed to load results. Please try again.'}</p>
          <a
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Go Back
          </a>
        </div>
      </div>
    );
  }

  const displayData = currentAnalysis ?? data;

  if (chatOpen) {
    return (
      <div className="grid lg:grid-cols-[3fr_2fr] h-screen overflow-hidden">
        {/* Analysis panel — scrollable */}
        <div className="overflow-y-auto">
          <ResultCard
            data={displayData}
            onOpenChat={() => setChatOpen(true)}
            isUpdated={isUpdated}
          />
        </div>
        {/* Chat sidebar */}
        <ChatPanel
          incidentNo={incidentNo}
          onClose={() => setChatOpen(false)}
          onAnalysisUpdated={handleAnalysisUpdated}
        />
      </div>
    );
  }

  return (
    <ResultCard
      data={displayData}
      onOpenChat={() => setChatOpen(true)}
      isUpdated={isUpdated}
    />
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500 text-sm">Loading…</div>}>
      <ResultContent />
    </Suspense>
  );
}
