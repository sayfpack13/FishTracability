const express = require('express');
const {Web3}  = require('web3');
const { ethers } = require('ethers');
const multer = require("multer");
const app = express();
app.use(express.json());
const moment = require('moment');

// Replace 'YOUR_SMART_CONTRACT_ABI' and 'YOUR_SMART_CONTRACT_ADDRESS' with actual values
const contractABI = require('./contract.json'); 
const contractAddress = "0xadaED2193f5673D3144269d95016e5b3DcD494f1";
const marketplaceAbi = require('./marketplace.json'); // Replace this with the actual ABI of your FishMarketplace smart contract
const marketplaceAddress = '0xaAAaD29282Bac09a09835d98cf7E3F8255db5719'; // Replace this with the actual address of your FishMarketplace smart contract
const traceabilityAddress = contractAddress; // Replace this with the actual address of your FishTraceability smart contract

// Replace 'YOUR_ETH_NODE_URL' with the URL of your Ethereum node (e.g., Infura)

const web3 = new Web3(new Web3.providers.HttpProvider('https://polygon-mumbai.blockpi.network/v1/rpc/public'));
const provider = new ethers.providers.JsonRpcProvider('https://polygon-mumbai.blockpi.network/v1/rpc/public');

const contract = new web3.eth.Contract(contractABI, contractAddress);

const AdminPrivKey = "5287dc912478bf431893c7f6dcd1357bd28df89003398e4deb7093f2c6c367f3";
const AdminAddress = "0x0347C3c53368BD90688806E4e2f52e0Ad897004c";
const marketplaceContract = new web3.eth.Contract(marketplaceAbi, marketplaceAddress);
async function sendTransaction(privateKey, transactionObject) {
    // const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    // console.log(account);
    const signedTransaction = await web3.eth.accounts.signTransaction(transactionObject, privateKey);
    console.log(signedTransaction);
    return web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
  }
// Endpoint to create a new wallet with a new private key
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Destination folder where files will be stored
    },
    filename: function (req, file, cb) {
      // Set the filename to be the original name of the uploaded file
      cb(null, file.originalname);
    }
  });
  
  // Create a multer instance, passing the storage engine configuration
  const upload = multer({ storage });
  
  // Endpoint to handle file uploads
  app.post('/upload', upload.single('file'), (req, res) => {
    // If you need to access the uploaded file, you can use req.file
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
  
    // Do something with the file, for example, you can send a success response
    res.json({ message: 'File uploaded successfully' });
  });
  app.get('/download/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'uploads', filename);
  
    // Check if the file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).json({ error: 'File not found' });
      }
  
      // Stream the file back to the client
      const fileStream = fs.createReadStream(filePath);
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      fileStream.pipe(res);
    });
  });
app.post('/create-wallet', (req, res) => {
  try {
    // Create a new account with a new private key
    const account = web3.eth.accounts.create();

    // Return the address and newly generated private key
    return res.json({
      address: account.address,
      privateKey: account.privateKey
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error creating wallet.' });
  }
});
app.post('/recordFishSale', async (req, res) => {

  const gasPrice = await provider.getFeeData();

  const finalPrice = req.body.finalPrice;
  const userID = req.body.userID;
  const lotID = req.body.lotID;

    const transaction = contract.methods.recordFishSale(finalPrice,userID,lotID).encodeABI();
    const receipt = await sendTransaction(AdminPrivKey, {from:AdminAddress, to: contractAddress, data: transaction,
    maxPriorityFeePerGas: web3.utils.toHex(
      Number(gasPrice.maxPriorityFeePerGas)
    ),

    maxFeePerGas: web3.utils.toHex(
      Number(gasPrice.maxFeePerGas)
    ),
    gas: ethers.BigNumber.from(400000).toHexString() });
    res.json({ transactionHash: receipt.transactionHash });
 
});

app.post('/getProduitUserId', async (req, res) => {


  const userID = req.body.userID;

    const transaction = await contract.methods.getProduitUserId(userID).call();
    const jsons = transaction.map((ret)=> {return{
      pechId: ret.pechId,
      temperature: Number(ret.temperature),
      weight: Number(ret.weight),
      RFID: ret[4],
      qrcode: ret.qrcode,
      veterinaryApproval: ret.veterinaryApproval,
      qualityControlApproval: ret.qualityControlApproval,
      imageFish: ret.imageFish,
      minPrice: Number(ret.minPrice),
      maxPrice: Number(ret.maxPrice),
      
        Veterinary: ret.valid.Veterinary,
      
      qte: Number(ret.qte)
    
    
    }
  })
    res.json(jsons);
});

app.post('/getLotAndPechData', async (req, res) => {

  try{
  const lotID = req.body.lotID;

    const transaction = await contract.methods.getLotAndPechData(lotID).call();
    const pech = transaction[0];
    const lot = transaction[1];
    const lotDateDeb = String(lot.dateDeb);
    const lotDateFin = String(lot.dateFin);

    const datelotDateDeb = new Date(lotDateDeb);
    const datelotDateFin = new Date(lotDateFin);


const formatteddatelotDateDeb = moment(datelotDateDeb).format('YYYY-MM-DD HH:mm:ss');
const formatteddatelotDateFin = moment(datelotDateFin).format('YYYY-MM-DD HH:mm:ss');

    const jsonData = { lot:{
      pechId: Number(pech.pechId),
      temperature: Number(pech.temperature),
      weight: Number(pech.weight),
      RFID: pech.RFID,
      qrcode: pech.qrcode,
      veterinaryApproval: pech.veterinaryApproval,
      qualityControlApproval: pech.qualityControlApproval,
      imageFish: pech.imageFish,
      minPrice: Number(pech.minPrice),
      maxPrice: Number(pech.maxPrice) 
    },pech:{
      id: lot.id,
      walletPecheur: lot.pecheur,
      location: lot.location,
      engineTitle: lot.engineTitle,
      enginePhotoHash: lot.enginePhotoHash,
      engineType:  lot.engineType,
      dateDeb: formatteddatelotDateDeb,
      dateFin: formatteddatelotDateFin,
      closed: lot.closed,
      imageFish: lot.imageFish,
      MarayeurWallet: lot.Marayeur,
      dateDebarquement:Number(lot.deb.dateDebarquement),
      debarqued:lot.deb.debarqued
     
    }
    };
      console.log(jsonData);

    res.json(jsonData);
  }
  catch (err)
  {
    res.json(err);
  }
 
});
app.post('/getPrises', async (req, res) => {


  const priseID = req.body.priseID;

    const transaction = contract.methods.pechs(priseID).call();
    const jsonData = JSON.stringify({ prise : transaction });

    res.json(jsonData);
 
});
app.post('/addPesheur', async (req, res) => {

    const gasPrice = await provider.getFeeData();
    console.log(gasPrice);

    const wallet = req.body.wallet;
    const name = req.body.name;
    const lastName = req.body.lastName;
    const pesheurID = req.body.pesheurID;

      const transaction = contract.methods.addPesheur(wallet,name, lastName,pesheurID).encodeABI();
      const receipt = await sendTransaction(AdminPrivKey, {from:AdminAddress, to: contractAddress, data: transaction,
      maxPriorityFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxPriorityFeePerGas)
      ),
 
      maxFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxFeePerGas)
      ),
      gas: ethers.BigNumber.from(400000).toHexString() });
      res.json({ transactionHash: receipt.transactionHash });
   
  });

  app.post('/addMarayeur', async (req, res) => {

    const gasPrice = await provider.getFeeData();
    console.log(gasPrice);

    const wallet = req.body.wallet;
    const name = req.body.name;
    const lastName = req.body.lastName;
    const MarID = req.body.MarID;

      const transaction = contract.methods.addMar(wallet,name, lastName,MarID).encodeABI();
      const receipt = await sendTransaction(AdminPrivKey, {from:AdminAddress, to: contractAddress, data: transaction,
      maxPriorityFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxPriorityFeePerGas)
      ),
 
      maxFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxFeePerGas)
      ),
      gas: ethers.BigNumber.from(400000).toHexString() });
      res.json({ transactionHash: receipt.transactionHash });
   
  });
  app.post('/ModMarayeur', async (req, res) => {

    const gasPrice = await provider.getFeeData();
    console.log(gasPrice);

    const wallet = req.body.wallet;
    const name = req.body.name;
    const lastName = req.body.lastName;
    const MarId = req.body.MarId;

      const transaction = contract.methods.ModifMar(wallet,name, lastName,MarId).encodeABI();
      const receipt = await sendTransaction(AdminPrivKey, {from:AdminAddress, to: contractAddress, data: transaction,
      maxPriorityFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxPriorityFeePerGas)
      ),
 
      maxFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxFeePerGas)
      ),
      gas: ethers.BigNumber.from(400000).toHexString() });
      res.json({ transactionHash: receipt.transactionHash });
   
  });
  app.post('/ModVet', async (req, res) => {

    const gasPrice = await provider.getFeeData();
    console.log(gasPrice);

    const wallet = req.body.wallet;
    const name = req.body.name;
    const lastName = req.body.lastName;
    const VetID = req.body.VetID;

      const transaction = contract.methods.ModVet(wallet,name, lastName,VetID).encodeABI();
      const receipt = await sendTransaction(AdminPrivKey, {from:AdminAddress, to: contractAddress, data: transaction,
      maxPriorityFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxPriorityFeePerGas)
      ),
 
      maxFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxFeePerGas)
      ),
      gas: ethers.BigNumber.from(400000).toHexString() });
      res.json({ transactionHash: receipt.transactionHash });
   
  });
  app.post('/ModifPesheur', async (req, res) => {

    const gasPrice = await provider.getFeeData();
    console.log(gasPrice);

    const wallet = req.body.wallet;
    const name = req.body.name;
    const lastName = req.body.lastName;
    const pesheurID = req.body.pesheurID;

      const transaction = contract.methods.ModifPesheur(wallet,name, lastName,pesheurID).encodeABI();
      const receipt = await sendTransaction(AdminPrivKey, {from:AdminAddress, to: contractAddress, data: transaction,
      maxPriorityFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxPriorityFeePerGas)
      ),
 
      maxFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxFeePerGas)
      ),
      gas: ethers.BigNumber.from(400000).toHexString() });
      res.json({ transactionHash: receipt.transactionHash });
   
  });
  
  app.post('/addVet', async (req, res) => {

    const gasPrice = await provider.getFeeData();
    console.log(gasPrice);

    const wallet = req.body.wallet;
    const name = req.body.name;
    const lastName = req.body.lastName;
    const VetID = req.body.VetID;

      const transaction = contract.methods.addVet(wallet,name, lastName,VetID).encodeABI();
      const receipt = await sendTransaction(AdminPrivKey, {from:AdminAddress, to: contractAddress, data: transaction,
      maxPriorityFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxPriorityFeePerGas)
      ),
 
      maxFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxFeePerGas)
      ),
      gas: ethers.BigNumber.from(400000).toHexString() });
      res.json({ transactionHash: receipt.transactionHash });
   
  });
  // Initiate a pech (POST request)
  app.post('/initiatePech', async (req, res) => {
    const pechId = req.body.pechId;
    const location = req.body.location;
    const engineTitle = req.body.engineTitle;
    const enginePhotoHash = req.body.enginePhotoHash;
    const engineType = req.body.engineType;
    const dateDeb = req.body.dateDeb;
    const walletPecheur = req.body.walletPecheur;
    const gasPrice = await provider.getFeeData();

    try {
      const transaction = contract.methods.initiatePech(walletPecheur,pechId, location, engineTitle, enginePhotoHash, engineType, dateDeb).encodeABI();
      const receipt = await sendTransaction(AdminPrivKey, {from:AdminAddress, to: contractAddress, data: transaction,  maxPriorityFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxPriorityFeePerGas)
      ),
 
      maxFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxFeePerGas)
      ),
      gas: ethers.BigNumber.from(400000).toHexString() });
      res.json({ transactionHash: receipt.transactionHash });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Close a pech (POST request)
  app.post('/closePech', async (req, res) => {
    const pechId = req.body.pechId;
    const dateFin = req.body.dateFin;
    const imageFish = req.body.imageFish;
    const gasPrice = await provider.getFeeData();
    

      const transaction = contract.methods.closePech(pechId, dateFin,imageFish).encodeABI();
      const receipt = await sendTransaction(AdminPrivKey, {from:AdminAddress, to: contractAddress, data: transaction ,  maxPriorityFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxPriorityFeePerGas)
      ),
 
      maxFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxFeePerGas)
      ),
      gas: ethers.BigNumber.from(400000).toHexString() });
      res.json({ transactionHash: receipt.transactionHash });
    
  });
  
  // Create a fish package (POST request)
  app.post('/createFishPackage', async (req, res) => {
    const pechId = req.body.pechId;
    const temperature = req.body.temperature;
    const weight = req.body.weight;
    const RFID = req.body.RFID;
    const qrcode = req.body.qrcode;
    const imageFish = req.body.imageFish;
    const packageID = req.body.packageID;
    const gasPrice = await provider.getFeeData();
    try {
      const transaction = contract.methods.createFishPackage(packageID,pechId, temperature, weight, RFID, qrcode,imageFish).encodeABI();
      const receipt = await sendTransaction(AdminPrivKey, {from:AdminAddress, to: contractAddress, data: transaction ,  maxPriorityFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxPriorityFeePerGas)
      ),
 
      maxFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxFeePerGas)
      ),
      gas: ethers.BigNumber.from(400000).toHexString() });
      res.json({ transactionHash: receipt.transactionHash });
      console.log(res)
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post('/changeTempPoidsPrise', async (req, res) => {
    const _RFID = req.body._RFID;
    const temperature = req.body.temperature;
    const weight = req.body.weight;
    const _qte = req.body._qte;

    
    const gasPrice = await provider.getFeeData();

    try {
      const transaction = contract.methods.changeTempPoidsPrise(_RFID,temperature,weight,_qte).encodeABI();
      const receipt = await sendTransaction(AdminPrivKey, {from:AdminAddress,to: contractAddress, data: transaction  ,  maxPriorityFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxPriorityFeePerGas)
      ),
 
      maxFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxFeePerGas)
      ),
      gas: ethers.BigNumber.from(400000).toHexString() });
      res.json({ transactionHash: receipt.transactionHash });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  
  // Approve by veterinary (POST request)
  
  app.post('/refuseByVeterinary', async (req, res) => {
    const packID = req.body.packID;
    const wallet = req.body.wallet;

    const gasPrice = await provider.getFeeData();

    try {
      const transaction = contract.methods.refuseByVeterinary(packID,wallet).encodeABI();
      const receipt = await sendTransaction(AdminPrivKey, {from:AdminAddress,to: contractAddress, data: transaction  ,  maxPriorityFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxPriorityFeePerGas)
      ),
 
      maxFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxFeePerGas)
      ),
      gas: ethers.BigNumber.from(400000).toHexString() });
      res.json({ transactionHash: receipt.transactionHash });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post('/affecterPechToMarayeur', async (req, res) => {
    const pechID = req.body.pechID;
    const Marrayeur = req.body.Marrayeur;
    const gasPrice = await provider.getFeeData();

    try {
      const transaction = contract.methods.affecterPechToMarayeur(pechID,Marrayeur).encodeABI();
      const receipt = await sendTransaction(AdminPrivKey, {from:AdminAddress,to: contractAddress, data: transaction  ,  maxPriorityFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxPriorityFeePerGas)
      ),
 
      maxFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxFeePerGas)
      ),
      gas: ethers.BigNumber.from(400000).toHexString() });
      res.json({ transactionHash: receipt.transactionHash });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post('/ModifierDateDebarquement', async (req, res) => {
    const _pechId = req.body._pechId;
    const dateDebarq = req.body.dateDebarq;
    const gasPrice = await provider.getFeeData();

    try {
      const transaction = contract.methods.ModDebarquement(_pechId,dateDebarq).encodeABI();
      const receipt = await sendTransaction(AdminPrivKey, {from:AdminAddress,to: contractAddress, data: transaction  ,  maxPriorityFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxPriorityFeePerGas)
      ),
 
      maxFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxFeePerGas)
      ),
      gas: ethers.BigNumber.from(400000).toHexString() });
      res.json({ transactionHash: receipt.transactionHash });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });



  app.post('/prepLotPminPmax', async (req, res) => {
    const lotID = req.body.lotID;
    const minPrice =req.body.minPrice;
    const maxPrice =req.body.maxPrice;
    const BigMin = (parseFloat(minPrice) * 10**18).toString();
    const BigMax = (parseFloat(maxPrice) * 10**18).toString()

    const gasPrice = await provider.getFeeData();

    try {
      const transaction = contract.methods.prepLot(lotID,BigMin,BigMax).encodeABI();
      const receipt = await sendTransaction(AdminPrivKey, {from:AdminAddress,to: contractAddress, data: transaction  ,  maxPriorityFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxPriorityFeePerGas)
      ),
 
      maxFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxFeePerGas)
      ),
      gas: ethers.BigNumber.from(400000).toHexString() });
      res.json({ transactionHash: receipt.transactionHash });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  

  app.post('/approveByVeterinary', async (req, res) => {
    const packID = req.body.packID;
    const wallet = req.body.wallet;

    const gasPrice = await provider.getFeeData();

    try {
      const transaction = contract.methods.approveByVeterinary(packID,wallet).encodeABI();
      const receipt = await sendTransaction(AdminPrivKey, {from:AdminAddress,to: contractAddress, data: transaction  ,  maxPriorityFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxPriorityFeePerGas)
      ),
 
      maxFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxFeePerGas)
      ),
      gas: ethers.BigNumber.from(400000).toHexString() });
      res.json({ transactionHash: receipt.transactionHash });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Approve by quality manager (POST request)
  app.post('/approveByQualityManager', async (req, res) => {
    const pechId = req.body.pechId;
    const gasPrice = await provider.getFeeData();

    try {
      const transaction = contract.methods.approveByQualityManager(pechId).encodeABI();
      const receipt = await sendTransaction(AdminPrivKey, {from:AdminAddress, to: contractAddress, data: transaction ,  maxPriorityFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxPriorityFeePerGas)
      ),
 
      maxFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxFeePerGas)
      ),
      gas: ethers.BigNumber.from(400000).toHexString() });
      res.json({ transactionHash: receipt.transactionHash });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  app.post('/listPackage', async (req, res) => {
    const packageId = req.body.packageId;
    const price = req.body.price;
    const reductionOffset = req.body.reductionOffset;

    try {
      const transaction = marketplaceContract.methods.listPackage(packageId, price, reductionOffset).call();
      
      res.json({ data:transaction });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/getLotByPrise', async (req, res) => {
    const priseId = req.body.priseId;
   
    try {
      const transaction = await contract.methods.getLotByPrise(priseId).call();
      const jsons = transaction.map((ret)=> {return{
        pechId: ret.pechId,
        temperature: Number(ret.temperature),
        weight: Number(ret.weight),
        RFID: ret[4],
        qrcode: ret.qrcode,
        veterinaryApproval: ret.veterinaryApproval,
        qualityControlApproval: ret.qualityControlApproval,
        imageFish: ret.imageFish,
        minPrice: Number(ret.minPrice),
        maxPrice: Number(ret.maxPrice),
        
          Veterinary: ret.valid.Veterinary,
        
        qte: Number(ret.qte)
      
      
      }
    })
      res.json(jsons);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  


  
  app.post('/getPriseVenduParMarayeur', async (req, res) => {
    const wallet = req.body.wallet;
   

    try {
      const jsons=[];
      const transaction = await contract.methods.getPriseVenduParMarayeur(wallet).call();
      for(var i=0; i < transaction.length ; i++)
      {
        const ret =transaction[i]
        jsons.push({
          id: ret.id,
          pecheur: ret.pecheur,
          location: ret.location,
          engineTitle: ret.engineTitle,
          enginePhotoHash: ret.enginePhotoHash,
          engineType: ret.engineType,
          dateDeb: Number(ret.dateDeb),
          dateFin: Number(ret.dateFin),
          closed: ret.closed,
          imageFish: ret.imageFish,
          Marayeur: ret.Marayeur,
          dateDebarquement : Number(ret.deb.dateDebarquement),
          debarqued:Number(ret.deb.debarqued)
  
       
        })
      }
      
      res.json(jsons);      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post('/getPriseByPecheur', async (req, res) => {
    const wallet = req.body.wallet;
   

    try {
      const jsons=[];
      const transaction = await contract.methods.getPriseByPesheur(wallet).call();
      for(var i=0; i < transaction.length ; i++)
      {
        const ret =transaction[i]
        jsons.push({
          id: ret.id,
          pecheur: ret.pecheur,
          location: ret.location,
          engineTitle: ret.engineTitle,
          enginePhotoHash: ret.enginePhotoHash,
          engineType: ret.engineType,
          dateDeb: Number(ret.dateDeb),
          dateFin: Number(ret.dateFin),
          closed: ret.closed,
          imageFish: ret.imageFish,
          Marayeur: ret.Marayeur,
          dateDebarquement : Number(ret.deb.dateDebarquement),
          debarqued:Number(ret.deb.debarqued)
  
       
        })
      }
      
      res.json(jsons);
      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post('/getMarayeurs', async (req, res) => {
    try {
      const transaction = await contract.methods.getMarayeurs().call();
      console.log(transaction)
      res.json({ data:transaction });
      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  
  app.post('/getPriseByMarayeur', async (req, res) => {
    const wallet = req.body.wallet;
   

    try {
      const jsons=[];
      const transaction = await contract.methods.getPriseByMarayeur(wallet).call();
      for(var i=0; i < transaction.length ; i++)
      {
        const ret =transaction[i]
        jsons.push({
          id: ret.id,
          pecheur: ret.pecheur,
          location: ret.location,
          engineTitle: ret.engineTitle,
          enginePhotoHash: ret.enginePhotoHash,
          engineType: ret.engineType,
          dateDeb: Number(ret.dateDeb),
          dateFin: Number(ret.dateFin),
          closed: ret.closed,
          imageFish: ret.imageFish,
          Marayeur: ret.Marayeur,
          dateDebarquement : Number(ret.deb.dateDebarquement),
          debarqued:Number(ret.deb.debarqued)
  
       
        })
      }
      
      res.json(jsons);
      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

  app.post('/getLotsByVeterinary', async (req, res) => {
    const wallet = req.body.wallet;
   

      const transaction = await contract.methods.getLotsByVeterinary(wallet).call();
      console.log(transaction)
      const jsons = transaction.map((ret)=> { return{
        pechId: ret.pechId,
        temperature: Number(ret.temperature),
        weight: Number(ret.weight),
        RFID: ret[4],
        qrcode: ret.qrcode,
        veterinaryApproval: ret.veterinaryApproval,
        qualityControlApproval: ret.qualityControlApproval,
        imageFish: ret.imageFish,
        minPrice: Number(ret.minPrice),
        maxPrice: Number(ret.maxPrice),
        
          Veterinary: ret.valid.Veterinary,
        
        qte: Number(ret.qte)
      }
    }
      )
      res.json(jsons);
      
   
  });
  app.post('/getPesheurFWallet', async (req, res) => {
    const wallet = req.body.wallet;
   

    try {
      const transaction = await contract.methods.pesheurs(wallet).call();
      res.json({ data:transaction });
      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post('/getVetFWallet', async (req, res) => {
    const wallet = req.body.wallet;
   

    try {
      const transaction = await contract.methods.Veters(wallet).call();
      res.json({ data:transaction });
      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Buy a package (POST request)
  app.post('/buyPackage', async (req, res) => {
    const packageId = req.body.packageId;
    const gasPrice = await provider.getFeeData();

    try {
      const transaction = marketplaceContract.methods.buyPackage(packageId).encodeABI();
      const receipt = await sendTransaction(AdminPrivKey, {from:AdminAddress,to: marketplaceAddress, data: transaction, value: web3.utils.toWei(req.body.amount, 'ether') ,  maxPriorityFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxPriorityFeePerGas)
      ),
 
      maxFeePerGas: web3.utils.toHex(
        Number(gasPrice.maxFeePerGas)
      ),
      gas: ethers.BigNumber.from(400000).toHexString() });
      res.json({ transactionHash: receipt.transactionHash });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get the current price of a package (GET request)
  app.get('/getCurrentPrice/:packageId', async (req, res) => {
    const packageId = req.params.packageId;
  
    try {
      const currentPrice = await marketplaceContract.methods.getCurrentPrice(packageId).call();
      res.json({ currentPrice: web3.utils.fromWei(currentPrice, 'ether') });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Check if a package is sold (GET request)
  app.get('/isPackageSold/:packageId', async (req, res) => {
    const packageId = req.params.packageId;
  
    try {
      const isSold = await marketplaceContract.methods.isPackageSold(packageId).call();
      res.json({ isSold });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get package data from the traceability contract (GET request)
  app.get('/getPackageData/:packageId', async (req, res) => {
    const packageId = req.params.packageId;
  
    try {
      const traceabilityAbi = require('./traceability_abi'); // Replace this with the actual ABI of your FishTraceability smart contract
      const traceabilityContract = new web3.eth.Contract(traceabilityAbi, traceabilityAddress);
  
      const packageData = await traceabilityContract.methods.getPackageData(packageId).call();
      res.json(packageData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
// Endpoint to execute the smart contract (You'll need to add your contract method calls here)

// Start the Express server
const port = 8080; // Replace with the desired port number
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
