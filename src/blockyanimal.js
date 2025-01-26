// blockyanimal.js
// Sourced from ColoredPoint.js (c) 2012 matsuda with CSE 160 Additional functionality
// Vertex shader program

// Ideas for add ons:
//  Last 5 used colors
var VSHADER_SOURCE =`
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    void main(){
        gl_Position = u_ModelMatrix * a_Position;
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

var g_shapesList = [];


function main() {
    setUpWebGL();
    connectVariablesToGLSL();
    addActionForHTMLUI();

    // Register function (event handler) to be called on a mouse press and allows clicking and dragging on the canvas
    canvas.onmousedown = handleClicks;
    canvas.onmousemove = function(ev) { if(ev.buttons === 1){ handleClicks(ev); } };

    // clearCanvas();
    // updateColorPreview();
    renderAllShapes()
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

    // Used to add transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

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

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

    // // Get the storage location of u_Size
    // u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    // if (!u_Size) {
    //     console.log('Failed to get the storage location of u_Size');
    //     return;
    // }
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

    // Color Slider Events
    const colorPreview = document.getElementById('colorPreview');
    const redSlider = document.getElementById('redSlider').addEventListener('input', updateColorPreview);
    const greenSlider = document.getElementById('greenSlider').addEventListener('input', updateColorPreview);
    const blueSlider = document.getElementById('blueSlider').addEventListener('input', updateColorPreview);
    const alphaSlider = document.getElementById('alphaSlider').addEventListener('input', updateColorPreview);

    // Size + Segments Slider Events
    document.getElementById('sizeSlider').addEventListener('mouseup', function() { g_selectedSize =  this.value; });
    document.getElementById('segSlider').addEventListener('mouseup', function() { g_selectedSegments =  this.value; });
}

function updateColorPreview() {
    const red = redSlider.value / 100;
    const green = greenSlider.value / 100;
    const blue = blueSlider.value / 100;
    const alpha = alphaSlider.value / 100;

    // Update global selected color
    g_selectedColor[0] = red;
    g_selectedColor[1] = green;
    g_selectedColor[2] = blue;
    g_selectedColor[3] = alpha;

    colorPreview.style.backgroundColor = `rgba(${red * 255}, ${green * 255}, ${blue * 255}, ${alpha})`;
}

function convertCoordinatesToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
  
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x,y, x,y, x,y]);
}

function renderAllShapes(){
    var startTime = performance.now();

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);


    // drawTriangle3D([-1.0, 0.0, 0.0,        -0.5, -1.0, 0.0,       0.0, 0.0, 0.0]);

    var body = new Cube();
    body.color = [1.0, 0.0, 0.0, 1.0];
    body.matrix.translate(-0.25, -0.5, 0.0);
    body.matrix.scale(0.5, 1, 0.5);
    body.render();


    var leftArm = new Cube();
    leftArm.color = [1.0, 1.0, 0.0, 1.0];
    leftArm.matrix.translate(0.7, 0.0, 0.0);
    leftArm.matrix.rotate(45, 0, 0, 1);
    leftArm.matrix.scale(0.25, 0.7, 0.5);
    leftArm.render();

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