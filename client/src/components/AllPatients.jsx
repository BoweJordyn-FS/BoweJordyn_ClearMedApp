import {
	Button,
	Group,
	Table,
	Modal,
	TextInput,
	Select,
	Switch,
	ActionIcon,
	Text,
} from '@mantine/core';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
	const queryClient = useQueryClient();
	const searchTerm = useSearch();

	const {
		data: patients,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['patients'],
		queryFn: getAllPatients,
	});

	const { data: doctors } = useQuery({
		queryKey: ['doctors'],
		queryFn: getAllDoctors,
	});

	const createMutation = useMutation({
		mutationFn: createPatient,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['patients'] });
			setOpened(false);
			setForm(defaultForm);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deletePatient,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['patients'] });
			setConfirmPatient(null);
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		createMutation.mutate(form);
	};

	if (isLoading) return <div>Loading patients...</div>;
	if (isError) return <div>Failed to load patients.</div>;

	const allPatients = Array.isArray(patients) ? patients : [];
	const lower = searchTerm.toLowerCase();
	const rows = lower
		? allPatients.filter(
				(p) =>
					p.name?.toLowerCase().includes(lower) ||
					p.gender?.toLowerCase().includes(lower) ||
					p.dob?.toLowerCase().includes(lower) ||
					p.doctor_id?.name?.toLowerCase().includes(lower)
			)
		: allPatients;

	// max 6 patients per doctor
	const doctorOptions = Array.isArray(doctors)
		? doctors
				.filter((dr) => (dr.patients?.length ?? 0) < 6)
				.map((dr) => ({ value: dr._id, label: dr.name }))
		: [];

	return (
		<div>
			<Modal opened={opened} onClose={() => setOpened(false)} title="Add Patient">
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
						onChange={(e) => setForm({ ...form, new_Patient: e.currentTarget.checked })}
						mb="sm"
					/>
					<Switch
						label="Has Insurance"
						checked={form.insurance}
						onChange={(e) => setForm({ ...form, insurance: e.currentTarget.checked })}
						mb="md"
					/>
					<Button type="submit" color="teal" fullWidth loading={createMutation.isPending}>
						Add Patient
					</Button>
				</form>
			</Modal>

			<ConfirmDeleteModal
				item={confirmPatient}
				entityName="Patient"
				onClose={() => setConfirmPatient(null)}
				onConfirm={() => deleteMutation.mutate(confirmPatient._id)}
				isPending={deleteMutation.isPending}
			/>

			<section
				id="all-patients"
				className="border-stone-200 shadow-md shadow-stone-200/20 rounded-md p-3 mb-5 bg-white"
			>
				<header className="flex flex-row items-center justify-between mb-4 mx-2">
					<h4>All Patients</h4>
					<Group>
						<Button variant="filled" color="teal" onClick={() => setOpened(true)}>
							+ Add Patient
						</Button>
					</Group>
				</header>
				<Table highlightOnHover verticalSpacing="md">
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
