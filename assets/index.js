/*
Setup canvas ------------------------------------------------------------------>
 */

const FRAME_RATE = 60;

let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');

var width = canvas.width;
var height = canvas.height;

/**
 * Initialize our canvas where we draw our shapes.
 */
function initialize() {
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();
    setInterval(redraw, FRAME_RATE);
}

/**
 * Our draw function which carries out the drawing of the shapes
 * on interval.
 */
function redraw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (isSpinningX)
        rotX();
    if (isSpinningY)
        rotY(); 
    if (isSpinningZ)
        rotZ();

    if (isShapeLoaded) {
        drawShape();
    }
}

/**
 * Resize the canvas when the dimensions of the browser window changes.
 */
function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redraw();
}

initialize();


/*
Global Variables -------------------------------------------------------------->
 */

var originalVertices = [];
var anchorPoint = [];
var newVertices = [];
var newAnchorPoint = [];
var shapeLines = [];

var transformMatrix = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
];

var isShapeLoaded = false;
var isSpinningX = false;
var isSpinningY = false;
var isSpinningZ = false;


/*
Matrix Constants
------------------------------------------------------------------------------>
 */

const SCALE = 20;
const ZOOM_IN = 1.10;
const ZOOM_OUT = 0.90;
const TRANS_DIST = 10;
const THETA = Math.PI / 50;
const SHEAR = 0.05;

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

function shear(s) {
    return [
        [1, s, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];
}

/**
 * 
 * @param {Starting Vertex} id1 
 * @param {Ending Vertex} id2 
 */
function Line(id1, id2) {
    this.start = id1;
    this.end = id2;
}

/**
 * Executes drawing of the shapes points with it's lines.
 */
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

/**
 * Translate shape left.
 */
function translateLeft() {
    transformMatrix = multiplyMatrix(translation(-TRANS_DIST, 0, 0), transformMatrix);
    transformation();
}

/**
 * Translate shape right.
 */
function translateRight() {
    transformMatrix = multiplyMatrix(translation(TRANS_DIST, 0, 0), transformMatrix);
    transformation();
}

/**
 * Translate shape up.
 */
function translateUp() {
    transformMatrix = multiplyMatrix(translation(0, -TRANS_DIST, 0), transformMatrix);
    transformation();
}

/**
 * Translate shape down.
 */
function translateDown() {
    transformMatrix = multiplyMatrix(translation(0, TRANS_DIST, 0), transformMatrix);
    transformation();
}

/**
 * Scale the shape up as to zoom in.
 */
function zoomIn() {
    transformMatrix = multiplyMatrix(ORIGIN, transformMatrix);
    transformMatrix = multiplyMatrix(scale(ZOOM_IN), transformMatrix);
    transformMatrix = multiplyMatrix(CENTER, transformMatrix);
    transformation();
}

/**
 * Scale the shape down as to zoom out.
 */
function zoomOut() {
    transformMatrix = multiplyMatrix(ORIGIN, transformMatrix);
    transformMatrix = multiplyMatrix(scale(ZOOM_OUT), transformMatrix);
    transformMatrix = multiplyMatrix(CENTER, transformMatrix);
    transformation();
}

/**
 * When activated, spins the shape around the X-axis.
 */
function spinX() {
    isSpinningX = !isSpinningX;
    isSpinningY = false;
    isSpinningZ = false;
}

/**
 * When activated, spins the shape around the Y-axis.
 */
function spinY() {
    isSpinningX = false;
    isSpinningY = !isSpinningY;
    isSpinningZ = false;
}

/**
 * When activated, spins the shape around the Z-axis.
 */
function spinZ() {
    isSpinningX = false;
    isSpinningY = false;
    isSpinningZ = !isSpinningZ;
}

/**
 * Shear the top of the shape to the left.
 */
function shearLeft() {
    transformMatrix = multiplyMatrix(ORIGIN, transformMatrix);
    transformMatrix = multiplyMatrix(
        translation(newAnchorPoint[0], newAnchorPoint[1], newAnchorPoint[2]),
        transformMatrix
    );
    transformMatrix = multiplyMatrix(REFLECT_X, transformMatrix);
    transformMatrix = multiplyMatrix(shear(-SHEAR), transformMatrix);
    transformMatrix = multiplyMatrix(REFLECT_X, transformMatrix);    
    transformMatrix = multiplyMatrix(
        translation(-newAnchorPoint[0], -newAnchorPoint[1], -newAnchorPoint[2]),
        transformMatrix
    );
    transformMatrix = multiplyMatrix(CENTER, transformMatrix);    
    transformation();
}

/**
 * Shear the top of the shape to the right.
 */
function shearRight() {
    transformMatrix = multiplyMatrix(ORIGIN, transformMatrix);
    transformMatrix = multiplyMatrix(
        translation(newAnchorPoint[0], newAnchorPoint[1], newAnchorPoint[2]),
        transformMatrix
    );
    transformMatrix = multiplyMatrix(REFLECT_X, transformMatrix);
    transformMatrix = multiplyMatrix(shear(SHEAR), transformMatrix);
    transformMatrix = multiplyMatrix(REFLECT_X, transformMatrix);    
    transformMatrix = multiplyMatrix(
        translation(-newAnchorPoint[0], -newAnchorPoint[1], -newAnchorPoint[2]),
        transformMatrix
    );
    transformMatrix = multiplyMatrix(CENTER, transformMatrix);    
    transformation();
}

/**
 * Rotate around the X-axis.
 */
function rotX() {
    transformMatrix = multiplyMatrix(ORIGIN, transformMatrix);
    transformMatrix = multiplyMatrix(ROTATE_X, transformMatrix);
    transformMatrix = multiplyMatrix(CENTER, transformMatrix);
    transformation();
}

/**
 * Rotate around the Y-axis.
 */
function rotY() {
    transformMatrix = multiplyMatrix(ORIGIN, transformMatrix);
    transformMatrix = multiplyMatrix(ROTATE_Y, transformMatrix);
    transformMatrix = multiplyMatrix(CENTER, transformMatrix);
    transformation();
}

/**
 * Rotate around the Z-axis.
 */
function rotZ() {
    transformMatrix = multiplyMatrix(ORIGIN, transformMatrix);
    transformMatrix = multiplyMatrix(ROTATE_Z, transformMatrix);
    transformMatrix = multiplyMatrix(CENTER, transformMatrix);
    transformation();
}

/**
 * Reset the shape and the transformation matrix back to it's
 * initialized state.
 */
function resetImage() {
    isShapeLoaded = false;    
    transformMatrix = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];
    isSpinningX = false;
    isSpinningY = false;
    isSpinningZ = false;
    init();
}


/*
Initialization and Transformation functions
------------------------------------------------------------------------------->
 */

 /**
  * Initialize our shape with proper size and positioning (size decided by SCALE constant above)
  */
function init() {

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
    
}

/**
 * Called when performing transformations on our original vertices via
 * the transformation matrix.
 */
function transformation() {

    isShapeLoaded = false;

    for (var i = 0; i < originalVertices.length; i++) {
        newVertices[i] = multiplyMatrixAndPoint(originalVertices[i], transformMatrix);
    }

    let scaleMatrix = [
        [transformMatrix[0][0], 0, 0, 0],
        [0, transformMatrix[1][1], 0, 0],
        [0, 0, transformMatrix[2][2], 0],
        [0, 0, 0, 1]
    ];

    newAnchorPoint = multiplyMatrixAndPoint(anchorPoint, scaleMatrix);    

    isShapeLoaded = true;

}


/*
Matrix Multiplication
------------------------------------------------------------------------------>
 */

 /**
  * Multiply two matrices together (tested on 4x4 only).
  * @param {LHS} mA 
  * @param {RHS} mB 
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

/**
 * 
 * @param {Vertex} point 
 * @param {4x4 Matrix} matrix 
 */
function multiplyMatrixAndPoint(point, matrix) {

    // Assigning a variable name for each part of the matrix - a column and row number
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

    // Now set some simple names for the point
    var x = point[0];
    var y = point[1];
    var z = point[2];
    var w = point[3];

    // Multiply the point against each part of the 1st column, then add together
    var resultX = (x * c0r0) + (y * c0r1) + (z * c0r2) + (w * c0r3);

    // Multiply the point against each part of the 2nd column, then add together
    var resultY = (x * c1r0) + (y * c1r1) + (z * c1r2) + (w * c1r3);

    // Multiply the point against each part of the 3rd column, then add together
    var resultZ = (x * c2r0) + (y * c2r1) + (z * c2r2) + (w * c2r3);

    // Multiply the point against each part of the 4th column, then add together
    var resultW = (x * c3r0) + (y * c3r1) + (z * c3r2) + (w * c3r3);

    return [resultX, resultY, resultZ, resultW];

}


/*
Utilities -------------------------------------------------------------------->
 */

 /**
  * Put an async function call to sleep for however long. Need this for uploading
  * the shape files.
  * @param {Milliseconds} ms 
  */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Upload two data files selected by user: one points file and one lines file.
 * @param {File Upload} evt 
 */
async function handleFileSelect(evt) {

    let files = evt.target.files; // FileList object
    let points;
    let lines;

    if (isShapeLoaded) {
        originalVertices = [];
        shapeLines = []; 
    }

    for (let i = 0, f; f = files[i]; i++) {

        let reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile) {
            return function(e) {

                lines = e.target.result.split('\n');

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

        // Read in the shape file as a data URL.
        reader.readAsText(f);
    }

    // Need this, just a timing issue that I was too lazy to figure out.
    await sleep(200);

    resetImage();

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
