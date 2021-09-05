# Loot Oracle

To run the oracle, write some environment variables to a file called `.env` in the current directory:

```
INFURA_KEY=XXX
```

## Running

You can edit the networks you wish to listen on by editing the `networks.py` file and adding any contract addresses.

Once you're ready, run the oracle with the following command:

```bash
python oracle.py --network mainnet
```
