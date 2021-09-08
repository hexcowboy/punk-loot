//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IOracle {
    function getOperator() external view returns(address);
}
