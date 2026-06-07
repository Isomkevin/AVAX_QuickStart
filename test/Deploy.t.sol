// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {Deploy} from "../script/Deploy.s.sol";
import {AvaxQuick} from "../src/AvaxQuick.sol";

contract DeployTest is Test {
    function test_DeployScript_RunsSuccessfully() public {
        uint256 deployerKey = 0xA11CE;
        address deployer = vm.addr(deployerKey);

        vm.setEnv("PRIVATE_KEY", vm.toString(deployerKey));

        Deploy deployScript = new Deploy();
        deployScript.run();

        // Verify a token matching deploy params can be created and minted
        vm.prank(deployer);
        AvaxQuick token = new AvaxQuick(deployer);
        vm.prank(deployer);
        token.mint(deployer, 100_000_000 * 1e18);

        assertEq(token.balanceOf(deployer), 100_000_000 * 1e18);
        assertTrue(token.hasRole(token.MINTER_ROLE(), deployer));
    }
}
