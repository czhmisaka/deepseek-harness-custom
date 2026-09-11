// 05_LandingGear.scad - 起落架
$fn = 64;
COLOR_FRAME  = [0.12, 0.12, 0.14];
COLOR_ORANGE = [0.90, 0.40, 0.02];

// 主体（X形）
color(COLOR_FRAME) {
    // 横梁
    rotate([90, 0, 0])
        translate([0, 0, 0])
            cylinder(r=4, h=90, center=true);
    
    // 纵梁
    translate([0, 0, 0])
        rotate([0, 0, 0])
            cylinder(r=4, h=70, center=true);
}

// 斜撑 x4
for (angle = [35, 145, 215, 325])
    rotate([0, 0, angle])
    translate([0, 18, 0])
        rotate([50, 0, 0])
            color(COLOR_FRAME)
            cylinder(r=3, h=30, center=true);

// 安装卡扣
color(COLOR_FRAME)
translate([0, 0, 6])
    cube([10, 10, 6], center=true);

// TPU 缓冲脚 x4
for (x = [-42, 42])
    for (y = [-5, 5])
        color(COLOR_ORANGE)
        translate([x, y, -34])
            cylinder(r=5, h=5, center=true);

// 脚架连接器（与横梁末端连接）
for (x = [-42, 42])
    color(COLOR_ORANGE)
    translate([x, 0, -18])
        cylinder(r=4, h=10, center=true);
