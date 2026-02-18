import paramiko
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

def run(c, cmd, timeout=30):
    stdin, stdout, stderr = c.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return out, err

try:
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    out, _ = run(c, 'docker ps --filter "name=vgk8" --format "{{.ID}}"')
    cid = out.split('\n')[0].strip()
    print(f"Container: {cid}")
    
    # The error is in the compiled SSR chunk: .next/server/chunks/ssr/_f2f6efaa._.js
    # Find the file with the WIDGET_TYPES reference
    print("\n=== Finding the problematic chunk ===")
    out, _ = run(c, f'docker exec {cid} grep -rl "WIDGET_TYPES" /app/.next/server/ 2>&1 | head -5')
    print(f"Files: {out}")
    
    # Also check the source code files in the container
    print("\n=== Source page editor ===")
    out, _ = run(c, f'docker exec {cid} head -3 "/app/app/[locale]/admin/pages/[id]/editor/page.tsx"')
    print(f"Editor source: {out}")
    
    # The real fix: since `next start` uses compiled chunks and the error is in the SSR bundle,
    # we need to restart the server after updating the source AND rebuilding.
    # Since rebuilding inside the container is complex, let's try a different approach:
    # Copy the source fix into the container and do a quick rebuild there.
    
    # Step 1: Update the source files in the container
    print("\n=== Step 1: Create widget-types.ts in container ===")
    widget_types_content = """
// Widget type metadata - shared between server and client components
export const WIDGET_TYPES = [
    { type: 'hero', label: 'Hero Section', description: 'Full-width banner with image or video background', icon: '🎬' },
    { type: 'page-header', label: 'Page Header', description: 'Sub-page header with background image and breadcrumbs', icon: '📄' },
    { type: 'text', label: 'Text Block', description: 'Rich text content with styling options', icon: '📝' },
    { type: 'text-block', label: 'Statement Block', description: 'Centered statement/quote section', icon: '💬' },
    { type: 'text-image', label: 'Text + Image', description: 'Split layout with text and image', icon: '🖼️' },
    { type: 'stats', label: 'Statistics Bar', description: 'Row of stat items with icons', icon: '📊' },
    { type: 'icon-grid', label: 'Icon Cards', description: 'Grid of cards with icons and text', icon: '✨' },
    { type: 'image-grid', label: 'Image Cards', description: 'Grid of cards with images', icon: '🎨' },
    { type: 'gallery', label: 'Image Gallery', description: 'Gallery with lightbox', icon: '📸' },
    { type: 'features', label: 'Features', description: 'Feature list with icons', icon: '⭐' },
    { type: 'cta', label: 'Call to Action', description: 'CTA section with buttons', icon: '📢' },
    { type: 'contact', label: 'Contact Section', description: 'Contact info + form', icon: '✉️' },
    { type: 'map', label: 'Map Embed', description: 'Google Maps embed', icon: '🗺️' },
    { type: 'youtube', label: 'YouTube Videos', description: 'Embed YouTube videos', icon: '📺' },
    { type: 'table', label: 'Data Table', description: 'Table with columns and rows', icon: '📋' },
    { type: 'reviews', label: 'Reviews', description: 'Guest reviews and ratings', icon: '⭐' },
    { type: 'weather', label: 'Weather', description: 'Monthly weather data', icon: '🌤️' },
    { type: 'experience', label: 'Experience', description: 'Interactive experience showcase', icon: '🏊' },
    { type: 'room-list', label: 'Room List', description: 'Room cards from database', icon: '🏨' },
    { type: 'divider', label: 'Divider', description: 'Visual separator', icon: '➖' },
]
"""
    import base64
    b64 = base64.b64encode(widget_types_content.encode('utf-8')).decode('utf-8')
    run(c, f'docker exec {cid} sh -c "echo {b64} | base64 -d > /app/components/admin/widget-editors/widget-types.ts"')
    
    # Verify
    out, _ = run(c, f'docker exec {cid} head -3 /app/components/admin/widget-editors/widget-types.ts')
    print(f"Widget types created: {out}")
    
    # Step 2: Update the index.tsx to re-export from widget-types.ts
    print("\n=== Step 2: Patch index.tsx ===")
    # Remove the WIDGET_TYPES array from index.tsx and replace with re-export
    out, _ = run(c, f'docker exec {cid} grep -n "WIDGET_TYPES" /app/components/admin/widget-editors/index.tsx')
    print(f"Current WIDGET_TYPES lines: {out}")
    
    # Use sed to replace the WIDGET_TYPES export with a re-export
    run(c, f"""docker exec {cid} sed -i '/^\\/\\/ Widget type metadata/,/^]$/c\\// Re-export WIDGET_TYPES from shared module\\nexport {{ WIDGET_TYPES }} from '"'"'./widget-types'"'"'' /app/components/admin/widget-editors/index.tsx""")
    
    # Step 3: Update the editor pages to import from widget-types
    print("\n=== Step 3: Patch editor pages ===")
    run(c, f"""docker exec {cid} sed -i "s/import {{ WidgetEditor, WIDGET_TYPES }} from '@\\/components\\/admin\\/widget-editors'/import {{ WidgetEditor }} from '@\\/components\\/admin\\/widget-editors'\\nimport {{ WIDGET_TYPES }} from '@\\/components\\/admin\\/widget-editors\\/widget-types'/" '/app/app/[locale]/admin/pages/[id]/editor/page.tsx'""")
    
    # Verify source changes
    out, _ = run(c, f'docker exec {cid} head -4 "/app/app/[locale]/admin/pages/[id]/editor/page.tsx"')
    print(f"Editor source after patch: {out}")
    
    out, _ = run(c, f'docker exec {cid} tail -3 /app/components/admin/widget-editors/index.tsx')
    print(f"Index.tsx tail: {out}")
    
    # Step 4: Rebuild Next.js inside the container
    print("\n=== Step 4: Rebuilding Next.js (this will take a while) ===")
    out, err = run(c, f'docker exec -w /app -e DATABASE_URL="postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2" {cid} npm run build 2>&1', timeout=300)
    
    with open('rebuild_output.txt', 'w', encoding='utf-8') as f:
        f.write(f"STDOUT:\n{out}\n\nSTDERR:\n{err}\n")
    
    if 'error' in out.lower() or 'failed' in out.lower():
        print(f"Build output (truncated): {out[-500:]}")
    else:
        print(f"Build completed! Last lines: {out[-200:]}")
    
    # Step 5: Restart the Next.js process
    # Since `next start` is used, we need to kill and restart
    print("\n=== Step 5: Restarting Next.js ===")
    # Kill the next start process
    out, _ = run(c, f'docker exec {cid} pkill -f "next start" 2>&1')
    time.sleep(3)
    
    # The container should auto-restart due to Docker restart policy
    # Check if it's back
    time.sleep(5)
    out, _ = run(c, 'docker ps --filter "name=vgk8" --format "{{.ID}} {{.Status}}"')
    print(f"Container status: {out}")
    
    c.close()
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
