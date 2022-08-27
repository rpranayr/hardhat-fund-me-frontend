import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    // metmask automatically injects window.ethereum object in the dom if installed.
    // if metmask is not installed window.ethereum is undefined (give no other wallets)
    if (typeof window.ethereum !== "undefined") {
        try {
            await ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
            console.log(error)
        }
        // metamask uses the ethereum.request() to wrap an RPC API which is based on an interface exposed by ethereum clients
        const accounts = await ethereum.request({ method: "eth_accounts" })
        connectButton.innerHTML = "Connected"
        console.log(accounts)
    } else {
        connectButton.innerHTML = "Please install MetaMask"
    }
}

async function getBalance() {
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value

    console.log(`Funding with ${ethAmount}`)
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        // We need a provider to connect to blockchain, signer/user with gas, contract we need to interact with (ABI & Address) -- We'll use ethers

        const signer = provider.getSigner()
        console.log(signer)

        const contract = new ethers.Contract(contractAddress, abi, signer)

        try {
            const txResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            // listen for this tx to finish
            await listenForTransactionMine(txResponse, provider)
            // listen for the fund() tx to be mined
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}..`)
    //return new Promise()
    // create a listener for the blockchain

    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (txReceipt) => {
            console.log(
                `Completed with ${txReceipt.confirmations} confirmations`
            )
            resolve()
        })
        // once a tx hash happens run the function in the send parameter
    })

    // js fires this provider.once thing and goes back to executing the next statement (line 46) so we want to tell js that wait for this event to finish and we do that using promises
}

async function withdraw() {
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        console.log(`Withdrawing..`)

        const contract = new ethers.Contract(contractAddress, abi, signer)

        try {
            const txResponse = await contract.withdraw()
            await listenForTransactionMine(txResponse, provider)
            console.log('Withdraw successful.')
        } catch (error) {
            console.log(error)
        }
    }
}
