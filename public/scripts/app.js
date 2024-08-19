document.addEventListener('DOMContentLoaded', () => {
    const eventForm = document.getElementById('event-form');
    if (eventForm) {
        eventForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const startYear = document.getElementById('startYear').value;
            const startEra = document.getElementById('startEra').value;
            const endYear = document.getElementById('endYear').value;
            const endEra = document.getElementById('endEra').value;
            const region = document.getElementById('region').value;
            const description = document.getElementById('description').value;

            const event = { startYear, startEra, endYear, endEra, region, description };

            await addEvent(event);
            loadEvents();

            eventForm.reset();
        });
    }

    generateYearColumn();
    loadEvents();
});

// Function to round the year to the nearest decade
function roundToNearestDecade(year) {
    return Math.round(year / 10) * 10;
}

async function loadEvents() {
    const response = await fetch('/events');
    const events = await response.json();

    // Clear only the event columns, not the year column
    document.querySelectorAll('.region-column').forEach(column => {
        column.innerHTML = '';  // Clear the region columns before reloading events
    });

    const regionRows = {}; // Initialize the regionRows object to keep track of event stacking

    events.forEach(event => {
        const columnSelector = getColumnSelector(event.region);
        if (columnSelector) {
            const regionColumn = document.querySelector(columnSelector);
            if (regionColumn) {
                // Round the years to the nearest decade
                const roundedStartYear = roundToNearestDecade(event.startYear);
                const roundedEndYear = roundToNearestDecade(event.endYear);

                // Construct the ID for the start and end year using the rounded values
                const startRowId = `year-${roundedStartYear}-${event.startEra}`;
                const endRowId = `year-${roundedEndYear}-${event.endEra}`;
                const startRow = document.getElementById(startRowId);
                const endRow = document.getElementById(endRowId);

                if (startRow && endRow) {
                    // Create subcolumns if necessary
                    const regionKey = `${event.region}-${roundedStartYear}-${roundedEndYear}`;
                    if (!regionRows[regionKey]) {
                        regionRows[regionKey] = []; // Initialize as an array
                    }

                    const subcolumnIndex = regionRows[regionKey].length;
                    const subcolumnWidth = 100 / (subcolumnIndex + 1); // Calculate the width for subcolumns// Adjust all existing subcolumns to ensure they fit
                    regionRows[regionKey].forEach((subcol, idx) => {
                        subcol.style.width = `${subcolumnWidth}%`;
                        subcol.style.left = `${idx * subcolumnWidth}%`;
                    });

                    // Calculate the new subcolumn's width and left position
                    const subcolumn = document.createElement('div');
                    subcolumn.style.width = `${subcolumnWidth - 2}%`;
                    subcolumn.style.position = 'absolute';

                    // Calculate left position normally for every subcolumn
                    subcolumn.style.left = `${subcolumnIndex * subcolumnWidth}%`;
                    subcolumn.style.top = `${startRow.offsetTop}px`;
                    subcolumn.style.height = `${endRow.offsetTop - startRow.offsetTop}px`;

                    // Calculate the duration of the event considering the era
                    let duration;
                    if (event.startEra === 'CE' && event.endEra === 'CE') {
                        duration = event.endYear - event.startYear; // Normal calculation for CE
                    } else if (event.startEra === 'BCE' && event.endEra === 'BCE') {
                        duration = event.startYear - event.endYear; // Reverse calculation for BCE
                    } else if (event.startEra === 'BCE' && event.endEra === 'CE') {
                        // If the event crosses from BCE to CE, calculate accordingly
                        duration = event.startYear + event.endYear; // Consider the crossing over 0
                    } else {
                        console.error('Unsupported era combination');
                        duration = 0; // Fallback in case of an unsupported era combination
                    }

                    // Create event element within the subcolumn
                    const eventElement = document.createElement('div');
                    eventElement.className = 'event-box';
                    eventElement.textContent = `${event.description} (${event.startYear}${event.startEra} - ${event.endYear}${event.endEra}, ${event.region})`;

                    // If the duration is under 15 years, add the hover effect class
                    if (duration < 50) {
                        eventElement.classList.add('event-box-hover');
                    }

                    eventElement.style.top = '0px';
                    eventElement.style.height = '100%';
                    eventElement.style.boxSizing = 'border-box';
                    eventElement.style.backgroundColor = 'rgba(0, 0, 255, 0.1)';
                    eventElement.style.border = '1px solid #000';

                    subcolumn.appendChild(eventElement);
                    regionColumn.appendChild(subcolumn);

                    // Store this subcolumn in the regionRows array
                    regionRows[regionKey].push(subcolumn);
                } else {
                    console.error(`Row not found for start or end year: ${event.startYear}${event.startEra} to ${event.endYear}${event.endEra}`);
                }
            } else {
                console.error(`Column not found for selector: ${columnSelector}`);
            }
        }
    });
}

// Function to generate the year column with IDs
function generateYearColumn() {
    const yearColumn = document.querySelector('.year-column');

    // Clear any existing years (if any) before generating new ones
    yearColumn.innerHTML = '';

    // Generate years from 3000 BCE to 10 BCE, descending in steps of 10
    for (let year = 3000; year > 0; year -= 10) {
        const yearDiv = document.createElement('div');
        yearDiv.textContent = `${year} BCE`;
        yearDiv.id = `year-${year}-BCE`; // Add a unique id for each year row
        console.log(`Generated row with ID: ${yearDiv.id}`);
        yearColumn.appendChild(yearDiv);
    }

    // Add the year 0 CE
    const zeroYearDiv = document.createElement('div');
    zeroYearDiv.textContent = `0 CE`;
    zeroYearDiv.id = `year-0-CE`; // Add a unique id for 0 CE
    console.log(`Generated row with ID: ${zeroYearDiv.id}`);
    yearColumn.appendChild(zeroYearDiv);

    // Generate years from 10 CE to 2024 CE, ascending in steps of 10
    for (let year = 10; year <= 2024; year += 10) {
        const yearDiv = document.createElement('div');
        yearDiv.textContent = `${year} CE`;
        yearDiv.id = `year-${year}-CE`; // Add a unique id for each year row
        console.log(`Generated row with ID: ${yearDiv.id}`);
        yearColumn.appendChild(yearDiv);
    }
}


function findYearRow(year, era) {
    const yearColumn = document.querySelector('.year-column');
    const yearText = `${year} ${era}`;
    return Array.from(yearColumn.children).find(row => row.textContent === yearText);
}


function getColumnSelector(region) {
    let selector;
    switch (region.toLowerCase()) {
        case 'europe':
            selector = '#europe-column';
            break;
        case 'africa & middle east':
            selector = '#africa-middle-east-column';
            break;
        case 'asia & pacific islands':
            selector = '#asia-pacific-islands-column';
            break;
        case 'americas':
            selector = '#americas-column';
            break;
        default:
            console.error(`Unknown region: ${region}`);
            return null;
    }
    console.log(`Using selector: ${selector} for region: ${region}`);
    return selector;
}




async function addEvent(event) {
    await fetch('/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
    });
}
