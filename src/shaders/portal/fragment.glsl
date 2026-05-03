varying vec2 vUv;
uniform float uTime;
uniform vec3 uColorStart;
uniform vec3 uColorEnd;

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

  // clamp the strength
  strength = clamp(strength, 0.0, 1.0);

  vec3 color = mix(uColorStart, uColorEnd, strength);
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}