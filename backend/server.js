const express = require('express');
const path = require('path');
const Event = require('./models');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "public" directory located one level up
app.use(express.static(path.join(__dirname, '..', 'public')));

// Middleware to parse JSON data
app.use(express.json());

// Route to add a new event
app.post('/events', async (req, res) => {
    const { startYear, startEra, endYear, endEra, region, description } = req.body;

    // Simple validation
    if (!startYear || !startEra || !endYear || !endEra || !region || !description) {
        return res.status(400).json({ error: 'Start year, start era, end year, end era, region, and description are required.' });
    }

    // Ensure year and era are valid
    const validEras = ["BCE", "CE"];
    if (isNaN(startYear) || isNaN(endYear) || !validEras.includes(startEra) || !validEras.includes(endEra)) {
        return res.status(400).json({ error: 'Years must be numbers, and eras must be either "BCE" or "CE".' });
    }

    try {
        const event = await Event.create({
            startYear,
            startEra,
            endYear,
            endEra,
            region,
            description
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Function to compare years with eras
function compareYears(year1, era1, year2, era2) {
    if (era1 === era2) {
        return year1 - year2;
    } else if (era1 === "BCE" && era2 === "CE") {
        return -1;
    } else {
        return 1;
    }
}

// Route to get all events with optional filtering
app.get('/events', async (req, res) => {
    const { startYear, startEra, endYear, endEra } = req.query;

    try {
        let events = await Event.findAll();

        // Filter events based on query parameters
        if (startYear && startEra && endYear && endEra) {
            events = events.filter(event =>
                compareYears(event.startYear, event.startEra, endYear, endEra) <= 0 &&
                compareYears(event.endYear, event.endEra, startYear, startEra) >= 0
            );
        } else if (startYear && startEra) {
            events = events.filter(event =>
                compareYears(event.startYear, event.startEra, startYear, startEra) <= 0 &&
                compareYears(event.endYear, event.endEra, startYear, startEra) >= 0
            );
        } else if (endYear && endEra) {
            events = events.filter(event =>
                compareYears(event.startYear, event.startEra, endYear, endEra) <= 0 &&
                compareYears(event.endYear, event.endEra, endYear, endEra) >= 0
            );
        }

        // Send the filtered or unfiltered events as the response
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
