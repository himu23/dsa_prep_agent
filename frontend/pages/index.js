import { useState, useEffect } from "react";

export default function Home() {
  // Chat floating dialog state
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  
  // Recommendations state (main page)
  const [handle, setHandle] = useState("");
  const [recommendations, setRecommendations] = useState(null);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState("");

  const askBackend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput("");
    setChatLoading(true);
    
    // Add user message
    const newMessages = [...chatMessages, { role: "user", content: userMessage }];
    setChatMessages(newMessages);
    
    try {
      const res = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Backend returned an error");
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response from AI.";

      setChatMessages([...newMessages, { role: "assistant", content: text }]);
    } catch (err) {
      setChatMessages([...newMessages, { role: "assistant", content: "❌ Error: " + err.message }]);
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
        throw new Error(errorData.detail || "Failed to get recommendations. Make sure Python backend is running on port 8000.");
      }

      const data = await res.json();
      setRecommendations(data);
    } catch (err) {
      setRecError("❌ Error: " + err.message);
    } finally {
      setRecLoading(false);
    }
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatOpen) {
      const chatContainer = document.getElementById("chat-messages");
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [chatMessages, chatOpen]);

  return (
    <div style={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      position: "relative",
      paddingBottom: "100px"
    }}>
      {/* Main Content */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "60px 20px 40px"
      }}>
        {/* Header */}
        <div style={{
          textAlign: "center",
          marginBottom: "50px",
          color: "white"
        }}>
          <h1 style={{
            fontSize: "48px",
            fontWeight: "700",
            marginBottom: "10px",
            textShadow: "0 2px 10px rgba(0,0,0,0.2)"
          }}>
            🎯 DSA Prep Agent
          </h1>
          <p style={{
            fontSize: "20px",
            opacity: 0.9,
            margin: 0
          }}>
            Get personalized problem recommendations based on your Codeforces submissions
          </p>
        </div>

        {/* Main Card - Recommendations */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "40px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          marginBottom: "30px"
        }}>
          <div style={{ marginBottom: "30px" }}>
            <h2 style={{
              fontSize: "28px",
              fontWeight: "600",
              marginBottom: "10px",
              color: "#333"
            }}>
              📊 Get Personalized Recommendations
            </h2>
            <p style={{ color: "#666", fontSize: "16px", margin: 0 }}>
              Enter your Codeforces handle to analyze your submissions and receive tailored problem recommendations
            </p>
          </div>

          {/* Input Section */}
          <div style={{
            display: "flex",
            gap: "15px",
            marginBottom: "30px",
            flexWrap: "wrap"
          }}>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !recLoading && getRecommendations()}
              placeholder="Codeforces handle (e.g., tourist, Petr, your_handle)"
              disabled={recLoading}
              style={{
                flex: "1 1 300px",
                padding: "16px 20px",
                fontSize: "16px",
                border: "2px solid #e0e0e0",
                borderRadius: "12px",
                outline: "none",
                transition: "all 0.3s",
                minWidth: "250px"
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
            />
            <button
              onClick={getRecommendations}
              disabled={recLoading || !handle.trim()}
              style={{
                padding: "16px 32px",
                background: recLoading || !handle.trim() 
                  ? "linear-gradient(135deg, #ccc 0%, #aaa 100%)"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: recLoading || !handle.trim() ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "16px",
                boxShadow: recLoading || !handle.trim() ? "none" : "0 4px 15px rgba(102, 126, 234, 0.4)",
                transition: "all 0.3s",
                minWidth: "180px"
              }}
              onMouseEnter={(e) => {
                if (!recLoading && handle.trim()) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                if (!recLoading && handle.trim()) {
                  e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
                }
              }}
            >
              {recLoading ? "⏳ Analyzing..." : "🚀 Get Recommendations"}
            </button>
          </div>

          {/* Error Message */}
          {recError && (
            <div style={{
              padding: "16px 20px",
              background: "#fee",
              color: "#c33",
              borderRadius: "12px",
              marginBottom: "20px",
              border: "1px solid #fcc",
              fontSize: "14px"
            }}>
              {recError}
            </div>
          )}

          {/* Loading State */}
          {recLoading && (
            <div style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#666"
            }}>
              <div style={{
                display: "inline-block",
                width: "50px",
                height: "50px",
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #667eea",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginBottom: "20px"
              }}></div>
              <p style={{ fontSize: "16px", margin: 0 }}>
                Analyzing your submissions and generating recommendations...
              </p>
            </div>
          )}

          {/* Recommendations Results */}
          {recommendations && !recLoading && (
            <div>
              {/* Header with Model Info */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "25px",
                paddingBottom: "20px",
                borderBottom: "2px solid #f0f0f0"
              }}>
                <div>
                  <h3 style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    marginBottom: "5px",
                    color: "#333"
                  }}>
                    Recommendations for <span style={{ color: "#667eea" }}>{recommendations.handle}</span>
                  </h3>
                  {recommendations.model_used && (
                    <span style={{
                      display: "inline-block",
                      padding: "6px 12px",
                      background: recommendations.model_used === "fine-tuned" 
                        ? "linear-gradient(135deg, #28a745 0%, #20c997 100%)"
                        : "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
                      color: "white",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "500",
                      marginTop: "5px"
                    }}>
                      {recommendations.model_used === "fine-tuned" ? "🤖 Fine-tuned Model" : "🌐 API Model"}
                    </span>
                  )}
                </div>
              </div>

              {/* Statistics Overview */}
              {recommendations.statistics && (
                <div style={{
                  padding: "20px",
                  background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                  borderRadius: "12px",
                  marginBottom: "30px",
                  border: "1px solid #dee2e6"
                }}>
                  <h4 style={{
                    marginTop: 0,
                    marginBottom: "15px",
                    color: "#495057",
                    fontSize: "18px"
                  }}>
                    📊 Your Statistics (Like CF Analytics)
                  </h4>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "15px",
                    marginBottom: "20px"
                  }}>
                    <div>
                      <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Total Solved</div>
                      <div style={{ fontSize: "28px", fontWeight: "700", color: "#28a745" }}>
                        {recommendations.statistics.total_solved}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Topics Analyzed</div>
                      <div style={{ fontSize: "28px", fontWeight: "700", color: "#007bff" }}>
                        {recommendations.statistics.topics_analyzed || Object.keys(recommendations.statistics.topic_stats || {}).length}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Weak Topics</div>
                      <div style={{ fontSize: "28px", fontWeight: "700", color: "#dc3545" }}>
                        {recommendations.evaluation?.statistics?.weak_topics || 0}
                      </div>
                    </div>
                    {recommendations.user_rating > 0 && (
                      <div>
                        <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Your Rating</div>
                        <div style={{ fontSize: "28px", fontWeight: "700", color: "#6f42c1" }}>
                          {recommendations.user_rating}
                          {recommendations.user_max_rating > recommendations.user_rating && (
                            <span style={{ fontSize: "16px", color: "#999", marginLeft: "5px" }}>
                              (Max: {recommendations.user_max_rating})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Topic Performance */}
                  {recommendations.statistics.topic_stats && Object.keys(recommendations.statistics.topic_stats).length > 0 && (
                    <div>
                      <h5 style={{ fontSize: "14px", marginBottom: "10px", color: "#495057" }}>Top Weak Topics:</h5>
                      <div style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px"
                      }}>
                        {Object.entries(recommendations.statistics.topic_stats)
                          .filter(([_, stats]) => stats.strength === "weak")
                          .sort(([_, a], [__, b]) => a.success_rate - b.success_rate)
                          .slice(0, 10)
                          .map(([topic, stats]) => (
                            <div
                              key={topic}
                              style={{
                                padding: "8px 12px",
                                background: stats.strength === "weak" ? "#fee" :
                                          stats.strength === "medium" ? "#fff3cd" : "#d4edda",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "500"
                              }}
                            >
                              {topic}: {stats.solved}/{stats.total_attempts} ({stats.success_rate * 100}%)
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quality Metrics */}
              {recommendations.evaluation && (
                <div style={{
                  padding: "20px",
                  background: "linear-gradient(135deg, #e8f4f8 0%, #d1ecf1 100%)",
                  borderRadius: "12px",
                  marginBottom: "30px",
                  border: "1px solid #bee5eb"
                }}>
                  <h4 style={{
                    marginTop: 0,
                    marginBottom: "15px",
                    color: "#0c5460",
                    fontSize: "18px"
                  }}>
                    📈 Quality Metrics
                  </h4>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "15px"
                  }}>
                    {recommendations.evaluation.analysis && (
                      <>
                        <div>
                          <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Analysis Quality</div>
                          <div style={{ fontSize: "24px", fontWeight: "600", color: "#0c5460" }}>
                            {(recommendations.evaluation.analysis.average_overall_quality * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Completeness</div>
                          <div style={{ fontSize: "24px", fontWeight: "600", color: "#0c5460" }}>
                            {(recommendations.evaluation.analysis.average_completeness * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Relevance</div>
                          <div style={{ fontSize: "24px", fontWeight: "600", color: "#0c5460" }}>
                            {(recommendations.evaluation.analysis.average_relevance * 100).toFixed(0)}%
                          </div>
                        </div>
                      </>
                    )}
                    {recommendations.evaluation.overall_agent_score && (
                      <div>
                        <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Overall Score</div>
                        <div style={{ fontSize: "24px", fontWeight: "600", color: "#28a745" }}>
                          {(recommendations.evaluation.overall_agent_score * 100).toFixed(0)}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recommendations List */}
              {recommendations.recommendations?.recommendations ? (
                <div>
                  <h4 style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    marginBottom: "20px",
                    color: "#333"
                  }}>
                    🎯 Recommended Problems
                  </h4>
                  <div style={{
                    display: "grid",
                    gap: "20px"
                  }}>
                    {recommendations.recommendations.recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "25px",
                          background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
                          borderRadius: "15px",
                          border: "2px solid #e9ecef",
                          transition: "all 0.3s",
                          cursor: "pointer"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-5px)";
                          e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)";
                          e.currentTarget.style.borderColor = "#667eea";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.borderColor = "#e9ecef";
                        }}
                      >
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "12px"
                        }}>
                          <h5 style={{
                            margin: 0,
                            fontSize: "20px",
                            fontWeight: "600",
                            color: "#667eea"
                          }}>
                            {idx + 1}. {rec.title || rec.name || `Recommendation ${idx + 1}`}
                          </h5>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            {rec.difficulty && (
                              <span style={{
                                padding: "6px 12px",
                                background: rec.difficulty === "easy" ? "#d4edda" :
                                          rec.difficulty === "medium" ? "#fff3cd" : "#f8d7da",
                                color: rec.difficulty === "easy" ? "#155724" :
                                      rec.difficulty === "medium" ? "#856404" : "#721c24",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "500",
                                textTransform: "capitalize"
                              }}>
                                {rec.difficulty}
                              </span>
                            )}
                            {rec.rating && (
                              <span style={{
                                padding: "6px 12px",
                                background: "#e7f3ff",
                                color: "#0066cc",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "600"
                              }}>
                                ⭐ {rec.rating}
                              </span>
                            )}
                          </div>
                        </div>
                        {rec.link && (
                          <a
                            href={rec.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-block",
                              color: "#667eea",
                              textDecoration: "none",
                              fontWeight: "500",
                              marginBottom: "12px",
                              fontSize: "14px"
                            }}
                            onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                            onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                          >
                            🔗 Open on Codeforces →
                          </a>
                        )}
                        {rec.reason && (
                          <p style={{
                            margin: "12px 0 0 0",
                            color: "#555",
                            lineHeight: "1.6",
                            fontSize: "15px"
                          }}>
                            {rec.reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <pre style={{
                  margin: 0,
                  padding: "20px",
                  background: "#f8f9fa",
                  borderRadius: "12px",
                  overflow: "auto",
                  fontSize: "14px"
                }}>
                  {JSON.stringify(recommendations.recommendations || recommendations, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginTop: "30px"
        }}>
          <div style={{
            background: "rgba(255,255,255,0.95)",
            padding: "25px",
            borderRadius: "15px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}>
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>🤖</div>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "18px", fontWeight: "600" }}>AI-Powered Analysis</h3>
            <p style={{ margin: 0, color: "#666", fontSize: "14px", lineHeight: "1.6" }}>
              Advanced AI analyzes your submissions to identify patterns and weaknesses
            </p>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.95)",
            padding: "25px",
            borderRadius: "15px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}>
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>🎯</div>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "18px", fontWeight: "600" }}>Personalized Learning</h3>
            <p style={{ margin: 0, color: "#666", fontSize: "14px", lineHeight: "1.6" }}>
              Get recommendations tailored specifically to your skill level and needs
            </p>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.95)",
            padding: "25px",
            borderRadius: "15px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}>
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>📊</div>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "18px", fontWeight: "600" }}>Progress Tracking</h3>
            <p style={{ margin: 0, color: "#666", fontSize: "14px", lineHeight: "1.6" }}>
              Quality metrics help you understand your improvement over time
            </p>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
          color: "white",
          fontSize: "28px",
          cursor: "pointer",
          boxShadow: "0 8px 25px rgba(102, 126, 234, 0.5)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s"
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.1)";
          e.target.style.boxShadow = "0 12px 35px rgba(102, 126, 234, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.5)";
        }}
      >
        {chatOpen ? "✕" : "💬"}
      </button>

      {/* Chat Dialog */}
      {chatOpen && (
        <div style={{
          position: "fixed",
          bottom: "100px",
          right: "30px",
          width: "400px",
          maxWidth: "90vw",
          height: "500px",
          maxHeight: "70vh",
          background: "white",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}>
          {/* Chat Header */}
          <div style={{
            padding: "20px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            borderRadius: "20px 20px 0 0"
          }}>
            <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>
              💬 AI Assistant
            </h3>
            <p style={{ margin: "5px 0 0 0", fontSize: "14px", opacity: 0.9 }}>
              Ask me anything about DSA!
            </p>
          </div>

          {/* Chat Messages */}
          <div
            id="chat-messages"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              background: "#f8f9fa"
            }}
          >
            {chatMessages.length === 0 ? (
              <div style={{
                textAlign: "center",
                color: "#999",
                padding: "40px 20px"
              }}>
                <div style={{ fontSize: "48px", marginBottom: "10px" }}>👋</div>
                <p>Start a conversation!</p>
                <p style={{ fontSize: "14px", marginTop: "10px" }}>
                  Ask about algorithms, data structures, or problem-solving strategies.
                </p>
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: "15px",
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
                  }}
                >
                  <div style={{
                    maxWidth: "80%",
                    padding: "12px 16px",
                    borderRadius: "18px",
                    background: msg.role === "user"
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "white",
                    color: msg.role === "user" ? "white" : "#333",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    whiteSpace: "pre-wrap"
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {chatLoading && (
              <div style={{
                display: "flex",
                justifyContent: "flex-start",
                marginBottom: "15px"
              }}>
                <div style={{
                  padding: "12px 16px",
                  background: "white",
                  borderRadius: "18px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}>
                  <div style={{
                    display: "inline-block",
                    width: "20px",
                    height: "20px",
                    border: "3px solid #f3f3f3",
                    borderTop: "3px solid #667eea",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                  }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div style={{
            padding: "15px",
            borderTop: "1px solid #e0e0e0",
            background: "white",
            display: "flex",
            gap: "10px"
          }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !chatLoading && askBackend()}
              placeholder="Type your question..."
              disabled={chatLoading}
              style={{
                flex: 1,
                padding: "12px",
                border: "2px solid #e0e0e0",
                borderRadius: "25px",
                outline: "none",
                fontSize: "14px"
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
            />
            <button
              onClick={askBackend}
              disabled={chatLoading || !input.trim()}
              style={{
                padding: "12px 20px",
                background: chatLoading || !input.trim()
                  ? "#ccc"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "25px",
                cursor: chatLoading || !input.trim() ? "not-allowed" : "pointer",
                fontWeight: "600"
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "40px 20px",
        marginTop: "60px",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h3 style={{
            fontSize: "20px",
            fontWeight: "600",
            marginBottom: "15px",
            color: "white"
          }}>
            🎯 DSA Prep Agent
          </h3>
          <p style={{
            fontSize: "14px",
            color: "#ccc",
            marginBottom: "25px"
          }}>
            Automated DSA learning assistant powered by AI
          </p>
          
          <div style={{
            marginBottom: "25px",
            paddingBottom: "25px",
            borderBottom: "1px solid rgba(255,255,255,0.2)"
          }}>
            <h4 style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "15px"
            }}>
              Connect With Me
            </h4>
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              flexWrap: "wrap"
            }}>
              <a
                href="https://github.com/himu23"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  padding: "8px 16px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  transition: "all 0.3s"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.2)";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.1)";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                🔗 GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/himanshete/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  padding: "8px 16px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  transition: "all 0.3s"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.2)";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.1)";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                💼 LinkedIn
              </a>
              <a
                href="mailto:hmshete12@gmail.com"
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  padding: "8px 16px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  transition: "all 0.3s"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.2)";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.1)";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                📧 Email
              </a>
            </div>
          </div>
          
          <div style={{
            fontSize: "12px",
            color: "#999",
            lineHeight: "1.6"
          }}>
            <p style={{ margin: "5px 0" }}>
              © 2025 <strong>Himanshu Shete</strong>
            </p>
            <p style={{ margin: "5px 0" }}>
              B.Tech IIT Bombay '27 | Roll No: 23B0770
            </p>
            <p style={{ margin: "5px 0", fontSize: "11px", color: "#777" }}>
              All rights reserved. This project is developed as part of Software Engineering and Data Science assignments.
            </p>
          </div>
        </div>
      </footer>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
