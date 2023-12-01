import "./style.css";
import * as THREE from "three";
import { gsap } from "gsap";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Colors
const COLORS = {
  background: "white",
  light: "#ffffff",
  sky: "#aaaaff",
  ground: "#88ff88",
};

const PI = Math.PI;

// SCENE

let size = { width: 0, height: 0 };

const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.background);
scene.fog = new THREE.Fog(COLORS.background, 15, 20);

// RENDERER

const renderer = new THREE.WebGL1Renderer({
  antialias: true,
});

renderer.physicallyCorrectLights = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 5;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const container = document.querySelector(".canvas");
container.appendChild(renderer.domElement);

// CAMERA

const camera = new THREE.PerspectiveCamera(
  40,
  size.width / size.height,
  0.1,
  100
);
camera.position.set(0, 1, 5);
let cameraTarget = new THREE.Vector3(0, 1, 0);

scene.add(camera);

// LIGHTS

const directionalLight = new THREE.DirectionalLight(COLORS.light, 2);
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 10;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(2, 5, 3);

scene.add(directionalLight);

const hemisphereLight = new THREE.HemisphereLight(
  COLORS.sky,
  COLORS.ground,
  0.5
);
scene.add(hemisphereLight);

// FLOOR

// const plane = new THREE.PlaneGeometry(100, 100);
// const floorMaterial = new THREE.MeshStandardMaterial({ color: COLORS.ground });
// const floor = new THREE.Mesh(plane, floorMaterial);
// floor.receiveShadow = true;
// floor.rotateX(-Math.PI * 0.5);

// scene.add(floor);

// ON RESIZE

const onResize = () => {
  size.width = container.clientWidth;
  size.height = container.clientHeight;

  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();

  renderer.setSize(size.width, size.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};

window.addEventListener("resize", onResize);
onResize();

// TICK

const tick = () => {
  camera.lookAt(cameraTarget);
  renderer.render(scene, camera);
  window.requestAnimationFrame(() => tick());
};

tick();

const toLoad = [
  { name: "office", file: "scene.gltf", group: new THREE.Group() },
];

const models = {};

const setupAnimation = () => {
  ScrollTrigger.matchMedia({
    "(prefers-reduced-motion: no-preference)": desktopAnimation,
  });
};

const desktopAnimation = () => {
  let section = 0;
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".page1",
      start: "top top",
      end: "bottom bottom",
      markers: true,
      scrub: 0.1,
    },
  });
  tl.to(models.office.rotation, { y: 1.5 }, section);
  tl.to(models.office.position, { x: 1 }, section);
  tl.to(models.office.position, { z: 2 }, section);

  section += 1
  tl.to(models.office.rotation, { y: 3.05 }, section);
  tl.to(models.office.position, { x: -.2 }, section);
  tl.to(models.office.position, { z: 3.2 }, section);
};

const LoadingManager = new THREE.LoadingManager(() => {
  setupAnimation();
});

// const progressBar = document.getElementById("progress-bar");

// LoadingManager.onProgress = function (url, loaded, total) {
//   progressBar.value = (loaded / total) * 100;
// };

// const progressBarContainer = document.querySelector(".progress-bar-container");

// LoadingManager.onLoad = function () {
//   progressBarContainer.style.display = "none";
// };

const gltfLoader = new GLTFLoader(LoadingManager);

toLoad.forEach((item) => {
  gltfLoader.load(item.file, (model) => {
    model.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.receiveShadow = true;
        child.castShadow = true;
      }
    });
    model.scene.rotation.y = 4.8;
    model.scene.position.x = -0.3;
    model.scene.position.y = 1;
    model.scene.position.z = -0.8;
    item.group.add(model.scene);
    scene.add(item.group);
    models[item.name] = item.group;
  });
});
