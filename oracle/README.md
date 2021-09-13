# Loot Oracle Smart Contracts

## Deployments

### Addresses

| Network | Contract Type | Address                                    | ABI                               |
| ------- | ------------- | ------------------------------------------ | --------------------------------- |
| Rinkeby | Oracle        | 0x60FD375CA5E16E2B57186183A922B04afe337491 | [🔗](build/contracts/Oracle.json) |
| Rinkeby | Loot          | 0xCA4768C43735c2dEbBb85b7cFb3922c4fC46E4fD | [🔗](build/contracts/Loot.json)   |

| Network | Contract Type | Address | ABI                               |
| ------- | ------------- | ------- | --------------------------------- |
| Mainnet | Oracle        | xxx     | [🔗](build/contracts/Oracle.json) |
| Mainnet | Loot          | xxx     | [🔗](build/contracts/Loot.json)   |

### Reference Addresses

| Network | Contract          | Address                                    | ABI                                          |
| ------- | ----------------- | ------------------------------------------ | -------------------------------------------- |
| Rinkeby | CryptoPunksMarket | 0x60CAf3714215DCF8B4C34750bdA7Ed7739Ccb614 | [🔗](build/contracts/CryptoPunksMarket.json) |
| Rinkeby | WrappedPunk       | 0xbc995601D953bE79e73Ab6cC8904D7C6742EbCcf | [🔗](build/contracts/WrappedPunk.json)       |

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
