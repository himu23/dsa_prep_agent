# backend/app/smart_planner.py
"""
Smart planner that uses topic statistics instead of analyzing every submission.
More efficient and avoids rate limits.
"""
import os
import requests
import json
import time

GEMINI_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

def generate_recommendations_from_stats(topic_stats, rating_dist, user_info, handle):
    """
    Generate recommendations based on topic statistics without analyzing every submission.
    This is much more efficient!
    """
    
    # Sort topics by weakness (low success rate)
    weak_topics = sorted(
        [(tag, stats) for tag, stats in topic_stats.items() if stats["strength"] == "weak"],
        key=lambda x: x[1]["success_rate"]
    )[:5]  # Top 5 weakest topics
    
    # Sort by medium topics (room for improvement)
    medium_topics = sorted(
        [(tag, stats) for tag, stats in topic_stats.items() if stats["strength"] == "medium"],
        key=lambda x: x[1]["success_rate"]
    )[:3]
    
    # Calculate average rating
    avg_rating = 0
    if rating_dist:
        ratings = [r * count for r, count in rating_dist.items()]
        counts = list(rating_dist.values())
        avg_rating = sum(ratings) // sum(counts) if counts else 0
    
    # Build prompt for recommendations
    prompt = f"""Based on Codeforces statistics for user {handle}:

Topic Performance:
"""
    
    for tag, stats in (weak_topics + medium_topics)[:8]:
        prompt += f"- {tag}: {stats['solved']} solved, {stats['failed']} failed, success rate {stats['success_rate']*100:.0f}% ({stats['strength']})\n"
    
    # Get user rating for context
    user_rating = user_info.get("rating", 0) if user_info else 0
    user_rank = user_info.get("rank", "unrated") if user_info else "unrated"
    
    prompt += f"""
User Rating: {user_rating} ({user_rank})
Average Problem Rating Solved: {avg_rating}
Total Solved: {len(topic_stats)}

Generate exactly 5 personalized problem recommendations as JSON with this structure:
{{
  "recommendations": [
    {{
      "title": "Problem name",
      "link": "https://codeforces.com/problemset/problem/XXXX/X or https://codeforces.com/problemset?tags=tag_name",
      "difficulty": "easy/medium/hard",
      "rating": 1200-2000 (actual problem rating number),
      "reason": "Why this helps (1-2 sentences)",
      "topic": "relevant topic"
    }}
  ]
}}

Include the actual problem rating (e.g., 1400, 1600) in the rating field.

Focus on:
1. Weak topics that need practice
2. Problems around {avg_rating} rating (slightly above for growth)
3. Balanced mix of topics
Return ONLY valid JSON, no other text.
"""
    
    # Call Gemini API with retry logic
    max_retries = 3
    for attempt in range(max_retries):
        try:
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 800
                }
            }
            
            params = {"key": GEMINI_KEY}
            headers = {"Content-Type": "application/json"}
            
            r = requests.post(GEMINI_URL, params=params, json=payload, headers=headers, timeout=30)
            
            if r.status_code == 429:
                # Rate limited - wait and retry
                wait_time = (2 ** attempt) * 2  # Exponential backoff: 2s, 4s, 8s
                print(f"Rate limited, waiting {wait_time}s before retry {attempt + 1}/{max_retries}...")
                time.sleep(wait_time)
                continue
            
            r.raise_for_status()
            resp = r.json()
            
            output = resp["candidates"][0]["content"]["parts"][0]["text"]
            
            # Extract JSON from response
            try:
                # Try to find JSON in the response
                json_start = output.find("{")
                json_end = output.rfind("}") + 1
                if json_start != -1 and json_end > json_start:
                    json_str = output[json_start:json_end]
                    result = json.loads(json_str)
                    
                    # Ensure it has the right structure
                    if "recommendations" not in result:
                        result = {"recommendations": result if isinstance(result, list) else []}
                    
                    return result
            except json.JSONDecodeError:
                pass
            
            # Fallback: return structured response
            return {
                "recommendations": [
                    {
                        "title": f"Practice {topic}",
                        "link": f"https://codeforces.com/problemset?tags={topic.lower().replace(' ', '+')}",
                        "difficulty": "medium",
                        "reason": f"Your {topic} success rate is {stats['success_rate']*100:.0f}%, practice needed",
                        "topic": topic
                    }
                    for topic, stats in weak_topics[:5]
                ]
            }
            
        except requests.exceptions.HTTPError as e:
            if e.response and e.response.status_code == 429:
                if attempt < max_retries - 1:
                    wait_time = (2 ** attempt) * 2
                    print(f"Rate limited, waiting {wait_time}s...")
                    time.sleep(wait_time)
                    continue
                else:
                    # Final attempt failed - return fallback recommendations
                    return generate_fallback_recommendations(weak_topics, avg_rating)
            raise
        except Exception as e:
            print(f"Error generating recommendations: {e}")
            if attempt == max_retries - 1:
                return generate_fallback_recommendations(weak_topics, avg_rating)
    
    # If all retries failed
    return generate_fallback_recommendations(weak_topics, avg_rating)

def generate_fallback_recommendations(weak_topics, avg_rating):
    """Generate recommendations without API when rate limited"""
    recommendations = []
    
    # Determine difficulty based on avg_rating
    def get_rating_range(avg):
        if avg < 1200:
            return 1200
        elif avg < 1600:
            return avg + 100
        elif avg < 2000:
            return avg + 50
        else:
            return avg
    
    target_rating = get_rating_range(avg_rating)
    
    for topic, stats in weak_topics[:5]:
        recommendations.append({
            "title": f"Practice {topic}",
            "link": f"https://codeforces.com/problemset?tags={topic.lower().replace(' ', '+')}",
            "difficulty": "medium",
            "rating": target_rating,
            "reason": f"Your {topic} success rate is {stats['success_rate']*100:.0f}%. Focus on this topic to improve.",
            "topic": topic
        })
    
    # Fill remaining slots with general recommendations
    if len(recommendations) < 5:
        general_tags = ["implementation", "greedy", "math", "brute force", "sortings"]
        for tag in general_tags:
            if len(recommendations) >= 5:
                break
            if not any(r["topic"].lower() == tag for r in recommendations):
                recommendations.append({
                    "title": f"Practice {tag.title()}",
                    "link": f"https://codeforces.com/problemset?tags={tag}",
                    "difficulty": "medium",
                    "rating": target_rating,
                    "reason": f"General practice in {tag} will strengthen your foundation.",
                    "topic": tag
                })
    
    return {"recommendations": recommendations[:5]}

