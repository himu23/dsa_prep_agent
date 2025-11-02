# backend/app/cf_client.py
import requests
import time
from collections import defaultdict

BASE = "https://codeforces.com/api"

def fetch_user_submissions(handle, limit=20, recent_only=True):
    """Fetch user submissions with option to get only recent ones"""
    url = f"{BASE}/user.status?handle={handle}&from=1&count={limit if recent_only else 500}"
    r = requests.get(url, timeout=15)
    data = r.json()
    if data["status"] != "OK":
        return None
    
    subs = []
    for item in data["result"]:
        problem = item.get("problem", {})
        subs.append({
            "id": item.get("id"),
            "contestId": problem.get("contestId"),
            "index": problem.get("index"),
            "name": problem.get("name"),
            "tags": problem.get("tags", []),
            "verdict": item.get("verdict"),
            "rating": problem.get("rating"),
            "creationTimeSeconds": item.get("creationTimeSeconds")
        })
    
    # If recent_only, return only last N submissions
    if recent_only and len(subs) > limit:
        subs = sorted(subs, key=lambda x: x.get("creationTimeSeconds", 0), reverse=True)[:limit]
    
    return subs

def get_topic_statistics(handle, max_submissions=500):
    """
    Get statistics about solved problems by topic (like CF Analytics).
    This doesn't require AI calls - just processes Codeforces data.
    """
    url = f"{BASE}/user.status?handle={handle}&from=1&count={max_submissions}"
    r = requests.get(url, timeout=15)
    data = r.json()
    
    if data["status"] != "OK":
        return None
    
    # Statistics
    topic_stats = defaultdict(lambda: {"solved": 0, "attempted": 0, "failed": 0})
    rating_stats = defaultdict(int)
    verdict_stats = defaultdict(int)
    solved_problems = set()
    
    for item in data["result"]:
        problem = item.get("problem", {})
        verdict = item.get("verdict", "")
        problem_id = f"{problem.get('contestId')}{problem.get('index')}"
        tags = problem.get("tags", [])
        rating = problem.get("rating")
        
        # Track verdicts
        verdict_stats[verdict] += 1
        
        # Track rating distribution
        if rating:
            rating_stats[rating] += 1
        
        # Track by topic
        if tags:
            if verdict == "OK":
                solved_problems.add(problem_id)
                for tag in tags:
                    topic_stats[tag]["solved"] += 1
            else:
                for tag in tags:
                    if verdict in ["WRONG_ANSWER", "TIME_LIMIT_EXCEEDED", "RUNTIME_ERROR", "COMPILATION_ERROR"]:
                        topic_stats[tag]["failed"] += 1
                    topic_stats[tag]["attempted"] += 1
    
    # Calculate topic strengths/weaknesses
    topic_analysis = {}
    for tag, stats in topic_stats.items():
        total = stats["solved"] + stats["failed"]
        if total > 0:
            success_rate = stats["solved"] / total if total > 0 else 0
            topic_analysis[tag] = {
                "solved": stats["solved"],
                "failed": stats["failed"],
                "total_attempts": total,
                "success_rate": round(success_rate, 2),
                "strength": "strong" if success_rate > 0.7 else "medium" if success_rate > 0.4 else "weak"
            }
    
    return {
        "topic_stats": topic_analysis,
        "rating_distribution": dict(rating_stats),
        "verdict_distribution": dict(verdict_stats),
        "total_solved": len(solved_problems),
        "total_attempted": len(data["result"])
    }

def fetch_user_info(handle):
    """Get basic user information"""
    url = f"{BASE}/user.info?handles={handle}"
    try:
        r = requests.get(url, timeout=10)
        data = r.json()
        if data["status"] == "OK" and data["result"]:
            return data["result"][0]
    except:
        pass
    return None
