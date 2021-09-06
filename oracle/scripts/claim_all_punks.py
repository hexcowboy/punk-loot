from brownie import accounts, config, Contract


def main():
    owner = accounts.add(config["wallets"]["from_key"])

    crypto_punk_contract = Contract.from_explorer(
        "0xA8473D175b07aAE923081FCCd4FD1528869c4080"
    )

    # 10 * 1000 = 10,000
    for punk_id in range(10):
        if (
            crypto_punk_contract.punkIndexToAddress.call(punk_id * 1000)
            == "0x0000000000000000000000000000000000000000"
        ):
            owners = [owner.address for i in range(1000)]
            punks = [i for i in range(punk_id * 1000, punk_id * 1000 + 1000)]
            print(punks)
            crypto_punk_contract.setInitialOwners(owners, punks, {"from": owner})

    crypto_punk_contract.allInitialOwnersAssigned({"from": owner})
