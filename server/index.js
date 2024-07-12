const express = require('express')
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config({path: '../.env'});

const app = express()
const port = 3000

app.use(cors())
app.use(bodyParser.json());

//create .env file outside of this directory and input database values
//ex. DB_HOST=hostname
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_DATABASE,
  multipleStatements: false
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

//query function for get requests
function getQuery(sqlQuery, values, res){
  db.query(sqlQuery, values, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
};

//get results from a custom query 
app.post('/query', (req, res) => {
  const sqlQuery = `${req.body.sqlQuery}`; 
  console.log(req.body);
  if(!sqlQuery) return res.status(400).send('Empty Query'); 
  getQuery(sqlQuery, '', res); 
})

//get table data
app.get('/:table', (req, res) => {
  const table = req.params.table; 
  const sqlQuery = `SELECT * FROM ??`;
  getQuery(sqlQuery, table, res); 
});

//get record from table 
app.get('/:table/:recordID', (req, res) => {
  const table = req.params.table; 
  const recordID = req.params.recordID; 
  const sqlQuery = `SELECT * FROM ?? WHERE ?? = ?`;

  const values = [table, table + 'ID', recordID]; 
  getQuery(sqlQuery, values, res); 
});

//create new record in a table
app.post('/:table', (req, res) => {
  const table = req.params.table; 
  const record = req.body.record; 
  console.log(record);

  const columns = Object.keys(record);
  const placeholders = columns.map(() => '?').join(',');
  const sqlQuery = `INSERT INTO ${table} (${columns.join(',')}) VALUES (${placeholders})`;
  const values = Object.values(record);
  
  db.query(sqlQuery, values, (err, results) => {
    if (err) {
      console.error('Error executing SQL:', err);
      return res.status(500).json({ error: 'Database error', details: err });
    }

    if (table === 'School' && results.insertId) {
      res.json(results.insertId);
    } else {
      res.json('Inserted');
    }
  })
}); 

//update record in a table
app.put('/:table/:keyParts', (req, res) => {
  const table = req.params.table;
  const keyParts = req.params.keyParts.split('&');

//construct WHERE clause
  const whereClauseParts = keyParts.map(part => {
    const [colName, value] = part.split('=');
    return `${colName} = ?`;
  });
  const whereClause = whereClauseParts.join(' AND ');

  const records = req.body.record; 

  //set clause
  let values = [];
  const setClauses = records.map(record => {
    const columnName = record.key; // Assuming the key is the column name
    const columnValue = record.value;
    values.push(columnValue); // Push column value to values array
    return `${columnName} = ?`;
});

  const setClause = setClauses.join(', ');

  const whereValues = keyParts.map(part => part.split('=')[1]);
  values = [...values, ...whereValues];

  const sqlQuery = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
  console.log(sqlQuery); 
  db.query(sqlQuery, values, (err, results) => {
    if(err){
      console.log(err);
      return res.status(500).send(err);
    }
    res.json('Updated');
  })
});

//delete record in a table
app.delete('/:table/:keyParts', (req, res) => {
  const table = req.params.table; 
  const keyParts = req.params.keyParts.split('&');

  const whereClauseParts = keyParts.map(part => {
    const [colName, value] = part.split('=');
    return `${colName} = ?`;
  });
  const whereClause = whereClauseParts.join(' AND ');

  const values = [table, ...keyParts.map(part => part.split('=')[1])];
  console.log(whereClause);
  const sqlQuery = `DELETE FROM ?? WHERE ${whereClause}`; 
  console.log(sqlQuery);
  db.query(sqlQuery, values, (err, results) => {
    if(err){
      console.log(err);
      return res.status(500).send(err);
    } 
    if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Not found' })
    } else {
      res.json('Deleted')
    }
  })
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

