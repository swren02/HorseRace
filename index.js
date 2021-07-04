require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const https = require("https");

app.get('/', (req, res) => {
  https
  .get("https://api.covalenthq.com/v1/pricing/tickers/?tickers=ETH,BTC,LINK&key=ckey_fe4422917d3c488daaa97b1fab4", resp => {
    let data = "";

    // A chunk of data has been recieved.
    resp.on("data", chunk => {
      data += chunk;
    });

    // The whole response has been received. Print out the result. ETH, BTC, LINK, the strange ordering is a covalent bug.
    resp.on("end", () => {
      let priceDataETH = JSON.parse(data).data.items[0].quote_rate;
      let priceDataBTC = JSON.parse(data).data.items[2].quote_rate;
      let priceDataLINK = JSON.parse(data).data.items[1].quote_rate;
      console.log(priceDataETH);
      console.log(priceDataBTC);
      console.log(priceDataLINK);
      });
    })
  .on("error", err => {
    console.log("Error: " + err.message);
  });

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
async function peekSpreadsheet(range) {
    console.log("In peekSpreadsheet");
    const {google} = require('googleapis');

    const auth = await google.auth.getClient({scopes : ['https://www.googleapis.com/auth/spreadsheets']});
    const sheets = google.sheets({version : 'v4', auth : auth});


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

async function placeBetSpreadsheet(address, betAmount, betToken) {
  console.log("In placeBetSpreadsheet");
  const {google} = require('googleapis');

  const auth = await google.auth.getClient({scopes : ['https://www.googleapis.com/auth/spreadsheets']});
  const sheets = google.sheets({version : 'v4', auth : auth});

  console.log("Making request");
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
    //key : process.env.API_KEY,
  });

  console.log("request done");
}

//Start smart contract using data in sheets to payout people
function payout() {
  //Initiate smart contract
  //Maybe think about saving a local copy of the sheet before clearing it
  clearSpreadsheet();
  return;
}

//Clears the spreadsheet to get ready for the next round of betting
async function clearSpreadsheet() {
  console.log("In clearSpreadsheet");
  const {google} = require('googleapis');
  
  const auth = await google.auth.getClient({scopes : ['https://www.googleapis.com/auth/spreadsheets']});
  const sheets = google.sheets({version : 'v4', auth : auth});


  sheets.spreadsheets.values.clear({
    spreadsheetId : process.env.SPREADSHEET_ID,
    range : "Sheet1!A3:C",
    resource : {},
  });
}

function calculateOdds() {
  //Get data from spread sheet
  //Calculate odds
  //Display odds
}

clearSpreadsheet();
