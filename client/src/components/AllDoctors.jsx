import {
	Group,
	Button,
	Table,
	Badge,
	Modal,
	TextInput,
	Switch,
	Text,
	ActionIcon,
} from '@mantine/core';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { getAllDoctors, createDoctor, deleteDoctor } from '../api/doctors';

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
	const [expandedId, setExpandedId] = useState(null);
	const queryClient = useQueryClient();

	const {
		data: doctors,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['doctors'],
		queryFn: getAllDoctors,
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
		<>
			<Modal
				opened={opened}
				onClose={() => setOpened(false)}
				title="Add Doctor"
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
						label="Email"
						type="email"
						required
						value={form.email}
						onChange={(e) => setForm({ ...form, email: e.target.value })}
						mb="sm"
					/>
					<TextInput
						label="Specialty"
						required
						value={form.specialty}
						onChange={(e) => setForm({ ...form, specialty: e.target.value })}
						mb="sm"
					/>
					<Switch
						label="Available"
						checked={form.available}
						onChange={(e) =>
							setForm({ ...form, available: e.currentTarget.checked })
						}
						mb="md"
					/>
					<Button
						type="submit"
						color="teal"
						fullWidth
						loading={createMutation.isPending}
					>
						Add Doctor
					</Button>
				</form>
			</Modal>

			<Modal
				opened={!!confirmDoctor}
				onClose={() => setConfirmDoctor(null)}
				title="Remove Doctor"
				size="sm"
			>
				<Text
					size="sm"
					mb="lg"
				>
					Are you sure you want to remove <strong>{confirmDoctor?.name}</strong>
					? This cannot be undone.
				</Text>
				<Group justify="flex-end">
					<Button
						variant="default"
						onClick={() => setConfirmDoctor(null)}
					>
						Cancel
					</Button>
					<Button
						color="red"
						loading={deleteMutation.isPending}
						onClick={() => deleteMutation.mutate(confirmDoctor._id)}
					>
						Remove
					</Button>
				</Group>
			</Modal>

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
							<Table.Th />
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{rows.map((dr) => (
							<>
								<Table.Tr
									key={dr._id}
									onClick={() =>
										setExpandedId(expandedId === dr._id ? null : dr._id)
									}
									className="text-left cursor-pointer"
								>
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
									<Table.Td>
										<ActionIcon
											color="red"
											variant="subtle"
											onClick={(e) => {
												e.stopPropagation();
												setConfirmDoctor(dr);
											}}
										>
											✕
										</ActionIcon>
									</Table.Td>
								</Table.Tr>

								{expandedId === dr._id && (
									<Table.Tr key={`${dr._id}-patients`}>
										<Table.Td
											colSpan={5}
											style={{ background: '#f9fafb' }}
										>
											{dr.patients?.length ? (
												<Table verticalSpacing="xs">
													<Table.Thead>
														<Table.Tr>
															<Table.Th>Patient Name</Table.Th>
															<Table.Th>DOB</Table.Th>
															<Table.Th>New Patient</Table.Th>
														</Table.Tr>
													</Table.Thead>
													<Table.Tbody className="text-left">
														{dr.patients.map((p) => (
															<Table.Tr key={p._id}>
																<Table.Td>{p.name}</Table.Td>
																<Table.Td>{p.dob}</Table.Td>
																<Table.Td>
																	{p.new_Patient ? (
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
															</Table.Tr>
														))}
													</Table.Tbody>
												</Table>
											) : (
												<Text
													size="sm"
													c="dimmed"
													p="xs"
												>
													No patients assigned.
												</Text>
											)}
										</Table.Td>
									</Table.Tr>
								)}
							</>
						))}
					</Table.Tbody>
				</Table>
			</section>
		</>
	);
}
