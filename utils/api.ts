const API_BASE_URL = 'http://127.0.0.1:8000';

export interface IncidentPayload {
  incident_no: string;
  short_description: string;
  long_description: string;
}

// ── Chat interfaces (POST /chat) ──────────────────────────────────────────────

export interface ChatRequest {
  incident_no: string;
  message: string;
  accumulated_context: string;  // "" on first turn; grows with each confirmed context
  confirmed: boolean;           // false = understand phase; true = regenerate phase
}

export interface ChatResponse {
  understanding: string;
  requires_confirmation: boolean;
  updated_analysis: AnalysisResponse | null;
}

// ── localStorage stored shape ─────────────────────────────────────────────────
// Replaces raw AnalysisResponse so the incident payload is available for chat regeneration.
// app/result/page.tsx handles the backward-compat case (old raw shape still works).

export interface StoredAnalysis {
  payload: IncidentPayload;
  response: AnalysisResponse;
}

export interface IncidentInfo {
  incident_no: string;
  short_description: string;
  description: string;
  created_at: string;
  stream_name?: string | null;
  job_name?: string | null;
  priority?: string;
  environment?: string;
  business_impact?: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface RootCause {
  category: string;
  sub_category: string;
  error_code: string;
  root_cause: string;
}

export interface ResolutionStep {
  step_no: number;
  title: string;
  description: string;
}

export interface ValidationCheck {
  check: string;
  system: string;
}

export interface EscalationPath {
  required: 'Yes' | 'No';
  scrum_team: string;
  assignment_group: string;
}

export interface ConfluenceLink {
  title: string;
  url: string;
}

export interface References {
  similar_incidents?: string[];
  tws_logs?: string[];
  confluence_links?: ConfluenceLink[];
}

export interface ConfidenceScorecard {
  percentage: number;
  reason: string;
}

export interface AnalysisResponse {
  incident_info: IncidentInfo;
  root_cause: RootCause;
  resolution_steps: ResolutionStep[];
  validation_checklist: ValidationCheck[];
  prevention: string;
  escalation_path: EscalationPath;
  references: References;
  confidence_scorecard: ConfidenceScorecard;
}

export async function sendChatMessage(payload: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Chat API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function analyzeIncident(payload: IncidentPayload): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/analyze-incident`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
