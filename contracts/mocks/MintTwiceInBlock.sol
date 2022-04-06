// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.10;

import "../interfaces/IMinter.sol";

contract MintTwiceInBlock {
  function mintTwoTimes(
    address minter,
    uint256 cost,
    uint256 numberToMint
  ) public payable {
    IMinter(minter).mint{ value: cost }(numberToMint);
    IMinter(minter).mint{ value: cost }(numberToMint);
  }
}
