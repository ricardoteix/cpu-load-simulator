
let btnSimulate = document.getElementById("simulate");
let responseBody = {}

let coresValue = numCores; //document.getElementById("cores").value;
let percValue = document.getElementById("perc").value;
let durationValue = document.getElementById("duration").value;
let intervalId = 0;
let currentPresetId = -1;
let checkIntervalId = 0;

loadSimulation(
    () => {
        if (running) {
            updateProgress();
        }
    },
    true
);

onChangePercentual();
onChangeDuration();
onChangeCores();

function loadSimulationPreset(callBack = null, check = false) {

    coresValue = document.getElementById("cores").value;
    percValue = document.getElementById("perc").value;
    durationValue = document.getElementById("duration").value;

    const preset = getLoadsFromPoints(durationValue);
    const data = JSON.stringify(
        {
            preset: preset,
            duration: durationValue
        }
    );

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function() {
        if (this.readyState === 4) {

            responseBody = JSON.parse(xhr.responseText)['body'];

            document.getElementById("cores").value = responseBody['cores'];
            document.getElementById("perc").value = responseBody['perc'];
            document.getElementById("duration").value = responseBody['duration'];

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

    xhr.open("POST", "/api/cpu-load/preset/");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.send(data);
}

function loadSimulation(callBack = null, check = false) {

    coresValue = document.getElementById("cores").value;
    percValue = document.getElementById("perc").value;
    durationValue = document.getElementById("duration").value;

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", (data) => {
      if(xhr.readyState === 4) {

        responseBody = JSON.parse(xhr.responseText)['body'];

        document.getElementById("cores").value = responseBody['cores'];
        document.getElementById("perc").value = responseBody['perc'];
        document.getElementById("duration").value = responseBody['duration'];

        onChangePercentual();
        onChangeDuration();
        onChangeCores();

        coresValue = document.getElementById("cores").value;
        percValue = document.getElementById("perc").value;
        durationValue = document.getElementById("duration").value;
        running = responseBody['running'];
        currentPresetId = responseBody['currentPresetId'];

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

function runSimulationPreset() {
    // loadSimulationPreset(canvasUpdateProgress);
    loadSimulationPreset();

    checkIntervalId = setInterval(
        () => {

            loadSimulation(
                () => {

                    if (currentPresetId == 9) {
                        currentPresetId = 0;
                        clearInterval(checkIntervalId);
                    }
                    redrawAll();
                },
                true
            );
        },
        1000
    );

}

function runSimulation() {
    loadSimulation(updateProgress);
}

function updateProgress() {

    document.getElementById('simulate').disabled = running;
    document.getElementById('perc').disabled = running;
    document.getElementById('duration').disabled = running;
    document.getElementById('cores').disabled = running;
    clearInterval(intervalId);

    timePassed = Number(responseBody['elapsedTime']);

    coresValue = document.getElementById("cores").value;
    percValue = document.getElementById("perc").value;
    durationValue = document.getElementById("duration").value;

    intervalId = setInterval(
        () => {
            timePassed++;
            let progressPerc = Math.round(timePassed / (durationValue) * 100);
            document.getElementsByClassName('progress-bar')[0].style.width = `${progressPerc}%`;

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