varying vec2 vUv;
uniform float uTime;

#include ../includes/perlin-3D-noise.glsl;

void main() {
  // displace the uv
  vec2 displacedUv = vUv + cnoise(vec3(vUv * 5.0, uTime * 0.1));
  // perlin noise
  float strength = cnoise(vec3(displacedUv * 5.0, uTime * 0.2));
  // outer glow
  float outerGlow = distance(vUv, vec2(0.5)) * 5.0 - 1.4;
  // combine the strength and outer glow
  strength += outerGlow;
  strength += step(- 0.2, strength) * 0.8;
  gl_FragColor = vec4(vec3(strength), 1.0);
  #include <colorspace_fragment>
}