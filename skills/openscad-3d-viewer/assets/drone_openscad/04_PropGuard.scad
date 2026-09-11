// 04_PropGuard.scad - 螺旋桨护圈（3寸桨）
// 内径90mm，适配3寸/3020桨
$fn = 64;
COLOR_FRAME  = [0.12, 0.12, 0.14];
COLOR_ORANGE = [0.90, 0.40, 0.02];

// 护圈环（torus近似：两个同心圆柱相减）
color(COLOR_FRAME)
rotate([90, 0, 0])
    difference() {
        cylinder(r=48, h=3, center=true);
        translate([0, 0, -2])
            cylinder(r=44, h=7, center=true);
    }

// 连接杆 x4
for (angle = [0, 90, 180, 270])
    rotate([0, 0, angle])
    translate([22, 0, 0])
        color(COLOR_FRAME)
        rotate([90, 0, 0])
            cylinder(r=1.5, h=3, center=true);

// 安装卡扣 x4
for (angle = [0, 90, 180, 270])
    rotate([0, 0, angle])
    translate([30, 0, 0])
        color(COLOR_ORANGE)
        cube([10, 3, 5], center=true);

// 加强肋 x4（护圈与连接杆之间）
for (angle = [0, 90, 180, 270])
    rotate([0, 0, angle + 45])
    translate([22, 0, 0])
        color(COLOR_FRAME)
        cube([3, 3, 5], center=true);
