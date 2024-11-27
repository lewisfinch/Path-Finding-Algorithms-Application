const express = require('express');
const path = require('path');

const app = express();
const PORT = 8888;

app.use(express.static(path.join(__dirname, 'static')));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/html/index.html'));
});

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/html/index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/html/about.html'));
});

app.get('/experiment', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/html/experiment.html'));
});

app.get('/instruction', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/html/instruction.html'));
});

app.get('/mapCampus', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/html/mapCampus.html'));
});

app.get('/map', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/html/mapCampus.html'));
});

app.get('/umn_complete_campus_osm.geojson', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/data/umn_complete_campus_osm.geojson'));
});

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'static/html/error.html'));
});

app.listen(PORT, () => console.log(`Server listening on port http://localhost:${PORT}`));
