
const tablinks = document.getElementsByClassName("tablinks");

let currentTable = 'Applicant'; 
let currentData; 

displayTable('Applicant'); 

//display table
async function displayTable(table){
    const tableLink = getTablink(table); 
    highlightTablink(tableLink);
    let data = await getData(table); 
    currentData = data; 
    createTable(data);
}

//tablinks
for (const tablink of tablinks){
    tablink.addEventListener('click', (e) => {
      displayTable(tablink.id); 
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

async function getRecord(table, record){
    try{
        const response = await fetch(`http://localhost:3000/${table}/${record}`, {
            method: 'GET',
        });
        const data = await response.json(); 
        console.log(data); 
        return data;
    } catch(err){
        console.log(err); 
    }
}

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
    updateBtn.addEventListener('click', (e) => handleUpdate(e.target)); 

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


//update record
async function updateData(table, keys, rec){
    const keyParts = keys.map(({ key, value }) => `${key}=${encodeURIComponent(value)}`).join('&');
    console.log(keyParts);
    const url = `http://localhost:3000/${table}/${keyParts}`;

    try{
        const response = await fetch(url, {
            method: 'PUT', 
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
}

//delete record
async function deleteData(table, keys){
    const keyParts = keys.map(({ key, value }) => `${key}=${encodeURIComponent(value)}`).join('&');
    const url = `http://localhost:3000/${table}/${keyParts}`;
    console.log(url); 
   
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

// handle delete
async function handleDelete(node){
    const row = node.parentNode.parentNode.parentNode.parentNode; 
    const rowCont = node.parentNode.parentNode.parentNode; 
    const rowIndex = row.id; 
    let record = currentData[rowIndex];
    if(record == undefined) {
        console.log(rowCont); 
        record = currentData[rowCont.id];
    } 
    let status; 
    if(currentTable == 'Family'){
        const keys = [
            {key: 'ApplicantID', value: record.ApplicantID}, 
            {key: 'Relation_Type', value: record.Relation_Type}
        ];
        deleteConfirm(currentTable, keys); 
        adjustCombinedIncome(record.ApplicantID, record.Monthly_Income, 0); 
    } else {
        const keys = [
            {key: `${currentTable}ID`, value: record[`${currentTable}ID`]}, 
        ];
        deleteConfirm(currentTable, keys); 
    }
}

function getTablink(table){
    for (let i =0; tablinks.length -1; i++){
        if (tablinks[i].id == table){
            return tablinks[i]; 
        }
    }
}

//handle update
async function handleUpdate(node){
    //input rec must be object 
    const row = node.parentNode.parentNode.parentNode.parentNode; 
    const rowCont = node.parentNode.parentNode.parentNode; 
    const rowIndex = row.id; 
    let record = currentData[rowIndex];
    if(record == undefined) {
        console.log(rowCont); 
        record = currentData[rowCont.id];
    } 
    viewRecord(record); 
}

//creates a form pop up to edit a record
function viewRecord(record){
    const main = document.getElementById('main-container');
    const modal = document.createElement('div');
    modal.className = 'update-modal';
    const modalContent = document.createElement('div');
    modalContent.className = 'update-modal-content'
  
    const headCont = document.createElement('div'); 
    const header = document.createElement('h2');
    header.textContent = 'Edit Record'

    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = 'x';
    closeButton.onclick = function() {
      main.removeChild(modal);
    };

     const form = document.createElement('form');
     for (const key in record) {
       if (record.hasOwnProperty(key)) {
         const label = document.createElement('label');
         label.textContent = key.charAt(0).toUpperCase() + key.slice(1);
         form.appendChild(label);
   
         const input = document.createElement('input');
         input.type = 'text';
         input.name = key;
         input.value = record[key];
         form.appendChild(input);
   
         form.appendChild(document.createElement('br'));
       }
    }

    const submitBtn = document.createElement('input')
    submitBtn.type = 'submit'; 
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const updatedRecord = getFormValues(form);
        const updates = compareObjects(record, updatedRecord);
        let status; 

        if(currentTable == 'Family'){
            const keys = [
                {key: 'ApplicantID', value: record.ApplicantID}, 
                {key: 'Relation_Type', value: record.Relation_Type}
            ];
            status = await updateData(currentTable, keys, updates); 

            if(updatedRecord.hasOwnProperty('Monthly_Income')){
                console.log(true); 
                adjustCombinedIncome(record.ApplicantID, record.Monthly_Income, updatedRecord.Monthly_Income); 
            }


        } else {
            const keys = [
                {key: `${currentTable}ID`, value: record[`${currentTable}ID`]}, 
            ];
            status = await updateData(currentTable, keys, updates); 
        }


        if(status){
            main.removeChild(modal);
            displayTable(currentTable);
            createPopup('Record updated', 'success')
        }
    })

    form.appendChild(submitBtn); 
    headCont.append(header);
    headCont.append(closeButton); 
    modalContent.append(headCont); 
    modalContent.append(form);
    modal.appendChild(modalContent); 
    main.appendChild(modal); 
}

function getFormValues(form) {
    const formData = new FormData(form);
    const formValues = {};
    for (const [key, value] of formData.entries()) {
        formValues[key] = value === '' ? null : value;
    }
    return formValues;
}

function compareObjects(obj1, obj2) {
    const newValues = [];
    for (const key in obj2) {
        if (obj2.hasOwnProperty(key)) {
            const val1 = obj1[key];
            let val2 = obj2[key];

            // check if values are different considering type conversion
            if (val1 !== val2 && !(String(val1) === val2 || val1 === String(val2))) {
                // convert val2 to number if it's numeric
                if (!isNaN(val2)) {
                    val2 = Number(val2);
                }
                newValues.push({ key, value: val2 });
            }
        }
    }
    return newValues;
}

const createRecordBtn = document.getElementById('create-record'); 
createRecordBtn.addEventListener('click', () => { handleCreate()})

//handle create 
function handleCreate(){
    const modal = document.querySelector('#modal');
    modal.style.display= 'unset'
    modal.classList.add('active');
    document.getElementById('add-education-button').addEventListener('click', () => {addEducBackground()});
    fillFormWithDummyData(); 

    document.getElementById('scholarship-form').addEventListener('submit', (e) => {
        e.preventDefault(); 
        if(handleRecordSubmit()){
            document.getElementById('scholarship-form').reset(); 
            modal.classList.remove('active'); 
            modal.style.display= 'none'
        } else {
            alert('Failed to add record'); 
        }
    });
}

// --------------------------------------- for popup  -------------------------------------------

async function handleRecordSubmit(){
    try{
    const familyInput = getFamilyInput();
    
    let totalMonthlyIncome = 0;

    familyInput.forEach(member => {
        totalMonthlyIncome += member.monthlyIncome;
    });

    console.log(totalMonthlyIncome);

    const applicantInput = getApplicantInput(totalMonthlyIncome); 
    const educBackgroundInput = getEducBackgroundInput(); 

   // post applicant info to applicant table 
    const applicantData = await createData('Applicant', applicantInput); 

    //post educ background info 
    educBackgroundInput.forEach(async (input) =>{
        let schoolID; 
        if(input.school.hasOwnProperty('newSchool')){
            console.log(true); 
            const newSchool = input.school.newSchool; 
            const schoolRecord = {
                School_Name: newSchool.name, 
                School_Location: newSchool.location,
                School_Type: newSchool.type
            }
            console.log(schoolRecord); 
            const schoolData = await createData('School', schoolRecord); 
            console.log(schoolData); 
            schoolID = schoolData; 
            
        } else {
            console.log(false); 
            schoolID = input.school.schoolID;
            console.log(schoolID); 
        }
        
        const backgroundRecord = {
            ApplicantID: applicantInput.ApplicantID,
            SchoolID: schoolID, 
            Level: input.level, 
            Inclusive_Years: input.inclusiveYears, 
            Honors: input.honors, 
        }

        const backgroundData = await createData('Educ_Background', backgroundRecord)
    })

    // post family info 
    familyInput.forEach(async(input) => {
        console.log(applicantInput.ApplicantID); 
        const familyRecord = {
            ApplicantID: applicantInput.ApplicantID,
            Guardian_Name: input.name,
            Relation_Type: input.relationType,
            Occupation: input.occupation,
            Monthly_Income: input.monthlyIncome
        }
        const familyData = await createData('Family', familyRecord)
    })

    createPopup('New record created', 'success')
    displayTable(currentTable); 
} catch (err){
    createPopup('Invalid inputs!', 'error');
}
}

function getApplicantInput(totalMonthlyIncome) {
    const inputs = {
        ApplicantID: document.getElementById('id-number').value,
        Applicant_Name: document.getElementById('applicant-name').value,
        GWA: parseFloat(document.getElementById('gwa').value),
        Gender: document.querySelector('input[name="Gender"]:checked').value,
        Age: document.getElementById('age').value,
        Date_of_Birth: document.getElementById('date-birth').value,
        Civil_Stat: document.querySelector('input[name="Civil_Stat"]:checked').value,
        Religion: document.getElementById('religion').value,
        Address: document.getElementById('address').value,
        Place_Birth: document.getElementById('place-birth').value,
        Mobile_No: parseInt(document.getElementById('mobile-number').value),
        Email_Ad: document.getElementById('e-mail').value,
        Current_Level: document.querySelector('input[name="Current_Level"]:checked').value,
        Course: document.getElementById('course').value === '' ? null : document.getElementById('course').value,
        Expected_Date_Grad: document.getElementById('expect-grad').value === '' ? null : parseInt(document.getElementById('expect-grad').value),
        Mode_of_Receipt: document.querySelector('input[name="Mode_of_Receipt"]:checked').value,
        Cash_Card_No: document.getElementById('cash-card').value === '' ? null : parseInt(document.getElementById('cash-card').value),
        Combined_Monthly_Income: totalMonthlyIncome
    };
    return inputs; 
}; 

function getFamilyInput(){
    const sections = document.querySelectorAll('fieldset#family-information > div');
    let guardianData = [];

    sections.forEach(section => {
        const nameInput = section.querySelector('input[name$="Name"]');
        const name = nameInput ? nameInput.value.trim() : '';

        const relationTypeSelect = section.querySelector('select[name$="Relation_Type"]');
        const relationType = relationTypeSelect ? relationTypeSelect.value : '';

        const occupationInput = section.querySelector('input[name$="Occupation"]');
        const occupation = occupationInput ? occupationInput.value.trim() : '';

        const monthlyIncomeInput = section.querySelector('input[name$="Monthly_Income"]');
        const monthlyIncome = monthlyIncomeInput ? parseFloat(monthlyIncomeInput.value.trim()) : NaN;

        if (name !== '') {
            guardianData.push({
                name: name,
                relationType: relationType,
                occupation: occupation,
                monthlyIncome: monthlyIncome
            });
        }
    });

    return guardianData;
}

function getEducBackgroundInput() {
    const educationSections = document.querySelectorAll('#education-container .education-section');
    let educationalData = [];

    educationSections.forEach((section, index) => {
        const schoolSelect = section.querySelector('select[name="School"]');
        const selectedSchoolOption = schoolSelect.options[schoolSelect.selectedIndex];
        const schoolID = selectedSchoolOption.value === 'none' ? null : selectedSchoolOption.value;

        let schoolData = {};
        if (schoolID) {
            schoolData.schoolID = schoolID;
        } else {
            const newSchoolNameInput = section.querySelector('input[name="School_Name"]');
            const newSchoolLocationInput = section.querySelector('input[name="School_Location"]');
            const newSchoolTypeSelect = section.querySelector('select[name="Relation_Type"]');
            
            const name = newSchoolNameInput.value.trim();
            const location = newSchoolLocationInput.value.trim();
            const type = newSchoolTypeSelect.value;

            if (name && location && type) {
                schoolData.newSchool = {
                    name: name,
                    location: location,
                    type: type
                };
            }
        }

        if (Object.keys(schoolData).length > 0) {
            const levelRadios = section.querySelectorAll('input[name^="Level"]');
            let level = '';
            levelRadios.forEach(radio => {
                if (radio.checked) {
                    level = radio.value;
                }
            });

            const inclusiveYearsInput = section.querySelector('input[name="Inclusive_Years"]');
            const honorsInput = section.querySelector('input[name="Honors"]');

            educationalData.push({
                school: schoolData,
                level: level,
                inclusiveYears: inclusiveYearsInput.value.trim(),
                honors: honorsInput.value.trim()
            });
        }
    });

    return educationalData;
}

async function adjustCombinedIncome(applicantID, oldIncome, newIncome){
    //get original income 
    const recordData = await getRecord('Applicant', applicantID); 
    let income = recordData[0].Combined_Monthly_Income - parseInt(oldIncome); 
    let updatedIncome = income + parseInt(newIncome); 

    //update combined income
    updateData('Applicant', [{key: 'ApplicantID', value: applicantID}], [{key: 'Combined_Monthly_Income', value: updatedIncome}]); 
}


const openModalButtons = document.querySelectorAll('[data-modal-target]')
const closeModalButtons = document.querySelectorAll('[data-close-button]')
const overlay = document.getElementById('overlay')

// payroll condition
const modeReceipt = document.getElementById('mode-receipt');
const payroll = document.querySelector('#payroll');
const cashCard= document.querySelector('#cash-card');
const cashCardCont = document.querySelector('#cash-card-cont');

modeReceipt.addEventListener('change', () => {
    toggleCashCard(); 
 })
payroll.addEventListener('change', () => {
    toggleCashCard(); 
})

function toggleCashCard(){
    if(payroll.checked){
        cashCardCont.classList.add('hide-node'); 
        cashCard.value = null; 
    } else {
        cashCardCont.classList.remove('hide-node')
    }
}

// existing schools dropdown 
const schoolSelect = document.getElementById('school-select'); 
setSchoolData(); 
async function setSchoolData(){
    const data = await getData('School'); 
    data.forEach((record) => {
        const option = document.createElement('option');
        option.value = `${record.SchoolID}`; 
        option.textContent = `${record.School_Name} - ${record.School_Location}`;
        schoolSelect.appendChild(option);
    })
    
}

openModalButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = document.querySelector(button.dataset.modalTarget)
    openModal(modal)
  })
})

overlay.addEventListener('click', () => {
  const modals = document.querySelectorAll('.modal.active')
  modals.forEach(modal => {
    closeModal(modal)
  })
})

closeModalButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = button.closest('.modal')
    closeModal(modal)
  })
})

function openModal(modal) {
  if (modal == null) return
  modal.classList.add('active')
  overlay.classList.add('active')
}

function closeModal(modal) {
  if (modal == null) return
  modal.classList.remove('active')
  overlay.classList.remove('active')
}

function addEducBackground(){
    let sectionCount = 1;
    const educationContainer = document.querySelector('#education-container')
    const educationSection = document.querySelector('.education-section');
    const deleteBtn = document.createElement('button'); 

    const newSection = educationSection.cloneNode(true);
    deleteBtn.textContent = 'Delete';
    deleteBtn.className ='remove-education-button'
    deleteBtn.addEventListener('click', () => {
        educationContainer.removeChild(newSection);
    });
    newSection.append(deleteBtn); 
    const inputs = newSection.querySelectorAll('input');
    inputs.forEach(input => {
      const idParts = input.id.split('-');
      input.id = `${idParts[0]}-${sectionCount}`;
      input.value = '';
    });
    const selects = newSection.querySelectorAll('select');
    selects.forEach(select => {
      const idParts = select.id.split('-');
      select.id = `${idParts[0]}-${sectionCount}`;
      select.selectedIndex = 0;
    });
    const radioButtons = newSection.querySelectorAll('input[type=radio]');
    radioButtons.forEach(radio => {
      radio.name = `Level-${sectionCount}`;
    });
    sectionCount++;
    document.getElementById('education-container').appendChild(newSection);
}; 



// testing
function fillFormWithDummyData() {
    // Dummy data object
    const dummyData = {
        ID_Num: "1234567890",
        Applicant_Name: "John Doe",
        GWA: "3.75",
        Gender: "Male",
        Age: "25",
        Date_of_Birth: "1999-05-15",
        Civil_Stat: "Single",
        Religion: "Christian",
        Address: "123 Main St, City",
        Place_Birth: "City, Country",
        "Mobile-No": "1234567890",
        Email_Ad: "john.doe@example.com",
        Current_Level: "Tertiary",
        Course: "BSCS",
        Expect_Date_Grad: "2025",
        Mode_of_Receipt: "Cash-Card",
        Cash_Card_No: "9876543210",
        Father_Name: "Michael Doe",
        Relation_Type: "Father",
        Occupation: "Teacher",
        Monthly_Income: "30000",
        School_Name: "Sample School",
        School_Location: "City, Country",
        Inclusive_Years: "2010-2014",
        Honors: "With Honors"
    };

    // Set values for each input field based on dummyData
    document.getElementById('id-number').value = dummyData.ID_Num;
    document.getElementById('applicant-name').value = dummyData.Applicant_Name;
    document.getElementById('gwa').value = dummyData.GWA;
    document.getElementById(dummyData.Gender.toLowerCase()).checked = true;
    document.getElementById('age').value = dummyData.Age;
    document.getElementById('date-birth').value = dummyData.Date_of_Birth;
    document.getElementById(dummyData.Civil_Stat.toLowerCase()).checked = true;
    document.getElementById('religion').value = dummyData.Religion;
    document.getElementById('address').value = dummyData.Address;
    document.getElementById('place-birth').value = dummyData.Place_Birth;
    document.getElementById('mobile-number').value = dummyData["Mobile-No"];
    document.getElementById('e-mail').value = dummyData.Email_Ad;
    document.getElementById('course').value = dummyData.Course;
    document.getElementById('expect-grad').value = dummyData.Expect_Date_Grad;
    document.getElementById(dummyData.Mode_of_Receipt.toLowerCase()).checked = true;
    document.getElementById('cash-card').value = dummyData.Cash_Card_No;
    
    // Family Information
    document.getElementById('father-name').value = dummyData.Father_Name;
    document.querySelector('select[name="Relation_Type"]').value = dummyData.Relation_Type;
    document.getElementById('father-occupation').value = dummyData.Occupation;
    document.getElementById('father-income').value = dummyData.Monthly_Income;

    // Educational Background
    document.querySelector('select[name="School"]').value = "none";
    document.getElementById('school-name-0').value = dummyData.School_Name;
    document.getElementById('school-location-0').value = dummyData.School_Location;
    document.getElementById('inclusive-years-0').value = dummyData.Inclusive_Years;
    document.getElementById('honors-0').value = dummyData.Honors;
}

function createPopup(message, type) {
    const popup = document.createElement('div');
    if(type == 'success'){
        popup.classList.add('success-popup');
    } 
    if(type == 'error'){
        popup.classList.add('error-popup');
    }

    popup.textContent = message;

    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 4000);
}

function deleteConfirm(currentTable, keys){
    console.log(1);
    const popup = document.createElement('div');
    popup.className = 'error-popup'
    const confirmButton = document.createElement('button'); 
    const cancelButton = document.createElement('button'); 

    confirmButton.textContent = 'Delete'
    cancelButton.textContent = 'Cancel'

    cancelButton.addEventListener('click', () => {
        document.body.removeChild(popup); 
    });

    confirmButton.addEventListener('click', async() => {
        const status = await deleteData(currentTable, keys);
        document.body.removeChild(popup); 

        if(status){
            displayTable(currentTable);    
            createPopup('Record and dependent records deleted', 'error')
        }
    });

    const btnCont = document.createElement('div');
    btnCont.appendChild(confirmButton);
    btnCont.appendChild(cancelButton);
    
    popup.textContent = 'Are you sure you want to delete this record?';

    popup.appendChild(btnCont);
    document.body.appendChild(popup);

}