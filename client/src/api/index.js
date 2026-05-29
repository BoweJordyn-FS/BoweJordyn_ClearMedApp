import axios from 'axios';

// All requests go through here — Vite proxies /ClearMed to the server
// so the browser never makes a cross-origin request
const api = axios.create({
	baseURL: '/ClearMed/v1',
	headers: {
		'Content-Type': 'application/json',
	},
});

export default api;
