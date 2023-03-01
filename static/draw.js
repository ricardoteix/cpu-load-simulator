const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

canvas.addEventListener('mousemove', onMouseMoveCanvas, false);
canvas.addEventListener('click', onClickCanvas, false);

let radius = 5;
let mouseX = 0;
let mouseY = 0;
let canvasRect = canvas.getBoundingClientRect();

let controlPoints = [];
const storageControlPoints = localStorage.getItem("controlPoints");
const maxPoints = 20;

if (storageControlPoints != null && storageControlPoints != "[]") {
    controlPoints = JSON.parse(storageControlPoints);
} else {
    redefinePoints();
}

redrawAll();

function redefinePoints() {
    for (let i = 0; i < maxPoints; i++) {
        if (controlPoints.length >= maxPoints) {
            break;
        }
        controlPoints.push(
            {
                x: (i * (canvas.width) / maxPoints) + 20,
                y: canvas.height - 20
            }
        );
    }
}
function removeAllPoints() {
    controlPoints = [];
    localStorage.clear();
    redefinePoints();
    redrawAll();
}

function drawLine(ox, oy, dx, dy, strokeStyle = 'blue', lineWidth = 2) {
    if (!canvas.getContext) {
        return;
    }

    context.strokeStyle = strokeStyle;
    context.lineWidth = lineWidth;

    context.beginPath();
    context.moveTo(ox, oy);
    context.lineTo(dx, dy);
    context.stroke();

}

function addText(text, x, y, fontSize, textAlign="left") {
    context.fillStyle = "black";
    context.textAlign = textAlign;
    context.font = `${fontSize}px Consolas`;
    context.fillText(text, x, y);
    context.fill();
}

function drawReferenceLine() {
    if (!canvas.getContext) {
        return;
    }

    let strokeStyle = 'grey';
    context.lineWidth = 1;

    const lastControlPoint = controlPoints[controlPoints.length - 1];

    for (let i = 0; i < controlPoints.length; i++) {
        const controlPoint = controlPoints[i];
        if (mouseX > controlPoint.x - 5 && mouseX < controlPoint.x + 5 &&
            mouseY < canvas.height - 20) {
            strokeStyle = 'green';
            context.lineWidth = 2;
            break;
        }
    }

    context.strokeStyle = strokeStyle;

    context.beginPath();
    context.moveTo(mouseX, 0);
    context.lineTo(mouseX, canvas.height);

    context.moveTo(0, mouseY);
    context.lineTo(canvas.width, mouseY);
    context.stroke();

}

function drawControlPoint(x, y, strokeStyle="red", fillStyle="red") {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fillStyle = fillStyle;
    context.fill();
    context.strokeStyle = strokeStyle;
    context.stroke();
}

function moveControlPoint() {

    for (let i = 0; i < controlPoints.length; i++) {
        const controlPoint = controlPoints[i];
        if (mouseX > controlPoint.x - 5 && mouseX < controlPoint.x + 5 &&
            mouseY < canvas.height - 20) {
            controlPoint.y = mouseY;
        }
    }

    redrawAll();
}

function addControlPoint(x, y, initial = false) {

    if (controlPoints.length >= 10) {
        /*Swal.fire(
            {
              title: 'Atenção!',
              text: 'Limite de 10 pontos atingidos.',
              icon: 'warning',
              confirmButtonText: 'Ok'
            }
        );*/
        return;
    }

    if (controlPoints.length > 0 &&
        x < controlPoints[controlPoints.length - 1].x +
            canvas.width * 0.1) {
        // alert("Ponto muito próximo do anterior ou antes do último.");
        Swal.fire(
            {
              title: 'Atenção!',
              text: 'Ponto muito próximo do anterior ou antes do último.',
              icon: 'warning',
              confirmButtonText: 'Ok'
            }
        );
        return;
    }


    if (!initial && controlPoints.length >= 10) {
        // alert("Só pode ter no máximo 10 pontos.");
        Swal.fire(
            {
              title: 'Atenção!',
              text: 'Só pode ter no máximo 10 pontos.',
              icon: 'warning',
              confirmButtonText: 'Ok'
            }
        );
        return;
    }

    let controlPoint = getControlPointByPosition(x, y);

    if (controlPoint == null) {
        drawControlPoint(x, y);

        controlPoint = { x: x, y: y } ;
        controlPoints.push( controlPoint );
    }

    return controlPoint;
}

function removeControlPoint(x, y) {

    let controlPointId = getControlPointIdByPosition(x, y);

    if (controlPointId != -1) {
        controlPoints.splice(controlPointId, 1);
        redrawAll();
    }

}

function getControlPointByPosition(x, y) {
    for (let i = 0; i < controlPoints.length; i++) {
        const controlPoint = controlPoints[i];
        if (mouseX > controlPoint.x - 5 && mouseX < controlPoint.x + 5
            && mouseY > controlPoint.y - 5 && mouseY < controlPoint.y + 5) {
            return controlPoint;
        }
    }
    return null;
}

function getControlPointIdByPosition(x, y) {
    for (let i = 0; i < controlPoints.length; i++) {
        const controlPoint = controlPoints[i];
        if (mouseX > controlPoint.x - 5 && mouseX < controlPoint.x + 5
            && mouseY > controlPoint.y - 5 && mouseY < controlPoint.y + 5) {
            return i;
        }
    }
    return -1;
}

function getPointValues(point) {

    let currentPerc = 100 - Math.round((point.y - 20) / (canvas.height - 40 ) * 100);
    if (currentPerc > 100) {
        currentPerc = 100;
    }
    if (currentPerc < 00) {
        currentPerc = 0;
    }

    const currentTime = Math.round((point.x - 20) / (canvas.width -40) * durationValue);

    return {
        perc: currentPerc,
        time: currentTime
    }
}

function redrawAll() {
    clearDraw();

    addText("CPU 100%", 24, 15, 11);
    addText("CPU atual", 24, canvas.height - 30, 11);
    addText("t0", 25, canvas.height - 4, 14);
    addText("tf", canvas.width - 40, canvas.height - 4, 14);

    const currentPointValues = getPointValues(
        {
            x: mouseX,
            y: mouseY
        }
    );

    cursorTextAlign = "right";
    cursorTextPosX = mouseX - 8;
    if (mouseX < 50) {
        cursorTextPosX = mouseX + 8;
        cursorTextAlign = "left";
    }
    addText(`${currentPointValues.perc}%`, cursorTextPosX, mouseY - 5, 11, cursorTextAlign);
    addText(`${currentPointValues.time}s`, cursorTextPosX, mouseY + 15, 11, cursorTextAlign);

    drawLine(0, (canvas.height) - 20, canvas.width, (canvas.height) - 20);
    drawLine(20, 0, 20, canvas.height);
    for (let i = 0; i < controlPoints.length; i++) {
        const controlPoint = controlPoints[i];
        drawControlPoint(controlPoint.x, controlPoint.y);
        if (i > 0) {
            const lastControlPoint = controlPoints[i - 1];
            drawLine(controlPoint.x, controlPoint.y, lastControlPoint.x, lastControlPoint.y, "red");
        }
    }

    drawReferenceLine();
}

function clearDraw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function getMousePos(canvas, evt) {
    return {
        x: (evt.clientX - canvasRect.left) / (canvasRect.right - canvasRect.left) * canvas.width,
        y: (evt.clientY - canvasRect.top) / (canvasRect.bottom - canvasRect.top) * canvas.height
    };
}

function getLoadsFromPoints(durationValue) {

    const loads = [];

    for (let i = 0; i < controlPoints.length; i++) {
        const controlPoint = controlPoints[i];
        const currentPointValues = getPointValues(controlPoint);

        loads.push(
            {
                perc: currentPointValues.perc,
                time: durationValue / maxPoints
            }
        );
    }

    return loads;
}

function onMouseMoveCanvas(e) {
    var pos = getMousePos(canvas, e);
    mouseX = pos.x;
    mouseY = pos.y;

    localStorage.setItem("controlPoints", JSON.stringify(controlPoints));

    redrawAll();
}

function onClickCanvas(e) {
    const controlPointId = getControlPointIdByPosition(mouseX, mouseY);

    moveControlPoint();

    /*if (controlPointId == -1) {
        let controlPointAdd = addControlPoint(mouseX, mouseY);
    } else {
        removeControlPoint(mouseX, mouseY);
    }*/
}
