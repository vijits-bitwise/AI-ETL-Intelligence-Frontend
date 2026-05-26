# Spec: Chat Panel UI for Iterative Incident Analysis

### Section A — Metadata

```yaml
spec_id:         "TBD-chat-panel-ui"
issue_ref:       "#TBD"
change_type:     "feature"
status:          "APPROVED"
components:
  - utils/api.ts
  - components/ChatPanel.tsx
  - components/ResultCard.tsx
  - components/IncidentForm.tsx
  - app/result/page.tsx
api_spec_change: true
created:         "2026-05-26"
```

### Section B — Problem Statement

The result page currently presents a static AI-generated analysis with no mechanism for
engineers to provide supplementary diagnostic data. Engineers need a standard chatbot-style
sidebar panel embedded in the result page where they can paste TWS logs, Informatica session
logs, or other context. The AI returns a plain-English understanding of the extra data, the
engineer confirms, and the analysis is regenerated and displayed in-place. The chat is
iterative: the engineer can submit multiple rounds of additional context in the same session.

### Section C — API Contract Change (api_spec_change = true)

YAML diff for `doc/api-spec.yaml` (mirrors API repo spec):

```yaml
+ /chat:
+   post:
+     operationId: chat_with_incident
+     requestBody:
+       required: true
+       schema: $ref ChatRequest
+     responses:
+       200: $ref ChatResponse
+       404: incident_no not found in dbo.incident_resolution
+       500: Internal pipeline error

+ ChatRequest:
+   incident_no:          string (required, minLength 1)
+   message:              string (required, minLength 1)
+   accumulated_context:  string (default "")
+   confirmed:            boolean (default false)

+ ChatResponse:
+   understanding:        string (required)
+   requires_confirmation: boolean (required)
+   updated_analysis:     IncidentResponse | null
```

TypeScript interface diff for `utils/api.ts`:

```typescript
+ export interface ChatRequest {
+   incident_no: string;
+   message: string;
+   accumulated_context: string;
+   confirmed: boolean;
+ }

+ export interface ChatResponse {
+   understanding: string;
+   requires_confirmation: boolean;
+   updated_analysis: AnalysisResponse | null;
+ }

+ // New localStorage stored shape — wraps both the original payload and response
+ export interface StoredAnalysis {
+   payload: IncidentPayload;
+   response: AnalysisResponse;
+ }

+ export async function sendChatMessage(payload: ChatRequest): Promise<ChatResponse> {
+   const response = await fetch(`${API_BASE_URL}/chat`, {
+     method: 'POST',
+     headers: { 'Content-Type': 'application/json' },
+     body: JSON.stringify(payload),
+   });
+   if (!response.ok) {
+     throw new Error(`Chat API error: ${response.status} ${response.statusText}`);
+   }
+   return response.json();
+ }
```

`IncidentPayload`, `AnalysisResponse`, and `analyzeIncident()` are unchanged.

### Section D — TypeScript Interface Changes

| Interface | Change | Field | Type | Optional? | Default |
|-----------|--------|-------|------|-----------|---------|
| `ChatRequest` | NEW | `incident_no` | `string` | required | — |
| `ChatRequest` | NEW | `message` | `string` | required | — |
| `ChatRequest` | NEW | `accumulated_context` | `string` | required | `""` |
| `ChatRequest` | NEW | `confirmed` | `boolean` | required | `false` |
| `ChatResponse` | NEW | `understanding` | `string` | required | — |
| `ChatResponse` | NEW | `requires_confirmation` | `boolean` | required | — |
| `ChatResponse` | NEW | `updated_analysis` | `AnalysisResponse \| null` | required | `null` |
| `StoredAnalysis` | NEW | `payload` | `IncidentPayload` | required | — |
| `StoredAnalysis` | NEW | `response` | `AnalysisResponse` | required | — |

Components consuming changed interfaces:
- `app/result/page.tsx` — reads `StoredAnalysis` from localStorage (must handle old raw shape too)
- `components/IncidentForm.tsx` — writes `StoredAnalysis` to localStorage

### Section E — Component Specification

#### New: `ChatPanel` (`components/ChatPanel.tsx`)

```
File path: components/ChatPanel.tsx
Where imported: app/result/page.tsx (rendered as right-column sidebar)

Props interface:
  interface ChatPanelProps {
    incidentNo: string;
    onClose: () => void;
    onAnalysisUpdated: (updated: AnalysisResponse) => void;
  }

Internal types:
  interface ChatMessage {
    id: string;                    // unique: Date.now().toString()
    role: 'user' | 'assistant';
    content: string;
    type: 'text' | 'confirmation'; // 'confirmation' shows Confirm/Cancel buttons
    pendingMessage?: string;        // message awaiting confirmation
  }

Internal state:
  messages: ChatMessage[]          // full conversation history
  inputText: string                // controlled textarea
  isLoading: boolean               // true while API call in-flight
  accumulatedContext: string       // all previously confirmed context concatenated

Before: Does not exist.
After:  Standard chatbot sidebar: message bubbles, understanding phase response,
        inline confirmation flow, auto-scroll.

Conditional logic:
  - ChatResponse.requires_confirmation === true:
      Push assistant message { type: 'confirmation', content: understanding, pendingMessage: inputText }
  - User clicks Confirm:
      newContext = (accumulatedContext + '\n\n' + pendingMessage).trim()
      Call sendChatMessage({ incident_no, message: pendingMessage, accumulated_context: newContext, confirmed: true })
      On success: setAccumulatedContext(newContext); call onAnalysisUpdated(response.updated_analysis)
      Push assistant message { type: 'text', content: "Analysis updated successfully." }
  - User clicks Cancel:
      Push assistant message { type: 'text', content: "Analysis update cancelled. You can provide more context anytime." }
  - Send button / Enter key: submit inputText; clear input; push user message bubble
  - Shift+Enter: newline in textarea (do not submit)
  - Auto-scroll: useRef on message container, scrollIntoView after each message push

Tailwind classes:
  Panel container:    h-full flex flex-col border-l border-slate-200 bg-white
  Header:             flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white
  Header title:       text-sm font-semibold text-slate-900
  Close button:       rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition
  Message area:       flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth
  User bubble:        ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-blue-600 text-white px-4 py-2.5 text-sm leading-relaxed
  Assistant bubble:   mr-auto max-w-[80%] rounded-2xl rounded-tl-sm bg-slate-100 text-slate-900 px-4 py-2.5 text-sm leading-relaxed
  Confirm button:     rounded-lg bg-blue-600 text-white text-xs font-medium px-3 py-1.5 hover:bg-blue-700 transition
  Cancel button:      rounded-lg border border-slate-300 text-slate-600 text-xs font-medium px-3 py-1.5 hover:bg-slate-50 transition
  Input area:         border-t border-slate-100 px-3 py-3 bg-white
  Textarea:           w-full resize-none rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900
                      placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                      disabled:cursor-not-allowed disabled:bg-slate-50
  Send button:        rounded-lg bg-blue-600 text-white p-2.5 hover:bg-blue-700 transition
                      disabled:bg-blue-300 disabled:cursor-not-allowed
  Loading spinner:    h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent

Fallback behaviour:
  - API error: push assistant message with error.message (do not throw)
  - Empty inputText: send button disabled
  - isLoading: textarea disabled, send button shows spinner
```

#### Modified: `ResultCard` (`components/ResultCard.tsx`)

```
Component: ResultCard (components/ResultCard.tsx)
Before: Renders full static analysis; no interactive buttons.
After:  Adds optional "Ask AI" button in the incident header aside slot.
        Adds optional "Updated" badge next to incident number.

New props:
  onOpenChat?: () => void    — if provided, renders "Ask AI" button in header
  isUpdated?: boolean        — if true, renders "Updated" badge (default: false)

Fields rendered: all 12 existing sections unchanged.

Conditional logic:
  if (onOpenChat) → render Ask AI button in CardHeader aside slot (incident header card only)
  if (isUpdated)  → render "Updated" badge before the incident number in header

Tailwind classes added:
  Ask AI button:  rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium
                  text-blue-700 hover:bg-blue-100 transition flex items-center gap-1.5
  Updated badge:  inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50
                  px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700

Fallback: if onOpenChat is undefined, "Ask AI" button is not rendered at all.
```

#### Modified: `IncidentForm` (`components/IncidentForm.tsx`)

```
Component: IncidentForm (components/IncidentForm.tsx)
Before: localStorage.setItem(storageKey, JSON.stringify(response))
        where response is raw AnalysisResponse
After:  localStorage.setItem(storageKey, JSON.stringify({ payload, response }))
        where payload = { incident_no, short_description, long_description }

No other changes. handleSubmit logic, validation, routing unchanged.
```

### Section F — Page / Route Changes

```
Page: app/result/page.tsx
Before: Reads raw AnalysisResponse from localStorage; renders ResultCard with data prop only.
After:  Reads StoredAnalysis from localStorage with backward compatibility.
        Manages chatOpen, currentAnalysis, isUpdated state.
        Renders split layout when chatOpen=true.
        Passes chat callbacks to ResultCard and ChatPanel.

localStorage key used: incident-analysis-${Date.now()} (format unchanged)

Data shape stored (new):
  StoredAnalysis = { payload: IncidentPayload, response: AnalysisResponse }

Backward compat (old shape):
  If JSON.parse(stored).incident_info exists directly → treat as raw AnalysisResponse

New state variables:
  currentAnalysis: AnalysisResponse | null  — updated by onAnalysisUpdated callback
  chatOpen: boolean                         — toggles layout split and ChatPanel render
  isUpdated: boolean                        — drives "Updated" badge in ResultCard

Layout:
  chatOpen=false: <div className="max-w-5xl mx-auto px-4 py-8"> (existing single-column)
  chatOpen=true:  <div className="grid lg:grid-cols-[3fr_2fr] gap-0 h-screen overflow-hidden">
                    <div className="overflow-y-auto px-4 py-8"> <ResultCard .../> </div>
                    <ChatPanel ... />
                  </div>

Callbacks:
  onOpenChat={() => setChatOpen(true)}       → passed to ResultCard
  onClose={() => setChatOpen(false)}          → passed to ChatPanel
  onAnalysisUpdated={(updated) => { setCurrentAnalysis(updated); setIsUpdated(true); }}

Navigation change: none
URL query params: unchanged (key, incident_no, short_description)
```

### Section G — GITHUB-SPECKIT.md Updates

No `GITHUB-SPECKIT.md` in this repo. `docs/architecture.md` and `docs/data-model.md` should
be updated post-implementation to reflect the new `StoredAnalysis` localStorage shape, the
`ChatPanel` component, and the `sendChatMessage()` API function. This is a follow-up task
and does not block implementation.

### Section H — Test Cases

```
Test Case TC-1
  Given:   app loaded at http://localhost:3000
           valid analysis result displayed on /result
  When:    engineer clicks "Ask AI" button in the incident header
  Then:    layout splits into 3:2 grid
           ChatPanel visible on right with "AI Assistant" header and close button
  Covers:  Chat panel opens from result page

Test Case TC-2
  Given:   ChatPanel is open
  When:    engineer types "TWS log shows ABEND rc=1 on ff_rms_cdc.dat" and presses Enter
  Then:    user bubble appears on right (blue) with the typed message
           loading spinner appears in send button
           assistant bubble appears on left (slate) starting "Based on the additional context..."
           Confirm and Cancel buttons appear below the assistant bubble
  Covers:  Understanding phase — correct AI response + confirmation UI

Test Case TC-3
  Given:   Confirm/Cancel buttons are visible
  When:    engineer clicks Confirm
  Then:    Confirm/Cancel buttons disappear
           loading indicator shown
           new assistant bubble: "Analysis updated successfully."
           ResultCard re-renders with new analysis data
           "Updated" badge visible in incident header
  Covers:  Confirmation triggers regeneration and in-place ResultCard update

Test Case TC-4
  Given:   Confirm/Cancel buttons are visible
  When:    engineer clicks Cancel
  Then:    assistant bubble: "Analysis update cancelled. You can provide more context anytime."
           ResultCard is NOT changed; isUpdated remains false
  Covers:  Cancellation preserves original analysis

Test Case TC-5
  Given:   Analysis has been updated once (isUpdated=true, "Updated" badge visible)
  When:    engineer sends a second message with Informatica logs and confirms
  Then:    second update completes; ResultCard updates again with latest data
           "Updated" badge remains visible
  Covers:  Multi-turn iterative chat end-to-end
```

### Section I — Files Changed

| File | Change | Reason |
|------|--------|--------|
| `doc/api-spec.yaml` | Add `/chat` path; add `ChatRequest`, `ChatResponse` schemas | Mirror API repo spec update |
| `utils/api.ts` | Add `ChatRequest`, `ChatResponse`, `StoredAnalysis` interfaces; add `sendChatMessage()` | New API client function |
| `components/ChatPanel.tsx` | NEW FILE — full chatbot sidebar | Core chat UI component |
| `components/ResultCard.tsx` | Add `onOpenChat?` + "Ask AI" button; add `isUpdated?` + "Updated" badge | Entry point for chat |
| `components/IncidentForm.tsx` | Change localStorage write from raw response to `{ payload, response }` | Chat needs original payload for re-analysis |
| `app/result/page.tsx` | Backward-compat localStorage read; chat state management; split layout; render ChatPanel | Orchestrates full chat flow |

### Section J — Out of Scope

- Chat message persistence (not stored in localStorage or any database table)
- Chat session resumption after browser reload
- Markdown rendering in chat bubbles (plain text only)
- Streaming / SSE responses (standard fetch request-response)
- Dark mode or theming
- Mobile layout for chat (desktop lg: breakpoint only)
- Backend implementation (covered in API repo spec TBD-chat-additional-context)
