require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const https = require("https");

const Web3 = require('web3')
const axios = require('axios')
const EthereumTx = require('ethereumjs-tx')
const log = require('ololog').configure({ time: true })
const ansi = require('ansicolor').nice

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


    var result = sheets.spreadsheets.values.get({
      spreadsheetId : process.env.SPREADSHEET_ID,
      range : range,
      key : process.env.API_KEY,
    }, (err, result) => {
      if (err) {
        // Handle error
        console.log(err);
        return;
      } else {
        const numRows = result.values ? result.values.length : 0;
        console.log(`${numRows} rows retrieved.`);
      }
    });
    return result;
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

//This can use covalent too ig, return balance of USDT since that is the only currency we are accepting
function getBalance() {

}

//Start smart contract using data in sheets to payout people
//Not enough time for smart contract we're doing this old fashioned
//Use covalent to get winner
function payoutAll() {
  //Initiate smart contract
  var addresses = peekSpreadsheet("Sheet1!A3:C").values;
  var winner = getWinner();
  
  addresses.forEach(address => {
    if (address[2] == winner) {
      payout = calculatePayout();
      payoutAddress(address, payout);
    }
  })

  //Maybe think about saving a local copy of the sheet before clearing it
  clearSpreadsheet();
  return;
}

function payoutAddress(address, payout) {
  
  // Get private stuff from my .env file
  var my_privkey = process.env.PRIVATE_KEY;
  var infura_api_key = "SOMEONE SET THIS UP";

  // Need access to my path and file system
  import path from 'path'
  var fs = require('fs');

  // Ethereum javascript libraries needed
  import Web3 from 'Web3'
  var Tx = require('ethereumjs-tx');

  // Rather than using a local copy of geth, interact with the ethereum blockchain via infura.io
  const web3 = new Web3(Web3.givenProvider || `https://mainnet.infura.io/` + infura_api_key)

  // Create an async function so I can use the "await" keyword to wait for things to finish
  const main = async () => {
    // This code was written and tested using web3 version 1.0.0-beta.26
    console.log(`web3 version: ${web3.version}`);

    // Who holds the token now?
    var myAddress = process.env.WALLET_ADDRESS;

    // Who are we trying to send this token to?
    var destAddress = address;

    // If your token is divisible to 8 decimal places, 42 = 0.00000042 of your token
    var transferAmount = payout;

    // Determine the nonce
    var count = await web3.eth.getTransactionCount(myAddress);
    console.log(`num transactions so far: ${count}`);

    // This file is just JSON stolen from the contract page on etherscan.io under "Contract ABI"
    var abiArray = JSON.parse(fs.readFileSync(path.resolve(__dirname, './tt3.json'), 'utf-8'));

    // This is the address of the contract which created the ERC20 token
    var contractAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    var contract = new web3.eth.Contract(abiArray, contractAddress, { from: myAddress });

    // How many tokens do I have before sending?
    var balance = await contract.methods.balanceOf(myAddress).call();
    console.log(`Balance before send: ${balance}`);

    // I chose gas price and gas limit based on what ethereum wallet was recommending for a similar transaction. You may need to change the gas price!
    var rawTransaction = {
        "from": myAddress,
        "nonce": "0x" + count.toString(16),
        "gasPrice": "0x003B9ACA00",
        "gasLimit": "0x250CA",
        "to": contractAddress,
        "value": "0x0",
        "data": contract.methods.transfer(destAddress, transferAmount).encodeABI(),
        "chainId": 0x03 //CHANGE THIS FOR TESTING, FOR DEPLOYMENT USE 0x01
    };

    // Example private key (do not use): 'e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109'
    // The private key must be for myAddress
    var privKey = new Buffer(my_privkey, 'hex');
    var tx = new Tx(rawTransaction);
    tx.sign(privKey);
    var serializedTx = tx.serialize();

    // Comment out these three lines if you don't really want to send the TX right now
    console.log(`Attempting to send signed tx:  ${serializedTx.toString('hex')}`);
    var receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    console.log(`Receipt info:  ${JSON.stringify(receipt, null, '\t')}`);

    // The balance may not be updated yet, but let's check
    balance = await contract.methods.balanceOf(myAddress).call();
    console.log(`Balance after send: ${balance}`);
  }

}

/**
 * Fetch the current transaction gas prices from https://ethgasstation.info/
 * 
 * @return {object} Gas prices at different priorities
 */
 const getCurrentGasPrices = async () => {
  let response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json')
  let prices = {
    low: response.data.safeLow / 10,
    medium: response.data.average / 10,
    high: response.data.fast / 10
  }
 
  console.log("\r\n")
  log (`Current ETH Gas Prices (in GWEI):`.cyan)
  console.log("\r\n")
  log(`Low: ${prices.low} (transaction completes in < 30 minutes)`.green)
  log(`Standard: ${prices.medium} (transaction completes in < 5 minutes)`.yellow)
  log(`Fast: ${prices.high} (transaction completes in < 2 minutes)`.red)
  console.log("\r\n")
 
  return prices
}
