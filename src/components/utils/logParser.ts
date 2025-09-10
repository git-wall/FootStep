// Log parsing utility for extracting structured data from log messages
// Supports both pattern-based parsing and AI-powered parsing for complex logs

export interface AIParsingConfig {
  useAI: boolean;
  provider: 'ollama' | 'huggingface' | 'openai-free' | 'groq';
  model?: string;
  apiKey?: string;
  endpoint?: string;
}

export interface LogEntry {
  timestamp?: string;
  level?: string;
  service?: string;
  traceId?: string;
  spanId?: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  message?: string;
  error?: string;
  ip?: string;
  userAgent?: string;
}

export interface ParsedLogData {
  services: Array<{
    name: string;
    technology?: string;
    endpoints?: string[];
    errors?: string[];
    traces?: string[];
  }>;
  connections: Array<{
    from: string;
    to: string;
    type?: string;
  }>;
  metadata: {
    totalLogs: number;
    timeRange?: {
      start: string;
      end: string;
    };
    logLevels: string[];
  };
}

export class LogParser {
  private aiConfig: AIParsingConfig = {
    useAI: false,
    provider: 'huggingface'
  };

  constructor(aiConfig?: Partial<AIParsingConfig>) {
    if (aiConfig) {
      this.aiConfig = { ...this.aiConfig, ...aiConfig };
    }
  }

  private servicePatterns = [
    // Common service name patterns
    /service[:\s]*([a-zA-Z0-9\-_]+)/i,
    /svc[:\s]*([a-zA-Z0-9\-_]+)/i,
    /"service"[:\s]*"([^"]+)"/i,
    /\[([a-zA-Z0-9\-_]+)\]/,
    // Kubernetes/Docker patterns
    /pod\/([a-zA-Z0-9\-_]+)/i,
    /container[:\s]*([a-zA-Z0-9\-_]+)/i,
  ];

  private tracePatterns = [
    /trace[_\-]?id[:\s]*([a-fA-F0-9\-]+)/i,
    /traceid[:\s]*([a-fA-F0-9\-]+)/i,
    /"traceId"[:\s]*"([^"]+)"/i,
    /x-trace-id[:\s]*([a-fA-F0-9\-]+)/i,
  ];

  private endpointPatterns = [
    /(GET|POST|PUT|DELETE|PATCH)\s+([\/\w\-_\.:]+)/i,
    /endpoint[:\s]*([\/\w\-_\.:]+)/i,
    /path[:\s]*([\/\w\-_\.:]+)/i,
    /"path"[:\s]*"([^"]+)"/i,
  ];

  private errorPatterns = [
    /error[:\s]*(.+?)(?:\n|$)/i,
    /exception[:\s]*(.+?)(?:\n|$)/i,
    /failed[:\s]*(.+?)(?:\n|$)/i,
    /"error"[:\s]*"([^"]+)"/i,
  ];

  private levelPatterns = [
    /level[:\s]*(DEBUG|INFO|WARN|ERROR|FATAL)/i,
    /(DEBUG|INFO|WARN|ERROR|FATAL)/i,
    /"level"[:\s]*"(DEBUG|INFO|WARN|ERROR|FATAL)"/i,
  ];

  private timestampPatterns = [
    /\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}/,
    /\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}/,
    /"timestamp"[:\s]*"([^"]+)"/i,
  ];

  private ipPatterns = [
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/,
    /ip[:\s]*([0-9\.]+)/i,
    /"ip"[:\s]*"([^"]+)"/i,
  ];

  async parseLogText(logText: string): Promise<ParsedLogData> {
    // First try pattern-based parsing
    const patternResult = this.parseWithPatterns(logText);

    // If pattern parsing found few services and AI is enabled, try AI parsing
    if (this.aiConfig.useAI && patternResult.services.length < 2) {
      try {
        console.log('Pattern parsing found limited results, trying AI parsing...');
        const aiResult = await this.parseWithAI(logText);
        if (aiResult.services.length > patternResult.services.length) {
          console.log('AI parsing found more services, using AI result');
          return aiResult;
        }
      } catch (error) {
        console.warn('AI parsing failed, falling back to pattern parsing:', error);
      }
    }

    return patternResult;
  }

  private parseWithPatterns(logText: string): ParsedLogData {
    const lines = logText.split('\n').filter(line => line.trim());
    const logEntries: LogEntry[] = [];
    const serviceMap = new Map<string, {
      name: string;
      technology: string;
      endpoints: Set<string>;
      errors: Set<string>;
      traces: Set<string>;
    }>();
    const connections = new Set<string>();
    const logLevels = new Set<string>();

    // Parse each log line
    for (const line of lines) {
      const entry = this.parseLogLine(line);
      if (entry) {
        logEntries.push(entry);

        // Track log levels
        if (entry.level) {
          logLevels.add(entry.level);
        }

        // Track services
        if (entry.service) {
          if (!serviceMap.has(entry.service)) {
            serviceMap.set(entry.service, {
              name: entry.service,
              technology: this.detectTechnology(entry.service, line),
              endpoints: new Set<string>(),
              errors: new Set<string>(),
              traces: new Set<string>(),
            });
          }

          const service = serviceMap.get(entry.service);

          if (service) {
            if (entry.endpoint) {
              service.endpoints.add(entry.endpoint);
            }

            if (entry.error) {
              service.errors.add(entry.error);
            }

            if (entry.traceId) {
              service.traces.add(entry.traceId);
            }
          }
        }
      }
    }

    // Detect connections between services based on trace IDs
    this.detectServiceConnections(logEntries, connections);

    // Convert to final format
    const services = Array.from(serviceMap.values()).map(service => ({
      ...service,
      endpoints: Array.from(service.endpoints),
      errors: Array.from(service.errors),
      traces: Array.from(service.traces),
    }));

    const connectionArray = Array.from(connections).map(conn => {
      const [from, to] = conn.split(' -> ');
      return { from, to, type: 'trace' };
    });

    // Calculate time range
    const timestamps = logEntries
      .map(e => e.timestamp)
      .filter(Boolean)
      .sort();

    return {
      services,
      connections: connectionArray,
      metadata: {
        totalLogs: logEntries.length,
        timeRange: timestamps.length > 0 ? {
          start: timestamps[0]!,
          end: timestamps[timestamps.length - 1]!,
        } : undefined,
        logLevels: Array.from(logLevels),
      },
    };
  }

  private parseLogLine(line: string): LogEntry | null {
    if (!line.trim()) return null;

    const entry: LogEntry = { message: line };

    // Extract timestamp
    for (const pattern of this.timestampPatterns) {
      const match = line.match(pattern);
      if (match) {
        entry.timestamp = match[0];
        break;
      }
    }

    // Extract log level
    for (const pattern of this.levelPatterns) {
      const match = line.match(pattern);
      if (match) {
        entry.level = match[1].toUpperCase();
        break;
      }
    }

    // Extract service name
    for (const pattern of this.servicePatterns) {
      const match = line.match(pattern);
      if (match) {
        entry.service = match[1];
        break;
      }
    }

    // Extract trace ID
    for (const pattern of this.tracePatterns) {
      const match = line.match(pattern);
      if (match) {
        entry.traceId = match[1];
        break;
      }
    }

    // Extract endpoint
    for (const pattern of this.endpointPatterns) {
      const match = line.match(pattern);
      if (match) {
        entry.endpoint = match.length > 2 ? match[2] : match[1];
        entry.method = match.length > 2 ? match[1] : undefined;
        break;
      }
    }

    // Extract error
    for (const pattern of this.errorPatterns) {
      const match = line.match(pattern);
      if (match) {
        entry.error = match[1].trim();
        break;
      }
    }

    // Extract IP
    for (const pattern of this.ipPatterns) {
      const match = line.match(pattern);
      if (match) {
        entry.ip = match[0];
        break;
      }
    }

    // Extract status code
    const statusMatch = line.match(/\b(1\d{2}|2\d{2}|3\d{2}|4\d{2}|5\d{2})\b/);
    if (statusMatch) {
      entry.statusCode = parseInt(statusMatch[0]);
    }

    // Extract duration
    const durationMatch = line.match(/(\d+(?:\.\d+)?)\s*(ms|milliseconds?|s|seconds?)/i);
    if (durationMatch) {
      const value = parseFloat(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      entry.duration = unit.startsWith('s') ? value * 1000 : value;
    }

    return entry;
  }

  private detectTechnology(serviceName: string, logLine: string): string {
    const name = serviceName.toLowerCase();
    const line = logLine.toLowerCase();

    // Security & Authentication
    if (name.includes('keycloak') || line.includes('keycloak')) return 'keycloak';
    if (name.includes('auth0') || line.includes('auth0')) return 'auth0';
    if (name.includes('vault') || line.includes('vault')) return 'vault';
    if (name.includes('opa') || line.includes('policy')) return 'opa';
    if (name.includes('auth') || name.includes('login') || name.includes('identity')) return 'keycloak';

    // API & Gateway
    if (name.includes('kong') || line.includes('kong')) return 'kong';
    if (name.includes('istio') || line.includes('istio')) return 'istio';
    if (name.includes('consul') || line.includes('consul')) return 'consul';
    if (name.includes('gateway') || name.includes('proxy')) return 'gateway';
    if (name.includes('api') && (name.includes('gateway') || name.includes('proxy'))) return 'kong';

    // Messaging & Streaming
    if (name.includes('kafka') || line.includes('kafka')) return 'kafka';
    if (name.includes('rabbitmq') || line.includes('rabbitmq')) return 'rabbitmq';
    if (name.includes('queue') || name.includes('messaging')) return 'kafka';

    // Monitoring & Observability
    if (name.includes('prometheus') || line.includes('prometheus')) return 'prometheus';
    if (name.includes('grafana') || line.includes('grafana')) return 'grafana';
    if (name.includes('jaeger') || line.includes('jaeger')) return 'jaeger';
    if (name.includes('monitoring') || name.includes('metrics')) return 'prometheus';

    // Data Processing
    if (name.includes('spark') || line.includes('spark')) return 'spark';
    if (name.includes('airflow') || line.includes('airflow')) return 'airflow';
    if (name.includes('flink') || line.includes('flink')) return 'flink';

    // Search & Indexing
    if (name.includes('elasticsearch') || line.includes('elasticsearch')) return 'elasticsearch';
    if (name.includes('solr') || line.includes('solr')) return 'solr';
    if (name.includes('search') || name.includes('index')) return 'elasticsearch';

    // Traditional patterns
    if (name.includes('api') || name.includes('server') || line.includes('express')) return 'express';
    if (name.includes('frontend') || name.includes('ui') || line.includes('react')) return 'react';
    if (name.includes('database') || name.includes('db') || line.includes('postgres')) return 'postgres';
    if (name.includes('cache') || name.includes('redis')) return 'redis';
    if (line.includes('nginx')) return 'nginx';
    if (line.includes('docker') || line.includes('container')) return 'docker';
    if (line.includes('kubernetes') || line.includes('k8s')) return 'kubernetes';

    // Service type detection
    if (name.includes('worker') || name.includes('job')) return 'worker';
    if (name.includes('scheduler') || name.includes('cron')) return 'scheduler';
    if (name.includes('microservice') || name.includes('micro-service')) return 'microservice';
    if (name.includes('service')) return 'service';

    return 'service'; // Default for services
  }

  private detectServiceConnections(logEntries: LogEntry[], connections: Set<string>) {
    // Group entries by trace ID
    const traceGroups = new Map<string, LogEntry[]>();
    
    for (const entry of logEntries) {
      if (entry.traceId && entry.service) {
        if (!traceGroups.has(entry.traceId)) {
          traceGroups.set(entry.traceId, []);
        }
        traceGroups.get(entry.traceId)!.push(entry);
      }
    }

    // Detect connections within each trace
    for (const [, entries] of traceGroups) {
      const services = entries
        .map(e => e.service)
        .filter(Boolean)
        .filter((service, index, arr) => arr.indexOf(service) === index); // unique

      // Create connections between consecutive services in the trace
      for (let i = 0; i < services.length - 1; i++) {
        connections.add(`${services[i]} -> ${services[i + 1]}`);
      }
    }
  }

  // AI-powered parsing methods
  private async parseWithAI(logText: string): Promise<ParsedLogData> {
    const prompt = this.createParsingPrompt(logText);

    switch (this.aiConfig.provider) {
      case 'huggingface':
        return await this.parseWithHuggingFace(prompt);
      case 'groq':
        return await this.parseWithGroq(prompt);
      case 'ollama':
        return await this.parseWithOllama(prompt);
      default:
        throw new Error(`Unsupported AI provider: ${this.aiConfig.provider}`);
    }
  }

  private createParsingPrompt(logText: string): string {
    return `Analyze the following log data and extract services, connections, and metadata. Return ONLY a valid JSON object with this exact structure:

{
  "services": [
    {
      "name": "service-name",
      "technology": "technology-type",
      "endpoints": ["endpoint1", "endpoint2"],
      "errors": ["error1", "error2"],
      "traces": ["trace1", "trace2"]
    }
  ],
  "connections": [
    {
      "from": "service1",
      "to": "service2",
      "type": "trace"
    }
  ],
  "metadata": {
    "totalLogs": 10,
    "logLevels": ["INFO", "ERROR"]
  }
}

Technology types should be one of: react, vue, angular, nodejs, express, nginx, apache, docker, kubernetes, redis, mongodb, postgres, mysql, aws, azure, gcp, python, java, go, javascript, typescript, keycloak, auth0, vault, opa, kong, istio, consul, kafka, rabbitmq, prometheus, grafana, elasticsearch, spark, airflow, service, microservice, api, gateway, proxy

Log data to analyze:
${logText.slice(0, 4000)}${logText.length > 4000 ? '\n... (truncated)' : ''}

Return only the JSON object, no explanations:`;
  }

  private async parseWithHuggingFace(prompt: string): Promise<ParsedLogData> {
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.aiConfig.apiKey || 'hf_demo'}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.1,
          return_full_text: false
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.statusText}`);
    }

    const result = await response.json();
    return this.parseAIResponse(result[0]?.generated_text || '{}');
  }

  private async parseWithGroq(prompt: string): Promise<ParsedLogData> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.aiConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.aiConfig.model || 'llama3-8b-8192',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const result = await response.json();
    return this.parseAIResponse(result.choices[0]?.message?.content || '{}');
  }

  private async parseWithOllama(prompt: string): Promise<ParsedLogData> {
    const endpoint = this.aiConfig.endpoint || 'http://localhost:11434/api/generate';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.aiConfig.model || 'llama3.2',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 1000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const result = await response.json();
    return this.parseAIResponse(result.response || '{}');
  }

  private parseAIResponse(aiResponse: string): ParsedLogData {
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : aiResponse;

      const parsed = JSON.parse(jsonStr);

      // Validate and normalize the structure
      return {
        services: Array.isArray(parsed.services) ? parsed.services.map((service: any) => ({
          name: service.name || 'unknown-service',
          technology: service.technology || 'nodejs',
          endpoints: Array.isArray(service.endpoints) ? service.endpoints : [],
          errors: Array.isArray(service.errors) ? service.errors : [],
          traces: Array.isArray(service.traces) ? service.traces : []
        })) : [],
        connections: Array.isArray(parsed.connections) ? parsed.connections.map((conn: any) => ({
          from: conn.from || '',
          to: conn.to || '',
          type: conn.type || 'trace'
        })) : [],
        metadata: {
          totalLogs: parsed.metadata?.totalLogs || 0,
          logLevels: Array.isArray(parsed.metadata?.logLevels) ? parsed.metadata.logLevels : []
        }
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('AI returned invalid JSON response');
    }
  }
}
