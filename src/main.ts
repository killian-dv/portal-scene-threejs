import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import firefliesFragmentShader from "./shaders/fireflies/fragment.glsl";
import firefliesVertexShader from "./shaders/fireflies/vertex.glsl";
import portalFragmentShader from "./shaders/portal/fragment.glsl";
import portalVertexShader from "./shaders/portal/vertex.glsl";
import "./style.css";

/**
 * Base
 */
// Debug
const debugObject = {
  clearColor: "#201919",
};
const gui = new GUI({
  width: 400,
});
gui.addColor(debugObject, "clearColor").onChange(() => {
  renderer.setClearColor(debugObject.clearColor);
});

// Canvas
const canvas = document.querySelector<HTMLCanvasElement>("canvas.webgl");
if (!canvas) {
  throw new Error("Canvas not found");
}

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader();

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Textures
 */
const bakedTexture = textureLoader.load("/baked.jpg");
bakedTexture.flipY = false;
bakedTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Materials
 */
// Baked material
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });

// pole light material
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 });

// Portal material
const portalMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: new THREE.Uniform(0),
  },
  vertexShader: portalVertexShader,
  fragmentShader: portalFragmentShader,
  side: THREE.DoubleSide,
});

/**
 * Model
 */
gltfLoader.load("/portal.glb", (gltf) => {
  const model = gltf.scene;
  const baked = model.getObjectByName("baked");
  if (baked instanceof THREE.Mesh) {
    baked.material = bakedMaterial;
  }
  const poleLight = model.getObjectByName("poleLightA");
  if (poleLight instanceof THREE.Mesh) {
    poleLight.material = poleLightMaterial;
  }
  const poleLightB = model.getObjectByName("poleLightB");
  if (poleLightB instanceof THREE.Mesh) {
    poleLightB.material = poleLightMaterial;
  }
  const portal = model.getObjectByName("portalLight");
  if (portal instanceof THREE.Mesh) {
    portal.material = portalMaterial;
  }
  scene.add(model);
});

/**
 * Fireflies
 */

const firefliesGeometry = new THREE.BufferGeometry();
const firefliesCount = 30;
const positionArray = new Float32Array(firefliesCount * 3);
const scaleArray = new Float32Array(firefliesCount);

for (let i = 0; i < firefliesCount; i++) {
  positionArray[i * 3] = (Math.random() - 0.5) * 4;
  positionArray[i * 3 + 1] = Math.random() * 2;
  positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4;
  scaleArray[i] = Math.random();
}
firefliesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positionArray, 3),
);
firefliesGeometry.setAttribute(
  "aScale",
  new THREE.BufferAttribute(scaleArray, 1),
);
const firefliesMaterial = new THREE.ShaderMaterial({
  vertexShader: firefliesVertexShader,
  fragmentShader: firefliesFragmentShader,
  uniforms: {
    uPixelRatio: new THREE.Uniform(Math.min(window.devicePixelRatio, 2)),
    uSize: new THREE.Uniform(100),
    uTime: new THREE.Uniform(0),
  },
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});
const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial);
scene.add(fireflies);

gui
  .add(firefliesMaterial.uniforms.uSize, "value", 0, 500, 1)
  .name("Fireflies size");

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Update fireflies material
  firefliesMaterial.uniforms.uPixelRatio.value = Math.min(
    window.devicePixelRatio,
    2,
  );
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 4;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(debugObject.clearColor);
/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update fireflies material
  firefliesMaterial.uniforms.uTime.value = elapsedTime;

  // Update portal material
  portalMaterial.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
