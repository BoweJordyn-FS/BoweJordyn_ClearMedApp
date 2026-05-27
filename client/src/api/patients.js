import api from '.';

export const getAllPatients = () =>
	api.get('/patients').then((res) => res.data);
export const createPatient = (data) =>
	api.post('/patients', data).then((res) => res.data);
export const getPatientById = (id) =>
	api.get(`/patients/${id}`).then((res) => res.data);
export const updatePatient = (id, data) =>
	api.put(`/patients/${id}`, data).then((res) => res.data);
export const deletePatient = (id) =>
	api.delete(`/patients/${id}`).then((res) => res.data);
