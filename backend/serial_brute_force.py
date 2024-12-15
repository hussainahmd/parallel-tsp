import sys
import json
import numpy as np
import math
import time
from itertools import permutations


# Calculate Euclidean distance
def euclidean_distance(point1, point2):
    return math.sqrt((point1[0] - point2[0]) ** 2 + (point1[1] - point2[1]) ** 2)


# Calculate the total cost of a tour
def calculate_tour_cost(tour, distance_matrix):
    cost = 0
    for i in range(len(tour) - 1):
        cost += distance_matrix[tour[i]][tour[i + 1]]
    cost += distance_matrix[tour[-1]][tour[0]]  # Return to start
    return cost


# Main execution
if __name__ == "__main__":
    input_file = sys.argv[1]
    output_file = sys.argv[2]

    with open(input_file, 'r') as f:
        data = json.load(f)

    nodes = data["nodes"]
    start_node_label = data["startNode"]

    # Map labels to indices and get start node index
    labels = [node["label"] for node in nodes]
    start_node_index = labels.index(start_node_label)

    coordinates = [node["coordinates"] for node in nodes]

    # Create distance matrix
    num_cities = len(nodes)
    distance_matrix = np.zeros((num_cities, num_cities))
    for i in range(num_cities):
        for j in range(num_cities):
            distance_matrix[i][j] = euclidean_distance(coordinates[i], coordinates[j])

    start_time = time.time()

    # Brute force to find the optimal tour
    # Exclude the start node and permute the remaining nodes
    remaining_nodes = [i for i in range(num_cities) if i != start_node_index]
    all_tours = list(permutations(remaining_nodes))
    best_tour = None
    best_cost = float('inf')

    for tour in all_tours:
        # Add the start node at the beginning and end of the tour
        full_tour = (start_node_index,) + tour + (start_node_index,)
        cost = calculate_tour_cost(full_tour, distance_matrix)
        if cost < best_cost:
            best_cost = cost
            best_tour = full_tour

    end_time = time.time()
    execution_time = end_time - start_time

    # Format result
    result = {
        "optimal_tour": [nodes[i]["label"] for i in best_tour],
        "minimum_cost": best_cost,
        "execution_time_seconds": execution_time
    }

    # Write result to output file
    with open(output_file, 'w') as f:
        json.dump(result, f)
