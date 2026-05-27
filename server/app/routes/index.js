const express = require('express');
const router = express.Router();
const doctorRoutes = require('./doctorRoutes');
const patientRoutes = require('./patientRoutes');

router.get('/', (req, res) => {
	res
		.status(200)
		.json({ message: `${req.method} - Request Made`, success: true });
});

router.use('/doctors', doctorRoutes);
router.use('/patients', patientRoutes);
module.exports = router;
