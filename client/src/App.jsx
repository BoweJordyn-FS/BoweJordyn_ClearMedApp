import { Routes, Route } from 'react-router-dom';
import './App.css';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';

function App() {
	return (
		<div className="App bg-[#FAFAF9]">
			<Navigation>
				<Routes>
					<Route path="/" element={<Dashboard />} />
					<Route path="/doctors" element={<Doctors />} />
					<Route path="/patients" element={<Patients />} />
				</Routes>
			</Navigation>
		</div>
	);
}

export default App;
