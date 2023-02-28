
let btnSimulate = document.getElementById("simulate");
let responseBody = {}

let coresValue = numCores; //document.getElementById("cores").value;
let percValue = document.getElementById("perc").value;
let durationValue = document.getElementById("duration").value;
let intervalId = 0;

loadSimulation(
    () => {
        if (running) {
            updateProgress();
        }
    },
    true
);


// console.log(running, runningStart, runningEnd);

onChangePercentual();
onChangeDuration();
onChangeCores();


function loadSimulation(callBack = null, check = false) {

    coresValue = document.getElementById("cores").value;
    percValue = document.getElementById("perc").value;
    durationValue = document.getElementById("duration").value;

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", (data) => {
      if(xhr.readyState === 4) {
        // console.log(data);
        responseBody = JSON.parse(xhr.responseText)['body'];

        document.getElementById("cores").value = responseBody['cores'];
        document.getElementById("perc").value = responseBody['perc'];
        document.getElementById("duration").value = responseBody['duration'];
        // console.log("responseBody", responseBody)

        onChangePercentual();
        onChangeDuration();
        onChangeCores();

        coresValue = document.getElementById("cores").value;
        percValue = document.getElementById("perc").value;
        durationValue = document.getElementById("duration").value;
        running = responseBody['running'];

        if (callBack) {
            callBack();
        }
      }
    });

    // let url = `/api/cpu-load/cores/${coresValue}/perc/${percValue}/duration/${durationValue}`;
    let url = `/api/cpu-load/perc/${percValue}/duration/${durationValue}`;
    if (check) {
        url = `/api/cpu-load/check`;
    }
    xhr.open("GET", url);

    xhr.send();

}

function runSimulation() {
    responseBody = loadSimulation(updateProgress);
//
//    var xhr = new XMLHttpRequest();
//    xhr.withCredentials = true;
//
//    xhr.addEventListener("readystatechange", (data) => {
//      if(xhr.readyState === 4) {
//        // console.log(data);
//        responseBody = JSON.parse(xhr.responseText);
//        // console.log(responseBody);
//      }
//    });
//
//    const url = `/api/cpu-load/cores/${coresValue}/perc/${percValue}/duration/${durationValue}`;
//    xhr.open("GET", url);
//
//    xhr.send();

    // updateProgress();
}

function updateProgress() {

    document.getElementById('simulate').disabled = running;
    document.getElementById('perc').disabled = running;
    document.getElementById('duration').disabled = running;
    document.getElementById('cores').disabled = running;
    clearInterval(intervalId);
//
//    now = new Date().getTime();
//
//    if (!running) {
//        runningStart = now;
//    }
//
//    runningEnd = now + Number(durationValue);
//
//    // console.log("now", now);
//    // console.log("runningStart", runningStart);
//    timePassed = now - runningStart;
//
//
//    // console.log("timePassed", timePassed);

    timePassed = Number(responseBody['elapsedTime']);
    // console.log('responseBody:', responseBody)
    // console.log('timePassed:', timePassed)

    coresValue = document.getElementById("cores").value;
    percValue = document.getElementById("perc").value;
    durationValue = document.getElementById("duration").value;

    intervalId = setInterval(
        () => {
            timePassed++;
            let progressPerc = Math.round(timePassed / (durationValue) * 100);
            document.getElementsByClassName('progress-bar')[0].style.width = `${progressPerc}%`;
            // console.log("timePassed", timePassed);
            // console.log("durationValue", durationValue);
            // console.log("progressPerc", progressPerc);
            if (progressPerc >= 100) {
                clearInterval(intervalId);

                document.getElementById('simulate').disabled = false;
                document.getElementById('perc').disabled = false;
                document.getElementById('duration').disabled = false;
                document.getElementById('cores').disabled = false;

                running = false;
                runningEnd = 0;
                runningStart = 0;
            }
        },
        1000
    );
}

function onChangeCores() {
    coresValue = document.getElementById("cores").value;
    let coresLabel = document.getElementById("coresLabel");
    coresLabel.innerText = `CPU Cores (${coresValue}/${numCores})`;
}

function onChangePercentual() {
    percValue = document.getElementById("perc").value;
    let percLabel = document.getElementById("percLabel");
    percLabel.innerText = `Percentual (${percValue}%)`;
}

function onChangeDuration() {
    durationValue = document.getElementById("duration").value;
    let durationLabel = document.getElementById("durationLabel");
    durationLabel.innerText = `Duração (${durationValue}s)`;
}