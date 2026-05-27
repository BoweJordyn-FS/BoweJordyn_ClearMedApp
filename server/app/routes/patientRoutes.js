const {
	getAllPatients,
	createPatient,
	getPatientById,
	updatePatient,
	deletePatient,
} = require('../controller/patientController');
const express = require('express');
const router = express.Router();

router.get('/', getAllPatients);
router.post('/', createPatient);
router.get('/:id', getPatientById);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

module.exports = router;
