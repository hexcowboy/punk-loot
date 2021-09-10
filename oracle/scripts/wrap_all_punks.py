from brownie import Contract, CryptoPunksMarket, WrappedPunk, accounts, config


def main():
    owner = accounts.add(config["wallets"]["from_key"])

    crypto_punk_contract = CryptoPunksMarket[-1]

    wrapped_punk_contract = WrappedPunk[-1]

    if (
        wrapped_punk_contract.proxyInfo.call(owner)
        == "0x0000000000000000000000000000000000000000"
    ):
        wrapped_punk_contract.registerProxy({"from": owner})
    proxy = wrapped_punk_contract.proxyInfo.call(owner)

    for punk_id in range(10_000):
        is_owner: bool = (
            crypto_punk_contract.punkIndexToAddress.call(punk_id) == owner.address
        )
        if is_owner:
            crypto_punk_contract.transferPunk(proxy, punk_id, {"from": owner})
            wrapped_punk_contract.mint(punk_id, {"from": owner})
