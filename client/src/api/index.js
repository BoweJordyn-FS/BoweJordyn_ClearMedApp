import axios from 'axios';

const api = axios.create({
	baseURL: '/ClearMed/v1',
	headers: {
		'Content-Type': 'application/json',
	},
});

export default api;
