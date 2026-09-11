// 07_ArmFolded.scad - 折叠臂（折叠位置）
// 折叠角度: 90度向上（相对于展开位置）
// 用于验证折叠后尺寸: 90×60×30mm
$fn = 64;
COLOR_FRAME  = [0.12, 0.12, 0.14];
COLOR_ORANGE = [0.90, 0.40, 0.02];

// 臂身（垂直向上折叠）
color(COLOR_FRAME) {
    // 分段叠加（近似锥形）
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
    // 电机平台
    translate([0, 0, 65])
        cube([18, 18, 5], center=true);
}

// 折叠状态定位孔（与中央舱配合）
translate([9, 0, 30])
    cube([3, 3, 3], center=true);

// 折叠锁扣
color(COLOR_ORANGE)
translate([0, 0, 60])
    cube([14, 5, 5], center=true);

// 电机安装孔
for (x = [-6, 6])
    for (y = [-6, 6])
        translate([x, y, 66])
            cylinder(r=1.25, h=7, center=true);
