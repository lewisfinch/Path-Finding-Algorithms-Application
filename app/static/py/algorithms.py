import math
from collections import deque
import heapq


def bfs_shortest_path(graph, start, end):
    """
    Find the shortest path between two nodes in a weighted graph using BFS.

    Args:
    - graph: a dictionary representing the graph
             keys are nodes and values are dictionaries of neighboring nodes and their edge weights
    - start: the starting node
    - end: the ending node

    Returns:
    - the shortest path (as a list of nodes), or None if there is no path
    """
    # Convert start and end lists to tuples
    start = tuple(start)
    end = tuple(end)

    # create a queue for BFS and add the starting node to it
    queue = deque([start])

    # create a dictionary to keep track of the visited nodes and their predecessors
    visited = {start: None}

    # create a dictionary to keep track of the distance from the start node to each visited node
    distance = {start: 0}

    # loop until the queue is empty
    while queue:
        # get the next node from the queue
        current_node = queue.popleft()

        # check if we have reached the end node
        if current_node == end:
            # build the shortest path by following the predecessors from end to start
            path = []
            while current_node is not None:
                path.append(current_node)
                current_node = visited[current_node]
            return path[::-1]  # reverse the path to get it from start to end

        # add the neighboring nodes to the queue and update their distance and visited status
        for neighbor, weight in graph[current_node].items():
            if neighbor not in visited:
                visited[neighbor] = current_node
                distance[neighbor] = distance[current_node] + weight
                queue.append(neighbor)
            elif distance[neighbor] > distance[current_node] + weight:
                distance[neighbor] = distance[current_node] + weight
                visited[neighbor] = current_node

    # if we reach here, there is no path between the start and end nodes
    return None


def dijkstra_shortest_path(graph, start, end):
    """
    Find the shortest path between two nodes in a weighted graph using Dijkstra's algorithm.

    Args:
    - graph: a dictionary representing the graph
             keys are nodes and values are dictionaries of neighboring nodes and their edge weights
    - start: the starting node
    - end: the ending node

    Returns:
    - the shortest path (as a list of nodes), or None if there is no path
    """
    # Convert start and end lists to tuples
    start = tuple(start)
    end = tuple(end)

    # create a priority queue to keep track of the nodes to visit and their tentative distances
    priority_queue = [(0, start)]

    # create a dictionary to keep track of the visited nodes and their predecessors
    visited = {start: None}

    # create a dictionary to keep track of the tentative distance from the start node to each visited node
    distance = {start: 0}

    # loop until the priority queue is empty
    while priority_queue:
        # get the node with the smallest tentative distance from the priority queue
        current_distance, current_node = heapq.heappop(priority_queue)

        # check if we have reached the end node
        if current_node == end:
            # build the shortest path by following the predecessors from end to start
            path = []
            while current_node is not None:
                path.append(current_node)
                current_node = visited[current_node]
            return path[::-1]  # reverse the path to get it from start to end

        # check if we have already processed this node with a smaller distance
        if current_distance > distance[current_node]:
            continue

        # add the neighboring nodes to the priority queue and update their distance and visited status
        for neighbor, weight in graph[current_node].items():
            tentative_distance = distance[current_node] + weight
            if neighbor not in visited or tentative_distance < distance[neighbor]:
                visited[neighbor] = current_node
                distance[neighbor] = tentative_distance
                heapq.heappush(priority_queue, (tentative_distance, neighbor))

    # if we reach here, there is no path between the start and end nodes
    return None


def bidirectional_search(graph, start, end):
    # Convert start and end lists to tuples
    start = tuple(start)
    end = tuple(end)

    # Initialize the starting and ending search trees
    forward_tree = {start: None}
    backward_tree = {end: None}
    forward_queue = deque([start])
    backward_queue = deque([end])
    intersection = None

    # Keep track of the visited nodes in each search tree
    forward_visited = set()
    backward_visited = set()

    while forward_queue and backward_queue:
        # Expand the forward search tree
        current = forward_queue.pop()
        forward_visited.add(current)
        for neighbor, cost in graph[current].items():
            if neighbor not in forward_visited:
                forward_queue.append(neighbor)
                forward_tree[neighbor] = current

        # Check if we've found an intersection
        if current in backward_visited:
            intersection = current
            break

        # Expand the backward search tree
        current = backward_queue.pop()
        backward_visited.add(current)
        for neighbor, cost in graph[current].items():
            if neighbor not in backward_visited:
                backward_queue.append(neighbor)
                backward_tree[neighbor] = current

        # Check if we've found an intersection
        if current in forward_visited:
            intersection = current
            break

    if intersection is None:
        return None

    # Reconstruct the shortest path from start to end
    path = [intersection]
    while path[-1] != start:
        path.append(forward_tree[path[-1]])
    path = path[::-1]

    # Add the second half of the path from intersection to end
    while intersection != end:
        intersection = backward_tree[intersection]
        path.append(intersection)

    return path


def astar_search(graph, start, end, heuristic):
    # Convert start and end lists to tuples
    start = tuple(start)
    end = tuple(end)

    # Initialize the starting node
    frontier = [(0, start)]
    explored = set()
    g_score = {start: 0}
    f_score = {start: heuristic(start, end)}
    parent = {start: None}

    while frontier:
        # Get the node with the lowest f-score
        _, current = heapq.heappop(frontier)

        # Check if we've reached the goal
        if current == end:
            path = []
            while current:
                path.append(current)
                current = parent[current]
            return path[::-1]

        explored.add(current)

        # Expand the current node's neighbors
        for neighbor, cost in graph[current].items():
            if neighbor in explored:
                continue
            tentative_g_score = g_score[current] + cost
            if neighbor not in g_score or tentative_g_score < g_score[neighbor]:
                g_score[neighbor] = tentative_g_score
                f_score[neighbor] = tentative_g_score + heuristic(neighbor, end)
                parent[neighbor] = current
                heapq.heappush(frontier, (f_score[neighbor], neighbor))

    # If we get here, there is no path from start to end
    return None


def bellman_ford(graph, start_node, end_node):
    # Convert start and end lists to tuples
    start_node = tuple(start_node)
    end_node = tuple(end_node)

    # Step 1: Initialize distances to all nodes to infinity, except the start node which is 0
    distances = {node: float('inf') for node in graph}
    distances[start_node] = 0

    # Step 2: Relax edges repeatedly (V-1) times, where V is the number of nodes
    for _ in range(len(graph) - 1):
        for node in graph:
            for neighbor in graph[node]:
                # Relax the edge from 'node' to 'neighbor'
                if distances[node] + graph[node][neighbor] < distances[neighbor]:
                    distances[neighbor] = distances[node] + \
                        graph[node][neighbor]

    # Step 3: Check for negative cycles
    for node in graph:
        for neighbor in graph[node]:
            if distances[node] + graph[node][neighbor] < distances[neighbor]:
                raise ValueError("Graph contains a negative weight cycle")

    # Step 4: If end_node is reachable, return the shortest path
    if end_node in distances:
        # Reconstruct the shortest path
        path = [end_node]
        while path[-1] != start_node:
            current_node = path[-1]
            previous_node = min(
                graph[current_node], key=lambda x: distances[x] + graph[x][current_node])
            path.append(previous_node)
        path.reverse()
        return path
    else:
        return None

    
# function to calculate the Manhattan distance
def manhattan_distance(coord1, coord2):
    x1, y1 = coord1
    x2, y2 = coord2
    return abs(x1 - x2) + abs(y1 - y2)


# function to calculate the haversine distance
def haversine_distance(coord1, coord2):
    def deg_to_rad(deg):
        return deg * math.pi / 180

    lat1, lng1 = coord1
    lat2, lng2 = coord2

    R = 6371  # Earth's radius in kilometers
    lat1_rad, lat2_rad = deg_to_rad(lat1), deg_to_rad(lat2)
    delta_lat_rad = deg_to_rad(lat2 - lat1)
    delta_lng_rad = deg_to_rad(lng2 - lng1)

    a = math.sin(delta_lat_rad / 2) ** 2 + \
        math.cos(lat1_rad) * math.cos(lat2_rad) * \
        math.sin(delta_lng_rad / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c
