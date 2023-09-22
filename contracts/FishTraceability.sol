// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "./utils.sol";
contract FishTraceability is FishUtils{
    constructor() {
        admin = msg.sender;
    }
   
   
    function addMar(address wallet,string memory _name, string memory _lastName,string memory MId) public onlyAdmin {
        Mars[wallet] = Marayeur(_name, _lastName,wallet,MId);
        MarayeursAddress[MarIndex] = wallet;
        MarIndex++;
    }
    function recordFishSale(uint256 finalPrice, string memory buyer, string memory lotId) public onlyAdmin(){
        
        // Create a new fish sale record
        FishSale memory sale = FishSale(
            buyer,
            finalPrice,
            lotId,
            true
        );

        // Store the fish sale record
        fishSales[lotId] = sale;

        // Emit an event to log the sale
    }
    function ModifMar(address wallet,string memory _name, string memory _lastName,string memory MId) public onlyAdmin {
        
        
        Mars[wallet] = Marayeur(_name, _lastName,wallet,MId);
        MarIndex++;
        
    }
    function addPesheur(address wallet,string memory _name, string memory _lastName,string memory pesheurID) public onlyAdmin {
       
        
        pesheurs[wallet] = Pesheur(_name, _lastName,wallet,pesheurID);
        PecheurIndex++;
    }
    function ModifPesheur(address wallet,string memory _name, string memory _lastName,string memory pesheurID) public onlyAdmin {
        
        
        pesheurs[wallet] = Pesheur(_name, _lastName,wallet,pesheurID);
        
    }
    function addVet(address wallet,string memory _name, string memory _lastName,string memory vetID) public onlyAdmin {
        
        
        Veters[wallet] = Veterinary(_name, _lastName,wallet,vetID);
        VetIndex++;
    }
    function ModVet(address wallet,string memory _name, string memory _lastName,string memory vetID) public onlyAdmin {
        
        
        Veters[wallet] = Veterinary(_name, _lastName,wallet,vetID);
    }
    function initiatePech(address pecheur,string memory _pechID,string memory _location, string memory _engineTitle, string memory _enginePhotoHash, string memory _engineType, uint256 _dateDeb) public onlyAdmin {
     
        
        pechs[_pechID] = Pech(_pechID,pecheur, _location, _engineTitle, _enginePhotoHash, _engineType, _dateDeb, 0, false,'',address(0),debarquement(0,false));
        PrisesID[PecheID] = _pechID;
        PecheID++;
    }
    
    function closePech(string memory _pechId, uint256 _dateFin,string memory _imageFish) public onlyAdmin {
        
        pechs[_pechId].dateFin = _dateFin;
        pechs[_pechId].closed = true;
        pechs[_pechId].imageFish = _imageFish;


    }
   
    function ModDebarquement(string memory _pechId, uint256 _dateDebarq) public onlyAdmin {
        pechs[_pechId].deb.dateDebarquement = _dateDebarq;
        pechs[_pechId].deb.debarqued = true;
    }
    function affecterPechToMarayeur(string memory pechID,address _marrayeur) public onlyAdmin {
        pechs[pechID].Marayeur = _marrayeur;
    }
    function createFishPackage(string memory _pechId,string memory packageID,uint256 _temperature, uint256 _weight, string memory rfid, string memory _qrcode,string memory imageFish) public onlyAdmin {
       
        Validation memory v = Validation(address(0),address(0),address(0));
        fishPackages[packageID] = FishPackage(packageID,_pechId, _temperature, _weight, rfid, _qrcode, false,imageFish,0,0,v,0);
        RFIDs[rfid] = packageID;

        packagesID[indexPackage] = packageID;
        indexPackage++;
    }

    
    
    
}
