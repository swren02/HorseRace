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
    const sheets = google.sheets('v4');

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

function placeBetSpreadsheet(address, betAmount, betToken) {
  console.log("In placeBetSpreadsheet");
  const {google} = require('googleapis');
  const sheets = google.sheets('v4');

  sheets.spreadsheets.values.append({
    spreadsheetId : process.env.SPREADSHEET_ID,
    range : "Sheet1!A1:C1",
    valueInputOption : "USER_ENTERED",
    resource: {
      "majorDimension": "ROWS",
      "range": "Sheet1!A1:C1",
      "values": [
        [
          address,
          betAmount,
          betToken
        ]
      ]
    },
    key : process.env.API_KEY,
  });
}

//Start smart contract using data in sheets to payout people
function payout() {
  //Initiate smart contract
  //Maybe think about saving a local copy of the sheet before clearing it
  clearSpreadsheet();
  return;
}

//Clears the spreadsheet to get ready for the next round of betting
function clearSpreadsheet() {
  console.log("In clearSpreadsheet");
  const {google} = require('googleapis');
  const sheets = google.sheets('v4');

  sheets.spreadsheets.values.clear({
    spreadsheetId : process.env.SPREADSHEET_ID,
    range : "Sheet1!A3:C",
    resource : {},
    key : process.env.API_KEY
  });
}

function calculateOdds() {
  //Get data from spread sheet
  //Calculate odds
  //Display odds
}

