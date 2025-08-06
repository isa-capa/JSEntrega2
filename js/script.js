let flights = JSON.parse(localStorage.getItem('flights')) || [];
let quotes = JSON.parse(localStorage.getItem('quotes')) || [];
let passengerCount = 1;
let extraCount = 1;

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = section.id === sectionId ? 'block' : 'none';
    });
    if (sectionId === 'dashboard') updateDashboard();
    if (sectionId === 'editFlights') loadEditFlights();
}

function updateDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const todaysFlights = flights.filter(f => f.flightDate === today);
    const pendingConfirmations = flights.filter(f => f.confirmation === 'No');
    document.getElementById('todaysFlights').textContent = todaysFlights.length;
    document.getElementById('pendingConfirmations').textContent = pendingConfirmations.length;
    document.getElementById('totalFlights').textContent = flights.length;
    filterFlights();
    loadQuotes();
}

function filterFlights() {
    const filterType = document.getElementById('filterType').value;
    document.getElementById('filterDate').style.display = filterType === 'date' ? 'inline' : 'none';
    document.getElementById('filterAirport').style.display = filterType === 'airport' ? 'inline' : 'none';
    document.getElementById('filterConfirmation').style.display = filterType === 'confirmation' ? 'inline' : 'none';

    let filteredFlights = flights;
    if (filterType === 'date') {
        const filterDate = document.getElementById('filterDate').value;
        filteredFlights = flights.filter(f => f.flightDate === filterDate);
    } else if (filterType === 'airport') {
        const filterAirport = document.getElementById('filterAirport').value;
        filteredFlights = flights.filter(f => f.airport === filterAirport);
    } else if (filterType === 'confirmation') {
        const filterConfirmation = document.getElementById('filterConfirmation').value;
        filteredFlights = flights.filter(f => f.confirmation === filterConfirmation);
    }

    const flightTable = document.getElementById('flightTable');
    flightTable.innerHTML = filteredFlights.map(flight => `
        <tr>
            <td>${flight.passengerNames}</td>
            <td>${flight.agent}</td>
            <td>${flight.flightDate}</td>
            <td>${flight.airport}</td>
            <td>${flight.confirmation}</td>
            <td><button class="btn btn-sm btn-primary" onclick="editFlight('${flight.id}')">Edit</button></td>
        </tr>
    `).join('');
}

function loadQuotes() {
    const quoteTable = document.getElementById('quoteTable');
    quoteTable.innerHTML = quotes.map(quote => `
        <tr>
            <td>${quote.agent}</td>
            <td>${quote.serviceType}</td>
            <td>$${quote.total}</td>
            <td><button class="btn btn-sm btn-primary" onclick="editQuote('${quote.id}')">Edit</button></td>
        </tr>
    `).join('');
}

function loadEditFlights() {
    const editFlightTable = document.getElementById('editFlightTable');
    editFlightTable.innerHTML = flights.map(flight => `
        <tr>
            <td>${flight.passengerNames}</td>
            <td>${flight.agent}</td>
            <td>${flight.flightDate}</td>
            <td>${flight.airport}</td>
            <td>${flight.confirmation}</td>
            <td><button class="btn btn-sm btn-primary" onclick="editFlight('${flight.id}')">Edit</button></td>
        </tr>
    `).join('');
}

function editFlight(id) {
    const flight = flights.find(f => f.id === id);
    if (!flight) return;
    showSection('newFlight');
    document.getElementById('flightForm').dataset.editId = id;
    document.getElementById('passengerNames').value = flight.passengerNames;
    document.getElementById('agent').value = flight.agent;
    document.getElementById('ad').value = flight.ad;
    document.getElementById('flightDate').value = flight.flightDate;
    document.getElementById('flightTime').value = flight.flightTime;
    document.getElementById('airport').value = flight.airport;
    document.getElementById('sharedType').value = flight.sharedType;
    document.getElementById('plane').value = flight.plane;
    document.getElementById('flightNumberPVR').value = flight.flightNumberPVR;
    document.getElementById('flightTimePVR').value = flight.flightTimePVR;
    document.getElementById('flightOrigin').value = flight.flightOrigin;
    document.getElementById('pax').value = flight.pax;
    document.getElementById('seats').value = flight.seats;
    document.getElementById('loadFactor').value = flight.loadFactor;
    document.getElementById('passengers').value = flight.passengers;
    document.getElementById('quote').value = flight.quote;
    document.getElementById('tripSheet').value = flight.tripSheet;
    document.getElementById('key').value = flight.key;
    document.getElementById('notes').value = flight.notes;
    document.getElementById('roomRevenue').value = flight.roomRevenue; // Se ocultaron estos parametros ya que mas adelante serviran para crear analiticas para el hotel
    document.getElementById('additionalRevenue').value = flight.additionalRevenue;
    document.getElementById('mkt').value = flight.mkt;
    document.getElementById('chn').value = flight.chn;
    document.getElementById('airRevenue').value = flight.airRevenue;
    document.getElementById('marcoCost').value = flight.marcoCost;
    document.getElementById('prl').value = flight.prl;
    document.getElementById('invoice').value = flight.invoice;
    document.getElementById('extraService').value = flight.extraService;
    document.getElementById('extraRevenue').value = flight.extraRevenue;
    document.getElementById('confirmation').value = flight.confirmation;
}

function editQuote(id) {
    const quote = quotes.find(q => q.id === id);
    if (!quote) return;
    showSection('newQuote');
    document.getElementById('quoteForm').dataset.editId = id;
    document.getElementById('quoteAgent').value = quote.agent || '';
    document.getElementById('serviceType').value = quote.serviceType || 'Private Aviation';

    passengerCount = quote.passengers.length || 1;
    extraCount = quote.extras.length || 1;
    const passengerContainer = document.getElementById('passengerContainer');
    passengerContainer.innerHTML = '';
    for (let i = 0; i < passengerCount; i++) {
        const passenger = quote.passengers[i] || { name: '', seat: 1 };
        const index = i + 1;
        const div = document.createElement('div');
        div.className = 'passenger-entry';
        div.innerHTML = `
            <h5>Passenger ${index}</h5>
            <div class="row">
                <div class="col-md-6">
                    <label for="passengerName${index}">Passenger Name</label>
                    <input type="text" class="form-control" id="passengerName${index}" value="${passenger.name}" required>
                </div>
                <div class="col-md-6">
                    <label for="seat${index}">Seat</label>
                    <input type="number" class="form-control" id="seat${index}" value="${passenger.seat}" min="1" required>
                </div>
            </div>
            <div id="serviceFields${index}"></div>
        `;
        passengerContainer.appendChild(div);
    }

    const extrasContainer = document.getElementById('extrasContainer');
    extrasContainer.innerHTML = '';
    for (let i = 0; i < extraCount; i++) {
        const extra = quote.extras[i] || { type: '', price: '' };
        const index = i + 1;
        const div = document.createElement('div');
        div.className = 'row mt-2';
        div.innerHTML = `
            <div class="col-md-6">
                <label for="extraType${index}">Extra Type</label>
                <select class="form-select" id="extraType${index}" onchange="updateExtraPrice(${index})">
                    <option value="">Select Extra</option>
                    <option value="Veuve Clicquot" ${extra.type === 'Veuve Clicquot' ? 'selected' : ''}>Veuve Clicquot ($245)</option>
                    <option value="Dom Perignon" ${extra.type === 'Dom Perignon' ? 'selected' : ''}>Dom Perignon ($755)</option>
                    <option value="Ruinart Brut" ${extra.type === 'Ruinart Brut' ? 'selected' : ''}>Ruinart Brut ($295)</option>
                    <option value="Perier-Jouet" ${extra.type === 'Perier-Jouet' ? 'selected' : ''}>Perier-Jouet ($225)</option>
                    <option value="Extra Luggage" ${extra.type === 'Extra Luggage' ? 'selected' : ''}>Extra Luggage ($45)</option>
                    <option value="Excess Weight" ${extra.type === 'Excess Weight' ? 'selected' : ''}>Excess Weight ($500)</option>
                </select>
            </div>
            <div class="col-md-5">
                <label for="extraPrice${index}">Price</label>
                <input type="number" class="form-control" id="extraPrice${index}" value="${extra.price}" readonly>
            </div>
            <div class="col-md-1">
                <label>&nbsp;</label>
                <button type="button" class="btn btn-danger btn-sm mt-1" onclick="deleteExtra(${index})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        extrasContainer.appendChild(div);
    }

    updateServiceFields();
    document.getElementById('totalQuote').value = quote.total || '0.00';
}

document.getElementById('flightForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const flight = {
        id: this.dataset.editId || generateUUID(),
        passengerNames: document.getElementById('passengerNames').value,
        agent: document.getElementById('agent').value,
        ad: document.getElementById('ad').value,
        flightDate: document.getElementById('flightDate').value,
        flightTime: document.getElementById('flightTime').value,
        airport: document.getElementById('airport').value,
        sharedType: document.getElementById('sharedType').value,
        plane: document.getElementById('plane').value,
        flightNumberPVR: document.getElementById('flightNumberPVR').value,
        flightTimePVR: document.getElementById('flightTimePVR').value,
        flightOrigin: document.getElementById('flightOrigin').value,
        pax: document.getElementById('pax').value,
        seats: document.getElementById('seats').value,
        loadFactor: document.getElementById('loadFactor').value,
        passengers: document.getElementById('passengers').value,
        quote: document.getElementById('quote').value,
        tripSheet: document.getElementById('tripSheet').value,
        key: document.getElementById('key').value,
        notes: document.getElementById('notes').value,
        confirmation: document.getElementById('confirmation').value,
        guestNames: document.getElementById('guestNames').value
    };
    if (this.dataset.editId) {
        const index = flights.findIndex(f => f.id === this.dataset.editId);
        if (index !== -1) flights[index] = flight;
    } else {
        flights.push(flight);
    }
    localStorage.setItem('flights', JSON.stringify(flights));
    this.reset();
    delete this.dataset.editId;
    showSection('dashboard');
});

function addPassenger() {
    passengerCount++;
    const container = document.getElementById('passengerContainer');
    const div = document.createElement('div');
    div.className = 'passenger-entry';
    div.innerHTML = `
        <h5>Passenger ${passengerCount}</h5>
        <div class="row">
            <div class="col-md-6">
                <label for="passengerName${passengerCount}">Passenger Name</label>
                <input type="text" class="form-control" id="passengerName${passengerCount}" required>
            </div>
            <div class="col-md-6">
                <label for="seat${passengerCount}">Seat</label>
                <input type="number" class="form-control" id="seat${passengerCount}" min="1" required>
            </div>
        </div>
        <div id="serviceFields${passengerCount}"></div>
    `;
    container.appendChild(div);
    updateServiceFields();
}

function updateServiceFields() {
    const serviceType = document.getElementById('serviceType').value;
    for (let i = 1; i <= passengerCount; i++) {
        const fields = document.getElementById(`serviceFields${i}`);
        if (!fields) continue;
        if (serviceType === 'Private Aviation') {
            fields.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <label for="planeType${i}">Plane Type</label>
                        <select class="form-select" id="planeType${i}" onchange="updatePrice(${i})">
                            <option value="Saratoga">Saratoga ($1990)</option>
                            <option value="Pilatus">Pilatus ($5500)</option>
                            <option value="Piper">Piper ($2950)</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label for="price${i}">Price</label>
                        <input type="number" class="form-control" id="price${i}" readonly>
                    </div>
                </div>
            `;
            updatePrice(i);
        } else if (serviceType === 'Share Air Shuttle') {
            fields.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <label>Schedule</label>
                        <p>Arrival: Wednesday, 3PM, PVR to CHM<br>Departure: Sunday, 11AM, CHM to PVR</p>
                    </div>
                    <div class="col-md-6">
                        <label for="price${i}">Price</label>
                        <input type="number" class="form-control" id="price${i}" value="450" readonly>
                    </div>
                </div>
            `;
        } else if (serviceType === 'Suit') {
            fields.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <label>Schedule</label>
                        <p>Arrival: Any day, any time<br>Departure: Any day, any time</p>
                    </div>
                    <div class="col-md-6">
                        <label for="price${i}">Price</label>
                        <input type="number" class="form-control" id="price${i}" value="0" readonly>
                    </div>
                </div>
            `;
        }
    }
    calculateTotalQuote();
}

function updatePrice(index) {
    const planeType = document.getElementById(`planeType${index}`).value;
    const price = document.getElementById(`price${index}`);
    if (planeType === 'Saratoga') price.value = 1990;
    else if (planeType === 'Pilatus') price.value = 5500;
    else if (planeType === 'Piper') price.value = 2950;
    calculateTotalQuote();
}

function addExtra() {
    extraCount++;
    const container = document.getElementById('extrasContainer');
    const div = document.createElement('div');
    div.className = 'row mt-2';
    div.innerHTML = `
        <div class="col-md-6">
            <label for="extraType${extraCount}">Extra Type</label>
            <select class="form-select" id="extraType${extraCount}" onchange="updateExtraPrice(${extraCount})">
                <option value="">Select Extra</option>
                <option value="Veuve Clicquot">Veuve Clicquot ($245)</option>
                <option value="Dom Perignon">Dom Perignon ($755)</option>
                <option value="Ruinart Brut">Ruinart Brut ($295)</option>
                <option value="Perier-Jouet">Perier-Jouet ($225)</option>
                <option value="Extra Luggage">Extra Luggage ($45)</option>
                <option value="Excess Weight">Excess Weight ($500)</option>
            </select>
        </div>
        <div class="col-md-6">
            <label for="extraPrice${extraCount}">Price</label>
            <input type="number" class="form-control" id="extraPrice${extraCount}" readonly>
        </div>
    `;
    container.appendChild(div);
    calculateTotalQuote();
}

function updateExtraPrice(index) {
    const extraType = document.getElementById(`extraType${index}`).value;
    const price = document.getElementById(`extraPrice${index}`);
    if (extraType === 'Veuve Clicquot') price.value = 245;
    else if (extraType === 'Dom Perignon') price.value = 755;
    else if (extraType === 'Ruinart Brut') price.value = 295;
    else if (extraType === 'Perier-Jouet') price.value = 225;
    else if (extraType === 'Extra Luggage') price.value = 45;
    else if (extraType === 'Excess Weight') price.value = 500;
    else price.value = '';
    calculateTotalQuote();
}

function deleteExtra(index) {
    const container = document.getElementById('extrasContainer');
    const rows = container.getElementsByClassName('row');
    if (rows.length >= index) {
        container.removeChild(rows[index - 1]);
        extraCount--;

        for (let i = index; i <= extraCount + 1; i++) {
            const newIndex = i;
            const oldIndex = i + 1;
            const oldType = document.getElementById(`extraType${oldIndex}`);
            const oldPrice = document.getElementById(`extraPrice${oldIndex}`);
            const oldBtn = document.querySelector(`#extrasContainer button[onclick="deleteExtra(${oldIndex})"]`);
            if (oldType && oldPrice && oldBtn) {
                oldType.id = `extraType${newIndex}`;
                oldType.setAttribute('onchange', `updateExtraPrice(${newIndex})`);
                oldPrice.id = `extraPrice${newIndex}`;
                oldBtn.setAttribute('onclick', `deleteExtra(${newIndex})`);
            }
        }
        calculateTotalQuote();
    }
}

function calculateTotalQuote() {
    let total = 0;
    for (let i = 1; i <= passengerCount; i++) {
        const price = document.getElementById(`price${i}`);
        if (price && price.value) total += parseFloat(price.value);
    }
    for (let i = 1; i <= extraCount; i++) {
        const extraPrice = document.getElementById(`extraPrice${i}`);
        if (extraPrice && extraPrice.value) total += parseFloat(extraPrice.value);
    }
    document.getElementById('totalQuote').value = total.toFixed(2);
}

document.getElementById('quoteForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const passengers = [];
    for (let i = 1; i <= passengerCount; i++) {
        const name = document.getElementById(`passengerName${i}`).value;
        const seat = document.getElementById(`seat${i}`).value;
        const price = document.getElementById(`price${i}`)?.value || 0;
        const planeType = document.getElementById(`planeType${i}`)?.value || '';
        passengers.push({ name, seat, planeType, price });
    }
    const extras = [];
    for (let i = 1; i <= extraCount; i++) {
        const type = document.getElementById(`extraType${i}`).value;
        const price = document.getElementById(`extraPrice${i}`).value;
        if (type && price) extras.push({ type, price });
    }
    const quote = {
        id: this.dataset.editId || generateUUID(),
        agent: document.getElementById('quoteAgent').value,
        serviceType: document.getElementById('serviceType').value,
        passengers,
        extras,
        total: document.getElementById('totalQuote').value
    };
    if (this.dataset.editId) {
        const index = quotes.findIndex(q => q.id === this.dataset.editId);
        quotes[index] = quote;
    } else {
        quotes.push(quote);
    }
    localStorage.setItem('quotes', JSON.stringify(quotes));
    this.reset();
    passengerCount = 1;
    extraCount = 1;
    document.getElementById('passengerContainer').innerHTML = `
        <div class="passenger-entry">
            <h5>Passenger 1</h5>
            <div class="row">
                <div class="col-md-6">
                    <label for="passengerName1">Passenger Name</label>
                    <input type="text" class="form-control" id="passengerName1" required>
                </div>
                <div class="col-md-6">
                    <label for="seat1">Seat</label>
                    <input type="number" class="form-control" id="seat1" min="1" required>
                </div>
            </div>
            <div id="serviceFields1"></div>
        </div>
    `;
    document.getElementById('extrasContainer').innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <label for="extraType1">Extra Type</label>
                <select class="form-select" id="extraType1" onchange="updateExtraPrice(1)">
                    <option value="">Select Extra</option>
                    <option value="Veuve Clicquot">Veuve Clicquot ($245)</option>
                    <option value="Dom Perignon">Dom Perignon ($755)</option>
                    <option value="Ruinart Brut">Ruinart Brut ($295)</option>
                    <option value="Perier-Jouet">Perier-Jouet ($225)</option>
                    <option value="Extra Luggage">Extra Luggage ($45)</option>
                    <option value="Excess Weight">Excess Weight ($500)</option>
                </select>
            </div>
            <div class="col-md-6">
                <label for="extraPrice1">Price</label>
                <input type="number" class="form-control" id="extraPrice1" readonly>
            </div>
        </div>
    `;
    delete this.dataset.editId;
    showSection('dashboard');
});

function downloadQuotePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Flight Quote', 10, 10);
    doc.setFontSize(12);
    let y = 20;
    doc.text(`Agent: ${document.getElementById('quoteAgent').value}`, 10, y);
    y += 10;
    doc.text(`Service Type: ${document.getElementById('serviceType').value}`, 10, y);
    y += 10;
    doc.text('Passengers:', 10, y);
    y += 10;
    for (let i = 1; i <= passengerCount; i++) {
        const name = document.getElementById(`passengerName${i}`).value;
        const seat = document.getElementById(`seat${i}`).value;
        const price = document.getElementById(`price${i}`)?.value || 0;
        const planeType = document.getElementById(`planeType${i}`)?.value || '';
        doc.text(`Passenger ${i}: ${name}, Seat: ${seat}, Plane: ${planeType}, Price: $${price}`, 10, y);
        y += 10;
    }
    doc.text('Extras:', 10, y);
    y += 10;
    for (let i = 1; i <= extraCount; i++) {
        const type = document.getElementById(`extraType${i}`).value;
        const price = document.getElementById(`extraPrice${i}`).value;
        if (type && price) {
            doc.text(`${type}: $${price}`, 10, y);
            y += 10;
        }
    }
    doc.text(`Total: $${document.getElementById('totalQuote').value}`, 10, y);
    doc.save('quote.pdf');
}

function downloadFlightPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Flight Details', 10, 10);
    doc.setFontSize(12);
    let y = 20;
    doc.text(`Passenger Names: ${document.getElementById('passengerNames').value}`, 10, y);
    y += 10;
    doc.text(`Agent: ${document.getElementById('agent').value}`, 10, y);
    y += 10;
    doc.text(`A/D: ${document.getElementById('ad').value}`, 10, y);
    y += 10;
    doc.text(`Flight Date: ${document.getElementById('flightDate').value}`, 10, y);
    y += 10;
    doc.text(`Flight Time: ${document.getElementById('flightTime').value}`, 10, y);
    y += 10;
    doc.text(`Airport: ${document.getElementById('airport').value}`, 10, y);
    y += 10;
    doc.text(`Shared Type: ${document.getElementById('sharedType').value}`, 10, y);
    y += 10;
    doc.text(`Plane: ${document.getElementById('plane').value}`, 10, y);
    y += 10;
    doc.text(`Flight Number PVR: ${document.getElementById('flightNumberPVR').value}`, 10, y);
    y += 10;
    doc.text(`Flight Time PVR: ${document.getElementById('flightTimePVR').value}`, 10, y);
    y += 10;
    doc.text(`Flight Origin: ${document.getElementById('flightOrigin').value}`, 10, y);
    y += 10;
    doc.text(`Pax: ${document.getElementById('pax').value}`, 10, y);
    y += 10;
    doc.text(`Seats: ${document.getElementById('seats').value}`, 10, y);
    y += 10;
    doc.text(`Load Factor: ${document.getElementById('loadFactor').value}%`, 10, y);
    y += 10;
    doc.text(`Passengers: ${document.getElementById('passengers').value}`, 10, y);
    y += 10;
    doc.text(`Quote: $${document.getElementById('quote').value}`, 10, y);
    y += 10;
    doc.text(`Trip Sheet: ${document.getElementById('tripSheet').value}`, 10, y);
    y += 10;
    doc.text(`Key: ${document.getElementById('key').value}`, 10, y);
    y += 10;
    doc.text(`Notes: ${document.getElementById('notes').value}`, 10, y);
    y += 10;
    doc.text(`Room Revenue: $${document.getElementById('roomRevenue').value}`, 10, y);
    y += 10;
    doc.text(`Additional Revenue: $${document.getElementById('additionalRevenue').value}`, 10, y);
    y += 10;
    doc.text(`MKT: ${document.getElementById('mkt').value}`, 10, y);
    y += 10;
    doc.text(`CHN: ${document.getElementById('chn').value}`, 10, y);
    y += 10;
    doc.text(`Air Revenue: $${document.getElementById('airRevenue').value}`, 10, y);
    y += 10;
    doc.text(`Marco Cost: $${document.getElementById('marcoCost').value}`, 10, y);
    y += 10;
    doc.text(`PRL: $${document.getElementById('prl').value}`, 10, y);
    y += 10;
    doc.text(`Invoice: ${document.getElementById('invoice').value}`, 10, y);
    y += 10;
    doc.text(`Extra Service: ${document.getElementById('extraService').value}`, 10, y);
    y += 10;
    doc.text(`Extra Revenue: $${document.getElementById('extraRevenue').value}`, 10, y);
    y += 10;
    doc.text(`Confirmation: ${document.getElementById('confirmation').value}`, 10, y);
    y += 10;
    doc.text(`Guests: ${document.getElementById('guestNames').value}`, 10, y);
    doc.save('flight.pdf');
}

function addExtra() {
    extraCount++;
    const container = document.getElementById('extrasContainer');
    const div = document.createElement('div');
    div.className = 'row mt-2';
    div.innerHTML = `
        <div class="col-md-6">
            <label for="extraType${extraCount}">Extra Type</label>
            <select class="form-select" id="extraType${extraCount}" onchange="updateExtraPrice(${extraCount})">
                <option value="">Select Extra</option>
                <option value="Veuve Clicquot">Veuve Clicquot ($245)</option>
                <option value="Dom Perignon">Dom Perignon ($755)</option>
                <option value="Ruinart Brut">Ruinart Brut ($295)</option>
                <option value="Perier-Jouet">Perier-Jouet ($225)</option>
                <option value="Extra Luggage">Extra Luggage ($45)</option>
                <option value="Excess Weight">Excess Weight ($500)</option>
            </select>
        </div>
        <div class="col-md-5">
            <label for="extraPrice${extraCount}">Price</label>
            <input type="number" class="form-control" id="extraPrice${extraCount}" readonly>
        </div>
        <div class="col-md-1">
            <label>&nbsp;</label>
            <button type="button" class="btn btn-danger btn-sm mt-1" onclick="deleteExtra(${extraCount})"><i class="fas fa-trash"></i></button>
        </div>
    `;
    container.appendChild(div);
    calculateTotalQuote();
}

showSection('dashboard');