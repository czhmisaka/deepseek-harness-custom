// 09_UnfoldedAssembly.scad - 展开状态总装
// 飞行尺寸: 轴距 180mm
$fn = 64;
COLOR_FRAME  = [0.12, 0.12, 0.14];
COLOR_ORANGE = [0.90, 0.40, 0.02];
COLOR_SOFT   = [0.05, 0.05, 0.05];

// ============ 中央舱 ============
color(COLOR_FRAME)
difference() {
    translate([0, 0, 4])
        cube([70, 60, 28], center=true);
    translate([0, 0, 9])
        cube([62, 50, 22], center=true);
    translate([0, 0, 22])
        cube([36, 36, 6], center=true);
    for (x = [-10, 10])
        for (y = [-10, 10])
            translate([x, y, 26])
                cylinder(r=1.0, h=6, center=true);
    for (angle = [0, 90, 180, 270])
        rotate([0, 0, angle])
            translate([0, 30, 0])
                cube([18, 14, 30], center=true);
    for (x = [-20, 20])
        translate([x, 0, 0])
            rotate([90, 0, 0])
                cylinder(r=4, h=8, center=true);
}

// GPS柱
color(COLOR_FRAME)
translate([0, 15, 26])
    cylinder(r=3, h=8, center=true);

// 电池仓盖
color(COLOR_SOFT)
translate([0, 0, 32])
    difference() {
        cube([64, 52, 8], center=true);
        for (x = [-18, 0, 18])
            for (y = [-16, 0, 16])
                translate([x, y, 0])
                    cylinder(r=5, h=8, center=true);
    }

// ============ 折叠臂 x4 ============
for (angle = [0, 90, 180, 270])
    rotate([0, 0, angle])
    translate([0, 30, 0]) {
        // 臂身
        color(COLOR_FRAME) {
            translate([0, 0, 0]) cube([18, 6, 5], center=true);
            translate([0, 15, 0]) cube([17, 6, 5], center=true);
            translate([0, 30, 0]) cube([16, 6, 5], center=true);
            translate([0, 45, 0]) cube([15, 6, 5], center=true);
            translate([0, 60, 0]) cube([14, 6, 5], center=true);
            translate([0, 75, 0]) cube([14, 6, 5], center=true);
            translate([0, 85, 0]) cube([18, 18, 5], center=true);
        }
        
        // 折叠止动齿
        color(COLOR_ORANGE) {
            translate([0, 20, 0]) cube([20, 2, 5], center=true);
            translate([0, 65, 0]) cube([16, 2, 5], center=true);
        }
        
        // 折叠锁扣
        color(COLOR_ORANGE)
        translate([0, 80, 2.5])
            cube([14, 5, 5], center=true);
        
        // 电机安装孔
        for (x = [-6, 6])
            for (y = [-6, 6])
                translate([x, y + 85, -1])
                    cylinder(r=1.25, h=7, center=true);
        
        // 螺旋桨护圈（仅展开状态安装）
        translate([0, 85, 0]) {
            // 护圈环
            color(COLOR_FRAME)
            rotate([90, 0, 0])
            difference() {
                cylinder(r=48, h=3, center=true);
                translate([0, 0, -2])
                    cylinder(r=44, h=7, center=true);
            }
            // 连接杆
            for (a = [0, 90, 180, 270])
                rotate([0, 0, a])
                translate([22, 0, 0])
                    color(COLOR_FRAME)
                    rotate([90, 0, 0])
                        cylinder(r=1.5, h=3, center=true);
            // 卡扣
            for (a = [0, 90, 180, 270])
                rotate([0, 0, a])
                translate([30, 0, 0])
                    color(COLOR_ORANGE)
                    cube([10, 3, 5], center=true);
        }
    }

// ============ 起落架 ============
color(COLOR_FRAME) {
    // 横梁
    rotate([90, 0, 0])
        cylinder(r=4, h=90, center=true);
    // 纵梁
    cylinder(r=4, h=70, center=true);
}
// 斜撑
for (angle = [35, 145, 215, 325])
    rotate([0, 0, angle])
    translate([0, 18, 0])
        rotate([50, 0, 0])
            color(COLOR_FRAME)
            cylinder(r=3, h=30, center=true);
// 缓冲脚
for (x = [-42, 42])
    for (y = [-5, 5])
        color(COLOR_ORANGE)
        translate([x, y, -34])
            cylinder(r=5, h=5, center=true);
