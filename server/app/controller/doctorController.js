const Doctors = require('../models/Doctors');
const Patients = require('../models/Patients');
const Messages = require('../messages/messages');

//updated the getAllDoctors function to include an array of patients assigned to each doctor
const getAllDoctors = async (req, res) => {
	try {
		const excluded = ['page', 'limit', 'sort', 'select', 'order'];
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

		console.log('parsedQuery →', JSON.stringify(parsedQuery, null, 2));
		let query = Doctors.find(parsedQuery);

		// Select: ?select=name,specialty — comma-separated list of fields to return
		const selectFields = req.query.select
			? req.query.select.split(',').join(' ')
			: '-__v';
		query = query.select(selectFields);

		// Sort: ?sort=name&order=asc  or  ?sort=name&order=desc (default: newest first)
		if (req.query.sort) {
			const direction = req.query.order === 'desc' ? '-' : '';
			query = query.sort(`${direction}${req.query.sort}`);
		} else {
			query = query.sort('-createdAt');
		}

		// Pagination: ?page=1&limit=10
		const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
		const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
		const skip = (page - 1) * limit;
		query = query.skip(skip).limit(limit);

		const doctors = await query;

		// Derive patients from the authoritative doctor_id field on Patient documents
		const allPatients = await Patients.find(
			{ doctor_id: { $in: doctors.map((d) => d._id) } },
			'name dob new_Patient doctor_id',
		);
		const patientMap = allPatients.reduce((acc, p) => {
			const key = p.doctor_id.toString();
			(acc[key] = acc[key] || []).push(p);
			return acc;
		}, {});
		const data = doctors.map((dr) => ({
			...dr.toObject(),
			patients: patientMap[dr._id.toString()] || [],
		}));

		res.status(200).json({
			success: true,
			count: data.length,
			page,
			limit,
			data,
		});
	} catch (error) {
		console.error('getAllDoctors error:', error);
		res.status(500).json({ success: false, message: Messages.SERVER_ERROR });
	}
};

const createDoctor = async (req, res) => {
	const data = req.body;
	try {
		const newDoctor = await Doctors.create(data);
		console.log('Doctor created successfully:', newDoctor);
		res.status(201).json({ success: true, data: newDoctor });
	} catch (error) {
		console.error('Error creating doctor:', error.message);
		res.status(500).json({ success: false, message: 'Server Error' });
	}
};
//updated the getDoctorById function to include an array of patients assigned to the doctor
const getDoctorById = async (req, res) => {
	try {
		const doctor = await Doctors.findById(req.params.id).select('-__v');
		if (!doctor) {
			return res
				.status(404)
				.json({ success: false, message: Messages.DOCTOR_NOT_FOUND });
		}
		const patients = await Patients.find(
			{ doctor_id: doctor._id },
			'name dob new_Patient',
		);
		res.status(200).json({ success: true, data: { ...doctor.toObject(), patients } });
	} catch (error) {
		res.status(500).json({ success: false, message: Messages.SERVER_ERROR });
	}
};
const updateDoctor = async (req, res) => {
	try {
		const doctor = await Doctors.findByIdAndUpdate(req.params.id, req.body, {
			returnDocument: 'after',
		});
		if (!doctor) {
			return res
				.status(404)
				.json({ success: false, message: Messages.DOCTOR_NOT_FOUND });
		}
		res.status(202).json({ success: true, data: doctor });
	} catch (error) {
		res.status(500).json({ success: false, message: Messages.SERVER_ERROR });
	}
};
const deleteDoctor = async (req, res) => {
	try {
		const doctor = await Doctors.findByIdAndDelete(req.params.id);
		if (!doctor) {
			return res
				.status(404)
				.json({ success: false, message: Messages.DOCTOR_NOT_FOUND });
		}
		res.status(200).json({ success: true, message: Messages.DOCTOR_DELETED });
	} catch (error) {
		res.status(500).json({ success: false, message: Messages.SERVER_ERROR });
	}
};

module.exports = {
	getAllDoctors,
	createDoctor,
	getDoctorById,
	updateDoctor,
	deleteDoctor,
};
