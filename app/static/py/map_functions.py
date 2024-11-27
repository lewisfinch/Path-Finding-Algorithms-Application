import geopandas as gpd
import matplotlib.pyplot as plt
import os


# Functions to help plot the campus map
# def plot_campus_map(buildings, footpaths, barriers):
def plot_campus_map(geojsonData):
    # Adjust figure size to enlarge the map
    figure, axes = plt.subplots(figsize=(20, 20))

    # Plot buildings
    # buildings.plot(ax=axes, facecolor='gray', edgecolor='black', linewidth=0.5)

    # Plot footpaths
    # footpaths.plot(ax=axes, color='blue', linewidth=0.8)  # Increase line width to make footpaths more visible

    # Plot barriers
    # barriers.plot(ax=axes, color='red', linewidth=1)
    geojsonData.plot(ax=axes, color='maroon', linewidth=1)

    # Set aspect ratio
    axes.set_aspect('equal', 'box')

    return axes


# Function to plot the route
def plot_route(ax_route, route):
    # Plot the route with a thicker line and higher z-order
    route.plot(ax=ax_route, color='green', linewidth=4, zorder=10)


# Function to save the map
def save_map_to_file(ax, filename="map.png"):
    filepath = os.path.join('static', 'images', filename)
    ax.figure.savefig(filepath, dpi=300)
    plt.close(ax.figure)


# Locate the data files
# umn_buildings = gpd.read_file('static/data/umn_buildings.geojson')
# umn_walks = gpd.read_file('static/data/umn_walks.geojson')
# umn_barriers = gpd.read_file('static/data/umn_barriers.geojson')
umn_complete_campus_osm = gpd.read_file('static/data/umn_complete_campus_osm.geojson')

# Filter to keep the Minneapolis campus only
minx, miny, maxx, maxy = -93.265852, 44.960696, -93.204698, 44.983892
umn_complete_campus_osm = umn_complete_campus_osm.cx[minx:maxx, miny:maxy]
# umn_buildings = umn_buildings.cx[minx:maxx, miny:maxy]
# umn_walks = umn_walks.cx[minx:maxx, miny:maxy]
# umn_barriers = umn_barriers.cx[minx:maxx, miny:maxy]

# Plot the campus map and the route
# ax = plot_campus_map(umn_buildings, umn_walks, umn_barriers)
ax = plot_campus_map(umn_complete_campus_osm)

# Plot the route
# plot_route(ax, route)

# Show the plot
# plt.show()

# Save the map as an image file
save_map_to_file(ax, 'complete_campus_map.png')
