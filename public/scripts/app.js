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
            loadEvents();  // Reload the events after adding a new one

            eventForm.reset();
        });
    }

    generateYearColumn();  // Generate the year column only once when the page loads
    loadEvents();          // Load events once when the page loads
});


function generateYearColumn() {
    const yearColumn = document.querySelector('.year-column');

    // Clear any existing years (if any) before generating new ones
    yearColumn.innerHTML = '';

    // Generate years from 3000 BCE to 10 BCE, descending in steps of 10
    for (let year = 3000; year > 0; year -= 10) {
        const yearDiv = document.createElement('div');
        yearDiv.textContent = `${year} BCE`;
        yearColumn.appendChild(yearDiv);
    }

    // Add the year 0 CE
    const zeroYearDiv = document.createElement('div');
    zeroYearDiv.textContent = `0 CE`;
    yearColumn.appendChild(zeroYearDiv);

    // Generate years from 10 CE to 2024 CE, ascending in steps of 10
    for (let year = 10; year <= 2024; year += 10) {
        const yearDiv = document.createElement('div');
        yearDiv.textContent = `${year} CE`;
        yearColumn.appendChild(yearDiv);
    }
}

async function loadEvents() {
    const response = await fetch('/events');
    const events = await response.json();

    // Clear only the event columns, not the year column
    document.querySelectorAll('.region-column').forEach(column => {
        column.innerHTML = '';  // Clear the region columns before reloading events
    });

    events.forEach(event => {
        const columnSelector = getColumnSelector(event.region);
        if (columnSelector) {
            const regionColumn = document.querySelector(columnSelector);
            if (regionColumn) {
                const eventElement = document.createElement('div');
                eventElement.className = 'grid-cell';
                eventElement.textContent = `${event.description} (${event.startYear} ${event.startEra} - ${event.endYear} ${event.endEra}, ${event.region})`;
                regionColumn.appendChild(eventElement);
            } else {
                console.error(`Column not found for selector: ${columnSelector}`);
            }
        }
    });
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
        case 'asia':
            selector = '#asia-column';
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
