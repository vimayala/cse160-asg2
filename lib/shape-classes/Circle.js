// Circle.js
// Defines the Circle class
// Defines position, color, and size of a point
class Circle{
    constructor(){
        this.type = 'circle';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.segments = 12;
    }

    render(){
        var xy = this.position;
        var rgba = this.color;
        // var size = this.size;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  
        // Draw
        var d = this.size / 200.0 

        // Draw each triangle for the circle given the segments
        
        let step = 360 / this.segments;
        for(var angle = 0; angle < 360; angle += step){
            let center = [ xy[0],xy[1] ];
            let ang1 = angle;
            let ang2 = angle + step;
            let vec1 = [ Math.cos(ang1 * Math.PI / 180) * d, Math.sin(ang1 * Math.PI / 180) * d];
            let vec2 = [ Math.cos(ang2 * Math.PI / 180) * d, Math.sin(ang2 * Math.PI / 180) * d];
            let pt1 = [center[0] + vec1[0], center[1] + vec1[1]];
            let pt2 = [center[0] + vec2[0], center[1] + vec2[1]];

            drawTriangle( [xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1] ]);
        }
    }
}
