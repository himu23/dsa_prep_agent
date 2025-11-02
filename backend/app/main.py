# backend/app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from .cf_client import fetch_user_submissions, fetch_problem_info
from .analyzer import analyze_submission_with_llm
from .finetuned_analyzer import get_finetuned_analyzer
from .planner import plan_next_problems
from .db import log_interaction
from .evaluator import AgentEvaluator

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize evaluator
evaluator = AgentEvaluator()

@app.get("/")
async def root():
    return {"message": "DSA Prep Agent FastAPI Backend", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

class HandleRequest(BaseModel):
    handle: str
    max_subs: int = 20

@app.post("/api/recommendations")
async def recommendations(req: HandleRequest):
    try:
        handle = req.handle
        use_finetuned = os.getenv("USE_FINETUNED_MODEL", "false").lower() == "true"
        
        subs = fetch_user_submissions(handle, limit=req.max_subs)
        if subs is None or len(subs) == 0:
            raise HTTPException(status_code=404, detail="User not found or no submissions.")

        # Analyze submissions (use fine-tuned model if available)
        analysis = []
        finetuned_analyzer = get_finetuned_analyzer(use_finetuned=use_finetuned) if use_finetuned else None
        
        for s in subs:
            try:
                # Use fine-tuned model if available, else use regular API
                if finetuned_analyzer and finetuned_analyzer.use_finetuned:
                    res = finetuned_analyzer.analyze(s)
                else:
                    res = analyze_submission_with_llm(s)
                
                analysis.append({**s, "analysis": res})
            except Exception as e:
                print(f"Analysis failed for submission {s.get('id')}: {e}")
                analysis.append({**s, "analysis": {"error": str(e)}})

        # Planner creates recommended problems
        recs = plan_next_problems(analysis)
        
        # Evaluate agent performance
        eval_result = evaluator.evaluate_agent_run(handle, subs, [a["analysis"] for a in analysis], recs)
        
        # Log
        try:
            log_interaction(handle, subs, analysis, recs)
        except Exception as e:
            print(f"Logging failed: {e}")
        
        return {
            "handle": handle, 
            "recommendations": recs,
            "evaluation": eval_result.get("metrics", {}),
            "model_used": "fine-tuned" if (finetuned_analyzer and finetuned_analyzer.use_finetuned) else "api"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/api/evaluation/stats")
async def get_evaluation_stats():
    """Get aggregate evaluation statistics"""
    stats = evaluator.get_aggregate_metrics()
    return stats
