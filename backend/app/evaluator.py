# backend/app/evaluator.py
"""
Evaluation metrics for the DSA Prep Agent.
Measures quality and reliability of agent outputs.
"""
import json
import os
from typing import List, Dict, Any
from datetime import datetime

class AgentEvaluator:
    """
    Evaluates the quality of the DSA Prep Agent's outputs using multiple metrics.
    """
    
    def __init__(self):
        self.metrics_history = []
        self.eval_results_path = os.path.join(
            os.path.dirname(__file__), "..", "evaluation_results.jsonl"
        )
    
    def evaluate_analysis(self, submission: Dict, analysis: Dict, ground_truth: Dict = None) -> Dict[str, float]:
        """
        Evaluate the quality of a single analysis.
        
        Args:
            submission: Original submission data
            analysis: Analysis output from the agent
            ground_truth: Optional ground truth for comparison
            
        Returns:
            Dictionary of metric scores
        """
        metrics = {}
        
        # 1. Completeness Score: Check if all expected fields are present
        expected_fields = ["topics", "likely_issue", "difficulty_inference", "recommendation_reason"]
        present_fields = [field for field in expected_fields if field in analysis or field.lower() in str(analysis).lower()]
        metrics["completeness"] = len(present_fields) / len(expected_fields)
        
        # 2. Relevance Score: Check if topics match problem tags
        if "topics" in analysis and "tags" in submission:
            analysis_topics = set(str(analysis.get("topics", [])).lower().split())
            problem_tags = set([tag.lower() for tag in submission.get("tags", [])])
            
            if len(problem_tags) > 0:
                overlap = len(analysis_topics.intersection(problem_tags))
                metrics["relevance"] = overlap / max(len(problem_tags), 1)
            else:
                metrics["relevance"] = 0.5  # Neutral if no tags
        else:
            metrics["relevance"] = 0.0
        
        # 3. Structured Output Score: Check if output is valid JSON/structured
        is_structured = isinstance(analysis, dict) and "raw" not in analysis
        metrics["structured_output"] = 1.0 if is_structured else 0.0
        
        # 4. Verdict Alignment: Check if analysis considers the verdict
        if "verdict" in submission and "likely_issue" in analysis:
            verdict = submission.get("verdict", "").lower()
            issue = str(analysis.get("likely_issue", "")).lower()
            
            # If verdict is OK, issue should be positive or about improvement
            if "ok" in verdict or "accepted" in verdict:
                positive_words = ["good", "correct", "optimal", "efficient", "improve"]
                metrics["verdict_alignment"] = 1.0 if any(word in issue for word in positive_words) else 0.5
            else:
                # If verdict is wrong, issue should identify a problem
                problem_words = ["wrong", "error", "fail", "issue", "problem", "mistake"]
                metrics["verdict_alignment"] = 1.0 if any(word in issue for word in problem_words) else 0.5
        else:
            metrics["verdict_alignment"] = 0.5
        
        # 5. Difficulty Consistency: Check if difficulty makes sense
        if "difficulty_inference" in analysis:
            diff = str(analysis.get("difficulty_inference", "")).lower()
            valid_difficulties = ["easy", "medium", "hard"]
            metrics["difficulty_consistency"] = 1.0 if any(d in diff for d in valid_difficulties) else 0.0
        else:
            metrics["difficulty_consistency"] = 0.0
        
        # 6. Response Length: Penalize too short or too long responses
        analysis_str = json.dumps(analysis, default=str)
        length = len(analysis_str)
        if 100 <= length <= 1000:
            metrics["length_appropriateness"] = 1.0
        elif length < 50:
            metrics["length_appropriateness"] = 0.3  # Too short
        elif length > 2000:
            metrics["length_appropriateness"] = 0.7  # Too long
        else:
            metrics["length_appropriateness"] = 0.8
        
        # Overall quality score (weighted average)
        weights = {
            "completeness": 0.25,
            "relevance": 0.20,
            "structured_output": 0.15,
            "verdict_alignment": 0.20,
            "difficulty_consistency": 0.10,
            "length_appropriateness": 0.10
        }
        
        metrics["overall_quality"] = sum(
            metrics.get(key, 0) * weights.get(key, 0) 
            for key in weights.keys()
        )
        
        return metrics
    
    def evaluate_recommendations(self, recommendations: Dict, user_handle: str) -> Dict[str, float]:
        """
        Evaluate the quality of recommendations.
        
        Args:
            recommendations: Recommendations output
            user_handle: User's Codeforces handle
            
        Returns:
            Dictionary of metric scores
        """
        metrics = {}
        
        # Check if recommendations structure is valid
        if "recommendations" in recommendations:
            recs = recommendations["recommendations"]
            if isinstance(recs, list):
                recs_list = recs
            elif isinstance(recs, dict) and "recommendations" in recs:
                recs_list = recs["recommendations"]
            else:
                recs_list = []
        else:
            recs_list = []
        
        # 1. Count of recommendations
        metrics["recommendation_count"] = len(recs_list)
        metrics["recommendation_count_score"] = min(len(recs_list) / 5.0, 1.0)  # Ideal is 5
        
        # 2. Completeness of each recommendation
        if recs_list:
            required_fields = ["title", "link", "reason"]
            completeness_scores = []
            
            for rec in recs_list:
                if isinstance(rec, dict):
                    present = sum(1 for field in required_fields if field in rec)
                    completeness_scores.append(present / len(required_fields))
                else:
                    completeness_scores.append(0.0)
            
            metrics["recommendation_completeness"] = sum(completeness_scores) / len(completeness_scores) if completeness_scores else 0.0
        else:
            metrics["recommendation_completeness"] = 0.0
        
        # 3. Link validity (check if links are Codeforces URLs)
        if recs_list:
            valid_links = 0
            for rec in recs_list:
                if isinstance(rec, dict) and "link" in rec:
                    link = str(rec["link"])
                    if "codeforces.com" in link.lower():
                        valid_links += 1
            
            metrics["link_validity"] = valid_links / len(recs_list) if recs_list else 0.0
        else:
            metrics["link_validity"] = 0.0
        
        # Overall recommendation quality
        metrics["recommendation_quality"] = (
            metrics["recommendation_count_score"] * 0.4 +
            metrics["recommendation_completeness"] * 0.4 +
            metrics["link_validity"] * 0.2
        )
        
        return metrics
    
    def evaluate_agent_run(self, handle: str, submissions: List[Dict], 
                          analyses: List[Dict], recommendations: Dict) -> Dict[str, Any]:
        """
        Evaluate a complete agent run.
        
        Returns comprehensive evaluation metrics.
        """
        eval_result = {
            "timestamp": datetime.now().isoformat(),
            "handle": handle,
            "submission_count": len(submissions),
            "metrics": {}
        }
        
        # Evaluate all analyses
        analysis_metrics = []
        for sub, analysis in zip(submissions, analyses):
            metrics = self.evaluate_analysis(sub, analysis)
            analysis_metrics.append(metrics)
        
        # Aggregate analysis metrics
        if analysis_metrics:
            eval_result["metrics"]["analysis"] = {
                "average_completeness": sum(m["completeness"] for m in analysis_metrics) / len(analysis_metrics),
                "average_relevance": sum(m["relevance"] for m in analysis_metrics) / len(analysis_metrics),
                "average_structured_output": sum(m["structured_output"] for m in analysis_metrics) / len(analysis_metrics),
                "average_verdict_alignment": sum(m["verdict_alignment"] for m in analysis_metrics) / len(analysis_metrics),
                "average_overall_quality": sum(m["overall_quality"] for m in analysis_metrics) / len(analysis_metrics),
            }
        
        # Evaluate recommendations
        rec_metrics = self.evaluate_recommendations(recommendations, handle)
        eval_result["metrics"]["recommendations"] = rec_metrics
        
        # Overall agent score
        analysis_score = eval_result["metrics"]["analysis"]["average_overall_quality"] if analysis_metrics else 0.0
        rec_score = rec_metrics.get("recommendation_quality", 0.0)
        eval_result["metrics"]["overall_agent_score"] = analysis_score * 0.6 + rec_score * 0.4
        
        # Save to history
        self.metrics_history.append(eval_result)
        self._save_evaluation(eval_result)
        
        return eval_result
    
    def _save_evaluation(self, eval_result: Dict):
        """Save evaluation result to file"""
        try:
            with open(self.eval_results_path, "a", encoding="utf-8") as f:
                f.write(json.dumps(eval_result) + "\n")
        except Exception as e:
            print(f"Warning: Failed to save evaluation: {e}")
    
    def get_aggregate_metrics(self) -> Dict[str, Any]:
        """Get aggregate metrics across all evaluations"""
        if not self.metrics_history:
            return {"message": "No evaluations yet"}
        
        all_analysis_qualities = [
            m["metrics"]["analysis"]["average_overall_quality"]
            for m in self.metrics_history
            if "analysis" in m.get("metrics", {})
        ]
        
        all_rec_qualities = [
            m["metrics"]["recommendations"]["recommendation_quality"]
            for m in self.metrics_history
            if "recommendations" in m.get("metrics", {})
        ]
        
        return {
            "total_evaluations": len(self.metrics_history),
            "average_analysis_quality": sum(all_analysis_qualities) / len(all_analysis_qualities) if all_analysis_qualities else 0.0,
            "average_recommendation_quality": sum(all_rec_qualities) / len(all_rec_qualities) if all_rec_qualities else 0.0,
            "reliability_score": sum(m["metrics"]["overall_agent_score"] for m in self.metrics_history) / len(self.metrics_history)
        }

