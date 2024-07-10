const express = require('express')
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const { validate } = require('./validateInput');

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
app.get('/query', (req, res) => {
  const sqlQuery = `${req.body.sqlQuery}`; 
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
  const recordID = parseInt(req.params.recordID); 
  const sqlQuery = `SELECT * FROM ?? WHERE ?? = ?`;

  const values = [table, table + 'ID', recordID]; 
  getQuery(sqlQuery, values, res); 
});

//create new record in a table
app.post('/:table', (req, res) => {
  const table = req.params.table; 
  const record = req.body.record; 
  console.log(record);
  // if (!validate(record, `${table}`, 1)){ 
  //   console.log(record); 
  //   return res.status(500); 
  // }
  const temp = Object.keys(record).map(() => '?').join(',');
  const sqlQuery = `INSERT INTO ?? VALUES (${temp})`
  const values = [table, ...Object.values(record)];
  
  db.query(sqlQuery, values, (err, results) => {
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
  if (!validate(record, `${table}`, 0)){ 
    console.log('Invalid Data'); 
    return res.status(500); 
  }

  const temp = Object.keys(record).map(key => `${key} = ?`).join(', ');
  const sqlQuery = `UPDATE ?? SET ${temp} WHERE ?? = ?`;
  const values = [table, ...Object.values(record), `${table}ID`, recordID];

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
  const sqlQuery = `DELETE FROM ?? WHERE ?? = ?`; 
  const values = [table, `${table}ID`, recordID]
  db.query(sqlQuery, values, (err, results) => {
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

