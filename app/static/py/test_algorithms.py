import os
import json
import time
from memory_profiler import memory_usage
from algorithms import bfs_shortest_path, \
    dijkstra_shortest_path, bidirectional_search, \
    astar_search, manhattan_distance, haversine_distance


# function to convert GeoJSON data into a graph
def geojson_to_graph(geojson_data):
    data = json.loads(geojson_data)

    graph = {}
    features = data['features']

    for feature in features:
        geometry_type = feature['geometry']['type']

        if geometry_type == "LineString":
            coordinates = feature['geometry']['coordinates']

            for i, coord in enumerate(coordinates[:-1]):
                current_coord = tuple(coord)
                next_coord = tuple(coordinates[i + 1])

                if current_coord not in graph:
                    graph[current_coord] = {}
                if next_coord not in graph:
                    graph[next_coord] = {}

                # Assuming that the distance between the coordinates is the edge cost
                distance = haversine_distance(current_coord, next_coord)
                graph[current_coord][next_coord] = distance
                graph[next_coord][current_coord] = distance

    return graph


# function to load a GeoJSON file
def load_geojson_file(file_path):
    with open(file_path, 'r') as file:
        geojson_data = file.read()
    return geojson_data


# Function to calculate the distance of a given path in meters
def path_distance(graph, path):
    distance = 0
    for i in range(len(path) - 1):
        distance += graph[path[i]][path[i + 1]]
    return distance


# Function to run and measure the performance of algorithms
def test_algorithm(algorithm, graph, start, end, heuristic=None, iterations=1):
    total_time = 0
    total_memory = 0

    for _ in range(iterations):
        start_time = time.time_ns()
        start_memory = memory_usage(-1, interval=0.2, timeout=0.5)

        if heuristic:
            path = algorithm(graph, start, end, heuristic)
        else:
            path = algorithm(graph, start, end)

        end_time = time.time_ns()
        end_memory = memory_usage(-1, interval=0.2, timeout=0.5)

        total_time += end_time - start_time
        total_memory += end_memory[0] - start_memory[0]

    avg_time = (total_time / iterations) / 1_000_000  # Convert to milliseconds
    avg_memory = (total_memory / iterations) * 1_000_000  # Convert to bytes

    if path:
        distance = path_distance(graph, path)
        return avg_time, avg_memory, distance
    else:
        return avg_time, avg_memory, None


'''
Test, Test, Test
'''

'''
Graph Setup
'''
# Replace the file path with the correct path to your GeoJSON file
file_path = 'static/data/umn_complete_campus_osm.geojson'
geojson_data = load_geojson_file(file_path)

# Convert the geojson data into a graph
graph = geojson_to_graph(geojson_data)
# print(graph)


'''
Algorithms Setup
'''
algorithm_names = ["A* w Manhattan", "A* w Haversine", "Bidirectional Search",
                   "Breadth-First Search", "Dijkstra's Algorithm"]
algorithms = [astar_search, astar_search, bidirectional_search, bfs_shortest_path, dijkstra_shortest_path]
heuristics = [manhattan_distance, haversine_distance, None, None, None]

'''
Results Setup
'''
# Create the directory if it doesn't exist
if not os.path.exists("static/results"):
    os.makedirs("static/results")

'''
Test 1
Anderson Hall -> RecWell
-93.2425962,44.9723588 -> -93.2303338,44.9751693
'''
# Write the results to the file
with open("static/results/test_1_result.txt", "w") as f:
    f.write(">>>>>>>>>> Test 1, Anderson Hall -> RecWell, Average of 20 Iterations <<<<<<<<<<\n")
    start_test_1 = [-93.2425962, 44.9723588]
    dest_test_1 = [-93.2303338, 44.9751693]

    # Run the Test 1
    for name, algo, heuristic in zip(algorithm_names, algorithms, heuristics):
        avg_time, avg_memory, distance = test_algorithm(algo, graph, start_test_1, dest_test_1, heuristic,
                                                        iterations=20)
        f.write(f">>> {name} <<<\n")
        f.write(f"Time taken: {avg_time:.2f} milliseconds\n")
        f.write(f"Memory used: {avg_memory:.0f} bytes\n")
        if distance is not None:
            f.write(f"Distance: {distance:.3f} meters\n")
        else:
            f.write("No path found\n")
        f.write("\n")

'''
Test 2
Eddy Hall -> Frontier Hall
-93.2363017,44.9777659 -> -93.2282896,44.9712939
'''
with open("static/results/test_2_result.txt", "w") as f:
    f.write(">>>>>>>>>> Test 2, Eddy Hall -> Frontier Hall, Average of 20 Iterations <<<<<<<<<<\n")
    start_test_2 = [-93.2363017, 44.9777659]
    dest_test_2 = [-93.2282896, 44.9712939]

    # Run the Test 2
    for name, algo, heuristic in zip(algorithm_names, algorithms, heuristics):
        avg_time, avg_memory, distance = test_algorithm(algo, graph, start_test_2, dest_test_2, heuristic,
                                                        iterations=20)
        f.write(f">>> {name} <<<\n")
        f.write(f"Time taken: {avg_time:.2f} milliseconds\n")
        f.write(f"Memory used: {avg_memory:.0f} bytes\n")
        if distance is not None:
            f.write(f"Distance: {distance:.3f} meters\n")
        else:
            f.write("No path found\n")
        f.write("\n")

'''
Test 3
Walter Library (main door) -> Boynton Health Service
-93.2357297,44.9752741 -> -93.2340253,44.9722088
'''
with open("static/results/test_3_result.txt", "w") as f:
    f.write(">>>>>>>>>> Test 3, Walter Library (main door) -> Boynton Health Service, "
            "Average of 20 Iterations <<<<<<<<<<\n")
    start_test_3 = [-93.2357297, 44.9752741]
    dest_test_3 = [-93.2340253, 44.9722088]

    # Run the Test 3
    for name, algo, heuristic in zip(algorithm_names, algorithms, heuristics):
        avg_time, avg_memory, distance = test_algorithm(algo, graph, start_test_3, dest_test_3, heuristic,
                                                        iterations=20)
        f.write(f">>> {name} <<<\n")
        f.write(f"Time taken: {avg_time:.2f} milliseconds\n")
        f.write(f"Memory used: {avg_memory:.0f} bytes\n")
        if distance is not None:
            f.write(f"Distance: {distance:.3f} meters\n")
        else:
            f.write("No path found\n")
        f.write("\n")
