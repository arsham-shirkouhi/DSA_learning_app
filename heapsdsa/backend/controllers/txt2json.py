import os
import json

def convert_race_folder_to_json(folder_path, output_file):
    dataset = []

    for root, dirs, files in os.walk(folder_path):
        for fname in files:
            if fname.endswith(".txt"):
                with open(os.path.join(root, fname), "r", encoding="utf-8") as f:
                    race_obj = json.load(f)
                    article = race_obj["article"]
                    for q, opts, ans in zip(race_obj["questions"], race_obj["options"], race_obj["answers"]):
                        choices_text = "\n".join([f"{chr(97+i)}) {opt}" for i, opt in enumerate(opts)])
                        sample = {
                            "input_text": f"Generate MCQ | Context: {article}",
                            "target_text": f"Question: {q.strip()}\nChoices:\n{choices_text}\nAnswer: {ans.lower()}"
                        }
                        dataset.append(sample)

    with open(output_file, "w", encoding="utf-8") as out_f:
        json.dump(dataset, out_f, indent=2)
    print(f"Saved {len(dataset)} samples to {output_file}")

# Example usage:
convert_race_folder_to_json("./datasets/RACE/train/middle","./datasets/RACE/race_train.json")
