import json
from collections import Counter

# Load JSON array from file
deduped_dataset = "./datasets/deduplicated_dataset.json"
actual_dataset = "./datasets/dsa_mcq_10000_dataset.json"

with open(deduped_dataset, "r", encoding="utf-8") as f:
    data = json.load(f)

# Convert each dict to a JSON string with sorted keys for uniformity
data_strs = [json.dumps(entry, sort_keys=True) for entry in data]

# Count occurrences
counter = Counter(data_strs)

# Identify duplicates (more than once)
duplicates = [json.loads(s) for s, count in counter.items() if count > 1]

print(f"📦 Total entries: {len(data)}")
print(f"🧮 Unique entries: {len(counter)}")
print(f"⚠️ Duplicate entries found: {len(duplicates)}")

# Optional: Show some duplicate examples
print("\n📄 Example Duplicates:")
for d in duplicates[:3]:  # Show up to 3 examples
    print(json.dumps(d, indent=2))

unique_data = [json.loads(s) for s in counter.keys()]

if len(duplicates) != 0:
    with open("./datasets/deduplicated_dataset.json", "w", encoding="utf-8") as f:
        json.dump(unique_data, f, indent=2)

    print("✅ Deduplicated dataset saved.")
