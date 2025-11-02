# backend/app/cf_client.py
import requests, time

BASE = "https://codeforces.com/api"

def fetch_user_submissions(handle, limit=20):
    url = f"{BASE}/user.status?handle={handle}&from=1&count={limit}"
    r = requests.get(url, timeout=10)
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
            "tags": problem.get("tags"),
            "verdict": item.get("verdict"),
            "language": item.get("program",{}).get("language") if item.get("program") else None,
            # no code via public API; user can upload codefile later
            "creationTimeSeconds": item.get("creationTimeSeconds")
        })
    return subs

def fetch_problem_info(contestId, index):
    # small helper if you want detailed problem metadata
    url = f"{BASE}/problemset.problems"
    r = requests.get(url).json()
    # For speed, prefer caching list or use different approach
    return None
