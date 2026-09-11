// 01_Body.scad - 中央舱
$fn = 64;
COLOR_FRAME  = [0.12, 0.12, 0.14];
COLOR_ORANGE = [0.90, 0.40, 0.02];
COLOR_SOFT   = [0.05, 0.05, 0.05];

module Body() {
    difference() {
        // 主体
        translate([0, 0, 4])
            cube([70, 60, 28], center=true);
        
        // 电池仓
        translate([0, 0, 9])
            cube([62, 50, 22], center=true);
        
        // FC 安装槽
        translate([0, 0, 22])
            cube([36, 36, 6], center=true);
        
        // FC 螺丝孔 x4
        for (x = [-10, 10])
            for (y = [-10, 10])
                translate([x, y, 26])
                    cylinder(r=1.0, h=6, center=true);
        
        // 折叠臂定位槽 x4
        for (angle = [0, 90, 180, 270])
            rotate([0, 0, angle])
                translate([0, 30, 0])
                    cube([18, 14, 30], center=true);
        
        // 散热孔
        for (x = [-20, 20])
            translate([x, 0, 0])
                rotate([90, 0, 0])
                    cylinder(r=4, h=8, center=true);
    }
    
    // 铰链座 x4
    for (angle = [0, 90, 180, 270])
        rotate([0, 0, angle])
            translate([0, 30, 0]) {
                color(COLOR_ORANGE)
                difference() {
                    cylinder(r=9, h=8, center=true);
                    translate([0, 3, 0])
                        rotate([90, 0, 0])
                            cylinder(r=2, h=20, center=true);
                }
                for (i = [0:3])
                    rotate([0, 0, i*90])
                        translate([6, 3, 0])
                            cylinder(r=1.5, h=3, center=true);
            }
    
    // GPS 安装柱
    translate([0, 15, 26])
        cylinder(r=3, h=8, center=true);
    
    // 天线出口
    translate([-38, 0, 0])
        rotate([90, 0, 0])
            cylinder(r=2, h=8, center=true);
    
    // 加强筋
    for (x = [-25, 25])
        for (y = [-20, 20])
            translate([x, y, -8])
                cylinder(r=3, h=14, center=true);
}

Body();
