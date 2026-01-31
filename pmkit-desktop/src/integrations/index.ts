/**
 * MVP Integrations for openpmkit-desktop
 *
 * These integrations connect openpmkit to external tools:
 * - Figma: Generate prototypes from PRDs
 * - Loom: Extract insights from video transcripts
 * - Coda: Access docs and tables
 * - Amplitude: Pull product analytics
 * - Discourse: Monitor community discussions
 * - Linear: Sync issues and projects
 * - Notion: Export PRDs and artifacts
 * - Zoom: Video meetings and recordings
 */

// Export all integrations
export * from './figma.js';
export * from './loom.js';
export * from './coda.js';
export * from './amplitude.js';
export * from './discourse.js';
export * from './linear.js';
export * from './notion.js';
export * from './zoom.js';
export * from './types.js';

// ============================================================================
// Integration Registry
// ============================================================================

import type { Integration, IntegrationStatus } from './types.js';

export const INTEGRATIONS: Record<string, Integration> = {
  figma: {
    id: 'figma',
    name: 'Figma',
    description: 'Generate prototypes directly in Figma from PRDs',
    category: 'design',
    status: 'coming_soon',
    authType: 'oauth2',
    requiredScopes: ['file_read', 'file_write'],
    docsUrl: 'https://www.figma.com/developers/api',
  },
  loom: {
    id: 'loom',
    name: 'Loom',
    description: 'Extract insights from video transcripts for PRDs and daily briefs',
    category: 'video',
    status: 'coming_soon',
    authType: 'oauth2',
    requiredScopes: ['read:recordings', 'read:transcripts'],
    docsUrl: 'https://dev.loom.com/',
  },
  coda: {
    id: 'coda',
    name: 'Coda',
    description: 'Access docs and tables for product documentation',
    category: 'documentation',
    status: 'coming_soon',
    authType: 'api_key',
    requiredScopes: ['read:docs', 'write:docs'],
    docsUrl: 'https://coda.io/developers/apis/v1',
  },
  amplitude: {
    id: 'amplitude',
    name: 'Amplitude',
    description: 'Pull product analytics for data-driven PRDs',
    category: 'analytics',
    status: 'coming_soon',
    authType: 'api_key',
    requiredScopes: ['read:charts', 'read:events'],
    docsUrl: 'https://www.docs.developers.amplitude.com/',
  },
  discourse: {
    id: 'discourse',
    name: 'Discourse',
    description: 'Monitor community discussions and feature requests',
    category: 'community',
    status: 'coming_soon',
    authType: 'api_key',
    requiredScopes: ['read:topics', 'read:posts'],
    docsUrl: 'https://docs.discourse.org/',
  },
  linear: {
    id: 'linear',
    name: 'Linear',
    description: 'Sync issues and projects from Linear',
    category: 'project_management',
    status: 'coming_soon',
    authType: 'oauth2',
    requiredScopes: ['read', 'write'],
    docsUrl: 'https://developers.linear.app/',
  },
  notion: {
    id: 'notion',
    name: 'Notion',
    description: 'Export PRDs and artifacts to Notion pages',
    category: 'documentation',
    status: 'coming_soon',
    authType: 'oauth2',
    requiredScopes: ['read_content', 'update_content', 'insert_content'],
    docsUrl: 'https://developers.notion.com/',
  },
  zoom: {
    id: 'zoom',
    name: 'Zoom',
    description: 'Video meetings and recordings',
    category: 'video',
    status: 'coming_soon',
    authType: 'oauth2',
    requiredScopes: ['recording:read', 'meeting:read'],
    docsUrl: 'https://developers.zoom.us/docs/',
  },
};

/**
 * Get all integrations
 */
export function getIntegrations(): Integration[] {
  return Object.values(INTEGRATIONS);
}

/**
 * Get integrations by category
 */
export function getIntegrationsByCategory(category: string): Integration[] {
  return Object.values(INTEGRATIONS).filter((i) => i.category === category);
}

/**
 * Get integration status
 */
export function getIntegrationStatus(integrationId: string): IntegrationStatus {
  const integration = INTEGRATIONS[integrationId];
  if (!integration) {
    return 'not_found';
  }
  return integration.status;
}
