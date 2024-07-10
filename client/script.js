document.addEventListener('DOMContentLoaded', function () {
    const forms = {
        'crud-form1': document.getElementById('crud-form1'),
        'crud-form2': document.getElementById('crud-form2'),
        'crud-form3': document.getElementById('crud-form3'),
        'crud-form4': document.getElementById('crud-form4'),
    };

    const tables = {
        'crud-table1': document.querySelector('#crud-table1 tbody'),
        'crud-table2': document.querySelector('#crud-table2 tbody'),
        'crud-table3': document.querySelector('#crud-table3 tbody'),
        'crud-table4': document.querySelector('#crud-table4 tbody'),
    };

    let editingRow = null;
    let currentId = 1;

    Object.values(forms).forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            const tableId = form.id.replace('form', 'table');
            if (editingRow) {
                updateRow(editingRow, data);
            } else {
                addRow(tableId, data);
            }

            form.reset();
            editingRow = null;
        });
    });

    function addRow(tableId, data) {
        const tableBody = tables[tableId];
        const row = document.createElement('tr');
        
        const idCell = document.createElement('td');
        idCell.textContent = currentId++;
        row.appendChild(idCell);

        Object.keys(data).forEach(key => {
            const cell = document.createElement('td');
            cell.textContent = data[key];
            row.appendChild(cell);
        });

        const actionsCell = document.createElement('td');
        actionsCell.innerHTML = `
            <button class="action-btn details-btn">Details</button>
            <button class="action-btn edit-btn">Edit</button>
            <button class="action-btn delete-btn">Delete</button>
        `;
        row.appendChild(actionsCell);

        tableBody.appendChild(row);

        addRowListeners(row, data);
    }

    function updateRow(row, data) {
        let cellIndex = 1;  // Skip the ID cell
        Object.keys(data).forEach(key => {
            row.cells[cellIndex].textContent = data[key];
            cellIndex++;
        });
    }

    function addRowListeners(row, data) {
        row.querySelector('.details-btn').addEventListener('click', function (e) {
            e.preventDefault();
            alert('Details: ' + JSON.stringify(data, null, 2));
        });

        row.querySelector('.edit-btn').addEventListener('click', function (e) {
            e.preventDefault();
            editingRow = row;
            loadRowData(data);
        });

        row.querySelector('.delete-btn').addEventListener('click', function (e) {
            e.preventDefault();
            row.remove();
        });
    }

    function loadRowData(data) {
        for (const [key, value] of Object.entries(data)) {
            const formElement = document.querySelector(`form input[name="${key}"]`);
            if (formElement) {
                formElement.value = value;
            }
        }
    }
});

function openTable(evt, tableName) {
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    const tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tableName).style.display = "block";
    evt.currentTarget.className += " active";
}

document.querySelector('.tab button').click();
