import { Button, Group, Select, Table } from '@mantine/core';
import Navigation from '../components/Navigation';
import AllPatients from '../components/AllPatients';
export default function Dashboard() {
	return (
		<div>
			<section id="stats"></section>
			<AllPatients />
		</div>
	);
}
