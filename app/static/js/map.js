/*** Mapbox Block ***/
mapboxgl.accessToken = 'pk.eyJ1IjoianVueXVhbmdvIiwiYSI6ImNsZ2swYWt1ZTFhNTczbW1vYW5kbzdtOGEifQ.axOt4GlEp6YuMSm2h6X1NQ';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-93.235, 44.973],
    zoom: 14
});
/*** Mapbox Block ***/


/*** Global Variables ***/
var markers = [];                   // Markers on the map
var flipflop = 0;                   // Flipflop to control markers
var geojson = null;                 // geojson data pointer
var graph = {};                     // graph pointer for algorithms
/*** Global Variables ***/


/*** GeoJSON Block ***/
// Function to fetch GeoJSON data for campus
async function fetchGeoJSONData(filename) {
    try {
        const geojsonData = await fetch(filename);

        if (!geojsonData.ok) {
            throw new Error(`HTTP error! Status: ${geojsonData.status}`);
        }

        return await geojsonData.json();
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
    }
}

fetchGeoJSONData('/umn_complete_campus_osm.geojson')
    .then(data => {
        // console.log(data);
        geojson = data;
        init();
    })
    .catch(error => console.error(error));

// Function to convert GeoJSON into a graph
function geojsonToGraph(geojson) {
    geojson.features.forEach((feature) => {
        let coordinates = [];
        if (feature.geometry.type === 'LineString') {
            coordinates = feature.geometry.coordinates;
        } else if (feature.geometry.type === 'Polygon') {
            coordinates = feature.geometry.coordinates[0];
        }

        for (let i = 0; i < coordinates.length - 1; i++) {
            const start = coordinates[i].toString();
            const end = coordinates[i + 1].toString();
            const weight = haversine_distance(coordinates[i], coordinates[i + 1]);

            if (!graph[start]) {
                graph[start] = {};
            }
            graph[start][end] = weight;

            if (!graph[end]) {
                graph[end] = {};
            }
            graph[end][start] = weight;
        }
    });
    return graph;
}

/*** GeoJSON Block ***/


/*** Map Block ***/
// Function to find the nearest coordinate in GeoJSON
function findNearestCoordinates(coord, geojson) {
    const NEARBY_THRESHOLD = 0.5; // distance threshold in degrees

    let nearestCoord = null;
    let minDist = Infinity;

    geojson.features.forEach((feature) => {
        if (feature.geometry.type === 'LineString') {
            let coordinates = feature.geometry.coordinates;
            coordinates.forEach((coord2) => {
                const dist = haversine_distance(coord, coord2);
                // console.log("dist: ", dist);
                if (dist < minDist) {
                    minDist = dist;
                    nearestCoord = coord2;
                }
            });
        }
    });

    // Check if the nearest coordinate is within the threshold
    if (minDist > NEARBY_THRESHOLD) {
        nearestCoord = null;
    }

    return nearestCoord;
}

// initialize the map and graph
function init() {
    graph = geojsonToGraph(geojson);

    // Add click event listener to the map
    map.on('click', function (event) {
        // Get the coordinates of the clicked point
        let coord = event.lngLat;
        // console.log("clicked on ", coord);

        const nearestCoord = findNearestCoordinates(coord, geojson);
        // console.log("nearest coordinate: ", nearestCoord);
        if (nearestCoord === null) {
            alert("Please keep the range inside the campus.");
            return;
        }
        // const nearestLngLat = new mapboxgl.LngLat(nearestCoord[0], nearestCoord[1]);
        // console.log("nearest lnglat: ", nearestLngLat);

        markerHandler(nearestCoord, map, geojson);

        updateInput(nearestCoord);
    });
}

// Update HTML input
function updateInput(coord) {
    let element;
    if (flipflop) {
        element = document.getElementById('start');
    } else {
        element = document.getElementById('dest');
    }
    element.value = [coord[0], coord[1]];
}

// Function to fit points into the map bound
function fitBoundsToPoints(pointA, pointB = null) {
    // console.log("pointA: ", pointA);
    const sw = new mapboxgl.LngLat(pointA[0], pointA[1]);
    // console.log("sw: ", sw);
    if (pointB) {
        const ne = new mapboxgl.LngLat(pointB[0], pointB[1]);
        // console.log("pointB: ", pointB);
        // console.log("ne: ", ne);
        const bounds = new mapboxgl.LngLatBounds(sw, ne);

        bounds.extend(sw);
        bounds.extend(ne);

        map.fitBounds(bounds, {
            padding: {top: 20, bottom: 20, left: 20, right: 20},
            maxZoom: 16
        });
    } else {
        // If only one point is provided, center the map on that point
        map.flyTo({
            center: sw,
            zoom: 16,
            speed: 0.8
        });
    }
}


// Add markers or other layers as necessary
function markerHandler(lngLat, map, geojson) {
    if (markers.length === 2) {
        // Create a new marker at the clicked coordinates
        let marker = markers[flipflop];
        marker.setLngLat(lngLat);

        if (!flipflop) {
            marker
                .setPopup(new mapboxgl.Popup({offset: 15})
                    .setHTML("<h2>Start</h2><p>Position: " + lngLat + "</p>"));
        } else {
            marker
                .setPopup(new mapboxgl.Popup({offset: 15})
                    .setHTML("<h2>Destination</h2><p>Position: " + lngLat + "</p>"));
        }
        marker
            .addTo(map)
            .getPopup().addTo(map);
    } else {
        // Create a new marker at the clicked coordinates
        let newMarker = new mapboxgl.Marker()
            .setLngLat(lngLat);

        if (!flipflop) {
            newMarker
                .setPopup(new mapboxgl.Popup({offset: 15})
                    .setHTML("<h2>Start</h2><p>Position: " + lngLat + "</p>"));
        } else {
            newMarker
                .setPopup(new mapboxgl.Popup({offset: 15})
                    .setHTML("<h2>Destination</h2><p>Position: " + lngLat + "</p>"));
        }

        // Add the marker to the map and the array
        newMarker
            .addTo(map)
            .getPopup().addTo(map);
        markers.push(newMarker);
    }
    flipflop === 0 ? flipflop++ : flipflop--;
}


// Function to clear the map, markers, flipflop, routes
function clearMap() {
    markers.forEach(marker => marker.remove());
    if (map.getSource('my-route')) {
        map.removeLayer('my-route');
        map.removeSource('my-route');
    }
    flipflop = 0;
}

/*** Map Block ***/


/*** Route Block ***/
// Function to calculate the distance of one path
function calculatePathDistance(path) {
    let totalDistance = 0;
    for (let i = 0; i < path.length - 1; i++) {
        const coord1 = path[i].split(",").map(parseFloat);
        const coord2 = path[i + 1].split(",").map(parseFloat);
        totalDistance += haversine_distance(coord1, coord2);
    }
    return totalDistance;
}

// Function to get coordinates of a path generated by the selected algorithm
async function get_coordinates(start, dest, search_strategy, mode) {
    try {
        // console.log("get_coordinate(), start: " + start + " dest : " + dest + " strategy: " + search_strategy);
        let path = [];

        // Main function to execute the algorithm
        async function findShortestPath() {
            switch (search_strategy) {
                case 'astar_manhattan':
                    path = astar_shortest_path(graph, start, dest, manhattan_distance);
                    break;
                case 'astar_haversine':
                    path = astar_shortest_path(graph, start, dest, haversine_distance);
                    break;
                case 'bfs':
                    path = bfs_shortest_path(graph, start, dest);
                    break;
                case 'bds':
                    path = bidirectional_shortest_path(graph, start, dest);
                    break;
                case 'dijkstra':
                    path = dijkstra_shortest_path(graph, start, dest);
                    break;
                case 'bellman_ford':
                    path = bellman_ford_shortest_path(graph, start, dest);
                    break;
            }
        }

        // Prepare for the test
        if (mode === 'test') {
            let totalTimeTaken = 0, initialMemory = 0, finalMemory = 0, totalMemoryUsed = 0, iterations = 100,
                validMemoryCount = 0;
            // Call the mainFunction
            for (let i = 0; i < iterations; i++) {
                // Time and memory setup
                const startTime = performance.now();
                if (performance.memory) {
                    initialMemory = performance.memory.usedJSHeapSize;
                }

                await findShortestPath();

                // Time and memory warp up
                const endTime = performance.now();
                totalTimeTaken += (endTime - startTime);
                if (performance.memory) {
                    finalMemory = performance.memory.usedJSHeapSize;
                }
                let memoryUsed = finalMemory - initialMemory;
                if (memoryUsed >= 0) {
                    totalMemoryUsed += memoryUsed;
                    validMemoryCount++;
                }
            }

            // Check if there is a path, if yes, pop up the result
            if (path === null) {
                return null;
            } else {
                let distance = calculatePathDistance(path);
                let avgTimeTaken = totalTimeTaken / iterations;
                let avgMemoryUsed = totalMemoryUsed / validMemoryCount;
                // Display the test results in the popup
                const popup = document.getElementById('popup');
                popup.innerHTML = `
                    <h3>Test Results: </h3>
                    <p>Algorithm Used: ${search_strategy}</p>
                    <p><<< 100 Iterations (${validMemoryCount} valid) <<<</p>
                    <br>
                    <p>Avg Time taken: ${avgTimeTaken.toPrecision(5)} milliseconds</p>
                    <p>Avg Memory used: ${avgMemoryUsed} bytes</p>
                    <p>Distance Traveled: ${distance.toPrecision(5)} kilometers</p>
                    <br>
                    <button onclick="hidePopup()">Close</button>`;
                showPopup();
            }
        } else {
            await findShortestPath();
        }

        // Check if there is a path
        if (path === null) {
            return null;
        }

        return path.map(function (node) {
            return node.split(",").map(function (coordinate) {
                return Number(coordinate);
            });
        });

    } catch
        (error) {
        console.error('Error fetching data:', error);
    }
}

// Add Route Layer to the map
function addRouteLayer(coordinates) {
    if (map.getSource('my-route')) {
        map.removeLayer('my-route');
        map.removeSource('my-route');
    }
    map.addSource('my-route', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': coordinates
            }
        }
    });
    map.addLayer({
        'id': 'my-route',
        'type': 'line',
        'source': 'my-route',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': 'maroon',
            'line-width': 4
        }
    });
}

// Function the plot the route
function plot_route(coordinates) {
    if (map.loaded()) {
        addRouteLayer(coordinates);
    } else {
        map.on('load', function () {
            addRouteLayer(coordinates);
        });
    }
}

// Function to plan the route using different algorithms
async function planRoute() {
    const start = document.getElementById('start').value;
    const dest = document.getElementById('dest').value;
    const search_strategy = document.getElementById('search-strategy').value;
    if (start === '' || dest === '') {
        alert("Please specify your start and destination.");
        return;
    }

    const mode = document.querySelector('input[name="mode"]:checked').value;
    const coordinates = await get_coordinates(start, dest, search_strategy, mode);

    if (coordinates === null) {
        alert("Failed to find a route");
        return;
    }
    plot_route(coordinates);
    fitBoundsToPoints(coordinates[0], coordinates[coordinates.length - 1]);
}

// Function to reset the panel
function resetRoute() {
    document.getElementById('start').value = '';
    document.getElementById('dest').value = '';
    clearMap();
}

/*** Route Block ***/


/*** Search Autocomplete Block ***/
const startInput = document.getElementById('start');
const startSuggestions = document.getElementById('start-suggestions');
const destInput = document.getElementById('dest');
const destSuggestions = document.getElementById('dest-suggestions');

startInput.addEventListener('input', (event) => {
    const searchTerm = event.target.value;
    searchGeoJSON(startInput, startSuggestions, searchTerm);
});
destInput.addEventListener('input', (event) => {
    const searchTerm = event.target.value;
    searchGeoJSON(destInput, destSuggestions, searchTerm);
});

function searchGeoJSON(input, suggestions, searchTerm) {
    if (searchTerm.length === 0) {
        suggestions.innerHTML = '';
        return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const matchedFeatures = geojson.features.filter((feature) => {
        const name = feature.properties.name ? feature.properties.name.toLowerCase() : '';
        const address = feature.properties.address ? feature.properties.address.toLowerCase() : '';
        return name.includes(searchTermLower) || address.includes(searchTermLower);
    });

    showSuggestions(input, suggestions, matchedFeatures);
}

function showSuggestions(input, suggestions, features) {
    suggestions.innerHTML = '';
    features.length > 0 ? suggestions.style.display = 'block' : suggestions.style.display = 'none';

    suggestions.removeAttribute('display');
    features.forEach((feature) => {
        const suggestionItem = document.createElement('div');
        suggestionItem.classList.add('suggestion-item');
        suggestionItem.textContent = `${feature.properties.name}`;
        suggestionItem.addEventListener('click', () => {
            onSuggestionSelected(input, suggestions, feature);
        });
        suggestions.appendChild(suggestionItem);
    });
}

function onSuggestionSelected(input, suggestion, feature) {
    suggestion.innerHTML = '';
    suggestion.style.display = 'none';

    const coordinates = feature.geometry.coordinates;
    // console.log("coordinates: ", coordinates);
    const lngLat = [coordinates[0][0][0], coordinates[0][0][1]];
    const nearestCoord = findNearestCoordinates(lngLat, geojson);
    fitBoundsToPoints(nearestCoord);

    markerHandler(nearestCoord, map, geojson);
    input.value = nearestCoord;
}

/*** Search Autocomplete Block ***/


/*** Popup Block ***/
const popup = document.getElementById('popup');

function showPopup() {
    popup.classList.remove('hidden');
}

function hidePopup() {
    popup.classList.add('hidden');
}

/*** Popup Block ***/

