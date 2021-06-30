require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get('/scripts/payments.js', function (req, res) {
  res.sendFile(__dirname + "/scripts/payments.js");
});

io.on('connection', (socket) => {
    socket.on('peekSpreadsheet', (range) => {
      peekSpreadsheet(range);
    });
  });

server.listen(3000, () => {
  console.log('listening on *:3000');
});

//Prints part of the spreadsheet value for testing
function peekSpreadsheet(range) {
    console.log("In peekSpreadsheet");
    const {google} = require('googleapis');
    /*google.load("client:auth2", function() {
      google.auth2.init({client_id: process.env.GOOGLE_APPLICATION_CREDENTIALS.client_id});
    });*/

    //const auth = google.auth.getClient({ scopes : ['https://www.googleapis.com/auth/spreadsheets.readonly']});
    const sheets = google.sheets('v4');
    console.log(process.env.SPREADSHEET_ID);
    console.log("test3");
    sheets.spreadsheets.values.get({
      spreadsheetId : process.env.SPREADSHEET_ID,
      range : range,
      key : process.env.API_KEY,
    }, (err, result) => {
      if (err) {
        // Handle error
        console.log(err);
      } else {
        const numRows = result.values ? result.values.length : 0;
        console.log(`${numRows} rows retrieved.`);
      }
    });
  }