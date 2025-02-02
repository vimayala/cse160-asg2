// blockyanimal.js
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
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Defining global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

// Global variables for HTML action
let g_clearColorR = 0.0;
let g_clearColorG = 0.0;
let g_clearColorB = 0.0;
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegments = 12;

let g_globalAngleX = 0;
let g_globalAngleY = 15;
let g_globalAngleZ = 0;


let g_yellowAngle = 0;
let g_MagentaAngle = 0;


var g_shapesList = [];


function main() {
    setUpWebGL();
    connectVariablesToGLSL();
    addActionForHTMLUI();

    // Register function (event handler) to be called on a mouse press and allows clicking and dragging on the canvas
    // canvas.onmousedown = handleClicks;
    // canvas.onmousemove = function(ev) { if(ev.buttons === 1){ handleClicks(ev); } };

    canvas.addEventListener("mousedown", () => g_isDragging = true);
    canvas.addEventListener("mouseup", () => g_isDragging = false);
    canvas.addEventListener("mouseleave", () => g_isDragging = false);
    canvas.addEventListener("mousemove", handleMouseMove);

    clearCanvas();
    // updateColorPreview();
    renderAllShapes()
    requestAnimationFrame(tick);
}
var g_startTime = performance.now() / 1000.0 ;
var g_seconds = performance.now() / 1000.0 - g_startTime;
var g_yellowAnimation = true;
var g_magentaAnimation = false;

let g_lastX = null;
let g_lastY = null;
let g_sensitivity = 0.5; // Adjust for smoother/faster rotation
let g_isDragging = false; 


// Asked ChatGPT for this
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

    renderAllShapes();
}

function tick(){
    g_seconds = performance.now() / 1000.0 - g_startTime;
    updateAnimationAngles();
    renderAllShapes();   
    requestAnimationFrame(tick);

}

// function handleClicks(ev) {
//     // Get x,y coords and return it to WebGL coordinates
//     [x,y ,x,y, x,y] = convertCoordinatesToGL(ev);

//     // Create and store new point with position, color, and size set
//     let point;

//     // Create new shape through button feedback
//     if(g_selectedType == POINT){
//         point = new Point;
//     }
//     else if (g_selectedType == TRIANGLE){
//         point = new Triangle;
//     }
//     else{
//         point = new Circle;
//     }

//     point.position = [x, y];
//     point.color = [g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], g_selectedColor[3]];
//     point.size = g_selectedSize;
//     point.segments = g_selectedSegments;
//     g_shapesList.push(point);

//     // Draw all the set of shapes needed for the canvas
//     renderAllShapes();
// }

function clearCanvas(){
    // Specify the color for clearing <canvas> 
    gl.clearColor(g_clearColorR, g_clearColorG, g_clearColorB, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function setUpWebGL(){
    // Retrieve <canvas> element
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
    // Canvas Color + Clear Button Events
    document.getElementById('clear').onclick = function () { 
        g_shapesList = []; 
        renderAllShapes(); 
    };
    document.getElementById('whiteCanvas').onclick = function () { 
        g_clearColorR = 1.0;
        g_clearColorG = 1.0
        g_clearColorB = 1.0;
        gl.clearColor(g_clearColorR, g_clearColorG, g_clearColorB, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        renderAllShapes(); 

    };
    document.getElementById('creamCanvas').onclick = function () { 
        g_clearColorR = 1;
        g_clearColorG = 0.97;
        g_clearColorB = 0.89;
        gl.clearColor(g_clearColorR, g_clearColorG, g_clearColorB, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        renderAllShapes(); 

    };
    document.getElementById('blackCanvas').onclick = function () { 
        g_clearColorR = 0.0;
        g_clearColorG = 0.0
        g_clearColorB = 0.0;
        gl.clearColor(g_clearColorR, g_clearColorG, g_clearColorB, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        renderAllShapes(); 
    };
    // // Shape Button Events
    // document.getElementById('pointButton').onclick = function () {g_selectedType = POINT};
    // document.getElementById('triButton').onclick = function () {g_selectedType = TRIANGLE};
    // document.getElementById('circleButton').onclick = function () {g_selectedType = CIRCLE};

    document.getElementById('animateYellowButtonON').onclick = function () {g_yellowAnimation = true};
    document.getElementById('animateYellowButtonOFF').onclick = function () {g_yellowAnimation = false};

    document.getElementById('animateMagentaButtonON').onclick = function () {g_magentaAnimation = true};
    document.getElementById('animateMagentaButtonOFF').onclick = function () {g_magentaAnimation = false};

    document.getElementById('magentaSlider').addEventListener('mousemove', function() { 
        g_MagentaAngle = -this.value; 
        renderAllShapes(); 
    });


    document.getElementById('dogHeadSlider').addEventListener('mousemove', function() { 
        g_yellowAngle = -this.value; 
        renderAllShapes(); 
    });

    document.getElementById('angleXSlider').addEventListener('mousemove', function() { 
        g_globalAngleX = this.value; 
        renderAllShapes(); 
    });

    document.getElementById('angleYSlider').addEventListener('mousemove', function() { 
        g_globalAngleY = this.value; 
        renderAllShapes(); 
    });

    document.getElementById('angleZSlider').addEventListener('mousemove', function() { 
        g_globalAngleZ = this.value; 
        renderAllShapes(); 
    });

}
 

function convertCoordinatesToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
  
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x,y, x,y, x,y]);
}

function updateAnimationAngles(){
    if(g_yellowAnimation){
        g_yellowAngle = 45 * Math.sin(g_seconds)

    }
    if(g_magentaAnimation){
        g_MagentaAngle = 45 * Math.sin(2.5*g_seconds)

    }
}

function renderAllShapes(){
    var startTime = performance.now();

    // var globalRotMat = new Matrix4().rotate(g_globalAngleX, g_globalAngleY, 1, 0);
    let globalRotMat = new Matrix4()
    .rotate(g_globalAngleX, 1, 0, 0)  // X-axis
    .rotate(g_globalAngleY, 0, 1, 0)  // Y-axis
    .rotate(g_globalAngleZ, 0, 0, 1); // Z-axis


    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.clear(gl.COLOR_BUFFER_BIT);
    

    // Original examples

    // var body = new Cube();
    // body.color = [1.0, 0.0, 0.0, 1.0];
    // body.matrix.translate(-0.25, -0.75, 0.0);
    // body.matrix.rotate(-5, 1, 0, 0);
    // body.matrix.scale(0.5, 0.3, 0.5);
    // body.render();

    // var yellow = new Cube();
    // yellow.color = [1.0, 1.0, 0.0, 1.0];
    // yellow.matrix.setTranslate(0, -0.5, 0.0);
    // yellow.matrix.rotate(-5, 1, 0, 0);
    // yellow.matrix.rotate(g_yellowAngle, 0, 0, 1);
    // var yellowCoordinatesMatrix = new Matrix4(yellow.matrix);
    // yellow.matrix.scale(0.25, 0.7, 0.5);
    // yellow.matrix.translate(-0.5, 0, 0.0);
    // yellow.render();


    // var magenta = new Pyramid();
    // magenta.color = [1.0, 0.0, 1.0, 1.0];
    // // magenta.matrix = yellowCoordinatesMatrix;
    // // magenta.matrix.translate(0, 0.65, 0.0, 0);
    // // magenta.matrix.rotate(g_MagentaAngle, 0, 0, 1);
    // magenta.matrix.scale(0.3, 0.3, 0.3);
    // // magenta.matrix.translate(-0.5, 0, -0.001, 0);
    // magenta.render();

    // Dog's Head
    var dogHead = new Cube();
    dogHead.color = [0.8, 0.7, 0.5, 1.0];
    dogHead.matrix.translate(-0.25, 0, -0.75);
    dogHead.matrix.rotate(g_yellowAngle, 0, 0, 1);
    var dogHeadCoordsMatrix1 = new Matrix4(dogHead.matrix);
    var dogHeadCoordsMatrix2 = new Matrix4(dogHead.matrix);
    dogHead.matrix.scale(0.5, 0.5, 0.45);
    dogHead.render();


    // Dog's Mouth
    var dogMouth = new Cube();
    dogMouth.color = [0.35, 0.2, 0.1, 1.0];
    dogMouth.matrix = dogHeadCoordsMatrix1;
    dogMouth.matrix.translate(0.05, 0, -0.15);
    // dogMouth.matrix.rotate(0, 1, 0, 0);
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
    // rightEye.matrix.scale(0.1, 0.1, 0.1);
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
//    rightEar.matrix.scale(1.5, 1.5, 1.5); // Make it smaller
   rightEar.render();

//    var dogRightEar = new Cube();
//    dogRightEar.color = [0.4, 0.7, 0.4, 1.0];
//    dogRightEar.matrix = dogHeadCoordsMatrix2
//    dogRightEar.matrix.translate(0.15, 0.5, -0.6);
//    dogRightEar.matrix.rotate(0, 1, 0, 0);
//    dogRightEar.matrix.scale(0.1, 0.1, 0.15);
//    dogRightEar.render();


    // var rightEye = new Cube();
    // rightEye.color = [0.1, 0.1, 0.1, 1.0];
    // rightEye.matrix = dogHeadCoordsMatrix1;
    // rightEye.matrix.translate(0.0625, 0.25, -0.8);
    // rightEye.matrix.rotate(0, 1, 0, 0);
    // rightEye.matrix.scale(0.1, 0.1, 0.1);
    // rightEye.render();
    
    // Dog's Body
    var torsoFront = new Cube();
    torsoFront.color = [0.8, 0.7, 0.5, 1.0];
    torsoFront.matrix.translate(-0.25, -0.4, -0.5);
    var torsoFrontMatrix1 = new Matrix4(torsoFront.matrix);
    var torsoFrontMatrix2 = new Matrix4(torsoFront.matrix);
    torsoFront.matrix.scale(0.5, 0.4, 0.5);
    torsoFront.render();

    var torsoMiddle = new Cube();
    torsoMiddle.color = [0.8, 0.7, 0.5, 1.0];
    torsoMiddle.matrix = torsoFrontMatrix1;
    torsoMiddle.matrix.translate(0.025, 0.025, 0.5);
    // torsoMiddle.matrix.rotate(0, 1, 0, 0);
    torsoMiddle.matrix.scale(0.45, 0.35, 0.2);
    torsoMiddle.render();

    var torsoRear = new Cube();
    torsoRear.color =  [0.8, 0.7, 0.5, 1.0];
    torsoRear.matrix = torsoFrontMatrix2;
    var torsoRearMatrix = new Matrix4(torsoRear.matrix);
    torsoRear.matrix.translate(0, 0, 0.7);
    torsoRear.matrix.scale(0.5, 0.4, 0.3);
    torsoRear.render();

    var dogTailBase = new Cube();
    dogTailBase.color = [0.8, 0.7, 0.5, 1.0];
    dogTailBase.matrix = torsoFrontMatrix2;
    var dogTailMatrix = new Matrix4(torsoFrontMatrix2);
    dogTailBase.matrix.translate(0.4, 0.8, 0.85);
    dogTailBase.matrix.rotate(-25, 1, 0, 0);
    dogTailBase.matrix.scale(0.2, 0.2, 0.6);
    dogTailBase.render();
    
    var dogTailEnd = new Pyramid();
    dogTailEnd.color = [0.8, 0.7, 0.5, 1.0];
    dogTailEnd.matrix = new Matrix4(dogTailMatrix);
    dogTailEnd.matrix.translate(0.4, 1.05, 1.15);
    dogTailEnd.matrix.rotate(0, 45, 1, 0);
    dogTailEnd.matrix.scale(0.205125, 0.3, 0.25);
    dogTailEnd.render();
    

    // Dog's Legs
    var backLeftLeg = new Cube();
    backLeftLeg.color =  [0.8, 0.7, 0.5, 1.0];
    backLeftLeg.matrix.translate(-0.2, -0.575, 0.3);
    backLeftLeg.matrix.scale(0.1, 0.175, 0.125);
    backLeftLeg.render();

    var backRightLeg = new Cube();
    backRightLeg.color =  [0.8, 0.7, 0.5, 1.0];
    backRightLeg.matrix.translate(0.1075, -0.575, 0.275);
    backRightLeg.matrix.scale(0.1, 0.175, 0.125);
    backRightLeg.render();

    var frontLeftLeg = new Cube();
    frontLeftLeg.color =  [0.8, 0.7, 0.5, 1.0];
    frontLeftLeg.matrix.translate(-0.2, -0.575, -0.375);
    frontLeftLeg.matrix.scale(0.1, 0.175, 0.125);
    frontLeftLeg.render();

    var frontRightLeg = new Cube();
    frontRightLeg.color =  [0.8, 0.7, 0.5, 1.0];
    frontRightLeg.matrix.translate(0.1075, -0.575, -0.35);
    frontRightLeg.matrix.scale(0.1, 0.175, 0.125);
    frontRightLeg.render();

    // Dog's Feet
    var backLeftFoot = new Cube();
    backLeftFoot.color = [0.575, 0.45, 0.3, 1.0];
    backLeftFoot.matrix.translate(-0.21525, -0.675, 0.25);
    backLeftFoot.matrix.scale(0.125, 0.1, 0.175);
    backLeftFoot.render();

    var backRightFoot = new Cube();
    backRightFoot.color = [0.575, 0.45, 0.3, 1.0];
    backRightFoot.matrix.translate(0.1, -0.675, 0.25);
    backRightFoot.matrix.scale(0.125, 0.1, 0.175);
    backRightFoot.render();

    var frontLeftFoot = new Cube();
    frontLeftFoot.color = [0.575, 0.45, 0.3, 1.0];
    frontLeftFoot.matrix.translate(-0.21525, -0.675, -0.4);
    frontLeftFoot.matrix.scale(0.125, 0.1, 0.175);
    frontLeftFoot.render();

    var frontRightFoot = new Cube();
    frontRightFoot.color = [0.575, 0.45, 0.3, 1.0];
    frontRightFoot.matrix.translate(0.1, -0.675, -0.4);
    frontRightFoot.matrix.scale(0.125, 0.1, 0.175);
    frontRightFoot.render();

    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration) / 10, "numdot");
}

// Send text to HTML, used for duration of renderAllShapes in this files 
function sendTextToHTML(text, htmlID){
    var htmlElm = document.getElementById(htmlID);
    if(!htmlElm){
        console.error("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}