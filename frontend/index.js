// import ethers from browser
import { ethers } from "./ethers-v5.4.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    document.getElementById("connectButton").innerHTML = "Connected";
    console.log("Connected");
  } else {
    alert("Please! install Metamask on your browser");
  }
}

// fund function
async function fund() {
  const ethAmount = document.getElementById("fund").value;
  console.log(`Funding with ${ethAmount}`);
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });

      //listen tx is mine
      await ListenForTransactionMine(transactionResponse, provider);
      console.log("done!");
    } catch (err) {
      console.log(err);
    }
  }
}

function ListenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}..`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(`Balance : ${ethers.utils.formatEther(balance)}`);
  }
}

async function withdraw() {
  if (typeof window.ethereum != "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    console.log("withdrawing ...");
    try {
      const transactionResponse = await contract.withdraw();
      await ListenForTransactionMine(transactionResponse, provider);
    } catch (err) {
      console.log(err);
    }
    console.log("Withdraw completed!");
  }
}
