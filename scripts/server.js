//Setting up connection to payments.js
var io = require('socket.io').listen(80); // initiate socket.io server

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' }); // Send data to client

  // wait for the event raised by the client
  socket.on('my other event', function (data) {  
    console.log(data);
  });
});

//Prints part of the spreadsheet value for testing
function peekSpreadsheet() {
    const {google} = require('googleapis');
    const auth = google.auth.getClient();
    const sheets = google.sheets({version : 'v4', auth});
    sheets.spreadsheets.values.get({
      spreadsheetId : process.env.SPREADSHEET_ID,
      range : 'Sheet1!A1:B2',
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