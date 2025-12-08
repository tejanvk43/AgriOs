const { SoilHealthCard, User } = require('../models');

// @desc    Add new Soil Health Card Record
// @route   POST /api/soil/add
exports.addSoilReport = async (req, res) => {
    try {
        const { nitrogen, phosphorus, potassium, phLevel, organicCarbon, ec, labName, testDate } = req.body;

        // Simple Recommendation Logic (Standard NPK for General Crops)
        // Target (approx): N: 100, P: 50, K: 50

        let recommendations = [];

        // Nitrogen Logic
        if (nitrogen < 200) {
            const deficit = 200 - nitrogen;
            recommendations.push({
                nutrient: 'Nitrogen',
                status: 'Low',
                advice: `Apply Urea: ${(deficit * 2.1).toFixed(1)} kg/ha to boost Nitrogen.`
            });
        } else if (nitrogen > 500) {
            recommendations.push({ nutrient: 'Nitrogen', status: 'High', advice: 'Reduce nitrogen fertilizers.' });
        } else {
            recommendations.push({ nutrient: 'Nitrogen', status: 'Optimal', advice: 'Maintain current levels.' });
        }

        // Phosphorus Logic
        if (phosphorus < 20) {
            const deficit = 50 - phosphorus;
            recommendations.push({
                nutrient: 'Phosphorus',
                status: 'Low',
                advice: `Apply DAP: ${(deficit * 2.17).toFixed(1)} kg/ha.`
            });
        } else {
            recommendations.push({ nutrient: 'Phosphorus', status: 'Adequate', advice: 'Standard maintanence dose.' });
        }

        // Potassium Logic
        if (potassium < 150) {
            recommendations.push({ nutrient: 'Potassium', status: 'Low', advice: 'Apply MOP (Muriate of Potash).' });
        }

        // pH Logic
        if (phLevel < 6.0) recommendations.push({ nutrient: 'pH', status: 'Acidic', advice: 'Apply Lime to neutralize.' });
        if (phLevel > 7.5) recommendations.push({ nutrient: 'pH', status: 'Alkaline', advice: 'Apply Gypsum to lower pH.' });


        const report = await SoilHealthCard.create({
            userId: req.user.id,
            nitrogen, phosphorus, potassium,
            phLevel, organicCarbon, electricalConductivity: ec,
            labName, testDate,
            recommendation_generated: recommendations
        });

        res.status(201).json(report);

    } catch (error) {
        console.error('Error adding soil report:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user's soil reports
// @route   GET /api/soil/my-reports
exports.getMyReports = async (req, res) => {
    try {
        const reports = await SoilHealthCard.findAll({
            where: { userId: req.user.id },
            order: [['testDate', 'DESC']]
        });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
