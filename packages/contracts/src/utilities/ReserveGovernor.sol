// SPDX-License-Identifier: GPL-3.0

/// Minimal governance for upgrading the ecosystem to be managed by a DAO. This is a utility
/// used to bootstrap future governance and is purposefully written in a non-generic way.
/// Only the deployer's address can open a proposal to prevent griefing opportunities by
/// malicious members.
///
/// A proposal is open for 7 days and requires a minimum quorum to pass. If a proposal
/// passes, the reserve and token's Blast governor is set, while all contract ownership is transfered
/// to the new owner address defined in the proposal.
///
/// Although a tradeoff in flexibility, this is a simple and sufficiently
/// decentralized way to migrate the project to a DAO structure if the community decides to.
///
/// Note: The Blast governor is an address that is allowed to configure or claim
/// a contract’s yield and gas.

pragma solidity >=0.8.0;

import {IPlutocatsTokenMinimal} from "../interfaces/IPlutocatsTokenMinimal.sol";
import {IReserve} from "../interfaces/IReserve.sol";
import {IBootstrap} from "../interfaces/IBootstrap.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ReserveGovernor is IBootstrap, Ownable {
    /// The token which is used for governance. Must implement IThresholdGovernanceToken.
    IPlutocatsTokenMinimal public votingToken;

    /// The address of the reserve.
    IReserve public reserve;

    /// The address of the descriptor.
    address public descriptor;

    /// Addresses proposed to set a blast governor.
    mapping(address => mapping(uint256 => Proposal)) public proposed;

    /// The minimum voting turnout required for a proposal to pass.
    uint256 public quorumBps;

    /// Whether governance is locked.
    bool public governanceLocked;

    /// The current period of voting.
    uint256 public proposalPeriod;

    /// Modifier to handle disabling the contract if governance is locked.
    modifier governanceNotLocked() {
        if (governanceLocked) {
            revert GovernanceLocked();
        }

        _;
    }

    constructor(address _votingToken, address _descriptor, address _reserve, uint256 _quorumBps) {
        require(_votingToken != address(0), "ReserveGovernor: voting token address cannot be 0");
        require(_descriptor != address(0), "ReserveGovernor: descriptor address cannot be 0");
        require(_reserve != address(0), "ReserveGovernor: reserve address cannot be 0");
        require(_quorumBps > 0, "ReserveGovernor: quorum must be greater than 0");

        votingToken = IPlutocatsTokenMinimal(_votingToken);
        reserve = IReserve(_reserve);
        quorumBps = _quorumBps;
        descriptor = _descriptor;
    }

    /// Propose a new address to be set as the blast governor. This function is only
    /// callable by the owner to prevent potential governance attacks.
    function propose(address _newOwner) external onlyOwner governanceNotLocked {
        uint256 startBlock = block.number;
        uint256 endTime = block.timestamp + 7 days;

        Proposal storage p = proposed[_newOwner][proposalPeriod];
        p.startBlock = startBlock;
        p.endTime = endTime;
        p.newOwner = _newOwner;
        p.forVotes = 0;
        p.againstVotes = 0;
        p.quorum = bps2Uint(quorumBps, votingToken.adjustedTotalSupply());
        p.settled = false;

        emit ProposalCreated(_newOwner, startBlock, endTime, p.quorum);
    }

    /// Cast a vote to set a blast governor for the reserve.
    function vote(address _newOwner, uint8 _support) external governanceNotLocked {
        Proposal storage p = proposed[_newOwner][proposalPeriod];
        Receipt storage receipt = p.receipts[msg.sender];

        if (p.newOwner == address(0)) {
            revert InvalidProposal();
        }

        if (block.timestamp > p.endTime) {
            revert ProposalExpired();
        }

        if (receipt.hasVoted) {
            revert HasVoted();
        }

        if (p.settled) {
            revert VotesSettled();
        }

        if (_support > 1) {
            revert InvalidSupport();
        }

        // snapshot for voting power taken at the start of the proposal
        uint256 votes = votingToken.getPriorVotes(msg.sender, p.startBlock);
        if (_support == 1) {
            p.forVotes += votes;
        }

        if (_support == 0) {
            p.againstVotes += votes;
        }

        receipt.hasVoted = true;
        receipt.support = _support;
        receipt.votes = votes;

        emit VoteCast(msg.sender, _newOwner, _support, votes);
    }

    /// Settle votes for configuring the reserve blast governor. If majority sentiment
    /// is in favor, the governor is set and all future governance is disabled.
    function settleVotes(address _newOwner) external governanceNotLocked {
        Proposal storage p = proposed[_newOwner][proposalPeriod];
        uint256 totalVotes = p.forVotes + p.againstVotes;

        if (p.newOwner == address(0)) {
            revert InvalidProposal();
        }

        if (block.timestamp < p.endTime) {
            revert ProposalVoting();
        }

        if (p.settled) {
            revert VotesSettled();
        }

        bool quorumMet = true;
        if (totalVotes < p.quorum) {
            quorumMet = false;
        }

        uint256 support = 1;
        if (p.againstVotes >= p.forVotes) {
            support = 0;
        }

        p.settled = true;
        proposalPeriod += 1;

        if (support == 1 && quorumMet) {
            governanceLocked = true;
            reserve.setGovernor(_newOwner);
            votingToken.setGovernor(_newOwner);

            Ownable(address(reserve)).transferOwnership(_newOwner);
            Ownable(address(votingToken)).transferOwnership(_newOwner);
            Ownable(descriptor).transferOwnership(_newOwner);
        }

        emit SettledVotes(_newOwner, support, governanceLocked);
    }

    /// Helper used to calculate quorum required to pass a proposal.
    function bps2Uint(uint256 bps, uint256 number) internal pure returns (uint256) {
        return (number * bps) / 10000;
    }

    /// Returns the latest proposal for the given address.
    function proposal(address _newOwner, uint256 _period) external view returns (ProposalMinimal memory) {
        Proposal storage p = proposed[_newOwner][_period];
        return ProposalMinimal({
            startBlock: p.startBlock,
            endTime: p.endTime,
            newOwner: p.newOwner,
            forVotes: p.forVotes,
            againstVotes: p.againstVotes,
            quorum: p.quorum,
            settled: p.settled
        });
    }
}
