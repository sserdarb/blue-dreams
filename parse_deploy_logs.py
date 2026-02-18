import json

def main():
    
    try:
        with open('deploy_logs_154.json', 'r', encoding='utf-8') as f:
            content = f.read()
            print(f"File size: {len(content)} bytes")
            idx = content.find('prisma')
            if idx != -1:
                print(f"Found 'prisma' at index {idx}")
                print(content[idx:idx+500])
            else:
                print("'prisma' NOT found")
            
    except Exception as e:
        print(f"Error reading file: {e}")

if __name__ == "__main__":
    main()
