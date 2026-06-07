// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {AvaxQuick} from "../src/AvaxQuick.sol";

/// @title Deploy — Fuji/mainnet deployment script for AvaxQuick
contract Deploy is Script {
    /// @notice Deploy AvaxQuick and optionally mint initial supply
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        AvaxQuick token = new AvaxQuick(deployer);

        // Mint 10% of max supply to deployer for initial distribution
        token.mint(deployer, 100_000_000 * 1e18);

        console.log("=== AvaxQuick Deployed ===");
        console.log("Address:   ", address(token));
        console.log("Deployer:  ", deployer);
        console.log("Chain ID:  ", block.chainid);
        console.log(
            "Network:   ",
            block.chainid == 43113 ? "Fuji" : block.chainid == 43114 ? "Avalanche C-Chain" : "Unknown"
        );

        vm.stopBroadcast();
    }
}
