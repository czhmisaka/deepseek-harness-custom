// 02_Arm.scad - 折叠臂（单支）
// 长度: 95mm，宽度: 18-14mm，厚度: 5mm
$fn = 64;
COLOR_FRAME  = [0.12, 0.12, 0.14];
COLOR_ORANGE = [0.90, 0.40, 0.02];

// 臂身（用多个截面叠加，模拟锥形）
color(COLOR_FRAME) {
    // 根部 (x=0): 宽18mm
    translate([0, 0, 0])
        cube([18, 6, 5], center=true);
    // 区间1
    translate([0, 15, 0])
        cube([17, 6, 5], center=true);
    // 区间2
    translate([0, 30, 0])
        cube([16, 6, 5], center=true);
    // 区间3
    translate([0, 45, 0])
        cube([15, 6, 5], center=true);
    // 区间4
    translate([0, 60, 0])
        cube([14, 6, 5], center=true);
    // 尖端 (x=85): 宽14mm
    translate([0, 75, 0])
        cube([14, 6, 5], center=true);
    // 电机平台
    translate([0, 85, 0])
        cube([18, 18, 5], center=true);
}

// 根部加强
color(COLOR_FRAME)
translate([0, -5, 0])
    cube([18, 10, 5], center=true);

// 铰链连接片
color(COLOR_ORANGE)
translate([0, -5, 2.5])
    difference() {
        cube([14, 10, 5], center=true);
        translate([0, -5, 0])
            rotate([90, 0, 0])
                cylinder(r=2, h=20, center=true);
        translate([0, 3, 0])
            cylinder(r=2, h=20, center=true);
    }

// 折叠止动槽
color(COLOR_FRAME)
translate([0, 40, 0])
    cube([12, 3, 5], center=true);

// 折叠定位凸起
color(COLOR_ORANGE)
translate([0, 55, 0])
    cube([10, 2, 5], center=true);

// 臂尖锁扣
color(COLOR_ORANGE)
translate([0, 80, 2.5])
    cube([14, 5, 5], center=true);

// 折叠止动齿（臂身上，折叠时与铰链配合）
for (z = [0, 5])
    color(COLOR_ORANGE)
    translate([0, 20, z])
        cube([20, 2, 1], center=true);
for (z = [0, 5])
    color(COLOR_ORANGE)
    translate([0, 65, z])
        cube([16, 2, 1], center=true);

// 电机安装孔 (12mm图案，M2.5)
for (x = [-6, 6])
    for (y = [-6, 6])
        translate([x, y + 85, -1])
            cylinder(r=1.25, h=7, center=true);

// 折叠状态定位孔（臂身侧面，用于折叠后固定）
translate([9, 42.5, 2.5])
    cylinder(r=1.5, h=3, center=true);
