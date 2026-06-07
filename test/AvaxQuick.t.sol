// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {AvaxQuick} from "../src/AvaxQuick.sol";
import {AvaxQuickHandler} from "./AvaxQuickHandler.sol";

contract AvaxQuickTest is Test {
    AvaxQuick internal token;
    AvaxQuickHandler internal handler;

    address internal admin = makeAddr("admin");
    address internal minter = makeAddr("minter");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    address[] internal actors;

    bytes32 internal constant MINTER_ROLE = keccak256("MINTER_ROLE");

    function setUp() public {
        actors.push(alice);
        actors.push(bob);
        actors.push(admin);
        actors.push(minter);

        vm.prank(admin);
        token = new AvaxQuick(admin);

        vm.prank(admin);
        token.grantRole(MINTER_ROLE, minter);

        vm.prank(minter);
        token.mint(alice, 1_000_000 * 1e18);

        handler = new AvaxQuickHandler(token, minter, actors);
        targetContract(address(handler));
    }

    // ── Unit tests ───────────────────────────────────────────────────────────

    function test_InitialState() public view {
        assertEq(token.name(), "AvaxQuick");
        assertEq(token.symbol(), "AXQ");
        assertEq(token.decimals(), 18);
        assertEq(token.MAX_SUPPLY(), 1_000_000_000 * 1e18);
        assertEq(token.totalSupply(), 1_000_000 * 1e18);
        assertTrue(token.hasRole(token.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(token.hasRole(MINTER_ROLE, admin));
        assertTrue(token.hasRole(MINTER_ROLE, minter));
    }

    function test_Mint_RevertsIfNotMinter() public {
        vm.prank(alice);
        vm.expectRevert();
        token.mint(bob, 1e18);
    }

    function test_Mint_RevertsZeroAddress() public {
        vm.prank(minter);
        vm.expectRevert(AvaxQuick.ZeroAddress.selector);
        token.mint(address(0), 1e18);
    }

    function test_Mint_RevertsZeroAmount() public {
        vm.prank(minter);
        vm.expectRevert(AvaxQuick.ZeroAmount.selector);
        token.mint(alice, 0);
    }

    function test_Mint_RevertsIfExceedsMaxSupply() public {
        uint256 maxSupply = token.MAX_SUPPLY();
        vm.prank(minter);
        vm.expectRevert();
        token.mint(alice, maxSupply);
    }

    function test_Burn_ReducesBalanceAndSupply() public {
        uint256 burnAmount = 100 * 1e18;
        uint256 supplyBefore = token.totalSupply();

        vm.prank(alice);
        token.burn(burnAmount);

        assertEq(token.balanceOf(alice), 1_000_000 * 1e18 - burnAmount);
        assertEq(token.totalSupply(), supplyBefore - burnAmount);
    }

    function test_Burn_RevertsZeroAmount() public {
        vm.prank(alice);
        vm.expectRevert(AvaxQuick.ZeroAmount.selector);
        token.burn(0);
    }

    function test_Constructor_RevertsZeroAddress() public {
        vm.expectRevert(AvaxQuick.ZeroAddress.selector);
        new AvaxQuick(address(0));
    }

    function test_Nonces_StartsAtZero() public view {
        assertEq(token.nonces(alice), 0);
    }

    function test_AdminCanRevokeMinter() public {
        vm.prank(admin);
        token.revokeRole(MINTER_ROLE, minter);

        vm.prank(minter);
        vm.expectRevert();
        token.mint(alice, 1e18);
    }

    // ── Fuzz tests ───────────────────────────────────────────────────────────

    function testFuzz_Transfer(uint256 amount) public {
        amount = bound(amount, 1, token.balanceOf(alice));

        vm.prank(alice);
        token.transfer(bob, amount);

        assertEq(token.balanceOf(bob), amount);
        assertEq(token.balanceOf(alice), 1_000_000 * 1e18 - amount);
    }

    function testFuzz_Mint_RespectsMaxSupply(uint256 amount) public {
        amount = bound(amount, 1, token.MAX_SUPPLY());
        uint256 remaining = token.MAX_SUPPLY() - token.totalSupply();

        vm.prank(minter);
        if (amount > remaining) {
            vm.expectRevert();
        }
        token.mint(bob, amount);

        assertLe(token.totalSupply(), token.MAX_SUPPLY());
    }

    function testFuzz_Burn(uint256 burnAmount) public {
        burnAmount = bound(burnAmount, 1, token.balanceOf(alice));
        uint256 supplyBefore = token.totalSupply();

        vm.prank(alice);
        token.burn(burnAmount);

        assertEq(token.totalSupply(), supplyBefore - burnAmount);
        assertEq(token.balanceOf(alice), 1_000_000 * 1e18 - burnAmount);
    }

    function testFuzz_ApproveAndTransferFrom(uint256 amount) public {
        amount = bound(amount, 1, token.balanceOf(alice));

        vm.prank(alice);
        token.approve(bob, amount);

        vm.prank(bob);
        token.transferFrom(alice, bob, amount);

        assertEq(token.balanceOf(bob), amount);
    }

    // ── Invariant tests ──────────────────────────────────────────────────────

    function invariant_TotalSupplyNeverExceedsMax() public view {
        assertLe(token.totalSupply(), token.MAX_SUPPLY());
    }

    function invariant_SumOfBalancesEqualsSupply() public view {
        assertEq(
            token.balanceOf(alice) + token.balanceOf(bob) + token.balanceOf(admin) + token.balanceOf(minter),
            token.totalSupply()
        );
    }
}
