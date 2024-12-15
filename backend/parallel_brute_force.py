import sys
import json
import time
from mpi4py import MPI
from itertools import permutations
import math
import numpy as np

# Calculate Euclidean distance
def euclidean_distance(point1, point2):
    return math.sqrt((point1[0] - point2[0]) ** 2 + (point1[1] - point2[1]) ** 2)

# Calculate the total cost of a tour
def calculate_tour_cost(tour, distance_matrix):
    cost = 0
    for i in range(len(tour) - 1):
        cost += distance_matrix[tour[i]][tour[i + 1]]
    cost += distance_matrix[tour[-1]][tour[0]]  # Return to start node
    return cost

# MPI Initialization
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

# Record start time
execution_start_time = time.time()

# Parse input and output file paths
if len(sys.argv) != 3:
    if rank == 0:
        print("Usage: python script.py <input_file> <output_file>")
    sys.exit(1)

input_file = sys.argv[1]
output_file = sys.argv[2]

try:
    # Load data from the input file
    with open(input_file, 'r') as f:
        data = json.load(f)
        nodes = data["nodes"]
        start_node_label = data["startNode"]

    # Map labels to indices
    labels = [node["label"] for node in nodes]
    coordinates = [node["coordinates"] for node in nodes]
    start_node_index = labels.index(start_node_label)

    # Create distance matrix
    num_cities = len(nodes)
    distance_matrix = np.zeros((num_cities, num_cities))
    for i in range(num_cities):
        for j in range(num_cities):
            distance_matrix[i][j] = euclidean_distance(coordinates[i], coordinates[j])

    # Generate all permutations of cities excluding the start node
    other_indices = [i for i in range(num_cities) if i != start_node_index]
    if rank == 0:
        all_tours = list(permutations(other_indices))
        chunk_size = len(all_tours) // size
        chunks = [all_tours[i * chunk_size:(i + 1) * chunk_size] for i in range(size)]
        # Handle remainder
        for i in range(len(all_tours) % size):
            chunks[i].append(all_tours[-(i + 1)])
    else:
        chunks = None

    # Distribute chunks to processes
    chunk = comm.scatter(chunks, root=0)

    # Find the best tour in the assigned chunk
    local_best_tour = None
    local_best_cost = float('inf')
    for sub_tour in chunk:
        tour = [start_node_index] + list(sub_tour) + [start_node_index]
        cost = calculate_tour_cost(tour, distance_matrix)
        if cost < local_best_cost:
            local_best_tour = tour
            local_best_cost = cost

    # Gather results from all processes
    global_best_tours = comm.gather((local_best_tour, local_best_cost), root=0)

    # Determine the optimal tour and cost
    if rank == 0:
        best_tour, best_cost = min(global_best_tours, key=lambda x: x[1])
        labeled_tour = [labels[i] for i in best_tour]
        execution_end_time = time.time()
        execution_time = execution_end_time - execution_start_time

        # Prepare result
        result = {
            "optimal_tour": labeled_tour,
            "minimum_cost": best_cost,
            "execution_time_seconds": execution_time
        }

        # Write results to the output file
        with open(output_file, 'w') as f:
            json.dump(result, f)

except Exception as e:
    if rank == 0:
        with open(output_file, 'w') as f:
            json.dump({"error": str(e)}, f)
    sys.exit(1)
