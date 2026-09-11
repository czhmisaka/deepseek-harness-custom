---
name: openscad-3d-viewer
description: "OpenSCAD 3D modeling + Blender rendering + Three.js web viewer. Use when: (1) creating 3D print models (.scad to STL), (2) Blender Cycles rendering for realistic previews, (3) building a web STL viewer, (4) showing 3D models in browser. Triggers on 3D print, STL model, OpenSCAD, Blender render, 3D viewer, 3D browser."
---

# OpenSCAD 3D Viewer Skill

## Workflow Overview

```
描述零件结构 → 写 .scad 源码 → openscad CLI 导出 STL → blender --background 渲染预览 → Three.js 网页浏览器展示
```

## 1. OpenSCAD Modeling

### CLI 基本用法
```bash
# 导出 STL
openscad design.scad -o model.stl

# 渲染预览 PNG（必须用 --render）
openscad design.scad -o preview.png --render --viewall --projection=perspective

# 批量导出多个零件
for f in 0[1-9]_*.scad; do
  openscad "$f" -o "${f%.scad}.stl" 2>&1 | tail -2
done
```

### 关键语法
- `$fn = 64` — 圆柱/球的分段数（精度）
- `difference() { A; B; }` — A 挖去 B（挖孔）
- `union() { A; B; }` — 合并
- `translate([x,y,z])` — 移动
- `rotate([rx,ry,rz])` — 旋转（角度制）
- `cylinder(r,h)` — 圆柱
- `cube([w,d,h])` — 立方体
- `sphere(r)` — 球
- `polyhedron(points, faces)` — 自定义多面体
- `color([r,g,b])` — 上色（预览用）

### 常见坑
- `polyhedron` 容易报 non-manifold 警告，改用 `cube`+`cylinder` 组合
- 布尔运算不稳定时，拆成多个独立零件文件
- 预览 PNG 渲染很慢（~15s），STL 导出较快（~5s）

## 2. Blender CLI 渲染

### 基础命令
```bash
/Applications/Blender.app/Contents/MacOS/Blender --background --python render.py
```

### Python 脚本模板
```python
import bpy, math, os

# 清场
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def sm(obj, r, g, b, metallic=0.0, roughness=0.5):
    mat = bpy.data.materials.new('M_' + obj.name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    out = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (r, g, b, 1.0)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    obj.data.materials.append(mat)

def cyd(r, h, loc, rot=(0,0,0), verts=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=h, location=loc, rotation=rot)
    return bpy.context.object

def box(w, d, h, loc, rot=(0,0,0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    obj = bpy.context.object
    obj.scale = (w, d, h)
    bpy.ops.object.transform_apply(scale=True)
    return obj

def torus_shape(maj_r, min_r, loc, rot=(0,0,0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=maj_r, minor_radius=min_r, location=loc, rotation=rot)
    return bpy.context.object

# === 建模代码 ===

# 灯光
sun = bpy.ops.object.light_add(type='SUN', location=(0.5,-0.5,0.8))
sun = bpy.context.object; sun.data.energy = 3.0; sun.rotation_euler = (1.2,0.3,0.5)

# 相机
bpy.ops.object.camera_add(location=(0.15,-0.12,0.09))
cam = bpy.context.object; bpy.context.scene.camera = cam
cam.rotation_euler = (1.25, 0, 0.85)

# 渲染
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 128
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.film_transparent = True
scene.render.filepath = '/tmp/output.png'
bpy.ops.render.render(write_still=True)
```

### Blender 已知问题
- `bpy.ops.object.shadeSmooth` 在 headless 下不可用，改用 `bpy.ops.object.select_all(action='DESELECT')`
- modifier_add 后立即 apply：`bpy.ops.object.modifier_apply(modifier='Bevel')`
- GeometryNodes / sculpt mode 在 headless 下不支持
- STL import/export 用 `bpy.ops.wm.stl_export` / `wm.stl_import`

## 3. Three.js Web Viewer

### 启动本地服务器
```bash
cd ~/Desktop/螃蟹的家
python3 -m http.server 8080
# 访问: http://localhost:8080/<path>/
```

### Viewer HTML 模板

参考 `assets/index.html`，核心模式：

```javascript
// 加载 STL
const loader = new THREE.STLLoader();
loader.load('model.stl', (geo) => {
    geo.computeVertexNormals();
    const mat = new THREE.MeshPhongMaterial({ color: 0x888899 });
    const mesh = new THREE.Mesh(geo, mat);
    geo.center();
    mesh.rotation.x = -Math.PI / 2;  // STL 坐标系修正
    mesh.scale.setScalar(0.1);
    scene.add(mesh);
});

// 爆炸图：保存原始位置
originalPositions = parts.map(m => m.position.clone());
function explode() {
    parts.forEach((m, i) => {
        m.position.set(
            originalPositions[i].x + offsets[i][0],
            originalPositions[i].y + offsets[i][1],
            originalPositions[i].z + offsets[i][2]
        );
    });
}
```

### 必需文件（从 assets/ 复制到目标目录）
- `three.min.js`
- `OrbitControls.js`
- `STLLoader.js`
- `index.html`
- 模型 `.stl` 文件
- Blender 渲染 `.png` 文件

## 4. 渲染脚本工具

### `scripts/openscad_render.py`
```bash
python3 scripts/openscad_render.py design.scad [output.stl]
```

### `scripts/blender_render.py`
```bash
python3 scripts/blender_render.py drone  # 生成3张图: _persp.png _top.png _side.png
```

## 5. 渲染脚本

```python
# scripts/openscad_render.py
import subprocess, sys, os

def render_scad(scad_file, output_path=None, fmt='stl'):
    if output_path is None:
        output_path = scad_file.replace('.scad', '.stl' if fmt == 'stl' else '.png')
    cmd = ['openscad', scad_file, '-o', output_path]
    if fmt == 'png':
        cmd.extend(['--render', '--viewall', '--projection=perspective'])
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    ok = result.returncode == 0
    size = os.path.getsize(output_path) // 1024 if os.path.exists(output_path) else 0
    print(f"{'OK' if ok else 'FAIL'}: {output_path} ({size}KB)")
    return ok

if __name__ == '__main__':
    scad = sys.argv[1] if len(sys.argv) > 1 else 'design.scad'
    out  = sys.argv[2] if len(sys.argv) > 2 else None
    fmt  = 'png' if out and out.endswith('.png') else 'stl'
    render_scad(scad, out, fmt)
```

```python
# scripts/blender_render.py
import subprocess, sys, os

BLENDER = '/Applications/Blender.app/Contents/MacOS/Blender'
VIEWS = {
    'persp': {'loc': (0.15,-0.12,0.09), 'rot': (1.25,0,0.85)},
    'top':   {'loc': (0,0,0.22), 'rot': (0,0,0.785)},
    'side':  {'loc': (0,-0.22,0.015), 'rot': (math.pi/2,0,0)},
}

def blender_render(script_path, output_prefix):
    base = os.path.dirname(os.path.abspath(script_path))
    scene = bpy.context.scene
    scene.render.film_transparent = True
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    for name, cfg in VIEWS.items():
        cam = bpy.context.scene.camera
        cam.location = cfg['loc']
        cam.rotation_euler = cfg['rot']
        scene.render.filepath = f'/tmp/{output_prefix}_{name}.png'
        bpy.ops.render.render(write_still=True)
        print(f"Done: /tmp/{output_prefix}_{name}.png")
```

## 6. 交付物清单

| 类型 | 文件 | 位置 |
|------|------|------|
| STL打印件 | `0[0-9]_*.stl` | `drone_openscad/` |
| 3D交互 | `index.html` + Three.js libs | 同一目录 |
| Blender渲染图 | `drone_v2_*.png` | 父目录 |
| 爆炸视图 | OpenSCAD 导出 | 独立 .scad 文件 |

## 快速命令

```bash
# 一键渲染所有 .scad 为 STL
for f in *.scad; do openscad "$f" -o "${f%.scad}.stl"; done

# 启动服务器
cd ~/Desktop/螃蟹的家 && python3 -m http.server 8080

# Blender 高清渲染（3张）
/Applications/Blender.app/Contents/MacOS/Blender --background --python render.py

# Playwright 截图检查
playwright screenshot --browser=chromium http://localhost:8080/ /tmp/preview.png
```
