#!/usr/bin/env python3
"""
Fine-tuning script for DSA Analyzer using LoRA (Low-Rank Adaptation).
This script fine-tunes a base language model to specialize in analyzing DSA submissions.
"""
import os
import json
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM, 
    TrainingArguments, 
    Trainer,
    BitsAndBytesConfig
)
from peft import LoraConfig, get_peft_model, TaskType, prepare_model_for_kbit_training
from datasets import Dataset as HFDataset
import argparse

# Configuration
BASE_MODEL = "microsoft/DialoGPT-small"  # Lightweight model suitable for fine-tuning
OUTPUT_DIR = "./models/lora_dsa_analyzer"
DATA_DIR = "./training_data"

class DSAAnalysisDataset(Dataset):
    """Dataset for DSA submission analysis"""
    
    def __init__(self, data_path, tokenizer, max_length=512):
        self.tokenizer = tokenizer
        self.max_length = max_length
        
        # Load training data
        if os.path.exists(data_path):
            with open(data_path, 'r', encoding='utf-8') as f:
                self.data = [json.loads(line) for line in f]
        else:
            print(f"Warning: {data_path} not found. Creating sample dataset.")
            self.data = self._create_sample_data()
    
    def _create_sample_data(self):
        """Create sample training data if file doesn't exist"""
        return [
            {
                "input": "Problem: Watermelon\nTags: math, brute force\nVerdict: OK",
                "output": '{"topics": ["math", "brute force"], "likely_issue": "No issues, solved correctly", "difficulty_inference": "easy", "recommendation_reason": "Good problem for beginners"}'
            },
            {
                "input": "Problem: Two Sum\nTags: arrays, hashing\nVerdict: WRONG_ANSWER",
                "output": '{"topics": ["arrays", "hashing"], "likely_issue": "Did not handle edge cases or hash map implementation error", "difficulty_inference": "easy", "recommendation_reason": "Practice hash map basics and edge case handling"}'
            },
            {
                "input": "Problem: Binary Tree Inorder Traversal\nTags: trees, dfs\nVerdict: TIME_LIMIT_EXCEEDED",
                "output": '{"topics": ["trees", "dfs"], "likely_issue": "Used inefficient recursive approach or did not optimize", "difficulty_inference": "medium", "recommendation_reason": "Practice iterative DFS and tree traversal optimization"}'
            }
        ]
    
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        item = self.data[idx]
        
        # Format prompt
        prompt = f"Analyze this DSA submission:\n{item['input']}\n\nProvide analysis in JSON format:"
        target = item['output']
        
        # Combine prompt and target
        full_text = f"{prompt} {target}"
        
        # Tokenize
        encoding = self.tokenizer(
            full_text,
            truncation=True,
            max_length=self.max_length,
            padding="max_length",
            return_tensors="pt"
        )
        
        return {
            "input_ids": encoding["input_ids"].flatten(),
            "attention_mask": encoding["attention_mask"].flatten(),
            "labels": encoding["input_ids"].flatten()
        }

def load_base_model():
    """Load base model with quantization"""
    print(f"Loading base model: {BASE_MODEL}")
    
    quantization_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True,
        bnb_4bit_quant_type="nf4"
    )
    
    model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL,
        quantization_config=quantization_config,
        device_map="auto"
    )
    
    # Prepare model for k-bit training
    model = prepare_model_for_kbit_training(model)
    
    return model

def setup_lora(model):
    """Configure LoRA for parameter-efficient fine-tuning"""
    print("Setting up LoRA configuration...")
    
    lora_config = LoraConfig(
        r=8,  # Rank
        lora_alpha=32,  # Scaling factor
        target_modules=["c_attn", "c_proj"],  # Modules to apply LoRA
        lora_dropout=0.1,
        bias="none",
        task_type=TaskType.CAUSAL_LM
    )
    
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()
    
    return model

def train_model(args):
    """Main training function"""
    print("=" * 50)
    print("DSA Analyzer Fine-tuning with LoRA")
    print("=" * 50)
    
    # Load tokenizer
    print("Loading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    
    # Load and prepare model
    model = load_base_model()
    model = setup_lora(model)
    
    # Load dataset
    data_path = os.path.join(DATA_DIR, "dsa_training_data.jsonl")
    print(f"Loading dataset from {data_path}...")
    dataset = DSAAnalysisDataset(data_path, tokenizer)
    
    print(f"Dataset size: {len(dataset)}")
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        gradient_accumulation_steps=2,
        warmup_steps=50,
        logging_steps=10,
        save_steps=100,
        evaluation_strategy="no",
        save_total_limit=2,
        load_best_model_at_end=False,
        push_to_hub=False,
        fp16=True,
        optim="paged_adamw_8bit",
        learning_rate=args.learning_rate,
    )
    
    # Create trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=dataset,
        tokenizer=tokenizer,
    )
    
    # Train
    print("Starting training...")
    trainer.train()
    
    # Save model
    print(f"Saving model to {OUTPUT_DIR}...")
    trainer.save_model()
    tokenizer.save_pretrained(OUTPUT_DIR)
    
    print("✅ Fine-tuning complete!")
    print(f"Model saved to: {OUTPUT_DIR}")

def prepare_training_data():
    """Helper function to prepare training data"""
    os.makedirs(DATA_DIR, exist_ok=True)
    
    data_path = os.path.join(DATA_DIR, "dsa_training_data.jsonl")
    
    if not os.path.exists(data_path):
        print("Creating sample training data...")
        sample_data = [
            {
                "input": "Problem: Watermelon\nTags: math, brute force\nVerdict: OK",
                "output": '{"topics": ["math", "brute force"], "likely_issue": "No issues, solved correctly", "difficulty_inference": "easy", "recommendation_reason": "Good problem for beginners"}'
            },
            {
                "input": "Problem: Two Sum\nTags: arrays, hashing\nVerdict: WRONG_ANSWER",
                "output": '{"topics": ["arrays", "hashing"], "likely_issue": "Did not handle edge cases or hash map implementation error", "difficulty_inference": "easy", "recommendation_reason": "Practice hash map basics and edge case handling"}'
            },
            {
                "input": "Problem: Binary Tree Inorder Traversal\nTags: trees, dfs\nVerdict: TIME_LIMIT_EXCEEDED",
                "output": '{"topics": ["trees", "dfs"], "likely_issue": "Used inefficient recursive approach or did not optimize", "difficulty_inference": "medium", "recommendation_reason": "Practice iterative DFS and tree traversal optimization"}'
            }
        ]
        
        with open(data_path, 'w', encoding='utf-8') as f:
            for item in sample_data:
                f.write(json.dumps(item) + "\n")
        
        print(f"Sample training data created at {data_path}")
        print("You can add more training examples to this file.")
    else:
        print(f"Training data already exists at {data_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fine-tune DSA Analyzer with LoRA")
    parser.add_argument("--epochs", type=int, default=3, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=4, help="Batch size")
    parser.add_argument("--learning-rate", type=float, default=2e-4, help="Learning rate")
    parser.add_argument("--prepare-data", action="store_true", help="Prepare training data")
    
    args = parser.parse_args()
    
    if args.prepare_data:
        prepare_training_data()
    else:
        train_model(args)

