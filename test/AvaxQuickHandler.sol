// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {AvaxQuick} from "../src/AvaxQuick.sol";

/// @notice Constrains invariant fuzz calls to tracked actors only
contract AvaxQuickHandler is Test {
    AvaxQuick internal token;
    address internal minter;
    address[] internal actors;

    constructor(AvaxQuick _token, address _minter, address[] memory _actors) {
        token = _token;
        minter = _minter;
        actors = _actors;
    }

    function mint(uint256 actorSeed, uint256 amount) external {
        address to = actors[actorSeed % actors.length];
        amount = bound(amount, 1, 1_000_000 * 1e18);

        vm.prank(minter);
        try token.mint(to, amount) {} catch {}
    }

    function transfer(uint256 fromSeed, uint256 toSeed, uint256 amount) external {
        address from = actors[fromSeed % actors.length];
        address to = actors[toSeed % actors.length];
        uint256 balance = token.balanceOf(from);
        if (balance == 0) return;

        amount = bound(amount, 1, balance);
        vm.prank(from);
        token.transfer(to, amount);
    }

    function burn(uint256 actorSeed, uint256 amount) external {
        address actor = actors[actorSeed % actors.length];
        uint256 balance = token.balanceOf(actor);
        if (balance == 0) return;

        amount = bound(amount, 1, balance);
        vm.prank(actor);
        token.burn(amount);
    }
}
