const request = require('supertest');
const app = require('../index');
const Doctors = require('../models/Doctors');
const Patients = require('../models/Patients');

jest.mock('../models/Doctors', () => ({ find: jest.fn() }));
jest.mock('../models/Patients', () => ({ find: jest.fn() }));

// Builds a chainable Mongoose query mock that resolves to `data`
const buildQueryMock = (data) => ({
	populate: jest.fn().mockReturnThis(),
	select: jest.fn().mockReturnThis(),
	sort: jest.fn().mockReturnThis(),
	skip: jest.fn().mockReturnThis(),
	limit: jest.fn().mockReturnThis(),
	then: (resolve, reject) => Promise.resolve(data).then(resolve, reject),
	catch: (fn) => Promise.resolve(data).catch(fn),
});

const mockDoctors = [
	{ _id: '1', name: 'Dr. Adams', specialty: 'Cardiology', available: true },
	{ _id: '2', name: 'Dr. Brown', specialty: 'Neurology', available: false },
	{ _id: '3', name: 'Dr. Chen', specialty: 'Cardiology', available: true },
];

const mockPatients = [
	{ _id: '1', name: 'Alice', gender: 'female', new_Patient: true, dob: '1990-05-01' },
	{ _id: '2', name: 'Bob', gender: 'male', new_Patient: false, dob: '1985-03-15' },
	{ _id: '3', name: 'Carol', gender: 'female', new_Patient: true, dob: '2000-07-22' },
];

beforeEach(() => jest.clearAllMocks());

// ─── Query operators and select ───────────────────────────────────────────────

describe('Query operators and select', () => {
	test('GET /doctors?available=true&select=name,specialty returns only available doctors with selected fields', async () => {
		const filtered = mockDoctors.filter((d) => d.available);
		Doctors.find.mockReturnValue(buildQueryMock(filtered));

		const res = await request(app)
			.get('/ClearMed/v1/doctors?available=true&select=name,specialty');

		const queryMock = Doctors.find.mock.results[0].value;

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.count).toBe(filtered.length);
		expect(res.body.data).toEqual(filtered);
		expect(Doctors.find).toHaveBeenCalledWith({ available: 'true' });
		expect(queryMock.select).toHaveBeenCalledWith('name specialty -__v');
	});

	test('GET /patients?new_Patient=true&select=name,gender returns only new patients with selected fields', async () => {
		const filtered = mockPatients.filter((p) => p.new_Patient);
		Patients.find.mockReturnValue(buildQueryMock(filtered));

		const res = await request(app)
			.get('/ClearMed/v1/patients?new_Patient=true&select=name,gender');

		const queryMock = Patients.find.mock.results[0].value;

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.count).toBe(filtered.length);
		expect(res.body.data).toEqual(filtered);
		expect(Patients.find).toHaveBeenCalledWith({ new_Patient: 'true' });
		expect(queryMock.select).toHaveBeenCalledWith('name gender -__v');
	});
});

// ─── Pagination ───────────────────────────────────────────────────────────────

describe('Pagination', () => {
	test('GET /doctors?page=2&limit=1 skips the first record and returns one result', async () => {
		Doctors.find.mockReturnValue(buildQueryMock([mockDoctors[1]]));

		const res = await request(app)
			.get('/ClearMed/v1/doctors?page=2&limit=1');

		const queryMock = Doctors.find.mock.results[0].value;

		expect(res.status).toBe(200);
		expect(res.body.page).toBe(2);
		expect(res.body.limit).toBe(1);
		expect(res.body.count).toBe(1);
		expect(queryMock.skip).toHaveBeenCalledWith(1);
		expect(queryMock.limit).toHaveBeenCalledWith(1);
	});

	test('GET /patients?page=3&limit=1 skips the first two records and returns one result', async () => {
		Patients.find.mockReturnValue(buildQueryMock([mockPatients[2]]));

		const res = await request(app)
			.get('/ClearMed/v1/patients?page=3&limit=1');

		const queryMock = Patients.find.mock.results[0].value;

		expect(res.status).toBe(200);
		expect(res.body.page).toBe(3);
		expect(res.body.limit).toBe(1);
		expect(res.body.count).toBe(1);
		expect(queryMock.skip).toHaveBeenCalledWith(2);
		expect(queryMock.limit).toHaveBeenCalledWith(1);
	});
});

// ─── Sort ─────────────────────────────────────────────────────────────────────

describe('Sort', () => {
	test('GET /doctors?sort=name&order=asc returns doctors in A-Z order', async () => {
		const sorted = [...mockDoctors].sort((a, b) => a.name.localeCompare(b.name));
		Doctors.find.mockReturnValue(buildQueryMock(sorted));

		const res = await request(app)
			.get('/ClearMed/v1/doctors?sort=name&order=asc');

		const queryMock = Doctors.find.mock.results[0].value;

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data[0].name).toBe('Dr. Adams');
		expect(res.body.data[2].name).toBe('Dr. Chen');
		expect(queryMock.sort).toHaveBeenCalledWith('name');
	});

	test('GET /doctors?sort=name&order=desc returns doctors in Z-A order', async () => {
		const sorted = [...mockDoctors].sort((a, b) => b.name.localeCompare(a.name));
		Doctors.find.mockReturnValue(buildQueryMock(sorted));

		const res = await request(app)
			.get('/ClearMed/v1/doctors?sort=name&order=desc');

		const queryMock = Doctors.find.mock.results[0].value;

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data[0].name).toBe('Dr. Chen');
		expect(res.body.data[2].name).toBe('Dr. Adams');
		expect(queryMock.sort).toHaveBeenCalledWith('-name');
	});
});
