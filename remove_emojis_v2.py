import os
import re

# Comprehensive emoji regex pattern
# Ref: https://stackoverflow.com/questions/33404752/removing-emojis-from-a-string-in-python
# Covers most common emojis and symbols
EMOJI_PATTERN = re.compile(
    "["
    "\U0001f600-\U0001f64f"  # emoticons
    "\U0001f300-\U0001f5ff"  # symbols & pictographs
    "\U0001f680-\U0001f6ff"  # transport & map symbols
    "\U0001f1e0-\U0001f1ff"  # flags (iOS)
    "\U00002600-\U000026ff"  # misc symbols
    "\U00002700-\U000027bf"  # dingbats
    "\U0000fe00-\U0000fe0f"  # variation selectors
    "\U0001f900-\U0001f9ff"  # supplemental symbols and pictographs
    "\U0001fa70-\U0001faff"  # symbols and pictographs extended-a
    "]+", flags=re.UNICODE
)

EXCLUDED_DIRS = {'.git', 'node_modules', 'dist', '.wrangler', '.gemini'}
EXCLUDED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.woff', '.woff2', '.ttf', '.eot', '.svg'}

def remove_emojis_from_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = EMOJI_PATTERN.sub('', content)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Removed emojis from: {filepath}")
            return True
    except (UnicodeDecodeError, PermissionError):
        # Skip binary files or files we can't read
        pass
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
    return False

def main():
    count = 0
    for root, dirs, files in os.walk('.'):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
        
        for file in files:
            if any(file.endswith(ext) for ext in EXCLUDED_EXTENSIONS):
                continue
            
            filepath = os.path.join(root, file)
            if remove_emojis_from_file(filepath):
                count += 1
    
    print(f"\nTotal files updated: {count}")

if __name__ == "__main__":
    main()
