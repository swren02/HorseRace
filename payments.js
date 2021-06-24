const circleSandboxApiKey = "QVBJX0tFWTo5Y2MzMmM4MDczOWE0MTVkYmU1MmI1ODc5ZDQwMDM4NTo3YzFlMGE5Yjk0NTJiZDc3YmUxMmQ5ZmRkYzU0ZjM2ZA==";

const ethereumButton = document.querySelector('.enableEthereumButton');
const sendEthButton = document.querySelector('.sendEthButton');

let accounts = [];

ethereumButton.addEventListener('click', () => {
    //Will Start the metamask extension
    accounts[0] = ethereum.request({ method: 'eth_requestAccounts' });
    console.log(accounts[0]);
});

//Sending Ethereum to an address
sendEthButton.addEventListener('click', () => {
    ethereum
      .request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: accounts[0],
            to: '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
            value: '0x29a2241af62c0000',
            gasPrice: '0x09184e72a000',
            gas: '0x2710',
          },
        ],
      })
      .then((txHash) => console.log(txHash))
      .catch((error) => console.error);
  });