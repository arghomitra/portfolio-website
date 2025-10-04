// JavaScript File: salary.js

document.addEventListener('DOMContentLoaded', () => {
    loadFromCookies();
});

function addEntries() {
    const date = document.getElementById("date").value;
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;

    if (!date || !startTime || !endTime) {
        alert("Please fill in all fields.");
        return;
    }

    const dates = date.split(',');

    dates.forEach(date => {
        addEntry(date.trim(), startTime, endTime);
    });

    saveToCookies();
    document.getElementById("date").value = '';
    document.getElementById("startTime").value = '';
    document.getElementById("endTime").value = '';
}

function addEntry(date, startTime, endTime) {
    const startDate = new Date(date + "T" + startTime);
    let endDate = new Date(date + "T" + endTime);

    // Check if the shift ends on the next day
    if (endDate < startDate) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        endDate = new Date(nextDay.toISOString().split('T')[0] + "T" + endTime);
    }

    const hoursDiff = (endDate - startDate) / 1000 / 60 / 60;

    const table = document.getElementById("dataTable").getElementsByTagName('tbody')[0];
    const row = table.insertRow(-1);
    const cellDate = row.insertCell(0);
    const cellStartTime = row.insertCell(1);
    const cellEndTime = row.insertCell(2);
    const cellTotalHours = row.insertCell(3);
    const cellActions = row.insertCell(4);

    cellDate.innerHTML = date;
    cellStartTime.innerHTML = startTime;
    cellEndTime.innerHTML = endTime;
    cellTotalHours.innerHTML = hoursDiff.toFixed(2);
    cellActions.innerHTML = `<button onclick="editEntry(this)">Edit</button>`;

    document.getElementById("totalHours").innerText = "Total Hours: " + calculateTotalHours().toFixed(2);

    document.getElementById("results").classList.remove("hidden");

    // Automatically calculate salary when new entry added
    calculateSalary();
}

function calculateTotalHours() {
    const table = document.getElementById("dataTable").getElementsByTagName('tbody')[0];
    let totalHours = 0;

    for (let i = 0; i < table.rows.length; i++) {
        totalHours += parseFloat(table.rows[i].cells[3].innerHTML);
    }

    return totalHours;
}

function calculateSalary() {
    const totalHours = calculateTotalHours();
    const hourlySalary = document.getElementById("hourlySalary").value;

    const totalSalary = totalHours * hourlySalary;

    document.getElementById("totalSalary").innerText = "Total Salary: €" + totalSalary.toFixed(2);
    document.getElementById("totalSalary").classList.remove("hidden");
    document.getElementById("generatePDFBtn").classList.remove("hidden");

    saveToCookies();
}

function generatePDF() {
    const data = [];
    const table = document.getElementById("dataTable");
    const tableRows = table.getElementsByTagName('tbody')[0].rows;
    const hourlyRate = parseFloat(document.getElementById("hourlySalary").value);

    // Ensure there are entries in the table
    if (tableRows.length === 0) {
        alert("No entries to generate PDF.");
        return;
    }

    // Get the first entry date to determine the report month
    const firstEntryDate = new Date(tableRows[0].cells[0].innerText);
    const reportMonth = firstEntryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

    for (let i = 0; i < tableRows.length; i++) {
        const rowData = [];
        const dateCell = tableRows[i].cells[0].innerText; // Assuming date is in format 'yyyy-mm-dd'
        const dateObj = new Date(dateCell);
        const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' }); // Get day of the week
        const totalHours = parseFloat(tableRows[i].cells[3].innerText);
        const shiftAmount = (totalHours * hourlyRate).toFixed(2);

        for (let j = 0; j < tableRows[i].cells.length - 1; j++) {
            rowData.push(tableRows[i].cells[j].innerText);
        }
        rowData.splice(1, 0, dayOfWeek); // Insert day of the week after the Date column
        rowData.push(shiftAmount); // Add the shift amount

        data.push(rowData);
    }

    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const companyName = document.getElementById("companyName").value;
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    const dateTime = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const totalHours = document.getElementById("totalHours").innerText;
    const totalSalary = document.getElementById("totalSalary").innerText;

    const docDefinition = {
        content: [
            { text: 'Monthly Timetable', style: 'header' },
            
            { text: `${companyName}`, style: 'subheader' },
            { text: `Employee: ${firstName} ${lastName}`, style: 'employeeInfo' },
            { text: `Report generated on: ${dateTime}`, style: 'employeeInfo' },
    
            { text: '\n\n' },
            { text: `${totalHours}`, style: 'summary' },
            { text: `${totalSalary}`, style: 'summary' },
            { text: '\n\n' },
            {
                style: 'tableStyle',
                table: {
                    headerRows: 1,
                    widths: ['*', '*', '*', '*', '*', '*'], // Adjust widths to make table 100% width of the page
                    body: [
                        [{ text: 'Date', style: 'tableHeader' }, { text: 'Day', style: 'tableHeader' }, { text: 'Start Time', style: 'tableHeader' }, { text: 'End Time', style: 'tableHeader' }, { text: 'Total Hours', style: 'tableHeader' }, { text: 'Amount (€)', style: 'tableHeader' }],
                        ...data.map(row => row.map(cell => ({ text: cell, margin: [10, 0, 0, 0] })))
                    ]
                },
                layout: 'lightHorizontalLines' // Add a light horizontal line between rows
            },
    
            { text: '\n\n' },
            { text: 'Thank you for using Salary Calculator.', style: 'footer' }
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 0, 0, 10]
            },
            subheader: {
                fontSize: 14,
                bold: true,
                alignment: 'center',
                margin: [0, 10, 0, 5]
            },
            employeeInfo: {
                fontSize: 12,
                margin: [0, 5, 0, 5]
            },
            summary: {
                fontSize: 12,
                bold: true,
                margin: [0, 5, 0, 5]
            },
            tableStyle: {
                margin: [0, 15, 0, 15]
            },
            tableHeader: {
                bold: true,
                fontSize: 12,
                color: 'black',
                fillColor: '#f3f3f3',
                alignment: 'center'
            },
            footer: {
                fontSize: 10,
                color: '#777',
                alignment: 'center',
                margin: [0, 20, 0, 0]
            }
        }
    };
    

    pdfMake.createPdf(docDefinition).download(`${firstName}_${lastName}_timesheet.pdf`);
}




function saveToCookies() {
    const entries = [];
    const table = document.getElementById("dataTable").getElementsByTagName('tbody')[0];

    for (let i = 0; i < table.rows.length; i++) {
        const row = table.rows[i];
        const entry = {
            date: row.cells[0].innerText,
            startTime: row.cells[1].innerText,
            endTime: row.cells[2].innerText,
            totalHours: row.cells[3].innerText
        };
        entries.push(entry);
    }

    const data = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        companyName: document.getElementById("companyName").value,
        hourlySalary: document.getElementById("hourlySalary").value,
        entries: entries
    };

    const cookieData = JSON.stringify(data);
    document.cookie = `salaryCalculatorData=${encodeURIComponent(cookieData)}; max-age=${60 * 60 * 24 * 30}; path=/`;
}

function loadFromCookies() {
    const cookieData = document.cookie
        .split(';')
        .find(cookie => cookie.trim().startsWith('salaryCalculatorData='));

    if (!cookieData) return;

    const decodedCookie = decodeURIComponent(cookieData.split('=')[1]);
    const data = JSON.parse(decodedCookie);

    document.getElementById("firstName").value = data.firstName;
    document.getElementById("lastName").value = data.lastName;
    document.getElementById("companyName").value = data.companyName;
    document.getElementById("hourlySalary").value = data.hourlySalary;

    data.entries.forEach(entry => {
        addEntry(entry.date, entry.startTime, entry.endTime);
    });

    calculateSalary();
}

function editEntry(button) {
    const row = button.parentElement.parentElement;
    const date = row.cells[0].innerText;
    const startTime = row.cells[1].innerText;
    const endTime = row.cells[2].innerText;

    document.getElementById("date").value = date;
    document.getElementById("startTime").value = startTime;
    document.getElementById("endTime").value = endTime;

    row.remove();
    saveToCookies();
    document.getElementById("totalHours").innerText = "Total Hours: " + calculateTotalHours().toFixed(2);

    // Automatically calculate salary after editing entry
    calculateSalary();
}

document.getElementById('date').addEventListener('change', function (event) {
    const selectedDates = event.target.value.split(',').map(date => date.trim()).join(',');
    event.target.value = selectedDates;
});
