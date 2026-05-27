const {
	getAllDoctors,
	createDoctor,
	getDoctorById,
	updateDoctor,
	deleteDoctor,
} = require('../controller/doctorController');
const express = require('express');
const router = express.Router();

router.get('/', getAllDoctors);
router.post('/', createDoctor);
router.get('/:id', getDoctorById);
router.put('/:id', updateDoctor);
router.delete('/:id', deleteDoctor);

module.exports = router;
