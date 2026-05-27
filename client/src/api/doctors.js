import api from '.';

export const getAllDoctors = () =>
	api.get('/doctors').then((res) => res.data);
export const createDoctor = (data) =>
	api.post('/doctors', data).then((res) => res.data);
export const getDoctorById = (id) =>
	api.get(`/doctors/${id}`).then((res) => res.data);
export const updateDoctor = (id, data) =>
	api.put(`/doctors/${id}`, data).then((res) => res.data);
export const deleteDoctor = (id) =>
	api.delete(`/doctors/${id}`).then((res) => res.data);
