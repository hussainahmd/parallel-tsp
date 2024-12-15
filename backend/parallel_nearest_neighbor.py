import sys
import json
import numpy as np
import math
import time
from mpi4py import MPI

# Calculate Euclidean distance
def euclidean_distance(point1, point2):
    return math.sqrt((point1[0] - point2[0]) ** 2 + (point1[1] - point2[1]) ** 2)

# Nearest Neighbor Algorithm
def nearest_neighbor_tsp(distance_matrix, start_city):
    num_cities = len(distance_matrix)
    visited = [False] * num_cities
    current_city = start_city
    visited[current_city] = True
    tour = [current_city]
    total_cost = 0

    for _ in range(num_cities - 1):
        nearest_city = None
        nearest_distance = float('inf')
        for next_city in range(num_cities):
            if not visited[next_city]:
                distance = distance_matrix[current_city][next_city]
                if distance < nearest_distance:
                    nearest_city = next_city
                    nearest_distance = distance
        visited[nearest_city] = True
        tour.append(nearest_city)
        total_cost += nearest_distance
        current_city = nearest_city

    total_cost += distance_matrix[current_city][tour[0]]
    tour.append(tour[0])
    return tour, total_cost

# MPI Initialization
comm = MPI.COMM_WORLD
rank = comm.Get_rank()
size = comm.Get_size()

# Parse input and output file paths
input_file = sys.argv[1]
output_file = sys.argv[2]

# Start timing
execution_start_time = time.time()

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

    # Distribute cities among processes
    if rank == 0:
        cities = list(range(num_cities))
        chunk_size = len(cities) // size
        remainder = len(cities) % size

        # Divide cities into chunks and handle remainder
        chunks = [
            cities[i * chunk_size + min(i, remainder):(i + 1) * chunk_size + min(i + 1, remainder)]
            for i in range(size)
        ]
    else:
        chunks = None

    # Scatter chunks to processes
    chunk = comm.scatter(chunks, root=0)

    # Find the best tour in the assigned chunk
    local_best_tour = None
    local_best_cost = float('inf')

    for start_city in chunk:
        tour, cost = nearest_neighbor_tsp(distance_matrix, start_node_index)  # Always use start_node_index
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

        result = {
            "optimal_tour": labeled_tour,
            "minimum_cost": best_cost,
            "execution_time_seconds": execution_end_time - execution_start_time
        }

        # Write results to the output file
        with open(output_file, 'w') as f:
            json.dump(result, f)

except Exception as e:
    if rank == 0:
        execution_end_time = time.time()
        error_result = {
            "error": str(e),
            "execution_time_seconds": execution_end_time - execution_start_time
        }
        with open(output_file, 'w') as f:
            json.dump(error_result, f)
