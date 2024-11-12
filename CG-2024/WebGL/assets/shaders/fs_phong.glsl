#version 300 es
precision highp float;

in vec3 v_normal;
in vec3 v_lightDirection;
in vec3 v_cameraDirection;

// Scene uniforms
uniform vec4 u_ambientLight;
uniform vec4 u_diffuseLight;
uniform vec4 u_specularLight;

// Model Uniforms
uniform vec4 u_ambientColor;
uniform vec4 u_diffuseColor;
uniform vec4 u_specularColor;
uniform float u_shininess;

out vec4 outColor;

void main() {
    // Ambient lightning componente
    vec4 ambient = u_ambientLight * u_ambientColor;

    // Diffuse light component
    vec3 v_n_n = normalize(v_normal);
    vec3 v_l_n = normalize(v_lightDirection);
    vec3 v_c_n = normalize(v_cameraDirection);

    // Para calcular lo del especular
    vec3 v_parallel = v_n_n * dot(v_n_n, v_l_n);
    vec3 v_perpendicular = v_l_n - v_parallel;
    vec3 v_reflex = v_parallel - v_perpendicular;

    float base = dot(v_c_n, v_reflex);
    float result = pow(base, u_shininess);

    vec4 specular = vec4(0, 0, 0, 1);
    if (base > 0.0) {
        specular = u_specularColor * u_specularLight * result;
    }
    
    vec4 diffuse = vec4(0, 0, 0, 1);
    float lambert = dot(v_n_n, v_l_n);   // lambert es el científico que descubrió lo del producto punto que mide lo de la iluminación
    if (lambert > 0.0) {
        diffuse = u_diffuseLight * u_diffuseColor * lambert;
    }


    outColor = ambient + diffuse + specular;
}
