import { Button, Group, Modal, Text } from '@mantine/core';

export default function ConfirmDeleteModal({ item, entityName, onClose, onConfirm, isPending }) {
	return (
		<Modal opened={!!item} onClose={onClose} title={`Remove ${entityName}`} size="sm">
			<Text size="sm" mb="lg">
				Are you sure you want to remove <strong>{item?.name}</strong>? This cannot be undone.
			</Text>
			<Group justify="flex-end">
				<Button variant="default" onClick={onClose}>
					Cancel
				</Button>
				<Button color="red" loading={isPending} onClick={onConfirm}>
					Remove
				</Button>
			</Group>
		</Modal>
	);
}
