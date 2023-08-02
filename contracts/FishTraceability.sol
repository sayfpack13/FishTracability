// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FishTraceability {
    address public admin;
    
    struct Pesheur {
        string name;
        string lastName;
        address wallet;
        string pesheurID;
        // Add more data fields as required
    }
    struct Veterinary {
        string name;
        string lastName;
        address wallet;
        string VeterinaryID;
        // Add more data fields as required
    }
     struct Marayeur {
        string name;
        string lastName;
        address wallet;
        string MarayeurID;
        // Add more data fields as required
    }
    
    struct Pech {
        string id;
        address pecheur;
        string location;
        string engineTitle;
        string enginePhotoHash;
        string engineType;
        uint256 dateDeb;
        uint256 dateFin;
        bool closed;
        string imageFish;
        address Marayeur;
        
    }
    
    struct FishPackage {
        string pechId;
        uint256 temperature;
        uint256 weight;
        string RFID;
        string qrcode;
        bool veterinaryApproval;
        bool qualityControlApproval;
        string imageFish;
        uint256 minPrice;
        uint256 maxPrice;
    }
    
    mapping(address => Pesheur) public pesheurs;
    mapping(address => Veterinary) public Veters;
    mapping(address => Marayeur) public Mars;

    mapping(string => Pech) public pechs;
    mapping(string => FishPackage) public fishPackages;
    uint PecheID=0;
    uint VetIndex = 0;
    uint MarIndex = 0;
    uint PecheurIndex = 0;
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only the admin can call this function.");
        _;
    }
    
    modifier onlyPesheur() {
        require(bytes(pesheurs[msg.sender].name).length != 0, "Only registered pesheurs can call this function.");
        _;
    }
    modifier onlyVeterinary() {
        require(Veters[msg.sender].wallet!= address(0), "Only registered pesheurs can call this function.");
        _;
    }
    constructor() {
        admin = msg.sender;
    }
    function addMar(address wallet,string memory _name, string memory _lastName,string memory MId) public onlyAdmin {
        require(bytes(_name).length != 0, "Name cannot be empty.");
        require(bytes(_lastName).length != 0, "Last name cannot be empty.");
        
        Mars[wallet] = Marayeur(_name, _lastName,wallet,MId);
        MarIndex++;
    }
    function ModifMar(address wallet,string memory _name, string memory _lastName,string memory MId) public onlyAdmin {
        require(bytes(_name).length != 0, "Name cannot be empty.");
        require(bytes(_lastName).length != 0, "Last name cannot be empty.");
        
        Mars[wallet] = Marayeur(_name, _lastName,wallet,MId);
        MarIndex++;
        
    }
    function addPesheur(address wallet,string memory _name, string memory _lastName,string memory pesheurID) public onlyAdmin {
        require(bytes(_name).length != 0, "Name cannot be empty.");
        require(bytes(_lastName).length != 0, "Last name cannot be empty.");
        
        pesheurs[wallet] = Pesheur(_name, _lastName,wallet,pesheurID);
        PecheurIndex++;
    }
    function ModifPesheur(address wallet,string memory _name, string memory _lastName,string memory pesheurID) public onlyAdmin {
        require(bytes(_name).length != 0, "Name cannot be empty.");
        require(bytes(_lastName).length != 0, "Last name cannot be empty.");
        
        pesheurs[wallet] = Pesheur(_name, _lastName,wallet,pesheurID);
        
    }
    function addVet(address wallet,string memory _name, string memory _lastName,string memory vetID) public onlyAdmin {
        require(bytes(_name).length != 0, "Name cannot be empty.");
        require(bytes(_lastName).length != 0, "Last name cannot be empty.");
        
        Veters[wallet] = Veterinary(_name, _lastName,wallet,vetID);
        VetIndex++;
    }
    function ModVet(address wallet,string memory _name, string memory _lastName,string memory vetID) public onlyAdmin {
        require(bytes(_name).length != 0, "Name cannot be empty.");
        require(bytes(_lastName).length != 0, "Last name cannot be empty.");
        
        Veters[wallet] = Veterinary(_name, _lastName,wallet,vetID);
    }
    function initiatePech(address pecheur,string memory _pechID,string memory _location, string memory _engineTitle, string memory _enginePhotoHash, string memory _engineType, uint256 _dateDeb) public onlyAdmin {
        require(bytes(_location).length != 0, "Location cannot be empty.");
        require(bytes(_engineTitle).length != 0, "Engine title cannot be empty.");
        require(bytes(_enginePhotoHash).length != 0, "Engine photo hash cannot be empty.");
        require(bytes(_engineType).length != 0, "Engine type cannot be empty.");
        
        pechs[_pechID] = Pech(_pechID,pecheur, _location, _engineTitle, _enginePhotoHash, _engineType, _dateDeb, 0, false,'',address(0));
        PecheID++;
    }
    
    function closePech(string memory _pechId, uint256 _dateFin,string memory _imageFish) public onlyAdmin {
        require(bytes(pechs[_pechId].location).length != 0, "Pech with this ID does not exist.");
        require(pechs[_pechId].closed == false, "Pech is already closed.");
        
        pechs[_pechId].dateFin = _dateFin;
        pechs[_pechId].closed = true;
        pechs[_pechId].imageFish = _imageFish;


    }
    function affecterPechToMarayeur(string memory pechID,address _marrayeur) public onlyAdmin {
        pechs[pechID].Marayeur = _marrayeur;
    }
    function createFishPackage(string memory _pechId,string memory packageID,uint256 _temperature, uint256 _weight, string memory _RFID, string memory _qrcode,string memory imageFish) public onlyAdmin {
        require(bytes(pechs[_pechId].location).length != 0, "Pech with this ID does not exist.");
        require(pechs[_pechId].closed == true, "Pech must be closed before creating fish packages.");
        require(bytes(_RFID).length != 0, "RFID cannot be empty.");
        require(bytes(_qrcode).length != 0, "QR code cannot be empty.");
        
        fishPackages[packageID] = FishPackage(_pechId, _temperature, _weight, _RFID, _qrcode, false, false,imageFish);
    }
    function prepLot(string memory packageID,uint256 minPrice,uint256 maxPrice) public onlyAdmin {
        
        
        fishPackages[packageID].minPrice =minPrice;
        fishPackages[packageID].maxPrice =maxPrice;


    }
    function approveByVeterinary(string memory _packid) public onlyAdmin {
        require(fishPackages[_packid].veterinaryApproval == false, "Package is already approved by the veterinarian.");
        
        fishPackages[_packid].veterinaryApproval = true;
    }
    function refuseByVeterinary(string memory _packid) public onlyAdmin {
        require(fishPackages[_packid].veterinaryApproval == false, "Package is already approved by the veterinarian.");
        
        fishPackages[_packid].veterinaryApproval = false;
    }
    
    function approveByQualityManager(string memory _packid) public onlyAdmin {
        require(fishPackages[_packid].qualityControlApproval == false, "Package is already approved by the quality manager.");
        
        fishPackages[_packid].qualityControlApproval = true;
    }
    
}
