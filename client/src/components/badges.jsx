import { Badge } from '@mantine/core';

export function AvailabilityBadge({ available }) {
	return (
		<Badge color={available ? 'green' : 'red'} variant="light" size="xs">
			{available ? 'Available' : 'Not Available'}
		</Badge>
	);
}

export function PatientTypeBadge({ isNew }) {
	return (
		<Badge color={isNew ? 'blue' : 'gray'} variant="light" size="xs">
			{isNew ? 'New' : 'Return'}
		</Badge>
	);
}

export function InsuranceBadge({ hasInsurance }) {
	return (
		<Badge color={hasInsurance ? 'green' : 'yellow'} variant="light" size="xs">
			{hasInsurance ? 'Insured' : 'Not Insured'}
		</Badge>
	);
}
