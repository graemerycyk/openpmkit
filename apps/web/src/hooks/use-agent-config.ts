'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ConnectorConfigs,
  DEFAULT_CONNECTOR_CONFIGS,
  SlackChannel,
} from '@/components/agents/data-sources-card';

// Connector key type
export type ConnectorKey = 'slack' | 'jira' | 'confluence' | 'gong' | 'zendesk' | 'google-calendar' | 'google-drive' | 'gmail' | 'figma';

// Source status type used throughout agent pages
export interface SourceStatus {
  key: ConnectorKey;
  connected: boolean;
  enabled: boolean;
}

// Generic agent config structure
export interface AgentConfigBase {
  id: string;
  status: 'active' | 'paused';
  nextRunAt: string | null;
  lastRunAt: string | null;
}

// Hook options
export interface UseAgentConfigOptions<TConfig> {
  /** Agent API endpoint (e.g., '/api/agents/daily-brief') */
  apiEndpoint: string;
  /** Which connectors this agent suggests/uses */
  suggestedConnectors: ConnectorKey[];
  /** Which connectors are required (agent can't be enabled without them) */
  requiredConnectors?: ConnectorKey[];
  /** Default config values specific to this agent */
  defaultConfig?: Partial<TConfig>;
  /** Transform saved config to form state */
  parseConfig?: (savedConfig: TConfig) => Partial<TConfig>;
  /** Transform form state to API payload */
  buildPayload?: (formConfig: TConfig, enabledSources: Record<ConnectorKey, boolean>, connectorConfigs: ConnectorConfigs) => object;
}

export interface UseAgentConfigReturn<TConfig> {
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  isTriggering: boolean;

  // Error/success messages
  error: string | null;
  success: string | null;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;

  // Agent config
  config: (AgentConfigBase & { config: TConfig }) | null;
  isActive: boolean;
  setIsActive: (active: boolean) => void;

  // Data sources
  suggestedSources: SourceStatus[];
  allConnectedSources: SourceStatus[];
  connectorConfigs: ConnectorConfigs;
  handleSourceToggle: (key: ConnectorKey, enabled: boolean) => void;
  handleConfigChange: (key: ConnectorKey, config: ConnectorConfigs[keyof ConnectorConfigs]) => void;

  // Can run checks
  canRun: boolean;
  canSave: boolean;
  missingRequiredConnectors: ConnectorKey[];

  // Admin check
  isAdmin: boolean;

  // Actions
  handleSave: (additionalPayload?: object) => Promise<boolean>;
  handleTrigger: (triggerPayload?: object) => Promise<boolean>;

  // Refresh data
  refetch: () => Promise<void>;
}

export function useAgentConfig<TConfig extends Record<string, unknown>>({
  apiEndpoint,
  suggestedConnectors,
  requiredConnectors = [],
  defaultConfig = {},
  parseConfig,
  buildPayload,
}: UseAgentConfigOptions<TConfig>): UseAgentConfigReturn<TConfig> {
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);

  // Messages
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Config
  const [config, setConfig] = useState<(AgentConfigBase & { config: TConfig }) | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Data sources
  const [suggestedSources, setSuggestedSources] = useState<SourceStatus[]>(
    suggestedConnectors.map((key) => ({ key, connected: false, enabled: false }))
  );
  const [allConnectedSources, setAllConnectedSources] = useState<SourceStatus[]>([]);
  const [connectorConfigs, setConnectorConfigs] = useState<ConnectorConfigs>(() => {
    const configs: ConnectorConfigs = {};
    suggestedConnectors.forEach((key) => {
      const defaultConfig = DEFAULT_CONNECTOR_CONFIGS[key as keyof typeof DEFAULT_CONNECTOR_CONFIGS];
      if (defaultConfig) {
        (configs as Record<string, unknown>)[key] = { ...defaultConfig };
      }
    });
    return configs;
  });

  // Check which required connectors are missing
  const missingRequiredConnectors = requiredConnectors.filter((key) => {
    const source = suggestedSources.find((s) => s.key === key);
    return !source?.connected || !source?.enabled;
  });

  // Can run: all required connectors are connected AND enabled
  const canRun = missingRequiredConnectors.length === 0;

  // Can save: always true (user should always be able to save settings)
  const canSave = true;

  // Check if user is admin
  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch('/api/workbench/run-job');
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.isAdmin === true);
        }
      } catch {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, []);

  // Fetch data function
  const fetchData = useCallback(async () => {
    let savedConfig: TConfig | null = null;

    try {
      // Fetch agent config
      const configRes = await fetch(apiEndpoint);
      if (configRes.ok) {
        const data = await configRes.json();
        if (data.config) {
          setConfig(data.config);
          savedConfig = data.config.config;
          setIsActive(data.config.status === 'active');

          // Restore connector configs from saved data
          if (data.config.config.connectorConfigs) {
            setConnectorConfigs((prev) => ({
              ...prev,
              ...data.config.config.connectorConfigs,
              slack: {
                ...prev.slack,
                ...(data.config.config.connectorConfigs?.slack || {}),
              },
            }));
          }
        }
      }

      // Fetch connectors status
      const connectorsRes = await fetch('/api/connectors');
      if (connectorsRes.ok) {
        const data = await connectorsRes.json();
        const connectors = data.connectors || [];

        // Update suggested sources with connection status
        setSuggestedSources((prev) =>
          prev.map((source) => {
            const isConnected = connectors.some(
              (c: { connectorKey: string; status: string }) =>
                c.connectorKey === source.key && c.status === 'real'
            );

            // Determine enabled state from saved config or default to false
            let isEnabled = false;
            if (savedConfig) {
              // Check common patterns for enabled state in saved configs
              const enabledSources = (savedConfig as Record<string, unknown>).enabledSources as Record<string, boolean> | undefined;
              if (enabledSources?.[source.key] !== undefined) {
                isEnabled = enabledSources[source.key];
              } else {
                // Check individual include flags (e.g., includeSlack, includeGmail)
                const includeKey = `include${source.key.charAt(0).toUpperCase()}${source.key.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase())}`;
                if ((savedConfig as Record<string, unknown>)[includeKey] !== undefined) {
                  isEnabled = (savedConfig as Record<string, unknown>)[includeKey] as boolean;
                }
              }
            }

            return {
              ...source,
              connected: isConnected,
              enabled: isEnabled,
            };
          })
        );

        // Build list of all connected sources
        const allConnected = connectors
          .filter((c: { status: string }) => c.status === 'real')
          .map((c: { connectorKey: string }) => ({
            key: c.connectorKey as ConnectorKey,
            connected: true,
            enabled: false,
          }));
        setAllConnectedSources(allConnected);

        // Fetch Slack channels if Slack is connected
        const slackIsConnected = connectors.some(
          (c: { connectorKey: string; status: string }) =>
            c.connectorKey === 'slack' && c.status === 'real'
        );
        if (slackIsConnected) {
          try {
            const channelsRes = await fetch('/api/connectors/slack/channels');
            if (channelsRes.ok) {
              const channelsData = await channelsRes.json();
              const fetchedChannels: SlackChannel[] = channelsData.channels || [];
              setConnectorConfigs((prev) => ({
                ...prev,
                slack: {
                  ...prev.slack!,
                  channels: fetchedChannels,
                  selectedChannels: prev.slack?.selectedChannels || [],
                },
              }));
            }
          } catch (err) {
            console.error('Failed to fetch Slack channels:', err);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [apiEndpoint]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle toggling a source on/off
  const handleSourceToggle = useCallback((key: ConnectorKey, enabled: boolean) => {
    setSuggestedSources((prev) =>
      prev.map((source) =>
        source.key === key ? { ...source, enabled } : source
      )
    );
    setAllConnectedSources((prev) =>
      prev.map((source) =>
        source.key === key ? { ...source, enabled } : source
      )
    );
  }, []);

  // Handle connector config changes
  const handleConfigChange = useCallback((key: ConnectorKey, newConfig: ConnectorConfigs[keyof ConnectorConfigs]) => {
    setConnectorConfigs((prev) => ({
      ...prev,
      [key]: newConfig,
    }));
  }, []);

  // Build enabled sources map
  const getEnabledSources = useCallback((): Record<ConnectorKey, boolean> => {
    const enabled: Record<string, boolean> = {};
    suggestedSources.forEach((source) => {
      enabled[source.key] = source.enabled;
    });
    allConnectedSources.forEach((source) => {
      if (enabled[source.key] === undefined) {
        enabled[source.key] = source.enabled;
      }
    });
    return enabled as Record<ConnectorKey, boolean>;
  }, [suggestedSources, allConnectedSources]);

  // Save handler
  const handleSave = useCallback(async (additionalPayload?: object): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const enabledSources = getEnabledSources();

    // Build connector configs for only enabled sources
    const enabledConnectorConfigs: ConnectorConfigs = {};
    Object.entries(enabledSources).forEach(([key, isEnabled]) => {
      if (isEnabled && connectorConfigs[key as keyof ConnectorConfigs]) {
        (enabledConnectorConfigs as Record<string, unknown>)[key] = connectorConfigs[key as keyof ConnectorConfigs];
      }
    });

    try {
      const payload = buildPayload
        ? buildPayload(config?.config || ({} as TConfig), enabledSources, enabledConnectorConfigs)
        : {
            status: isActive ? 'active' : 'paused',
            config: {
              ...additionalPayload,
              enabledSources,
              connectorConfigs: enabledConnectorConfigs,
            },
          };

      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setSuccess('Agent settings saved successfully!');
        return true;
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save configuration');
        return false;
      }
    } catch {
      setError('Failed to save. Please try again.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [apiEndpoint, buildPayload, config?.config, connectorConfigs, getEnabledSources, isActive]);

  // Trigger handler
  const handleTrigger = useCallback(async (triggerPayload?: object): Promise<boolean> => {
    if (!canRun) return false;

    setIsTriggering(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${apiEndpoint}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(triggerPayload || {}),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(`Agent started! Job ID: ${data.jobId}`);
        return true;
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to trigger agent');
        return false;
      }
    } catch {
      setError('Failed to trigger. Please try again.');
      return false;
    } finally {
      setIsTriggering(false);
    }
  }, [apiEndpoint, canRun]);

  return {
    isLoading,
    isSaving,
    isTriggering,
    error,
    success,
    setError,
    setSuccess,
    config,
    isActive,
    setIsActive,
    suggestedSources,
    allConnectedSources,
    connectorConfigs,
    handleSourceToggle,
    handleConfigChange,
    canRun,
    canSave,
    missingRequiredConnectors,
    isAdmin,
    handleSave,
    handleTrigger,
    refetch: fetchData,
  };
}
