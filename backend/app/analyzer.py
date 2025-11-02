# backend/app/analyzer.py
import os
import requests
import json

GEMINI_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

_prompt_path = os.path.join(os.path.dirname(__file__), "..", "..", "prompts", "analyzer_prompt.txt")
ANALYZER_PROMPT = open(_prompt_path, encoding="utf-8").read()


def analyze_submission_with_llm(submission):
    tags = ", ".join(submission.get("tags", []))
    verdict = submission.get("verdict")
    context = f"Problem: {submission.get('name')}\nTags: {tags}\nVerdict: {verdict}\n"

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": ANALYZER_PROMPT.replace("<CONTEXT>", context)
                    }
                ]
            }
        ]
    }

    params = {"key": GEMINI_KEY}
    headers = {"Content-Type": "application/json"}

    r = requests.post(GEMINI_URL, params=params, json=payload, headers=headers, timeout=20)
    r.raise_for_status()
    resp = r.json()

    output = resp["candidates"][0]["content"]["parts"][0]["text"]

    try:
        return json.loads(output)  # expecting structured JSON from prompt
    except:
        return {"raw": output}
