import json
import os

def format_quiz_data(input_file_path, output_file_path):
    """
    Format quiz data by keeping input_text empty while preserving target_text content.
    
    Args:
        input_file_path (str): Path to the input JSON file
        output_file_path (str): Path to the output JSON file
    """
    try:
        # Read the input file
        with open(input_file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        # Format the data
        formatted_data = []
        for item in data:
            formatted_item = {
                "input_text": "",  # Keep input_text empty as requested
                "target_text": item.get("target_text", "")  # Preserve target_text
            }
            formatted_data.append(formatted_item)
        
        # Write the formatted data to output file
        with open(output_file_path, 'w', encoding='utf-8') as file:
            json.dump(formatted_data, file, indent=4, ensure_ascii=False)
        
        print(f"Successfully formatted {len(formatted_data)} items")
        print(f"Input file: {input_file_path}")
        print(f"Output file: {output_file_path}")
        
    except FileNotFoundError:
        print(f"Error: Input file '{input_file_path}' not found.")
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format in input file: {e}")
    except Exception as e:
        print(f"Error: {e}")

def main():
    # Define file paths
    input_file = "datasets/arsham_cleaned.json"
    output_file = "datasets/arsham_cleaned_formatted.json"
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' does not exist.")
        print("Please make sure the file path is correct.")
        return
    
    # Format the data
    format_quiz_data(input_file, output_file)

if __name__ == "__main__":
    main() 