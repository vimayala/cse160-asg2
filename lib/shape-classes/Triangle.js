// Triangle.js
// Defines the Triangle class
// Defines position, color, and size of a triangle

class Triangle{
    constructor(){
        this.type = 'triangle';
        this.position = [0.0, 0.0,      0.0, 0.0,       0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.right = 1;
    }

    render(){
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;

        // // Pass the position of a point to a_Position variable
        // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    
        // Pass the size of a point to u_Size variable
        gl.uniform1f(u_Size, size);
    
        // Get new Triangle's size, then draw the triangle with the x, y and offsets
        var d = this.size / 200.0
        if(this.right == 1){
            drawTriangle( [xy[0], xy[1],    xy[0] + d, xy[1],   xy[0], xy[1] + d]);
        }
        else{
            drawTriangle( [xy[0], xy[1],    xy[2] + d, xy[3],   xy[4], xy[5] + d]);
        }
    }
}

function drawTriangle(vertices) {
    
    // Set the number of vertices, 3 for triangle
    var n = 3;

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    
    // Write date into the buffer object, sending verticies to GPU
    // Use DYNAMIC_DRAW because we want the program to know
    //      we are going to continue to send more and more triangles
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);

}

function drawTriangle3D(vertices) {
    
    // Set the number of vertices, 3 for triangle
    var n = 3;

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    
    // Write date into the buffer object, sending verticies to GPU
    // Use DYNAMIC_DRAW because we want the program to know
    //      we are going to continue to send more and more triangles
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);

}
