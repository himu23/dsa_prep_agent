# backend/app/finetuned_analyzer.py
"""
Fine-tuned analyzer using LoRA for DSA submission analysis.
This is a parameter-efficient fine-tuning approach for the Data Science assignment.
"""
import os
import json
import requests

# Optional imports for fine-tuning (graceful fallback if not installed)
try:
    import torch
    from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
    from peft import PeftModel, LoraConfig, get_peft_model, TaskType
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("Warning: PyTorch/transformers not available. Fine-tuning features disabled.")

# Configuration
BASE_MODEL_NAME = "microsoft/DialoGPT-small"  # Smaller model for fine-tuning
FINETUNED_MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "lora_dsa_analyzer")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

# Load prompts
_prompt_path = os.path.join(os.path.dirname(__file__), "..", "..", "prompts", "analyzer_prompt.txt")
ANALYZER_PROMPT = open(_prompt_path, encoding="utf-8").read()

class FinetunedAnalyzer:
    """
    Fine-tuned model analyzer using LoRA for DSA problem analysis.
    Falls back to Gemini API if fine-tuned model is not available.
    """
    
    def __init__(self, use_finetuned=True):
        self.use_finetuned = use_finetuned
        self.tokenizer = None
        self.model = None
        
        if not TORCH_AVAILABLE:
            self.use_finetuned = False
            print("ℹ️ Using API-based analyzer (PyTorch/transformers not installed)")
        elif use_finetuned and os.path.exists(FINETUNED_MODEL_PATH):
            try:
                self._load_finetuned_model()
                print("✅ Loaded fine-tuned model")
            except Exception as e:
                print(f"⚠️ Could not load fine-tuned model: {e}, falling back to API")
                self.use_finetuned = False
        else:
            self.use_finetuned = False
            print("ℹ️ Using API-based analyzer (fine-tuned model not found)")
    
    def _load_finetuned_model(self):
        """Load the fine-tuned LoRA model"""
        # Load base model with quantization for efficiency
        quantization_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.float16
        )
        
        base_model = AutoModelForCausalLM.from_pretrained(
            BASE_MODEL_NAME,
            quantization_config=quantization_config,
            device_map="auto"
        )
        
        # Load LoRA weights
        if os.path.exists(FINETUNED_MODEL_PATH):
            self.model = PeftModel.from_pretrained(base_model, FINETUNED_MODEL_PATH)
        else:
            # If no fine-tuned model exists, create LoRA config
            lora_config = LoraConfig(
                task_type=TaskType.CAUSAL_LM,
                inference_mode=False,
                r=8,
                lora_alpha=32,
                lora_dropout=0.1,
                target_modules=["c_attn", "c_proj"]
            )
            self.model = get_peft_model(base_model, lora_config)
        
        self.tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_NAME)
        self.model.eval()
    
    def analyze_with_finetuned(self, submission):
        """Analyze submission using fine-tuned model"""
        tags = ", ".join(submission.get("tags", []))
        verdict = submission.get("verdict")
        context = f"Problem: {submission.get('name')}\nTags: {tags}\nVerdict: {verdict}\n"
        
        prompt = ANALYZER_PROMPT.replace("<CONTEXT>", context)
        
        # Tokenize and generate
        inputs = self.tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512)
        
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=200,
                temperature=0.7,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
        
        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract JSON from response
        try:
            # Try to extract JSON from the response
            json_start = response.find("{")
            json_end = response.rfind("}") + 1
            if json_start != -1 and json_end > json_start:
                json_str = response[json_start:json_end]
                return json.loads(json_str)
        except:
            pass
        
        return {"raw": response}
    
    def analyze_with_api(self, submission):
        """Fallback to Gemini API"""
        tags = ", ".join(submission.get("tags", []))
        verdict = submission.get("verdict")
        context = f"Problem: {submission.get('name')}\nTags: {tags}\nVerdict: {verdict}\n"
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": ANALYZER_PROMPT.replace("<CONTEXT>", context)
                }]
            }]
        }
        
        params = {"key": GEMINI_KEY}
        headers = {"Content-Type": "application/json"}
        
        r = requests.post(GEMINI_URL, params=params, json=payload, headers=headers, timeout=20)
        r.raise_for_status()
        resp = r.json()
        
        output = resp["candidates"][0]["content"]["parts"][0]["text"]
        
        try:
            return json.loads(output)
        except:
            return {"raw": output}
    
    def analyze(self, submission):
        """Main analyze method - uses fine-tuned model if available, else API"""
        if self.use_finetuned and self.model is not None:
            return self.analyze_with_finetuned(submission)
        else:
            return self.analyze_with_api(submission)

# Global instance
_finetuned_analyzer = None

def get_finetuned_analyzer(use_finetuned=True):
    """Get singleton instance of fine-tuned analyzer"""
    global _finetuned_analyzer
    if _finetuned_analyzer is None:
        _finetuned_analyzer = FinetunedAnalyzer(use_finetuned=use_finetuned)
    return _finetuned_analyzer

