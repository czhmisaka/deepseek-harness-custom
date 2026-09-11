// ============================================================
// 手抛无人机 - OpenSCAD 3D打印零件
// 设计参数：轴距180mm / 3寸桨 / 2S电池
// ============================================================

$fn = 64;
MM = 1;

COLOR_FRAME  = [0.12, 0.12, 0.14];  // 深灰（机身）
COLOR_ORANGE = [0.90, 0.40, 0.02];  // 橙色（点缀）
COLOR_SOFT   = [0.05, 0.05, 0.05];  // 黑色（舱盖）
COLOR_CLEAR  = [0.85, 0.90, 0.95, 0.3]; // 半透明蓝色（电池仓）

// ============================================================
// PART 1: Body - 中央舱
// 包含：电池仓 + FC安装板 + 折叠臂连接座
// 尺寸: 70 x 60 x 28mm
// ============================================================
module Body() {
    difference() {
        // 主体外壳
        translate([0, 0, 4])
            cube([70, 60, 28], center=true);
        
        // 电池仓（内部掏空）
        translate([0, 0, 9])
            cube([62, 50, 22], center=true);
        
        // FC 安装槽（顶部凹槽，16mm厚）
        translate([0, 0, 22])
            cube([36, 36, 6], center=true);
        
        // FC 螺丝孔 x4（20x20mm图案，M2）
        for (x = [-10, 10])
            for (y = [-10, 10])
                translate([x, y, 26])
                    cylinder(r=1.0, h=6, center=true);
        
        // 折叠臂定位槽 x4（0°/90°/180°/270°方向）
        // 每个槽宽18mm，深6mm
        for (angle = [0, 90, 180, 270]) {
            rotate([0, 0, angle])
                translate([0, 30, 0])
                    cube([18, 14, 30], center=true);
        }
        
        // 侧边进气口（减重+散热）
        for (x = [-20, 20])
            translate([x, 0, 0])
                rotate([90, 0, 0])
                    cylinder(r=4, h=8, center=true);
        
        // 电池塞子槽（顶部卡扣）
        translate([0, 0, 20])
            cube([50, 40, 3], center=true);
    }
    
    // 折叠臂连接铰链 x4（橙色高亮）
    for (angle = [0, 90, 180, 270]) {
        rotate([0, 0, angle])
            translate([0, 30, 0]) {
                color(COLOR_ORANGE)
                difference() {
                    cylinder(r=9, h=8, center=true);
                    // 铰链轴孔
                    translate([0, 3, 0])
                        rotate([90, 0, 0])
                            cylinder(r=2, h=20, center=true);
                }
                // 止动齿（折叠定位，4个位置）
                for (i = [0:3])
                    rotate([0, 0, i*90])
                        translate([6, 3, 0])
                            cylinder(r=1.5, h=3, center=true);
            }
    }
    
    // GPS 模块安装柱（顶部，20x20mm）
    translate([0, 15, 26])
        cylinder(r=3, h=8, center=true);
    
    // 天线出口（侧面）
    translate([-38, 0, 0])
        rotate([90, 0, 0])
            cylinder(r=2, h=8, center=true);
    
    // 机身底部加强筋
    for (x = [-25, 25])
        for (y = [-20, 20])
            translate([x, y, -8])
                cylinder(r=3, h=14, center=true);
}

// ============================================================
// PART 2: Arm - 折叠臂（可旋转90度）
// 长度: 85mm (中心到电机)，总长95mm
// 宽度: 根部18mm，尖端14mm
// 厚度: 5mm
// ============================================================
module Arm() {
    // 臂身（梯形截面，从18mm渐变到14mm）
    color(COLOR_FRAME)
    translate([0, 0, 0])
        polyhedron(
            points = [
                [-9, 0, 0],   [9, 0, 0],      // 根部
                [-7, 85, 0],  [7, 85, 0],     // 尖端
                [-9, 0, 5],   [9, 0, 5],      // 根部顶部
                [-7, 85, 5],  [7, 85, 5]      // 尖端顶部
            ],
            faces = [
                [0,1,3,2],    // 底面
                [4,5,7,6],    // 顶面
                [0,1,5,4],    // 内侧
                [2,3,7,6],    // 外侧
                [0,2,6,4],    // 根部
                [1,3,7,5]     // 前缘
            ]
        );
    
    // 根部加强肋（靠近中央舱处加厚）
    color(COLOR_FRAME)
    translate([0, -8, 0])
        cube([18, 16, 5], center=true);
    
    // 折叠铰链连接片
    color(COLOR_ORANGE)
    translate([0, -5, 2.5])
        difference() {
            cube([14, 10, 5], center=true);
            // 铰链轴孔
            translate([0, -5, 0])
                rotate([90, 0, 0])
                    cylinder(r=2, h=20, center=true);
            // 轻量化孔
            translate([0, 3, 0])
                cylinder(r=2, h=20, center=true);
        }
    
    // 折叠锁扣（臂尖）
    color(COLOR_ORANGE)
    translate([0, 83, 2.5])
        cube([14, 4, 5], center=true);
    
    // 电机座平台（臂尖方形区域，18x18mm）
    color(COLOR_FRAME)
    translate([0, 85, 0])
        cube([18, 18, 5], center=true);
    
    // 电机安装孔（12mm图案，标准3寸电机）
    for (x = [-6, 6])
        for (y = [-6, 6])
            translate([x, y, -1])
                cylinder(r=1.25, h=7, center=true);
    
    // 折叠止动槽（臂身中部，折叠时卡入定位）
    color(COLOR_FRAME)
    translate([0, 40, 0])
        cube([12, 3, 5], center=true);
    
    // 折叠定位凸起（与中央舱配合）
    color(COLOR_ORANGE)
    translate([0, 55, 0])
        cube([10, 2, 5], center=true);
}

// ============================================================
// PART 3: BatteryCompartment - 电池仓盖
// 尺寸: 64 x 52 x 8mm
// ============================================================
module BatteryCover() {
    color(COLOR_SOFT)
    difference() {
        translate([0, 0, 0])
            cube([64, 52, 8], center=true);
        
        // 轻量化（椭圆形减重孔）
        for (x = [-18, 0, 18])
            for (y = [-16, 0, 16])
                translate([x, y, 0])
                    cylinder(r=5, h=8, center=true);
        
        // 电池检查窗（透明TPU窗口）
        translate([0, 0, 0])
            cube([30, 20, 8], center=true);
        
        // 侧面锁扣凹槽 x2
        for (y = [-20, 20])
            translate([30, y, 0])
                cylinder(r=2.5, h=8, center=true);
    }
    
    // 锁扣按钮（两侧）
    for (y = [-20, 20])
        color(COLOR_ORANGE)
        translate([32, y, 0])
            cylinder(r=3, h=10, center=true);
}

// ============================================================
// PART 4: PropGuard - 螺旋桨护圈（3寸桨专用）
// 内径: 90mm，线径: 3mm
// ============================================================
module PropGuard() {
    color(COLOR_FRAME)
    rotate([90, 0, 0])
    difference() {
        // 外圈
        torus_small = 45;  // 半径
        cylinder(r=torus_small + 3, h=3, center=true);
        
        // 挖空内圈
        cylinder(r=torus_small - 1, h=5, center=true);
    }
    
    // 连接杆 x4（护圈到电机座）
    for (angle = [0, 90, 180, 270])
        rotate([0, 0, angle])
        translate([0, 20, 0])
            color(COLOR_FRAME)
            cylinder(r=1.5, h=3, center=true);
    
    // 安装卡扣（卡在电机座上）
    for (angle = [0, 90, 180, 270])
        rotate([0, 0, angle])
        translate([30, 20, 0])
            color(COLOR_ORANGE)
            cube([8, 3, 5], center=true);
}

// ============================================================
// PART 5: LandingGear - 起落架（轻量化）
// 材质: PETG，TPU缓冲脚
// ============================================================
module LandingGear() {
    // 主体支柱（3D打印，圆形截面）
    color(COLOR_FRAME)
    rotate([20, 0, 0])
    translate([0, 20, 0])
        cylinder(r=4, h=50, center=true);
    
    // 横向连接杆
    color(COLOR_FRAME)
    translate([0, 0, -10])
        rotate([90, 0, 0])
            cylinder(r=3, h=80, center=true);
    
    // TPU缓冲脚 x4（橙色，减震）
    for (x = [-40, 40])
        for (y = [-5, 5])
            color(COLOR_ORANGE)
            translate([x, y, -32])
                cylinder(r=5, h=4, center=true);
    
    // 安装卡扣
    color(COLOR_FRAME)
    translate([0, 15, 8])
        cube([8, 10, 4], center=true);
}

// ============================================================
// 爆炸视图总装
// ============================================================

// Body (中心)
translate([0, 0, 0])
    Body();

// Arms x4 (0°, 90°, 180°, 270°)
for (angle = [0, 90, 180, 270])
    rotate([0, 0, angle])
    translate([0, 30, 0])
        Arm();

// BatteryCover (顶部)
translate([0, 0, 32])
    BatteryCover();

// LandingGear (底部)
translate([0, 0, -20])
    LandingGear();

// PropGuard x4 (每个电机位置)
// 先标注4个电机位置: (0,85),(85,0),(0,-85),(-85,0)
// 实际位置在Arm部件的臂尖
