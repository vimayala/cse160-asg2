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

let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_MagentaAngle = 0;


var g_shapesList = [];


function main() {
    setUpWebGL();
    connectVariablesToGLSL();
    addActionForHTMLUI();

    // Register function (event handler) to be called on a mouse press and allows clicking and dragging on the canvas
    canvas.onmousedown = handleClicks;
    canvas.onmousemove = function(ev) { if(ev.buttons === 1){ handleClicks(ev); } };

    clearCanvas();
    // updateColorPreview();
    renderAllShapes()
    requestAnimationFrame(tick);
}
var g_startTime = performance.now() / 1000.0 ;
var g_seconds = performance.now() / 1000.0 - g_startTime;
var g_yellowAnimation = true;

function tick(){
    g_seconds = performance.now() / 1000.0 - g_startTime;
    updateAnimationAngles();
    renderAllShapes();   
    requestAnimationFrame(tick);

}

function handleClicks(ev) {
    // Get x,y coords and return it to WebGL coordinates
    [x,y ,x,y, x,y] = convertCoordinatesToGL(ev);

    // Create and store new point with position, color, and size set
    let point;

    // Create new shape through button feedback
    if(g_selectedType == POINT){
        point = new Point;
    }
    else if (g_selectedType == TRIANGLE){
        point = new Triangle;
    }
    else{
        point = new Circle;
    }

    point.position = [x, y];
    point.color = [g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], g_selectedColor[3]];
    point.size = g_selectedSize;
    point.segments = g_selectedSegments;
    g_shapesList.push(point);

    // Draw all the set of shapes needed for the canvas
    renderAllShapes();
}

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

    // Cake Preview Button Events
    document.getElementById('cakeToggle').onclick = function () { birthdayCake(); };
    // document.getElementById('cakeToggle').onclick = function () { birthdayCake(); };

    // Shape Button Events
    document.getElementById('pointButton').onclick = function () {g_selectedType = POINT};
    document.getElementById('triButton').onclick = function () {g_selectedType = TRIANGLE};
    document.getElementById('circleButton').onclick = function () {g_selectedType = CIRCLE};

    document.getElementById('animateYellowButtonON').onclick = function () {g_yellowAnimation = true};
    document.getElementById('animateYellowButtonOFF').onclick = function () {g_yellowAnimation = false};


    // Color Slider Events
    // const colorPreview = document.getElementById('colorPreview');
    // const redSlider = document.getElementById('redSlider').addEventListener('input', updateColorPreview);
    // const greenSlider = document.getElementById('greenSlider').addEventListener('input', updateColorPreview);
    // const blueSlider = document.getElementById('blueSlider').addEventListener('input', updateColorPreview);
    document.getElementById('magentaSlider').addEventListener('mousemove', function() { 
        g_MagentaAngle = -this.value; 
        renderAllShapes(); 
    });


    document.getElementById('yellowSlider').addEventListener('mousemove', function() { 
        g_yellowAngle = -this.value; 
        renderAllShapes(); 
    });

    document.getElementById('angleSlider').addEventListener('mousemove', function() { 
        g_globalAngle = this.value; 
        renderAllShapes(); 
    });
    // Size + Segments Slider Events
    document.getElementById('sizeSlider').addEventListener('mouseup', function() { g_selectedSize =  this.value; });
    document.getElementById('segSlider').addEventListener('mouseup', function() { g_selectedSegments =  this.value; });
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
    // else{
    //     yellow.matrix.rotate(g_yellowAngle, 0, 0, 1);
    // }
}

function renderAllShapes(){
    var startTime = performance.now();

    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.clear(gl.COLOR_BUFFER_BIT);
    

    var body = new Cube();
    body.color = [1.0, 0.0, 0.0, 1.0];
    body.matrix.translate(-0.25, -0.75, 0.0);
    body.matrix.rotate(-5, 1, 0, 0);
    body.matrix.scale(0.5, 0.3, 0.5);
    body.render();

    var yellow = new Cube();
    yellow.color = [1.0, 1.0, 0.0, 1.0];
    yellow.matrix.setTranslate(0, -0.5, 0.0);
    yellow.matrix.rotate(-5, 1, 0, 0);
    yellow.matrix.rotate(g_yellowAngle, 0, 0, 1);
    var yellowCoordinatesMatrix = new Matrix4(yellow.matrix);
    yellow.matrix.scale(0.25, 0.7, 0.5);
    yellow.matrix.translate(-0.5, 0, 0.0);
    yellow.render();


    var testBox = new Cube();
    testBox.color = [1.0, 0.0, 1.0, 1.0];
    testBox.matrix = yellowCoordinatesMatrix;
    testBox.matrix.translate(0, 0.65, 0.0, 0);
    testBox.matrix.rotate(g_MagentaAngle, 0, 0, 1);
    testBox.matrix.scale(0.3, 0.3, 0.3);
    testBox.matrix.translate(-0.5, 0, -0.001, 0);

    testBox.render();

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