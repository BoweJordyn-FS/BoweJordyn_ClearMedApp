const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Name is required'],
			trim: true,
			min: [2, 'Name must be at least 2 characters long'],
			max: [50, 'Name cannot exceed 50 characters'],
		},
		specialty: {
			type: String,
			required: [true, 'Specialty is required'],
			trim: true,
			min: [2, 'Specialty must be at least 2 characters long'],
			max: [100, 'Specialty cannot exceed 100 characters'],
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			match: /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/,
		},
		available: {
			type: Boolean,
			default: true,
		},
		patients: {
			type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }],
			default: [],
		},
	},
	{
		timestamps: true,
		toJSON: { versionKey: false },
		id: false,
	},
);
const Doctors = mongoose.model('Doctor', doctorSchema);

module.exports = Doctors;
