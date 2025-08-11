import json

TARGET_CATS = {"cs.DS", "cs.CC", "cs.PL", "cs.LO", "math.CO"}

filtered_texts = []
with open("../archive/arxiv-metadata-oai-snapshot.json", 'r') as f:
    for line in f:
        rec = json.loads(line)
        if set(rec['categories'].split()) & TARGET_CATS:
            # Use abstract + title as raw training data
            text = rec['title'].strip() + " " + rec['abstract'].strip()
            filtered_texts.append(text)
            
full_text = '\n\n'.join(filtered_texts)

with open("../archive/filtered_arxiv_texts.txt", 'w', encoding="utf-8") as f:
    f.write(full_text)