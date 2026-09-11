#!/usr/bin/env python3
"""Blender Cycles CLI renderer - generates perspective/top/side PNGs
Usage: python3 blender_render_template.py /path/to/render_script.py output_prefix
"""
import subprocess, sys, os, shutil

BLENDER = '/Applications/Blender.app/Contents/MacOS/Blender'

def blender_render(script_path, output_prefix='/tmp/blender_render'):
    """Run a Blender Python script and return generated PNG paths."""
    result = subprocess.run(
        [BLENDER, '--background', '--python', script_path],
        capture_output=True, text=True, timeout=300
    )
    if result.returncode != 0:
        print("Blender failed:", result.stderr[-500:])
        return []
    
    # Find generated PNGs
    paths = []
    for name in ['persp', 'top', 'side']:
        p = f'/tmp/{output_prefix}_{name}.png'
        if os.path.exists(p):
            paths.append(p)
            print(f"✅ {p} ({os.path.getsize(p)//1024}KB)")
    return paths

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: blender_render.py render_script.py [prefix]")
        sys.exit(1)
    script = sys.argv[1]
    prefix = sys.argv[2] if len(sys.argv) > 2 else 'render'
    blender_render(script, prefix)
