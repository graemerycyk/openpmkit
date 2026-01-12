import { z } from 'zod';

// ============================================================================
// LLM Configuration
// ============================================================================

// OpenAI GPT-5 series models (Jan 2026)
// See: https://platform.openai.com/docs/models
export const LLMModelSchema = z.enum([
  'gpt-5.2',       // Flagship model for complex reasoning and agentic tasks
  'gpt-5-mini',    // Cost-efficient for well-defined tasks
  'gpt-5-nano',    // Most cost-efficient for high-throughput tasks
  'stub',          // For development without API
]);
export type LLMModel = z.infer<typeof LLMModelSchema>;

export const LLMProviderSchema = z.enum(['openai', 'stub']);
export type LLMProvider = z.infer<typeof LLMProviderSchema>;

export interface LLMConfig {
  provider: LLMProvider;
  model: LLMModel;
  apiKey?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMCompletionRequest {
  messages: LLMMessage[];
  model?: LLMModel;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMCompletionResponse {
  content: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  finishReason: 'stop' | 'length' | 'error';
  latencyMs: number;
}

// ============================================================================
// Model Configuration
// ============================================================================

export interface ModelInfo {
  id: LLMModel;
  name: string;
  provider: LLMProvider;
  contextWindow: number;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  description: string;
}

// OpenAI GPT-5 series pricing (Jan 2026)
// See: https://platform.openai.com/docs/models
export const MODEL_INFO: Record<LLMModel, ModelInfo> = {
  'gpt-5.2': {
    id: 'gpt-5.2',
    name: 'GPT-5.2',
    provider: 'openai',
    contextWindow: 400_000,
    inputPricePerMillion: 1.75,
    outputPricePerMillion: 14.00,
    description: 'Flagship model for complex reasoning and agentic tasks',
  },
  'gpt-5-mini': {
    id: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    provider: 'openai',
    contextWindow: 128_000,
    inputPricePerMillion: 0.25,
    outputPricePerMillion: 2.00,
    description: 'Cost-efficient for well-defined tasks',
  },
  'gpt-5-nano': {
    id: 'gpt-5-nano',
    name: 'GPT-5 Nano',
    provider: 'openai',
    contextWindow: 64_000,
    inputPricePerMillion: 0.10,
    outputPricePerMillion: 0.40,
    description: 'Most cost-efficient for high-throughput tasks',
  },
  'stub': {
    id: 'stub',
    name: 'Stub (No LLM)',
    provider: 'stub',
    contextWindow: 0,
    inputPricePerMillion: 0,
    outputPricePerMillion: 0,
    description: 'Returns pre-generated responses for development',
  },
};

export function getModelInfo(model: LLMModel): ModelInfo {
  return MODEL_INFO[model];
}

export function estimateCost(
  model: LLMModel,
  inputTokens: number,
  outputTokens: number
): number {
  const info = MODEL_INFO[model];
  const inputCost = (inputTokens / 1_000_000) * info.inputPricePerMillion;
  const outputCost = (outputTokens / 1_000_000) * info.outputPricePerMillion;
  return inputCost + outputCost;
}

// ============================================================================
// LLM Client Interface
// ============================================================================

export interface LLMClient {
  complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse>;
  getModel(): LLMModel;
  getProvider(): LLMProvider;
}

// ============================================================================
// OpenAI Client
// ============================================================================

export class OpenAIClient implements LLMClient {
  private config: LLMConfig;

  constructor(config: Partial<LLMConfig> & { apiKey: string }) {
    this.config = {
      provider: 'openai',
      model: (config.model as LLMModel) || 'gpt-5.2',
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || 'https://api.openai.com/v1',
      maxTokens: config.maxTokens || 4096,
      temperature: config.temperature ?? 0.7,
    };

    if (!this.config.apiKey) {
      throw new Error('OpenAI API key is required.');
    }
  }

  async complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    const model = request.model || this.config.model;
    const startTime = Date.now();

    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: request.messages,
        max_completion_tokens: request.maxTokens || this.config.maxTokens,
        // Note: GPT-5 models only support temperature=1, so we omit it
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const latencyMs = Date.now() - startTime;

    const messageContent = data.choices[0]?.message?.content || '';
    const finishReason = data.choices[0]?.finish_reason;

    // Log errors only - content filtering or truncation issues
    if (data.choices[0]?.message?.refusal) {
      console.error('[LLM] Content refused:', data.choices[0].message.refusal);
    }
    if (finishReason === 'length' && !messageContent) {
      console.error('[LLM] Response truncated with no content - increase max_tokens');
    }

    return {
      content: messageContent,
      model: data.model,
      usage: {
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      finishReason: finishReason === 'stop' ? 'stop' : 'length',
      latencyMs,
    };
  }

  getModel(): LLMModel {
    return this.config.model;
  }

  getProvider(): LLMProvider {
    return 'openai';
  }
}

// ============================================================================
// Stub Client (for development/testing)
// ============================================================================

export class StubLLMClient implements LLMClient {
  private stubGenerator?: (messages: LLMMessage[]) => string;

  constructor(stubGenerator?: (messages: LLMMessage[]) => string) {
    this.stubGenerator = stubGenerator;
  }

  async complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    // Simulate some latency
    await new Promise((resolve) => setTimeout(resolve, 100));

    const content = this.stubGenerator
      ? this.stubGenerator(request.messages)
      : 'This is a stub response. Set USE_STUB_LLM=false to use real LLM.';

    return {
      content,
      model: 'stub',
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
      },
      finishReason: 'stop',
      latencyMs: 100,
    };
  }

  getModel(): LLMModel {
    return 'stub';
  }

  getProvider(): LLMProvider {
    return 'stub';
  }
}

// ============================================================================
// Rate Limiter for Demo
// ============================================================================

export interface RateLimitConfig {
  maxCallsPerHour: number;
  maxCallsPerDay: number;
}

export interface RateLimitStore {
  get(key: string): Promise<number>;
  increment(key: string, ttlSeconds: number): Promise<number>;
}

export class InMemoryRateLimitStore implements RateLimitStore {
  private store: Map<string, { count: number; expiresAt: number }> = new Map();

  async get(key: string): Promise<number> {
    const entry = this.store.get(key);
    if (!entry || entry.expiresAt < Date.now()) {
      return 0;
    }
    return entry.count;
  }

  async increment(key: string, ttlSeconds: number): Promise<number> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || entry.expiresAt < now) {
      this.store.set(key, { count: 1, expiresAt: now + ttlSeconds * 1000 });
      return 1;
    }

    entry.count++;
    return entry.count;
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt < now) {
        this.store.delete(key);
      }
    }
  }
}

export class DemoRateLimiter {
  private store: RateLimitStore;
  private config: RateLimitConfig;

  constructor(store: RateLimitStore, config: RateLimitConfig) {
    this.store = store;
    this.config = config;
  }

  async checkLimit(): Promise<{ allowed: boolean; reason?: string }> {
    const hourKey = `demo:llm:hour:${Math.floor(Date.now() / 3600000)}`;
    const dayKey = `demo:llm:day:${new Date().toISOString().split('T')[0]}`;

    const hourlyCount = await this.store.get(hourKey);
    const dailyCount = await this.store.get(dayKey);

    if (hourlyCount >= this.config.maxCallsPerHour) {
      return {
        allowed: false,
        reason: `Hourly limit reached (${this.config.maxCallsPerHour}/hour). Try again later.`,
      };
    }

    if (dailyCount >= this.config.maxCallsPerDay) {
      return {
        allowed: false,
        reason: `Daily limit reached (${this.config.maxCallsPerDay}/day). Try again tomorrow.`,
      };
    }

    return { allowed: true };
  }

  async recordCall(): Promise<void> {
    const hourKey = `demo:llm:hour:${Math.floor(Date.now() / 3600000)}`;
    const dayKey = `demo:llm:day:${new Date().toISOString().split('T')[0]}`;

    await this.store.increment(hourKey, 3600); // 1 hour TTL
    await this.store.increment(dayKey, 86400); // 24 hour TTL
  }

  async getRemainingCalls(): Promise<{ hourly: number; daily: number }> {
    const hourKey = `demo:llm:hour:${Math.floor(Date.now() / 3600000)}`;
    const dayKey = `demo:llm:day:${new Date().toISOString().split('T')[0]}`;

    const hourlyCount = await this.store.get(hourKey);
    const dailyCount = await this.store.get(dayKey);

    return {
      hourly: Math.max(0, this.config.maxCallsPerHour - hourlyCount),
      daily: Math.max(0, this.config.maxCallsPerDay - dailyCount),
    };
  }
}

// ============================================================================
// LLM Service (main entry point)
// ============================================================================

export interface LLMServiceConfig {
  defaultModel: LLMModel;
  demoModel: LLMModel;
  useStubs: boolean;
  demoRateLimit: RateLimitConfig;
}

export class LLMService {
  private productionClient: LLMClient;
  private demoClient: LLMClient;
  private stubClient: StubLLMClient;
  private demoRateLimiter: DemoRateLimiter;
  private config: LLMServiceConfig;

  constructor(
    config: Partial<LLMServiceConfig> = {},
    rateLimitStore?: RateLimitStore,
    stubGenerator?: (messages: LLMMessage[]) => string
  ) {
    this.config = {
      defaultModel: (config.defaultModel as LLMModel) || 'gpt-5.2',
      demoModel: (config.demoModel as LLMModel) || 'gpt-5-mini',
      useStubs: config.useStubs ?? process.env.USE_STUB_LLM === 'true',
      demoRateLimit: config.demoRateLimit || {
        maxCallsPerHour: parseInt(process.env.DEMO_LLM_CALLS_PER_HOUR || '10', 10),
        maxCallsPerDay: parseInt(process.env.DEMO_LLM_CALLS_PER_DAY || '50', 10),
      },
    };

    // Initialize clients
    this.stubClient = new StubLLMClient(stubGenerator);

    if (this.config.useStubs) {
      this.productionClient = this.stubClient;
      this.demoClient = this.stubClient;
    } else {
      // Use separate API keys for demo and production, with fallback to single key
      const fallbackApiKey = process.env.OPENAI_API_KEY;
      const demoApiKey = process.env.OPENAI_API_KEY_DEMO || fallbackApiKey;
      const prodApiKey = process.env.OPENAI_API_KEY_PROD || fallbackApiKey;

      // Initialize demo client
      if (demoApiKey) {
        this.demoClient = new OpenAIClient({ 
          apiKey: demoApiKey, 
          model: this.config.demoModel 
        });
      } else {
        console.warn('No OpenAI API key set for demo (OPENAI_API_KEY_DEMO or OPENAI_API_KEY), demo will use stub LLM');
        this.demoClient = this.stubClient;
      }

      // Initialize production client
      if (prodApiKey) {
        this.productionClient = new OpenAIClient({ 
          apiKey: prodApiKey, 
          model: this.config.defaultModel 
        });
      } else {
        console.warn('No OpenAI API key set for production (OPENAI_API_KEY_PROD or OPENAI_API_KEY), production will use stub LLM');
        this.productionClient = this.stubClient;
      }
    }

    // Initialize rate limiter
    this.demoRateLimiter = new DemoRateLimiter(
      rateLimitStore || new InMemoryRateLimitStore(),
      this.config.demoRateLimit
    );
  }

  /**
   * Get the appropriate client for a tenant
   */
  getClientForTenant(tenantId: string): LLMClient {
    if (this.config.useStubs) {
      return this.stubClient;
    }

    if (tenantId === 'demo') {
      return this.demoClient;
    }

    return this.productionClient;
  }

  /**
   * Complete a request for a specific tenant
   */
  async complete(
    tenantId: string,
    request: LLMCompletionRequest
  ): Promise<LLMCompletionResponse> {
    // Check rate limit for demo tenant
    if (tenantId === 'demo' && !this.config.useStubs) {
      const limitCheck = await this.demoRateLimiter.checkLimit();
      if (!limitCheck.allowed) {
        throw new DemoRateLimitError(limitCheck.reason || 'Rate limit exceeded');
      }
    }

    const client = this.getClientForTenant(tenantId);
    const response = await client.complete(request);

    // Record the call for demo tenant
    if (tenantId === 'demo' && !this.config.useStubs) {
      await this.demoRateLimiter.recordCall();
    }

    return response;
  }

  /**
   * Get model info for a tenant
   */
  getModelForTenant(tenantId: string): ModelInfo {
    if (this.config.useStubs) {
      return MODEL_INFO['stub'];
    }

    if (tenantId === 'demo') {
      return MODEL_INFO[this.config.demoModel];
    }

    return MODEL_INFO[this.config.defaultModel];
  }

  /**
   * Get remaining rate limit for demo
   */
  async getDemoRateLimitStatus(): Promise<{ hourly: number; daily: number }> {
    return this.demoRateLimiter.getRemainingCalls();
  }

  /**
   * Check if using stubs
   */
  isUsingStubs(): boolean {
    return this.config.useStubs;
  }
}

// ============================================================================
// Errors
// ============================================================================

export class DemoRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DemoRateLimitError';
  }
}

export class LLMError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

// ============================================================================
// Default instance
// ============================================================================

let defaultLLMService: LLMService | null = null;

export function getLLMService(): LLMService {
  if (!defaultLLMService) {
    defaultLLMService = new LLMService();
  }
  return defaultLLMService;
}

export function initLLMService(
  config?: Partial<LLMServiceConfig>,
  rateLimitStore?: RateLimitStore,
  stubGenerator?: (messages: LLMMessage[]) => string
): LLMService {
  defaultLLMService = new LLMService(config, rateLimitStore, stubGenerator);
  return defaultLLMService;
}
