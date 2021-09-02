# Instructions

## Deployments

### ABI

```json

```

### Addresses

| Network | Contract Type  | Address |
| ------- | -------------- | ------- |
| Rinkeby | Public Escrow  | xxx     |
| Rinkeby | Private Escrow | xxx     |

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

## Running

Follow the setup instructions above and make sure you have Ganache CLI installed on your machine.

### Tests

Runs logical test specs on the smart contracts.

```bash
brownie test -s
```

### Deployment

Deploy the contract either to the Ethereum Mainnet or Rinkeby test network. Create a `.env` file in this folder with the following contents:

```bash
export PRIVATE_KEY=93de44...
export WEB3_INFURA_PROJECT_ID=0b008...
export ETHERSCAN_TOKEN=DKDWAH...
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
