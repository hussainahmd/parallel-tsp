import os
import json
import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile
import time

app = Flask(__name__)
CORS(app, resources={r"/tsp": {"origins": "http://localhost:5173"}})

def run_mpi_script(script_name, input_data):
    try:
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as input_file:
            json.dump(input_data, input_file)
            input_file_path = input_file.name

        with tempfile.NamedTemporaryFile(mode='r', delete=False, suffix='.json') as output_file:
            output_file_path = output_file.name

        execution_start_time = time.time()

        command = f"mpiexec -n 4 python {script_name} {input_file_path} {output_file_path}"
        subprocess.run(command, shell=True, check=True)

        execution_end_time = time.time()
        execution_time = execution_end_time - execution_start_time

        with open(output_file_path, 'r') as file:
            result = json.load(file)

        if isinstance(result, dict):
            result["execution_time_seconds"] = execution_time

        os.remove(input_file_path)
        os.remove(output_file_path)

        return result
    except subprocess.CalledProcessError as e:
        return {"error": f"Failed to run MPI script {script_name}: {str(e)}"}
    except Exception as e:
        return {"error": f"An unexpected error occurred: {str(e)}"}

def run_serial_script(script_name, input_data):
    try:
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as input_file:
            json.dump(input_data, input_file)
            input_file_path = input_file.name

        with tempfile.NamedTemporaryFile(mode='r', delete=False, suffix='.json') as output_file:
            output_file_path = output_file.name

        execution_start_time = time.time()

        command = f"python {script_name} {input_file_path} {output_file_path}"
        subprocess.run(command, shell=True, check=True)

        execution_end_time = time.time()
        execution_time = execution_end_time - execution_start_time

        with open(output_file_path, 'r') as file:
            result = json.load(file)

        if isinstance(result, dict):
            result["execution_time_seconds"] = execution_time

        os.remove(input_file_path)
        os.remove(output_file_path)

        return result
    except subprocess.CalledProcessError as e:
        return {"error": f"Failed to run serial script {script_name}: {str(e)}"}
    except Exception as e:
        return {"error": f"An unexpected error occurred: {str(e)}"}

@app.route('/tsp', methods=['POST'])
def process_data():
    try:
        data = request.get_json()
        required_keys = {"nodes", "executionType", "methodType", "startNode"}
        if not required_keys.issubset(data.keys()):
            return jsonify({"error": "Missing required keys in the JSON object."}), 400

        nodes = data["nodes"]
        execution_type = data["executionType"].lower()
        method_type = data["methodType"].lower()
        start_node_label = data["startNode"]
        # print(nodes)
        # print(execution_type)
        # print(method_type)
        # print(start_node_label)

        if not isinstance(nodes, list) or not all("coordinates" in node and "label" in node for node in nodes):
            return jsonify({"error": "Invalid 'nodes' format."}), 400

        labels = [node["label"] for node in nodes]
        if start_node_label not in labels:
            return jsonify({"error": f"Invalid 'startNode'. Must be one of: {labels}"}), 400

        formatted_nodes = [
            {"coordinates": (node["coordinates"]["lng"], node["coordinates"]["lat"]), "label": node["label"]}
            for node in nodes
        ]
        input_data = {"nodes": formatted_nodes, "startNode": start_node_label}

        if execution_type == "parallel":
            if method_type == "brute":
                result = run_mpi_script("parallel_brute_force.py", input_data)
            elif method_type == "nearest":
                result = run_mpi_script("parallel_nearest_neighbor.py", input_data)
            else:
                return jsonify({"error": f"Unsupported methodType: {method_type}"}), 400
        elif execution_type == "serial":
            if method_type == "brute":
                result = run_serial_script("serial_brute_force.py", input_data)
            elif method_type == "nearest":
                result = run_serial_script("serial_nearest_neighbor.py", input_data)
            else:
                return jsonify({"error": f"Unsupported methodType: {method_type}"}), 400
        else:
            return jsonify({"error": f"Unsupported executionType: {execution_type}"}), 400

        if "error" in result:
            return jsonify(result), 500

        response_data = {
            "status": "success",
            "executionType": execution_type,
            "methodType": method_type,
            "result": result
        }
        print(response_data)
        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
