const tablinks = document.getElementsByClassName("tablinks");

displayTable(tablinks[0], 'applicant'); 

//display table
async function displayTable(tableLink, table){
    console.log(tableLink);
    highlightTablink(tableLink);
    const data = await getData(table); 
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
    const headerRow = document.createElement('tr');
    const keys = Object.keys(data[0]);
    keys.forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    data.forEach(item => {
        const row = document.createElement('tr');
        keys.forEach(key => {
            const td = document.createElement('td');
            td.textContent = item[key];
            row.appendChild(td);
        });
        table.appendChild(row);
    });
    container.appendChild(table); 
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
async function updateData(table, record){
    try{
        const response = await fetch(`http://localhost:3000/${table}/${record}`, {
            method: 'DELETE',
        });
        const status = await response.json(); 
        console.log(status); 
        return status;
    } catch(err){
        console.log(err); 
    }
}