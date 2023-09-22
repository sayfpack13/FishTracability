contract FishUtils {
    mapping(string => Pech) public pechs;
            address public admin;

    mapping(string => FishPackage) public fishPackages;
     struct debarquement{
        uint256 dateDebarquement;
        bool debarqued;
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
       
        debarquement deb;
    }
    struct Validation {
         address Pesheur;
        address Veterinary;
        address marayeur;
    }
    struct FishPackage {
        string id;
        string pechId;
        uint256 temperature;
        uint256 weight;
        string RFID;
        string qrcode;
        bool veterinaryApproval;
        string imageFish;
        uint256 minPrice;
        uint256 maxPrice;
       Validation valid ;
       uint256 qte;
    }
    struct FishSale {
        string buyer;
        uint256 finalPrice;
        string lotId;
        bool na;
    }
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
   
   
    
    mapping(address => Pesheur) public pesheurs;
    mapping(address => Veterinary) public Veters;
    mapping(address => Marayeur) public Mars;
    mapping(string => FishSale) public fishSales;
    mapping(uint256 => string) public packagesID;
    mapping(uint256 => string) public PrisesID;
    mapping(uint256 => address) public MarayeursAddress;
    mapping(string => string) public RFIDs;
    uint PecheID;
    uint256 indexPackage;
    uint VetIndex;
    uint MarIndex;
    uint PecheurIndex;

    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }
    function compareStrings(string memory a, string memory b) public pure returns (bool) {
        return (keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b)));
    }
      function getLotAndPechData(string memory lotId) public view returns (FishPackage memory,Pech memory) {
        FishPackage memory lot = fishPackages[lotId];
        require(bytes(lot.pechId).length != 0);

        Pech memory pech = pechs[lot.pechId];

        return ( lot,pech);
    }
     function prepLot(string memory packageID,uint256 minPrice,uint256 maxPrice) public onlyAdmin {
        
        
        fishPackages[packageID].minPrice =minPrice;
        fishPackages[packageID].maxPrice =maxPrice;


    }
        function changeTempPoidsPrise(string memory rfid,uint256 temperature,uint256 weight,uint256 _qte) public onlyAdmin {
        string memory idPak = RFIDs[rfid];
        FishPackage memory fp = fishPackages[idPak];
        fp.temperature = temperature;
        fp.weight = weight;
        fp.qte = _qte;
        fishPackages[idPak] = fp;

        }
   
    function getLotsByVeterinary(address _veterinaryWallet) public view returns (FishPackage[] memory) {
    // Create a dynamic array to store approved lots by the specified veterinary
    FishPackage[] memory approvedLots = new FishPackage[](indexPackage);
    
    uint count = 0;
    for (uint i = 0; i < indexPackage; i++) {
        string memory lotID = packagesID[i];
        FishPackage storage package = fishPackages[lotID];
        
        // Check if the package is approved by the specified veterinary
        if ( package.valid.Veterinary == _veterinaryWallet) {
            approvedLots[count] = package;
            count++;
        }
    }
   
    
    // Resize the array to contain only approved lots
    
    
    return approvedLots;
    }
    function getPriseByPesheur(address _PesheurWallet) public view returns (Pech[] memory) {
    // Create a dynamic array to store approved lots by the specified veterinary
    Pech[] memory pechPecheur = new Pech[](PecheID);
    
    uint count = 0;
    for (uint i = 0; i < PecheID; i++) {
        string memory pechID = PrisesID[i];
        Pech storage prise = pechs[pechID];
        
        // Check if the package is approved by the specified veterinary
        if ( prise.pecheur == _PesheurWallet) {
            pechPecheur[count] = prise;
            count++;
        }
    }
    return pechPecheur;
     }
     function getPriseByMarayeur(address _MarayeurWallet) public view returns (Pech[] memory) {
    // Create a dynamic array to store approved lots by the specified veterinary
    Pech[] memory pechPecheur = new Pech[](PecheID);
    
    uint count = 0;
    for (uint i = 0; i < PecheID; i++) {
        string memory pechID = PrisesID[i];
        Pech storage prise = pechs[pechID];
        
        // Check if the package is approved by the specified veterinary
        if ( prise.Marayeur == _MarayeurWallet) {
            pechPecheur[count] = prise;
            count++;
        }
    }
    return pechPecheur;
     }
      function getLotByPrise(string memory priseID) public view returns (FishPackage[] memory) {
    // Create a dynamic array to store approved lots by the specified veterinary
    FishPackage[] memory fsh = new FishPackage[](indexPackage);
    
    uint count = 0;
    for (uint i = 0; i < indexPackage; i++) {
        string memory packID = packagesID[i];
        FishPackage storage f = fishPackages[packID];
        
        // Check if the package is approved by the specified veterinary
        if (compareStrings(f.pechId, priseID)) {
            fsh[count] = f;
            count++;
        }
    }
    return fsh;
     }
      function getMarayeurs() public view returns (Marayeur[] memory) {
    // Create a dynamic array to store approved lots by the specified veterinary
    Marayeur[] memory Marayeurs = new Marayeur[](MarIndex);
    
    uint count = 0;
    for (uint i = 0; i < MarIndex; i++) {
        address marAdd = MarayeursAddress[i];
        Marayeur storage ma = Mars[marAdd];
        
        // Check if the package is approved by the specified veterinary
            Marayeurs[count] = ma;
            count++;
        
    }
    return Marayeurs;
     }
   
    function getPriseVenduParMarayeur(address wallet) public view returns (Pech[] memory) {
    // Create a dynamic array to store approved lots by the specified veterinary
    Pech[] memory Peching = new Pech[](PecheID);
    
    uint count = 0;
    for (uint i = 0; i < indexPackage ; i++) {
        string memory pack  = packagesID[i];
        FishSale storage ma = fishSales[pack];
        FishPackage memory pA = fishPackages[pack];
            if (ma.na != false)
            {
        // Check if the package is approved by the specified veterinary
            Pech memory p  = pechs[pA.pechId];

            if (p.Marayeur == wallet)
            {
            Peching[count] = p;
            count++;
            }
            }
          }
        
    
    return Peching;
     }
     function getProduitUserId(string memory userID) public view returns (FishPackage[] memory) {
    // Create a dynamic array to store approved lots by the specified veterinary
    FishPackage[] memory Pecks = new FishPackage[](indexPackage);
    
    uint count = 0;
    for (uint i = 0; i < indexPackage ; i++) {
        string memory pack  = packagesID[i];
        FishSale storage ma = fishSales[pack];
            if (ma.na != false)
            {
        // Check if the package is approved by the specified veterinary

            if (compareStrings(ma.buyer,userID))
            {
            Pecks[count] = fishPackages[pack];
            count++;
            }
            }
          }
        
    
    return Pecks;
     }
    function approveByVeterinary(string memory _packid,address _Veterinary) public onlyAdmin {
        require(fishPackages[_packid].valid.Veterinary == address(0));
        
        fishPackages[_packid].veterinaryApproval = true;
        fishPackages[_packid].valid.Veterinary = _Veterinary;
    }
   
    
}