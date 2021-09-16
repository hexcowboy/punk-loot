# Loot Oracle Smart Contracts

## Deployments

### Addresses

| Network | Contract Type | Address                                    | ABI                               |
| ------- | ------------- | ------------------------------------------ | --------------------------------- |
| Rinkeby | Oracle        | 0x0eB0b9B6b9dc2572CD380f486fE1A7b353b97d16 | [🔗](build/contracts/Oracle.json) |
| Rinkeby | Loot          | 0xa65fd1c92C9266bF0e5C838f206B083497acFEf2 | [🔗](build/contracts/Loot.json)   |

| Network | Contract Type | Address | ABI                               |
| ------- | ------------- | ------- | --------------------------------- |
| Mainnet | Oracle        | xxx     | [🔗](build/contracts/Oracle.json) |
| Mainnet | Loot          | xxx     | [🔗](build/contracts/Loot.json)   |

### Reference Addresses

| Network | Contract          | Address                                    | ABI                                          |
| ------- | ----------------- | ------------------------------------------ | -------------------------------------------- |
| Rinkeby | CryptoPunksMarket | 0x999426cb37bb8Ea786d3E24F6094004fad686f70 | [🔗](build/contracts/CryptoPunksMarket.json) |
| Rinkeby | WrappedPunk       | 0xb553B83d41D224Ef830aE9467E2F6DB612813081 | [🔗](build/contracts/WrappedPunk.json)       |

| Network | Contract          | Address                                    | ABI                                          |
| ------- | ----------------- | ------------------------------------------ | -------------------------------------------- |
| Mainnet | CryptoPunksMarket | 0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB | [🔗](build/contracts/CryptoPunksMarket.json) |
| Mainnet | WrappedPunk       | 0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6 | [🔗](build/contracts/WrappedPunk.json)       |

## Setup

Requirements:

- Python 3.7+
- Ganache CLI

In this directory, activate and set up the virutal environment:

```bash
# Create the virtual environment
python3 -m venv venv

# Activate the virtual environtment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Testing

Follow the setup instructions above and make sure you have Ganache CLI installed on your machine.

### Tests

Runs logical test specs on the smart contracts.

```bash
brownie test -s
```

### Deployment

Deploy the contract either to the Ethereum Mainnet or Rinkeby test network. Create a `.env` file in this folder with the following contents:

```bash
PRIVATE_KEY=93de44...
WEB3_INFURA_PROJECT_ID=0b008...
ETHERSCAN_TOKEN=DKDWAH...
```

The private key will be your Ethereum private key that contains enough ether to deploy the contract (use https://faucet.rinkeby.io/ to get Rinkeby ether for free).

The Web3 Infura Project ID can be obtained by making a free account at https://infura.io/ and creating a new project. _Note that this ID changes based on which network you select; Mainnet or Rinkeby_.

The Etherscan token can be obtained by creating a free account at https://etherscan.io/register and will appear in your account at https://etherscan.io/myapikey .

Once your `.env` file is set up with all the required keys, you can use `brownie` to deploy the contract.

```
# Mainnet deployment
brownie run scripts/deploy.py --network mainnet

# Rinkeby deployment
brownie run scripts/deploy.py --network rinkeby
```

To view details of the contract, visit either https://etherscan.io/ for Mainnet contracts or https://rinkeby.etherscan.io/ for Testnet contracts and search for the contract address output by brownie.
