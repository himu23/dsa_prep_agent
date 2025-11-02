# DSA Prep Agent

A comprehensive DSA (Data Structures and Algorithms) preparation tool with AI-powered chat assistance and personalized problem recommendations based on Codeforces submissions.

**Project for Software Engineering & Data Science Assignments**

This project implements an AI agent that automates the analysis of DSA submissions and generates personalized learning recommendations. It features multi-agent collaboration, fine-tuned models, and comprehensive evaluation metrics.

---

## Assignment Information

**Name**: [Your Name]  
**University**: [Your University]  
**Department**: [Your Department]

**Assignments Completed**:
1. **Software Engineering Assignment**: AI Agent Prototype with reasoning, planning, and execution
2. **Data Science Assignment**: Fine-tuned model (LoRA) with evaluation metrics

## Features

### Core Features

- **AI Chat**: Get help with DSA concepts, problem-solving strategies, and coding questions using Google Gemini AI
- **Personalized Recommendations**: Enter your Codeforces handle to analyze your submissions and get tailored problem recommendations
- **Multi-Agent Collaboration**: Analyzer Agent + Planner Agent work together to provide comprehensive analysis
- **Fine-Tuned Model**: LoRA-based fine-tuning for specialized DSA analysis (Data Science Assignment)
- **Evaluation Metrics**: Comprehensive evaluation system measuring quality and reliability (Data Science Assignment)
- **External Integrations**: Codeforces API, Gemini API, OpenAI API (optional)

## Project Structure

```
dsa_prep_agent/
├── frontend/          # Next.js frontend application
├── backend/           # Backend services
│   ├── app/          # Python FastAPI application
│   └── server.js     # Node.js Express API server
├── prompts/          # AI prompts for analysis and planning
└── docs/             # Documentation

```

## Prerequisites

- **Node.js** (v14 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**

## Setup

### 1. Backend Setup

#### Node.js Backend (Port 5000)

```bash
cd backend
npm install
```

#### Python Backend (Port 8000)

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here  # Optional, will fallback to Gemini if not provided
USE_FINETUNED_MODEL=false  # Set to true to use fine-tuned model (requires trained model)
```

**Note**: The planner will use OpenAI if available, otherwise it will automatically fallback to Gemini. Only `GEMINI_API_KEY` is required.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Start All Services

You'll need to run three services:

#### Terminal 1: Node.js Backend (Port 5000)
```bash
cd backend
npm start
```

#### Terminal 2: Python FastAPI Backend (Port 8000)
```bash
cd backend
python run_python_server.py
```

Or using uvicorn directly:
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Terminal 3: Frontend (Port 3000)
```bash
cd frontend
npm run dev
```

### Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Node.js API**: http://localhost:5000
- **Python API**: http://localhost:8000
- **Python API Docs**: http://localhost:8000/docs (FastAPI automatic documentation)

## API Endpoints

### Node.js Backend (Port 5000)

- `POST /api/generate` - Generate AI responses using Gemini

### Python Backend (Port 8000)

- `GET /` - API status
- `GET /health` - Health check
- `POST /api/recommendations` - Get personalized DSA recommendations
  - Body: `{ "handle": "codeforces_handle", "max_subs": 20 }`
  - Returns: Recommendations + evaluation metrics
- `GET /api/evaluation/stats` - Get aggregate evaluation statistics

## Usage

1. **AI Chat Tab**: 
   - Type any question about DSA, algorithms, or problem-solving
   - Get instant AI-powered responses

2. **DSA Recommendations Tab**:
   - Enter a Codeforces handle (e.g., "tourist", "Petr")
   - Click "Get Recommendations"
   - The system will analyze recent submissions and provide personalized problem recommendations

## Troubleshooting

### Backend API Returns 404
- Check that `GEMINI_API_KEY` is correctly set in `backend/.env`
- Verify the API key is valid and has proper permissions
- Ensure the backend servers are running on the correct ports

### Python Backend Import Errors
- Make sure you've installed all requirements: `pip install -r requirements.txt`
- Check that you're running the server from the correct directory
- Verify Python version is 3.8+

### Frontend Can't Connect to Backend
- Ensure both backend servers are running
- Check CORS settings if accessing from a different origin
- Verify the ports (5000 for Node.js, 8000 for Python) are not in use

## Fine-Tuning (Data Science Assignment)

### Prepare Training Data

```bash
cd backend
python finetune_train.py --prepare-data
```

This creates sample training data at `backend/training_data/dsa_training_data.jsonl`. You can add more examples to this file.

### Train Fine-Tuned Model

```bash
cd backend
python finetune_train.py --epochs 3 --batch-size 4 --learning-rate 2e-4
```

The model will be saved to `backend/models/lora_dsa_analyzer/`.

### Enable Fine-Tuned Model

Set `USE_FINETUNED_MODEL=true` in `backend/.env` to use the fine-tuned model instead of API.

**Note**: Fine-tuning requires:
- GPU recommended (CUDA) for faster training
- At least 4GB GPU memory (with 4-bit quantization)
- Can train on CPU but will be slower

## Evaluation System

The agent automatically evaluates all runs using comprehensive metrics:

- **Analysis Quality Metrics**:
  - Completeness: Field presence
  - Relevance: Topic-tag alignment
  - Structured Output: JSON validity
  - Verdict Alignment: Analysis-submission match
  - Difficulty Consistency: Valid difficulty levels

- **Recommendation Quality Metrics**:
  - Recommendation Count: Optimal number (5)
  - Completeness: Required fields present
  - Link Validity: Codeforces URLs

- **Overall Agent Score**: Weighted combination of all metrics

View evaluation statistics at: `GET /api/evaluation/stats`

## Documentation

- **Software Engineering Assignment**: See `docs/SE_System_Design.md`
  - System architecture
  - Multi-agent collaboration
  - Technology choices and rationale
  - Data design

- **Data Science Assignment**: See `docs/DS_FineTuning_Report.md`
  - Fine-tuning methodology (LoRA)
  - Training setup and results
  - Evaluation methodology
  - Quantitative and qualitative results

## Assignment Requirements Coverage

### Software Engineering Assignment ✅

- ✅ **Core Features**: AI agent with reasoning, planning, and execution
- ✅ **Multi-Agent Collaboration**: Analyzer Agent + Planner Agent
- ✅ **External Integrations**: Codeforces API, Gemini API, OpenAI API
- ✅ **User Interface**: Modern web UI with tabs for chat and recommendations
- ✅ **System Design Document**: Comprehensive architecture documentation

### Data Science Assignment ✅

- ✅ **Core Features**: Fine-tuned model using LoRA (parameter-efficient tuning)
- ✅ **Fine-Tuning Target**: DSA submission analysis specialization
- ✅ **Evaluation Metrics**: Comprehensive quantitative and qualitative metrics
- ✅ **Integration**: Fine-tuned model integrated into agent pipeline
- ✅ **Documentation**: Fine-tuning report with methodology and results

## Technology Stack

- **Frontend**: Next.js, React
- **Backend**: 
  - Node.js with Express (for simple AI chat)
  - Python with FastAPI (for DSA recommendations)
- **AI/ML**: 
  - Google Gemini API
  - OpenAI API (optional)
  - Fine-tuned models with LoRA (PEFT)
  - Transformers library
- **Data**: Codeforces API
- **Evaluation**: Custom evaluation framework with multiple metrics

## License

ISC

## Contact

For questions or issues, please refer to the assignment submission requirements.

#   d s a _ p r e p _ a g e n t  
 