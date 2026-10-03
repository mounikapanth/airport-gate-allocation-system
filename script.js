/* =========================================================
   AIRPORTFLOW
   Airport Gate Allocation System
   JavaScript + DAA Algorithm
   ========================================================= */


/* =========================================================
   GLOBAL DATA
   ========================================================= */

let flights = [];

let allocationResults = [];

let charts = {};


/* =========================================================
   MIN HEAP IMPLEMENTATION
   ========================================================= */

class MinHeap {

    constructor(compareFunction) {
        this.heap = [];
        this.compare = compareFunction;
    }


    size() {
        return this.heap.length;
    }


    peek() {
        return this.heap[0];
    }


    push(value) {

        this.heap.push(value);

        this.bubbleUp(
            this.heap.length - 1
        );
    }


    pop() {

        if (this.heap.length === 0) {
            return undefined;
        }

        if (this.heap.length === 1) {
            return this.heap.pop();
        }

        const root = this.heap[0];

        this.heap[0] =
            this.heap.pop();

        this.bubbleDown(0);

        return root;
    }


    bubbleUp(index) {

        while (index > 0) {

            const parent =
                Math.floor((index - 1) / 2);

            if (
                this.compare(
                    this.heap[index],
                    this.heap[parent]
                ) >= 0
            ) {
                break;
            }

            [
                this.heap[index],
                this.heap[parent]
            ] = [
                this.heap[parent],
                this.heap[index]
            ];

            index = parent;
        }
    }


    bubbleDown(index) {

        const length =
            this.heap.length;

        while (true) {

            let smallest = index;

            const left =
                2 * index + 1;

            const right =
                2 * index + 2;


            if (
                left < length &&
                this.compare(
                    this.heap[left],
                    this.heap[smallest]
                ) < 0
            ) {
                smallest = left;
            }


            if (
                right < length &&
                this.compare(
                    this.heap[right],
                    this.heap[smallest]
                ) < 0
            ) {
                smallest = right;
            }


            if (smallest === index) {
                break;
            }


            [
                this.heap[index],
                this.heap[smallest]
            ] = [
                this.heap[smallest],
                this.heap[index]
            ];


            index = smallest;
        }
    }
}


/* =========================================================
   TIME FUNCTIONS
   ========================================================= */

function timeToMinutes(time) {

    if (!time) {
        return 0;
    }

    const parts =
        time.split(":");

    const hours =
        parseInt(parts[0]);

    const minutes =
        parseInt(parts[1]);

    return hours * 60 + minutes;
}


function minutesToTime(totalMinutes) {

    totalMinutes =
        totalMinutes % 1440;

    if (totalMinutes < 0) {
        totalMinutes += 1440;
    }

    const hours =
        Math.floor(totalMinutes / 60);

    const minutes =
        totalMinutes % 60;

    return (
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0")
    );
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function scrollToSection(id) {

    const element =
        document.getElementById(id);

    if (element) {

        element.scrollIntoView({
            behavior: "smooth"
        });

    }
}


/* =========================================================
   ADD FLIGHT
   ========================================================= */

function addFlight(event) {

    event.preventDefault();


    const flightId =
        document
            .getElementById("flightId")
            .value
            .trim()
            .toUpperCase();


    const airline =
        document
            .getElementById("airline")
            .value
            .trim();


    const flightType =
        document
            .getElementById("flightType")
            .value;


    const origin =
        document
            .getElementById("origin")
            .value
            .trim();


    const destination =
        document
            .getElementById("destination")
            .value
            .trim();


    const arrival =
        document
            .getElementById("arrival")
            .value;


    const departure =
        document
            .getElementById("departure")
            .value;


    const passengers =
        parseInt(
            document
                .getElementById("passengers")
                .value
        );


    const seats =
        parseInt(
            document
                .getElementById("seats")
                .value
        );


    /* Validation */

    if (
        !flightId ||
        !airline ||
        !origin ||
        !destination ||
        !arrival ||
        !departure
    ) {

        alert(
            "Please fill all required fields."
        );

        return;
    }


    if (
        flights.some(
            flight =>
                flight.flightId === flightId
        )
    ) {

        alert(
            "Flight ID already exists. Please use a unique ID such as F1, F2, F3..."
        );

        return;
    }


    if (
        passengers <= 0 ||
        seats <= 0
    ) {

        alert(
            "Passengers and seats must be greater than zero."
        );

        return;
    }


    if (passengers > seats) {

        alert(
            "Passengers cannot exceed total seats."
        );

        return;
    }


    if (
        timeToMinutes(departure) <=
        timeToMinutes(arrival)
    ) {

        alert(
            "Departure time must be later than arrival time."
        );

        return;
    }


    /* Create flight */

    flights.push({

        flightId,
        airline,
        flightType,
        origin,
        destination,
        arrival,
        departure,
        passengers,
        seats

    });


    document
        .getElementById("flightForm")
        .reset();


    displayFlights();

    updateDashboard();

    resetResults();


    alert(
        `${flightId} added successfully.`
    );
}


/* =========================================================
   DISPLAY FLIGHTS
   ========================================================= */

function displayFlights() {

    const tbody =
        document.getElementById(
            "flightTableBody"
        );


    const empty =
        document.getElementById(
            "emptyFlights"
        );


    const searchInput =
        document.getElementById(
            "searchFlight"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    tbody.innerHTML = "";


    const filteredFlights =
        flights.filter(flight => {

            const text = (

                flight.flightId +
                " " +
                flight.airline +
                " " +
                flight.origin +
                " " +
                flight.destination

            ).toLowerCase();


            return text.includes(search);

        });


    if (filteredFlights.length === 0) {

        empty.style.display =
            "block";

        return;

    }


    empty.style.display =
        "none";


    filteredFlights.forEach(
        flight => {

            const originalIndex =
                flights.indexOf(flight);


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    <strong>${escapeHTML(flight.flightId)}</strong>
                </td>

                <td>
                    ${escapeHTML(flight.airline)}
                </td>

                <td>
                    ${escapeHTML(flight.flightType)}
                </td>

                <td>
                    ${escapeHTML(flight.origin)}
                    →
                    ${escapeHTML(flight.destination)}
                </td>

                <td>
                    ${flight.arrival}
                </td>

                <td>
                    ${flight.departure}
                </td>

                <td>
                    ${flight.passengers}
                </td>

                <td>
                    ${flight.seats}
                </td>

                <td>

                    <button
                        class="delete-btn"
                        onclick="deleteFlight(${originalIndex})"
                    >
                        Delete
                    </button>

                </td>
            `;


            tbody.appendChild(row);

        }
    );
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   DELETE FLIGHT
   ========================================================= */

function deleteFlight(index) {

    if (
        index < 0 ||
        index >= flights.length
    ) {
        return;
    }


    const flight =
        flights[index];


    const confirmed =
        confirm(
            `Delete flight ${flight.flightId}?`
        );


    if (!confirmed) {
        return;
    }


    flights.splice(index, 1);


    displayFlights();

    updateDashboard();

    resetResults();
}


/* =========================================================
   UPDATE DASHBOARD
   ========================================================= */

function updateDashboard() {

    const gateCount =
        parseInt(
            document
                .getElementById("gateCount")
                .value
        ) || 0;


    const totalPassengers =
        flights.reduce(
            (sum, flight) =>
                sum + flight.passengers,
            0
        );


    document
        .getElementById("totalGates")
        .textContent =
            gateCount;


    document
        .getElementById("totalFlights")
        .textContent =
            flights.length;


    document
        .getElementById("totalPassengers")
        .textContent =
            totalPassengers.toLocaleString();


    if (
        allocationResults.length > 0
    ) {

        const allocated =
            allocationResults.filter(
                result =>
                    result.status ===
                    "Allocated"
            ).length;


        const conflicts =
            allocationResults.filter(
                result =>
                    result.status ===
                    "Conflict"
            ).length;


        document
            .getElementById("allocatedFlights")
            .textContent =
                allocated;


        document
            .getElementById("gateConflicts")
            .textContent =
                conflicts;


        const utilization =
            calculateGateUtilization(
                allocationResults,
                gateCount
            );


        document
            .getElementById("gateUtilization")
            .textContent =
                utilization + "%";

    } else {

        document
            .getElementById("allocatedFlights")
            .textContent =
                "0";


        document
            .getElementById("gateConflicts")
            .textContent =
                "0";


        document
            .getElementById("gateUtilization")
            .textContent =
                "0%";
    }
}


/* =========================================================
   UPDATE GATE COUNT
   ========================================================= */

function updateGateCount() {

    let count =
        parseInt(
            document
                .getElementById("gateCount")
                .value
        );


    if (!count || count < 1) {

        count = 1;

        document
            .getElementById("gateCount")
            .value = 1;
    }


    if (count > 50) {

        count = 50;

        document
            .getElementById("gateCount")
            .value = 50;
    }


    updateDashboard();

    resetResults();
}


/* =========================================================
   CORE GATE ALLOCATION ALGORITHM
   ========================================================= */

function allocateGates() {

    if (flights.length === 0) {

        alert(
            "Please add flights before running the algorithm."
        );

        return;
    }


    const gateCount =
        parseInt(
            document
                .getElementById("gateCount")
                .value
        );


    if (
        !gateCount ||
        gateCount < 1
    ) {

        alert(
            "Please enter a valid number of gates."
        );

        return;
    }


    /*
        STEP 1:
        Sort flights by arrival time.
    */

    const sortedFlights =
        [...flights].sort(
            (a, b) =>
                timeToMinutes(a.arrival) -
                timeToMinutes(b.arrival)
        );


    /*
        STEP 2:
        Available Gates Min Heap.

        Stores free gates.
        Smallest gate number comes first.
    */

    const availableGates =
        new MinHeap(
            (a, b) => a - b
        );


    /*
        STEP 3:
        Busy Gates Min Heap.

        Each item:

        [
            departureTime,
            gateNumber,
            flightId
        ]

        Sorted primarily by departure.
    */

    const busyGates =
        new MinHeap(
            (a, b) => {

                if (a[0] !== b[0]) {
                    return a[0] - b[0];
                }

                return a[1] - b[1];

            }
        );


    /*
        Add all gates to
        Available Gates Heap.
    */

    for (
        let gate = 1;
        gate <= gateCount;
        gate++
    ) {

        availableGates.push(
            gate
        );

    }


    const results = [];

    const trace = [];


    /*
        STEP 4:
        Process flights chronologically.
    */

    sortedFlights.forEach(
        (flight, index) => {

            const arrival =
                timeToMinutes(
                    flight.arrival
                );


            const departure =
                timeToMinutes(
                    flight.departure
                );


            /*
                STEP 5:
                Release all gates whose
                flights have already departed.
            */

            let releasedGates = [];


            while (
                busyGates.size() > 0 &&
                busyGates.peek()[0] <= arrival
            ) {

                const released =
                    busyGates.pop();


                const departureTime =
                    released[0];


                const gateNumber =
                    released[1];


                const previousFlight =
                    released[2];


                availableGates.push(
                    gateNumber
                );


                releasedGates.push(
                    gateNumber
                );


                trace.push({

                    type: "release",

                    text:
                        `At ${flight.arrival}, Gate G${gateNumber} is released because ${previousFlight} departed at ${minutesToTime(departureTime)}.`

                });

            }


            /*
                STEP 6:
                Assign available gate.
            */

            if (
                availableGates.size() > 0
            ) {

                const gate =
                    availableGates.pop();


                busyGates.push([

                    departure,
                    gate,
                    flight.flightId

                ]);


                results.push({

                    ...flight,

                    gate:
                        `G${gate}`,

                    gateNumber:
                        gate,

                    status:
                        "Allocated"

                });


                trace.push({

                    type: "allocate",

                    text:
                        `${flight.flightId} arrives at ${flight.arrival}. Gate G${gate} is assigned. It remains busy until ${flight.departure}.`

                });

            }


            /*
                STEP 7:
                If no gate exists,
                mark conflict.
            */

            else {

                results.push({

                    ...flight,

                    gate:
                        "-",

                    gateNumber:
                        null,

                    status:
                        "Conflict"

                });


                trace.push({

                    type: "conflict",

                    text:
                        `${flight.flightId} arrives at ${flight.arrival}, but all ${gateCount} gates are occupied. Gate conflict detected.`

                });

            }

        }
    );


    allocationResults =
        results;


    displayResults(
        results
    );


    displayConflicts(
        results
    );


    displayTrace(
        trace
    );


    displayAdvancedTimeline(
        results
    );


    generateAnalysis(
        results
    );


    updateDashboard();


    /*
        Automatically move
        user to result section.
    */

    setTimeout(
        () => {

            document
                .getElementById(
                    "allocation"
                )
                .scrollIntoView({
                    behavior: "smooth"
                });

        },
        100
    );
}


/* =========================================================
   DISPLAY ALLOCATION RESULTS
   ========================================================= */

function displayResults(results) {

    const tbody =
        document.getElementById(
            "resultTableBody"
        );


    const empty =
        document.getElementById(
            "emptyResults"
        );


    tbody.innerHTML = "";


    if (
        !results ||
        results.length === 0
    ) {

        empty.style.display =
            "block";

        return;
    }


    empty.style.display =
        "none";


    results.forEach(
        result => {

            const row =
                document.createElement("tr");


            const statusClass =
                result.status ===
                "Allocated"
                    ? "allocated"
                    : "conflict";


            row.innerHTML = `

                <td>
                    <strong>
                        ${escapeHTML(result.flightId)}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(result.airline)}
                </td>

                <td>
                    ${result.arrival}
                </td>

                <td>
                    ${result.departure}
                </td>

                <td>
                    ${result.passengers}
                </td>

                <td>
                    ${
                        result.gate === "-"
                            ? "-"
                            : `<strong>${result.gate}</strong>`
                    }
                </td>

                <td>
                    <span class="status ${statusClass}">
                        ${result.status}
                    </span>
                </td>

            `;


            tbody.appendChild(row);

        }
    );
}


/* =========================================================
   DISPLAY CONFLICTS
   ========================================================= */

function displayConflicts(results) {

    const panel =
        document.getElementById(
            "conflictList"
        );


    const count =
        document.getElementById(
            "conflictCount"
        );


    const conflicts =
        results.filter(
            result =>
                result.status ===
                "Conflict"
        );


    count.textContent =
        conflicts.length;


    if (
        conflicts.length === 0
    ) {

        panel.innerHTML =
            `<div class="conflict-item" style="border-left-color: #31e59b;">
                ✓ No gate conflicts detected. All flights were allocated.
            </div>`;

        return;
    }


    panel.innerHTML =
        conflicts.map(
            flight => `

                <div class="conflict-item">

                    <strong>
                        ${escapeHTML(flight.flightId)}
                    </strong>

                    — ${escapeHTML(flight.airline)}

                    arrives at
                    <strong>
                        ${flight.arrival}
                    </strong>

                    and departs at
                    <strong>
                        ${flight.departure}
                    </strong>.

                    All gates are occupied during
                    its arrival.

                </div>

            `
        ).join("");
}


/* =========================================================
   DISPLAY ALGORITHM TRACE
   ========================================================= */

function displayTrace(trace) {

    const container =
        document.getElementById(
            "algorithmTrace"
        );


    if (
        !trace ||
        trace.length === 0
    ) {

        container.innerHTML =
            "No algorithm trace available.";

        return;
    }


    container.innerHTML =
        trace.map(
            (item, index) => {

                let icon = "✓";


                if (
                    item.type ===
                    "conflict"
                ) {

                    icon = "⚠";

                } else if (
                    item.type ===
                    "release"
                ) {

                    icon = "↻";

                }


                return `

                    <div class="trace-step">

                        <div class="trace-number">
                            ${icon}
                        </div>

                        <div>
                            <strong>
                                Step ${index + 1}
                            </strong>

                            <p>
                                ${escapeHTML(item.text)}
                            </p>
                        </div>

                    </div>

                `;

            }
        ).join("");
}


/* =========================================================
   GATE UTILIZATION
   ========================================================= */

function calculateGateUtilization(
    results,
    gateCount
) {

    if (
        !results ||
        results.length === 0 ||
        gateCount <= 0
    ) {

        return 0;
    }


    let totalGateMinutes = 0;


    results.forEach(
        result => {

            if (
                result.status ===
                "Allocated"
            ) {

                totalGateMinutes +=
                    timeToMinutes(
                        result.departure
                    ) -
                    timeToMinutes(
                        result.arrival
                    );

            }

        }
    );


    /*
        Calculate time span
        covered by all flights.
    */

    const arrivals =
        results.map(
            r =>
                timeToMinutes(
                    r.arrival
                )
        );


    const departures =
        results.map(
            r =>
                timeToMinutes(
                    r.departure
                )
        );


    if (
        arrivals.length === 0
    ) {

        return 0;
    }


    const earliest =
        Math.min(...arrivals);


    const latest =
        Math.max(...departures);


    const totalAvailableMinutes =
        (
            latest -
            earliest
        ) *
        gateCount;


    if (
        totalAvailableMinutes <= 0
    ) {

        return 0;
    }


    return Math.min(
        100,
        Math.round(
            (
                totalGateMinutes /
                totalAvailableMinutes
            ) *
            100
        )
    );
}


/* =========================================================
   ADVANCED TIMELINE
   ========================================================= */

function displayAdvancedTimeline(
    results
) {

    const container =
        document.getElementById(
            "gateTimeline"
        );


    if (
        !results ||
        results.length === 0
    ) {

        container.innerHTML =
            "Run allocation to generate the timeline.";

        return;
    }


    const gateCount =
        parseInt(
            document
                .getElementById(
                    "gateCount"
                )
                .value
        );


    const allTimes = [];


    results.forEach(
        result => {

            allTimes.push(
                timeToMinutes(
                    result.arrival
                )
            );

            allTimes.push(
                timeToMinutes(
                    result.departure
                )
            );

        }
    );


    const earliest =
        Math.min(...allTimes);


    const latest =
        Math.max(...allTimes);


    let start =
        Math.floor(
            earliest / 60
        ) * 60;


    let end =
        Math.ceil(
            latest / 60
        ) * 60;


    if (
        end <= start
    ) {

        end =
            start + 60;
    }


    const totalDuration =
        end - start;


    container.innerHTML = "";


    /*
        Create gate rows.
    */

    for (
        let gate = 1;
        gate <= gateCount;
        gate++
    ) {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "timeline-row";


        const gateLabel =
            document.createElement(
                "div"
            );


        gateLabel.className =
            "timeline-gate";


        gateLabel.textContent =
            `G${gate}`;


        const track =
            document.createElement(
                "div"
            );


        track.className =
            "timeline-track";


        const gateFlights =
            results.filter(
                result =>
                    result.status ===
                    "Allocated" &&
                    result.gateNumber ===
                    gate
            );


        gateFlights.forEach(
            flight => {

                const arrival =
                    timeToMinutes(
                        flight.arrival
                    );


                const departure =
                    timeToMinutes(
                        flight.departure
                    );


                const left =
                    (
                        (
                            arrival -
                            start
                        ) /
                        totalDuration
                    ) *
                    100;


                const width =
                    (
                        (
                            departure -
                            arrival
                        ) /
                        totalDuration
                    ) *
                    100;


                const block =
                    document.createElement(
                        "div"
                    );


                block.className =
                    "timeline-flight";


                block.style.left =
                    `${Math.max(0, left)}%`;


                block.style.width =
                    `${Math.max(4, width)}%`;


                block.innerHTML = `
                    ${escapeHTML(flight.flightId)}
                    · ${flight.arrival}-${flight.departure}
                `;


                block.title =
                    `${flight.flightId} | ${flight.airline} | ${flight.arrival} - ${flight.departure}`;


                track.appendChild(
                    block
                );

            }
        );


        row.appendChild(
            gateLabel
        );


        row.appendChild(
            track
        );


        container.appendChild(
            row
        );

    }


    /*
        Add time scale.
    */

    const scale =
        document.createElement(
            "div"
        );


    scale.className =
        "timeline-time-scale";


    const hourCount =
        Math.max(
            1,
            Math.floor(
                totalDuration / 60
            )
        );


    for (
        let i = 0;
        i <= hourCount;
        i++
    ) {

        const label =
            document.createElement(
                "span"
            );


        label.textContent =
            minutesToTime(
                start + i * 60
            );


        scale.appendChild(
            label
        );

    }


    container.appendChild(
        scale
    );
}


/* =========================================================
   ANALYSIS GENERATION
   ========================================================= */

function generateAnalysis(
    results
) {

    if (
        !results ||
        results.length === 0
    ) {

        clearAnalysis();

        return;
    }


    const total =
        results.length;


    const allocated =
        results.filter(
            result =>
                result.status ===
                "Allocated"
        );


    const conflicts =
        results.filter(
            result =>
                result.status ===
                "Conflict"
        );


    const gateCount =
        parseInt(
            document
                .getElementById(
                    "gateCount"
                )
                .value
        );


    const peak =
        calculatePeakFlights(
            results
        );


    const utilization =
        calculateGateUtilization(
            results,
            gateCount
        );


    const allocationRate =
        total === 0
            ? 0
            : Math.round(
                (
                    allocated.length /
                    total
                ) *
                100
            );


    const conflictRate =
        total === 0
            ? 0
            : Math.round(
                (
                    conflicts.length /
                    total
                ) *
                100
            );


    const totalGateMinutes =
        allocated.reduce(
            (sum, flight) =>
                sum +
                (
                    timeToMinutes(
                        flight.departure
                    ) -
                    timeToMinutes(
                        flight.arrival
                    )
                ),
            0
        );


    /*
        Busiest gate
    */

    const gateCounts = {};


    allocated.forEach(
        flight => {

            const gate =
                flight.gate;


            gateCounts[gate] =
                (
                    gateCounts[gate] ||
                    0
                ) + 1;

        }
    );


    let busiestGate =
        "-";


    let busiestCount =
        0;


    Object.entries(
        gateCounts
    ).forEach(
        ([gate, count]) => {

            if (
                count >
                busiestCount
            ) {

                busiestCount =
                    count;

                busiestGate =
                    gate;
            }

        }
    );


    /*
        Update analysis cards.
    */

    setText(
        "peakFlights",
        peak
    );


    setText(
        "analysisUtilization",
        utilization + "%"
    );


    setText(
        "allocationRate",
        allocationRate + "%"
    );


    setText(
        "conflictRate",
        conflictRate + "%"
    );


    setText(
        "totalGateTime",
        `${totalGateMinutes} min`
    );


    setText(
        "busiestGate",
        busiestGate
    );


    /*
        Draw graphs.
    */

    createGateFlightsChart(
        allocated,
        gateCount
    );


    createPassengerChart(
        results
    );


    createGateUtilizationChart(
        allocated,
        gateCount
    );


    createStatusChart(
        allocated.length,
        conflicts.length
    );


    createActiveFlightsChart(
        results
    );
}


/* =========================================================
   PEAK CONCURRENT FLIGHTS
   ========================================================= */

function calculatePeakFlights(
    flightList
) {

    if (
        !flightList ||
        flightList.length === 0
    ) {

        return 0;
    }


    const events = [];


    flightList.forEach(
        flight => {

            events.push({

                time:
                    timeToMinutes(
                        flight.arrival
                    ),

                change:
                    1

            });


            events.push({

                time:
                    timeToMinutes(
                        flight.departure
                    ),

                change:
                    -1

            });

        }
    );


    /*
        At the same time,
        departures should be processed
        before arrivals.

        This matches the rule:
        departure <= arrival means
        gate can be reused.
    */

    events.sort(
        (a, b) => {

            if (
                a.time !==
                b.time
            ) {

                return (
                    a.time -
                    b.time
                );
            }

            return (
                a.change -
                b.change
            );
        }
    );


    let active = 0;

    let peak = 0;


    events.forEach(
        event => {

            active +=
                event.change;


            peak =
                Math.max(
                    peak,
                    active
                );

        }
    );


    return peak;
}


/* =========================================================
   GRAPH HELPER
   ========================================================= */

function destroyChart(
    name
) {

    if (
        charts[name]
    ) {

        charts[name].destroy();

        charts[name] =
            null;
    }
}


function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;
    }
}


/* =========================================================
   GRAPH 1
   FLIGHTS PER GATE
   ========================================================= */

function createGateFlightsChart(
    allocated,
    gateCount
) {

    destroyChart(
        "gateFlights"
    );


    const labels = [];

    const values = [];


    for (
        let gate = 1;
        gate <= gateCount;
        gate++
    ) {

        labels.push(
            `G${gate}`
        );


        values.push(
            allocated.filter(
                flight =>
                    flight.gateNumber ===
                    gate
            ).length
        );

    }


    const canvas =
        document.getElementById(
            "gateFlightsChart"
        );


    if (!canvas) {
        return;
    }


    charts.gateFlights =
        new Chart(
            canvas,
            {

                type:
                    "bar",

                data: {

                    labels,

                    datasets: [{

                        label:
                            "Flights",

                        data:
                            values

                    }]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            ticks: {
                                precision: 0
                            }

                        }

                    }

                }

            }
        );
}


/* =========================================================
   GRAPH 2
   PASSENGER DISTRIBUTION
   ========================================================= */

function createPassengerChart(
    results
) {

    destroyChart(
        "passengers"
    );


    const labels =
        results.map(
            flight =>
                flight.flightId
        );


    const values =
        results.map(
            flight =>
                flight.passengers
        );


    const canvas =
        document.getElementById(
            "passengerChart"
        );


    if (!canvas) {
        return;
    }


    charts.passengers =
        new Chart(
            canvas,
            {

                type:
                    "bar",

                data: {

                    labels,

                    datasets: [{

                        label:
                            "Passengers",

                        data:
                            values

                    }]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        y: {
                            beginAtZero:
                                true
                        }

                    }

                }

            }
        );
}


/* =========================================================
   GRAPH 3
   GATE UTILIZATION
   ========================================================= */

function createGateUtilizationChart(
    allocated,
    gateCount
) {

    destroyChart(
        "gateUtilization"
    );


    const labels = [];

    const values = [];


    let earliest =
        Infinity;


    let latest =
        -Infinity;


    allocated.forEach(
        flight => {

            earliest =
                Math.min(
                    earliest,
                    timeToMinutes(
                        flight.arrival
                    )
                );


            latest =
                Math.max(
                    latest,
                    timeToMinutes(
                        flight.departure
                    )
                );

        }
    );


    const availableWindow =
        latest > earliest
            ? latest - earliest
            : 1;


    for (
        let gate = 1;
        gate <= gateCount;
        gate++
    ) {

        const gateMinutes =
            allocated
                .filter(
                    flight =>
                        flight.gateNumber ===
                        gate
                )
                .reduce(
                    (sum, flight) =>
                        sum +
                        (
                            timeToMinutes(
                                flight.departure
                            ) -
                            timeToMinutes(
                                flight.arrival
                            )
                        ),
                    0
                );


        const percentage =
            Math.min(
                100,
                Math.round(
                    (
                        gateMinutes /
                        availableWindow
                    ) *
                    100
                )
            );


        labels.push(
            `G${gate}`
        );


        values.push(
            percentage
        );

    }


    const canvas =
        document.getElementById(
            "gateUtilizationChart"
        );


    if (!canvas) {
        return;
    }


    charts.gateUtilization =
        new Chart(
            canvas,
            {

                type:
                    "bar",

                data: {

                    labels,

                    datasets: [{

                        label:
                            "Utilization %",

                        data:
                            values

                    }]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            max: 100

                        }

                    }

                }

            }
        );
}


/* =========================================================
   GRAPH 4
   STATUS
   ========================================================= */

function createStatusChart(
    allocatedCount,
    conflictCount
) {

    destroyChart(
        "status"
    );


    const canvas =
        document.getElementById(
            "statusChart"
        );


    if (!canvas) {
        return;
    }


    charts.status =
        new Chart(
            canvas,
            {

                type:
                    "doughnut",

                data: {

                    labels: [
                        "Allocated",
                        "Conflict"
                    ],

                    datasets: [{

                        data: [

                            allocatedCount,
                            conflictCount

                        ]

                    }]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false

                }

            }
        );
}


/* =========================================================
   GRAPH 5
   ACTIVE FLIGHTS OVER TIME
   ========================================================= */

function createActiveFlightsChart(
    results
) {

    destroyChart(
        "activeFlights"
    );


    if (
        !results ||
        results.length === 0
    ) {
        return;
    }


    const allTimes = [];


    results.forEach(
        flight => {

            allTimes.push(
                timeToMinutes(
                    flight.arrival
                )
            );

            allTimes.push(
                timeToMinutes(
                    flight.departure
                )
            );

        }
    );


    const start =
        Math.floor(
            Math.min(...allTimes) /
            30
        ) * 30;


    const end =
        Math.ceil(
            Math.max(...allTimes) /
            30
        ) * 30;


    const labels = [];

    const values = [];


    for (
        let time = start;
        time <= end;
        time += 30
    ) {

        let active = 0;


        results.forEach(
            flight => {

                const arrival =
                    timeToMinutes(
                        flight.arrival
                    );


                const departure =
                    timeToMinutes(
                        flight.departure
                    );


                if (
                    arrival <= time &&
                    time < departure
                ) {

                    active++;

                }

            }
        );


        labels.push(
            minutesToTime(time)
        );


        values.push(
            active
        );

    }


    const canvas =
        document.getElementById(
            "activeFlightsChart"
        );


    if (!canvas) {
        return;
    }


    charts.activeFlights =
        new Chart(
            canvas,
            {

                type:
                    "line",

                data: {

                    labels,

                    datasets: [{

                        label:
                            "Active Flights",

                        data:
                            values,

                        tension:
                            0.3,

                        fill:
                            true

                    }]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            ticks: {
                                precision: 0
                            }

                        }

                    }

                }

            }
        );
}


/* =========================================================
   CLEAR ANALYSIS
   ========================================================= */

function clearAnalysis() {

    setText(
        "peakFlights",
        "0"
    );

    setText(
        "analysisUtilization",
        "0%"
    );

    setText(
        "allocationRate",
        "0%"
    );

    setText(
        "conflictRate",
        "0%"
    );

    setText(
        "totalGateTime",
        "0 min"
    );

    setText(
        "busiestGate",
        "-"
    );


    Object.keys(
        charts
    ).forEach(
        key => {

            if (
                charts[key]
            ) {

                charts[key].destroy();

            }

        }
    );


    charts = {};
}


/* =========================================================
   LOAD SAMPLE DATA
   ========================================================= */

function loadSampleData() {

    flights = [

        {
            flightId:
                "F1",

            airline:
                "Air India",

            flightType:
                "Domestic",

            origin:
                "Delhi",

            destination:
                "Hyderabad",

            arrival:
                "08:00",

            departure:
                "09:30",

            passengers:
                180,

            seats:
                200
        },


        {
            flightId:
                "F2",

            airline:
                "IndiGo",

            flightType:
                "Domestic",

            origin:
                "Mumbai",

            destination:
                "Hyderabad",

            arrival:
                "08:20",

            departure:
                "10:00",

            passengers:
                165,

            seats:
                180
        },


        {
            flightId:
                "F3",

            airline:
                "Vistara",

            flightType:
                "Domestic",

            origin:
                "Bengaluru",

            destination:
                "Hyderabad",

            arrival:
                "08:40",

            departure:
                "09:45",

            passengers:
                190,

            seats:
                200
        },


        {
            flightId:
                "F4",

            airline:
                "SpiceJet",

            flightType:
                "Domestic",

            origin:
                "Chennai",

            destination:
                "Hyderabad",

            arrival:
                "09:00",

            departure:
                "11:00",

            passengers:
                175,

            seats:
                190
        },


        {
            flightId:
                "F5",

            airline:
                "IndiGo",

            flightType:
                "Domestic",

            origin:
                "Kolkata",

            destination:
                "Hyderabad",

            arrival:
                "09:10",

            departure:
                "10:30",

            passengers:
                160,

            seats:
                180
        },


        {
            flightId:
                "F6",

            airline:
                "Air India",

            flightType:
                "International",

            origin:
                "Dubai",

            destination:
                "Hyderabad",

            arrival:
                "09:20",

            departure:
                "11:30",

            passengers:
                210,

            seats:
                240
        },


        {
            flightId:
                "F7",

            airline:
                "Emirates",

            flightType:
                "International",

            origin:
                "Dubai",

            destination:
                "Hyderabad",

            arrival:
                "10:00",

            departure:
                "12:00",

            passengers:
                230,

            seats:
                260
        },


        {
            flightId:
                "F8",

            airline:
                "IndiGo",

            flightType:
                "Domestic",

            origin:
                "Pune",

            destination:
                "Hyderabad",

            arrival:
                "10:20",

            departure:
                "11:45",

            passengers:
                150,

            seats:
                180
        }

    ];


    document
        .getElementById(
            "gateCount"
        )
        .value = 4;


    displayFlights();

    updateDashboard();

    resetResults();


    /*
        Automatically run allocation
        so demo data immediately
        produces graphs.
    */

    setTimeout(
        () => {

            allocateGates();

        },
        150
    );
}


/* =========================================================
   EXPORT CSV
   ========================================================= */

function exportCSV() {

    if (
        flights.length === 0
    ) {

        alert(
            "No flights available to export."
        );

        return;
    }


    const headers = [

        "Flight ID",
        "Airline",
        "Flight Type",
        "Origin",
        "Destination",
        "Arrival",
        "Departure",
        "Passengers",
        "Seats"

    ];


    const rows =
        flights.map(
            flight => [

                flight.flightId,
                flight.airline,
                flight.flightType,
                flight.origin,
                flight.destination,
                flight.arrival,
                flight.departure,
                flight.passengers,
                flight.seats

            ]
        );


    const csv = [

        headers,
        ...rows

    ]
        .map(
            row =>
                row
                    .map(
                        value =>
                            `"${String(value)
                                .replace(
                                    /"/g,
                                    '""'
                                )}"`
                    )
                    .join(",")
        )
        .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "airportflow_flights.csv";


    document
        .body
        .appendChild(link);


    link.click();


    document
        .body
        .removeChild(link);


    URL.revokeObjectURL(
        url
    );
}


/* =========================================================
   RESET RESULTS
   ========================================================= */

function resetResults() {

    allocationResults = [];


    document
        .getElementById(
            "resultTableBody"
        )
        .innerHTML = "";


    document
        .getElementById(
            "emptyResults"
        )
        .style.display =
            "block";


    document
        .getElementById(
            "conflictCount"
        )
        .textContent =
            "0";


    document
        .getElementById(
            "conflictList"
        )
        .innerHTML =
            "No conflicts detected.";


    document
        .getElementById(
            "gateTimeline"
        )
        .innerHTML =
            "Run allocation to generate the timeline.";


    document
        .getElementById(
            "algorithmTrace"
        )
        .innerHTML =
            "Run the algorithm to see each step.";


    clearAnalysis();

    updateDashboard();
}


/* =========================================================
   CLEAR ALL
   ========================================================= */

function clearAll() {

    const confirmed =
        confirm(
            "Clear all flights and reset the AirportFlow system?"
        );


    if (!confirmed) {
        return;
    }


    flights = [];

    allocationResults = [];


    document
        .getElementById(
            "flightForm"
        )
        .reset();


    displayFlights();

    resetResults();

    updateDashboard();
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        displayFlights();

        updateDashboard();

    }
);