import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { clamp, randFloat, randInt } from 'three/src/math/MathUtils.js';
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';
import {GUI} from 'lil-gui';

// function randomInt(min, max){
//      return Math.floor(Math.random() * (max-min+1)+min);
// }

const scene = new THREE.Scene(); 

const dotGeometry = new THREE.SphereGeometry(5); 
const dotMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } ); 

let dots = [];



let connections = [];

const settings = {
     dotsAmount: 10,
     dotTraversalRange: 100,
     maxLineDistance: 30.0,
     dotsSpeed: 0.05,
     deleteConnectionAfterDistanceLimit: false,
     deleteConnections: function(){
          for(let i = 0; i < connections.length; i++){
               scene.remove(connections[i].line);
          }
          connections = [];
     }
     
}

function changeDotsAmount(value){
     console.log("be");

     for(let i = 0; i < dots.length; i++){
          scene.remove(dots[i].mesh);
     }
     dots = [];

     for(let i = 0; i < value; i++){
          dots.push(new Dot(dotGeometry, dotMaterial));
          scene.add(dots[i].mesh);
     }
     // if(value > settings.dotsAmount){
     //      for(let i = settings.dotsAmount; i < value; i++){
     //           dots.push(new Dot(dotGeometry, dotMaterial));
     //           scene.add(dots[i].mesh);
     //      }
     // }
     // else{
     //      for(let i = settings.dotsAmount-1; i > value; i--){
     //           scene.remove(dots[i].mesh);
     //           dots.pop();
     //      }
     // }
}

const gui = new GUI();
gui.add(settings, 'dotsAmount', 3, 30, 1).onChange(value => changeDotsAmount(value));
gui.add(settings, 'dotTraversalRange', 30, 100);
gui.add(settings, 'maxLineDistance', 15, 100);
gui.add(settings, 'dotsSpeed', 0.05, 1);
gui.add(settings, 'deleteConnectionAfterDistanceLimit');
gui.add(settings, 'deleteConnections');



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

          this.mesh.position.set(randInt(-settings.dotTraversalRange,settings.dotTraversalRange), 
          randInt(-settings.dotTraversalRange,settings.dotTraversalRange), 
          randInt(-settings.dotTraversalRange,settings.dotTraversalRange));

          this.timer = 0.0;
          this.cooldown = randFloat(0.2, 0.3);
          this.destination = this.getRandPos();
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
               this.destination = this.getRandPos();
          }
     }
     getRandPos(){
          return new THREE.Vector3(randInt(-settings.dotTraversalRange,settings.dotTraversalRange), 
          randInt(-settings.dotTraversalRange,settings.dotTraversalRange), 
          randInt(-settings.dotTraversalRange,settings.dotTraversalRange));
     }

}


const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); 


const renderer = new THREE.WebGLRenderer(); 
// renderer.setClearColor(0xffffff);
renderer.setSize( window.innerWidth, window.innerHeight ); 

let effect = new AsciiEffect( renderer, ' .:-+*=%@#', { invert: true, alpha: true} );
effect.setSize( window.innerWidth, window.innerHeight );
effect.domElement.style.color = 'white';
effect.domElement.style.backgroundColor = 'black';

// Special case: append effect.domElement, instead of renderer.domElement.
// AsciiEffect creates a custom domElement (a div container) where the ASCII elements are placed.

document.body.appendChild( effect.domElement );

// document.body.appendChild( renderer.domElement );

const controls = new OrbitControls(camera, effect.domElement );
controls.update();
// const controls = new OrbitControls(camera, renderer.domElement );
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 72) { // 'h' ascii value
        gui.show(gui._hidden);
    }
};


for(let i = 0; i < settings.dotsAmount; i++){
     dots.push(new Dot(dotGeometry, dotMaterial));
     scene.add(dots[i].mesh);
}


camera.position.z = 300;

function animate() {
     for(let i = 0; i < settings.dotsAmount; i++){
          dots[i].move();
     }

     

     for(let i = 0; i < settings.dotsAmount; i++){
          for(let j = i+1; j < settings.dotsAmount; j++){
               let distance = dots[i].mesh.position.distanceTo(dots[j].mesh.position);
               if(distance <= settings.maxLineDistance){
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
     
     
     effect.render( scene, camera ); 
     // renderer.render( scene, camera ); 

     if(settings.deleteConnectionAfterDistanceLimit){
          settings.deleteConnections();
     }
} 

renderer.setAnimationLoop( animate );