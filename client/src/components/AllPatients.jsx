import { Button, Group, Select, Table } from '@mantine/core';
export default function AllPatients() {
	return (
		<div>
			<section
				id="all-patients"
				className=" border-stone-200 shadow-md shadow-stone-200/20 rounded-md p-3 mb-5 bg-white"
			>
				<header className="flex flex-row items-center justify-between mb-4 mx-2">
					<h4>All Patients</h4>
					<Group>
						<Select
							placeholder="All Genders"
							data={['male', 'female']}
							clearable
						/>
						<Select
							placeholder="Insurance"
							data={['Insured', 'Not Insured']}
							clearable
						/>
						<Button
							variant="filled"
							color="teal"
						>
							+ Add Patient
						</Button>
					</Group>
				</header>
				<Table>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Name</Table.Th>
							<Table.Th>DOB</Table.Th>
							<Table.Th>Gender</Table.Th>
							<Table.Th>New Patient</Table.Th>
							<Table.Th>Insurance</Table.Th>
							<Table.Th>Doctor</Table.Th>
						</Table.Tr>
					</Table.Thead>
				</Table>
			</section>
		</div>
	);
}
