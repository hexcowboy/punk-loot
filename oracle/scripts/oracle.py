import asyncio
import logging
import os
import sys
from signal import SIGINT, signal
from sys import exit

from brownie import CryptoPunksMarket, network
from rich import print, print_json
from rich.logging import RichHandler
from web3 import Web3

from .tools.networks import Network, networks


def handle_event(event):
    # log.info(f"Received event {event['name']}")
    print_json(Web3.toJSON(event))


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


async def log_loop(event_filter, poll_interval):
    while True:
        for entry in event_filter.get_new_entries():
            handle_event(entry)
            os.system("afplay /System/Library/Sounds/Hero.aiff")
        await asyncio.sleep(poll_interval)


def main(log_level: str = "INFO"):
    # Set up logging
    logging.basicConfig(
        level=log_level, format="%(message)s", datefmt="[%X]", handlers=[RichHandler()]
    )

    # Tell Python to run the handler() function when SIGINT is recieved
    signal(SIGINT, handle_exit)
    logging.info("Running Oracle. Press CTRL-C to exit.")

    current_network = network.show_active()
    web3 = Web3(Web3.HTTPProvider(get_infura_url(current_network)))
    logging.info(f"Current network: {current_network}")

    cryptopunks_address = str(CryptoPunksMarket[-1])
    cryptopunks_abi = CryptoPunksMarket.abi
    contract = web3.eth.contract(address=cryptopunks_address, abi=cryptopunks_abi)
    contract_name = f"{CryptoPunksMarket=}".split("=")[0]
    logging.info(
        f"Using most recently deployed {contract_name} at {cryptopunks_address}"
    )

    # Start the async loop
    loop = asyncio.get_event_loop()
    try:
        filter = contract.events.Transfer.createFilter(fromBlock="latest")
        loop.run_until_complete(asyncio.gather(log_loop(filter, 2)))
    finally:
        loop.close()
