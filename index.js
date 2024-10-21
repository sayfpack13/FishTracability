const express = require('express');
const { Web3 } = require('web3');
const { ethers } = require('ethers');
const multer = require("multer");
const app = express();
app.use(express.json());
const moment = require('moment');

// Replace 'YOUR_SMART_CONTRACT_ABI' and 'YOUR_SMART_CONTRACT_ADDRESS' with actual values
const contractABI = require('./contract.json');
const contractAddress = "0x52d4bd0D1a283cF46Cc84c8ef97CA59E645D531f";
const marketplaceAbi = require('./marketplace.json'); // Replace this with the actual ABI of your FishMarketplace smart contract
const marketplaceAddress = '0xf4e01852AD99a963eD66976ce8A5cBE4620766DD'; // Replace this with the actual address of your FishMarketplace smart contract
const traceabilityAddress = contractAddress; // Replace this with the actual address of your FishTraceability smart contract

// Replace 'YOUR_ETH_NODE_URL' with the URL of your Ethereum node (e.g., Infura)
const web3 = new Web3(new Web3.providers.HttpProvider('https://polygon-amoy-bor-rpc.publicnode.com'));
const provider = new ethers.providers.JsonRpcProvider('https://polygon-amoy-bor-rpc.publicnode.com');

const contract = new web3.eth.Contract(contractABI, contractAddress);

const AdminPrivKey = "6ab58bfd64bd6e3863e0137da71c5a3ab754500f3db033108632a32a8562aa8c";
const AdminAddress = "0xd07D99c95183B35eaA22269ba065c72C75696549";
const marketplaceContract = new web3.eth.Contract(marketplaceAbi, marketplaceAddress);




// Utility function to get gas fees
async function getGasFees() {
  const gasPrice = await provider.getFeeData();
  return {
    maxPriorityFeePerGas: web3.utils.toHex(Number(gasPrice.maxPriorityFeePerGas)),
    maxFeePerGas: web3.utils.toHex(Number(gasPrice.maxFeePerGas)),
  };
}





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
  try {
    const { finalPrice, userID, lotID } = req.body;
    const { maxPriorityFeePerGas, maxFeePerGas } = await getGasFees();

    const transaction = contract.methods
      .recordFishSale(finalPrice, userID, lotID)
      .encodeABI();

    const receipt = await sendTransaction(AdminPrivKey, {
      from: AdminAddress,
      to: contractAddress,
      data: transaction,
      maxPriorityFeePerGas,
      maxFeePerGas,
      gas: ethers.BigNumber.from(400000).toHexString(),
    });

    res.json({ transactionHash: receipt.transactionHash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/getProduitUserId', async (req, res) => {


  const userID = req.body.userID;

  const transaction = await contract.methods.getProduitUserId(userID).call();
  const jsons = transaction.map((ret) => {
    return {
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

  try {
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

    const jsonData = {
      lot: {
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
      }, pech: {
        id: lot.id,
        walletPecheur: lot.pecheur,
        location: lot.location,
        engineTitle: lot.engineTitle,
        enginePhotoHash: lot.enginePhotoHash,
        engineType: lot.engineType,
        dateDeb: formatteddatelotDateDeb,
        dateFin: formatteddatelotDateFin,
        closed: lot.closed,
        imageFish: lot.imageFish,
        MarayeurWallet: lot.Marayeur,
        dateDebarquement: Number(lot.deb.dateDebarquement),
        debarqued: lot.deb.debarqued

      }
    };
    console.log(jsonData);

    res.json(jsonData);
  }
  catch (err) {
    res.json(err);
  }

});


app.post('/getPrises', async (req, res) => {
  const priseID = req.body.priseID;

  const transaction = contract.methods.pechs(priseID).call();
  const jsonData = JSON.stringify({ prise: transaction });

  res.json(jsonData);

});



app.post('/addPesheur', async (req, res) => {
  try {
    const { wallet, name, lastName, pesheurID } = req.body;
    const { maxPriorityFeePerGas, maxFeePerGas } = await getGasFees();

    const transaction = contract.methods
      .addPesheur(wallet, name, lastName, pesheurID)
      .encodeABI();

    const receipt = await sendTransaction(AdminPrivKey, {
      from: AdminAddress,
      to: contractAddress,
      data: transaction,
      maxPriorityFeePerGas,
      maxFeePerGas,
      gas: ethers.BigNumber.from(400000).toHexString(),
    });

    res.json({ transactionHash: receipt.transactionHash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


app.post('/addMarayeur', async (req, res) => {
  try {
    const { wallet, name, lastName, MarID } = req.body;
    const { maxPriorityFeePerGas, maxFeePerGas } = await getGasFees();

    const transaction = contract.methods
      .addMar(wallet, name, lastName, MarID)
      .encodeABI();

    const receipt = await sendTransaction(AdminPrivKey, {
      from: AdminAddress,
      to: contractAddress,
      data: transaction,
      maxPriorityFeePerGas,
      maxFeePerGas,
      gas: ethers.BigNumber.from(400000).toHexString(),
    });

    res.json({ transactionHash: receipt.transactionHash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});





app.post('/ModMarayeur', async (req, res) => {
  try {
    const { wallet, name, lastName, MarId } = req.body;
    const { maxPriorityFeePerGas, maxFeePerGas } = await getGasFees();

    const transaction = contract.methods
      .ModifMar(wallet, name, lastName, MarId)
      .encodeABI();

    const receipt = await sendTransaction(AdminPrivKey, {
      from: AdminAddress,
      to: contractAddress,
      data: transaction,
      maxPriorityFeePerGas,
      maxFeePerGas,
      gas: ethers.BigNumber.from(400000).toHexString(),
    });

    res.json({ transactionHash: receipt.transactionHash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


app.post('/ModVet', async (req, res) => {
  try {
    const { wallet, name, lastName, VetID } = req.body;
    const { maxPriorityFeePerGas, maxFeePerGas } = await getGasFees();

    const transaction = contract.methods
      .ModVet(wallet, name, lastName, VetID)
      .encodeABI();

    const receipt = await sendTransaction(AdminPrivKey, {
      from: AdminAddress,
      to: contractAddress,
      data: transaction,
      maxPriorityFeePerGas,
      maxFeePerGas,
      gas: ethers.BigNumber.from(400000).toHexString(),
    });

    res.json({ transactionHash: receipt.transactionHash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});




app.post('/ModifPesheur', async (req, res) => {
  try {
    const { wallet, name, lastName, pesheurID } = req.body;
    const { maxPriorityFeePerGas, maxFeePerGas } = await getGasFees();

    const transaction = contract.methods
      .ModifPesheur(wallet, name, lastName, pesheurID)
      .encodeABI();

    const receipt = await sendTransaction(AdminPrivKey, {
      from: AdminAddress,
      to: contractAddress,
      data: transaction,
      maxPriorityFeePerGas,
      maxFeePerGas,
      gas: ethers.BigNumber.from(400000).toHexString(),
    });

    res.json({ transactionHash: receipt.transactionHash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


app.post('/addVet', async (req, res) => {
  try {
    const { wallet, name, lastName, VetID } = req.body;
    const { maxPriorityFeePerGas, maxFeePerGas } = await getGasFees();

    const transaction = contract.methods
      .addVet(wallet, name, lastName, VetID)
      .encodeABI();

    const receipt = await sendTransaction(AdminPrivKey, {
      from: AdminAddress,
      to: contractAddress,
      data: transaction,
      maxPriorityFeePerGas,
      maxFeePerGas,
      gas: ethers.BigNumber.from(400000).toHexString(),
    });

    res.json({ transactionHash: receipt.transactionHash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});




// Initiate a pech (POST request)
app.post('/initiatePech', async (req, res) => {
  const {
    pechId,
    location,
    engineTitle,
    enginePhotoHash,
    engineType,
    dateDeb,
    walletPecheur,
  } = req.body;

  try {
    const { maxPriorityFeePerGas, maxFeePerGas } = await getGasFees();

    const transaction = contract.methods
      .initiatePech(walletPecheur, pechId, location, engineTitle, enginePhotoHash, engineType, dateDeb)
      .encodeABI();

    const receipt = await sendTransaction(AdminPrivKey, {
      from: AdminAddress,
      to: contractAddress,
      data: transaction,
      maxPriorityFeePerGas,
      maxFeePerGas,
      gas: ethers.BigNumber.from(400000).toHexString(),
    });

    res.json({ transactionHash: receipt.transactionHash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


// Close a pech (POST request)
app.post('/closePech', async (req, res) => {
  const { pechId, dateFin, imageFish } = req.body;

  try {
    const { maxPriorityFeePerGas, maxFeePerGas } = await getGasFees();

    const transaction = contract.methods
      .closePech(pechId, dateFin, imageFish)
      .encodeABI();

    const receipt = await sendTransaction(AdminPrivKey, {
      from: AdminAddress,
      to: contractAddress,
      data: transaction,
      maxPriorityFeePerGas,
      maxFeePerGas,
      gas: ethers.BigNumber.from(400000).toHexString(),
    });

    res.json({ transactionHash: receipt.transactionHash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


// Create a fish package (POST request)
app.post('/createFishPackage', async (req, res) => {
  const {
    pechId,
    temperature,
    weight,
    RFID,
    qrcode,
    imageFish,
    packageID,
  } = req.body;

  try {
    const { maxPriorityFeePerGas, maxFeePerGas } = await getGasFees();

    const transaction = contract.methods
      .createFishPackage(packageID, pechId, temperature, weight, RFID, qrcode, imageFish)
      .encodeABI();

    const receipt = await sendTransaction(AdminPrivKey, {
      from: AdminAddress,
      to: contractAddress,
      data: transaction,
      maxPriorityFeePerGas,
      maxFeePerGas,
      gas: ethers.BigNumber.from(400000).toHexString(),
    });

    res.json({ transactionHash: receipt.transactionHash });
    console.log(receipt); // Log the receipt for debugging
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});





// Change temperature and weight (POST request)
app.post('/changeTempPoidsPrise', async (req, res) => {
  const { _RFID, temperature, weight, _qte } = req.body;

  try {
    const { maxPriorityFeePerGas, maxFeePerGas } = await getGasFees();

    const transaction = contract.methods.changeTempPoidsPrise(_RFID, temperature, weight, _qte).encodeABI();
    const receipt = await sendTransaction(AdminPrivKey, {
      from: AdminAddress,
      to: contractAddress,
      data: transaction,
      maxPriorityFeePerGas,
      maxFeePerGas,
      gas: ethers.BigNumber.from(400000).toHexString(),
    });

    res.json({ transactionHash: receipt.transactionHash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Refuse by veterinary (POST request)
app.post('/refuseByVeterinary', async (req, res) => {
  const { packID, wallet } = req.body;

  try {
    const { maxPriorityFeePerGas, maxFeePerGas } = await getGasFees();

    const transaction = contract.methods.refuseByVeterinary(packID, wallet).encodeABI();
    const receipt = await sendTransaction(AdminPrivKey, {
      from: AdminAddress,
      to: contractAddress,
      data: transaction,
      maxPriorityFeePerGas,
      maxFeePerGas,
      gas: ethers.BigNumber.from(400000).toHexString(),
    });

    res.json({ transactionHash: receipt.transactionHash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Affect pech to Marayeur (POST request)
app.post('/affecterPechToMarayeur', async (req, res) => {
  const { pechID, Marrayeur } = req.body;

  try {
    const { maxPriorityFeePerGas, maxFeePerGas } = await getGasFees();

    const transaction = contract.methods.affecterPechToMarayeur(pechID, Marrayeur).encodeABI();
    const receipt = await sendTransaction(AdminPrivKey, {
      from: AdminAddress,
      to: contractAddress,
      data: transaction,
      maxPriorityFeePerGas,
      maxFeePerGas,
      gas: ethers.BigNumber.from(400000).toHexString(),
    });

    res.json({ transactionHash: receipt.transactionHash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Modify date of debarquement (POST request)
app.post('/ModifierDateDebarquement', async (req, res) => {
  const { _pechId, dateDebarq } = req.body;

  try {
    const { maxPriorityFeePerGas, maxFeePerGas } = await getGasFees();

    const transaction = contract.methods.ModDebarquement(_pechId, dateDebarq).encodeABI();
    const receipt = await sendTransaction(AdminPrivKey, {
      from: AdminAddress,
      to: contractAddress,
      data: transaction,
      maxPriorityFeePerGas,
      maxFeePerGas,
      gas: ethers.BigNumber.from(400000).toHexString(),
    });

    res.json({ transactionHash: receipt.transactionHash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Prepare lot (POST request)
app.post('/prepLotPminPmax', async (req, res) => {
  const { lotID, minPrice, maxPrice } = req.body;
  const BigMin = (parseFloat(minPrice) * 10 ** 18).toString();
  const BigMax = (parseFloat(maxPrice) * 10 ** 18).toString();

  try {
    const { maxPriorityFeePerGas, maxFeePerGas } = await getGasFees();

    const transaction = contract.methods.prepLot(lotID, BigMin, BigMax).encodeABI();
    const receipt = await sendTransaction(AdminPrivKey, {
      from: AdminAddress,
      to: contractAddress,
      data: transaction,
      maxPriorityFeePerGas,
      maxFeePerGas,
      gas: ethers.BigNumber.from(400000).toHexString(),
    });

    res.json({ transactionHash: receipt.transactionHash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve by veterinary (POST request)
app.post('/approveByVeterinary', async (req, res) => {
  const { packID, wallet } = req.body;

  try {
    const { maxPriorityFeePerGas, maxFeePerGas } = await getGasFees();

    const transaction = contract.methods.approveByVeterinary(packID, wallet).encodeABI();
    const receipt = await sendTransaction(AdminPrivKey, {
      from: AdminAddress,
      to: contractAddress,
      data: transaction,
      maxPriorityFeePerGas,
      maxFeePerGas,
      gas: ethers.BigNumber.from(400000).toHexString(),
    });

    res.json({ transactionHash: receipt.transactionHash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Approve by quality manager (POST request)
app.post('/approveByQualityManager', async (req, res) => {
  const { pechId } = req.body;

  try {
    const { maxPriorityFeePerGas, maxFeePerGas } = await getGasFees();

    const transaction = contract.methods.approveByQualityManager(pechId).encodeABI();
    const receipt = await sendTransaction(AdminPrivKey, {
      from: AdminAddress,
      to: contractAddress,
      data: transaction,
      maxPriorityFeePerGas,
      maxFeePerGas,
      gas: ethers.BigNumber.from(400000).toHexString(),
    });

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

    res.json({ data: transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/getLotByPrise', async (req, res) => {
  const priseId = req.body.priseId;

  try {
    const transaction = await contract.methods.getLotByPrise(priseId).call();
    const jsons = transaction.map((ret) => {
      return {
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
    const jsons = [];
    const transaction = await contract.methods.getPriseVenduParMarayeur(wallet).call();
    for (var i = 0; i < transaction.length; i++) {
      const ret = transaction[i]
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
        dateDebarquement: Number(ret.deb.dateDebarquement),
        debarqued: Number(ret.deb.debarqued)


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
    const jsons = [];
    const transaction = await contract.methods.getPriseByPesheur(wallet).call();
    for (var i = 0; i < transaction.length; i++) {
      const ret = transaction[i]
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
        dateDebarquement: Number(ret.deb.dateDebarquement),
        debarqued: Number(ret.deb.debarqued)


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
    res.json({ data: transaction });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/getPriseByMarayeur', async (req, res) => {
  const wallet = req.body.wallet;


  try {
    const jsons = [];
    const transaction = await contract.methods.getPriseByMarayeur(wallet).call();
    for (var i = 0; i < transaction.length; i++) {
      const ret = transaction[i]
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
        dateDebarquement: Number(ret.deb.dateDebarquement),
        debarqued: Number(ret.deb.debarqued)


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
  const jsons = transaction.map((ret) => {
    return {
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
    res.json({ data: transaction });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/getVetFWallet', async (req, res) => {
  const wallet = req.body.wallet;


  try {
    const transaction = await contract.methods.Veters(wallet).call();
    res.json({ data: transaction });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buy a package (POST request)
app.post('/buyPackage', async (req, res) => {
  const { packageId, amount } = req.body;

  try {
    const { maxPriorityFeePerGas, maxFeePerGas } = await getGasFees();

    const transaction = marketplaceContract.methods.buyPackage(packageId).encodeABI();
    const receipt = await sendTransaction(AdminPrivKey, {
      from: AdminAddress,
      to: marketplaceAddress,
      data: transaction,
      value: web3.utils.toWei(amount, 'ether'),
      maxPriorityFeePerGas,
      maxFeePerGas,
      gas: ethers.BigNumber.from(400000).toHexString(),
    });

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
