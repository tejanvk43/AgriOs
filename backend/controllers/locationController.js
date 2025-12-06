const {
  states,
  districtsByState,
  mandalsByDistrict,
  villagesByMandal
} = require('../data/locations');

// Generate a stable district code from its name (upper snake, no spaces/punct)
const toCode = (name) => name
  .replace(/[^\w]/g, '_')
  .replace(/_+/g, '_')
  .replace(/^_|_$/g, '')
  .toUpperCase();

// Fallback generators to avoid missing data crashes
const generateMandals = (districtName) => {
  const prefixes = ['North', 'South', 'East', 'West', 'Central'];
  const base = toCode(districtName).slice(0, 6) || 'MANDAL';
  return prefixes.map((p, idx) => `${p} ${base}_${idx + 1}`);
};

const generateVillages = (mandalName) => {
  const base = mandalName.split(' ')[0] || 'Village';
  return [`${base} Nagar`, `${base} Puram`, `${base} Kheda`];
};

// GET /api/locations/states
const getStates = async (_req, res) => {
  res.json({ states });
};

// GET /api/locations/districts/:stateCode
const getDistricts = async (req, res) => {
  const { stateCode } = req.params;
  const districts = districtsByState[stateCode];
  if (!districts) {
    return res.status(404).json({ message: 'State not found' });
  }
  // Normalize to objects with code/name if provided as strings
  const normalized = districts.map((d) => {
    if (typeof d === 'string') {
      return { code: toCode(d), name: d };
    }
    return d;
  });
  res.json({ districts: normalized });
};

// GET /api/locations/mandals
const getMandals = async (req, res) => {
  const { districtCode } = req.query;
  if (!districtCode) {
    return res.status(400).json({ message: 'districtCode is required' });
  }
  const mandals = mandalsByDistrict[districtCode] || generateMandals(districtCode);
  res.json({ mandals });
};

// GET /api/locations/villages
const getVillages = async (req, res) => {
  const { mandalName } = req.query;
  if (!mandalName) {
    return res.status(400).json({ message: 'mandalName is required' });
  }
  const villages = villagesByMandal[mandalName] || generateVillages(mandalName);
  res.json({ villages });
};

module.exports = {
  getStates,
  getDistricts,
  getMandals,
  getVillages
};

