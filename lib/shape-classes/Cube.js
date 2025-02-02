// Cube.js
// Defines the Cube class
// Defines color and matrix
class Cube{
    constructor(){
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render(){
        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of the Cube
        drawTriangle3D([0.0, 0.0, 0.0,        1.0, 1.0, 0.0,       1.0, 0.0, 0.0]); 
        drawTriangle3D([0.0, 0.0, 0.0,        0.0, 1.0, 0.0,       1.0, 1.0, 0.0]); 

        // Back of the Cube
        drawTriangle3D([0.0, 0.0, 1.0,        1.0, 1.0, 1.0,       1.0, 0.0, 1.0]);
        drawTriangle3D([0.0, 0.0, 1.0,        0.0, 1.0, 1.0,       1.0, 1.0, 1.0]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1]  * 0.9 , rgba[2] * 0.9 , rgba[3]);

        // Top of the Cube
        drawTriangle3D([0.0, 1.0, 0.0,        0.0, 1.0, 1.0,       1.0, 1.0, 1.0]); 
        drawTriangle3D([0.0, 1.0, 0.0,        1.0, 1.0, 1.0,       1.0, 1.0, 0.0]); 

        // Right of the Cube
        drawTriangle3D([1.0, 0.0, 0.0,        1.0, 1.0, 0.0,        1.0, 1.0, 1.0]);
        drawTriangle3D([1.0, 1.0, 1.0,        1.0, 0.0, 0.0,        1.0, 0.0, 1.0]);
        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1]  * 0.9 , rgba[2] * 0.9 , rgba[3]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1]  * 0.7 , rgba[2] * 0.7 , rgba[3]);

        // Bottom of the Cube
        drawTriangle3D([0.0, 0.0, 0.0,        0.0, 0.0, 1.0,          1.0, 0.0, 0.0]);
        drawTriangle3D([1.0, 0.0, 0.0,        1.0, 0.0, 1.0,          0.0, 0.0, 1.0]);
  
        // Left of the Cube
        drawTriangle3D([0.0, 0.0, 0.0,        0.0, 1.0, 0.0,          0.0, 1.0, 1.0]);
        drawTriangle3D([0.0, 1.0, 1.0,        0.0, 0.0, 0.0,          0.0, 0.0, 1.0]);
        

    }
}
