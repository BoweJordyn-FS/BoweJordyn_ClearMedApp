import {
	Button,
	Group,
	Table,
	Modal,
	TextInput,
	Select,
	Switch,
	ActionIcon,
} from '@mantine/core';
import { useState, useEffect } from 'react';
import { getAllPatients, createPatient, deletePatient } from '../api/patients';
import { getAllDoctors } from '../api/doctors';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { PatientTypeBadge, InsuranceBadge } from './badges';
import { useSearch } from '../context/SearchContext';

const defaultForm = {
	name: '',
	dob: '',
	gender: '',
	new_Patient: false,
	insurance: false,
	doctor_id: '',
};

export default function AllPatients() {
	const [opened, setOpened] = useState(false);
	const [form, setForm] = useState(defaultForm);
	const [confirmPatient, setConfirmPatient] = useState(null);

	const [patients, setPatients] = useState([]);
	const [doctors, setDoctors] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const searchTerm = useSearch();

	// Load patients and doctors when the component mounts
	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);
				const [patientData, doctorData] = await Promise.all([
					getAllPatients(),
					getAllDoctors(),
				]);
				setPatients(patientData);
				setDoctors(doctorData);
			} catch {
				setIsError(true);
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, []);

	const refreshPatients = async () => {
		const data = await getAllPatients();
		setPatients(data);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			await createPatient(form);
			await refreshPatients();
			setOpened(false);
			setForm(defaultForm);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await deletePatient(confirmPatient._id);
			await refreshPatients();
			setConfirmPatient(null);
		} finally {
			setIsDeleting(false);
		}
	};

	if (isLoading) return <div>Loading patients...</div>;
	if (isError) return <div>Failed to load patients.</div>;

	const lower = searchTerm.toLowerCase();
	const rows = lower
		? patients.filter(
				(p) =>
					p.name?.toLowerCase().includes(lower) ||
					p.gender?.toLowerCase().includes(lower) ||
					p.dob?.toLowerCase().includes(lower) ||
					p.doctor_id?.name?.toLowerCase().includes(lower),
			)
		: patients;

	// Doctors with fewer than 6 assigned patients are eligible for assignment
	const doctorOptions = doctors
		.filter((dr) => (dr.patients?.length ?? 0) < 6)
		.map((dr) => ({ value: dr._id, label: dr.name }));

	return (
		<div>
			<Modal
				opened={opened}
				onClose={() => setOpened(false)}
				title="Add Patient"
			>
				<form onSubmit={handleSubmit}>
					<TextInput
						label="Name"
						required
						value={form.name}
						onChange={(e) => setForm({ ...form, name: e.target.value })}
						mb="sm"
					/>
					<TextInput
						label="Date of Birth"
						type="date"
						required
						value={form.dob}
						onChange={(e) => setForm({ ...form, dob: e.target.value })}
						mb="sm"
					/>
					<Select
						label="Gender"
						required
						data={['male', 'female', 'non-binary']}
						value={form.gender}
						onChange={(val) => setForm({ ...form, gender: val })}
						mb="sm"
					/>
					<Select
						label="Doctor"
						required
						data={doctorOptions}
						value={form.doctor_id}
						onChange={(val) => setForm({ ...form, doctor_id: val })}
						mb="sm"
					/>
					<Switch
						label="New Patient"
						checked={form.new_Patient}
						onChange={(e) =>
							setForm({ ...form, new_Patient: e.currentTarget.checked })
						}
						mb="sm"
					/>
					<Switch
						label="Has Insurance"
						checked={form.insurance}
						onChange={(e) =>
							setForm({ ...form, insurance: e.currentTarget.checked })
						}
						mb="md"
					/>
					<Button
						type="submit"
						color="teal"
						fullWidth
						loading={isSubmitting}
					>
						Add Patient
					</Button>
				</form>
			</Modal>

			<ConfirmDeleteModal
				item={confirmPatient}
				entityName="Patient"
				onClose={() => setConfirmPatient(null)}
				onConfirm={handleDelete}
				isPending={isDeleting}
			/>

			<section
				id="all-patients"
				className="border-stone-200 shadow-md shadow-stone-200/20 rounded-md p-3 mb-5 bg-white"
			>
				<header className="flex flex-row items-center justify-between mb-4 mx-2">
					<h4>
						All Patients{' '}
						<span className="text-sm font-normal text-stone-400">
							({patients.length})
						</span>
					</h4>
					<Group>
						<Button
							variant="filled"
							color="teal"
							onClick={() => setOpened(true)}
						>
							+ Add Patient
						</Button>
					</Group>
				</header>
				<Table
					highlightOnHover
					verticalSpacing="md"
				>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Name</Table.Th>
							<Table.Th>DOB</Table.Th>
							<Table.Th>Gender</Table.Th>
							<Table.Th>New</Table.Th>
							<Table.Th>Insurance</Table.Th>
							<Table.Th>Doctor</Table.Th>
							<Table.Th />
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody className="text-left">
						{rows.map((patient) => (
							<Table.Tr key={patient._id}>
								<Table.Td>{patient.name}</Table.Td>
								<Table.Td className="text-xs">{patient.dob}</Table.Td>
								<Table.Td>{patient.gender}</Table.Td>
								<Table.Td>
									<PatientTypeBadge isNew={patient.new_Patient} />
								</Table.Td>
								<Table.Td>
									<InsuranceBadge hasInsurance={patient.insurance} />
								</Table.Td>
								<Table.Td>{patient.doctor_id?.name ?? '—'}</Table.Td>
								<Table.Td>
									<ActionIcon
										color="red"
										variant="subtle"
										onClick={() => setConfirmPatient(patient)}
									>
										✕
									</ActionIcon>
								</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			</section>
		</div>
	);
}
