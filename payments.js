//const { GoogleApis } = require("googleapis");
//const { sheets } = require("googleapis/build/src/apis/sheets");
//import { google } from 'googleapis';

const circleSandboxApiKey = "QVBJX0tFWTo5Y2MzMmM4MDczOWE0MTVkYmU1MmI1ODc5ZDQwMDM4NTo3YzFlMGE5Yjk0NTJiZDc3YmUxMmQ5ZmRkYzU0ZjM2ZA==";

const ethereumButton = document.querySelector('.enableEthereumButton');
const sendEthButton = document.querySelector('.sendEthButton');

let accounts = [];

//var socket = io();

ethereumButton.addEventListener('click', () => {
    //Will Start the metamask extension
    accounts[0] = ethereum.request({ method: 'eth_requestAccounts' });
    console.log(accounts[0]);

    //Making sure spreadsheet implementation is working
    console.log("updating spreadsheet");
    socket.emit('peekSpreadsheet', 'Sheet1!A1:B2');
});

//Sending Ethereum to an address
sendEthButton.addEventListener('click', () => {
    const value = '0x29a2241af62c0000'
    const address = ethereum.selectedAddress;

    ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: accounts[0],
            to: '0xA20c3Be74ddEFf2c37111dA52498d83B71d6D12A',
            value: '0x29a2241af62c0000',
            gasPrice: '0x09184e72a000',
            gas: '0x2710',
          },
        ],
      })
      .then((txHash) => console.log(txHash))
      .catch((error) => console.error);
    
    //Change address in spreadsheet to match their new balance, add address if it doesn't exist
  });