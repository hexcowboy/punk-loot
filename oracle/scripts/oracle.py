import json
import logging
import sys
import time
from pathlib import Path
from signal import SIGINT, signal
from sys import exit

from brownie import Loot, Oracle, accounts, config, network
from brownie.network.contract import ContractContainer
from brownie.network.gas.strategies import GasNowStrategy
from dotenv import dotenv_values
from rich import print
from rich.logging import RichHandler
from tinydb import Query, TinyDB
from web3 import Web3
from web3.auto import w3
from web3.contract import Contract as Web3Contract

from .tools.events import fetch_events
from .tools.networks import Network, networks
from .tools.traits import ITEMS

dotenv = dotenv_values()
with open(Path(__file__).parent / "tools" / "punks.json") as file:
    punks = json.load(file)


class OracleListener:
    def __init__(self, polling_interval: int, web3: Web3):
        self.web3 = web3

        # Load the contracts from Web3
        self.oracle: Web3Contract = self.load_contract(web3, Oracle)
        self.loot: Web3Contract = self.load_contract(web3, Loot)

        # The oracle operator account
        self.operator = accounts.add(config["wallets"]["from_key"])
        # Read events from the blockchain and syncrhonize with the local database
        self.synchronize(self.oracle)

        # Start the event loop
        self.event_loop(polling_interval)

    def submit_transaction(self, event):
        """
        Checks the database to see if a transaction has already been fulfilled.
        If not, it mints new Loot to the sender address.
        """
        punk_id = event["args"]["id"]

        db = TinyDB(Path(__file__).parent / f"database-{network.show_active()}.json")
        punk = Query()

        if not db.search(punk.id == punk_id):
            # Address that send the NFT (and will receive loot)
            sender = event["args"]["from"]

            items = [ITEMS[item] for item in punks[punk_id]]
            items_str = ", ".join(items)
            logging.info(f"Minting {items_str} to {sender}")

            # Build a transaction with standard gas calculation
            gas_price = GasNowStrategy("standard").get_gas_price()
            transaction = self.loot.functions.mintBatch(
                sender, punks[punk_id], [1] * len(punks[punk_id]), ""
            ).buildTransaction(
                {
                    "nonce": self.get_nonce(),
                    "from": self.operator.address,
                    "gasPrice": gas_price,
                }
            )
            gas_total = w3.fromWei(gas_price * transaction["gas"], "ether")
            logging.debug(f"Calculated gas price: {gas_total} ETH")

            signed_tx = self.web3.eth.account.signTransaction(
                transaction, dotenv["PRIVATE_KEY"]
            )
            sent_transaction = self.web3.eth.sendRawTransaction(
                signed_tx.rawTransaction
            )
            logging.info(w3.toHex(sent_transaction))
            db.insert({"id": punk_id, "tx": w3.toHex(sent_transaction)})

    def get_nonce(self) -> int:
        block_nonce = self.web3.eth.get_transaction_count(self.operator.address)
        try:
            while block_nonce in self.nonces_used:
                block_nonce += 1
        except:
            self.nonces_used = list()

        self.nonces_used.append(block_nonce)
        return block_nonce

    def handle_receive(self, event):
        event_name = event["event"]
        event_arguments = " ".join(
            [f"{key}: {value}" for key, value in event["args"].items()]
        )
        logging.info(f"[{event_name}] {event_arguments}")

        if event_name == "CryptoPunkReceived":
            self.submit_transaction(event)

    def synchronize(self, contract: Web3Contract):
        """Read the blockchain for all events since the from_block and submit them"""
        for event in fetch_events(
            contract.events.CryptoPunkReceived, from_block=9000000
        ):
            self.submit_transaction(event)

    def load_contract(self, web3: Web3, contract: ContractContainer):
        """Given a Brownie contract, return a Web3 contract"""
        address = contract[-1].address
        abi = contract.abi
        name = f"{contract.get_verification_info()['contract_name']}"
        logging.info(f"Using {name} at {address}")
        return web3.eth.contract(address=address, abi=abi)

    def event_loop(self, poll_interval):
        """The main loop that checks for new blockchain events based on the filters"""
        # Create a filter base on 'CryptoPunkReceived' events
        filters = [
            self.oracle.events.CryptoPunkReceived.createFilter(fromBlock="latest"),
            self.loot.events.TransferBatch.createFilter(fromBlock="latest"),
        ]

        while True:
            for filter in filters:
                for entry in filter.get_new_entries():
                    self.handle_receive(entry)
            time.sleep(poll_interval)


def handle_exit(signal, frame):
    """Handles a SIGINT signal"""
    sys.stdout.write("\b\b\r")
    logging.info("Stopping oracle")
    exit(0)


def get_infura_url(network: Network):
    try:
        return networks[network]["infura_url"]
    except KeyError:
        print(f"Network not supported: {network}")
        exit(1)


def main(log_level: str = "INFO"):
    # Set up logging
    logging.basicConfig(
        level=log_level, format="%(message)s", datefmt="[%X]", handlers=[RichHandler()]
    )

    # Tell Python how to handle SIGINT
    signal(SIGINT, handle_exit)
    logging.info("Running Oracle. Press CTRL-C to exit.")

    # Start the Oracle
    web3: Web3 = Web3(Web3.HTTPProvider(get_infura_url(network.show_active())))
    oracle: OracleListener = OracleListener(2, web3)
