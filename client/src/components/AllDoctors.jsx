import { Group, Button, Table, Badge } from '@mantine/core';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import Doctors from '../pages/Doctors';
import { getAllDoctors, createDoctor, deleteDoctor } from '../api/doctors';
import { getAllPatients } from '../api/patients';

const defaultForm = {
	name: '',
	specialty: '',
	email: '',
	available: false,
};
export default function AllDoctors() {
	const [opened, setOpened] = useState(false);
	const [form, setForm] = useState(defaultForm);
	const [confirmDoctor, setConfirmDoctor] = useState(null);
	const queryClient = useQueryClient();

	const {
		data: doctors,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['Doctors'],
		queryFn: getAllDoctors,
	});

	const { data: patients } = useQuery({
		queryKey: ['patients'],
		queryFn: getAllPatients,
	});
	const createMutation = useMutation({
		mutationFn: createDoctor,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['doctors'] });
			setOpened(false);
			setForm(defaultForm);
		},
	});
	const deleteMutation = useMutation({
		mutationFn: deleteDoctor,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['doctors'] });
			setConfirmDoctor(null);
		},
	});
	const handleSubmit = (e) => {
		e.preventDefault();
		createMutation.mutate(form);
	};
	if (isLoading) return <div>Loading doctors...</div>;
	if (isError) return <div>Failed to load doctors.</div>;

	const rows = Array.isArray(doctors) ? doctors : [];
	return (
		<div>
			<section className="border-stone-200 shadow-md shadow-stone-200/20 rounded-md p-3 mb-5 bg-white">
				<header className="flex flex-row items-center justify-between mb-4 mx-2">
					<h4>All Doctors</h4>
					<Group>
						<Button
							variant="filled"
							color="teal"
							onClick={() => setOpened(true)}
						>
							+ Add Doctor
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
							<Table.Th>Email</Table.Th>
							<Table.Th>Specialty</Table.Th>
							<Table.Th>Available</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{rows.map((dr) => (
							<Table.Tr key={dr._id}>
								<Table.Td>{dr.name}</Table.Td>
								<Table.Td>{dr.email}</Table.Td>
								<Table.Td>{dr.specialty}</Table.Td>
								<Table.Td>
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
								</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			</section>
		</div>
	);
}
