import { useState, useEffect } from 'react';
import { getAllPatients } from '../api/patients';
import { getAllDoctors } from '../api/doctors';
import { Link } from 'react-router-dom';
import { AvailabilityBadge, PatientTypeBadge } from './badges';

export default function Panels() {
	const [doctors, setDoctors] = useState([]);
	const [patients, setPatients] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);

	// Load doctors and patients when the component mounts
	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);
				const [doctorData, patientData] = await Promise.all([
					getAllDoctors(),
					getAllPatients(),
				]);
				setDoctors(doctorData);
				setPatients(patientData);
			} catch {
				setIsError(true);
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, []);

	if (isLoading) return <div>Loading...</div>;
	if (isError) return <div>Failed to load data.</div>;

	// Show the 5 most recently added patients
	const recentPatients = [...patients]
		.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
		.slice(0, 5);

	return (
		<div className="grid grid-cols-2 gap-4 mb-6">
			<section className="bg-white rounded-xl border border-stone-100">
				<header className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100">
					<h4 className="text-[13px] font-medium">Doctors</h4>
					<Link to="/doctors">
						<button className="text-[12px] text-emerald-600 cursor-pointer">
							View All →
						</button>
					</Link>
				</header>
				<div className="text-left p-1">
					{doctors.map((dr) => (
						<div key={dr._id}>
							<div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-stone-50 cursor-pointer transition-colors">
								<div className="flex-1 min-w-0">
									<div className="text-[13px] font-medium truncate">{dr.name}</div>
									<div className="text-[11px] text-stone-400">{dr.specialty}</div>
								</div>
								<AvailabilityBadge available={dr.available} />
							</div>
						</div>
					))}
				</div>
			</section>

			<section className="bg-white rounded-xl border border-stone-100">
				<header className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100">
					<h4 className="text-[13px] font-medium">Recent Patients</h4>
					<Link to="/patients">
						<button className="text-[12px] text-emerald-600 cursor-pointer">
							View All →
						</button>
					</Link>
				</header>
				<div className="text-left p-1">
					{recentPatients.map((patient) => (
						<div
							key={patient._id}
							className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-stone-50 cursor-pointer transition-colors"
						>
							<div className="flex-1 min-w-0">
								<div className="text-[13px] font-medium truncate">{patient.name}</div>
								<div className="text-[11px] text-stone-400">
									{patient.dob} | {patient.doctor_id?.name}
								</div>
							</div>
							<PatientTypeBadge isNew={patient.new_Patient} />
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
