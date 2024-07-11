
//submit query button
const submitQueryBtn = document.getElementById('query-submit'); 
submitQueryBtn.addEventListener('click', () => {
    submitQuery();
});

async function submitQuery(){
    const queryInput = document.getElementById('query-input'); 
    const query = queryInput.value;
    const results = await getResults(query); 
    createTable(results); 
}

//post sql query 
async function getResults(query){
    try{
        const response = await fetch(`http://localhost:3000/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ sqlQuery: query })
        });
        const data = await response.json(); 
        console.log(data); 
        return data;
    } catch(err){
        console.log(err); 
    }
}

//create table
function createTable(data){
    //remove existing table
    const container = document.getElementById('table-container');
  
    while(container.hasChildNodes()){
        container.removeChild(container.firstChild)
    }
    
    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    const keys = Object.keys(data[0]);
    keys.forEach((key, i) => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    data.forEach(item => {
        const row = document.createElement('tr');
        keys.forEach((key,i) => {
            const td = document.createElement('td');
            td.textContent = item[key];
            row.appendChild(td);
        });
        table.appendChild(row);
    });
    container.appendChild(table); 
}