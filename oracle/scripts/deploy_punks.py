from brownie import CryptoPunksMarket, WrappedPunk, accounts, config


def main():
    owner = accounts.add(config["wallets"]["from_key"])

    crypto_punk_contract = CryptoPunksMarket.deploy(
        {"from": owner},
        publish_source=True,
    )

    wrapped_punk_contract = WrappedPunk.deploy(
        crypto_punk_contract.address,
        {"from": owner},
        publish_source=True,
    )
