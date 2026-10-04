const CHANNEL_ID = "3518634";

// IMPORTANT:
// ThingSpeak → API Keys → Read API Key
// adha inga paste pannu.
const READ_API_KEY = "CMBA5QOMHYC2AL6Q";


let allAttendance = [];

const API_URL =
    `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json` +
    `?api_key=${READ_API_KEY}&results=100`;


async function loadAttendance() {

    const table = document.getElementById("attendanceTable");

    table.innerHTML = `
        <tr>
            <td colspan="7">Loading attendance...</td>
        </tr>
    `;

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("ThingSpeak connection failed");
        }

        const data = await response.json();

        allAttendance = data.feeds || [];

        displayAttendance(allAttendance);

        document.getElementById("lastUpdated").textContent =
            "Last updated: " + new Date().toLocaleTimeString();

    }

    catch (error) {

        console.error(error);

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    ❌ Unable to load attendance data
                </td>
            </tr>
        `;

    }
}


function displayAttendance(feeds) {

    const table = document.getElementById("attendanceTable");

    table.innerHTML = "";

    let present = 0;
    let absent = 0;


    if (feeds.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    No attendance records found
                </td>
            </tr>
        `;

        updateDashboard(0, 0, 0);
        return;
    }


    // Latest record first
    const latestFirst = [...feeds].reverse();


    latestFirst.forEach(feed => {

        const uid = feed.field1 || "-";
        const studentName = feed.field2 || "-";
        const department = feed.field3 || "-";
        const accessStatus = feed.field4 || "-";
        const attendance = feed.field5 || "-";

        const attendanceTime =
            feed.field6 || formatTime(feed.created_at);


        if (attendance.toLowerCase() === "present") {
            present++;
        }

        if (attendance.toLowerCase() === "absent") {
            absent++;
        }


        const row = document.createElement("tr");


        const accessClass =
            accessStatus.toLowerCase() === "granted"
            ? "granted"
            : "denied";


        const attendanceClass =
            attendance.toLowerCase() === "present"
            ? "present"
            : "absent";


        row.innerHTML = `

            <td>${feed.entry_id}</td>

            <td>${uid}</td>

            <td>${studentName}</td>

            <td>${department}</td>

            <td class="${accessClass}">
                ${accessStatus}
            </td>

            <td class="${attendanceClass}">
                ${attendance}
            </td>

            <td>${attendanceTime}</td>

        `;


        table.appendChild(row);

    });


    updateDashboard(
        feeds.length,
        present,
        absent
    );
}


function updateDashboard(total, present, absent) {

    document.getElementById("totalRecords").textContent =
        total;

    document.getElementById("presentCount").textContent =
        present;

    document.getElementById("absentCount").textContent =
        absent;


    let percentage = 0;

    if (total > 0) {

        percentage =
            ((present / total) * 100).toFixed(1);

    }


    document.getElementById("attendancePercentage").textContent =
        percentage + "%";
}


function searchAttendance() {

    const searchValue =
        document.getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();


    if (searchValue === "") {

        displayAttendance(allAttendance);

        return;
    }


    const filtered = allAttendance.filter(feed => {

        const uid =
            (feed.field1 || "").toLowerCase();

        const student =
            (feed.field2 || "").toLowerCase();

        const department =
            (feed.field3 || "").toLowerCase();


        return (
            uid.includes(searchValue) ||
            student.includes(searchValue) ||
            department.includes(searchValue)
        );

    });


    displayAttendance(filtered);
}


function formatTime(timestamp) {

    if (!timestamp) {
        return "-";
    }

    const date = new Date(timestamp);

    return date.toLocaleString("en-IN");
}


// Load data when website starts
loadAttendance();


// Automatically refresh every 20 seconds
setInterval(loadAttendance, 20000);