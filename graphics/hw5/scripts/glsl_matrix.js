var glsl_matrix = "\
mat4 transpose(mat4 m){\
    return mat4(m[0][0],m[1][0],m[2][0],m[3][0],m[0][1],m[1][1],m[2][1],m[3][1],m[0][2],m[1][2],m[2][2], m[3][2],m[0][3],m[1][3],m[2][3],m[3][3]);\
}\
mat4 rxMatrix(float rad){\
    return mat4(1,0,0,0,0,cos(rad),sin(rad),0,0,-sin(rad),cos(rad),0,0,0,0,1);\
}\
mat4 rzMatrix(float rad){\
    return mat4(cos(rad), sin(rad), 0, 0,-sin(rad), cos(rad), 0, 0,0, 0, 1, 0,0, 0, 0, 1);\
}\
mat4 sMatrix(vec3 s_){\
    vec3 s = 1.0/s_;\
    return mat4(s.x,0.0,0.0,0.0,0.0,s.y,0.0, 0.0,0.0, 0.0, s.z, 0.0,0.0, 0.0, 0.0, 1.0);\
}\
mat4 tMatrix(vec3 t){\
    return mat4(1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0, 0.0,-t.x,-t.y,-t.z,1.0);\
}\
";