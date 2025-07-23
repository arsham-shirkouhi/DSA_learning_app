import json
import re

# Load JSON from file
with open("updated_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for entry in data:
    target = entry.get("target_text", "")

    # Find the 'Answer: [a-d]' pattern and truncate right after it
    match = re.search(r'(Answer:\s*[abcd])', target, re.IGNORECASE)
    if match:
        target = target[:match.end()]

    entry["target_text"] = target

# Save updated JSON back to file
with open("updated_data2.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4)
