import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { randInt } from 'three/src/math/MathUtils.js';
import { rand, Vector3 } from 'three/webgpu';

// function randomInt(min, max){
//      return Math.floor(Math.random() * (max-min+1)+min);
// }

class Dot{
     constructor(geometry, material){
          this.radius = 1;
          this.mesh = new THREE.Mesh(geometry, material);
          this.timer = 0.0;
          this.setRandDestination();
          this.clock = new THREE.Clock();
     }

     move(){
          if(this.timer < 1.0){
               this.timer += this.clock.getDelta();
               this.mesh.position.lerp(this.destination, 0.05); 
          }
          else{
               this.timer = 0.0;
               this.setRandDestination();
          }
     }
     setRandDestination(){
          this.destination = new Vector3(randInt(-15,15), randInt(-15,15), randInt(-15,15));
     }

}


const scene = new THREE.Scene(); 
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); 

const renderer = new THREE.WebGLRenderer(); 
renderer.setSize( window.innerWidth, window.innerHeight ); 
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls(camera, renderer.domElement );

const geometry = new THREE.SphereGeometry(1); 
const material = new THREE.MeshBasicMaterial( { color: 0xffffff } ); 
var dot = new Dot(geometry, material);
scene.add( dot.mesh ); 
camera.position.z = 5;

function animate() {
     dot.move();
     renderer.render( scene, camera ); 
} 
renderer.setAnimationLoop( animate );