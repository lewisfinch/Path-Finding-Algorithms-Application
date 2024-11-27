// Breadth-First Search
function bfs_shortest_path(graph, start, end) {
    // Initialize queue, visited, and distance
    const queue = [start];
    const visited = {[start]: null};
    const distance = {[start]: 0};

    // While there are nodes to visit
    while (queue.length > 0) {
        const currentNode = queue.shift();

        // If we reached the end node, construct the path
        if (currentNode === end) {
            const path = [];
            let node = currentNode;
            while (node !== null) {
                path.push(node);
                node = visited[node];
            }
            return path.reverse();
        }

        // Process neighbors of the current node
        for (const neighbor in graph[currentNode]) {
            const weight = graph[currentNode][neighbor];
            if (!visited.hasOwnProperty(neighbor)) {
                visited[neighbor] = currentNode;
                distance[neighbor] = distance[currentNode] + weight;
                queue.push(neighbor);
            } else if (distance[neighbor] > distance[currentNode] + weight) {
                distance[neighbor] = distance[currentNode] + weight;
                visited[neighbor] = currentNode;
            }
        }
    }
    return null;
}

// Dijkstra's Algorithm
function dijkstra_shortest_path(graph, start, end) {
    // Initialize priority queue, visited, and distance
    const priorityQueue = [[0, start]];
    const visited = {[start]: null};
    const distance = {[start]: 0};

    // While there are nodes to visit
    while (priorityQueue.length > 0) {
        const [currentDistance, currentNode] = priorityQueue.shift();

        // If we reached the end node, construct the path
        if (currentNode === end) {
            const path = [];
            let node = currentNode;
            while (node !== null) {
                path.push(node);
                node = visited[node];
            }
            return path.reverse();
        }

        // If already processed with smaller distance, skip
        if (currentDistance > distance[currentNode]) {
            continue;
        }

        // Process neighbors of the current node
        for (const neighbor in graph[currentNode]) {
            const weight = graph[currentNode][neighbor];
            const tentativeDistance = distance[currentNode] + weight;
            if (!visited.hasOwnProperty(neighbor) || tentativeDistance < distance[neighbor]) {
                visited[neighbor] = currentNode;
                distance[neighbor] = tentativeDistance;
                priorityQueue.push([tentativeDistance, neighbor]);
            }
        }
    }
    return null;
}

// Bidirectional Search
function bidirectional_shortest_path(graph, start, end) {
    // Initialize forward and backward trees, queues, and visited sets
    const forwardTree = {[start]: null};
    const backwardTree = {[end]: null};
    const forwardQueue = [start];
    const backwardQueue = [end];
    let intersection = null;

    const forwardVisited = new Set();
    const backwardVisited = new Set();

    // While there are nodes to visit in both directions
    while (forwardQueue.length > 0 && backwardQueue.length > 0) {
        // Expand forward tree and check for intersection
        let current = forwardQueue.shift();
        forwardVisited.add(current);
        for (const neighbor in graph[current]) {
            if (!forwardVisited.has(neighbor)) {
                forwardQueue.push(neighbor);
                forwardTree[neighbor] = current;
            }
        }

        // Expand backward tree and check for intersection
        current = backwardQueue.shift();
        backwardVisited.add(current);
        for (const neighbor in graph[current]) {
            if (!backwardVisited.has(neighbor)) {
                backwardQueue.push(neighbor);
                backwardTree[neighbor] = current;
            }
        }

        if (forwardVisited.has(current)) {
            intersection = current;
            break;
        }
    }

    // If no intersection, there is no path
    if (intersection === null) {
        return null;
    }

    // Construct the path from start to end
    const path = [intersection];
    while (path[path.length - 1] !== start) {
        path.push(forwardTree[path[path.length - 1]]);
    }
    path.reverse();

    while (intersection !== end) {
        intersection = backwardTree[intersection];
        path.push(intersection);
    }

    return path;
}

// A* Algorithm
function astar_shortest_path(graph, start, end, heuristic) {
    // Initialize frontier, explored set, gScore, fScore, and parent
    const frontier = [[0, start]];
    const explored = new Set();
    const gScore = {[start]: 0};
    const fScore = {[start]: heuristic(start, end)};
    const parent = {[start]: null};

    // While there are nodes to visit
    while (frontier.length > 0) {
        const [_, currentNode] = frontier.shift();

        // If we reached the end node, construct the path
        if (currentNode === end) {
            const path = [];
            let node = currentNode;
            while (node !== null) {
                path.push(node);
                node = parent[node];
            }
            return path.reverse();
        }

        // Mark the current node as explored
        explored.add(currentNode);

        // Process neighbors of the current node
        for (const neighbor in graph[currentNode]) {
            const weight = graph[currentNode][neighbor];
            const tentativeGScore = gScore[currentNode] + weight;
            if (!explored.has(neighbor) && (!gScore.hasOwnProperty(neighbor) || tentativeGScore < gScore[neighbor])) {
                gScore[neighbor] = tentativeGScore;
                fScore[neighbor] = tentativeGScore + heuristic(neighbor, end);
                parent[neighbor] = currentNode;
                frontier.push([fScore[neighbor], neighbor]);
            }
        }
    }
    return null;
}

// Bellman-Ford Algorithm
function bellman_ford_shortest_path(graph, startNode, endNode) {
    // Step 1: Initialize distances to all nodes to infinity, except the start node which is 0
    const distances = {};
    for (const node in graph) {
        distances[node] = Infinity;
    }
    distances[startNode] = 0;

    // Step 2: Relax edges repeatedly (V-1) times, where V is the number of nodes
    let hasChanged;
    for (let i = 0; i < Object.keys(graph).length - 1; i++) {
        hasChanged = false;
        for (const node in graph) {
            for (const neighbor in graph[node]) {
                // Relax the edge from 'node' to 'neighbor'
                if (distances[node] + graph[node][neighbor] < distances[neighbor]) {
                    distances[neighbor] = distances[node] + graph[node][neighbor];
                    hasChanged = true;
                }
            }
        }
        // Optimization: Early termination if no changes were made
        if (!hasChanged) break;
    }

    // Step 3: Check for negative cycles
    for (const node in graph) {
        for (const neighbor in graph[node]) {
            if (distances[node] + graph[node][neighbor] < distances[neighbor]) {
                throw new Error("Graph contains a negative weight cycle");
            }
        }
    }

    // Step 4: If endNode is reachable, return the shortest path
    if (endNode in distances) {
        // Reconstruct the shortest path
        const path = [endNode];
        while (path[path.length - 1] !== startNode) {
            const currentNode = path[path.length - 1];
            let previousNode = null;
            let minDistance = Infinity;
            for (const node in graph[currentNode]) {
                const distance = distances[node] + graph[node][currentNode];
                if (distance < minDistance) {
                    minDistance = distance;
                    previousNode = node;
                }
            }
            path.push(previousNode);
        }
        return path.reverse();
    } else {
        return null;
    }
}

// Function to get Lat and Lon of a coordinate
function getLatLng(coord) {
    if (Array.isArray(coord)) {
        return {
            lat: coord[1],
            lng: coord[0],
        };
    } else {
        return coord;
    }
}

// Manhattan, Heuristic Function 1
function manhattan_distance(coord1, coord2) {
    const c1 = getLatLng(coord1);
    const c2 = getLatLng(coord2);
    const R = 6371; // Earth's radius in kilometers
    const latDiff = Math.abs(c1.lat - c2.lat);
    const lngDiff = Math.abs(c1.lng - c2.lng);

    return R * (latDiff + lngDiff);
}

// Haversine, Heuristic Function 2
function haversine_distance(coord1, coord2) {
    const c1 = getLatLng(coord1);
    const c2 = getLatLng(coord2);

    const R = 6371; // Earth's radius in kilometers
    const lat1 = c1.lat * Math.PI / 180;
    const lat2 = c2.lat * Math.PI / 180;
    const deltaLat = (c2.lat - c1.lat) * Math.PI / 180;
    const deltaLng = (c2.lng - c1.lng) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}
