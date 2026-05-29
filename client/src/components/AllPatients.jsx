import {
	Button,
	Group,
	Table,
	Badge,
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

	const rows = Array.isArray(patients) ? patients : [];
	const doctorOptions = Array.isArray(doctors)
		? doctors.map((dr) => ({ value: dr._id, label: dr.name }))
		: [];

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
						loading={createMutation.isPending}
					>
						Add Patient
					</Button>
				</form>
			</Modal>

			<Modal
				opened={!!confirmPatient}
				onClose={() => setConfirmPatient(null)}
				title="Remove Patient"
				size="sm"
			>
				<Text
					size="sm"
					mb="lg"
				>
					Are you sure you want to remove{' '}
					<strong>{confirmPatient?.name}</strong>? This cannot be undone.
				</Text>
				<Group justify="flex-end">
					<Button
						variant="default"
						onClick={() => setConfirmPatient(null)}
					>
						Cancel
					</Button>
					<Button
						color="red"
						loading={deleteMutation.isPending}
						onClick={() => deleteMutation.mutate(confirmPatient._id)}
					>
						Remove
					</Button>
				</Group>
			</Modal>

			<section
				id="all-patients"
				className="border-stone-200 shadow-md shadow-stone-200/20 rounded-md p-3 mb-5 bg-white"
			>
				<header className="flex flex-row items-center justify-between mb-4 mx-2">
					<h4>All Patients</h4>
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
								</Table.Td>
								<Table.Td>
									{patient.insurance ? (
										<Badge
											color="green"
											variant="light"
											size="xs"
										>
											Insured
										</Badge>
									) : (
										<Badge
											color="yellow"
											variant="light"
											size="xs"
										>
											Not Insured
										</Badge>
									)}
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
