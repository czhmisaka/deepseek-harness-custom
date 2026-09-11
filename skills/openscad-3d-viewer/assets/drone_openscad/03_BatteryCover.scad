// 03_BatteryCover.scad - 电池仓盖
$fn = 64;
COLOR_SOFT   = [0.05, 0.05, 0.05];
COLOR_ORANGE = [0.90, 0.40, 0.02];

color(COLOR_SOFT)
difference() {
    translate([0, 0, 0])
        cube([64, 52, 8], center=true);
    
    // 轻量化孔
    for (x = [-18, 0, 18])
        for (y = [-16, 0, 16])
            translate([x, y, 0])
                cylinder(r=5, h=8, center=true);
    
    // 透明窗口
    translate([0, 0, 0])
        cube([30, 20, 8], center=true);
    
    // 锁扣孔
    for (y = [-20, 20])
        translate([30, y, 0])
            cylinder(r=2.5, h=8, center=true);
}

// 锁扣按钮
for (y = [-20, 20])
    color(COLOR_ORANGE)
    translate([32, y, 0])
        cylinder(r=3, h=10, center=true);
