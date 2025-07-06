import torch
import torch.nn as nn
from transformers import BartTokenizer, BartForConditionalGeneration
from transformers import BertModel, BertPreTrainedModel, AutoTokenizer

def main():
    # bert_model()
    bart_model()

# === Custom Classifier ===
class TopicDifficultyClassifier(BertPreTrainedModel):
    def __init__(self, config, diff_labels=3, topic_labels=9):
        super().__init__(config)
        self.base = BertModel(config)
        hidden_size = self.base.config.hidden_size
        self.dropout = nn.Dropout(0.1)
        self.topic_classifier_head = nn.Linear(hidden_size, topic_labels)
        self.diff_classifier_head = nn.Linear(hidden_size, diff_labels)

    def forward(self, input_ids=None, attention_mask=None, **kwargs):
        outputs = self.base(input_ids=input_ids, attention_mask=attention_mask)
        cls_output = self.dropout(outputs.last_hidden_state[:, 0, :])
        topic_logits = self.topic_classifier_head(cls_output)
        diff_logits = self.diff_classifier_head(cls_output)
        return {"logits": (topic_logits, diff_logits)}


def bert_model():
    # === Load Model & Tokenizer ===
    checkpoint_path = "./outputs/checkpoint-435"  # change if needed
    tokenizer = AutoTokenizer.from_pretrained("google-bert/bert-base-cased")
    model = TopicDifficultyClassifier.from_pretrained(checkpoint_path)
    model.eval()

    # === Input MCQ Question ===
    question_text = "What is common in three different types of traversals (Inorder, Preorder and Postorder)? Chocies: A\\nRoot is visited before right subtree, B\\nLeft subtree is always visited before right subtree, C\\n Root is visited after left subtree, D\\nAll of the above, E\\nNone of the above"

    # === Tokenize ===
    inputs = tokenizer(question_text, return_tensors="pt", truncation=True, padding=True)

    # === Predict ===
    with torch.no_grad():
        outputs = model(**inputs)
        topic_logits, diff_logits = outputs["logits"]
        topic_pred = torch.argmax(topic_logits, dim=1).item()
        diff_pred = torch.argmax(diff_logits, dim=1).item()

    # === Label Mapping ===
    topic_map = {
        0: "Array", 1: "Linked List", 2: "Stack", 3: "Queue",
        4: "Heap", 5: "Hashing", 6: "Tree", 7: "Graph", 8: "String"
    }
    difficulty_map = {0: "Easy", 1: "Medium", 2: "Hard"}

    print("\n🧠 Predicted Topic:", topic_map.get(topic_pred, "Unknown"))
    print("🔥 Predicted Difficulty:", difficulty_map.get(diff_pred, "Unknown"))

def bart_model():
    checkpoint_path = "./outputs_bart/checkpoint-3970"

    # Load tokenizer and model
    tokenizer = BartTokenizer.from_pretrained("facebook/bart-base")
    model = BartForConditionalGeneration.from_pretrained(checkpoint_path)
    model.eval()

    # Prompt
    prompt = "Generate a question on topic=Array and difficulty=Hard"
    inputs = tokenizer(prompt, return_tensors="pt")

    # Generate multiple diverse questions
    outputs = model.generate(
        **inputs,
        max_new_tokens=128,
        num_return_sequences=1,     # get 5 sequences
        do_sample=True,
        temperature=0.8,
        top_p=0.95,
        num_beams=1                 # <- critical to avoid beam constraint
    )

    # Decode all 5 sequences properly
    results = tokenizer.batch_decode(outputs, skip_special_tokens=True)

    for i, result in enumerate(results):
        print(f"\n📝 Question {i+1}:\n{result.strip()}")


if __name__ == "__main__":
    main()