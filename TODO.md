# pmkit TODO List

> **For AI Agents**: This file tracks incomplete features, "coming soon" claims, and future improvements. When building, bug fixing, or reviewing code:
> 1. Check this file for related incomplete work
> 2. Update status when completing items
> 3. Add new items when you discover incomplete features or make claims that aren't fully implemented
> 4. Keep this file as the single source of truth for what's done, half-done, and still to do

Last updated: 2026-01-20 (MVP Launch Readiness)

---

## 🚀 MVP LAUNCH CHECKLIST

**Goal**: Ship a monetizable product with core value proposition working end-to-end.

### Launch Requirements Summary

| Requirement | Status | Priority | Notes |
|-------------|--------|----------|-------|
| **Stripe Payments** | 🔲 Not Started | P0 | Cannot monetize without this |
| **Email Delivery** | 🔲 Not Started | P0 | Core UX - users need their briefs delivered |
| **Gong Connector** | 🔄 Partial | P1 | OAuth ✅, Real MCP partial, No Fetcher |
| **Zendesk Connector** | 🔄 Partial | P1 | OAuth ✅, Real MCP ✅, No Fetcher |
| **Contact Form Backend** | 🔲 Not Started | P1 | Capture Teams/Enterprise leads |
| **Error Monitoring** | 🔲 Not Started | P2 | Sentry for production debugging |

### 1. Stripe Payments 🔲 REQUIRED

| Item | Status | Notes |
|------|--------|-------|
| Install Stripe SDK | 🔲 Pending | `npm install stripe @stripe/stripe-js` |
| Create Individual product in Stripe | 🔲 Pending | $29/month + $228/year prices |
| `POST /api/billing/checkout` | 🔲 Pending | Create checkout session |
| `POST /api/webhooks/stripe` | 🔲 Pending | Handle subscription events |
| `POST /api/billing/portal` | 🔲 Pending | Customer portal link |
| `GET /api/billing/subscription` | 🔲 Pending | Get subscription status |
| Pricing page checkout flow | 🔲 Pending | Redirect to Stripe Checkout |
| Paywall for connectors | 🔲 Pending | Only paid users connect real data |
| STRIPE_SECRET_KEY | 🔲 Pending | Add to env |
| STRIPE_PUBLISHABLE_KEY | 🔲 Pending | Add to env |
| STRIPE_WEBHOOK_SECRET | 🔲 Pending | Add to env |
| STRIPE_INDIVIDUAL_MONTHLY_PRICE_ID | 🔲 Pending | Add to env |
| STRIPE_INDIVIDUAL_YEARLY_PRICE_ID | 🔲 Pending | Add to env |

**Key Files**:
- `apps/web/src/app/api/billing/checkout/route.ts` (new)
- `apps/web/src/app/api/webhooks/stripe/route.ts` (new)
- `apps/web/src/lib/stripe.ts` (new)

### 2. Email Delivery 🔲 REQUIRED

| Item | Status | Notes |
|------|--------|-------|
| Add email service (Resend) | 🔲 Pending | `npm install resend` |
| Create email service module | 🔲 Pending | `packages/core/src/email/index.ts` |
| Daily Brief email template | 🔲 Pending | React Email template |
| Meeting Prep email template | 🔲 Pending | React Email template |
| Add delivery to job processor | 🔲 Pending | After artifact creation in `daily-brief-job.ts` |
| Enable notifications settings UI | 🔲 Pending | `/settings/notifications` currently placeholder |
| Add notification preferences to DB | 🔲 Pending | Schema update |
| RESEND_API_KEY | 🔲 Pending | Add to env |
| EMAIL_FROM | 🔲 Pending | `briefs@getpmkit.com` |

**Key Files**:
- `packages/core/src/email/index.ts` (new)
- `packages/core/src/email/templates/` (new directory)
- `apps/worker/src/daily-brief-job.ts` (add delivery step ~line 240)
- `apps/web/src/app/(authenticated)/settings/notifications/page.tsx` (enable)

### 3. Gong Connector Completion 🔄 IN PROGRESS

| Item | Status | Notes |
|------|--------|-------|
| OAuth authorize route | ✅ Done | `/api/connectors/gong/authorize` |
| OAuth callback route | ✅ Done | `/api/connectors/gong/callback` |
| Token encryption | ✅ Done | AES-256-GCM |
| Mock MCP Server | ✅ Done | All 7 tools |
| Real MCP `get_calls()` | ✅ Done | Working |
| Real MCP `get_call()` | ✅ Done | Working |
| Real MCP `get_transcript()` | ✅ Done | Working |
| Real MCP `get_insights()` | 🔲 Pending | Returns empty, needs Points-of-Interest API |
| Real MCP `search_transcripts()` | 🔲 Pending | Returns empty, needs implementation |
| Real MCP `get_pain_points()` | 🔲 Pending | Returns empty, needs aggregation logic |
| GongFetcher class | 🔲 Pending | `packages/core/src/fetchers/gong-fetcher.ts` |
| Gong partner/dev account | 🔄 Submitted | Waiting for approval |
| GONG_CLIENT_ID | 🔲 Pending | Add to env after account approved |
| GONG_CLIENT_SECRET | 🔲 Pending | Add to env after account approved |

### 4. Zendesk Connector Completion 🔄 IN PROGRESS

| Item | Status | Notes |
|------|--------|-------|
| OAuth authorize route | ✅ Done | `/api/connectors/zendesk/authorize` |
| OAuth callback route | ✅ Done | `/api/connectors/zendesk/callback` |
| Token encryption | ✅ Done | AES-256-GCM |
| Mock MCP Server | ✅ Done | All 6 tools |
| Real MCP Server | ✅ Done | All 6 tools working |
| ZendeskFetcher class | 🔲 Pending | `packages/core/src/fetchers/zendesk-fetcher.ts` |
| Zendesk OAuth client setup | 🔲 Pending | Admin Center → OAuth Clients |
| ZENDESK_CLIENT_ID | 🔲 Pending | Add to env |
| ZENDESK_CLIENT_SECRET | 🔲 Pending | Add to env |
| ZENDESK_SUBDOMAIN | 🔲 Pending | Customer-specific (or dynamic) |

### 5. Contact Form Backend 🔲 REQUIRED

| Item | Status | Notes |
|------|--------|-------|
| `POST /api/contact` route | 🔲 Pending | Receive form submissions |
| Send email to sales@getpmkit.com | 🔲 Pending | Use Resend (same as artifact delivery) |
| Form validation | 🔲 Pending | Name, email, company, message |
| Rate limiting | 🔲 Pending | Prevent spam |

### 6. Error Monitoring 🔲 RECOMMENDED

| Item | Status | Notes |
|------|--------|-------|
| Add Sentry SDK | 🔲 Pending | `@sentry/nextjs` |
| Configure Sentry DSN | 🔲 Pending | SENTRY_DSN env var |
| Error boundary setup | 🔲 Pending | Catch React errors |
| API error tracking | 🔲 Pending | Server-side errors |

### 7. Production Testing Checklist 🔲 BEFORE LAUNCH

| Test | Status | Notes |
|------|--------|-------|
| Slack OAuth flow end-to-end | 🔲 Pending | Connect real workspace |
| Daily Brief with real Slack data | 🔲 Pending | Generate actual brief |
| Scheduled job execution | 🔲 Pending | Verify cron triggers |
| Artifact storage and retrieval | 🔲 Pending | View completed briefs |
| Email delivery | 🔲 Pending | Receive brief via email |
| Stripe payment flow (test mode) | 🔲 Pending | Complete checkout |
| Webhook processing | 🔲 Pending | Subscription created in DB |
| Contact form submission | 🔲 Pending | Email received |

---

## 🔴 Critical / Blocking

Items that block security reviews or make false claims.

| Item | Status | Notes |
|------|--------|-------|
| ~~Infrastructure statement (Vercel/Neon → DigitalOcean)~~ | ✅ Done | Fixed in `/security` page |

---

## 🚀 Deployment Checklist

Track production deployment progress. See `DEPLOYMENT.md` for full details.

### Phase 1: Infrastructure ✅ COMPLETE

| Item | Status | Notes |
|------|--------|-------|
| DigitalOcean PostgreSQL | ✅ Done | Managed PostgreSQL 17 cluster |
| DATABASE_URL configured | ✅ Done | Added to .env.local and DO App Platform |
| DigitalOcean Valkey (Redis) | ✅ Done | Managed Redis/Valkey cluster |
| REDIS_URL configured | ✅ Done | rediss:// format |
| DigitalOcean Spaces (S3) | ✅ Done | pmkit-artifacts bucket |
| S3 credentials configured | ✅ Done | S3_BUCKET, S3_REGION, S3_ENDPOINT, keys |

### Phase 2: LLM Configuration ✅ COMPLETE

| Item | Status | Notes |
|------|--------|-------|
| OpenAI Demo API key | ✅ Done | OPENAI_API_KEY_DEMO for demo console |
| OpenAI Production API key | ✅ Done | OPENAI_API_KEY_PROD for tenant jobs |
| Demo rate limits | ✅ Done | 10/hour, 50/day |

### Phase 3: Authentication ✅ COMPLETE

| Item | Status | Notes |
|------|--------|-------|
| NextAuth secret | ✅ Done | NEXTAUTH_SECRET generated |
| NEXTAUTH_URL | ✅ Done | https://getpmkit.com |
| Google OAuth app | ✅ Done | Client ID + secret configured |
| Google redirect URIs | ✅ Done | localhost + production callbacks |

### Phase 4: Microsoft OAuth 🔲 OPTIONAL

| Item | Status | Notes |
|------|--------|-------|
| Azure Portal app registration | 🔲 Pending | Microsoft Entra ID |
| Multitenant configuration | 🔲 Pending | "Accounts in any organizational directory" |
| Redirect URI | 🔲 Pending | `/api/auth/callback/azure-ad` |
| Client secret | 🔲 Pending | 24-month expiry recommended |
| API permissions | 🔲 Pending | openid, profile, email, User.Read |
| MICROSOFT_CLIENT_ID env var | 🔲 Pending | Add to .env.local + DO |
| MICROSOFT_CLIENT_SECRET env var | 🔲 Pending | Add to .env.local + DO |

### Phase 5: Stripe Billing 🔲 REQUIRED FOR PAID

| Item | Status | Notes |
|------|--------|-------|
| Stripe account setup | 🔲 Pending | Complete verification |
| API keys (live) | 🔲 Pending | pk_live_..., sk_live_... |
| Webhook endpoint | 🔲 Pending | `/api/webhooks/stripe` |
| Webhook events configured | 🔲 Pending | checkout.session.completed, subscription.*, invoice.* |
| Webhook signing secret | 🔲 Pending | whsec_... |
| Teams Plan product | 🔲 Pending | $900/seat/year |
| Price ID | 🔲 Pending | STRIPE_TEAMS_PRICE_ID |
| Env vars in DO | 🔲 Pending | All Stripe vars |

### Phase 6: Connector OAuth Apps 🔲 WHEN READY

Only needed for real customer data. Demo works with mock data.

**6.1 Atlassian (Jira + Confluence)**

**Option A: Development/Testing App (Quick Setup)**

| Step | Status | Instructions |
|------|--------|--------------|
| 1. Create Atlassian app | 🔲 Pending | Go to https://developer.atlassian.com/console/myapps/ → Create → OAuth 2.0 integration |
| 2. Name the app | 🔲 Pending | e.g., "PMKit Dev" |
| 3. Add permissions | 🔲 Pending | Permissions → Add → Jira API → Configure: `read:jira-work`, `read:jira-user` |
| 4. Add Confluence permissions | 🔲 Pending | Permissions → Add → Confluence API → Configure: `read:confluence-content.all`, `read:confluence-space.summary` |
| 5. Set Callback URL | 🔲 Pending | Authorization → Add callback URL: `http://localhost:3000/api/connectors/atlassian/callback` |
| 6. Copy Client ID | 🔲 Pending | Settings → Copy Client ID |
| 7. Copy Client Secret | 🔲 Pending | Settings → Create secret → Copy |
| 8. Add env vars | 🔲 Pending | Add to `apps/web/.env.local`: `ATLASSIAN_CLIENT_ID`, `ATLASSIAN_CLIENT_SECRET` |

**Option B: Production App**

| Step | Status | Instructions |
|------|--------|--------------|
| 1. Create production app | 🔲 Pending | Same steps as Option A |
| 2. Set production callback | 🔲 Pending | `https://getpmkit.com/api/connectors/atlassian/callback` |
| 3. Submit for review | 🔲 Pending | Distribution → Share publicly → Submit for security review |
| 4. Add app listing | 🔲 Pending | Marketplace → App listing with description, icon, screenshots |
| 5. Update production env vars | 🔲 Pending | Add Client ID/Secret to DO App Platform |

**Scope Justifications**

| Scope | Justification |
|-------|---------------|
| `read:jira-work` | Read issues, epics, sprints for PRD context and sprint reviews |
| `read:jira-user` | Display assignee names in artifact citations |
| `read:confluence-content.all` | Read existing documentation for PRD context |
| `read:confluence-space.summary` | List spaces for user selection |

**Environment Variables**

| Variable | Where | Notes |
|----------|-------|-------|
| ATLASSIAN_CLIENT_ID | `apps/web/.env.local` | From Atlassian Developer Console |
| ATLASSIAN_CLIENT_SECRET | `apps/web/.env.local` | From Atlassian Developer Console |

**6.2 Slack** ✅ PRODUCTION READY

**Option A: Development/Testing App (Quick Setup)**

Create your own Slack app for testing. Each developer needs their own app.

| Step | Status | Instructions |
|------|--------|--------------|
| 1. Create Slack app | ✅ Done | Go to https://api.slack.com/apps → Create New App → From scratch |
| 2. Name the app | ✅ Done | e.g., "PMKit Dev" and select your test workspace |
| 3. Add Bot Token Scopes | ✅ Done | OAuth & Permissions → Bot Token Scopes → Add: `channels:history`, `channels:read`, `groups:history`, `groups:read`, `users:read` |
| 4. Set Redirect URL | ✅ Done | OAuth & Permissions → Redirect URLs → Add: `http://localhost:3000/api/connectors/slack/callback` |
| 5. Copy Client ID | ✅ Done | Basic Information → App Credentials → Client ID |
| 6. Copy Client Secret | ✅ Done | Basic Information → App Credentials → Client Secret (click Show) |
| 7. Install to workspace | ✅ Done | OAuth & Permissions → Install to Workspace → Allow |
| 8. Add env vars | ✅ Done | Add to `apps/web/.env.local`: `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET` |
| 9. Generate encryption key | ✅ Done | Run: `openssl rand -hex 32` → Add as `CONNECTOR_ENCRYPTION_KEY` |
| 10. Invite bot to channels | ✅ Done | In Slack: `/invite @YourBotName` in channels you want to read |

**Option B: Production App (Slack App Directory)**

Publish a single PMKit app for all customers. One-click install experience.

| Step | Status | Instructions |
|------|--------|--------------|
| 1. Create production app | ✅ Done | https://api.slack.com/apps → Create New App → From scratch → "PMKit" |
| 2. Add Bot Token Scopes | ✅ Done | Same scopes as Option A |
| 3. Set production redirect | ✅ Done | `https://getpmkit.com/api/connectors/slack/callback` |
| 4. Add app icon | ✅ Done | Basic Information → Display Information → App Icon (512x512 PNG) |
| 5. Write short description | ✅ Done | Basic Information → Short description (80 chars max) |
| 6. Write long description | ✅ Done | Basic Information → Long description (what the app does) |
| 7. Add privacy policy URL | ✅ Done | `https://getpmkit.com/privacy` |
| 8. Add support URL | ✅ Done | `https://getpmkit.com/contact` or support email |
| 9. Request scopes justification | ✅ Done | Explain why each scope is needed for App Directory review |
| 10. Submit to App Directory | 🔄 In Progress | Manage Distribution → Submit to Slack App Directory |
| 11. Respond to review feedback | 🔲 Pending | Typically 1-2 weeks, may require changes |
| 12. Update production env vars | ✅ Done | Production Client ID/Secret added to DO |

**Scope Justifications for App Directory**

| Scope | Justification |
|-------|---------------|
| `channels:history` | Read messages from public channels for Daily Brief synthesis |
| `channels:read` | List public channels so users can select which to include |
| `groups:history` | Read messages from private channels user has added bot to |
| `groups:read` | List private channels for selection (only those bot is in) |
| `users:read` | Display author names in Daily Brief citations |

**Environment Variables**

| Variable | Where | Notes |
|----------|-------|-------|
| SLACK_CLIENT_ID | `apps/web/.env.local` | From Slack app Basic Information |
| SLACK_CLIENT_SECRET | `apps/web/.env.local` | From Slack app Basic Information |
| CONNECTOR_ENCRYPTION_KEY | `apps/web/.env.local` | Generate with `openssl rand -hex 32` |

**6.3 Gong** 🔄 DEV ACCOUNT SUBMITTED

**Option A: Development/Testing App (Quick Setup)**

| Step | Status | Instructions |
|------|--------|--------------|
| 1. Request Partner/Dev account | 🔄 Submitted | Applied for Gong partner/developer account |
| 2. Access Gong settings | 🔲 Pending | Go to https://app.gong.io/company/api → API Settings |
| 3. Create OAuth app | 🔲 Pending | OAuth Apps → Create New App |
| 4. Name the app | 🔲 Pending | e.g., "PMKit Dev" |
| 5. Set Redirect URI | 🔲 Pending | `http://localhost:3000/api/connectors/gong/callback` |
| 6. Select scopes | 🔲 Pending | `api:calls:read`, `api:users:read`, `api:meetings:read` |
| 7. Copy Client ID | 🔲 Pending | Copy from app settings |
| 8. Copy Client Secret | 🔲 Pending | Copy from app settings |
| 9. Add env vars | 🔲 Pending | Add to `apps/web/.env.local`: `GONG_CLIENT_ID`, `GONG_CLIENT_SECRET` |

**Option B: Production App**

| Step | Status | Instructions |
|------|--------|--------------|
| 1. Create production app | 🔲 Pending | Same steps as Option A |
| 2. Set production redirect | 🔲 Pending | `https://getpmkit.com/api/connectors/gong/callback` |
| 3. Contact Gong partner team | 🔲 Pending | For marketplace listing (optional) |
| 4. Update production env vars | 🔲 Pending | Add Client ID/Secret to DO App Platform |

**Scope Justifications**

| Scope | Justification |
|-------|---------------|
| `api:calls:read` | Read call transcripts for customer insights and VoC reports |
| `api:users:read` | Display participant names in citations |
| `api:meetings:read` | Pull meeting context for meeting prep |

**Environment Variables**

| Variable | Where | Notes |
|----------|-------|-------|
| GONG_CLIENT_ID | `apps/web/.env.local` | From Gong API Settings |
| GONG_CLIENT_SECRET | `apps/web/.env.local` | From Gong API Settings |

**6.4 Zendesk**

**Option A: Development/Testing App (Quick Setup)**

| Step | Status | Instructions |
|------|--------|--------------|
| 1. Access Admin Center | 🔲 Pending | Go to Zendesk Admin Center → Apps and integrations → APIs → Zendesk API |
| 2. Create OAuth client | 🔲 Pending | OAuth Clients → Add OAuth Client |
| 3. Name the client | 🔲 Pending | e.g., "PMKit Dev" |
| 4. Set Redirect URLs | 🔲 Pending | `http://localhost:3000/api/connectors/zendesk/callback` |
| 5. Copy Client ID | 🔲 Pending | Copy Unique Identifier |
| 6. Copy Client Secret | 🔲 Pending | Copy Secret (only shown once!) |
| 7. Add env vars | 🔲 Pending | Add to `apps/web/.env.local`: `ZENDESK_CLIENT_ID`, `ZENDESK_CLIENT_SECRET`, `ZENDESK_SUBDOMAIN` |

**Option B: Production App**

| Step | Status | Instructions |
|------|--------|--------------|
| 1. Create production client | 🔲 Pending | Same steps as Option A |
| 2. Set production redirect | 🔲 Pending | `https://getpmkit.com/api/connectors/zendesk/callback` |
| 3. Submit to Zendesk Marketplace | 🔲 Pending | https://developer.zendesk.com/documentation/marketplace/ (optional) |
| 4. Update production env vars | 🔲 Pending | Add Client ID/Secret to DO App Platform |

**Scope Justifications**

| Scope | Justification |
|-------|---------------|
| `tickets:read` | Read support tickets for VoC clustering and customer insights |
| `users:read` | Display requester names in citations |

**Environment Variables**

| Variable | Where | Notes |
|----------|-------|-------|
| ZENDESK_CLIENT_ID | `apps/web/.env.local` | From Zendesk Admin Center |
| ZENDESK_CLIENT_SECRET | `apps/web/.env.local` | From Zendesk Admin Center |
| ZENDESK_SUBDOMAIN | `apps/web/.env.local` | Your Zendesk subdomain (e.g., "acme" for acme.zendesk.com) |

**6.5 Google Workspace (Gmail, Drive, Calendar)** ✅ OAUTH COMPLETE, VERIFICATION IN PROGRESS

**Option A: Development/Testing App (Quick Setup)**

| Step | Status | Instructions |
|------|--------|--------------|
| 1. Create Google Cloud project | ✅ Done | Go to https://console.cloud.google.com/ → Create Project → "PMKit Dev" |
| 2. Enable APIs | ✅ Done | APIs & Services → Library → Enable: Gmail API, Google Drive API, Google Calendar API |
| 3. Create OAuth consent screen | ✅ Done | APIs & Services → OAuth consent screen → External → Fill app info |
| 4. Add scopes | ✅ Done | Add scopes (see below) |
| 5. Create OAuth client | ✅ Done | APIs & Services → Credentials → Create Credentials → OAuth client ID → Web application |
| 6. Set Authorized redirect URIs | ✅ Done | `http://localhost:3000/api/connectors/google/callback` |
| 7. Copy Client ID | ✅ Done | Copy from Credentials page |
| 8. Copy Client Secret | ✅ Done | Copy from Credentials page |
| 9. Add test users | ✅ Done | OAuth consent screen → Test users → Add your email |
| 10. Add env vars | ✅ Done | Add to `apps/web/.env.local`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |

**Option B: Production App**

| Step | Status | Instructions |
|------|--------|--------------|
| 1. Create production project | ✅ Done | Same steps as Option A with production details |
| 2. Set production redirect | ✅ Done | `https://getpmkit.com/api/connectors/google/callback` |
| 3. Complete OAuth consent screen | ✅ Done | Add app icon, privacy policy, terms of service |
| 4. Submit for verification | 🔄 In Progress | OAuth consent screen → Publish App → Submit for verification |
| 5. Respond to verification feedback | 🔲 Pending | Google may request video demo, typically 1-4 weeks |
| 6. Update production env vars | ✅ Done | Add Client ID/Secret to DO App Platform |

**Verification Details**

| Item | Status |
|------|--------|
| Trust center with subprocessors | ✅ Done (`/trust` page) |
| Privacy policy | ✅ Done (`/privacy` page) |
| Data retention policy | ✅ Done |
| LLM data handling policy | ✅ Done |
| Demo video | 🔲 Pending |

**⚠️ Unverified App Warning (Blocks Good FTUE)**

Until Google verification completes, non-test users see a scary warning:
1. User clicks "Connect Gmail/Drive/Calendar"
2. Sees: "Google hasn't verified this app"
3. Must click "Advanced" → "Go to PMKit (unsafe)"
4. Then sees normal consent screen

**Impact**: Kills conversion for new users who don't trust the app yet.

**Workarounds**:
- Add early users as "test users" in Google Cloud Console (they bypass the warning)
- Walk users through the warning on a call
- Wait for verification to complete (1-4 weeks)

**Recommendation**: Promote Slack integration first (no friction). Hold off promoting Google connectors until verified.

**Required Scopes**

| Scope | API | Justification |
|-------|-----|---------------|
| `https://www.googleapis.com/auth/gmail.readonly` | Gmail | Read emails for customer communication context |
| `https://www.googleapis.com/auth/drive.readonly` | Drive | Read documents for PRD context |
| `https://www.googleapis.com/auth/calendar.readonly` | Calendar | Read calendar events for meeting prep |

**Environment Variables**

| Variable | Where | Notes |
|----------|-------|-------|
| GOOGLE_CLIENT_ID | `apps/web/.env.local` | From Google Cloud Console Credentials |
| GOOGLE_CLIENT_SECRET | `apps/web/.env.local` | From Google Cloud Console Credentials |

**Note**: Uses same Google Cloud project as Google OAuth login but with additional API scopes.

**6.6 Figma**

**Option A: Development/Testing App (Quick Setup)**

| Step | Status | Instructions |
|------|--------|--------------|
| 1. Create Figma app | 🔲 Pending | Go to https://www.figma.com/developers/apps → Create new app |
| 2. Name the app | 🔲 Pending | e.g., "PMKit Dev" |
| 3. Set Callback URL | 🔲 Pending | `http://localhost:3000/api/connectors/figma/callback` |
| 4. Select scopes | 🔲 Pending | `file_read`, `file_content:read` |
| 5. Copy Client ID | 🔲 Pending | Copy from app settings |
| 6. Copy Client Secret | 🔲 Pending | Copy from app settings |
| 7. Add env vars | 🔲 Pending | Add to `apps/web/.env.local`: `FIGMA_CLIENT_ID`, `FIGMA_CLIENT_SECRET` |

**Option B: Production App**

| Step | Status | Instructions |
|------|--------|--------------|
| 1. Create production app | 🔲 Pending | Same steps as Option A |
| 2. Set production callback | 🔲 Pending | `https://getpmkit.com/api/connectors/figma/callback` |
| 3. Add app icon and description | 🔲 Pending | App settings → Branding |
| 4. Submit for review | 🔲 Pending | Required for public distribution |
| 5. Update production env vars | 🔲 Pending | Add Client ID/Secret to DO App Platform |

**Scope Justifications**

| Scope | Justification |
|-------|---------------|
| `file_read` | Access file metadata and project structure |
| `file_content:read` | Read design content for prototype generation context |

**Environment Variables**

| Variable | Where | Notes |
|----------|-------|-------|
| FIGMA_CLIENT_ID | `apps/web/.env.local` | From Figma Developer Portal |
| FIGMA_CLIENT_SECRET | `apps/web/.env.local` | From Figma Developer Portal |

**6.7 Connector Encryption**

| Item | Status | Notes |
|------|--------|-------|
| Generate encryption key | 🔲 Pending | `openssl rand -hex 32` |
| CONNECTOR_ENCRYPTION_KEY | 🔲 Pending | For encrypting OAuth tokens at rest |

**All Connector Environment Variables Summary**

| Variable | Connector | Notes |
|----------|-----------|-------|
| CONNECTOR_ENCRYPTION_KEY | All | Shared encryption key for all OAuth tokens |
| SLACK_CLIENT_ID | Slack | From Slack App Dashboard |
| SLACK_CLIENT_SECRET | Slack | From Slack App Dashboard |
| ATLASSIAN_CLIENT_ID | Jira + Confluence | From Atlassian Developer Console |
| ATLASSIAN_CLIENT_SECRET | Jira + Confluence | From Atlassian Developer Console |
| GONG_CLIENT_ID | Gong | From Gong API Settings |
| GONG_CLIENT_SECRET | Gong | From Gong API Settings |
| ZENDESK_CLIENT_ID | Zendesk | From Zendesk Admin Center |
| ZENDESK_CLIENT_SECRET | Zendesk | From Zendesk Admin Center |
| ZENDESK_SUBDOMAIN | Zendesk | Your Zendesk subdomain |
| GOOGLE_CLIENT_ID | Gmail, Drive, Calendar | From Google Cloud Console |
| GOOGLE_CLIENT_SECRET | Gmail, Drive, Calendar | From Google Cloud Console |
| FIGMA_CLIENT_ID | Figma | From Figma Developer Portal |
| FIGMA_CLIENT_SECRET | Figma | From Figma Developer Portal |

### Phase 7: Analytics & SEO 🔲 OPTIONAL

**7.1 Analytics Setup**

| Item | Status | Notes |
|------|--------|-------|
| Simple Analytics | 🔲 Pending | NEXT_PUBLIC_SIMPLE_ANALYTICS_DOMAIN |
| Google Search Console | 🔲 Pending | NEXT_PUBLIC_GSC_VERIFICATION |
| Bing Webmaster Tools | 🔲 Pending | NEXT_PUBLIC_BING_VERIFICATION |

**7.2 AEO/GEO Structured Data** ✅ IMPROVED

| Item | Status | Notes |
|------|--------|-------|
| BreadcrumbList schema (resources) | ✅ Done | Improves navigation in search results |
| BreadcrumbList schema (blog) | ✅ Done | Improves navigation in search results |
| FAQPage schema | ✅ Done | Appears in "People Also Ask" |
| HowTo schema | ✅ Done | For workflow pages with steps |
| BlogPosting with speakable | ✅ Done | Voice search optimization |
| SoftwareApplication schema | ✅ Done | Helps AI understand this is a SaaS tool |
| Organization schema | ✅ Done | Already on homepage |
| Product schema | ✅ Done | Already on homepage |

**7.3 SEO Content Gaps** ✅ MOSTLY COMPLETE

Priority pages to create for keyword coverage:

| Page Type | Status | Target Keywords |
|-----------|--------|-----------------|
| `/integrations/jira` | ✅ Done | "Jira AI integration", "Jira automation PM" |
| `/integrations/slack` | ✅ Done | "Slack AI product managers", "Slack daily brief" |
| `/integrations/gong` | ✅ Done | "Gong AI insights", "call transcript analysis PM" |
| `/integrations/confluence` | ✅ Done | "Confluence AI", "auto-generate Confluence" |
| `/integrations/zendesk` | ✅ Done | "Zendesk ticket analysis AI" |
| `/integrations/amplitude` | 🔲 Pending | "Amplitude product analytics AI" (marked as coming soon) |
| `/use-cases/saas-pm` | 🔲 Pending | "AI for SaaS product managers" |
| `/use-cases/enterprise-pm` | 🔲 Pending | "enterprise product management AI" |
| `/use-cases/b2b-teams` | 🔲 Pending | "B2B product management automation" |
| `/use-cases/product-ops` | 🔲 Pending | "product operations automation" |
| `/guides/how-to-write-prd-ai` | ✅ Done | "how to write PRD with AI" |
| `/guides/prioritize-features-ai` | ✅ Done | "feature prioritization AI" |
| `/guides/automate-release-notes` | ✅ Done | "automate release notes" |
| `/templates/prd` | ✅ Done | "PRD template", "product requirements template" |
| `/templates/daily-brief` | ✅ Done | "daily standup template PM" |
| `/compare/notion-ai` | ✅ Done | "pmkit vs Notion AI" |
| `/compare/linear` | ✅ Done | "pmkit vs Linear" |
| `/compare/aha` | ✅ Done | "pmkit vs Aha" |

**7.4 Long-Tail Keywords to Target** 🔲 PENDING

High-value keywords not yet targeted in existing content:

| Keyword | Search Intent | Suggested Content |
|---------|---------------|-------------------|
| "how to automate product management tasks" | Informational | Blog post or guide |
| "AI tool for product requirements" | Commercial | Integration page |
| "automate customer feedback analysis" | Commercial | VoC resource page enhancement |
| "Jira to PRD automation" | Commercial | Integration landing page |
| "daily standup brief automation" | Commercial | Daily Brief resource enhancement |
| "competitive analysis tool PM" | Commercial | Competitor research page |
| "feature prioritization framework AI" | Informational | Guide or blog post |
| "product roadmap from customer feedback" | Informational | Blog post |
| "AI sprint planning assistant" | Commercial | Sprint review resource enhancement |
| "PRD generator free" | Commercial | Demo page SEO |

**7.5 Competitor Keywords to Capture**

| Competitor | Their Keywords | PMKit Opportunity |
|------------|----------------|-------------------|
| ChatPRD | "AI PRD generator", "AI product manager" | Compare page, PRD template page |
| ProductBoard | "customer feedback platform", "feature prioritization" | VoC clustering, roadmap alignment |
| Aha! | "product roadmap software", "roadmap template" | Roadmap alignment, template pages |
| Notion AI | "product management template", "AI workspace" | All-in-one positioning, template pages |
| Linear | "developer issue tracking", "modern Jira" | Cross-team dependencies, sprint review |

### Phase 8: Database Migration 🔲 REQUIRED

| Item | Status | Notes |
|------|--------|-------|
| Generate Prisma client | 🔲 Pending | `npm run db:generate` |
| Push schema to database | 🔲 Pending | `npm run db:push` |
| Verify tables created | 🔲 Pending | Check DO database console |

### Phase 9: Deployment 🔲 REQUIRED

| Item | Status | Notes |
|------|--------|-------|
| Connect GitHub repo to DO | 🔲 Pending | App Platform |
| Build command configured | 🔲 Pending | `npm run build` |
| Run command configured | 🔲 Pending | `npm run start` |
| Environment variables added | 🔲 Pending | All from .env.local |
| Custom domain configured | 🔲 Pending | getpmkit.com |
| HTTPS enabled | 🔲 Pending | Automatic with DO |
| Homepage loads | 🔲 Pending | Verify https://getpmkit.com |
| Demo console works | 🔲 Pending | Verify /demo/console |
| Google OAuth login works | 🔲 Pending | Test login flow |
| Database connection works | 🔲 Pending | Check logs |
| Redis connection works | 🔲 Pending | Check logs |

### Deployment Summary

| Phase | Status | Priority |
|-------|--------|----------|
| 1. Infrastructure | ✅ Complete | Required |
| 2. LLM Configuration | ✅ Complete | Required |
| 3. Authentication | ✅ Complete | Required |
| 4. Microsoft OAuth | 🔲 Pending | Optional |
| 5. Stripe Billing | 🔲 Pending | Required for paid |
| 6. Connector OAuth | 🔲 Pending | When ready |
| 7. Analytics & SEO | 🔲 Pending | Optional |
| 8. Database Migration | 🔲 Pending | **Required - Next** |
| 9. Deployment | 🔲 Pending | **Required - Next** |

**Recommended next steps:**
1. **Database Migration** (Phase 8) - Run `npm run db:push` to create tables
2. **Deployment** (Phase 9) - Deploy to DO App Platform
3. **Stripe** (Phase 5) - When ready to accept payments
4. **Connectors** (Phase 6) - When ready for real customer data

---

## 🟠 High Priority

Items that back up marketing claims or are needed for credibility.

### Beta Workflows (MCP Server Testing)

3 experimental workflows are being tested via the Claude MCP server app. These are NOT planned for Demo Console/Workbench - they're a POC for running workflows outside the main app.

| Item | Status | Notes |
|------|--------|-------|
| Feature Ideation (`/ideate`) | 🧪 Beta | Testing via MCP server. Transform ideas into structured feature concepts. |
| One-Pager (`/onepager`) | 🧪 Beta | Testing via MCP server. Executive summary (400-500 words). |
| TL;DR (`/tldr`) | 🧪 Beta | Testing via MCP server. Quick Slack-style summary (3-5 bullets). |

### Audit & Telemetry

| Item | Status | Notes |
|------|--------|-------|
| ~~Wire up AuditLog in demo console~~ | ✅ Done | Added Audit Log tab to demo console |
| ~~SIEM export schema~~ | ✅ Done | `packages/core/src/telemetry/index.ts` |
| ~~Extended telemetry schema~~ | ✅ Done | Added runId, stepId, token usage, etc. |
| ~~Analysis type definitions~~ | ✅ Done | Failure clustering, drift detection, anomaly baselines |
| ~~Guardrail/refusal audit events~~ | ✅ Done | Added to AuditActionSchema and AuditLogger |
| ~~SIEM export demo (Demo Console)~~ | ✅ Done | Added SIEMExportPreview to Audit tab |
| ~~SIEM export demo (Workbench)~~ | ✅ Done | Added SIEMExportPreview to Output tab |
| Implement actual SIEM webhook export | 🔜 Planned | Schema exists, need API endpoint |
| Implement failure-mode clustering logic | 🔜 Planned | Types exist, need implementation |
| Implement drift detection logic | 🔜 Planned | Types exist, need implementation |
| Implement anomaly baseline calculation | 🔜 Planned | Types exist, need implementation |
| Add audit log tab to Workbench | 🔜 Planned | Currently only in demo console |

### Status Page

| Item | Status | Notes |
|------|--------|-------|
| ~~Basic /status page~~ | ✅ Done | Static page at `getpmkit.com/status` |
| Move status page to subdomain | 🔜 Planned | `status.getpmkit.com` for resilience |
| Real-time status monitoring | 🔜 Planned | Currently hardcoded "operational" |
| Incident history from database | 🔜 Planned | Currently shows "no incidents" |
| Status webhook notifications | 🔜 Planned | For enterprise customers |

---

## 🎯 Autonomous Agent: Daily Brief ✅ MVP COMPLETE

**Goal**: Build an agent that runs automatically on a schedule, pulling real data from connected integrations and delivering a Daily Brief to the PM each morning.

**Status**: MVP implementation complete for Slack integration. Agent can be configured, runs autonomously on schedule, and delivers briefs with citations.

### Phase 1: Real Connector OAuth ✅ COMPLETE (Slack)

| Item | Status | Notes |
|------|--------|-------|
| **Slack OAuth integration** | ✅ Done | `/api/connectors/slack/authorize` + `/callback` |
| Slack scopes: `channels:history`, `channels:read`, `groups:history`, `groups:read`, `users:read` | ✅ Done | Public + private channel access |
| Slack token storage (encrypted) | ✅ Done | AES-256-GCM encryption with `CONNECTOR_ENCRYPTION_KEY` |
| Slack real data fetcher | ✅ Done | `packages/core/src/agents/daily-brief/slack-fetcher.ts` |
| Integrations settings page | ✅ Done | `/settings/integrations` with Connect/Disconnect |
| **Jira OAuth integration** | 🔜 Phase 2 | Not needed for Slack-only MVP |
| **Zendesk OAuth integration** | 🔜 Phase 2 | Not needed for Slack-only MVP |

### Phase 2: Scheduled Job Infrastructure ✅ COMPLETE

| Item | Status | Notes |
|------|--------|-------|
| **AgentConfig database model** | ✅ Done | `prisma/schema.prisma` - stores config, nextRunAt, lastRunAt |
| **Agent setup UI** | ✅ Done | `/agents/daily-brief` with channel selection, delivery time, timezone |
| Time selector | ✅ Done | 6am-10am options |
| Timezone selector | ✅ Done | Auto-detect with manual override, 14 timezones |
| **BullMQ scheduled jobs** | ✅ Done | `apps/worker/src/agent-scheduler.ts` |
| Schedule sync on startup | ✅ Done | Worker loads active configs on boot |
| **Dynamic schedule sync** | ✅ Done | Web app notifies worker via scheduler-commands queue when config changes |
| Agent config CRUD API | ✅ Done | `POST/GET/DELETE /api/agents/daily-brief` |

### Phase 3: Autonomous Execution ✅ COMPLETE

| Item | Status | Notes |
|------|--------|-------|
| **Agent orchestrator** | ✅ Done | `packages/core/src/agents/daily-brief/orchestrator.ts` |
| Data fetching step | ✅ Done | Fetches messages from selected channels |
| Citation tracking | ✅ Done | `citation-tracker.ts` - tracks sources with permalinks |
| Prompt assembly | ✅ Done | Formats messages with citation numbers |
| LLM generation | ✅ Done | Uses existing LLMService |
| Artifact storage | ✅ Done | Stores to `Artifact` model with stats |
| Source storage | ✅ Done | Stores to `Source` model for traceability |
| **Manual trigger** | ✅ Done | "Run Now" button + API |
| Dashboard notification | ✅ Done | Brief appears in history |
| Failure handling & retry | ✅ Done | BullMQ retry with exponential backoff |
| Execution audit logging | ✅ Done | Full audit trail via AuditLog |
| **Delivery: Slack DM** | 🔜 Future | Post brief to user's Slack DM |
| Delivery: Email | 💡 Idea | Send as email digest |

### Phase 4: User Configuration ✅ COMPLETE

| Item | Status | Notes |
|------|--------|-------|
| Channel selection | ✅ Done | Multi-select checkbox list of channels |
| Lookback window | ✅ Done | 24h or 36h (1.5 day overlap) |
| Delivery time | ✅ Done | 6am-10am in user's timezone |
| Pause/resume schedule | ✅ Done | Active/Paused toggle |
| **Brief history page** | ✅ Done | `/agents/daily-brief/history` |
| **Brief detail page** | ✅ Done | `/agents/daily-brief/[jobId]` with download |
| Skip weekends option | 🔜 Future | Not in MVP |
| Priority keywords | 💡 Idea | Highlight certain terms |

### Phase 5: Gmail Orchestrator Support 🔜 PLANNED

Enable Daily Brief to work with Gmail as a primary data source (in addition to Slack).

| Item | Status | Notes |
|------|--------|-------|
| **GmailFetcher class** | 🔜 Planned | `packages/core/src/agents/daily-brief/gmail-fetcher.ts` - mirrors SlackFetcher pattern |
| Gmail config in DailyBriefConfig | 🔜 Planned | `includeGmail`, `gmailLabels`, `gmailMaxThreads` options |
| Orchestrator Gmail support | 🔜 Planned | Accept Gmail credentials, fetch email data, merge into brief |
| Trigger route Gmail execution | 🔜 Planned | Pass Gmail credentials to orchestrator, remove "coming soon" message |
| Gmail prompt sections | 🔜 Planned | Email summary, requires-response highlights in `packages/prompts/src/daily-brief.ts` |
| Gmail citation sources | 🔜 Planned | Track email thread links in citation-tracker.ts |
| Unit tests with mock data | 🔜 Planned | Use MockGmailMCPServer for testing |

**Current State**: Gmail OAuth works, RealGmailMCPServer exists, but orchestrator only knows Slack. UI shows "Gmail-based Daily Briefs coming soon!" when Gmail is only source.

**Goal**: User can run Daily Brief with Gmail connected (no Slack required). Email summaries appear in brief with citations.

### Future Enhancements

| Item | Status | Notes |
|------|--------|-------|
| Gmail/Drive/Calendar mock data | ✅ Done | Mock data and MCP servers created in `packages/mock-tenant/src/data/google.ts` and `packages/mcp-servers/src/gmail/`, `google-drive/`, `google-calendar/` |
| Gmail/Drive/Calendar OAuth | 🔜 Phase 2 | Need Google OAuth flows for real data |
| Cross-workflow orchestration | 💡 Idea | Daily Brief triggers VoC clustering |
| Slack DM delivery | 🔜 Future | Send brief directly to Slack |
| Email delivery | 💡 Idea | Morning email digest |
| Multiple agents per user | 💡 Idea | Different configs for different use cases |

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Scheduler Service                            │
│  (BullMQ with repeat jobs, runs in apps/worker)                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Agent Orchestrator                            │
│  1. Load ScheduledJob config                                     │
│  2. Fetch credentials from ConnectorInstall                      │
│  3. Call real connectors (Slack, Jira, Zendesk)                 │
│  4. Assemble prompt context                                      │
│  5. Generate artifact via LLM                                    │
│  6. Store artifact                                               │
│  7. Deliver to user (Slack DM / Email / Dashboard)              │
│  8. Log execution to AuditLog                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │  Slack   │   │   Jira   │   │ Zendesk  │
        │   API    │   │   API    │   │   API    │
        └──────────┘   └──────────┘   └──────────┘
```

### Data Flow for Daily Brief

```
Input Sources:
├── Slack: Messages from last 24h in selected channels
│   └── slackMessages: Channel activity, mentions, threads
├── Jira: Updates from last 24h in selected projects
│   └── jiraUpdates: Status changes, new issues, comments
├── Zendesk: Tickets updated in last 24h
│   └── supportTickets: New/updated tickets, escalations
└── Community: Recent posts (optional, can use crawler)
    └── communityActivity: Feature requests, discussions

Output:
├── Artifact: Markdown Daily Brief
│   ├── TL;DR (2-3 sentences)
│   ├── Urgent Items (blockers, escalations)
│   ├── Sprint Progress
│   ├── Customer Signal
│   └── Recommended Actions
└── Delivery: Slack DM to user
```

### Success Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| Schedule reliability | 99.5% | Jobs run on time |
| Data freshness | < 5 min old | Data fetched at execution time |
| Generation success rate | > 95% | Briefs generated without error |
| Delivery success rate | > 99% | Briefs delivered to user |
| User engagement | > 50% open rate | Users read their briefs |

---

## 🚀 Individual Plan Implementation

**Goal**: Launch the $79/month Individual Plan as the first paid tier. This is the priority path to revenue.

| Item | Status | Notes |
|------|--------|-------|
| **Pricing page update** | ✅ Done | Individual ($79/mo or $69/mo annual), Teams (Contact Sales), Enterprise (Contact Sales) |
| **Billing config update** | ✅ Done | INDIVIDUAL_PLAN and INTERNAL_PLAN added to `packages/core/src/billing/index.ts` |
| **Admin user detection** | ✅ Done | `isAdminEmail()` helper already exists in `apps/web/src/lib/admin.ts` |
| **Stripe Individual product** | 🔜 Required | Create $79/month product + $828/year price |
| **Checkout flow** | 🔜 Required | /upgrade page → Stripe Checkout → success/cancel handling |
| **Subscription webhooks** | 🔜 Required | Handle checkout.session.completed, subscription.updated, subscription.deleted |
| **User plan field** | 🔜 Required | Add `plan: 'demo' | 'individual' | 'teams'` to User model |
| **Paywall logic** | 🔜 Required | Only Individual/Teams can connect real connectors |
| **Billing portal link** | 🔜 Required | Link to Stripe portal for managing subscription |
| **Usage limits** | ✅ Defined | Individual plan has unlimited on-demand (-1 in billing config) |

---

## 🚀 Production Agent Launch

**Goal**: Get the Daily Brief agent working with real Slack data in production.

### Slack App Setup ✅ COMPLETE

| Item | Status | Notes |
|------|--------|-------|
| Create Slack app | ✅ Done | https://api.slack.com/apps |
| Add bot scopes | ✅ Done | channels:history, channels:read, groups:history, groups:read, users:read |
| Add redirect URL | ✅ Done | https://getpmkit.com/api/connectors/slack/callback |
| Generate encryption key | ✅ Done | `openssl rand -hex 32` → CONNECTOR_ENCRYPTION_KEY |
| Add env vars to production | ✅ Done | SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, CONNECTOR_ENCRYPTION_KEY |
| Submit to Slack App Directory | 🔄 In Progress | Pending Slack review |

### Google Workspace Setup ✅ OAUTH COMPLETE

| Item | Status | Notes |
|------|--------|-------|
| Create Google Cloud project | ✅ Done | APIs enabled: Gmail, Drive, Calendar |
| Configure OAuth consent screen | ✅ Done | External app with all required info |
| Add production redirect URIs | ✅ Done | https://getpmkit.com/api/connectors/google/callback |
| Add env vars to production | ✅ Done | GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET |
| Submit for Google verification | 🔄 In Progress | Pending Google review (sensitive/restricted scopes) |
| Create demo video for Google | 🔲 Pending | Required for verification |

### Production Testing

| Item | Status | Notes |
|------|--------|-------|
| Test Slack OAuth flow | ✅ Done | Connect real Slack workspace |
| Test channel listing | ✅ Done | Verify channels appear in setup UI |
| Test brief generation | 🔲 Pending | Run with real messages |
| Test scheduler | 🔲 Pending | Verify daily execution |
| Monitor first week | 🔲 Pending | Watch for errors, rate limits |

---

## 📈 GTM & Sales Pipeline

| Item | Status | Notes |
|------|--------|-------|
| **Contact form backend** | 🔲 Pending | /contact form → email to sales@getpmkit.com |
| **Teams inquiry workflow** | 🔲 Pending | Contact form → HubSpot/Notion → follow-up process |
| **Demo request tracking** | 💡 Consider | Track demo usage → reach out to active demo users |
| **Waitlist for Teams** | 💡 Consider | Collect interest for Teams plan |

---

## 🎨 Figma Integration

**Goal**: Allow users to push prototypes to Figma for professional editing.

| Item | Status | Notes |
|------|--------|-------|
| Figma OAuth app | 💡 Idea | Figma Developer Console |
| Figma API client | 💡 Idea | Create Figma file from prototype HTML |
| "Push to Figma" button | 💡 Idea | On prototype artifacts |
| Figma plugin (alternative) | 💡 Idea | Paste HTML → Figma conversion |

---

## 🟡 Medium Priority

Features that are claimed as "coming soon" or partially implemented.

### Enterprise Features (Pricing Page Claims)

| Item | Status | Notes |
|------|--------|-------|
| Data residency options | 🔜 Coming Soon | Claimed on pricing page |
| Customer-managed keys (KMS) | 🔜 Coming Soon | Claimed on pricing page |
| Private networking / on-prem | 🔜 Coming Soon | Claimed on pricing page |
| SAML SSO | 🔜 Planned | Enterprise plan feature |
| SCIM directory sync | 🔜 Planned | Enterprise plan feature |
| Audit export API | 🔜 Planned | Enterprise feature, schema exists |

### Authentication

| Item | Status | Notes |
|------|--------|-------|
| Microsoft login | 🔜 Coming Soon | Shown on login page |
| Apple login | ❓ Consider | Not currently planned |

### Compliance

| Item | Status | Notes |
|------|--------|-------|
| SOC 2 Type II | 🔄 In Progress | Claimed on trust/security pages |
| ISO 27001 | 🔜 Planned | Post-SOC 2 |

### Billing & Subscription

| Item | Status | Notes |
|------|--------|-------|
| Stripe integration | 🔜 Planned | Subscription schema exists, need webhook handlers |
| Seat management UI | 🔜 Planned | For Teams plan (5+ seats) |
| Usage billing dashboard | 🔜 Planned | Show token usage, job counts per billing period |
| Upgrade/downgrade flow | 🔜 Planned | Self-service plan changes |
| Invoice history page | 🔜 Planned | View past invoices in dashboard |

### Proposal Execution

| Item | Status | Notes |
|------|--------|-------|
| Proposal approval execution | 🔜 Planned | When proposal approved, execute the write to external system |
| Proposal rejection workflow | 🔜 Planned | Record rejection reason, notify creator |
| Proposal edit-before-approve | 🔜 Planned | Allow reviewers to modify bundle before approval |
| Proposal notifications | 🔜 Planned | Email/Slack notifications for pending proposals |

---

## 🟢 Lower Priority

Nice-to-have improvements and optimizations.

### Demo & Workbench

| Item | Status | Notes |
|------|--------|-------|
| Real connector OAuth flows | 🔜 Planned | Currently all mock data |
| Workbench audit log tab | 🔜 Planned | Show audit trail for admin users |
| Demo rate limit UI improvements | 💡 Idea | Better feedback when rate limited |
| Persist Workbench data to database | 🔜 Planned | Currently uses localStorage; should persist PM Jobs and Crawler Results to database for logged-in users |

### Shareable Results (Workbench)

Share Crawler Results and PM Job artifacts via secure links or document export.

**MVP (Basic Sharing)**

| Item | Status | Notes |
|------|--------|-------|
| Export as Markdown file | ✅ Done | Download formatted .md file with full results |
| Export as HTML file | ✅ Done | For PRD to Prototype workflow; styled, self-contained HTML |
| Copy as formatted text | ✅ Done | One-click copy for Slack/email/Notion (Markdown and plain text) |
| Share dialog UI | ✅ Done | Modal with export options for PM Jobs and Crawler Results |

**Phase 2 (Shareable Links)**

| Item | Status | Notes |
|------|--------|-------|
| `SharedArtifact` database model | 🔜 Planned | Store shared content with secure token |
| `POST /api/share/create` endpoint | 🔜 Planned | Generate shareable link |
| `/share/[token]` public page | 🔜 Planned | View-only page, no auth required |
| Expiration options (24h, 7d, 30d, never) | 🔜 Planned | Auto-expire old shares |
| Copy link button | 🔜 Planned | Easy sharing UX |
| List/revoke shares | 🔜 Planned | Manage active shares |

**Phase 3 (Advanced Features)**

| Item | Status | Notes |
|------|--------|-------|
| Password-protected shares | 💡 Idea | Optional security layer |
| View count tracking | 💡 Idea | Analytics on share engagement |
| QR code generation | 💡 Idea | For presentations/meetings |
| Export to PDF | 💡 Idea | Formatted PDF with branding |
| Export to Confluence (proposal) | 💡 Idea | Uses draft-only pattern |
| Embed snippet for websites | 💡 Idea | `<iframe>` embed code |
| Share audit logging | 💡 Idea | Track who shared what, who viewed |

### Telemetry & Observability

| Item | Status | Notes |
|------|--------|-------|
| OpenTelemetry integration | 💡 Idea | For distributed tracing |
| Prometheus metrics endpoint | 💡 Idea | For monitoring |
| Grafana dashboard templates | 💡 Idea | For customers |

### Performance

| Item | Status | Notes |
|------|--------|-------|
| LLM response caching | 💡 Idea | Cache identical prompts |
| Connector response caching | 💡 Idea | Cache MCP tool responses |

### User Experience Improvements

| Item | Status | Notes |
|------|--------|-------|
| Job templates / presets | 💡 Idea | Save common configurations for quick re-runs |
| Favorite workflows | 💡 Idea | Pin frequently used workflows to top |
| Recent inputs auto-fill | 💡 Idea | Remember last inputs for each workflow type |
| Keyboard shortcuts | 💡 Idea | Ctrl+Enter to run, etc. |
| Dark mode toggle | 💡 Idea | User preference for dark/light theme |
| Mobile-responsive workbench | 💡 Idea | Better mobile experience for viewing results |

### Integrations & Triggers

| Item | Status | Notes |
|------|--------|-------|
| Slack bot integration | 🔜 Planned | Run workflows via Slack commands (claimed on website) |
| Teams bot integration | 🔜 Planned | Run workflows via Teams mentions (claimed on website) |
| Email-triggered workflows | 💡 Idea | Forward emails to trigger jobs (claimed on website) |
| Scheduled/recurring jobs | 💡 Idea | Auto-run daily brief every morning |
| Webhook triggers | 💡 Idea | External systems can trigger jobs via API |
| Zapier/Make integration | 💡 Idea | No-code automation platform support |

### Multi-Language Support

| Item | Status | Notes |
|------|--------|-------|
| i18n framework setup | 💡 Idea | Support for non-English users |
| Prompt localization | 💡 Idea | Generate artifacts in user's preferred language |

---

## 📝 Documentation Gaps

Items where documentation claims features that aren't fully implemented.

| Claim | Location | Status | Notes |
|-------|----------|--------|-------|
| "SIEM integration via webhook" | Trust page, Resources FAQ | 🔜 Schema only | Need actual webhook endpoint |
| "Export audit logs to CSV or JSON" | Resources FAQ | 🔜 Planned | Need export API |
| "Audit export API" | Pricing page | 🔜 Planned | Enterprise feature |
| "Slack commands" | How It Works, Demo Console | 🔜 Demo only | Simulated in demo, not real Slack integration |
| "Teams mentions" | How It Works | 🔜 Demo only | Simulated in demo, not real Teams integration |
| "Email instructions" | How It Works | 🔜 Not implemented | Claimed as trigger method but not built |
| "Custom connectors (built on demand)" | Pricing page | 🔜 Enterprise feature | Need custom connector framework |
| "Bring-your-own LLM endpoint" | Pricing page | 🔜 Enterprise feature | Need LLM endpoint configuration |
| "13 PM workflows" | Standalone MCP server | 🧪 By Design | 10 production workflows + 3 beta workflows in MCP server for testing |

---

## 🐛 Known Issues

| Issue | Status | Notes |
|-------|--------|-------|
| ~~Agent scheduler not syncing on config changes~~ | ✅ Fixed | Web app now notifies worker via BullMQ command queue |
| ~~Data sources settings not persisting~~ | ✅ Fixed | Enabled state now restored from saved config on page load |

---

## 💡 Ideas & Future Considerations

Items that have been discussed but not committed to.

### New Workflow Ideas

High-value workflows that could differentiate from current offerings:

| Workflow | Why It Beats Current Offerings |
|----------|--------------------------------|
| **Stakeholder Update Automation** | Weekly exec updates are dreaded and time-consuming. Auto-draft from Jira/Slack with "What shipped / What's blocked / What's next" |
| **Feature Request Triage** | Auto-categorize, dedupe, and link to existing roadmap items. This is a daily pain point. |
| **OKR Progress Tracking** | Auto-pull metrics, draft progress updates, flag at-risk OKRs. Connects to exec accountability anxiety |
| **Cross-Team Dependency Alerts** | Proactive detection of blocked dependencies across teams. Enterprise pain point. |
| **User Research Synthesis** | Auto-summarize interview transcripts with theme extraction. High time-savings (10+ hours) |

### Other Ideas

| Idea | Category | Notes |
|------|----------|-------|
| **File Upload Crawler (5th AI Crawler)** | Crawlers | Upload PDF, DOCX, PPTX for AI analysis. Extract key data, synthesize insights, compare documents. Use cases: competitor whitepapers, analyst reports, sales decks, RFPs, contracts. Would need: file upload UI, document parsing (pdf-parse, mammoth), chunking for large docs, specialized analysis prompts. |
| **Artifact comparison/diff view** | Artifacts | Compare two versions of a PRD, VoC report, etc. to see what changed. Useful for iteration tracking. |
| **Artifact versioning** | Artifacts | Store multiple versions of an artifact, track evolution over time |
| **Workflow chaining UI** | Workflows | Visual pipeline builder: VoC → PRD → Prototype with auto-pass of context |
| **Custom workflow builder** | Workflows | Let users create their own prompt templates with custom fields |
| **Team collaboration features** | Collaboration | Comments on artifacts, @mentions, shared workspaces |
| **Artifact search** | Discovery | Full-text search across all generated artifacts |
| **Dashboard analytics** | Analytics | Charts showing job usage, popular workflows, time saved metrics |
| **Customer success metrics** | Analytics | Track "time saved" and "documents generated" per user/team |
| AI-powered anomaly detection | Telemetry | Use LLM to analyze patterns |
| Slack/Teams bot for status alerts | Status | Push notifications for incidents |
| Self-service connector OAuth | Connectors | Let users connect without sales |
| Prompt version tracking | Telemetry | Track which prompt versions perform best |
| A/B testing for prompts | Prompts | Compare prompt performance |
| Cost allocation by team | Billing | Break down LLM costs by team/user |
| **Bring-your-own LLM** | Enterprise | Support custom LLM endpoints (claimed on pricing page as enterprise feature) |
| **Custom connectors API** | Enterprise | Let enterprise customers build their own connectors |
| **Artifact templates** | Workflows | Pre-filled templates for common scenarios (e.g., "Mobile App PRD", "API Feature PRD") |
| **Feedback loop on artifacts** | Quality | Rate generated artifacts, use ratings to improve prompts |
| **Export to Notion** | Integrations | One-click export artifacts to Notion pages |
| **Export to Linear** | Integrations | Create Linear issues from PRDs |
| **Export to Asana** | Integrations | Create Asana tasks from sprint reviews |
| **AI writing assistant** | Editing | In-line AI suggestions when editing artifacts |

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ Done | Fully implemented and tested |
| 🔄 In Progress | Currently being worked on |
| 🔜 Planned | Committed to roadmap |
| 🔜 Coming Soon | Claimed on marketing pages |
| 🧪 Beta | Experimental, being tested via MCP server |
| 💡 Idea | Discussed but not committed |
| ❓ Consider | Needs evaluation |
| ❌ Won't Do | Decided against |

---

## Changelog

### 2026-01-20 (MVP Launch Readiness Planning)
- **Added MVP Launch Checklist** - New top-level section tracking all launch requirements:
  - **Stripe Payments** (P0): 13 items tracked - SDK, API routes, products, webhooks, paywall
  - **Email Delivery** (P0): 9 items tracked - Resend service, templates, job processor integration
  - **Gong Connector** (P1): OAuth ✅, 3 Real MCP tools pending, GongFetcher pending
  - **Zendesk Connector** (P1): OAuth ✅, Real MCP ✅, ZendeskFetcher pending
  - **Contact Form Backend** (P1): 4 items - API route, email, validation, rate limiting
  - **Error Monitoring** (P2): Sentry integration for production debugging
  - **Production Testing Checklist**: 8 end-to-end tests before launch
- **Pricing update** - Launch price now $29/month (was $79), $19/month annual ($228/year)
- **Agent visibility** - Non-admin users see only 3 agents (Daily Brief, Meeting Prep, VoC Clustering), others "Coming Soon"
- **Jira/Confluence toggles fixed** - Data source toggles now work and persist across all agent pages

### 2026-01-20 (Connector Terminology & Fetcher Updates)
- **Removed MCP terminology from marketing** - Updated website to use "secure connectors" and "OAuth integrations" instead of MCP references:
  - 6 marketing pages updated: `/how-it-works`, `/integrations`, `/pricing`, `/security`, `/trust`, `/resources`
  - Compare page: Changed "Battlecards" to "Comparisons"
  - Resource page URL renamed: `/resources/mcp-connectors-for-enterprise-tools` → `/resources/secure-connectors-for-enterprise-tools`
  - Added permanent redirect from old URL to new URL in `next.config.js`
- **Hidden MCP Clients section** - Commented out in `/settings/integrations` (code preserved, not shown to users)
- **Created real data fetchers** - Built fetcher classes for Atlassian and Google Drive APIs:
  - `JiraFetcher` (`packages/core/src/fetchers/jira-fetcher.ts`) - Atlassian REST API v3, supports JQL queries
  - `ConfluenceFetcher` (`packages/core/src/fetchers/confluence-fetcher.ts`) - Atlassian REST API v3, supports CQL queries
  - `DriveFetcher` (`packages/core/src/fetchers/drive-fetcher.ts`) - Google Drive API v3, supports folder/MIME filtering
- **Fetcher pattern established** - All fetchers implement `IFetcher` interface with:
  - `fromEncrypted()` static factory method
  - `fetch()` method returning `FetchResult<TMetadata>`
  - Token decryption via `decryptTokens()`
- **Connector status updated**:
  - ✅ Complete (OAuth + Fetcher): Slack, Gmail, Google Calendar, Google Drive, Jira, Confluence
  - 🔲 OAuth only (no fetcher): Gong, Zendesk
  - 🔲 Not started: Figma, Amplitude, Linear

### 2026-01-19 (Slack & Google OAuth Production Setup)
- **Slack App Directory submission** - Production Slack app ready for customer installs:
  - OAuth flow working with production redirect URI
  - All scopes configured and justified (channels:history, channels:read, groups:history, groups:read, users:read)
  - App submitted to Slack App Directory for review
  - Customers can install via "Add to Slack" button even before marketplace approval
- **Google OAuth verification in progress** - Gmail, Drive, Calendar integration:
  - All three APIs enabled and configured
  - OAuth consent screen completed with sensitive/restricted scopes
  - Production redirect URIs configured
  - Verification submitted (pending Google review)
  - Scope justifications provided for calendar.readonly, drive.readonly, gmail.readonly
- **Trust center updated** - Subprocessors section available at `/trust`
- **Environment variables** - All connector secrets configured in DigitalOcean:
  - SLACK_CLIENT_ID, SLACK_CLIENT_SECRET
  - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
  - CONNECTOR_ENCRYPTION_KEY (encrypted)

### 2026-01-19 (Scheduler Sync & Data Source Persistence)
- **Fixed Daily Brief scheduler sync** - Agent now properly schedules when config is saved:
  - Added `scheduler-client.ts` in web app to send commands to worker via BullMQ
  - Added `startCommandWorker()` in agent-scheduler to process schedule/cancel/reload commands
  - Web app notifies worker when config is saved (active → schedule, paused → cancel)
  - Worker reloads config from DB and updates BullMQ scheduled job
- **Fixed data sources settings persistence** - All 3 autonomous agents now persist enabled states:
  - **Daily Brief**: `includeGmail`, `includeGoogleDrive`, `includeGoogleCalendar` restored on page load
  - **Sprint Review**: `includeSlackHighlights`, `includeConfluence` restored on page load
  - **Meeting Prep**: Added `enabledSources` map to config, restored on page load
- **Root cause**: Previously, enabled states were set to `isConnected` on load, ignoring saved preferences

### 2026-01-18 (Standardized Agent Page UI)
- **Simplified button UI across all 10 agent pages** - Consistent action buttons:
  - Left side: "Run Now" button (admin-only, visible via `isAdmin` state check)
  - Right side: "Save Agent Settings" button (primary action)
  - Removed "Enable Agent" button from footer (redundant with Agent Status card toggle)
- **Agent Status card** - The inline "Agent Status" card with toggle switch handles enabling/disabling agents in fully autonomous agents (Daily Brief, Meeting Prep, Sprint Review). The toggle state is persisted via "Save Agent Settings".
- **Admin detection pattern** - All agent pages fetch admin status:
  ```typescript
  useEffect(() => {
    async function checkAdmin() {
      const res = await fetch('/api/workbench/run-job');
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(data.isAdmin === true);
      }
    }
    checkAdmin();
  }, []);
  ```
- **Agent categories established**:
  - **Fully Autonomous** (3): Daily Brief, Meeting Prep, Sprint Review - Save/toggle functionality works
  - **Coming Soon** (7): PRD Draft, VoC Clustering, Competitor Research, Roadmap Alignment, Deck Content, Release Notes, Prototype Generation - Save button disabled with tooltip
- **Removed redundant code** - Cleaned up `handleEnableAgent`, `configSaved`, `isEnabling` state variables from all agent pages

### 2026-01-18 (Autonomous Agent Architecture)
- **Extended AgentTypeSchema** - Added all 10 agent types to core types:
  - `daily_brief`, `meeting_prep`, `sprint_review`, `voc_clustering`, `competitor_research`
  - `roadmap_alignment`, `deck_content`, `release_notes`, `prd_draft`, `prototype_generation`
- **Added AgentTriggerTypeSchema** - New trigger types for autonomous agents:
  - `schedule` - Daily/weekly/monthly schedules (Daily Brief)
  - `calendar` - Calendar event triggers (Meeting Prep, Sprint Review, Deck Content)
  - `jira` - Jira webhook triggers (Release Notes, PRD Draft)
  - `artifact` - Artifact chain triggers (Prototype Generation)
- **Config schemas for all agents** - Created typed config schemas:
  - `MeetingPrepConfigSchema` - Lead time, timezone, data sources
  - `SprintReviewConfigSchema` - Calendar keywords, lead time, Jira projects, velocity/carryover options
  - `VocClusteringConfigSchema` - Weekly schedule, lookback days, data sources
  - `CompetitorResearchConfigSchema` - Weekly schedule, competitor list, tracking options
  - `RoadmapAlignmentConfigSchema` - Monthly schedule, data sources
  - `DeckContentConfigSchema` - Calendar keywords for presentations, lead time
  - `ReleaseNotesConfigSchema` - Jira projects, auto-trigger, audience types
  - `PrdDraftConfigSchema` - Jira projects, epic status triggers
  - `PrototypeGenerationConfigSchema` - Artifact triggers, auto-generate option
- **Sprint Review autonomous UI** - Transformed page to full autonomous agent:
  - Dynamic Active/Paused badge (replaces static "Autonomous")
  - Calendar Trigger card with keyword management (add/remove keywords)
  - Lead time selector (1h to 24h before meeting)
  - Timezone configuration
  - Agent Status toggle card
  - Manual Run section for one-off sprint reviews
  - Save Configuration button
- **Sprint Review API route** - Created `/api/agents/sprint-review`:
  - GET - Fetch user's sprint review config
  - POST - Create/update config with validation
  - DELETE - Remove config
- **Changed 8 agents from On-Demand to Autonomous** - Updated badge text on agent pages

### 2026-01-18 (UI Navigation Restructure)
- **Dashboard/History tab navigation** - Added consistent tab bar to both `/dashboard` and `/agents` pages:
  - Dashboard tab links to `/dashboard` (active on dashboard page)
  - History tab links to `/agents` (active on agents/history page)
  - Matches existing Settings tab navigation pattern
- **Metrics cards moved to Dashboard** - The 3 quick stats cards (Jobs Completed, Data Sources, Active Agents) now display on `/dashboard` instead of `/agents`:
  - Added `stats` state and API fetch from `/api/agents/stats`
  - Displays counts with loading state
- **Dashboard simplified** - Removed 4 quick action cards (Daily Brief, Meeting Prep, PRD Drafts, Prototypes)
- **Agents page renamed to History** - `/agents` now shows only History content:
  - Header changed from "Agents" to "History"
  - Subheading: "View your past completed jobs by all of your Agents"
  - Shows "Browse by Agent" grid and "Recent Activity" list
- **Sidebar navigation updated** - Renamed "Your Agents" to "History" in authenticated layout
- **Settings Notifications page** - Created `/settings/notifications`:
  - Moved Email Notifications section from Profile page
  - Added Slack and Microsoft Teams notification options (Coming Soon)
  - Added to settings tab navigation
- **Profile page cleanup**:
  - Removed Preferences/Email Notifications section (moved to Notifications page)
  - Removed "Role / Product Manager" display from Profile Information
- **History page button fix** - Changed "Back to Settings" to "Back to Overview" on `/agents/daily-brief/history`

### 2026-01-18 (Gmail Daily Brief Planning)
- **Daily Brief Gmail validation fix** - Updated trigger route to check if connectors are actually connected (not just configured)
  - Fixed logic: `hasSlackData` now requires `slackConnected` AND Slack config enabled
  - Added Gmail as valid primary source (alongside Slack)
  - Shows "Gmail-based Daily Briefs coming soon!" when Gmail is only source (orchestrator pending)
- **Updated 36h label** - Changed from "(weekend coverage)" to "(1.5 day overlap)" in Daily Brief setup
- **Added Loom to integrations** - Shows in /settings/integrations with OAuth support
- **Fixed homepage integrations** - Added Gmail, Google Drive, Google Calendar, Loom to visible integrations
- **Fixed "View All Integrations" link** - Now correctly navigates to /integrations
- **Created Gmail orchestrator plan** - Comprehensive implementation plan for GmailFetcher:
  - Plan file at `.claude/plans/greedy-noodling-mountain.md`
  - 6 implementation steps covering fetcher, config, orchestrator, trigger, prompts, citations
- **Updated AGENTS.md** - Added "End-to-End Connector Development" section:
  - 4-phase process: OAuth → MCP Server → Agent Integration → UI/Marketing
  - Checklist for complete connectors (12 items)
  - Example: Slack connector as reference
- **Added Phase 5 to Daily Brief** - Gmail Orchestrator Support section with 7 tracked items

### 2026-01-16 (Connectors Production Ready)
- **All connectors marked production-ready** - Updated marketing and settings pages:
  - **Available Now**: Slack, Jira, Confluence, Gong, Zendesk, Gmail, Google Drive, Google Calendar, Figma
  - **Coming Soon** (reduced): Amplitude, Linear only
- **Settings integrations page** - All 9 production connectors now show "Connect" button with OAuth support
- **Marketing pages updated**:
  - `/integrations` - Gmail, Drive, Calendar, Figma now "available" (not "coming-soon")
  - `/how-it-works` - Moved Google connectors and Figma to "Available Now" section
  - `/pricing` FAQ - Updated Individual plan description to list all 9 connectors
- **TODO.md connector setup** - Added comprehensive OAuth setup instructions for all connectors:
  - 6.1 Atlassian (Jira + Confluence) - Full dev/production setup with scope justifications
  - 6.3 Gong - OAuth app setup with API settings
  - 6.4 Zendesk - OAuth client creation with subdomain config
  - 6.5 Google Workspace (Gmail, Drive, Calendar) - Google Cloud project setup with API enablement
  - 6.6 Figma - OAuth app setup with scope requirements
  - 6.7 Environment variables summary for all connectors

### 2026-01-16 (Pricing, Billing & Google Connectors)
- **Pricing page overhaul** - Updated to 3-plan structure:
  - **Individual**: $79/mo highlighted as "Most Popular", or $69/mo billed annually ($828/year)
  - **Teams**: Contact Sales
  - **Enterprise**: Contact Sales
- **Billing config update** - Added INDIVIDUAL_PLAN and INTERNAL_PLAN to `packages/core/src/billing/index.ts`
  - Individual plan has unlimited on-demand jobs (-1)
  - Internal plan for admin users (ADMIN_EMAILS) with all features
- **Integrations section** - Added to `/how-it-works` page showing:
  - Available Now: Slack, Jira, Confluence, Gong, Zendesk
  - Coming Soon: Gmail, Google Drive, Google Calendar, Figma, Amplitude, Linear
  - AI-Powered Crawlers: Social, Web Search, News
- **Google connectors (mock)** - Full implementation for demo/workbench:
  - **Gmail MCP Server** (`packages/mcp-servers/src/gmail/`) - 7 tools: get_messages, get_message, get_threads, get_thread_messages, search_messages, get_customer_emails, propose_draft
  - **Google Drive MCP Server** (`packages/mcp-servers/src/google-drive/`) - 8 tools: get_files, get_file, get_folders, search_files, get_documents, get_spreadsheets, get_presentations, get_recent_activity
  - **Google Calendar MCP Server** (`packages/mcp-servers/src/google-calendar/`) - 8 tools: get_calendars, get_events, get_event, get_upcoming_events, get_today_events, get_customer_meetings, search_events, get_meeting_context
  - Mock data at `packages/mock-tenant/src/data/google.ts` with realistic PM-related content
- **Demo console updates** - Added Gmail, Google Drive, Google Calendar connectors
  - Updated Daily Brief sources to include Gmail and Calendar
  - Updated Meeting Prep sources to include Gmail, Calendar, and Drive
- **Integrations page** - Added Figma (Coming Soon), Google connectors (Coming Soon), and AI Crawlers section

### 2026-01-15 (GTM Strategy & Pricing Update)
- **GTM Strategy Session** - Defined go-to-market approach:
  - Individual Plan: $49/month (or $490/year = 2 months free)
  - Teams Plan: On request (contact sales, no self-serve)
  - No free tier - demo is free, but paid to connect real data
  - Target: Individual PMs first, then expand to teams
- **Fixed button styling** - White-on-white "View Pricing" buttons now properly styled across 7 marketing pages
- **Fixed CTA sections** - "Ready to get started?" sections now have purple backgrounds (not white)
- **Resource pages** - Now show all 10 workflow/job types (was only showing 7)
- **Footer links** - Added 3 missing compare pages (Aha, Linear, Notion AI)
- **Daily Brief audit logging** - Integrated AuditLogger for comprehensive audit trail and SIEM support

### 2026-01-15
- **SEO Content Pages Created** - Major content expansion for organic traffic:
  - **Integration landing pages**: Created `/integrations` index plus 5 integration pages (Jira, Slack, Gong, Confluence, Zendesk) with FAQPage schema, BreadcrumbList, and keyword-optimized metadata
  - **Template pages**: Created `/templates` index plus 2 template pages (PRD, Daily Brief) with HowTo schema and step-by-step guides
  - **How-to guides**: Created `/guides` index plus 3 guides (how-to-write-prd-ai, prioritize-features-ai, automate-release-notes) with HowTo schema and detailed step-by-step instructions
  - **Comparison pages**: Created 3 new comparison pages (Notion AI, Linear, Aha) and converted 3 existing battlecard pages (ChatPRD, Nalin, Jira Product Discovery) to SEO-optimized ComparisonPage format with FAQPage schema, feature tables, and structured sections
  - **Compare index**: Updated to show all 8 competitor comparisons
- Total: 16 new pages created, 4 pages converted to SEO format

### 2026-01-14
- **SEO/AEO/GEO Audit & Improvements** - Comprehensive search optimization:
  - Added BreadcrumbList schema to resource and blog pages
  - Added HowTo schema to workflow resource pages (for "how-to" search results)
  - Added SoftwareApplication schema to homepage (helps AI understand SaaS product)
  - Enhanced BlogPosting schema with speakable markup (voice search)
  - Identified 18+ missing landing pages for keyword gaps
  - Documented competitor keyword strategies (ProductBoard, Aha!, ChatPRD, Notion AI, Linear)
  - Created content gap analysis with priority keywords
  - Added long-tail keyword targets to TODO
- **Updated Slack connector setup** - Added detailed step-by-step instructions for:
  - Option A: Development/Testing app (quick setup for local testing)
  - Option B: Production app (Slack App Directory submission for one-click customer install)
  - Scope justifications for App Directory review
  - Environment variable reference
- **Daily Brief Agent MVP Complete** - Full implementation of autonomous agent:
  - Slack OAuth flow (`/api/connectors/slack/authorize` + `/callback`)
  - Token encryption with AES-256-GCM
  - Agent orchestrator with citation tracking
  - BullMQ scheduler for autonomous execution
  - Setup UI, history page, and detail page
- **Added Deployment Checklist** - Full 9-phase deployment tracking:
  - Phase 1-3 ✅ Complete: Infrastructure (DO PostgreSQL, Valkey, Spaces), LLM config, Google OAuth
  - Phase 4 🔲 Optional: Microsoft OAuth (Azure AD)
  - Phase 5 🔲 Required for paid: Stripe billing (webhook, products, pricing)
  - Phase 6 🔲 When ready: Connector OAuth (Atlassian, Slack, Gong, Zendesk, encryption key)
  - Phase 7 🔲 Optional: Analytics & SEO (Simple Analytics, GSC, Bing)
  - Phase 8-9 🔲 Next: Database migration (`npm run db:push`) and DO App Platform deployment

### 2026-01-13
- **Added pmkit-prompts MCP Server** - Standalone MCP server exposing all 13 PM workflows as tools for the Claude app
  - Created `packages/mcp-servers/src/pmkit-prompts/` with server implementation
  - All 13 workflows available: daily_brief, meeting_prep, voc_clustering, competitor_research, roadmap_alignment, prd_draft, sprint_review, prototype_generation, release_notes, deck_content, feature_ideation, one_pager, tldr
  - Comprehensive README.md with setup instructions, usage examples, and troubleshooting
  - QUICKSTART.md for 5-minute setup
  - Standalone server executable with environment configuration
  - Natural language invocation: "Create a Prototype based on this PRD draft"
- **Clarified beta workflows** - feature_ideation, one_pager, tldr are experimental (🧪 Beta) being tested via MCP server, NOT planned for Demo Console/Workbench
- **Added Autonomous Agent plan** - Comprehensive 4-phase plan for scheduled Daily Brief agent:
  - **Phase 1**: Real connector OAuth (Slack, Jira, Zendesk) - required before automation
  - **Phase 2**: Scheduled job infrastructure (ScheduledJob model, BullMQ repeat jobs, timezone support)
  - **Phase 3**: Autonomous execution (Agent orchestrator, data fetching, LLM generation, Slack DM delivery)
  - **Phase 4**: User configuration (channel selection, lookback window, skip weekends)
  - Added architecture diagram and data flow documentation
  - Added success metrics (99.5% schedule reliability, 95% generation success, 50%+ user engagement)
- **Comprehensive TODO.md review** - Added 50+ new feature items across categories:
  - Billing & subscription features (Stripe, seat management, usage billing)
  - Proposal execution workflow (approval, rejection, notifications)
  - User experience improvements (templates, favorites, shortcuts, dark mode)
  - Integration triggers (Slack bot, Teams bot, email, scheduled jobs, webhooks)
  - Documentation gaps (Slack/Teams/email claims, custom connectors, BYOLLM)
  - Future ideas (artifact versioning, workflow chaining, team collaboration, analytics)

### 2026-01-12
- Created TODO.md
- Completed: Infrastructure fix, AuditLog wiring, /status page, SIEM schema, telemetry schema, analysis types, guardrail events
- Added tracking for all "coming soon" claims from marketing pages
- Added SIEM export demo to Demo Console (Audit tab) and Workbench (Output tab)
- Created reusable `SIEMExportPreview` component with JSON/CEF format toggle, copy, and download
- Fixed horizontal overflow in Workbench Crawler Results (CSS min-w-0, max-w-full)
- Added localStorage persistence for Crawler Jobs (similar to PM Jobs history)
- Added TODO item for database persistence of Workbench data
- Added Deck Content workbench data to `MOCK-DATA.md` (was missing, now consistent with FINTECH and HEALTHTECH variations)
- **Added 4th AI Crawler: URL Scraper** - Fetch and analyze specific URLs for deep competitive research (pricing pages, feature pages, blog posts)
- Added File Upload Crawler idea to future considerations (5th AI Crawler for PDF/DOCX/PPTX analysis)
- Added Shareable Results feature plan (MVP: export as Markdown/copy, Phase 2: shareable links, Phase 3: advanced features)
- **Implemented MVP Sharing for Workbench** - Share dialog with export as Markdown/HTML, copy as formatted text for both PM Jobs and Crawler Results
- **Increased prototype_generation token limit** - Doubled from 24K to 48K tokens for complex HTML prototypes (FHIR dashboards, etc.)
- **Increased LLM timeout to 10 minutes** - Large requests like prototype generation (48K tokens) need more time to complete
- **Fixed workbench history viewing** - Can now view completed jobs from history while another job is running
- **Added model selector to workbench** - Switch between GPT-5 Nano (cheapest), GPT-5 Mini (default), and GPT-5.2 (high quality) for demos
- **Fixed missing Deck Content workflow** - Added `deck_content` to workbench job types (was missing from the list)

---

## 📚 Key Context for Future Reference

### The 10 Workflows (Production)

1. **Daily Brief** - Morning synthesis of overnight activity
2. **Meeting Prep** - Context pack before customer meetings
3. **VoC Clustering** - Theme extraction from customer feedback
4. **Competitor Research** - Track competitor product changes
5. **Roadmap Alignment** - Generate alignment memos with trade-offs
6. **PRD Draft** - Evidence-backed product requirements
7. **Sprint Review** - Sprint summary with completed work
8. **Release Notes** - Auto-generate from Jira tickets
9. **Deck Content** - Presentation content and talking points
10. **Prototype Generation** - PRD → interactive prototype

Plus 3 beta workflows in MCP server: Feature Ideation, One-Pager, TL;DR

### Key Differentiators

1. **Draft-Only Pattern** - Never writes directly to external systems
2. **Full Audit Trail** - Every action logged, SIEM-ready
3. **Citation Links** - Every insight traces back to source
4. **Autonomous Agents** - Run on schedule, not just on-demand

### Available Connectors

- **Core**: Slack, Jira, Confluence, Gong, Zendesk
- **Google Workspace**: Gmail, Google Drive, Google Calendar
- **Design**: Figma
- **Coming Soon**: Amplitude, Linear

### Revenue Model

- **Individual**: $29/month (launch price, was $49) or $19/month billed annually ($228/year)
- **Teams**: Contact sales (no self-serve, negotiated pricing)
- **Enterprise**: Custom (data residency, SSO, custom connectors)
- **Internal**: $0 (admin users via ADMIN_EMAILS)

### MVP Launch Status (as of 2026-01-20)

| Area | Status | Blocker |
|------|--------|---------|
| Infrastructure | ✅ Done | - |
| Authentication | ✅ Done | - |
| Slack Connector | ✅ Done | App Directory review pending |
| Google Connectors | 🔄 In Progress | Verification pending (1-4 weeks) |
| Gong Connector | 🔄 Partial | Dev account pending, fetcher needed |
| Zendesk Connector | 🔄 Partial | Fetcher needed |
| Stripe Payments | 🔲 Not Started | **BLOCKING REVENUE** |
| Email Delivery | 🔲 Not Started | **BLOCKING CORE UX** |
| Contact Form | 🔲 Not Started | Blocking lead capture |