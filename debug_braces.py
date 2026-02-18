import sys
import re

def check_braces(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error opening file: {e}")
        return

    length = len(content)
    i = 0
    line_num = 1
    
    # Track nesting
    level = 0
    
    print(f"Analyzing {filepath}...")
    
    while i < length:
        char = content[i]
        
        if char == '\n':
            line_num += 1
            i += 1
            continue
            
        # Skip strings
        if char in ('"', "'", '`'):
            quote = char
            i += 1
            while i < length:
                if content[i] == '\\':
                    i += 2 # Skip escaped char
                    continue
                elif content[i] == quote:
                    i += 1
                    break
                elif content[i] == '\n':
                    line_num += 1
                    i += 1
                else:
                    i += 1
            continue
            
        # Skip comments
        # Line comment //
        if char == '/' and i+1 < length:
            if content[i+1] == '/':
                i += 2
                while i < length and content[i] != '\n':
                    i += 1
                continue
            # Block comment /* */
            elif content[i+1] == '*':
                i += 2
                while i+1 < length:
                    if content[i] == '*' and content[i+1] == '/':
                        i += 2
                        break
                    if content[i] == '\n':
                        line_num += 1
                    i += 1
                continue

        if char == '{':
            level += 1
        elif char == '}':
            level -= 1
            if level == 0:
                print(f"Brace nest closed (Level 0) at Line {line_num}")
            if level < 0:
                 print(f"ERROR: Negative nest level at Line {line_num}")
                 return

        i += 1

    print(f"Final Level: {level}")

if __name__ == "__main__":
    check_braces(r"C:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix\app\[locale]\admin\reports\ManagementReportsClient.tsx")
