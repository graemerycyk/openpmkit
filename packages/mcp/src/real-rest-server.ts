import { z } from 'zod';
import { nanoid } from 'nanoid';
import {
  BaseMCPServer,
  MCPServerConfig,
  MCPContext,
  MCPToolResult,
  MCPTool,
} from './index';

// ============================================================================
// OAuth Token Types for REST API Wrappers
// ============================================================================

export interface RestOAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  expiresIn?: number;
  tokenType?: string;
  scope?: string;
}

export type TokenRefreshCallback = (tokens: RestOAuthTokens) => Promise<void>;

// ============================================================================
// Token Refresh Configuration
// ============================================================================

export interface TokenRefreshConfig {
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
}

// ============================================================================
// Real REST MCP Server Base Class
// ============================================================================

/**
 * Base class for MCP servers that wrap REST APIs.
 * Provides authenticated API requests with automatic token refresh.
 *
 * Use this for connectors that don't have vendor MCP servers
 * (Gmail, Google Drive, Google Calendar, Figma, Gong, Zendesk).
 */
export abstract class RealRestMCPServer extends BaseMCPServer {
  protected tokens: RestOAuthTokens;
  protected onTokenRefresh?: TokenRefreshCallback;
  protected tokenRefreshConfig?: TokenRefreshConfig;
  protected timeout: number;

  constructor(
    config: MCPServerConfig,
    tokens: RestOAuthTokens,
    options?: {
      onTokenRefresh?: TokenRefreshCallback;
      tokenRefreshConfig?: TokenRefreshConfig;
      timeout?: number;
    }
  ) {
    super(config);
    this.tokens = tokens;
    this.onTokenRefresh = options?.onTokenRefresh;
    this.tokenRefreshConfig = options?.tokenRefreshConfig;
    this.timeout = options?.timeout ?? 30000;
  }

  /**
   * Make an authenticated API request with automatic token refresh.
   */
  protected async apiRequest<T = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    options?: {
      body?: unknown;
      headers?: Record<string, string>;
      skipAuth?: boolean;
    }
  ): Promise<T> {
    // Check if token needs refresh
    await this.ensureValidToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    if (!options?.skipAuth) {
      headers['Authorization'] = `${this.tokens.tokenType || 'Bearer'} ${this.tokens.accessToken}`;
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(this.timeout),
    };

    if (options?.body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, fetchOptions);

    // Handle 401 - attempt token refresh and retry
    if (response.status === 401 && !options?.skipAuth) {
      await this.refreshAccessToken();
      return this.apiRequest(method, url, { ...options, skipAuth: false });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  /**
   * Make a GET request
   */
  protected async get<T = unknown>(
    url: string,
    options?: { headers?: Record<string, string> }
  ): Promise<T> {
    return this.apiRequest<T>('GET', url, options);
  }

  /**
   * Make a POST request
   */
  protected async post<T = unknown>(
    url: string,
    body?: unknown,
    options?: { headers?: Record<string, string> }
  ): Promise<T> {
    return this.apiRequest<T>('POST', url, { body, ...options });
  }

  /**
   * Make a PUT request
   */
  protected async put<T = unknown>(
    url: string,
    body?: unknown,
    options?: { headers?: Record<string, string> }
  ): Promise<T> {
    return this.apiRequest<T>('PUT', url, { body, ...options });
  }

  /**
   * Make a PATCH request
   */
  protected async patch<T = unknown>(
    url: string,
    body?: unknown,
    options?: { headers?: Record<string, string> }
  ): Promise<T> {
    return this.apiRequest<T>('PATCH', url, { body, ...options });
  }

  /**
   * Make a DELETE request
   */
  protected async delete<T = unknown>(
    url: string,
    options?: { headers?: Record<string, string> }
  ): Promise<T> {
    return this.apiRequest<T>('DELETE', url, options);
  }

  /**
   * Check if token is expired or about to expire
   */
  private isTokenExpired(): boolean {
    if (!this.tokens.expiresAt) {
      return false; // No expiry info, assume valid
    }

    // Consider expired if within 5 minutes of expiry
    const expiryBuffer = 5 * 60 * 1000;
    return new Date(this.tokens.expiresAt).getTime() <= Date.now() + expiryBuffer;
  }

  /**
   * Ensure token is valid, refreshing if necessary
   */
  private async ensureValidToken(): Promise<void> {
    if (this.isTokenExpired()) {
      await this.refreshAccessToken();
    }
  }

  /**
   * Refresh the access token using the refresh token.
   * Override this method to customize token refresh for specific providers.
   */
  protected async refreshAccessToken(): Promise<void> {
    if (!this.tokens.refreshToken) {
      throw new Error('No refresh token available');
    }

    if (!this.tokenRefreshConfig) {
      throw new Error('Token refresh configuration not provided');
    }

    const { tokenUrl, clientId, clientSecret } = this.tokenRefreshConfig;

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.tokens.refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token refresh failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Update tokens
    this.tokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? this.tokens.refreshToken,
      expiresAt: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : undefined,
      expiresIn: data.expires_in,
      tokenType: data.token_type ?? 'Bearer',
      scope: data.scope ?? this.tokens.scope,
    };

    // Notify callback about token refresh
    if (this.onTokenRefresh) {
      await this.onTokenRefresh(this.tokens);
    }
  }

  /**
   * Get current tokens (for debugging/testing)
   */
  getTokens(): RestOAuthTokens {
    return { ...this.tokens };
  }

  /**
   * Update tokens (e.g., after external refresh)
   */
  updateTokens(tokens: RestOAuthTokens): void {
    this.tokens = tokens;
  }
}

// ============================================================================
// Google REST API Base
// ============================================================================

/**
 * Base class for Google API wrappers (Gmail, Drive, Calendar).
 * Configures Google-specific token refresh.
 */
export abstract class GoogleRestMCPServer extends RealRestMCPServer {
  constructor(
    config: MCPServerConfig,
    tokens: RestOAuthTokens,
    options?: {
      onTokenRefresh?: TokenRefreshCallback;
      timeout?: number;
    }
  ) {
    const clientId = process.env.GOOGLE_CLIENT_ID ?? '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? '';

    super(config, tokens, {
      ...options,
      tokenRefreshConfig: {
        tokenUrl: 'https://oauth2.googleapis.com/token',
        clientId,
        clientSecret,
      },
    });
  }
}

// ============================================================================
// Helper: Build Query String
// ============================================================================

export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const filtered = Object.entries(params).filter(([, v]) => v !== undefined);
  if (filtered.length === 0) return '';
  return '?' + new URLSearchParams(
    filtered.map(([k, v]) => [k, String(v)])
  ).toString();
}
