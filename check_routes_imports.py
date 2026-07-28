import os
import re

project_root = "/app/project/formosa grill"
routes_dir = os.path.join(project_root, "src/routes")

def find_files(directory):
    files_list = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                files_list.append(os.path.join(root, file))
    return files_list

routes_files = find_files(routes_dir)

print(f"Checking {len(routes_files)} files in src/routes/...\n")

# Re to match imports
import_re = re.compile(r'(?:import|export)\s+(.*?)\s+from\s+[\'"]([^\'"]+)[\'"]|import\s+[\'"]([^\'"]+)[\'"]')

for f in sorted(routes_files):
    rel_path = os.path.relpath(f, project_root)
    print(f"File: {rel_path}")
    
    with open(f, 'r', encoding='utf-8', errors='ignore') as file_obj:
        content = file_obj.read()
        
    # Find all imports
    matches = import_re.findall(content)
    for m in matches:
        names = m[0].strip() if m[0] else ""
        source = m[1] if m[1] else m[2]
        
        # Check if it imports from '@/data/'
        if 'data' in source or 'restaurant' in source:
            print(f"  -> Mock Data Import: {names} from '{source}'")
        elif source.startswith(('.', '@')):
            # Local import
            pass
        else:
            # External dependency
            pass
    print()
