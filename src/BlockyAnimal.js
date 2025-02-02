// BlockyAnimal.js
// Sourced from ColoredPoint.js (c) 2012 matsuda with CSE 160 Additional functionality
// Vertex shader program

// Ideas for add ons:
//  Last 5 used colors
var VSHADER_SOURCE =`
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    void main(){
        gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    }`;

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';


// Constants
// const POINT = 0;
// const TRIANGLE = 1;
// const CIRCLE = 2;

// Defining global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
// let u_Size;

// Global variables for HTML action
let g_clearColorR = 0.0;
let g_clearColorG = 0.0;
let g_clearColorB = 0.0;
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]
let g_selectedSize = 5;
// let g_selectedType = POINT;
let g_selectedSegments = 12;

let g_globalAngleX = 0;
let g_globalAngleY = 15;
let g_globalAngleZ = 0;


let g_yellowAngle = 0;
let g_MagentaAngle = 0;
let g_walkingAngle = 0;
let g_LegAngle = 0;
let g_BodyAngle = 0;



var g_shapesList = [];


function main() {
    setUpWebGL();
    connectVariablesToGLSL();
    addActionForHTMLUI();

    canvas.addEventListener("mousedown", () => g_isDragging = true);
    canvas.addEventListener("mouseup", () => g_isDragging = false);
    canvas.addEventListener("mouseleave", () => g_isDragging = false);
    canvas.addEventListener("mousemove", handleMouseMove);

    clearCanvas();
    renderScene()
    requestAnimationFrame(tick);
}
var g_startTime = performance.now() / 1000.0 ;
var g_seconds = performance.now() / 1000.0 - g_startTime;

var g_yellowAnimation = true;
var g_magentaAnimation = false;
var g_walkingAnimation = true;
var g_legAnimation = true;


let g_lastX = null;
let g_lastY = null;
let g_sensitivity = 0.5; // Adjust for smoother/faster rotation
let g_isDragging = false; 

// Asked ChatGPT for this - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function handleMouseMove(event) {
    if (!g_isDragging) return; // Only rotate if mouse is held down

    if (g_lastX === null || g_lastY === null) {
        g_lastX = event.clientX;
        g_lastY = event.clientY;
        return;
    }

    let deltaX = event.clientX - g_lastX;
    let deltaY = event.clientY - g_lastY;

    g_globalAngleY += deltaX * g_sensitivity; // Rotate around Y-axis (left-right)
    g_globalAngleZ += deltaY * g_sensitivity; // Rotate around Z-axis (up-down)

    g_lastX = event.clientX;
    g_lastY = event.clientY;

    renderScene();
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

function tick(){
    g_seconds = (performance.now() / 1000.0 - g_startTime) * 1.5;
    updateAnimationAngles();
    renderScene();   
    requestAnimationFrame(tick);

}

function clearCanvas(){
    gl.clearColor(g_clearColorR, g_clearColorG, g_clearColorB, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function setUpWebGL(){
    canvas = document.getElementById('webgl');

    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    ``
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);

}

function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

function addActionForHTMLUI(){
    document.getElementById('whiteCanvas').onclick = function () { 
        g_clearColorR = 1.0;
        g_clearColorG = 1.0
        g_clearColorB = 1.0;
        gl.clearColor(g_clearColorR, g_clearColorG, g_clearColorB, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        renderScene(); 

    };
    document.getElementById('creamCanvas').onclick = function () { 
        g_clearColorR = 1;
        g_clearColorG = 0.97;
        g_clearColorB = 0.89;
        gl.clearColor(g_clearColorR, g_clearColorG, g_clearColorB, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        renderScene(); 

    };
    document.getElementById('blackCanvas').onclick = function () { 
        g_clearColorR = 0.0;
        g_clearColorG = 0.0
        g_clearColorB = 0.0;
        gl.clearColor(g_clearColorR, g_clearColorG, g_clearColorB, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        renderScene(); 
    };

    document.getElementById('animateLegButtonON').onclick = function () {g_legAnimation = true};
    document.getElementById('animateLegButtonOFF').onclick = function () {g_legAnimation = false};

    document.getElementById('animateFeetButtonON').onclick = function () {g_magentaAnimation = true};
    document.getElementById('animateFeetButtonOFF').onclick = function () {g_magentaAnimation = false};

    document.getElementById('animateDogWalkingButtonON').onclick = function () {g_walkingAnimation = true};
    document.getElementById('animateDogWalkingButtonOFF').onclick = function () {g_walkingAnimation = false};


    document.getElementById('feetSlider').addEventListener('mousemove', function() { 
        g_MagentaAngle = -this.value; 
        renderScene(); 
    });

    document.getElementById('dogLegSlider').addEventListener('mousemove', function() { 
        g_LegAngle = -this.value; 
        renderScene(); 
    });

    document.getElementById('angleXSlider').addEventListener('mousemove', function() { 
        g_globalAngleX = this.value; 
        renderScene(); 
    });

    document.getElementById('angleYSlider').addEventListener('mousemove', function() { 
        g_globalAngleY = this.value; 
        renderScene(); 
    });

    document.getElementById('angleZSlider').addEventListener('mousemove', function() { 
        g_globalAngleZ = this.value; 
        renderScene(); 
    });
}

function updateAnimationAngles(){
    if(g_yellowAnimation){
        g_yellowAngle = 45 * Math.sin(g_seconds);

    }
    if(g_magentaAnimation){
        g_MagentaAngle = 45 * Math.sin(2.5 * g_seconds);
    }

    if(g_walkingAnimation){
        g_walkingAngle = 7 * Math.sin((3 * g_seconds));
        g_BodyAngle = 45 * Math.sin(2.5 * g_seconds);
    }

    if(g_legAnimation){
        g_LegAngle = 7 * Math.sin((3 * g_seconds));
    }
}

function renderScene(){
    var startTime = performance.now();

    // Rotate different axis
    let globalRotMat = new Matrix4()
    .rotate(g_globalAngleX, 1, 0, 0) 
    .rotate(g_globalAngleY, 0, 1, 0) 
    .rotate(g_globalAngleZ, 0, 0, 1);


    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Dog's Head
    var dogHead = new Cube();
    dogHead.color = [0.8, 0.7, 0.5, 1.0];
    dogHead.matrix.translate(-0.25, -0.05, -0.75);
    dogHead.matrix.rotate(g_BodyAngle * 0.075, 0, 1, 0);
    dogHead.matrix.rotate(g_BodyAngle * 0.125, 1, 0, 0);
    var dogHeadCoordsMatrix1 = new Matrix4(dogHead.matrix);
    var dogHeadCoordsMatrix2 = new Matrix4(dogHead.matrix);
    dogHead.matrix.scale(0.5, 0.5, 0.45);
    dogHead.render();


    // Dog's Mouth
    var dogMouth = new Cube();
    dogMouth.color = [0.35, 0.2, 0.1, 1.0];
    dogMouth.matrix = dogHeadCoordsMatrix1;
    dogMouth.matrix.translate(0.05, 0, -0.15);
    dogMouth.matrix.scale(0.4, 0.3, 0.15);
    dogMouth.render();

    // Dog's Nose
    var dogNose = new Cube();
    dogNose.color = [0.3, 0.15, 0.05, 1.0];
    dogNose.matrix = dogHeadCoordsMatrix1;
    dogNose.matrix.translate(0.35, 0.7, -0.15);
    dogNose.matrix.scale(0.3, 0.3, 0.15);
    dogNose.render();

    // Dog's Eyes
    var leftEye = new Cube();
    leftEye.color = [0.1, 0.1, 0.1, 1.0];
    leftEye.matrix = dogHeadCoordsMatrix2;
    leftEye.matrix.translate(0.05, 0.3, -0.1);
    leftEye.matrix.scale(0.1, 0.1, 0.1);
    leftEye.render();

    var rightEye = new Cube();
    rightEye.color = [0.1, 0.1, 0.1, 1.0];
    rightEye.matrix = dogHeadCoordsMatrix2;
    rightEye.matrix.translate(3, 0, -0.1);
    rightEye.render();

   // Dog's Ears
   var dogLeftEar = new Cube();
   dogLeftEar.matrix = dogHeadCoordsMatrix2;
   var dogLeftEarCoordsMatrix1 = new Matrix4(dogLeftEar.matrix);
   dogLeftEar.color = [0.8, 0.7, 0.5, 1.0];
   dogLeftEar.matrix.translate(0.525, 1.9, 2.5);
   dogLeftEar.matrix.scale(1.5, 1.5, 1.5);
   dogLeftEar.render();

   let leftEar = new Pyramid();
   leftEar.color = [0.35, 0.2, 0.1, 1.0];
   leftEar.matrix = dogLeftEarCoordsMatrix1;
   leftEar.matrix.rotate(180, 0, 0, 1);
   leftEar.matrix.translate(2.65, -3.425, 1.5);
   leftEar.matrix.scale(1.5, 1.5, 1.5);
   leftEar.render();

   var dogRightEar = new Cube();
   dogRightEar.matrix = dogHeadCoordsMatrix2;
   var dogRightEarCoordsMatrix = new Matrix4(dogRightEar.matrix);
   dogRightEar.color = [0.8, 0.7, 0.5, 1.0];
   dogRightEar.matrix.translate(-3.125, 0, 0);
   dogRightEar.render();

   let rightEar = new Pyramid();
   rightEar.color = [0.35, 0.2, 0.1, 1.0];
   rightEar.matrix = dogRightEarCoordsMatrix;
   rightEar.matrix.rotate(180, 0, 0, 1);
   rightEar.matrix.translate(-1.0, -1.025, -0.625);
   rightEar.render();

    // Dog's Body
    var torsoFront = new Cube();
    torsoFront.color = [0.8, 0.7, 0.5, 1.0];
    torsoFront.matrix.translate(-0.25, -0.4, -0.5);
    var torsoFrontMatrix1 = new Matrix4(torsoFront.matrix);
    var torsoFrontMatrix2 = new Matrix4(torsoFront.matrix);
    var torsoFrontMatrix3 = new Matrix4(torsoFront.matrix);
    torsoFront.matrix.rotate(g_BodyAngle * 0.07, 1, 0, 0);
    torsoFront.matrix.rotate(g_BodyAngle * 0.03, 0, 1, 0);
    torsoFront.matrix.scale(0.5, 0.4, 0.5);
    torsoFront.render();

    var torsoMiddle = new Cube();
    torsoMiddle.color = [0.8, 0.7, 0.5, 1.0];
    torsoMiddle.matrix = torsoFrontMatrix1;
    torsoMiddle.matrix.translate(0.025, 0.025, 0.425);
    // torsoMiddle.matrix.rotate(0, 1, 0, 0);
    torsoMiddle.matrix.scale(0.45, 0.35, 0.275);
    torsoMiddle.render();

    var torsoRear = new Cube();
    torsoRear.color =  [0.8, 0.7, 0.5, 1.0];
    torsoRear.matrix = torsoFrontMatrix2;
    var torsoRearMatrix = new Matrix4(torsoRear.matrix);
    torsoRear.matrix.translate(0, 0, 0.7);
    torsoRear.matrix.rotate(-g_BodyAngle * 0.07, 1, 1, 0);
    torsoFront.matrix.rotate(g_BodyAngle * 0.03, 0, 1, 0);
    torsoRear.matrix.scale(0.5, 0.4, 0.3);
    torsoRear.render();

    var dogTailBase = new Cube();
    dogTailBase.color = [0.8, 0.7, 0.5, 1.0];
    dogTailBase.matrix = torsoFrontMatrix2;
    dogTailBase.matrix.rotate(g_BodyAngle / 4, 0, 1, 0);
    var dogTailMatrix = new Matrix4(torsoFrontMatrix2);
    dogTailBase.matrix.translate(0.4, 0.8, 0.85);
    dogTailBase.matrix.rotate(-25, 1, 0, 0);
    dogTailBase.matrix.scale(0.2, 0.2, 0.6);
    dogTailBase.render();
    
    var dogTailEnd = new Pyramid();
    dogTailEnd.color = [0.8, 0.7, 0.5, 1.0];
    dogTailEnd.matrix = new Matrix4(dogTailMatrix);
    dogTailEnd.matrix.translate(0.4, 1.2, 1.25);
    dogTailEnd.matrix.rotate(50, 1, 0, 0);
    dogTailEnd.matrix.scale(0.20, 0.3, 0.2);
    dogTailEnd.render();
    
    // Dog's Legs
    var backLeftLeg = new Cube();
    backLeftLeg.color =  [0.8, 0.7, 0.5, 1.0];
    backLeftLeg.matrix = new Matrix4(torsoFrontMatrix3);
    backLeftLeg.matrix.rotate(g_LegAngle / 2, 1, 0, 0);
    var backLeftLegMatrix = new Matrix4(backLeftLeg.matrix);
    // backLeftLeg.matrix.translate(-0.2, -0.575, 0.3);
    backLeftLeg.matrix.translate(0.05, -0.25, 0.775);
    backLeftLeg.matrix.scale(0.1, 0.35, 0.125);
    backLeftLeg.render();

    var backRightLeg = new Cube();
    backRightLeg.color =  [0.8, 0.7, 0.5, 1.0];
    backRightLeg.matrix = new Matrix4(torsoFrontMatrix3);
    backRightLeg.matrix.rotate(-g_LegAngle / 2, 1, 0, 0);
    var backRightLegMatrix = new Matrix4(backRightLeg.matrix);
    backRightLeg.matrix.translate(0.36125, -0.25, 0.775);
    backRightLeg.matrix.scale(0.1, 0.35, 0.125);
    backRightLeg.render();

    var frontLeftLeg = new Cube();
    frontLeftLeg.color =  [0.8, 0.7, 0.5, 1.0];
    frontLeftLeg.matrix = new Matrix4(torsoFrontMatrix3);
    frontLeftLeg.matrix.rotate(-g_LegAngle / 1.5, 1, 0, 0);
    var frontLeftLegMatrix = new Matrix4(frontLeftLeg.matrix);
    frontLeftLeg.matrix.translate(0.05, -0.25, 0.15);
    frontLeftLeg.matrix.scale(0.1, 0.35, 0.125);
    frontLeftLeg.render();

    var frontRightLeg = new Cube();
    frontRightLeg.color =  [0.8, 0.7, 0.5, 1.0];
    frontRightLeg.matrix = new Matrix4(torsoFrontMatrix3);
    frontRightLeg.matrix.rotate(g_LegAngle / 1.5, 1, 0, 0);
    var frontRightLegMatrix = new Matrix4(frontRightLeg.matrix);
    frontRightLeg.matrix.translate(0.36125, -0.25, 0.15);
    frontRightLeg.matrix.scale(0.1, 0.35, 0.125);
    frontRightLeg.render();

    // Dog's Feet
    var backLeftFoot = new Cube();
    backLeftFoot.color = [0.575, 0.45, 0.3, 1.0];
    backLeftFoot.matrix = backLeftLegMatrix;
    backLeftFoot.matrix.translate(0.035, -0.275, 0.7375);
    backLeftFoot.matrix.rotate(g_MagentaAngle / 8, 1, 0, 0);
    backLeftFoot.matrix.scale(0.125, 0.1, 0.175);
    backLeftFoot.render();

    var backRightFoot = new Cube();
    backRightFoot.color = [0.575, 0.45, 0.3, 1.0];
    backRightFoot.matrix = backRightLegMatrix;
    backRightFoot.matrix.translate(0.35, -0.275, 0.7375);
    backRightFoot.matrix.rotate(g_MagentaAngle / 10, 1, 0, 0);
    backRightFoot.matrix.scale(0.125, 0.1, 0.175);
    backRightFoot.render();

    var frontLeftFoot = new Cube();
    frontLeftFoot.color = [0.575, 0.45, 0.3, 1.0];
    frontLeftFoot.matrix = frontLeftLegMatrix;
    frontLeftFoot.matrix.translate(0.035, -0.175, 0.2875);
    frontLeftFoot.matrix.rotate(180, 1, 0, 0);
    frontLeftFoot.matrix.rotate(g_MagentaAngle / 8, 1, 0, 0);
    frontLeftFoot.matrix.scale(0.125, 0.1, 0.175);
    frontLeftFoot.render();

    var frontRightFoot = new Cube();
    frontRightFoot.color = [0.575, 0.45, 0.3, 1.0];
    frontRightFoot.matrix = frontRightLegMatrix;
    frontRightFoot.matrix.translate(0.35, -0.175, 0.2875);
    frontRightFoot.matrix.rotate(180, 1, 0, 0);
    frontRightFoot.matrix.rotate(g_MagentaAngle / 10, 1, 0, 0);
    frontRightFoot.matrix.scale(0.125, 0.1, 0.175);
    frontRightFoot.render();

    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration) / 10, "numdot");
}

// Send text to HTML, used for duration of renderScene in this files 
function sendTextToHTML(text, htmlID){
    var htmlElm = document.getElementById(htmlID);
    if(!htmlElm){
        console.error("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}