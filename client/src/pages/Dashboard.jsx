import AllPatients from '../components/AllPatients';
import Panels from '../components/Panels';

export default function Dashboard() {
	return (
		<div>
			<section id="stats"></section>
			<Panels />
			<AllPatients />
		</div>
	);
}
