import {
  AmbientLight,
  AxesHelper,
  DirectionalLight,
  GridHelper,
  PerspectiveCamera,
  Scene,
  MeshLambertMaterial,
  Raycaster,
  Vector2,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { IFCLoader } from 'web-ifc-three/IFCLoader';
import {
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
} from 'three-mesh-bvh';
// import { geometryTypes } from './geometry-types';
import {
  IfcAPI,
  IFCRELSPACEBOUNDARY,
  IFCSPACE,
  IFCWINDOW,
  IFCDOOR,
  IFCWALL,
  IFCWALLSTANDARDCASE,
} from 'web-ifc/web-ifc-api';
import { IFCBUILDINGSTOREY, IFCSLAB } from 'web-ifc';

//Creates the Three.js scene
const scene = new Scene();

//Object to store the size of the viewport
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//Creates the camera (point of view of the user)
const camera = new PerspectiveCamera(75, size.width / size.height);
camera.position.z = 15;
camera.position.y = 13;
camera.position.x = 8;

//Creates the lights of the scene
const lightColor = 0xffffff;

const ambientLight = new AmbientLight(lightColor, 0.5);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(lightColor, 1);
directionalLight.position.set(0, 10, 0);
directionalLight.target.position.set(-5, 0, 0);
scene.add(directionalLight);
scene.add(directionalLight.target);

//Sets up the renderer, fetching the canvas of the HTML
const threeCanvas = document.getElementById('three-canvas');
const renderer = new WebGLRenderer({ canvas: threeCanvas, alpha: true });
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//Creates grids and axes in the scene
const grid = new GridHelper(50, 30);
scene.add(grid);

const axes = new AxesHelper();
axes.material.depthTest = false;
axes.renderOrder = 1;
scene.add(axes);

//Creates the orbit controls (to navigate the scene)
const controls = new OrbitControls(camera, threeCanvas);
controls.enableDamping = true;
controls.target.set(-2, 0, 0);

//Animation loop
const animate = () => {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();

//Adjust the viewport to the size of the browser
window.addEventListener('resize', () => {
  (size.width = window.innerWidth), (size.height = window.innerHeight);
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
  renderer.setSize(size.width, size.height);
});

const button = document.getElementById('file-opener-button');
button.addEventListener('click', () => input.click());

//! Sets up the IFC loading

// const ifcapi = new IfcAPI();
// ifcapi.SetWasmPath('../../../../');
const ifcModels = [];
const ifcLoader = new IFCLoader();
ifcLoader.ifcManager.setWasmPath('../../../../');

// ifcLoader.ifcManager.setWasmPath('../../../');
// ifcLoader.load('../../../IFC/01.ifc', (ifcModel) => {
//   ifcModels.push(ifcModel);
//   scene.add(ifcModel);
// });

const input = document.getElementById('file-input');
let storeys = [];

input.addEventListener(
  'change',
  async () => {
    const file = input.files[0];
    const url = URL.createObjectURL(file);
    const model = await ifcLoader.loadAsync(url);

    ifcModels.push(model);
    scene.add(model);

    storeys = await ifcLoader.ifcManager.getAllItemsOfType(
      model.modelID,
      IFCSLAB,
      false,
    );

    // const reader = new FileReader();
    // reader.onload = () => loadFile(reader.result);
    // reader.readAsText(changed.target.files[0]);
  },
  false,
);

//!!!

// Sets up optimized picking
ifcLoader.ifcManager.setupThreeMeshBVH(
  computeBoundsTree,
  disposeBoundsTree,
  acceleratedRaycast,
);

const raycaster = new Raycaster();
raycaster.firstHitOnly = true;
const mouse = new Vector2();

function cast(event) {
  // Computes the position of the mouse on the screen
  const bounds = threeCanvas.getBoundingClientRect();

  const x1 = event.clientX - bounds.left;
  const x2 = bounds.right - bounds.left;
  mouse.x = (x1 / x2) * 2 - 1;

  const y1 = event.clientY - bounds.top;
  const y2 = bounds.bottom - bounds.top;
  mouse.y = -(y1 / y2) * 2 + 1;

  // Places it on the camera pointing to the mouse
  raycaster.setFromCamera(mouse, camera);

  // Casts a ray
  return raycaster.intersectObjects(ifcModels);
}

let currentModelId = null;
let storeyId = null;
let props = null;
const output = document.getElementById('id-output');

async function pick(event) {
  const found = cast(event)[0];
  if (found) {
    const index = found.faceIndex;
    const geometry = found.object.geometry;
    const ifc = ifcLoader.ifcManager;
    storeyId = ifc.getExpressId(geometry, index);

    // currentModelId = found.object.modelID;
    currentModelId = found.object.modelID;

    console.log(storeyId, currentModelId);

    props = await ifc.getItemProperties(currentModelId, storeyId);
    console.log(props);
    output.innerHTML = JSON.stringify(props, null, 2);
  }
}

window.ondblclick = pick;

// let outerJSON = '';

// output.addEventListener(
//   'input',
//   (event) => {
//     outerJSON = event.target.outerText;
//     // console.log(outerJSON);
//   },
//   false,
// );

const setChanges = document.getElementById('set-changes');
setChanges.addEventListener('click', () => {
  //   console.log(currentModelId, JSON.parse(output.outerText));
  //   ifcLoader.ifcManager.ifcAPI.WriteLine(
  //     currentModelId,
  //     JSON.parse(output.outerText),
  //   );
  const a = JSON.parse(output.outerText);
  const keys = Object.keys(a);

  console.log('keys', a, keys);

  //   const elem = ifcLoader.ifcManager.ifcAPI.GetLine(currentModelId, storeyId);
  //   console.log(elem);

  keys.forEach((field) => {
    props[field] = a[field];
  });

  ifcLoader.ifcManager.ifcAPI.WriteLine(currentModelId, props);
});

async function save() {
  const data = await ifcLoader.ifcManager.ifcAPI.ExportFileAsIFC(
    currentModelId,
  );
}
