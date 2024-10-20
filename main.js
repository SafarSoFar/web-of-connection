import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { clamp, randFloat, randInt } from 'three/src/math/MathUtils.js';
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';

// function randomInt(min, max){
//      return Math.floor(Math.random() * (max-min+1)+min);
// }

const dotsAmount = 10;
const maxDistance = 50.0;

class Connection{
     constructor(material, v1, v2){
          this.points = [];
          this.points.push(v1);
          this.points.push(v2);
          this.lineGeometry = new THREE.BufferGeometry().setFromPoints(this.points);
          this.line= new THREE.Line(this.lineGeometry, material);
     }
}

class Dot{
     constructor(geometry, material){
          this.mesh = new THREE.Mesh(geometry, material);
          this.mesh.position.set(randInt(-100,100), randInt(-100,100), randInt(-100,100));
          this.timer = 0.0;
          this.cooldown = randFloat(0.2, 0.3);
          this.setRandDestination();
          this.clock = new THREE.Clock();
     }

     move(){
          if(this.timer < this.cooldown){
               this.timer += this.clock.getDelta();
               this.mesh.position.lerp(this.destination, 0.1); 
          }
          else{
               this.timer = 0.0;
               this.cooldown = randFloat(0.3, 0.5);
               this.setRandDestination();
          }
     }
     setRandDestination(){
          this.destination = new THREE.Vector3(randInt(-100,100), randInt(-100,100), randInt(-100,100));
     }

}


const scene = new THREE.Scene(); 
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); 

const renderer = new THREE.WebGLRenderer(); 
// renderer.setClearColor(0xffffff);
renderer.setSize( window.innerWidth, window.innerHeight ); 

// let effect = new AsciiEffect( renderer, ' .:-+*=%@#', { invert: true, alpha: true} );
// effect.setSize( window.innerWidth, window.innerHeight );
// effect.domElement.style.color = 'white';
// effect.domElement.style.backgroundColor = 'black';

// Special case: append effect.domElement, instead of renderer.domElement.
// AsciiEffect creates a custom domElement (a div container) where the ASCII elements are placed.

// document.body.appendChild( effect.domElement );

document.body.appendChild( renderer.domElement );

// const controls = new OrbitControls(camera, effect.domElement );
const controls = new OrbitControls(camera, renderer.domElement );

const geometry = new THREE.SphereGeometry(1); 
const material = new THREE.MeshBasicMaterial( { color: 0xffffff } ); 

let dots = [];
for(let i = 0; i < dotsAmount; i++){
     dots.push(new Dot(geometry, material));
     scene.add(dots[i].mesh);
}

camera.position.z = 80;

let connections = [];




function animate() {
     for(let i = 0; i < dotsAmount; i++){
          dots[i].move();
     }

     

     for(let i = 0; i < dotsAmount; i++){
          for(let j = i+1; j < dotsAmount; j++){
               let distance = dots[i].mesh.position.distanceTo(dots[j].mesh.position);
               if(distance <= maxDistance){
                    let colorVal = Math.random();
                    // let colorVal = 0;
                    let lineMat = new THREE.LineBasicMaterial();
                    lineMat.color.setRGB(colorVal, colorVal,colorVal);
                    let connection = new Connection(lineMat, dots[i].mesh.position, dots[j].mesh.position);
                    connections.push(connection);
                    scene.add(connection.line);
               }
          }
     }
     
     // effect.render( scene, camera ); 
     renderer.render( scene, camera ); 
     for(let i = 0; i < connections.length; i++){
          // scene.remove(connections[i].line);
     }
     connections = [];
} 

renderer.setAnimationLoop( animate );