/*
Setup canvas ------------------------------------------------------------------>
 */

let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');

var width = canvas.width;
var height = canvas.height;

initialize();

function initialize() {
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();
    setInterval(redraw, 300);
}

function redraw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (isShapeLoaded) {
        drawShape();
    }
}

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redraw();
}


/*
Global Variables -------------------------------------------------------------->
 */

// Original shape matrix
var originalVertices = [];

var transformMatrix = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
];

var anchorPoint = [];

// Our new, affected vertices
var newVertices = [];
var newAnchorPoint = [];

var shapeLines = [];

var isShapeLoaded = false;

var width;
var height;


/*
Matrix Constants
------------------------------------------------------------------------------>
 */

const SCALE = 20;
const ZOOM_IN = 1.10;
const ZOOM_OUT = 0.90;
const TRANS_DIST = 10;
const THETA = Math.PI / 50;

const CENTER = [
    [1, 0, 0, width / 2],
    [0, 1, 0, height / 2],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
];

const ORIGIN = [
    [1, 0, 0, -width / 2],
    [0, 1, 0, -height / 2],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
];

const ROTATE_X = [
    [1, 0, 0, 0],
    [0, Math.cos(THETA), -Math.sin(THETA), 0],
    [0, Math.sin(THETA), Math.cos(THETA), 0],
    [0, 0, 0, 1]
];

const ROTATE_Y = [
    [Math.cos(THETA), 0, Math.sin(THETA), 0],
    [0, 1, 0, 0],
    [-Math.sin(THETA), 0, Math.cos(THETA), 0],
    [0, 0, 0, 1]
];

const ROTATE_Z = [
    [Math.cos(THETA), -Math.sin(THETA), 0, 0],
    [Math.sin(THETA), Math.cos(THETA), 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
];

const REFLECT_X = [
    [1, 0, 0, 0],
    [0, -1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
];


/*
Shape Manipulations ----------------------------------------------------------->
 */

function translation(x, y, z) {
    return [
        [1, 0, 0, x],
        [0, 1, 0, y],
        [0, 0, 1, z],
        [0, 0, 0, 1]
    ];
}

function scale(s) {
    return [
        [s, 0, 0, 0],
        [0, s, 0, 0],
        [0, 0, s, 0],
        [0, 0, 0, 1]
    ];
}

function Line(id1, id2) {
    this.start = id1;
    this.end = id2;
}

function drawShape() {

    context.strokeStyle = '#ff9933';
    context.lineWidth = 1

    let s = newVertices;
    let l = shapeLines;

    for (var i = 0; i < l.length; i++) {
        let ln = l[i];
        context.beginPath();
        context.moveTo(s[ln.start - 1][0], s[ln.start - 1][1]);
        context.lineTo(s[ln.end - 1][0], s[ln.end - 1][1]);
        context.stroke();
        context.closePath();
    }

}

function translateLeft() {
    console.log("Translate left");
    transformMatrix = multiplyMatrix(translation(-TRANS_DIST, 0, 0), transformMatrix);
    transformation();
}

function translateRight() {
    console.log("Translate right");
    transformMatrix = multiplyMatrix(translation(TRANS_DIST, 0, 0), transformMatrix);
    transformation();
}

function translateUp() {
    console.log("Translate up");
    transformMatrix = multiplyMatrix(translation(0, -TRANS_DIST, 0), transformMatrix);
    transformation();
}

function translateDown() {
    console.log("Translate down");
    transformMatrix = multiplyMatrix(translation(0, TRANS_DIST, 0), transformMatrix);
    transformation();
}

function zoomIn() {
    console.log("Zoom in");
    transformMatrix = multiplyMatrix(ORIGIN, transformMatrix);
    transformMatrix = multiplyMatrix(scale(ZOOM_IN), transformMatrix);
    transformMatrix = multiplyMatrix(CENTER, transformMatrix);
    transformation();
}

function zoomOut() {
    console.log("Zoom out");
    transformMatrix = multiplyMatrix(ORIGIN, transformMatrix);
    transformMatrix = multiplyMatrix(scale(ZOOM_OUT), transformMatrix);
    transformMatrix = multiplyMatrix(CENTER, transformMatrix);
    transformation();
}

function spinX() {
    console.log("Spin X");
}

function spinY() {
    console.log("Spin Y");
}

function spinZ() {
    console.log("Spin Z");
}

function shearLeft() {
    console.log("Shear left");
}

function shearRight() {
    console.log("Shear right");
}

function resetImage() {
    console.log('Resetting Image');
    transformMatrix = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];
    init();
}

function rotX() {
    console.log("Rotate x");
    transformMatrix = multiplyMatrix(ORIGIN, transformMatrix);
    transformMatrix = multiplyMatrix(ROTATE_X, transformMatrix);
    transformMatrix = multiplyMatrix(CENTER, transformMatrix);
    transformation();
}

function rotY() {
    console.log("Rotate y");
    transformMatrix = multiplyMatrix(ORIGIN, transformMatrix);
    transformMatrix = multiplyMatrix(ROTATE_Y, transformMatrix);
    transformMatrix = multiplyMatrix(CENTER, transformMatrix);
    transformation();
}

function rotZ() {
    console.log("Rotate z");
    transformMatrix = multiplyMatrix(ORIGIN, transformMatrix);
    transformMatrix = multiplyMatrix(ROTATE_Z, transformMatrix);
    transformMatrix = multiplyMatrix(CENTER, transformMatrix);
    transformation();
}


/*
Initialization and Transformation functions
------------------------------------------------------------------------------->
 */

function init() {
    console.log("Entering init");

    // Translate back by our anchor-point
    transformMatrix = multiplyMatrix(
        translation(-anchorPoint[0], -anchorPoint[1], -anchorPoint[2]),
        transformMatrix
    );

    // Scale
    transformMatrix = multiplyMatrix(scale(SCALE), transformMatrix);

    // Reflect on the x-axis
    transformMatrix = multiplyMatrix(REFLECT_X, transformMatrix);

    // Center in canvas
    transformMatrix = multiplyMatrix(CENTER, transformMatrix);

    transformation();
    console.log("Leaving init");
}

function transformation() {

    isShapeLoaded = false;

    for (var i = 0; i < originalVertices.length; i++) {
        newVertices[i] = multiplyMatrixAndPoint(originalVertices[i], transformMatrix);
    }

    newAnchorPoint = multiplyMatrixAndPoint(anchorPoint, transformMatrix);

    isShapeLoaded = true;

}


/*
Matrix Multiplication
------------------------------------------------------------------------------>
 */

function multiplyMatrix(mA, mB) {

    var result = new Array(mA.length);

    for (var i = 0; i < result.length; i++) {

        result[i] = new Array(mB[i].length);
        for (var j = 0; j < mA.length; j++) {

            result[i][j] = 0; // result[ i ][ j ] is NaN, force to be zero
            for (var k = 0; k < mB.length; k++) {

                result[i][j] += mA[i][k] * mB[k][j];
            }
        }
    }

    return result;
}

function multiplyMatrixAndPoint(point, matrix) {

    //Give a simple variable name to each part of the matrix, a column and row number
    var c0r0 = matrix[0][0],
        c1r0 = matrix[1][0],
        c2r0 = matrix[2][0],
        c3r0 = matrix[3][0];
    var c0r1 = matrix[0][1],
        c1r1 = matrix[1][1],
        c2r1 = matrix[2][1],
        c3r1 = matrix[3][1];
    var c0r2 = matrix[0][2],
        c1r2 = matrix[1][2],
        c2r2 = matrix[2][2],
        c3r2 = matrix[3][2];
    var c0r3 = matrix[0][3],
        c1r3 = matrix[1][3],
        c2r3 = matrix[2][3],
        c3r3 = matrix[3][3];

    //Now set some simple names for the point
    var x = point[0];
    var y = point[1];
    var z = point[2];
    var w = point[3];

    //Multiply the point against each part of the 1st column, then add together
    var resultX = (x * c0r0) + (y * c0r1) + (z * c0r2) + (w * c0r3);

    //Multiply the point against each part of the 2nd column, then add together
    var resultY = (x * c1r0) + (y * c1r1) + (z * c1r2) + (w * c1r3);

    //Multiply the point against each part of the 3rd column, then add together
    var resultZ = (x * c2r0) + (y * c2r1) + (z * c2r2) + (w * c2r3);

    //Multiply the point against each part of the 4th column, then add together
    var resultW = (x * c3r0) + (y * c3r1) + (z * c3r2) + (w * c3r3);

    return [resultX, resultY, resultZ, resultW];

}


/*
Utilities -------------------------------------------------------------------->
 */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleFileSelect(evt) {

    console.log('Entering handleFileSelect');

    let files = evt.target.files; // FileList object
    let points;
    let lines;

    for (let i = 0, f; f = files[i]; i++) {

        let reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile) {
            return function(e) {

                let lines = e.target.result.split('\n');

                // Checking the 'points' file
                if (escape(theFile.name).includes('points')) {

                    var m = lines[0].split(' ');

                    anchorPoint = [
                        parseFloat(m[0]),
                        parseFloat(m[1]),
                        parseFloat(m[2]),
                        1
                    ];

                    for (var line = 1; line < lines.length; line++) {

                        if (lines[line].match(/[a-z]/i)) {
                            break;
                        }

                        let coords = lines[line].split(' ');

                        if (coords[0] == -1) {
                            break;
                        }

                        originalVertices.push([
                            parseFloat(coords[0]),
                            parseFloat(coords[1]),
                            parseFloat(coords[2]),
                            1
                        ]);
                    }

                    // Checking the 'lines' file
                } else if (escape(theFile.name).includes('lines')) {

                    // console.log('lines file uploaded');

                    for (let line = 0; line < lines.length; line++) {

                        if (lines[line].match(/[a-z]/i)) {
                            break;
                        }

                        let vertexIds = lines[line].split(' ');

                        if (vertexIds[0] == -1) {
                            break;
                        }

                        shapeLines.push(new Line(parseInt(vertexIds[0]), parseInt(vertexIds[1].replace(/[\n\r]+/g, ''))));

                    }
                }
            };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsText(f);
    }

    await sleep(200);

    init();

    console.log('Leaving handleFileSelect');

}


/*
UI Listeners
------------------------------------------------------------------------------->
 */

$('#files').change(handleFileSelect);

// New Shape
$('#open-data').on("click", function() {
    $('#files').trigger("click");
});

// Translations
$('#translate-left').on("click", translateLeft);
$('#translate-right').on("click", translateRight);
$('#translate-up').on("click", translateUp);
$('#translate-down').on("click", translateDown);

// Zooms
$('#zoom-in').on("click", zoomIn);
$('#zoom-out').on("click", zoomOut);

// Spins
$('#spin-x').on("click", spinX);
$('#spin-y').on("click", spinY);
$('#spin-z').on("click", spinZ);

// Shears
$('#shear-left').on("click", shearLeft);
$('#shear-right').on("click", shearRight);

// Options (Reset)
$('#reset-image').on("click", resetImage);

// Rotations TODO: Need to fix these method names
$('#rotate-x').on("click", rotX);
$('#rotate-y').on("click", rotY);
$('#rotate-z').on("click", rotZ);
