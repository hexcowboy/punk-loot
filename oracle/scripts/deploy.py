from brownie import Loot, Oracle, accounts, config


def main():
    owner = accounts.add(config["wallets"]["from_key"])

    # constructor(address _wrappedPunksContract, uint256 _oraclePriceInWei)
    oracle = Oracle.deploy(
        "0x54F22A45D75a86bC95Aaf64249C9528496Cd021a",
        100000000000000000,
        {"from": owner},
        publish_source=True,
    )

    # constructor(string memory name_, string memory symbol_, string memory baseURI_, address oracle_)
    Loot.deploy(
        "Punk Loot",
        "LOOT",
        "https://loot.st/",
        oracle.address,
        {"from": owner},
        publish_source=True,
    )
