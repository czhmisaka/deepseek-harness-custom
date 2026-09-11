// 06_MotorMountAdapter.scad - 电机安装转接板
// 用途: 3寸/4寸电机通用安装
// 标准: 12mm/16mm/19mm 螺丝孔图案
$fn = 64;
COLOR_FRAME  = [0.12, 0.12, 0.14];
COLOR_ORANGE = [0.90, 0.40, 0.02];

difference() {
    // 主体（直径40mm圆盘）
    color(COLOR_FRAME)
    cylinder(r=20, h=4, center=true);
    
    // 中心轴孔（穿过桨轴）
    cylinder(r=6, h=5, center=true);
    
    // 12mm螺丝孔 x4（内转子微型电机）
    for (x = [-6, 6])
        for (y = [-6, 6])
            translate([x, y, 0])
                cylinder(r=1.25, h=5, center=true);
}

// 16mm螺丝孔 x4（外转子电机）加强肋
color(COLOR_FRAME)
for (x = [-8, 0, 8])
    for (y = [-8, 0, 8])
        translate([x, y, 0])
            cylinder(r=1.5, h=3, center=true);

// 倒角装饰（边缘橙色环）
color(COLOR_ORANGE)
difference() {
    cylinder(r=20, h=1, center=true);
    cylinder(r=18, h=2, center=true);
}

// 中心轴台（防止桨轴晃动）
color(COLOR_ORANGE)
cylinder(r=4, h=2, center=true);
