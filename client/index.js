const tablinks = document.getElementsByClassName("tablinks");

let currentTable = 'applicant'; 
let currentData; 

displayTable(tablinks[0], 'applicant'); 

//display table
async function displayTable(tableLink, table){
    console.log('test');
    highlightTablink(tableLink);
    let data = await getData(table); 
    currentData = data; 
    createTable(data);
}

//tablinks
for (const tablink of tablinks){
    tablink.addEventListener('click', (e) => {
      displayTable(e.currentTarget, tablink.id); 
    })
}

//highlight current table
function highlightTablink(tablink){
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    tablink.className += " active";
    currentTable = tablink.id; 
}

//fetch data of a table
async function getData(table){
    try{
        const response = await fetch(`http://localhost:3000/${table}`, {
            method: 'GET',
        });
        const data = await response.json(); 
        console.log(data); 
        return data;
    } catch(err){
        console.log(err); 
    }
}
//get a record from a table 

//create table in UI
function createTable(data){
    //remove existing table
    const container = document.getElementById('table-container');
  
    while(container.hasChildNodes()){
        container.removeChild(container.firstChild)
    }
    
    const table = document.createElement('table');
    table.id = 'table-data'
    const headerRow = document.createElement('tr');
    const keys = Object.keys(data[0]);
    keys.forEach((key, i) => {
        if(i == 0){
            const th = document.createElement('th');
            th.textContent = 'Actions';
            headerRow.appendChild(th);
        }
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    data.forEach((item, index)=> {
        const row = document.createElement('tr');
        keys.forEach((key,i) => {
            if(i == 0){
               addActions(row, data); 
            } 
            const td = document.createElement('td');
            td.textContent = item[key];
            row.appendChild(td);
            row.id = index; 
        });
        table.appendChild(row);
    });
    container.appendChild(table); 
}

function addActions(parentCont, data){
    console.log(data); 
    console.log(currentTable); 
    const cell = document.createElement('td'); 
    const actionsCont = document.createElement('div'); 
    actionsCont.className = 'table-actions'
    

    const updateBtn = document.createElement('button'); 
    updateBtn.className = 'update-btn'
    const updateIcon = document.createElement('img'); 
    updateIcon.src = 'assets/update.svg';
    updateBtn.appendChild(updateIcon); 
    updateBtn.addEventListener('click', () => updateData(currentTable, data));  

    // const viewBtn = document.createElement('button'); 
    // viewBtn.className = 'view-btn'
    // const viewIcon = document.createElement('img'); 
    // viewIcon.src = 'assets/view.svg'; 
    // viewBtn.appendChild(viewIcon); 
    // viewBtn.addEventListener('click', () => updateData(currentTable, data));  

    const deleteBtn = document.createElement('button'); 
    deleteBtn.className = 'delete-btn'
    const deleteIcon = document.createElement('img'); 
    deleteIcon.src = 'assets/delete.svg'; 
    deleteBtn.appendChild(deleteIcon); 
    deleteBtn.addEventListener('click', (e) => handleDelete(e.target));  

    // actionsCont.appendChild(viewBtn); 
    actionsCont.appendChild(updateBtn); 
    actionsCont.appendChild(deleteBtn); 
    cell.appendChild(actionsCont)
    parentCont.appendChild(cell); 
}

//create record
async function createData(table, rec){
    try{
        const response = await fetch(`http://localhost:3000/${table}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ record: rec })
        });
        const status = await response.json(); 
        console.log(status); 
        return status;
    } catch(err){
        console.log(err); 
    }
};

//test functionality
const createRecordBtn = document.getElementById('create-record'); 
createRecordBtn.addEventListener('click', () => {
    const test = {
        schoolID: 14,
        name: "PUP",
        location: "Manila",
        type: "Public"
    }
    createData('school', test);
    displayTable(tablinks[3], 'school');
})

//update record
async function updateData(table, record){
    try{
        const response = await fetch(`http://localhost:3000/${table}/${record}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(record)
        });
        const status = await response.json(); 
        console.log(status); 
        return status;
    } catch(err){
        console.log(err); 
    }
}

//delete record
async function deleteData(table, keys){
    const keyParts = keys.map(({ key, value }) => `${key}=${encodeURIComponent(value)}`).join('&');
    const url = `http://localhost:3000/${table}/${keyParts}`;
   
    try{
        const response = await fetch(url, {
            method: 'DELETE',
        });
        const status = await response.json(); 
        return status;
    } catch(err){
        console.log(err); 
    }
}

async function handleDelete(node){
    const row = node.parentNode.parentNode.parentNode.parentNode; 
    const rowIndex = row.id; 
    const record = currentData[rowIndex];
    let status; 
    if(currentTable == 'family'){
        const keys = [
            {key: 'applicantID', value: record.applicantID}, 
            {key: 'relation_type', value: record.relation_type}
        ];
        status = await deleteData(currentTable, keys); 
    } else {
        const keys = [
            {key: `${currentTable}ID`, value: record[`${currentTable}ID`]}, 
        ];
        status = await deleteData(currentTable, keys);
    }
    
    if(status == 'Deleted'){
        displayTable(getTablink(currentTable), currentTable);    
    }
}

function getTablink(table){
    for (let i =0; tablinks.length -1; i++){
        if (tablinks[i].id == table){
            return tablinks[i]; 
        }
    }
}