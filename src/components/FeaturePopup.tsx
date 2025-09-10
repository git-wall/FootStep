import { useState } from 'react';
import { X, Upload, FileText, Brain } from 'lucide-react';
import { LogParser } from './utils/logParser';

interface ImportJsonData {
  nodes?: Array<{
    name: string;
    technology?: string;
    position?: { x: number; y: number };
  }>;
  connections?: Array<{
    from: string;
    to: string;
  }>;
}

interface FeaturePopupProps {
  onClose: () => void;
  onImportJson: (jsonData: ImportJsonData) => void;
}

export function FeaturePopup({ onClose, onImportJson }: FeaturePopupProps) {
  const [jsonText, setJsonText] = useState('');
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [showLogParser, setShowLogParser] = useState(false);
  const [logText, setLogText] = useState('');
  const [error, setError] = useState('');
  const [selectedLayout, setSelectedLayout] = useState<'hierarchy' | 'circular' | 'grid'>('hierarchy');
  const [isProcessing, setIsProcessing] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [aiProvider, setAiProvider] = useState<'huggingface' | 'groq' | 'ollama'>('huggingface');
  const [apiKey, setApiKey] = useState('');

  const handleJsonImport = () => {
    try {
      const parsedJson = JSON.parse(jsonText);
      // Add layout information to the parsed JSON
      const jsonWithLayout = {
        ...parsedJson,
        layout: selectedLayout
      };
      onImportJson(jsonWithLayout);
      setJsonText('');
      setError('');
      setShowJsonImport(false);
      onClose();
    } catch (err) {
      setError('Invalid JSON format. Please check your JSON syntax.');
    }
  };

  const handleLogParsing = async () => {
    if (!logText.trim()) {
      setError('Please provide log data to parse.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const parser = new LogParser({
        useAI,
        provider: aiProvider,
        apiKey: apiKey || undefined
      });

      const parsedData = await parser.parseLogText(logText);

      // Convert parsed log data to the expected JSON format
      const jsonData = {
        nodes: parsedData.services.map((service: any) => ({
          name: service.name,
          technology: service.technology || 'nodejs'
        })),
        connections: parsedData.connections.map((conn: any) => ({
          from: conn.from,
          to: conn.to
        })),
        layout: selectedLayout
      };

      onImportJson(jsonData);
      setLogText('');
      setError('');
      setShowLogParser(false);
      onClose();
    } catch (err) {
      setError(`Error parsing logs: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setJsonText(content);
      };
      reader.readAsText(file);
    }
  };

  const handleLogFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setLogText(content);
      };
      reader.readAsText(file);
    }
  };

  const sampleJson = `{
  "nodes": [
    {
      "name": "Frontend App",
      "technology": "react"
    },
    {
      "name": "API Gateway",
      "technology": "kong"
    },
    {
      "name": "Auth Service",
      "technology": "keycloak"
    },
    {
      "name": "User Service",
      "technology": "express"
    },
    {
      "name": "Database",
      "technology": "postgres"
    },
    {
      "name": "Message Queue",
      "technology": "kafka"
    },
    {
      "name": "Monitoring",
      "technology": "prometheus"
    }
  ],
  "connections": [
    { "from": "Frontend App", "to": "API Gateway" },
    { "from": "API Gateway", "to": "Auth Service" },
    { "from": "API Gateway", "to": "User Service" },
    { "from": "User Service", "to": "Database" },
    { "from": "User Service", "to": "Message Queue" },
    { "from": "Monitoring", "to": "User Service" }
  ]
}`;

  const sampleLogData = `2024-01-15T10:30:15.123Z INFO [frontend-service] GET /api/users trace_id=abc123 duration=45ms status=200
2024-01-15T10:30:15.145Z INFO [kong-gateway] Routing request to user-service trace_id=abc123 ip=192.168.1.100
2024-01-15T10:30:15.150Z INFO [keycloak-auth] Token validation successful trace_id=abc123 user_id=67890
2024-01-15T10:30:15.167Z INFO [user-service] Processing user request trace_id=abc123 endpoint=/users method=GET
2024-01-15T10:30:15.189Z INFO [user-service] Database query executed trace_id=abc123 duration=23ms
2024-01-15T10:30:15.201Z INFO [postgres-db] Query: SELECT * FROM users WHERE active=true trace_id=abc123
2024-01-15T10:30:15.223Z INFO [user-service] Response sent trace_id=abc123 status=200 duration=56ms
2024-01-15T10:30:15.245Z INFO [kafka-producer] Message published to user-events topic trace_id=abc123
2024-01-15T10:30:16.445Z ERROR [payment-service] Payment processing failed trace_id=def456 error="Insufficient funds" user_id=12345
2024-01-15T10:30:16.467Z WARN [notification-service] Failed to send email trace_id=def456 error="SMTP timeout"
2024-01-15T10:30:17.789Z INFO [prometheus-metrics] Collecting service metrics trace_id=ghi789 service=user-service
2024-01-15T10:30:17.812Z INFO [redis-cache] Cache hit for user:67890 trace_id=ghi789 duration=2ms`;

  return (
    <div className="feature-popup-overlay" onClick={onClose}>
      <div className="feature-popup" onClick={(e) => e.stopPropagation()}>
        <div className="feature-popup-header">
          <h3>✨ Magic Features</h3>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="feature-popup-content">
          {!showJsonImport && !showLogParser ? (
            <div className="features-list">
              <div
                className="feature-item"
                onClick={() => setShowJsonImport(true)}
              >
                <div className="feature-icon">
                  <FileText size={24} />
                </div>
                <div className="feature-info">
                  <h4>Import JSON Nodes</h4>
                  <p>Import nodes from JSON with auto icon mapping</p>
                </div>
              </div>

              <div
                className="feature-item"
                onClick={() => setShowLogParser(true)}
              >
                <div className="feature-icon">
                  <Brain size={24} />
                </div>
                <div className="feature-info">
                  <h4>AI Log Parser</h4>
                  <p>Parse logs to extract services, traces, and connections</p>
                </div>
              </div>

              {/* Placeholder for future features */}
              <div className="feature-item disabled">
                <div className="feature-icon">
                  <Upload size={24} />
                </div>
                <div className="feature-info">
                  <h4>Export Diagram</h4>
                  <p>Coming soon...</p>
                </div>
              </div>
            </div>
          ) : showLogParser ? (
            <div className="log-parser-section">
              <div className="log-parser-header">
                <button
                  className="back-button"
                  onClick={() => setShowLogParser(false)}
                >
                  ← Back
                </button>
                <h4>🧠 AI Log Parser</h4>
              </div>

              <div className="log-input-section">
                <div className="input-controls">
                  <label htmlFor="log-file" className="file-upload-button">
                    📁 Upload Log File
                  </label>
                  <input
                    id="log-file"
                    type="file"
                    accept=".log,.txt"
                    onChange={handleLogFileUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    className="sample-button"
                    onClick={() => setLogText(sampleLogData)}
                  >
                    📋 Use Sample Logs
                  </button>
                </div>

                <div className="layout-selection">
                  <h5>Auto-Layout for extracted services:</h5>
                  <div className="layout-options">
                    <label className={`layout-option ${selectedLayout === 'hierarchy' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="layout"
                        value="hierarchy"
                        checked={selectedLayout === 'hierarchy'}
                        onChange={(e) => setSelectedLayout(e.target.value as 'hierarchy')}
                      />
                      <span className="layout-icon">🌳</span>
                      <span className="layout-name">Hierarchy</span>
                      <span className="layout-desc">Based on trace flows</span>
                    </label>

                    <label className={`layout-option ${selectedLayout === 'circular' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="layout"
                        value="circular"
                        checked={selectedLayout === 'circular'}
                        onChange={(e) => setSelectedLayout(e.target.value as 'circular')}
                      />
                      <span className="layout-icon">⭕</span>
                      <span className="layout-name">Circular</span>
                      <span className="layout-desc">Services in a circle</span>
                    </label>

                    <label className={`layout-option ${selectedLayout === 'grid' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="layout"
                        value="grid"
                        checked={selectedLayout === 'grid'}
                        onChange={(e) => setSelectedLayout(e.target.value as 'grid')}
                      />
                      <span className="layout-icon">⚏</span>
                      <span className="layout-name">Grid</span>
                      <span className="layout-desc">Organized layout</span>
                    </label>
                  </div>
                </div>

                <div className="ai-config-section">
                  <div className="ai-toggle">
                    <label className="ai-toggle-label">
                      <input
                        type="checkbox"
                        checked={useAI}
                        onChange={(e) => setUseAI(e.target.checked)}
                      />
                      <span>🤖 Enable AI-powered parsing (for complex logs)</span>
                    </label>
                  </div>

                  {useAI && (
                    <div className="ai-config-details">
                      <div className="ai-provider-selection">
                        <label>AI Provider:</label>
                        <select
                          value={aiProvider}
                          onChange={(e) => setAiProvider(e.target.value as 'huggingface' | 'groq' | 'ollama')}
                          className="ai-provider-select"
                        >
                          <option value="huggingface">🤗 Hugging Face (Free)</option>
                          <option value="groq">⚡ Groq (Fast, API Key)</option>
                          <option value="ollama">🦙 Ollama (Local)</option>
                        </select>
                      </div>

                      {(aiProvider === 'groq') && (
                        <div className="api-key-input">
                          <label>API Key:</label>
                          <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your API key..."
                            className="api-key-field"
                          />
                        </div>
                      )}

                      {aiProvider === 'ollama' && (
                        <div className="ollama-info">
                          <p>📋 Make sure Ollama is running locally on port 11434</p>
                          <p>Install: <code>curl -fsSL https://ollama.ai/install.sh | sh</code></p>
                          <p>Run: <code>ollama run llama3.2</code></p>
                        </div>
                      )}

                      {aiProvider === 'huggingface' && (
                        <div className="hf-info">
                          <p>🆓 Uses free Hugging Face Inference API</p>
                          <p>⚠️ May have rate limits and slower response times</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <textarea
                  className="log-textarea"
                  value={logText}
                  onChange={(e) => setLogText(e.target.value)}
                  placeholder="Paste your log data here or upload a log file..."
                  rows={12}
                />

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                <div className="import-actions">
                  <button
                    className="import-button"
                    onClick={handleLogParsing}
                    disabled={!logText.trim() || isProcessing}
                  >
                    {isProcessing ? '🔄 Processing...' : '🚀 Parse & Import'}
                  </button>
                </div>
              </div>

              <div className="log-format-info">
                <h5>Supported Log Formats:</h5>
                <ul>
                  <li><strong>Service Names:</strong> <code>[service-name]</code>, <code>service: name</code></li>
                  <li><strong>Trace IDs:</strong> <code>trace_id=abc123</code>, <code>traceId: "xyz"</code></li>
                  <li><strong>Endpoints:</strong> <code>GET /api/users</code>, <code>endpoint: /path</code></li>
                  <li><strong>Errors:</strong> <code>error: "message"</code>, <code>ERROR level</code></li>
                  <li><strong>Timestamps:</strong> ISO format, custom formats</li>
                </ul>
                <p style={{ marginTop: '12px', fontSize: '13px', color: '#94a3b8' }}>
                  🤖 <strong>AI Detection:</strong> Automatically extracts services, connections, and metadata from log patterns.
                </p>
              </div>
            </div>
          ) : (
            <div className="json-import-section">
              <div className="json-import-header">
                <button 
                  className="back-button"
                  onClick={() => setShowJsonImport(false)}
                >
                  ← Back
                </button>
                <h4>Import JSON Nodes</h4>
              </div>

              <div className="json-input-section">
                <div className="input-controls">
                  <label htmlFor="json-file" className="file-upload-button">
                    📁 Upload JSON File
                  </label>
                  <input
                    id="json-file"
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    className="sample-button"
                    onClick={() => setJsonText(sampleJson)}
                  >
                    📋 Use Sample
                  </button>
                </div>

                <div className="layout-selection">
                  <h5>Auto-Layout (when positions not provided):</h5>
                  <div className="layout-options">
                    <label className={`layout-option ${selectedLayout === 'hierarchy' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="layout"
                        value="hierarchy"
                        checked={selectedLayout === 'hierarchy'}
                        onChange={(e) => setSelectedLayout(e.target.value as 'hierarchy')}
                      />
                      <span className="layout-icon">🌳</span>
                      <span className="layout-name">Hierarchy</span>
                      <span className="layout-desc">Tree-like structure based on connections</span>
                    </label>

                    <label className={`layout-option ${selectedLayout === 'circular' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="layout"
                        value="circular"
                        checked={selectedLayout === 'circular'}
                        onChange={(e) => setSelectedLayout(e.target.value as 'circular')}
                      />
                      <span className="layout-icon">⭕</span>
                      <span className="layout-name">Circular</span>
                      <span className="layout-desc">Nodes arranged in a circle</span>
                    </label>

                    <label className={`layout-option ${selectedLayout === 'grid' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="layout"
                        value="grid"
                        checked={selectedLayout === 'grid'}
                        onChange={(e) => setSelectedLayout(e.target.value as 'grid')}
                      />
                      <span className="layout-icon">⚏</span>
                      <span className="layout-name">Grid</span>
                      <span className="layout-desc">Organized in rows and columns</span>
                    </label>
                  </div>
                </div>

                <textarea
                  className="json-textarea"
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder="Paste your JSON here or upload a file..."
                  rows={12}
                />

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                <div className="import-actions">
                  <button 
                    className="import-button"
                    onClick={handleJsonImport}
                    disabled={!jsonText.trim()}
                  >
                    🚀 Import Nodes
                  </button>
                </div>
              </div>

              <div className="json-format-info">
                <h5>Expected JSON Format:</h5>
                <ul>
                  <li><code>nodes</code>: Array of node objects</li>
                  <li><code>name</code>: Node display name (required)</li>
                  <li><code>technology</code>: Technology ID (auto-mapped to icons)</li>
                  <li><code>position</code>: Optional {`{x, y}`} coordinates</li>
                  <li><code>connections</code>: Optional array of connections</li>
                </ul>
                <p style={{ marginTop: '12px', fontSize: '13px', color: '#94a3b8' }}>
                  💡 <strong>Auto-Layout:</strong> If nodes don't have positions, they'll be automatically arranged using the selected layout algorithm.
                </p>
                <p style={{ marginTop: '8px', fontSize: '13px', color: '#94a3b8' }}>
                  🔍 <strong>Smart Icon Mapping:</strong> Technology icons are automatically detected from node names and technology fields.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
