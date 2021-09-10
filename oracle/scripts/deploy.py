import web3
from brownie import (
    Contract,
    CryptoPunksMarket,
    Loot,
    Oracle,
    WrappedPunk,
    accounts,
    config,
    network,
)
from rich import print


def deploy_mainnet():
    account = accounts.add(config["wallets"]["from_key"])
    wrapped_punk_address = "0xb7f7f6c52f2e2fdb1963eab30438024864c313f6"

    # constructor(address _wrappedPunksContract, uint256 _oraclePriceInWei)
    oracle: Contract = Oracle.deploy(
        wrapped_punk_address,
        100000000000000000,
        {"from": account},
        publish_source=True,
    )

    # constructor(string memory name_, string memory symbol_, string memory baseURI_, address oracle_)
    Loot.deploy(
        "Loot (CryptoPunks)",
        "LOOT",
        "https://loot.st/",
        oracle.address,
        {"from": account},
        publish_source=True,
    )


def deploy_testnet():
    account = accounts.add(config["wallets"]["from_key"])

    crypto_punk_contract = CryptoPunksMarket[-1]
    # crypto_punk_contract = CryptoPunksMarket.deploy(
    #     {"from": account},
    #     publish_source=True,
    # )

    # constructor(address punkContract)
    wrapped_punk_contract = WrappedPunk[-1]
    # wrapped_punk_contract = WrappedPunk.deploy(
    #     crypto_punk_contract.address,
    #     {"from": account},
    #     publish_source=True,
    # )

    # constructor(address _wrappedPunksContract, uint256 _oraclePriceInWei)
    oracle = Oracle.deploy(
        wrapped_punk_contract,
        100000000000000000,
        {"from": account},
        publish_source=True,
    )

    # constructor(string memory name_, string memory symbol_, string memory baseURI_, address oracle_)
    loot = Loot.deploy(
        "Loot (CryptoPunks)",
        "LOOT",
        "https://loot.st/{id}.json",
        oracle.address,
        {"from": account},
        publish_source=True,
    )

    print("Deployments:")
    print(f"CryptoPunksMarket: {crypto_punk_contract.address}")
    print(f"WrappedPunk: {wrapped_punk_contract.address}")
    print(f"Oracle: {oracle.address}")
    print(f"Loot: {loot.address}")


def main():
    current_network = network.show_active()

    if current_network == "mainnet":
        deploy_mainnet()
    else:
        deploy_testnet()
