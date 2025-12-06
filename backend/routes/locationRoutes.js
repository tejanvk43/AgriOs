const express = require('express');
const {
  getStates,
  getDistricts,
  getMandals,
  getVillages
} = require('../controllers/locationController');

const router = express.Router();

router.get('/states', getStates);
router.get('/districts/:stateCode', getDistricts);
router.get('/mandals', getMandals); // ?districtCode=...
router.get('/villages', getVillages); // ?mandalName=...

module.exports = router;

