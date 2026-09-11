#!/usr/bin/env python3
"""OpenSCAD CLI wrapper - render .scad to STL or PNG"""
import subprocess, sys, os

def render_scad(scad_file, output_path=None, fmt='stl', timeout=120):
    if output_path is None:
        ext = '.png' if fmt == 'png' else '.stl'
        output_path = scad_file.replace('.scad', ext)
    
    cmd = ['openscad', scad_file, '-o', output_path]
    if fmt == 'png':
        cmd.extend(['--render', '--viewall', '--projection=perspective'])
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    ok = result.returncode == 0
    size = os.path.getsize(output_path) // 1024 if os.path.exists(output_path) else 0
    
    status = f"✅ {output_path} ({size}KB)"
    if not ok:
        status += f"\n   ERR: {result.stderr[:200]}"
    print(status)
    return ok

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 openscad_render.py design.scad [output.stl]")
        sys.exit(1)
    
    scad = sys.argv[1]
    out  = sys.argv[2] if len(sys.argv) > 2 else None
    fmt  = 'png' if out and out.endswith('.png') else 'stl'
    render_scad(scad, out, fmt)
