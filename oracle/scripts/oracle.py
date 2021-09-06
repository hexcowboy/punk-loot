import asyncio
import json
import logging
import os
from pathlib import Path
from signal import SIGINT, signal
from sys import exit

import click
from rich import print, print_json
from rich.logging import RichHandler
from web3 import Web3

from gas import Speed, get_gas_price
from networks import Network, networks


def handle_event(event):
    # log.info(f"Received event {event['name']}")
    print_json(Web3.toJSON(event))


def handle_exit(signal, frame):
    # Handle any cleanup here
    log.info("Stopping oracle")
    exit(0)


def get_infura_url(network: Network):
    try:
        return networks[network]["infura_url"]
    except KeyError:
        print(f"Network not supported: {network}")
        exit(1)


async def log_loop(event_filter, poll_interval):
    while True:
        get_gas_price(Speed.FAST)
        for entry in event_filter.get_new_entries():
            handle_event(entry)
            os.system("afplay /System/Library/Sounds/Hero.aiff")
        await asyncio.sleep(poll_interval)


@click.command()
@click.option(
    "--network", default="mainnet", help="The name of the network to listen on"
)
@click.option("--log-level", default="INFO", help="Minimum logging level to display")
def oracle(network: Network = "mainnet", log_level: str = "INFO"):
    # Set up logging
    global log
    logging.basicConfig(
        level=log_level, format="%(message)s", datefmt="[%X]", handlers=[RichHandler()]
    )
    log = logging.getLogger("rich")

    with open(Path(__file__).parent / "cryptopunk_abi.json") as file:
        cryptopunks_abi = json.load(file)

    web3 = Web3(Web3.HTTPProvider(get_infura_url(network)))
    cryptopunks_address = networks[network]["cryptopunks_address"]
    contract = web3.eth.contract(address=cryptopunks_address, abi=cryptopunks_abi)

    # Tell Python to run the handler() function when SIGINT is recieved
    signal(SIGINT, handle_exit)
    print("Running Oracle. Press CTRL-C to exit.")

    # Start the async loop
    loop = asyncio.get_event_loop()
    try:
        filter = contract.events.Transfer.createFilter(fromBlock="latest")
        loop.run_until_complete(asyncio.gather(log_loop(filter, 2)))
    finally:
        loop.close()


if __name__ == "__main__":
    oracle()
