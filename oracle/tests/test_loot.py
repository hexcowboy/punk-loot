import brownie
import pytest
from brownie import accounts
from fixtures import *


def test_only_oracle_operator_can_mint(loot_contract):
    # function mint(uint256 punkId, address account, uint8[] memory ids) public onlyOracleOperator
    transaction = loot_contract.mint(
        accounts[punk_owners[0]],
        0,
        1,
        "",
        {"from": accounts[oracle_operator]},
    )
    assert "TransferSingle" in transaction.events
    with brownie.reverts():
        transaction = loot_contract.mint(
            accounts[non_punk_owners[0]],
            0,
            1,
            "",
            {"from": accounts[non_punk_owners[1]]},
        )
        assert "TransferSingle" not in transaction.events
