import sys
import json
import numpy as np
import math
import time


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
    tour.append(tour[0])  # Return to start
    return tour, total_cost


# Main execution
if __name__ == "__main__":
    input_file = sys.argv[1]
    output_file = sys.argv[2]

    with open(input_file, 'r') as f:
        data = json.load(f)

    nodes = data["nodes"]
    start_node_label = data["startNode"]  # Get the starting node label
    coordinates = [node["coordinates"] for node in nodes]

    # Create distance matrix
    num_cities = len(nodes)
    distance_matrix = np.zeros((num_cities, num_cities))
    for i in range(num_cities):
        for j in range(num_cities):
            distance_matrix[i][j] = euclidean_distance(coordinates[i], coordinates[j])

    # Find the index of the start node from the label
    start_city = next(i for i, node in enumerate(nodes) if node["label"] == start_node_label)

    start_time = time.time()

    # Now, use the specific start node index
    tour, cost = nearest_neighbor_tsp(distance_matrix, start_city)

    end_time = time.time()
    execution_time = end_time - start_time

    # Format result
    result = {
        "optimal_tour": [nodes[i]["label"] for i in tour],
        "minimum_cost": cost,
        "execution_time_seconds": execution_time
    }

    # Write result to output file
    with open(output_file, 'w') as f:
        json.dump(result, f)
