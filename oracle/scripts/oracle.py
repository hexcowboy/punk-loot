import json
import logging
import os
import sys
import time
from pathlib import Path
from signal import SIGINT, signal
from sys import exit

from brownie import Contract, Loot, Oracle, accounts, config, network
from brownie.network.contract import ContractContainer
from brownie.network.gas.strategies import GasNowStrategy
from dotenv import dotenv_values
from rich import print, print_json
from rich.logging import RichHandler
from web3 import Web3
from web3.auto import w3
from web3.contract import Contract as Web3Contract

from .tools.events import fetch_events
from .tools.networks import Network, networks
from .tools.traits import ITEMS

dotenv = dotenv_values()
with open(Path(__file__).parent / "tools" / "punks.json") as file:
    punks = json.load(file)


def handle_receive(event, web3: Web3, loot_contract: Loot):
    event_name = event["event"]
    event_arguments = " ".join(
        [f"{key}: {value}" for key, value in event["args"].items()]
    )
    logging.info(f"[{event_name}] {event_arguments}")

    if event_name == "CryptoPunkReceived":
        punk_id = event["args"]["id"]
        sender = event["args"]["from"]

        operator = accounts.add(config["wallets"]["from_key"])

        items = [ITEMS[item] for item in punks[punk_id]]
        items_str = ", ".join(items)
        logging.info(f"Minting {items_str}")

        gas_price = GasNowStrategy("standard").get_gas_price()
        transaction = loot_contract.functions.mintBatch(
            sender, punks[punk_id], [1] * len(punks[punk_id]), ""
        ).buildTransaction(
            {
                "nonce": web3.eth.get_transaction_count(operator.address),
                "from": operator.address,
                "gasPrice": gas_price,
            }
        )
        gas_total = w3.fromWei(gas_price * transaction["gas"], "ether")
        logging.info(f"Gas price: {gas_total} ETH")

        signed_tx = web3.eth.account.signTransaction(transaction, dotenv["PRIVATE_KEY"])
        sent_transaction = web3.eth.sendRawTransaction(signed_tx.rawTransaction)
        logging.info(w3.toHex(sent_transaction))


def handle_exit(signal, frame):
    sys.stdout.write("\b\b\r")
    logging.info("Stopping oracle")
    exit(0)


def get_infura_url(network: Network):
    try:
        return networks[network]["infura_url"]
    except KeyError:
        print(f"Network not supported: {network}")
        exit(1)


def synchronize(contract: Web3Contract):
    for event in fetch_events(contract.events.CryptoPunkReceived, from_block=9000000):
        logging.info(f"Loaded {w3.toHex(event['transactionHash'])}")


def load_contract(web3: Web3, contract: ContractContainer) -> Web3Contract:
    """Givent a Brownie contract, return a Web3 contract"""
    try:
        address = contract[-1].address
        abi = contract.abi
        name = f"{contract.get_verification_info()['contract_name']}"
        logging.info(f"Using {name} at {address}")
        return web3.eth.contract(address=address, abi=abi)
    except:
        logging.error(f"The contract could not be loaded: {contract=}")
        exit(1)


def event_loop(poll_interval):
    web3: Web3 = Web3(Web3.HTTPProvider(get_infura_url(network.show_active())))
    oracle: Web3Contract = load_contract(web3, Oracle)
    loot: Web3Contract = load_contract(web3, Loot)

    # Create a filter base on 'CryptoPunkReceived' events
    filters = [
        oracle.events.CryptoPunkReceived.createFilter(fromBlock="latest"),
        loot.events.TransferBatch.createFilter(fromBlock="latest"),
    ]

    # Read events from the blockchain and syncrhonize with the local database
    synchronize(oracle)

    while True:
        for filter in filters:
            for entry in filter.get_new_entries():
                handle_receive(entry, web3, loot)
                os.system("afplay /System/Library/Sounds/Hero.aiff")
        time.sleep(poll_interval)


def main(log_level: str = "INFO"):
    # Set up logging
    logging.basicConfig(
        level=log_level, format="%(message)s", datefmt="[%X]", handlers=[RichHandler()]
    )

    # Tell Python to run the handler() function when SIGINT is recieved
    signal(SIGINT, handle_exit)
    logging.info("Running Oracle. Press CTRL-C to exit.")

    # Start the async loop
    event_loop(2)
