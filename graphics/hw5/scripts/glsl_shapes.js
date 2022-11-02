var glsl_shapes = "\
struct Material {\
    vec3 ambient;\
    vec3 diffuse;\
    vec3 specular;\
    float power;\
    float opacity;\
};\
Material newMaterial(vec3 ambient, vec3 diffuse, vec3 specular, float power){\
    return Material(ambient,diffuse,specular,power,1.0);\
}\
const vec3 white = vec3(1,1,1);\
const Material dMaterial = Material(white, white, white,1.0,0.0);\
struct Hit{\
    float t_en;\
    float t_ex;\
    Material material;\
    vec4 normal;\
    bool isHit;\
};\
struct Quadratic {\
    Material material;\
    mat4 L;\
    mat4 transform;\
};\
Quadratic newParaboloid(Material material){\
    mat4 L = mat4(1,0,0,0,0,0,0,-1,0,0,1,0,0,0,0,-1);\
    return Quadratic(material,L,mat4(1));\
}\
Quadratic newSphere(Material material){\
    mat4 L = mat4(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,-1);\
    return Quadratic(material, L, mat4(1));\
}\
const Hit NO_HIT = Hit(-1.0, -1.0, dMaterial, vec4(0,0,0,0), false);\
Hit newHit(float t_en, float t_ex, Material material, vec4 normal){\
    return Hit(t_en, t_ex, material, normal, true);\
}\
Hit hitQuadratic(Quadratic q, vec4 v, vec4 w){\
    mat4 Q = transpose(q.transform) * q.L * q.transform;\
    float a = Q[0][0], f = Q[1][0]+Q[0][1], e = Q[2][0]+Q[0][2], g = Q[3][0]+Q[0][3], b = Q[1][1], d = Q[2][1]+Q[1][2];\
    float h = Q[3][1]+Q[1][3], c = Q[2][2], i = Q[3][2]+Q[2][3], j = Q[3][3];\
\
    float A = a * pow(w.x,2.0) + b * pow(w.y,2.0) + c * pow(w.z,2.0) + d * w.y * w.z + e * w.z * w.x + f * w.x * w.y;\
    float B = 2.0*(a*v.x*w.x + b*v.y*w.y + c*v.z*w.z) + d*(v.y*w.z + v.z * w.y) + e*(v.z*w.x + v.x*w.z) + f*(v.x*w.y + v.y*w.x) + g*w.x + h*w.y + i*w.z;\
    float C = a*pow(v.x,2.0) + b*pow(v.y,2.0) + c*(pow(v.z,2.0)) + d*v.y*v.z + e*v.z*v.x + f*v.x*v.y + g*v.x + h*v.y + i*v.z + j;\
\
    float discriminant = pow(B,2.0) - 4.0 * A * C;\
    float t_en = -1.0,t_ex = -1.0;\
    if (discriminant >=0.0){\
        float root = sqrt(discriminant);\
        float a2 = 2.0*A;\
\
        float root1 = (-B + root)/a2;\
        float root2 = (-B - root)/a2;\
\
        t_en = min(root1, root2);\
        t_ex = max(root1, root2);\
    }\
    vec4 P = v + t_en*w;\
    vec4 N = vec4(2.0*a*P.x + e*P.z + f*P.y + g,2.0*b*P.y + d*P.z + f*P.x + h,2.0*c*P.z + d*P.y + e*P.x + i,0);\
    return  newHit(t_en, t_ex, q.material, normalize(N));\
}\
struct Light{\
    vec4 position;\
    vec3 color;\
};"