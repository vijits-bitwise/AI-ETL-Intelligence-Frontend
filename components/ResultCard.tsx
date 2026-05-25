'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { AnalysisResponse } from '@/utils/api';

interface ResultCardProps {
  data: AnalysisResponse;
}

// ─── Text processing helpers (logic unchanged) ────────────────────────────────

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
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(
      <strong key={parts.length} className="font-semibold text-slate-900">
        {match[0]}
      </strong>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
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
    if (match.index > lastIndex)
      tokens.push(highlightText(text.slice(lastIndex, match.index), highlights));

    if (match[2]) {
      tokens.push(
        <strong key={tokens.length} className="font-semibold text-slate-900">
          {match[2]}
        </strong>,
      );
    } else if (match[3]) {
      tokens.push(
        <code key={tokens.length} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">
          {match[3]}
        </code>,
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length)
    tokens.push(highlightText(text.slice(lastIndex), highlights));
  return tokens.length > 0 ? tokens : text;
}

function renderProse(value?: string, highlights: string[] = []) {
  const cleaned = cleanContent(value);
  if (!cleaned) return null;
  return cleaned
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, ' ').trim())
    .filter(Boolean)
    .map((p, i) => (
      <p key={i} className="text-sm leading-relaxed text-slate-600 last:mb-0 mb-3">
        {parseInlineText(p, highlights)}
      </p>
    ));
}

// ─── Status / badge helpers (logic unchanged) ─────────────────────────────────

function getStatusLabel(priority?: string, businessImpact?: string) {
  if (!priority && !businessImpact) return 'Analysis Complete';
  if (priority?.includes('P1') || businessImpact === 'Critical') return 'FAILED';
  if (priority?.includes('P2') || businessImpact === 'High') return 'AT RISK';
  return 'IN REVIEW';
}

function getStatusStyles(priority?: string, businessImpact?: string) {
  if (priority?.includes('P1') || businessImpact === 'Critical')
    return 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-200';
  if (priority?.includes('P2') || businessImpact === 'High')
    return 'bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200';
  return 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200';
}

// ─── Reusable UI primitives ───────────────────────────────────────────────────
// Card wrapper: consistent border, background, and shadow across all sections.

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

// Section header: label + title row with optional right-side element.
function CardHeader({
  label,
  title,
  aside,
}: {
  label: string;
  title: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
        <h2 className="mt-0.5 text-sm font-semibold text-slate-900">{title}</h2>
      </div>
      {aside && <div className="ml-4 shrink-0 mt-0.5">{aside}</div>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ResultCard({ data }: ResultCardProps) {
  const incident = data.incident_info;

  // Terms to bold-highlight inside prose
  const highlightTerms = [
    incident.incident_no,
    incident.stream_name || '',
    incident.job_name || '',
    incident.business_impact || '',
  ].filter(Boolean) as string[];

  const confidencePercentage = data.confidence_scorecard.percentage;
  const statusLabel = getStatusLabel(incident.priority, incident.business_impact);
  const statusStyles = getStatusStyles(incident.priority, incident.business_impact);

  // SVG confidence ring: r=52, viewBox 128×128, circumference = 2πr
  const R = 52;
  const circumference = 2 * Math.PI * R;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      {/* Constrain max-width and stack cards with consistent 5-unit gap */}
      <div className="mx-auto max-w-7xl space-y-5">

        {/* ── 1. INCIDENT HEADER ───────────────────────────────────────────── */}
        <Card>
          <div className="p-6">

            {/* Top row: icon + incident ID + status badges */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                {/* Alert icon pill */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
                  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Incident</p>
                  {/* Incident ID — most prominent element on the page */}
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">{incident.incident_no}</h1>
                </div>
              </div>

              {/* Priority / status / impact badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles}`}>
                  {statusLabel}
                </span>
                {incident.priority && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                    {incident.priority}
                  </span>
                )}
                {incident.business_impact && (
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                    incident.business_impact === 'Critical'
                      ? 'bg-red-50 text-red-700 ring-red-200'
                      : incident.business_impact === 'High'
                      ? 'bg-amber-50 text-amber-700 ring-amber-200'
                      : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                  }`}>
                    Impact: {incident.business_impact}
                  </span>
                )}
              </div>
            </div>

            {/* Descriptions */}
            <div className="mt-4 space-y-1.5">
              <p className="text-sm font-medium leading-relaxed text-slate-800">
                {incident.short_description}
              </p>
              {incident.description && (
                <p className="text-sm leading-relaxed text-slate-500">{incident.description}</p>
              )}
            </div>

            {/* 4-column metadata grid — responsive to 2 cols on small screens */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Environment', value: incident.environment || 'Unknown' },
                { label: 'Detected At',  value: incident.created_at   || 'N/A'   },
                { label: 'Stream',       value: incident.stream_name  || 'N/A'   },
                { label: 'Job',          value: incident.job_name     || 'N/A'   },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-800" title={value}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ── 2. MAIN BODY — 3/5 left + 2/5 right on lg ───────────────────── */}
        <div className="grid gap-5 lg:grid-cols-[3fr_2fr]">

          {/* ── LEFT COLUMN ──────────────────────────────────────────────── */}
          <div className="space-y-5 min-w-0">

            {/* Root Cause Analysis */}
            <Card>
              <CardHeader
                label="Root Cause"
                title="Root Cause Analysis"
                aside={
                  /* Category badge in the header for quick scanning */
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600 ring-1 ring-inset ring-slate-200">
                    {data.root_cause.category}
                  </span>
                }
              />
              <div className="p-6">
                {/* KPI row: sub-category / error code / confidence */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-red-400">Sub-category</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 leading-tight">{data.root_cause.sub_category}</p>
                  </div>
                  <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-500">Error Code</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 leading-tight">{data.root_cause.error_code}</p>
                  </div>
                  <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-400">Confidence</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 leading-tight">{confidencePercentage}%</p>
                  </div>
                </div>
                {/* Prose explanation with keyword highlighting */}
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-5 py-4">
                  {renderProse(data.root_cause.root_cause, highlightTerms)}
                </div>
              </div>
            </Card>

            {/* Resolution Steps — vertical timeline */}
            <Card>
              <CardHeader label="Resolution" title="Resolution Steps" />
              <div className="p-6">
                <ol className="space-y-0">
                  {data.resolution_steps.map((step, idx) => {
                    const isLast = idx === data.resolution_steps.length - 1;
                    return (
                      <li key={step.step_no} className="relative flex gap-4">
                        {/* Circle + vertical connector in a flex column */}
                        <div className="flex flex-col items-center">
                          {/* Numbered circle */}
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white ring-4 ring-white z-10">
                            {step.step_no}
                          </div>
                          {/* Connector line below circle — hidden on last step */}
                          {!isLast && (
                            <div className="mt-1 w-px flex-1 bg-slate-200" />
                          )}
                        </div>
                        {/* Step text */}
                        <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-6'}`}>
                          <p className="mt-1 text-sm font-semibold text-slate-900">{step.title}</p>
                          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.description}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </Card>
          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────────────────── */}
          <div className="space-y-5 min-w-0">

            {/* Validation Checklist */}
            <Card>
              <CardHeader label="Checklist" title="Validation" />
              {/* Items are divided with a hairline separator for scan-ability */}
              <ul className="divide-y divide-slate-100">
                {data.validation_checklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 px-6 py-4">
                    {/* Checkmark icon in a small circle */}
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800">{item.check}</p>
                      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">{item.system}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Escalation Path */}
            <Card>
              <CardHeader label="Escalation" title="Escalation Path" />
              <dl className="divide-y divide-slate-100">
                {[
                  { label: 'Required',          value: data.escalation_path.required          },
                  { label: 'Scrum Team',         value: data.escalation_path.scrum_team        },
                  { label: 'Assignment Group',   value: data.escalation_path.assignment_group  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-4 px-6 py-3.5">
                    <dt className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 shrink-0">{label}</dt>
                    <dd className="text-sm font-semibold text-slate-800 text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            {/* Evidence Sources */}
            <Card>
              <CardHeader label="References" title="Evidence Sources" />
              <div className="p-6 space-y-5">

                {/* Similar Incidents */}
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    Similar Incidents
                  </p>
                  {data.references.similar_incidents?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {data.references.similar_incidents.map((id) => (
                        <span
                          key={id}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700"
                        >
                          {id}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">None found</p>
                  )}
                </div>

                {/* TWS Logs */}
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    TWS Logs
                  </p>
                  {data.references.tws_logs?.length ? (
                    <div className="space-y-1.5">
                      {data.references.tws_logs.map((path) => (
                        <div
                          key={path}
                          className="break-all rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600"
                        >
                          {path}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No logs referenced</p>
                  )}
                </div>

                {/* Confluence Links */}
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    Confluence Links
                  </p>
                  {data.references.confluence_links?.length ? (
                    <div className="space-y-1.5">
                      {data.references.confluence_links.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2.5 text-sm text-blue-700 transition hover:bg-blue-100"
                        >
                          {/* External link icon */}
                          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                          </svg>
                          <span className="truncate">{link.title}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No links available</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* ── 3. FOOTER ROW — Confidence + Prevention ─────────────────────── */}
        <div className="grid gap-5 lg:grid-cols-[3fr_2fr]">

          {/* AI Confidence Score */}
          <Card>
            <CardHeader label="AI Assessment" title="Confidence Score" />
            <div className="p-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                {/* SVG ring — percentage prominent in the centre */}
                <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
                  <svg
                    className="absolute inset-0 h-full w-full -rotate-90"
                    viewBox="0 0 128 128"
                    aria-hidden="true"
                  >
                    {/* Track */}
                    <circle cx="64" cy="64" r={R} fill="none" stroke="#e2e8f0" strokeWidth="10" />
                    {/* Progress — uses blue-600 (#2563eb) */}
                    <circle
                      cx="64"
                      cy="64"
                      r={R}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="10"
                      strokeDasharray={`${circumference * (confidencePercentage / 100)} ${circumference}`}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  {/* Centred label */}
                  <div className="relative flex flex-col items-center text-center">
                    <span className="text-3xl font-bold leading-none text-slate-900">{confidencePercentage}%</span>
                    <span className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Score</span>
                  </div>
                </div>

                {/* Reason text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">Confidence Assessment</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    {data.confidence_scorecard.reason}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Preventive Recommendation */}
          <Card>
            <CardHeader label="Prevention" title="Preventive Recommendation" />
            <div className="p-6">
              {/* Info icon + prose */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  {renderProse(data.prevention)}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ── 4. ACTION BAR ────────────────────────────────────────────────── */}
        <div className="flex justify-end pb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            {/* Arrow-uturn-left icon */}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
            Analyze Another Incident
          </Link>
        </div>

      </div>
    </div>
  );
}
