const Patients = require('../models/Patients');
const Doctors = require('../models/Doctors');
const Messages = require('../messages/messages');

//updated the getAllPatients function to include doctor information
const getAllPatients = async (req, res) => {
	try {
		// Normalize bracket notation: 'dob[gte]' → { dob: { gte: ... } }
		const excluded = ['sort', 'select', 'order'];
		const queryObj = Object.entries(req.query).reduce((acc, [key, value]) => {
			if (excluded.includes(key)) return acc;
			const match = key.match(/^(\w+)\[(\w+)\]$/);
			if (match) {
				const [, field, operator] = match;
				acc[field] = { ...acc[field], [operator]: value };
			} else {
				acc[key] = value;
			}
			return acc;
		}, {});

		// Convert gt, gte, lt, lte, in → $gt, $gte, $lt, $lte, $in
		let queryStr = JSON.stringify(queryObj);
		queryStr = queryStr.replace(
			/\b(gt|gte|lt|lte|in)\b/g,
			(match) => `$${match}`,
		);

		// $in requires an array — split comma-separated string into one
		const parsedQuery = JSON.parse(queryStr);
		Object.keys(parsedQuery).forEach((key) => {
			if (parsedQuery[key]?.$in && typeof parsedQuery[key].$in === 'string') {
				parsedQuery[key].$in = parsedQuery[key].$in.split(',');
			}
		});

		let query = Patients.find(parsedQuery).populate({
			path: 'doctor_id',
			select: 'name',
		});

		// Select: ?select=name,gender — comma-separated list of fields to return
		// When including specific fields, __v is already excluded automatically by MongoDB.
		// 'doctor_id' is always appended so .populate() can resolve the ObjectId reference.
		const selectFields = req.query.select
			? req.query.select.split(',').join(' ') + ' doctor_id'
			: '-__v';
		query = query.select(selectFields);

		// Sort: ?sort=name&order=asc  or  ?sort=name&order=desc (oldest patient first)
		if (req.query.sort) {
			const direction = req.query.order === 'desc' ? '-' : '';
			query = query.sort(`${direction}${req.query.sort}`);
		} else {
			query = query.sort('dob');
		}

		const patients = await query;
		res.status(200).json({
			success: true,
			count: patients.length,
			data: patients,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: Messages.SERVER_ERROR });
	}
};

const createPatient = async (req, res) => {
	const data = req.body;
	try {
		const newPatient = await Patients.create(data);
		const doctor = await Doctors.findById(newPatient.doctor_id);
		doctor.patients.push(newPatient._id);
		await doctor.save();
		res.status(201).json({ success: true, data: newPatient });
	} catch (error) {
		res.status(500).json({ success: false, message: Messages.SERVER_ERROR });
	}
};
//updated the getPatientById function to include doctor information
const getPatientById = async (req, res) => {
	try {
		const patient = await Patients.findById(req.params.id)
			.select('-__v')
			.populate({ path: 'doctor_id', select: 'name' });
		if (!patient) {
			return res
				.status(404)
				.json({ success: false, message: Messages.PATIENT_NOT_FOUND });
		}
		res.status(200).json({ success: true, data: patient });
	} catch (error) {
		res.status(500).json({ success: false, message: Messages.SERVER_ERROR });
	}
};
const updatePatient = async (req, res) => {
	try {
		const patient = await Patients.findByIdAndUpdate(req.params.id, req.body, {
			returnDocument: 'after',
		});
		if (!patient) {
			return res
				.status(404)
				.json({ success: false, message: Messages.PATIENT_NOT_FOUND });
		}
		res.status(200).json({ success: true, data: patient });
	} catch (error) {
		res.status(500).json({ success: false, message: Messages.SERVER_ERROR });
	}
};
const deletePatient = async (req, res) => {
	try {
		const patient = await Patients.findByIdAndDelete(req.params.id);
		if (!patient) {
			return res
				.status(404)
				.json({ success: false, message: Messages.PATIENT_NOT_FOUND });
		}
		const doctor = await Doctors.findById(patient.doctor_id);
		doctor.patients = doctor.patients.filter(
			(id) => id.toString() !== patient._id.toString(),
		);
		await doctor.save();
		res.status(200).json({ success: true, message: Messages.PATIENT_DELETED });
	} catch (error) {
		res.status(500).json({ success: false, message: Messages.SERVER_ERROR });
	}
};

module.exports = {
	getAllPatients,
	createPatient,
	getPatientById,
	updatePatient,
	deletePatient,
};
