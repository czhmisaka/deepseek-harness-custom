// 08_FoldedAssembly.scad - 折叠状态总装
// 手抛时的携带尺寸: 90×60×35mm
$fn = 64;
COLOR_FRAME  = [0.12, 0.12, 0.14];
COLOR_ORANGE = [0.90, 0.40, 0.02];
COLOR_SOFT   = [0.05, 0.05, 0.05];

// 中央舱（压缩版，与展开版相同但无GPS柱）
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
    // 折叠臂槽（垂直向上）
    for (angle = [0, 90, 180, 270])
        rotate([0, 0, angle])
            translate([0, 0, 22])
                cube([18, 14, 20], center=true);
    for (x = [-20, 20])
        translate([x, 0, 0])
            rotate([90, 0, 0])
                cylinder(r=4, h=8, center=true);
}

// 折叠臂 x4（垂直向上折叠）
for (angle = [0, 90, 180, 270])
    rotate([0, 0, angle])
    translate([0, 0, 22])
    color(COLOR_FRAME) {
        // 臂身（折叠位置=垂直）
        translate([0, 0, 5])
            cube([18, 6, 5], center=true);
        translate([0, 0, 15])
            cube([17, 6, 5], center=true);
        translate([0, 0, 25])
            cube([16, 6, 5], center=true);
        translate([0, 0, 35])
            cube([15, 6, 5], center=true);
        translate([0, 0, 45])
            cube([14, 6, 5], center=true);
        translate([0, 0, 55])
            cube([14, 6, 5], center=true);
        translate([0, 0, 65])
            cube([18, 18, 5], center=true);
        
        // 折叠锁扣
        color(COLOR_ORANGE)
        translate([0, 0, 60])
            cube([14, 5, 5], center=true);
        
        // 电机安装孔
        for (x = [-6, 6])
            for (y = [-6, 6])
                translate([x, y, 66])
                    cylinder(r=1.25, h=7, center=true);
    }

// 电池仓盖（顶部）
color(COLOR_SOFT)
translate([0, 0, 32])
    cube([64, 52, 8], center=true);

// 手柄（可选，方便手抛握持）
color(COLOR_FRAME)
translate([-25, 0, -12])
    rotate([15, 0, 0])
    translate([0, 0, -8])
        cube([20, 30, 16], center=true);
