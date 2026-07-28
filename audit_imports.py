import os
import re

project_root = "/app/project/formosa grill"
src_dir = os.path.join(project_root, "src")
project_src_dir = os.path.join(project_root, "project/src")

def find_files(directory):
    files_list = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                files_list.append(os.path.join(root, file))
    return files_list

src_files = find_files(src_dir)
project_src_files = find_files(project_src_dir)

print(f"Found {len(src_files)} files in src/")
print(f"Found {len(project_src_files)} files in project/src/")

# Regular expression for imports
import_re = re.compile(r'(?:import|export)\s+.*?\s+from\s+[\'"]([^\'"]+)[\'"]|import\s+[\'"]([^\'"]+)[\'"]')

def resolve_import(source_file, import_path):
    # Only resolve if it starts with '.' or '@/'
    if not (import_path.startswith('.') or import_path.startswith('@/')):
        return None  # External package, assume resolved

    # Handle @/ path mapping
    if import_path.startswith('@/'):
        rel_path = import_path[2:]
        resolved_base = os.path.join(src_dir, rel_path)
    else:
        # Relative path
        source_dir = os.path.dirname(source_file)
        resolved_base = os.path.abspath(os.path.join(source_dir, import_path))

    # Strip query parameters from import path like '?url'
    if '?' in resolved_base:
        resolved_base = resolved_base.split('?')[0]

    # Try different extensions
    possible_paths = [
        resolved_base,
        resolved_base + ".ts",
        resolved_base + ".tsx",
        resolved_base + ".d.ts",
        resolved_base + ".js",
        resolved_base + ".jsx",
        os.path.join(resolved_base, "index.ts"),
        os.path.join(resolved_base, "index.tsx"),
        os.path.join(resolved_base, "index.js"),
        os.path.join(resolved_base, "index.jsx"),
    ]
    
    # Also handle assets like .jpg, .png, .css, etc.
    if any(import_path.split('?')[0].endswith(ext) for ext in ['.css', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.json']):
        possible_paths.append(resolved_base)

    for p in possible_paths:
        if os.path.exists(p):
            return p
            
    return resolved_base # Return the base path as failed to resolve

errors = []

def audit_files(files, is_src=True):
    for f in files:
        rel_f = os.path.relpath(f, project_root)
        with open(f, 'r', encoding='utf-8', errors='ignore') as file_obj:
            content = file_obj.read()
            
        # Find all import/export paths
        matches = import_re.findall(content)
        imports = [m[0] or m[1] for m in matches if m[0] or m[1]]
        
        for imp in imports:
            # Check if it is internal/local
            if not (imp.startswith('.') or imp.startswith('@/')):
                continue
                
            resolved = resolve_import(f, imp)
            if resolved is None:
                continue
                
            if not os.path.exists(resolved):
                errors.append({
                    "file": rel_f,
                    "import": imp,
                    "resolved_target": os.path.relpath(resolved, project_root),
                    "type": "missing_file"
                })
            else:
                # Check if file in src/ imports from project/src/
                resolved_rel = os.path.relpath(resolved, project_root)
                if is_src and resolved_rel.startswith("project/src"):
                    errors.append({
                        "file": rel_f,
                        "import": imp,
                        "resolved_target": resolved_rel,
                        "type": "src_importing_project_src"
                    })

audit_files(src_files, is_src=True)
audit_files(project_src_files, is_src=False)

print("\n--- CORRECTED AUDIT RESULTS ---")
if not errors:
    print("No broken imports or missing files referenced found!")
else:
    for err in errors:
        print(f"File: {err['file']}")
        if err['type'] == 'missing_file':
            print(f"  ERROR: Import '{err['import']}' points to non-existent path: '{err['resolved_target']}'")
        elif err['type'] == 'src_importing_project_src':
            print(f"  WARNING: File in src/ imports from project/src/: '{err['import']}' -> '{err['resolved_target']}'")
        print()
