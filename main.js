import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { clamp, randFloat, randInt } from 'three/src/math/MathUtils.js';
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';
import {GUI} from 'lil-gui';

// function randomInt(min, max){
//      return Math.floor(Math.random() * (max-min+1)+min);
// }

const scene = new THREE.Scene(); 

const renderer = new THREE.WebGLRenderer(); 

// renderer.setClearColor(0xffffff);
renderer.setSize( window.innerWidth, window.innerHeight ); 

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); 

const controls = new OrbitControls(camera, renderer.domElement );
// by default no ascii effect
document.body.appendChild( renderer.domElement );

controls.update();
// const controls = new OrbitControls(camera, renderer.domElement );

let effect = new AsciiEffect( renderer, ' .:-+*=%@#', { invert: true, alpha: true} );
effect.setSize( window.innerWidth, window.innerHeight );
effect.domElement.style.color = 'white';
effect.domElement.style.backgroundColor = 'black';


let dots = [];
let connections = [];
let connectionIndex = 0;



class Connection{
     constructor(material, v1, v2){
          this.points = [];
          this.points.push(v1);
          this.points.push(v2);
          this.lineGeometry = new THREE.BufferGeometry().setFromPoints(this.points);
          this.line= new THREE.Line(this.lineGeometry, material);
     }
     changeLineGeometry(v1, v2){
          this.points = [];
          this.points.push(v1);
          this.points.push(v2);
          this.lineGeometry = new THREE.BufferGeometry().setFromPoints(this.points);
          this.line.geometry = this.lineGeometry;
     }
}
let usualLineMat = new THREE.LineBasicMaterial();
usualLineMat.color.setRGB(1, 1,1);
for(let i =0; i < 300; i++){
     let connection = new Connection(usualLineMat, new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0));
     connections.push(connection);
     scene.add(connection.line);
}

const settings = {
     dotsAmount: 10,
     dotTraversalRange: 100,
     maxLineDistance: 30.0,
     dotsSpeed: 0.05,
     dotsRadius: 2,
     disableConnectionAfterDistanceLimit: false,
     resetConnections: function(){
          for(let i = 0; i < connections.length; i++){
               connections[i].changeLineGeometry(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0));
          }
     },
     toggleASCII: false,
     
}

function showConnections(){
     for(let i = 0; i < connections.length; i++){
          connections[i].line.visible = true;
     }
}
function hideConnections(){
     for(let i = 0; i < connections.length; i++){
          connections[i].line.visible = false;
     }
}

let dotGeometry = new THREE.SphereGeometry(settings.dotsRadius); 
let dotMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } ); 

function changeDotsAmount(value){
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
gui.add(settings, 'dotsAmount', 3, 100, 1).onChange(value => changeDotsAmount(value));
gui.add(settings, 'dotTraversalRange', 30, 100);
gui.add(settings, 'maxLineDistance', 15, 100);
gui.add(settings, 'dotsSpeed', 0.05, 1);
gui.add(settings, 'dotsRadius', 1, 5, 1).onChange(value => changeDotsRadius(value));
// gui.add(settings, 'disableConnectionAfterDistanceLimit');
gui.add(settings, 'resetConnections');
gui.add(settings, 'toggleASCII').onChange(value => changeRender(value));

function changeDotsRadius(radius){
     dotGeometry = new THREE.SphereGeometry(radius); 
     for(let i = 0; i < settings.dotsAmount; i++){
          scene.remove(dots[i].mesh);
     }
     dots = [];

     for(let i = 0; i < settings.dotsAmount; i++){
          dots.push(new Dot(dotGeometry, dotMaterial));
          scene.add(dots[i].mesh);
     }
}

function changeRender(isActive){
     if(isActive){
          // Special case: append effect.domElement, instead of renderer.domElement.
          // AsciiEffect creates a custom domElement (a div container) where the ASCII elements are placed.
          document.body.removeChild( renderer.domElement );
          document.body.appendChild( effect.domElement );
          controls = new OrbitControls(camera, effect.domElement );
     }
     else{
          document.body.removeChild( effect.domElement );
          document.body.appendChild( renderer.domElement );
          controls = new OrbitControls(camera, effect.domElement );
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
                    // let colorVal = Math.random();
              
                    // let lineMat = new THREE.LineBasicMaterial();
                    // lineMat.color.setRGB(colorVal, colorVal,colorVal);
                    // let connection = new Connection(lineMat, dots[i].mesh.position, dots[j].mesh.position);
                    // connections.push(connection);
                    // scene.add(connection.line);
                    connections[connectionIndex].changeLineGeometry(dots[i].mesh.position, dots[j].mesh.position);
                    connectionIndex = connectionIndex >= 299 ? 0 : connectionIndex + 1;
               }
          }
     }
     
     if(settings.toggleASCII){
          effect.render( scene, camera ); 
     }
     else{
          renderer.render( scene, camera ); 
     }

     // if(settings.disableConnectionAfterDistanceLimit){
     //      hideConnections();
     // }
} 

renderer.setAnimationLoop( animate );