const express = require('express');
const {Web3}  = require('web3');
const { ethers } = require('ethers');
const multer = require("multer");
const app = express();
app.use(express.json());

// Replace 'YOUR_SMART_CONTRACT_ABI' and 'YOUR_SMART_CONTRACT_ADDRESS' with actual values
const contractABI = require('./contract.json'); 
const contractAddress = "0x00c13db1AFE5Ad302C05F02314e2Dd42c32f2A38";
const marketplaceAbi = require('./marketplace.json'); // Replace this with the actual ABI of your FishMarketplace smart contract
const marketplaceAddress = '0xaAAaD29282Bac09a09835d98cf7E3F8255db5719'; // Replace this with the actual address of your FishMarketplace smart contract
const traceabilityAddress = contractAddress; // Replace this with the actual address of your FishTraceability smart contract

// Replace 'YOUR_ETH_NODE_URL' with the URL of your Ethereum node (e.g., Infura)

const web3 = new Web3(new Web3.providers.HttpProvider('https://polygon-mumbai.blockpi.network/v1/rpc/public'));
const provider = new ethers.providers.JsonRpcProvider('https://polygon-mumbai.blockpi.network/v1/rpc/public');

const contract = new web3.eth.Contract(contractABI, contractAddress);

const AdminPrivKey = "713b86cbd9689ccc2bd09bf4ca9030e4e3b4e484d7161b05dc45239ebdcaa0eb";
const AdminAddress = "0x9dD392F9aAa8c9fE1F69B184b586eE9CeF85861D";
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
    

    try {
      const transaction = contract.methods.closePech(pechId, dateFin,imageFish).encodeABI();
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
      const transaction = contract.methods.createFishPackage(pechId,packageID, temperature, weight, RFID, qrcode,imageFish).encodeABI();
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
  
  // Approve by veterinary (POST request)
  app.post('/approveByVeterinary', async (req, res) => {
    const packID = req.body.packID;
    const gasPrice = await provider.getFeeData();

    try {
      const transaction = contract.methods.approveByVeterinary(packID).encodeABI();
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
    const gasPrice = await provider.getFeeData();

    try {
      const transaction = marketplaceContract.methods.listPackage(packageId, price, reductionOffset).encodeABI();
      const receipt = await sendTransaction(AdminPrivKey, {from:AdminAddress,to: marketplaceAddress, data: transaction ,  maxPriorityFeePerGas: web3.utils.toHex(
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
