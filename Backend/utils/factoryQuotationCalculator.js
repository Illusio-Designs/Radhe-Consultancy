// Factory Quotation Calculator based on Horse Power and Number of Workers
// This implements the lookup table for automatic calculation

const LOOKUP_TABLE = {
  // Horse Power ranges as keys
  "0": {
    "Up To 20": 260,
    "21 to 50": 500,
    "51 to 100": 800,
    "101 to 250": 1600,
    "251 to 500": 3300,
    "501 to 1000": 5300,
    "1001 to 2000": 10600,
    "2001 to 5000": 15800,
    "5001 to above": 21100
  },
  "Up to 10": {
    "Up To 20": 500,
    "21 to 50": 800,
    "51 to 100": 1100,
    "101 to 250": 2100,
    "251 to 500": 4000,
    "501 to 1000": 7900,
    "1001 to 2000": 15800,
    "2001 to 5000": 21100,
    "5001 to above": 26400
  },
  "10 to 50": {
    "Up To 20": 800,
    "21 to 50": 1100,
    "51 to 100": 1600,
    "101 to 250": 3300,
    "251 to 500": 5300,
    "501 to 1000": 10600,
    "1001 to 2000": 21100,
    "2001 to 5000": 26400,
    "5001 to above": 31700
  },
  "50 to 100": {
    "Up To 20": 1300,
    "21 to 50": 1600,
    "51 to 100": 2600,
    "101 to 250": 4600,
    "251 to 500": 7900,
    "501 to 1000": 15800,
    "1001 to 2000": 26400,
    "2001 to 5000": 31700,
    "5001 to above": 37000
  },
  "100 to 250": {
    "Up To 20": 2100,
    "21 to 50": 2600,
    "51 to 100": 4200,
    "101 to 250": 5300,
    "251 to 500": 10600,
    "501 to 1000": 21100,
    "1001 to 2000": 31700,
    "2001 to 5000": 37000,
    "5001 to above": 42800
  },
  "250 to 500": {
    "Up To 20": 2600,
    "21 to 50": 4000,
    "51 to 100": 5300,
    "101 to 250": 10600,
    "251 to 500": 15800,
    "501 to 1000": 26400,
    "1001 to 2000": 37000,
    "2001 to 5000": 42800,
    "5001 to above": 47500
  },
  "500 to 1000": {
    "Up To 20": 3300,
    "21 to 50": 4600,
    "51 to 100": 10600,
    "101 to 250": 15800,
    "251 to 500": 21100,
    "501 to 1000": 31700,
    "1001 to 2000": 42800,
    "2001 to 5000": 47500,
    "5001 to above": 52800
  },
  "1000 to 2000": {
    "Up To 20": 5300,
    "21 to 50": 10600,
    "51 to 100": 15800,
    "101 to 250": 21100,
    "251 to 500": 26400,
    "501 to 1000": 37000,
    "1001 to 2000": 47500,
    "2001 to 5000": 52800,
    "5001 to above": 59400
  },
  "2000 to 5000": {
    "Up To 20": 10600,
    "21 to 50": 15800,
    "51 to 100": 21100,
    "101 to 250": 26400,
    "251 to 500": 37000,
    "501 to 1000": 47500,
    "1001 to 2000": 52800,
    "2001 to 5000": 59400,
    "5001 to above": 68600
  },
  "Above 5000": {
    "Up To 20": 21100,
    "21 to 50": 23800,
    "51 to 100": 26400,
    "101 to 250": 33000,
    "251 to 500": 39600,
    "501 to 1000": 52800,
    "1001 to 2000": 60700,
    "2001 to 5000": 66000,
    "5001 to above": 77900
  }
};

/**
 * Calculate the base amount based on Horse Power and Number of Workers
 * @param {string} horsePower - The horse power range
 * @param {string} noOfWorkers - The number of workers range
 * @returns {number} The calculated base amount
 */
const calculateBaseAmount = (horsePower, noOfWorkers) => {
  try {
    // Check if both parameters exist in the lookup table
    if (!LOOKUP_TABLE[horsePower]) {
      throw new Error(`Invalid horse power: ${horsePower}`);
    }
    
    if (!LOOKUP_TABLE[horsePower][noOfWorkers]) {
      throw new Error(`Invalid number of workers: ${noOfWorkers}`);
    }
    
    return LOOKUP_TABLE[horsePower][noOfWorkers];
  } catch (error) {
    console.error('Error calculating base amount:', error);
    return 0;
  }
};

/**
 * Calculate total amount including all charges and year multiplier
 * @param {number} calculatedAmount - Base calculated amount
 * @param {number} year - Number of years (multiplier)
 * @param {number} stabilityCertificateAmount - Stability certificate amount
 * @param {number} administrationCharge - Administration charge
 * @param {number} consultancyFees - Consultancy fees
 * @param {number} planCharge - Plan charge
 * @returns {number} Total amount
 */
const calculateTotalAmount = (calculatedAmount, year, stabilityCertificateAmount, administrationCharge, consultancyFees, planCharge) => {
  const yearMultiplier = year || 1;
  return (calculatedAmount || 0) * yearMultiplier + 
         (stabilityCertificateAmount || 0) + 
         (administrationCharge || 0) + 
         (consultancyFees || 0) + 
         (planCharge || 0);
};

/**
 * Get all available horse power options
 * @returns {Array} Array of horse power options
 */
const getHorsePowerOptions = () => {
  return Object.keys(LOOKUP_TABLE);
};

/**
 * Get all available number of workers options
 * @returns {Array} Array of number of workers options
 */
const getNoOfWorkersOptions = () => {
  // Get options from the first horse power entry (all should have same options)
  const firstHorsePower = Object.keys(LOOKUP_TABLE)[0];
  return Object.keys(LOOKUP_TABLE[firstHorsePower]);
};

/**
 * Get the complete lookup table for reference
 * @returns {Object} The complete lookup table
 */
const getLookupTable = () => {
  return LOOKUP_TABLE;
};

module.exports = {
  calculateBaseAmount,
  calculateTotalAmount,
  getHorsePowerOptions,
  getNoOfWorkersOptions,
  getLookupTable
}; 