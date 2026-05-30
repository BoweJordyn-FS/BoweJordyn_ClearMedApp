import React, { useState, useEffect } from 'react';
import {
	Group,
	Button,
	Table,
	Modal,
	TextInput,
	Switch,
	Text,
	ActionIcon,
} from '@mantine/core';
import {
	getAllDoctors,
	createDoctor,
	updateDoctor,
	deleteDoctor,
} from '../api/doctors';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { AvailabilityBadge, PatientTypeBadge } from './badges';
import { useSearch } from '../context/SearchContext';
import { FaRegEdit } from 'react-icons/fa';
import { TiDeleteOutline } from 'react-icons/ti';

const defaultForm = {
	name: '',
	specialty: '',
	email: '',
	available: false,
};

export default function AllDoctors() {
	const [opened, setOpened] = useState(false);
	const [form, setForm] = useState(defaultForm);
	const [editTarget, setEditTarget] = useState(null);
	const [editForm, setEditForm] = useState(defaultForm);
	const [confirmDoctor, setConfirmDoctor] = useState(null);
	const [expandedId, setExpandedId] = useState(null);

	const [doctors, setDoctors] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const searchTerm = useSearch();

	// Load doctors when the component mounts
	useEffect(() => {
		const fetchDoctors = async () => {
			try {
				setIsLoading(true);
				const data = await getAllDoctors();
				setDoctors(data);
			} catch {
				setIsError(true);
			} finally {
				setIsLoading(false);
			}
		};
		fetchDoctors();
	}, []);

	const refreshDoctors = async () => {
		const data = await getAllDoctors();
		setDoctors(data);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			await createDoctor(form);
			await refreshDoctors();
			setOpened(false);
			setForm(defaultForm);
		} finally {
			setIsSubmitting(false);
		}
	};

	const openEdit = (dr) => {
		setEditTarget(dr);
		setEditForm({
			name: dr.name,
			specialty: dr.specialty,
			email: dr.email,
			available: dr.available,
		});
	};

	const handleUpdate = async (e) => {
		e.preventDefault();
		setIsUpdating(true);
		try {
			await updateDoctor(editTarget._id, editForm);
			await refreshDoctors();
			setEditTarget(null);
		} finally {
			setIsUpdating(false);
		}
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await deleteDoctor(confirmDoctor._id);
			await refreshDoctors();
			setConfirmDoctor(null);
		} finally {
			setIsDeleting(false);
		}
	};

	if (isLoading) return <div>Loading doctors...</div>;
	if (isError) return <div>Failed to load doctors.</div>;

	const lower = searchTerm.toLowerCase();
	const rows = lower
		? doctors.filter(
				(dr) =>
					dr.name?.toLowerCase().includes(lower) ||
					dr.email?.toLowerCase().includes(lower) ||
					dr.specialty?.toLowerCase().includes(lower),
			)
		: doctors;

	return (
		<>
			{/* Add Doctor modal */}
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
						loading={isSubmitting}
					>
						Add Doctor
					</Button>
				</form>
			</Modal>

			{/* Edit Doctor modal */}
			<Modal
				opened={!!editTarget}
				onClose={() => setEditTarget(null)}
				title="Edit Doctor"
			>
				<form onSubmit={handleUpdate}>
					<TextInput
						label="Name"
						required
						value={editForm.name}
						onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
						mb="sm"
					/>
					<TextInput
						label="Email"
						type="email"
						required
						value={editForm.email}
						onChange={(e) =>
							setEditForm({ ...editForm, email: e.target.value })
						}
						mb="sm"
					/>
					<TextInput
						label="Specialty"
						required
						value={editForm.specialty}
						onChange={(e) =>
							setEditForm({ ...editForm, specialty: e.target.value })
						}
						mb="sm"
					/>
					<Switch
						label="Available"
						checked={editForm.available}
						onChange={(e) =>
							setEditForm({ ...editForm, available: e.currentTarget.checked })
						}
						mb="md"
					/>
					<Button
						type="submit"
						color="teal"
						fullWidth
						loading={isUpdating}
					>
						Save Changes
					</Button>
				</form>
			</Modal>

			<ConfirmDeleteModal
				item={confirmDoctor}
				entityName="Doctor"
				onClose={() => setConfirmDoctor(null)}
				onConfirm={handleDelete}
				isPending={isDeleting}
			/>

			<section className="border-stone-200 shadow-md shadow-stone-200/20 rounded-md p-3 mb-5 bg-white">
				<header className="flex flex-row items-center justify-between mb-4 mx-2">
					<h4>
						All Doctors{' '}
						<span className="text-sm font-normal text-stone-400">
							({doctors.length})
						</span>
					</h4>
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
							<React.Fragment key={dr._id}>
								<Table.Tr
									onClick={() =>
										setExpandedId(expandedId === dr._id ? null : dr._id)
									}
									className="text-left cursor-pointer"
								>
									<Table.Td>{dr.name}</Table.Td>
									<Table.Td>{dr.email}</Table.Td>
									<Table.Td>{dr.specialty}</Table.Td>
									<Table.Td>
										<AvailabilityBadge available={dr.available} />
									</Table.Td>
									{/* stopPropagation so clicking edit/delete doesn't also toggle the expand */}
									<Table.Td>
										<Group
											gap="xs"
											justify="flex-end"
										>
											<ActionIcon
												color="black"
												variant="subtle"
												onClick={(e) => { e.stopPropagation(); openEdit(dr); }}
											>
												<FaRegEdit />
											</ActionIcon>
											<ActionIcon
												color="red"
												variant="subtle"
												onClick={(e) => { e.stopPropagation(); setConfirmDoctor(dr); }}
											>
												<TiDeleteOutline size={24} />
											</ActionIcon>
										</Group>
									</Table.Td>
								</Table.Tr>

								{expandedId === dr._id && (
									<Table.Tr className="text-left">
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
													<Table.Tbody>
														{dr.patients.map((p) => (
															<Table.Tr key={p._id}>
																<Table.Td>{p.name}</Table.Td>
																<Table.Td>{p.dob}</Table.Td>
																<Table.Td>
																	<PatientTypeBadge isNew={p.new_Patient} />
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
							</React.Fragment>
						))}
					</Table.Tbody>
				</Table>
			</section>
		</>
	);
}
