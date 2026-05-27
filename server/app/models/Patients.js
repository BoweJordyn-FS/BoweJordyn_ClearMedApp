const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		dob: {
			type: Date,
			required: true,
			min: [new Date('1900-01-01'), 'Date must be after 1900'],
			max: [Date.now, 'Date cannot be in the future'],
			get: (val) => (val ? val.toISOString().split('T')[0] : null),
		},
		gender: {
			type: String,
			required: true,
			enum: ['male', 'female', 'non-binary'],
		},
		new_Patient: {
			type: Boolean,
			default: false,
		},
		insurance: {
			type: Boolean,
			required: true,
		},
		doctor_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Doctor',
			required: true,
		},
	},
	{ timestamps: true, toJSON: { getters: true }, id: false },
);

const Patients = mongoose.model('Patient', patientSchema);

module.exports = Patients;
