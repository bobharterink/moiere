import * as THREE from "three";
import * as dat from "dat.gui";

var camera, scene, renderer;
var mesh, material, uniforms;
var clock = new THREE.Clock(1);
init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 400;

  scene = new THREE.Scene();

  var uniforms = {
    color1: { type: "c", value: new THREE.Color(0xffffff) },
    alpha1: { type: "f", value: 1.0, min: 0.0, max: 1.0 },
    color2: { type: "c", value: new THREE.Color(0x000000) },
    alpha2: { type: "f", value: 1.0, min: 0.0, max: 1.0 },
    lines: { type: "f", value: 100, min: 1, max: 150 },
    linewidth: { type: "f", value: 2.7, min: 0.0, max: 100.0 },
  };
  var vertexShader = document.getElementById("vertexShader").text;
  var fragmentShader = document.getElementById("fragmentShader").text;
  material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });
  material.transparent = true;
  // var geometry = new THREE.SphereGeometry(200, 20, 20);
  var geometry = new THREE.IcosahedronGeometry(200, 0);
  // material = new THREE.MeshBasicMaterial();
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  var light = new THREE.AmbientLight(0x404040); // soft white light
  scene.add(light);

  var directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);

  // stats = new Stats();
  // stats.domElement.style.position = 'absolute';
  // stats.domElement.style.bottom = '0px';
  // document.body.appendChild( stats.domElement );

  setupControls(uniforms);

  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  mesh.rotation.x += 0.005;
  mesh.rotation.y += 0.01;
  renderer.render(scene, camera);
  // stats.update();
}

function changeGeometry(type) {
  switch (type) {
    case "box":
      var geometry = new THREE.BoxGeometry(200, 200, 200);
      break;
    case "icosahedron":
      var geometry = new THREE.IcosahedronGeometry(200, 0);
      break;
    case "sphere":
      var geometry = new THREE.SphereGeometry(200, 20, 20);
      break;
    case "torusknot":
      var geometry = new THREE.TorusKnotGeometry();
      break;
  }
  mesh.geometry = geometry;
}

function setupControls(ob) {
  var gui = new dat.GUI();
  var sceneFolder = gui.addFolder("Scene");
  var geoController = sceneFolder.add({ Geometry: "sphere" }, "Geometry", [
    "box",
    "icosahedron",
    "sphere",
    "torusknot",
  ]);

  geoController.onChange(changeGeometry);
  var uniformsFolder = gui.addFolder("Uniforms");

  // Add a controller for changing the size of the entire object (mesh) in all directions
  var objectSizeController = gui
    .add(mesh.scale, "x")
    .min(0.1)
    .max(2)
    .step(0.1)
    .name("Size");

  // Add an event listener to keep all scale values equal when any one is changed
  objectSizeController.onChange(function (value) {
    mesh.scale.set(value, value, value);
  });

  for (var key in ob) {
    if (ob[key].hidden === undefined || !ob[key].hidden) {
      if (ob[key].type == "f") {
        var controller = uniformsFolder.add(ob[key], "value").name(key);
        if (typeof ob[key].min != "undefined") {
          controller.min(ob[key].min).name(key);
        }
        if (typeof ob[key].max != "undefined") {
          controller.max(ob[key].max).name(key);
        }
        controller.onChange(function (value) {
          this.object.value = parseFloat(value);
        });
      } else if (ob[key].type == "c") {
        ob[key].guivalue = [
          ob[key].value.r * 255,
          ob[key].value.g * 255,
          ob[key].value.b * 255,
        ];
        var controller = uniformsFolder.addColor(ob[key], "guivalue").name(key);
        controller.onChange(function (value) {
          this.object.value.setRGB(
            value[0] / 255,
            value[1] / 255,
            value[2] / 255
          );
        });
      }
    }
  }
  uniformsFolder.open();
  // var sourceFolder = gui.addFolder('Source');
  // var butob = {
  //     'view vertex shader code': function(){
  //       TINY.box.show({html:'<div style="width: 500px; height: 500px;"><h3 style="margin: 0px; padding-bottom: 5px;">Vertex Shader</h3><pre style="overflow: scroll; height: 470px;">'+document.getElementById('vertexShader').text+'</pre></div>',animate:false,close:false,top:5})
  //      },
  //      'view fragment shader code': function(){
  //        TINY.box.show({html:'<div style="width: 500px; height: 500px;"><h3 style="margin: 0px; padding-bottom: 5px;">Fragment Shader</h3><pre style="overflow: scroll; height: 470px;">'+document.getElementById('fragmentShader').text+'</pre></div>',animate:false,close:false,top:5})
  //      }
  // };
  // // sourceFolder.add(butob, 'view vertex shader code');
  // sourceFolder.add(butob, 'view fragment shader code');
}
