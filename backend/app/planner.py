# backend/app/planner.py
import os, requests, json
OPENAI_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_URL = "https://api.openai.com/v1/chat/completions"
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

_prompt_path = os.path.join(os.path.dirname(__file__), "..", "..", "prompts", "planner_prompt.txt")
PLANNER_PROMPT = open(_prompt_path, encoding="utf-8").read()

def plan_next_problems(analysis_list):
    # create compact context
    combined = ""
    for a in analysis_list:
        name = a.get("name"); tags = ", ".join(a.get("tags", []))
        combined += f"Problem: {name}\nTags: {tags}\nAnalysis: {a.get('analysis')}\n\n"
    
    prompt_text = PLANNER_PROMPT.replace("<ANALYSIS>", combined)
    
    # Try OpenAI first, fallback to Gemini if not available
    if OPENAI_KEY:
        try:
            payload = {
              "model": "gpt-4o-mini",
              "messages": [
                {"role":"system", "content":"You are a DSA Planner assistant."},
                {"role":"user", "content": prompt_text}
              ],
              "max_tokens": 600,
              "temperature": 0.3
            }
            headers = {"Authorization": f"Bearer {OPENAI_KEY}", "Content-Type":"application/json"}
            r = requests.post(OPENAI_URL, json=payload, headers=headers, timeout=30)
            r.raise_for_status()
            resp = r.json()
            content = resp["choices"][0]["message"]["content"]
            try:
                return json.loads(content)
            except:
                return {"raw": content}
        except Exception as e:
            print(f"OpenAI failed: {e}, trying Gemini...")
    
    # Fallback to Gemini
    if GEMINI_KEY:
        try:
            payload = {
                "contents": [{"parts": [{"text": prompt_text}]}]
            }
            params = {"key": GEMINI_KEY}
            headers = {"Content-Type": "application/json"}
            r = requests.post(GEMINI_URL, params=params, json=payload, headers=headers, timeout=30)
            r.raise_for_status()
            resp = r.json()
            content = resp["candidates"][0]["content"]["parts"][0]["text"]
            try:
                return json.loads(content)
            except:
                return {"raw": content}
        except Exception as e:
            return {"error": f"Both APIs failed. Gemini error: {e}"}
    
    return {"error": "No API keys configured"}
