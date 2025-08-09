from pathlib import Path

# Base folder: where your "textbook1", "textbook2", etc. are
base_path = Path("../datasets/raw_docs")

# Output file path
output_path = Path("../datasets/java_corpus.txt")

# Find all Chapter*.txt files under all textbook folders
chapter_files = sorted(
    base_path.glob("textbook*/Chapter*.txt"),
    key=lambda x: (x.parent.name, int(x.stem.replace("Chapter", "")))
)

# Combine and write to output
with open(output_path, "w", encoding="utf-8") as outfile:
    for file in chapter_files:
        with open(file, "r", encoding="utf-8") as f:
            content = f.read().strip()
        outfile.write(content + "\n\n")

print(f"✅ Merged {len(chapter_files)} chapter files into {output_path}")
