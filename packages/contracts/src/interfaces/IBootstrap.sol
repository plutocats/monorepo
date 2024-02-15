// SPDX-License-Identifier: GPL-3.0

/// @title Interface for Plutocats governance bootstrap

pragma solidity >=0.8.0;

interface IBootstrap {
    /// The structure of a proposal without nested mappings.
    struct ProposalMinimal {
        uint256 startBlock;
        uint256 endTime;
        address newOwner;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 quorum;
        bool settled;
    }

    /// Receipt record for a voter.
    struct Receipt {
        /// Whether or not the account has voted.
        bool hasVoted;
        /// Support value for a proposal.
        uint8 support;
        /// Number of votes the account had.
        uint256 votes;
    }

    /// The structure of a new owner proposal.
    struct Proposal {
        uint256 startBlock;
        uint256 endTime;
        address newOwner;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 quorum;
        bool settled;
        mapping(address => Receipt) receipts;
    }

    error GovernanceLocked();
    error HasVoted();
    error VotesSettled();
    error QuorumNotMet();
    error ProposalExpired();
    error InvalidProposal();
    error ProposalVoting();
    error InvalidSupport();

    event ProposalCreated(address indexed newOwner, uint256 startBlock, uint256 endTime, uint256 quorum);
    event VoteCast(address indexed voter, address indexed newOwner, uint8 support, uint256 votes);
    event SettledVotes(address indexed newOwner, uint256 support);
}
