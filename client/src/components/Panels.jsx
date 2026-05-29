import { useQuery } from '@tanstack/react-query';
import { getAllPatients } from '../api/patients';
import { getAllDoctors } from '../api/doctors';
import { Link } from 'react-router-dom';
import Doctors from '../pages/Doctors';
import { Badge } from '@mantine/core';

export default function Panels() {
	const {
		data: doctors,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['doctors'],
		queryFn: getAllDoctors,
	});
	const { data: patients } = useQuery({
		queryKey: ['patients'],
		queryFn: getAllPatients,
	});

	if (isLoading) return <div>Loading...</div>;
	if (isError) return <div>Failed to load data.</div>;

	const doctorRows = Array.isArray(doctors) ? doctors : [];
	const recentPatients = Array.isArray(patients)
		? [...patients]
				.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
				.slice(0, 5)
		: [];

	return (
		<div className="grid grid-cols-2 gap-4 mb-6">
			<section className="bg-white rounded-xl border border-stone-100">
				<header className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100">
					<h4 className="text-[13px] font-medium">Doctors</h4>
					<Link to="/Doctors">
						<button className="text-[12px] text-emerald-600 cursor-pointer">
							View All →
						</button>
					</Link>
				</header>
				<div className="text-left p-1">
					{doctorRows.map((dr) => (
						<div key={dr._id}>
							<div
								key={dr.id}
								className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-stone-50 cursor-pointer transition-colors"
							>
								<div className="flex-1 min-w-0">
									<div className="text-[13px] font-medium truncate">
										{dr.name}
									</div>
									<div className="text-[11px] text-stone-400">
										{dr.specialty}
									</div>
								</div>
								<span>
									{dr.available ? (
										<Badge
											color="green"
											variant="light"
											size="xs"
										>
											Available
										</Badge>
									) : (
										<Badge
											color="red"
											variant="light"
											size="xs"
										>
											Not Available
										</Badge>
									)}
								</span>
							</div>
						</div>
					))}
				</div>
			</section>
			<section className="bg-white rounded-xl border border-stone-100">
				<header className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100">
					<h4 className="text-[13px] font-medium">Recent Patients</h4>
					<Link to="/Patients">
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
								<div className="text-[13px] font-medium truncate">
									{patient.name}
								</div>
								<div className="text-[11px] text-stone-400">{patient.dob}</div>
							</div>
							<span>
								{patient.new_Patient ? (
									<Badge
										color="blue"
										variant="light"
										size="xs"
									>
										New
									</Badge>
								) : (
									<Badge
										color="gray"
										variant="light"
										size="xs"
									>
										Return
									</Badge>
								)}
							</span>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
