import asyncio
import json
import logging
import os
import sys
from pathlib import Path
from signal import SIGINT, signal
from sys import exit

from brownie import Loot, Oracle, accounts, config, network
from rich import print, print_json
from rich.logging import RichHandler
from web3 import Web3

from .tools.events import fetch_events
from .tools.networks import Network, networks
from .tools.traits import ITEMS, normalize_attribute

with open(Path(__file__).parent / "tools" / "punks.json") as file:
    punks = json.load(file)


def handle_event(event):
    # emit CryptoPunkReceived(tokenId, from);
    print_json(Web3.toJSON(event))
    punk_id = event["args"]["id"]
    sender = event["args"]["from"]
    logging.info(f"{event['event']} #{punk_id} from {sender}")

    operator = accounts.add(config["wallets"]["from_key"])
    loot_contract = Loot[-1]

    items = [ITEMS[item] for item in punks[punk_id]]
    items_str = ", ".join(items)
    logging.info(f"Minting {items_str}")

    # function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
    loot_contract.mintBatch(
        sender,
        punks[punk_id],
        [1] * len(punks[punk_id]),
        "",
        {"from": operator},
    )


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


async def event_loop(event_filter, poll_interval):
    while True:
        for entry in event_filter.get_new_entries():
            handle_event(entry)
            os.system("afplay /System/Library/Sounds/Hero.aiff")
        await asyncio.sleep(poll_interval)


def synchronize(contract):
    for event in fetch_events(contract.events.CryptoPunkReceived, from_block=9000000):
        logging.info(f"Loaded {Web3.toHex(event['transactionHash'])}")


def main(log_level: str = "INFO"):
    # Set up logging
    logging.basicConfig(
        level=log_level, format="%(message)s", datefmt="[%X]", handlers=[RichHandler()]
    )

    # Tell Python to run the handler() function when SIGINT is recieved
    signal(SIGINT, handle_exit)
    logging.info("Running Oracle. Press CTRL-C to exit.")

    # Connect to Ethereum with Web3
    current_network = network.show_active()
    web3 = Web3(Web3.HTTPProvider(get_infura_url(current_network)))
    logging.info(f"Current network: {current_network}")

    # Load the Oracle contract
    try:
        oracle_address = Oracle[-1].address
        oracle_abi = Oracle.abi
        contract = web3.eth.contract(address=oracle_address, abi=oracle_abi)
        contract_name = f"{Oracle=}".split("=")[0]
        logging.info(f"Using {contract_name} at {oracle_address}")
    except:
        logging.error("The Oracle contract could not be loaded")
        exit(1)

    try:
        Loot[-1]
    except:
        logging.error("The Loot contract could not be loaded")
        exit(1)

    # Read events from the blockchain and syncrhonize with the local database
    synchronize(contract)

    # Start the async loop
    loop = asyncio.get_event_loop()
    try:
        filter = contract.events.CryptoPunkReceived.createFilter(fromBlock="latest")
        loop.run_until_complete(asyncio.gather(event_loop(filter, 2)))
    finally:
        loop.close()
