const express = require('express')
const mysql = require('mysql2');
const bodyParser = require('body-parser');
require('dotenv').config({path: '../.env'});

const app = express()
const port = 3000

app.use(bodyParser.json());

//create .env file outside of this directory and input database values
//ex. DB_HOST=hostname
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_DATABASE
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

//query function for get requests
function getQuery(sqlQuery, res){
  db.query(sqlQuery, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
};

//get results from a custom query 
app.get('/query', (req, res) => {
  const sqlQuery = req.body.sqlQuery; 
  if(!sqlQuery) return res.status(400).send('Empty Query'); 
  getQuery(sqlQuery, res); 
})

//get table data
app.get('/:table', (req, res) => {
  const table = req.params.table; 
  const sqlQuery = `SELECT * FROM ${table}`;
  getQuery(sqlQuery, res); 
});

//get record from table 
app.get('/:table/:recordID', (req, res) => {
  const table = req.params.table; 
  const recordID = req.params.recordID; 
  const sqlQuery = `SELECT * FROM ${table} WHERE ${table + 'ID'}=${recordID}`
  getQuery(sqlQuery, res); 
});

//create new record in a table
app.post('/:table', (req, res) => {
  const table = req.params.table; 
  const record = req.body.record; 
 
  const temp = record.map(() => '?').join(','); 
  const sqlQuery = `INSERT INTO ${table} VALUES (${temp})`

  db.query(sqlQuery, record, (err, results) => {
    if(err){
      return res.status(500).send(err);
    }
    res.json('Inserted');
  })
}); 

//update record in a table
app.put('/:table/:recordID', (req, res) => {
  const table = req.params.table; 
  const recordID = req.params.recordID;
  const record = req.body.record; 

  const temp = Object.keys(record).map(key => `${key} = ?`).join(', ');
  const sqlQuery = `UPDATE ${table} SET ${temp} WHERE ${table}ID = ?`;
  const values = [...Object.values(record), recordID];

  db.query(sqlQuery, values, (err, results) => {
    if(err){
      return res.status(500).send(err);
    }
    res.json('Updated');
  })
});

//delete record in a table
app.delete('/:table/:recordID', (req, res) => {
  const table = req.params.table; 
  const recordID = parseInt(req.params.recordID);
  const sqlQuery = `DELETE FROM ${table} WHERE ${table + 'ID'} = ?`; 

  db.query(sqlQuery, recordID, (err, results) => {
    if(err){
      return res.status(500).send(err);
    } 
    if (this.changes === 0) {
      res.status(404).json({ error: 'Not found' })
    } else {
      res.json('Deleted')
    }
  })
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

