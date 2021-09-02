import brownie
from brownie import accounts, WrappedPunk
from rich import print

from fixtures import *


def test_set_price(faker, oracle_contract):
    price = faker.pyint()
    owner = accounts[loot_operator]
    # function setPrice(uint256 priceInWei) public onlyOracleOperator;
    oracle_contract.setPrice(price, {"from": owner})
    assert oracle_contract.oraclePriceInWei() == price


def test_with_direct_call(populate_punk_owners, wrapped_punk_contract, oracle_contract):
    for punk, account in enumerate([accounts[punk] for punk in punk_owners]):
        with brownie.reverts():
            # function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4);
            transaction = oracle_contract.onERC721Received(account, account, punk, "")
            assert wrapped_punk_contract.ownerOf(punk) == account
            assert "CryptoPunkReceived" not in transaction.events


def test_with_valid_punk_owner_and_funding(
    populate_punk_owners, wrapped_punk_contract, oracle_contract
):
    for punk, account in enumerate([accounts[punk] for punk in punk_owners]):
        oracle_price = oracle_contract.oraclePriceInWei()
        # function fundOracle() public payable
        oracle_contract.fundOracle({"from": account, "value": oracle_price})
        assert oracle_contract.balanceOf(account) == oracle_price

        # function safeTransferFrom(address from, address to, uint256 tokenId) external;
        transaction = wrapped_punk_contract.safeTransferFrom(
            account, oracle_contract.address, punk, {"from": account}
        )
        assert wrapped_punk_contract.ownerOf(punk) == oracle_contract.address


def test_with_valid_punk_owner_without_funding(
    populate_punk_owners, wrapped_punk_contract, oracle_contract
):
    for punk, account in enumerate([accounts[punk] for punk in punk_owners]):
        with brownie.reverts():
            # function safeTransferFrom(address from, address to, uint256 tokenId) external;
            transaction = wrapped_punk_contract.safeTransferFrom(
                account, oracle_contract.address, punk, {"from": account}
            )

            # function ownerOf(uint256 tokenId) external view returns (address owner);
            assert wrapped_punk_contract.ownerOf(punk) == account
            assert "CryptoPunkReceived" not in transaction.events


def test_with_invalid_punk_owner(cryptopunks_contract, oracle_contract):
    for punk, account in enumerate([accounts[punk] for punk in non_punk_owners]):
        # function setInitialOwner(address to, uint256 punkIndex)
        cryptopunks_contract.setInitialOwner(account, punk)

    cryptopunks_contract.allInitialOwnersAssigned()
    fake_wrapped_punk_contract = accounts[loot_operator].deploy(
        WrappedPunk, cryptopunks_contract
    )

    for punk, account in enumerate([accounts[punk] for punk in non_punk_owners]):
        fake_wrapped_punk_contract.registerProxy({"from": account})
        proxy = fake_wrapped_punk_contract.proxyInfo.call(account)
        cryptopunks_contract.transferPunk(proxy, punk, {"from": account})
        fake_wrapped_punk_contract.mint(punk, {"from": account})

        with brownie.reverts():
            transaction = fake_wrapped_punk_contract.safeTransferFrom(
                account, oracle_contract.address, punk, {"from": account}
            )

            assert fake_wrapped_punk_contract.balanceOf(oracle_contract.address) == 0
            assert "CryptoPunkReceived" not in transaction.events
