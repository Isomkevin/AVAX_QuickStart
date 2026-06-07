// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";

/// @title AvaxQuick — Production ERC-20 for Avalanche C-Chain
/// @notice ERC-20 with gasless approvals, governance votes, and role-based minting
/// @dev Deploy on Fuji (43113) before mainnet (43114). evm_version must be cancun.
contract AvaxQuick is ERC20, ERC20Permit, ERC20Votes, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18;

    error ExceedsMaxSupply(uint256 requested, uint256 available);
    error ZeroAddress();
    error ZeroAmount();

    /// @notice Deploy token and grant admin + minter roles to the initial admin
    /// @param initialAdmin Address receiving DEFAULT_ADMIN_ROLE and MINTER_ROLE
    constructor(address initialAdmin)
        ERC20("AvaxQuick", "AXQ")
        ERC20Permit("AvaxQuick")
    {
        if (initialAdmin == address(0)) revert ZeroAddress();

        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(MINTER_ROLE, initialAdmin);
    }

    /// @notice Mint tokens to an address — requires MINTER_ROLE, capped at MAX_SUPPLY
    /// @param to Recipient of minted tokens
    /// @param amount Amount to mint (18 decimals)
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        uint256 supply = totalSupply();
        if (supply + amount > MAX_SUPPLY) {
            revert ExceedsMaxSupply(amount, MAX_SUPPLY - supply);
        }

        _mint(to, amount);
    }

    /// @notice Burn caller's tokens
    /// @param amount Amount to burn
    function burn(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        _burn(msg.sender, amount);
    }

    /// @inheritdoc ERC20Votes
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }

    /// @inheritdoc ERC20Permit
    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}
