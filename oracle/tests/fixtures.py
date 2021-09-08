import pytest
from brownie import accounts, CryptoPunksMarket, WrappedPunk, Oracle, Loot

punk_operator = 0
loot_operator, oracle_operator = 1, 1
punk_owners = (2, 3, 4)
non_punk_owners = (5, 6, 7)


@pytest.fixture
def cryptopunks_contract():
    return accounts[punk_operator].deploy(CryptoPunksMarket)


@pytest.fixture
def wrapped_punk_contract(cryptopunks_contract):
    return accounts[punk_operator].deploy(WrappedPunk, cryptopunks_contract)


@pytest.fixture
def oracle_contract(wrapped_punk_contract, faker):
    # constructor(address _wrappedPunksContract, uint256 _oraclePriceInWei)
    return accounts[oracle_operator].deploy(
        Oracle, wrapped_punk_contract, faker.pyint()
    )


@pytest.fixture
def loot_contract(oracle_contract):
    # constructor(address oracleAddress) ERC1155("google.com")
    return accounts[loot_operator].deploy(Loot, oracle_contract)


@pytest.fixture
def populate_punk_owners(cryptopunks_contract, wrapped_punk_contract):
    owners = list()

    for account in punk_owners:
        owners.append(accounts[account])

    cryptopunks_contract.setInitialOwners(owners, [i for i in range(len(punk_owners))])
    cryptopunks_contract.allInitialOwnersAssigned()

    for index, account in enumerate(punk_owners):
        account = accounts[account]
        wrapped_punk_contract.registerProxy({"from": account})
        proxy = wrapped_punk_contract.proxyInfo.call(account)
        cryptopunks_contract.transferPunk(proxy, index, {"from": account})
        wrapped_punk_contract.mint(index, {"from": account})
