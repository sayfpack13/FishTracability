// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./FishTraceability.sol";

contract FishMarketplace {
    address public admin;
    FishTraceability public traceabilityContract;

    struct MarketplacePackage {
        bytes32 packageId;
        uint256 price;
        uint256 reductionOffset;
        bool sold;
        address buyer;
    }

    mapping(bytes32 => MarketplacePackage) public marketplacePackages;

    event PackageListed(bytes32 packageId, uint256 price);
    event PackageSold(bytes32 packageId, address buyer);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only the admin can call this function.");
        _;
    }

    constructor(address _traceabilityContract) {
        admin = msg.sender;
        traceabilityContract = FishTraceability(_traceabilityContract);
    }

    function listPackage(bytes32 _packageId, uint256 _price, uint256 _reductionOffset) public {
        require(marketplacePackages[_packageId].packageId == bytes32(0), "Package with this ID is already listed.");
        require(_price > 0, "Price must be greater than zero.");
        require(_reductionOffset > 0, "Reduction offset must be greater than zero.");

        marketplacePackages[_packageId] = MarketplacePackage(_packageId, _price, _reductionOffset, false, address(0));

        emit PackageListed(_packageId, _price);
    }

    function buyPackage(bytes32 _packageId) public payable {
        MarketplacePackage storage package = marketplacePackages[_packageId];

        require(package.packageId != bytes32(0), "Package with this ID is not listed.");
        require(!package.sold, "Package is already sold.");
        require(msg.value >= package.price, "Insufficient funds.");

        package.sold = true;
        package.buyer = msg.sender;

        emit PackageSold(_packageId, msg.sender);

        if (msg.value > package.price) {
            uint256 refundAmount = msg.value - package.price;
            payable(msg.sender).transfer(refundAmount);
        }
    }

    function getCurrentPrice(bytes32 _packageId) public view returns (uint256) {
        MarketplacePackage storage package = marketplacePackages[_packageId];
        require(package.packageId != bytes32(0), "Package with this ID is not listed.");

        uint256 currentPrice = package.price - (block.timestamp / package.reductionOffset);
        if (currentPrice < 0) {
            currentPrice = 0;
        }

        return currentPrice;
    }

    function isPackageSold(bytes32 _packageId) public view returns (bool) {
        MarketplacePackage storage package = marketplacePackages[_packageId];
        require(package.packageId != bytes32(0), "Package with this ID is not listed.");

        return package.sold;
    }

    function getPackageData(string memory _packageId) public view returns (
        string  pechId,
        uint256 temperature,
        uint256 weight,
        string memory RFID,
        string memory qrcode,
        bool veterinaryApproval,
        bool qualityControlApproval
    ) {
        return traceabilityContract.fishPackages(_packageId);
    }
}