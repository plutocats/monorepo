// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import {console} from "forge-std/Test.sol";
import {LinearVRGDA} from "VRGDAs/LinearVRGDA.sol";
import {DSTestPlus} from "solmate/test/utils/DSTestPlus.sol";
import {toWadUnsafe, toDaysWadUnsafe, fromDaysWadUnsafe} from "solmate/utils/SignedWadMath.sol";

contract MockLinearVRGDA is LinearVRGDA {
    constructor(int256 _targetPrice, int256 _priceDecayPercent, int256 _perTimeUnit)
        LinearVRGDA(_targetPrice, _priceDecayPercent, _perTimeUnit)
    {}
}

contract LinearVRGDATest is DSTestPlus {
    MockLinearVRGDA public vrgda;

    function setUp() public {
        vrgda = new MockLinearVRGDA(
            0.001e18, // Target price.
            0.1e18, // Price decay percent.
            1e18 // Per time unit.
        );
    }

    function testTargetPrice() public {
        // one token should be sold a day. warp to 1 day to test that the
        // token costs the target price
        hevm.warp(block.timestamp + fromDaysWadUnsafe(vrgda.getTargetSaleTime(2e18)));
        uint256 cost = vrgda.getVRGDAPrice(toDaysWadUnsafe(block.timestamp), 1);
        assertRelApproxEq(cost, uint256(vrgda.targetPrice()), 0.00001e18);
    }

    function testPricingBasic() public {
        // we target selling 1 token per day so after 1 year the price should equal the target price
        uint256 timeDelta = 366 days;
        uint256 numMint = 365;

        hevm.warp(block.timestamp + timeDelta);
        uint256 cost = vrgda.getVRGDAPrice(toDaysWadUnsafe(block.timestamp), numMint);
        assertRelApproxEq(cost, uint256(vrgda.targetPrice()), 0.0001e18);
    }

    function testDecay() public {
        // verify that over time the price decays by 10% per day
        uint256 timeDelta = 11 days;
        uint256 numMint = 0;

        hevm.warp(block.timestamp + timeDelta);

        // decay the price by 10% 10 times
        uint256 decayCost = uint256(vrgda.targetPrice());
        for (uint256 i = 0; i < 10; i++) {
            decayCost = decayCost - decayCost / 10;
        }

        uint256 cost = vrgda.getVRGDAPrice(toDaysWadUnsafe(block.timestamp), numMint);
        assertRelApproxEq(cost, decayCost, 0.0001e18);
    }

    function testAlwaysTargetPriceInRightConditions(uint256 sold) public {
        sold = bound(sold, 0, type(uint128).max);
        assertRelApproxEq(
            vrgda.getVRGDAPrice(vrgda.getTargetSaleTime(toWadUnsafe(sold + 1)), sold),
            uint256(vrgda.targetPrice()),
            0.00001e18
        );
    }
}
