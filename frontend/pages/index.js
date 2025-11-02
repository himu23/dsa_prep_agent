import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("chat");
  
  // Chat tab state
  const [input, setInput] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  
  // Recommendations tab state
  const [handle, setHandle] = useState("");
  const [recommendations, setRecommendations] = useState(null);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState("");

  const askBackend = async () => {
    if (!input.trim()) return;
    
    setChatLoading(true);
    setChatResponse("");
    try {
      const res = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Backend returned an error");
      }

      const data = await res.json();

      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        "No response from AI.";

      setChatResponse(text);
    } catch (err) {
      setChatResponse("❌ Error: " + err.message);
    } finally {
      setChatLoading(false);
    }
  };

  const getRecommendations = async () => {
    if (!handle.trim()) {
      setRecError("Please enter a Codeforces handle");
      return;
    }
    
    setRecLoading(true);
    setRecError("");
    setRecommendations(null);
    
    try {
      const res = await fetch("http://localhost:8000/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: handle.trim(), max_subs: 20 })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to get recommendations");
      }

      const data = await res.json();
      setRecommendations(data);
    } catch (err) {
      setRecError("❌ Error: " + err.message);
    } finally {
      setRecLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: "1000px", 
      margin: "0 auto", 
      padding: "40px 20px",
      fontFamily: "system-ui, -apple-system, sans-serif" 
    }}>
      <h1 style={{ 
        marginBottom: "30px", 
        color: "#333",
        textAlign: "center"
      }}>
        DSA Prep Agent
      </h1>

      {/* Tabs */}
      <div style={{ 
        display: "flex", 
        gap: "10px", 
        marginBottom: "30px",
        borderBottom: "2px solid #e0e0e0"
      }}>
        <button
          onClick={() => setActiveTab("chat")}
          style={{
            padding: "12px 24px",
            border: "none",
            background: activeTab === "chat" ? "#0070f3" : "transparent",
            color: activeTab === "chat" ? "white" : "#666",
            cursor: "pointer",
            fontWeight: activeTab === "chat" ? "bold" : "normal",
            borderBottom: activeTab === "chat" ? "2px solid #0070f3" : "2px solid transparent",
            marginBottom: "-2px"
          }}
        >
          💬 AI Chat
        </button>
        <button
          onClick={() => setActiveTab("recommendations")}
          style={{
            padding: "12px 24px",
            border: "none",
            background: activeTab === "recommendations" ? "#0070f3" : "transparent",
            color: activeTab === "recommendations" ? "white" : "#666",
            cursor: "pointer",
            fontWeight: activeTab === "recommendations" ? "bold" : "normal",
            borderBottom: activeTab === "recommendations" ? "2px solid #0070f3" : "2px solid transparent",
            marginBottom: "-2px"
          }}
        >
          🎯 DSA Recommendations
        </button>
      </div>

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <div>
          <div style={{ 
            marginBottom: "20px",
            padding: "20px",
            background: "#f5f5f5",
            borderRadius: "8px"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "10px" }}>Ask AI Anything</h3>
            <p style={{ color: "#666", margin: 0 }}>
              Get help with DSA concepts, problem-solving strategies, or any coding questions.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !chatLoading && askBackend()}
              placeholder="Type your question..."
              disabled={chatLoading}
              style={{ 
                flex: 1,
                padding: "12px", 
                fontSize: "16px",
                border: "1px solid #ddd",
                borderRadius: "6px"
              }}
            />
            <button
              onClick={askBackend}
              disabled={chatLoading || !input.trim()}
              style={{ 
                padding: "12px 24px",
                background: chatLoading || !input.trim() ? "#ccc" : "#0070f3",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: chatLoading || !input.trim() ? "not-allowed" : "pointer",
                fontWeight: "bold"
              }}
            >
              {chatLoading ? "..." : "Ask"}
            </button>
          </div>

          {chatResponse && (
            <div style={{ 
              padding: "20px",
              background: "#f9f9f9",
              borderRadius: "8px",
              border: "1px solid #e0e0e0"
            }}>
              <pre style={{ 
                margin: 0, 
                whiteSpace: "pre-wrap",
                fontFamily: "inherit",
                fontSize: "14px",
                lineHeight: "1.6"
              }}>
                {chatResponse}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === "recommendations" && (
        <div>
          <div style={{ 
            marginBottom: "20px",
            padding: "20px",
            background: "#f5f5f5",
            borderRadius: "8px"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "10px" }}>Get Personalized Recommendations</h3>
            <p style={{ color: "#666", margin: 0 }}>
              Enter your Codeforces handle to analyze your submissions and get personalized problem recommendations.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !recLoading && getRecommendations()}
              placeholder="Codeforces handle (e.g., tourist, Petr)"
              disabled={recLoading}
              style={{ 
                flex: 1,
                padding: "12px", 
                fontSize: "16px",
                border: "1px solid #ddd",
                borderRadius: "6px"
              }}
            />
            <button
              onClick={getRecommendations}
              disabled={recLoading || !handle.trim()}
              style={{ 
                padding: "12px 24px",
                background: recLoading || !handle.trim() ? "#ccc" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: recLoading || !handle.trim() ? "not-allowed" : "pointer",
                fontWeight: "bold"
              }}
            >
              {recLoading ? "Analyzing..." : "Get Recommendations"}
            </button>
          </div>

          {recError && (
            <div style={{ 
              padding: "15px",
              background: "#fee",
              color: "#c33",
              borderRadius: "6px",
              marginBottom: "20px"
            }}>
              {recError}
            </div>
          )}

          {recommendations && (
            <div style={{ 
              padding: "20px",
              background: "#f9f9f9",
              borderRadius: "8px",
              border: "1px solid #e0e0e0"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h3 style={{ marginTop: 0 }}>
                  Recommendations for {recommendations.handle}
                </h3>
                {recommendations.model_used && (
                  <span style={{ 
                    padding: "5px 10px", 
                    background: recommendations.model_used === "fine-tuned" ? "#28a745" : "#0070f3",
                    color: "white",
                    borderRadius: "4px",
                    fontSize: "12px"
                  }}>
                    {recommendations.model_used === "fine-tuned" ? "🤖 Fine-tuned" : "🌐 API"}
                  </span>
                )}
              </div>
              
              {recommendations.evaluation && (
                <div style={{ 
                  marginBottom: "20px",
                  padding: "15px",
                  background: "#e8f4f8",
                  borderRadius: "6px"
                }}>
                  <h4 style={{ marginTop: 0, marginBottom: "10px" }}>Quality Metrics</h4>
                  {recommendations.evaluation.analysis && (
                    <div style={{ marginBottom: "10px" }}>
                      <strong>Analysis Quality:</strong> {(recommendations.evaluation.analysis.average_overall_quality * 100).toFixed(1)}%
                      <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                        Completeness: {(recommendations.evaluation.analysis.average_completeness * 100).toFixed(1)}% | 
                        Relevance: {(recommendations.evaluation.analysis.average_relevance * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}
                  {recommendations.evaluation.recommendations && (
                    <div>
                      <strong>Recommendation Quality:</strong> {(recommendations.evaluation.recommendations.recommendation_quality * 100).toFixed(1)}%
                    </div>
                  )}
                  {recommendations.evaluation.overall_agent_score && (
                    <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #ccc" }}>
                      <strong>Overall Agent Score:</strong> {(recommendations.evaluation.overall_agent_score * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              )}
              
              {recommendations.recommendations?.recommendations ? (
                <div>
                  {recommendations.recommendations.recommendations.map((rec, idx) => (
                    <div 
                      key={idx}
                      style={{
                        padding: "15px",
                        marginBottom: "15px",
                        background: "white",
                        borderRadius: "6px",
                        border: "1px solid #ddd"
                      }}
                    >
                      <h4 style={{ marginTop: 0, marginBottom: "8px", color: "#0070f3" }}>
                        {rec.title || rec.name || `Recommendation ${idx + 1}`}
                      </h4>
                      {rec.link && (
                        <p style={{ margin: "5px 0" }}>
                          <a 
                            href={rec.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: "#0070f3", textDecoration: "none" }}
                          >
                            🔗 {rec.link}
                          </a>
                        </p>
                      )}
                      {rec.difficulty && (
                        <p style={{ margin: "5px 0", color: "#666" }}>
                          <strong>Difficulty:</strong> {rec.difficulty}
                        </p>
                      )}
                      {rec.reason && (
                        <p style={{ margin: "8px 0 0 0", color: "#333" }}>
                          {rec.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <pre style={{ 
                  margin: 0, 
                  whiteSpace: "pre-wrap",
                  fontFamily: "inherit",
                  fontSize: "14px"
                }}>
                  {JSON.stringify(recommendations.recommendations || recommendations, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
