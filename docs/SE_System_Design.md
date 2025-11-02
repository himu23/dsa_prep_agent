# Software Engineering Assignment: System Design Document

## Project Overview

**Project Name**: DSA Prep Agent  
**Purpose**: An AI agent that automates the manual task of analyzing Data Structures and Algorithms (DSA) submissions and generating personalized learning recommendations.

## Manual Task Being Automated

### Original Manual Process

**Task**: Analyzing Codeforces submission history to identify learning gaps and recommend next problems

**Manual Steps**:
1. Visit Codeforces profile
2. Review recent submissions
3. Identify patterns in failures (wrong answers, timeouts)
4. Determine topics that need practice
5. Search for appropriate problems to practice next
6. Manually curate a list of recommended problems

**Time Investment**: 30-60 minutes per analysis session  
**Frequency**: Weekly or bi-weekly

### Automated Solution

The DSA Prep Agent automates this entire workflow:
1. Fetches submission history via Codeforces API
2. Analyzes each submission using AI
3. Identifies learning gaps and patterns
4. Generates personalized problem recommendations
5. Provides structured insights and action items

**Time Saved**: 30-60 minutes reduced to 30 seconds

## System Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Frontend      │
│  (Next.js)      │
│   Port: 3000    │
└────────┬────────┘
         │
         ├─────────────────┬─────────────────┐
         │                 │                 │
┌────────▼────────┐ ┌──────▼──────┐ ┌──────▼──────┐
│  Node.js API    │ │  FastAPI    │ │   Gemini    │
│  (Express)      │ │  Backend    │ │   API       │
│  Port: 5000     │ │  Port: 8000 │ │             │
└─────────────────┘ └──────┬──────┘ └─────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
┌────────▼────────┐ ┌──────▼──────┐ ┌──────▼──────┐
│   Analyzer      │ │   Planner   │ │  Codeforces │
│   Agent         │ │   Agent     │ │   API       │
└─────────────────┘ └─────────────┘ └─────────────┘
```

### Component Breakdown

#### 1. Frontend (Next.js)
- **Technology**: Next.js 13, React 18
- **Purpose**: User interface for interacting with the agent
- **Features**:
  - AI Chat interface for general DSA questions
  - DSA Recommendations interface for personalized analysis
  - Real-time feedback and loading states

#### 2. Node.js Backend (Express)
- **Technology**: Express.js, Axios
- **Purpose**: Simple API gateway for AI chat
- **Responsibilities**:
  - Handle chat requests
  - Proxy to Gemini API
  - Provide quick responses for general queries

#### 3. Python FastAPI Backend
- **Technology**: FastAPI, Python
- **Purpose**: Core agent orchestration and multi-agent collaboration
- **Responsibilities**:
  - Coordinate multi-agent workflow
  - Manage data flow between agents
  - Handle complex reasoning tasks

#### 4. Analyzer Agent
- **Technology**: Fine-tuned LLM (LoRA) + Gemini API fallback
- **Purpose**: Analyze individual submissions
- **Capabilities**:
  - Extract topics from problems
  - Identify likely issues
  - Infer difficulty levels
  - Generate structured analysis

#### 5. Planner Agent
- **Technology**: OpenAI GPT-4o-mini / Gemini API
- **Purpose**: Generate personalized recommendations
- **Capabilities**:
  - Synthesize analysis from multiple submissions
  - Identify learning patterns
  - Generate tailored problem recommendations
  - Provide reasoning for recommendations

#### 6. Codeforces Client
- **Technology**: Python requests
- **Purpose**: External integration with Codeforces API
- **Responsibilities**:
  - Fetch user submissions
  - Retrieve problem metadata
  - Handle API rate limiting

## Multi-Agent Collaboration

### Agent Communication Flow

```
User Input (Codeforces Handle)
    ↓
FastAPI Backend (Orchestrator)
    ↓
┌─────────────────────────────────────┐
│  Codeforces Client                  │
│  - Fetches submissions              │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  Analyzer Agent (Parallel)          │
│  - Analyzes each submission         │
│  - Returns structured analysis      │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  Planner Agent                      │
│  - Receives all analyses            │
│  - Synthesizes patterns             │
│  - Generates recommendations        │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  Evaluator                          │
│  - Measures quality                 │
│  - Tracks reliability               │
└────────────┬────────────────────────┘
             ↓
Response to User
```

### Reasoning, Planning, and Execution

**1. Reasoning (Analyzer Agent)**:
- Analyzes each submission individually
- Reasons about likely causes of failures
- Identifies knowledge gaps

**2. Planning (Planner Agent)**:
- Synthesizes patterns across submissions
- Plans learning trajectory
- Selects appropriate problems for skill development

**3. Execution**:
- Fetches data from external APIs
- Coordinates agent workflows
- Generates actionable recommendations

## Data Design

### Data Flow

```
Codeforces API → Submissions → Analyzer → Analysis → Planner → Recommendations → User
```

### Data Structures

**Submission Object**:
```json
{
  "id": 123456,
  "contestId": 4,
  "index": "A",
  "name": "Watermelon",
  "tags": ["math", "brute force"],
  "verdict": "OK",
  "creationTimeSeconds": 1234567890
}
```

**Analysis Object**:
```json
{
  "topics": ["math", "brute force"],
  "likely_issue": "No issues, solved correctly",
  "difficulty_inference": "easy",
  "recommendation_reason": "Good problem for beginners"
}
```

**Recommendations Object**:
```json
{
  "recommendations": [
    {
      "title": "Two Sum",
      "link": "https://codeforces.com/problemset/problem/...",
      "difficulty": "easy",
      "reason": "Practice hash maps and edge cases"
    }
  ]
}
```

### Storage

- **Logs**: JSONL files for interaction history
- **Evaluation Results**: JSONL files for metrics tracking
- **Training Data**: JSONL files for fine-tuning

## Technology Choices and Rationale

### Frontend: Next.js
- **Why**: Fast development, server-side rendering, great React ecosystem
- **Alternative Considered**: Plain React - but Next.js offers better performance

### Backend: Express + FastAPI
- **Why Express**: Simple, fast setup for basic API endpoints
- **Why FastAPI**: 
  - Excellent async support for parallel agent processing
  - Automatic API documentation
  - Type hints and validation
  - Great Python ecosystem for ML/AI

### AI Models
- **Gemini 1.5 Flash**: Fast, cost-effective for general chat
- **Fine-tuned Model (LoRA)**: Specialized for structured DSA analysis
- **OpenAI GPT-4o-mini**: Alternative for planning (fallback to Gemini)

### Fine-Tuning: LoRA
- **Why**: Parameter-efficient, memory-efficient, fast training
- **Alternative**: Full fine-tuning - rejected due to resource requirements

## External Integrations

### Codeforces API
- **Purpose**: Fetch user submissions and problem data
- **Integration Type**: REST API
- **Rate Limiting**: Handled with timeout and retry logic

### Gemini API
- **Purpose**: General AI chat and fallback for planning
- **Integration Type**: REST API
- **Error Handling**: Graceful fallback to alternative models

### OpenAI API (Optional)
- **Purpose**: Planning agent (better structured output)
- **Integration Type**: REST API
- **Fallback**: Automatically falls back to Gemini if unavailable

## User Interface Design

### Design Philosophy
The UI is designed with **modern UX principles** focusing on:
- **Visual Hierarchy**: Clear primary action (recommendations) on main page
- **Accessibility**: Easy-to-read fonts, high contrast, keyboard navigation
- **Responsiveness**: Works on various screen sizes
- **Feedback**: Loading states, error messages, success indicators
- **Aesthetics**: Modern gradient design, smooth animations, professional appearance

### Main Page (Recommendations)
- **Primary Focus**: DSA recommendations feature prominently
- **Design**: 
  - Hero section with gradient background
  - Large, clear input field for Codeforces handle
  - Prominent call-to-action button
  - Cards showing quality metrics with visual indicators
  - Recommendation cards with hover effects
  - Info cards explaining features
- **UX Features**: 
  - Loading animations during analysis
  - Real-time error feedback
  - Color-coded difficulty badges
  - Direct links to Codeforces problems
  - Responsive grid layout

### Floating Chat Interface
- **Location**: Bottom-right corner as floating dialog
- **Design**: 
  - Circular floating button (60px) with gradient background
  - Expandable chat dialog (400px width, 500px height)
  - Conversation-style message bubbles
  - User messages (right-aligned, purple gradient)
  - AI messages (left-aligned, white background)
  - Smooth open/close animations
- **UX Features**:
  - Auto-scroll to latest messages
  - Loading indicator for AI responses
  - Empty state with helpful guidance
  - Keyboard support (Enter to send)
  - Mobile-responsive sizing

## Operational Features

### Monitoring
- Evaluation metrics tracked automatically
- Interaction logs saved for analysis
- Error logging and tracking

### Scalability Considerations
- Stateless backend design
- Parallel agent processing
- Efficient model loading (singleton pattern)
- Caching strategies for API responses

## Security Considerations

- API keys stored in environment variables
- CORS configured for frontend only
- Input validation on all endpoints
- Rate limiting considerations (Codeforces API)

## Deployment Considerations

- **Development**: Local services on different ports
- **Production**: Would require:
  - Containerization (Docker)
  - Reverse proxy (nginx)
  - Environment variable management
  - Monitoring and logging infrastructure

## Social Impact and Originality

### Social Impact
- **Educational**: Makes DSA learning more accessible and efficient
- **Time Savings**: Reduces time spent on manual analysis by 95%
- **Personalization**: Provides tailored learning paths
- **Accessibility**: Democratizes high-quality DSA coaching

### Originality
- **Multi-agent collaboration** for DSA learning
- **Fine-tuned model** specialized for competitive programming
- **Automated analysis** of submission patterns
- **Integration** of multiple external APIs with reasoning

## Conclusion

The DSA Prep Agent successfully automates the manual task of analyzing DSA submissions and generating recommendations through a multi-agent architecture. The system demonstrates reasoning, planning, and execution capabilities while providing an intuitive user interface and robust error handling.

