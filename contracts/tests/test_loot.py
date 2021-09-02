import pytest
import brownie
from brownie import accounts

from fixtures import *


def test_only_oracle_operator_can_mint(loot_contract):
    # function mint(uint256 punkId, address account, uint8[] memory ids) public onlyOracleOperator
    transaction = loot_contract.mint(
        0,
        accounts[punk_owners[0]],
        [0, 1, 2],
        False,
        {"from": accounts[loot_operator]},
    )
    assert "PunkConsumed" in transaction.events
    with brownie.reverts():
        transaction = loot_contract.mint(
            1,
            accounts[non_punk_owners[0]],
            [0, 1, 2],
            False,
            {"from": accounts[non_punk_owners[1]]},
        )
        assert "PunkConsumed" not in transaction.events
