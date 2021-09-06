from brownie import accounts, config, Contract


def main():
    owner = accounts.add(config["wallets"]["from_key"])

    crypto_punk_contract = Contract.from_explorer(
        "0xA8473D175b07aAE923081FCCd4FD1528869c4080"
    )

    wrapped_punk_contract = Contract.from_explorer(
        "0xC1702C5Fb6fF284f827aB40B07C44419c410eADB"
    )

    wrapped_punk_contract.registerProxy({"from": owner})
    proxy = wrapped_punk_contract.proxyInfo.call(owner)

    for punk_id in range(10_000):
        is_owner: bool = wrapped_punk_contract.ownerOf(punk_id).call() == owner.address
        if is_owner:
            crypto_punk_contract.transferPunk(proxy, punk_id, {"from": owner})
            wrapped_punk_contract.mint(punk_id, {"from": owner})
