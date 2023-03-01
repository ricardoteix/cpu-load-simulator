let canvas;
let context;

let radius, mouseY, mouseX, canvasRect;

let controlPoints = [];
let storageControlPoints = localStorage.getItem("controlPoints");
let maxPoints = 10;
let multipleLoadInProgress = false;
let canvasUpdateProgressId = 0;

window.addEventListener('load', initDraw);

function initDraw() {

    let canvasFather = document.getElementById("canvasFather");
    canvas = document.createElement('canvas');
    context = canvas.getContext("2d");
    canvas.id = "canvas";

    canvasFather.appendChild(canvas);
    canvas.width = canvasFather.clientWidth;
    canvas.height = 300;

    canvas.addEventListener('mousemove', onMouseMoveCanvas, false);
    canvas.addEventListener('click', onClickCanvas, false);

    canvasRect = canvas.getBoundingClientRect();

    radius = 5;
    mouseX = 0;
    mouseY = 0;

    controlPoints = [];
    storageControlPoints = localStorage.getItem("controlPoints");

    if (storageControlPoints != null && storageControlPoints != "[]") {
        controlPoints = JSON.parse(storageControlPoints);
    } else {
        redefinePoints();
    }

    redrawAll();
}

function canvasUpdateProgress() {
    multipleLoadInProgress = true;
    let progressTime = 0;
    let progressX = 20;
    let oldTime = new Date().getTime();
    let millis = durationValue * 1000;
    const firstControlPoint = controlPoints[0];
    const lastControlPoint = controlPoints[controlPoints.length - 1];
    const xDelta = lastControlPoint.x - firstControlPoint.x + 40;
    const pxPerMillis = xDelta / millis;
    const timePerPoint = durationValue / maxPoints;
    canvasUpdateProgressId = setInterval(
        () => {
            progressTime = ((new Date().getTime()) - oldTime);

            if (progressTime >= durationValue * 1000) {
                clearInterval(canvasUpdateProgressId);
                multipleLoadInProgress = false;
                return;
            }

            progressX = 20 + (pxPerMillis * progressTime);
            const currentPointId = Math.floor((progressTime/1000)/timePerPoint);
            const currentPoint = controlPoints[currentPointId];
            let nextPoint = currentPoint;
            if (currentPointId < controlPoints.length - 1) {
                nextPoint = controlPoints[currentPointId + 1];
            }
            const yPogressDelta = nextPoint.y - currentPoint.y;
            const xPogressDelta = nextPoint.x - currentPoint.x;
            const perc =  ((progressTime/1000) - (currentPointId * timePerPoint))/timePerPoint; //(progressTime) / (durationValue * 1000);
            const progressY = currentPoint.y + (perc * yPogressDelta);

            redrawAll();
            drawReferenceLine(progressX, progressY, false);
        },
        1
    );
}

function savePoints() {
    const jsonData = JSON.stringify(controlPoints)
    download(jsonData, 'pontos.json', 'text/plain');
}

function loadPoints() {
    const openFile = document.getElementById('openFile');
    const fileUrl = URL.createObjectURL(openFile.files[0]);
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", fileUrl, false );
    xmlHttp.send( null );
    xmlHttp.responseText;


    if (xmlHttp.responseText != null && xmlHttp.responseText != "[]") {
        controlPoints = JSON.parse(xmlHttp.responseText);
        openFile.value = null;
        onMouseMoveCanvas({ clientX: 0, clientY: 0});
    } else {
        redefinePoints();
    }
}

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

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

function drawReferenceLine(px = mouseX, py = mouseY, disable = true) {

    if (disable) {
        return;
    }

    if (!canvas.getContext) {
        return;
    }

    const currentPointValues = getPointValues(
        {
            x: px,
            y: py
        }
    );

    cursorTextAlign = "right";
    cursorTextPosX = px - 8;
    if (px < 50) {
        cursorTextPosX = px + 8;
        cursorTextAlign = "left";
    }
    addText(`${currentPointValues.perc}%`, cursorTextPosX, py - 5, 11, cursorTextAlign);
    addText(`${currentPointValues.time}s`, cursorTextPosX, py + 15, 11, cursorTextAlign);

    let strokeStyle = 'grey';
    context.lineWidth = 1;

    const lastControlPoint = controlPoints[controlPoints.length - 1];

    for (let i = 0; i < controlPoints.length; i++) {
        const controlPoint = controlPoints[i];
        if (px > controlPoint.x - 5 && px < controlPoint.x + 5 &&
            py < canvas.height - 20) {
            strokeStyle = 'green';
            context.lineWidth = 2;
            break;
        }
    }

    context.strokeStyle = strokeStyle;

    context.beginPath();
    context.moveTo(px, 0);
    context.lineTo(px, canvas.height);

    context.moveTo(0, py);
    context.lineTo(canvas.width, py);
    context.stroke();

}

function drawControlPoint(x, y, strokeStyle="red", fillStyle="red", radius = 5) {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    if (fillStyle != "") {
        context.fillStyle = fillStyle;
        context.fill();
    }
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

    for(let i = 0; i <= currentPresetId && currentPresetId >= 0; i++) {
        const currentPoint = controlPoints[i];
        drawControlPoint(
            currentPoint.x,
            currentPoint.y,
            strokeStyle="blue",
            fillStyle="",
            radius = 10
        );
    }

    addText("CPU 100%", 24, 15, 11);
    addText("CPU atual", 24, canvas.height - 30, 11);
    addText("t0", 25, canvas.height - 4, 14);
    addText("tf", canvas.width - 40, canvas.height - 4, 14);

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

    drawReferenceLine(mouseX, mouseY, multipleLoadInProgress);
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
                perc: currentPointValues.perc/100,
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
