import json

def remove_duplicate_targets(input_path, output_path):
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    seen = set()
    cleaned_data = []

    for item in data:
        target = item.get("target_text", "").strip()
        if target not in seen:
            seen.add(target)
            cleaned_data.append(item)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, indent=4, ensure_ascii=False)

    print(f"✅ Removed duplicates. Original size: {len(data)}, Cleaned size: {len(cleaned_data)}.")
    print(f"Cleaned data saved to: {output_path}")

# Example usage:
input_file = "./datasets/final.json"               # Replace with your input file
output_file = "./temp/cleaned_output.json"         # Output file name

remove_duplicate_targets(input_file, output_file)
