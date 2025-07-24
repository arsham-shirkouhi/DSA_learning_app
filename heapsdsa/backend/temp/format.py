import json

# Load JSON from file
with open("cleaned_output.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Update target_texts if needed
for entry in data:
    target = entry.get("target_text", "").strip()
    if not target.startswith("Question:"):
        entry["target_text"] = "Question: " + target

# Save updated JSON back to file (overwrite or rename)
with open("cleaned.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4)
