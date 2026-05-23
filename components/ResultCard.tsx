'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { AnalysisResponse } from '@/utils/api';

interface ResultCardProps {
  data: AnalysisResponse;
}

function cleanContent(value?: string) {
  if (!value) return '';
  return value
    .split('\n')
    .filter((line) => line.trim() !== '--')
    .join('\n')
    .trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text: string, highlights: string[]) {
  if (!highlights.length) return text;
  const escaped = highlights
    .filter(Boolean)
    .map((term) => escapeRegExp(term))
    .sort((a, b) => b.length - a.length);

  if (!escaped.length) return text;

  const regex = new RegExp(`(${escaped.join('|')})`, 'g');
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={parts.length} className="font-semibold text-gray-900">
        {match[0]}
      </strong>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

function parseInlineText(value?: string, highlights: string[] = []) {
  if (!value) return null;

  const text = cleanContent(value);
  const tokens: ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(highlightText(text.slice(lastIndex, match.index), highlights));
    }

    if (match[2]) {
      tokens.push(
        <strong key={tokens.length} className="font-semibold text-gray-900">
          {match[2]}
        </strong>,
      );
    } else if (match[3]) {
      tokens.push(
        <code key={tokens.length} className="bg-gray-100 px-1 py-0.5 rounded font-mono text-sm text-gray-800">
          {match[3]}
        </code>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    tokens.push(highlightText(text.slice(lastIndex), highlights));
  }

  return tokens.length > 0 ? tokens : text;
}

function renderProse(value?: string, highlights: string[] = []) {
  const cleaned = cleanContent(value);
  if (!cleaned) return null;

  return cleaned
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\n/g, ' ').trim())
    .filter(Boolean)
    .map((paragraph, index) => (
      <p key={index} className="text-sm text-gray-700 leading-relaxed mb-4">
        {parseInlineText(paragraph, highlights)}
      </p>
    ));
}

function getStatusLabel(priority?: string, businessImpact?: string) {
  if (!priority && !businessImpact) return 'Analysis Complete';
  if (priority?.includes('P1') || businessImpact === 'Critical') return 'FAILED';
  if (priority?.includes('P2') || businessImpact === 'High') return 'AT RISK';
  return 'IN REVIEW';
}

function getStatusStyles(priority?: string, businessImpact?: string) {
  if (priority?.includes('P1') || businessImpact === 'Critical') {
    return 'bg-red-600 text-white';
  }
  if (priority?.includes('P2') || businessImpact === 'High') {
    return 'bg-orange-500 text-white';
  }
  return 'bg-slate-500 text-white';
}

export default function ResultCard({ data }: ResultCardProps) {
  const incident = data.incident_info;
  const highlightTerms = [
    incident.incident_no,
    incident.stream_name || '',
    incident.job_name || '',
    incident.business_impact || '',
  ].filter(Boolean) as string[];

  const confidencePercentage = data.confidence_scorecard.percentage;
  const statusLabel = getStatusLabel(incident.priority, incident.business_impact);
  const statusStyles = getStatusStyles(incident.priority, incident.business_impact);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white shadow-sm p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-3xl bg-red-100 p-3">
                  <span className="text-xl">⚠️</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Incident</p>
                  <h1 className="text-4xl font-semibold tracking-tight text-slate-900">{incident.incident_no}</h1>
                </div>
              </div>
              <p className="text-base leading-7 text-slate-700 max-w-2xl">{incident.short_description}</p>
              {incident.description && (
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">{incident.description}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
              <span className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide ${statusStyles}`}>
                {statusLabel}
              </span>
              {incident.priority && (
                <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold tracking-wide text-slate-700">
                  {incident.priority}
                </span>
              )}
              {incident.business_impact && (
                <span className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold tracking-wide text-emerald-700">
                  Impact: {incident.business_impact}
                </span>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Environment</p>
              <p className="mt-3 text-sm font-semibold text-slate-900">{incident.environment || 'Unknown'}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Detected At</p>
              <p className="mt-3 text-sm font-semibold text-slate-900">{incident.created_at || 'N/A'}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Stream</p>
              <p className="mt-3 text-sm font-semibold text-slate-900">{incident.stream_name || 'Not available'}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Job</p>
              <p className="mt-3 text-sm font-semibold text-slate-900">{incident.job_name || 'Not available'}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <section className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Root Cause</p>
                  <h2 className="text-2xl font-semibold text-slate-900">Root Cause Analysis</h2>
                </div>
                <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
                  {data.root_cause.category}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3 mb-8">
                <div className="rounded-3xl bg-red-50 border border-red-100 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-red-500">Sub-category</p>
                  <p className="mt-3 text-sm font-semibold text-slate-900">{data.root_cause.sub_category}</p>
                </div>
                <div className="rounded-3xl bg-orange-50 border border-orange-100 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-orange-600">Error Code</p>
                  <p className="mt-3 text-sm font-semibold text-slate-900">{data.root_cause.error_code}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Confidence</p>
                  <p className="mt-3 text-sm font-semibold text-slate-900">{confidencePercentage}%</p>
                </div>
              </div>

              <div className="rounded-[26px] bg-slate-50 p-8 text-base leading-7 text-slate-700">
                {renderProse(data.root_cause.root_cause, highlightTerms)}
              </div>
            </section>

            <section className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
              <div className="mb-8">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Resolution</p>
                <h2 className="text-2xl font-semibold text-slate-900">Resolution Steps</h2>
              </div>
              <div className="space-y-5">
                {data.resolution_steps.map((step) => (
                  <div key={step.step_no} className="group rounded-[26px] border border-slate-200 bg-slate-50 p-6 transition hover:border-slate-300 hover:bg-white">
                    <div className="flex items-start gap-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-base font-bold text-white">
                        {step.step_no}
                      </div>
                      <div>
                        <p className="text-base font-semibold text-slate-900">{step.title}</p>
                        <p className="mt-3 text-sm text-slate-700 leading-7">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
              <div className="mb-8">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Checklist</p>
                <h2 className="text-2xl font-semibold text-slate-900">Validation</h2>
              </div>
              <div className="space-y-4">
                {data.validation_checklist.map((item, index) => (
                  <div key={index} className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
                    <div className="h-8 w-8 flex-shrink-0 rounded-full bg-emerald-600 text-white grid place-items-center text-sm font-bold">✓</div>
                    <div>
                      <p className="text-base font-semibold text-slate-900">{item.check}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">{item.system}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
              <div className="mb-8">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Escalation</p>
                <h2 className="text-2xl font-semibold text-slate-900">Escalation Path</h2>
              </div>
              <div className="space-y-5 rounded-[26px] bg-slate-50 p-7">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Required</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{data.escalation_path.required}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Scrum Team</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{data.escalation_path.scrum_team}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Assignment Group</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{data.escalation_path.assignment_group}</p>
                </div>
              </div>
            </section>

            <section className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
              <div className="mb-8">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">References</p>
                <h2 className="text-2xl font-semibold text-slate-900">Evidence Sources</h2>
              </div>
              <div className="space-y-5">
                <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Similar Incidents</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {data.references.similar_incidents?.length ? (
                      data.references.similar_incidents.map((id) => (
                        <span key={id} className="rounded-full bg-white px-3 py-2 text-sm text-slate-700 border border-slate-200">{id}</span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">None found</span>
                    )}
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">TWS Logs</p>
                  <div className="mt-3 space-y-3 text-sm text-slate-700">
                    {data.references.tws_logs?.length ? (
                      data.references.tws_logs.map((path) => (
                        <div key={path} className="rounded-2xl bg-white px-3 py-3 border border-slate-200 break-all text-sm">{path}</div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No logs referenced</p>
                    )}
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Confluence Links</p>
                  <div className="mt-3 space-y-3">
                    {data.references.confluence_links?.length ? (
                      data.references.confluence_links.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-2xl bg-white px-4 py-3 border border-slate-200 text-sm text-slate-700 hover:bg-slate-100"
                        >
                          {link.title}
                        </a>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No links available</p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[0.66fr_0.34fr]">
            <div>
              <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Confidence</p>
                <h2 className="text-2xl font-semibold text-slate-900">AI Confidence Score</h2>
              </div>
              <div className="rounded-[26px] bg-slate-50 border border-slate-200 p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-center">
                  <div className="relative flex h-36 w-36 items-center justify-center">
                    <svg className="absolute inset-0 h-full w-full -rotate-90">
                      <circle cx="64" cy="64" r="56" fill="none" stroke="#E2E8F0" strokeWidth="8" />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="url(#confidenceGradient)"
                        strokeWidth="8"
                        strokeDasharray={`${351.86 * (confidencePercentage / 100)} 351.86`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="confidenceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#06B6D4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="relative flex flex-col items-center justify-center text-center">
                      <p className="text-5xl font-bold text-slate-900">{confidencePercentage}%</p>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Confidence</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">Confidence assessment</p>
                    <p className="mt-3 text-sm text-slate-700 leading-7">{data.confidence_scorecard.reason}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-[26px] bg-slate-50 border border-slate-200 p-8">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Preventive Recommendation</p>
              <p className="mt-4 text-sm text-slate-700 leading-7">{data.prevention}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800"
          >
            Analyze Another Incident
          </Link>
        </div>
      </div>
    </div>
  );
}
