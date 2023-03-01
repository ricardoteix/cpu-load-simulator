from flask import Flask, render_template, Response, request
from threading import Thread
from cpu_load_generator import load_single_core, load_all_cores, from_profile

import os
import json
from time import time, sleep
import multiprocessing
from urllib.request import urlopen

from body import Body

app = Flask(__name__, static_url_path='')
app.secret_key = os.urandom(42)

app.url_map.strict_slashes = False

current_core_num = -1
current_perc = 0.1
current_duration = 10
num_cores = multiprocessing.cpu_count()

running = False
running_start = 0
running_end = 0
current_preset_id = -1


@app.route('/api/cpu-load/check', methods=['GET'])
def check():

    global running
    global current_preset_id

    try:
        elapsed_time = 0
        if running:
            elapsed_time = round(time()) - running_start

        result = {
            "success": 200,
            "body": {
                "cores": current_core_num,
                "numCores": num_cores,
                "perc": current_perc * 100,
                "duration": current_duration,
                "running": running,
                "elapsedTime": elapsed_time,
                "currentPresetId": current_preset_id
            }
        }

        return Response(json.dumps(result), status=200, mimetype='text/javascript')

    except Exception as err:
        msg = {'erro': err.args[0], 'success': False}
        if len(err.args) > 1:
            msg = {'erro': err.args[0], 'data': err.args[1], 'success': False}
        msg = json.dumps(msg)
        return Response(msg, status=400, mimetype='application/json')


@app.route('/api/cpu-load/preset/', methods=['POST'])
def cpu_load_presset():

    global current_core_num
    global current_perc
    global current_duration
    global running_start
    global running_end
    global running

    try:

        data = Body.get_body()
        preset_data = data['preset']
        current_duration = int(data['duration'])
        current_core_num = -1
        current_perc = -1

        if not running:
            running = True
            running_start = round(time())
            running_end = round((time() + int(current_duration)))

            thread = Thread(target=run_cpu_load_preset, args=(preset_data,))
            thread.daemon = True
            thread.start()

        result = {
            "success": 200,
            "body": {
                "cores": current_core_num,
                "numCores": num_cores,
                "perc": current_perc,
                "duration": current_duration,
                "running": running,
                "elapsedTime": round(time()) - running_start
            }
        }

        return Response(json.dumps(result), status=200, mimetype='text/javascript')

    except Exception as err:
        msg = {'erro': err.args[0], 'success': False}
        if len(err.args) > 1:
            msg = {'erro': err.args[0], 'data': err.args[1], 'success': False}
        msg = json.dumps(msg)
        return Response(msg, status=400, mimetype='application/json')


@app.route('/api/cpu-load/cores/<int:core_num>/perc/<int:perc>/duration/<int:duration>', methods=['GET'])
@app.route('/api/cpu-load/perc/<int:perc>/duration/<int:duration>', methods=['GET'])
def cpu_load(perc, duration, core_num=-1):

    global current_core_num
    global current_perc
    global current_duration
    global running_start
    global running_end
    global running

    try:

        elapsed_time = round(time()) - running_start

        if not running:
            running = True
            running_start = round(time())
            running_end = round((time() + int(current_duration)))
            elapsed_time = 0
            percent = perc / 100

            current_core_num = core_num
            current_perc = percent
            current_duration = duration

            thread = Thread(target=run_cpu_load, args=(percent, duration, core_num,))
            thread.daemon = True
            thread.start()

        result = {
            "success": 200,
            "body": {
                "cores": current_core_num,
                "numCores": num_cores,
                "perc": perc,
                "duration": duration,
                "running": running,
                "elapsedTime": elapsed_time
            }
        }

        return Response(json.dumps(result), status=200, mimetype='text/javascript')

    except Exception as err:
        msg = {'erro': err.args[0], 'success': False}
        if len(err.args) > 1:
            msg = {'erro': err.args[0], 'data': err.args[1], 'success': False}
        msg = json.dumps(msg)
        return Response(msg, status=400, mimetype='application/json')


def run_cpu_load(percent, duration, core_num=-1):

    global running_start
    global running_end
    global running

    try:

        running = True

        print("Started")

        start_time = round(time())

        if core_num != -1:
            load_single_core(core_num=core_num, duration_s=duration, target_load=percent)  # generate load on single core (0)
        else:
            load_all_cores(duration_s=duration, target_load=percent)

        end_time = time() - start_time

        print("End time: ", end_time)

        running = False
        running_start = 0
        running_end = 0

        print("End")

    except Exception as err:
        print(err)
        raise err


def run_cpu_load_preset(preset_data):

    global current_preset_id
    global running_start
    global running_end
    global running

    try:

        running = True

        print("Start All", preset_data)

        start_time = round(time())

        current_preset_id = 0

        for preset in preset_data:
            preset_percent = round(preset['perc'], 3)
            preset_time = round(preset['time'])

            print("Preset", preset_percent, preset_time)

            load_all_cores(duration_s=preset_time, target_load=preset_percent)

            current_preset_id += 1

        end_time = time() - start_time

        running = False
        running_start = 0
        running_end = 0

        current_preset_id = 0

        print("End time: ", end_time)

    except Exception as err:
        print(err)
        raise err


def get_ec2_instance_id():
    meta = 'http://169.254.169.254/latest/meta-data/instance-id'
    try:
        result = urlopen(meta)
        ec2_id = (result.read()).decode('utf8')
    except Exception as err:
        return ''
    return ec2_id


@app.route('/')
def index():

    global current_core_num
    global current_perc
    global current_duration
    global num_cores
    global running
    global running_start
    global running_end

    ec2_instance_id = get_ec2_instance_id()

    return render_template(
        'index.html',
        cores=current_core_num,
        perc=current_perc,
        duration=current_duration,
        num_cores=num_cores,
        running=running,
        running_start=running_start,
        running_end=running_end,
        ec2_instance_id=ec2_instance_id
    )


if __name__ == '__main__':
    print("""
        Acesse http://localhost:5000/ para usar a interface 
    """)
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)
