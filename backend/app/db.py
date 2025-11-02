# backend/app/db.py
import json, time, os
LOGFILE = os.path.join(os.path.dirname(__file__), "..", "logs.jsonl")

def log_interaction(handle, subs, analysis, recs):
    try:
        # Ensure the log file directory exists
        log_dir = os.path.dirname(LOGFILE)
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir, exist_ok=True)
        
        entry = {
            "time": int(time.time()),
            "handle": handle,
            "subs_count": len(subs),
            "analysis_sample": analysis[:3],
            "recommendations": recs
        }
        with open(LOGFILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry) + "\n")
    except Exception as e:
        print(f"Warning: Failed to write log: {e}")
