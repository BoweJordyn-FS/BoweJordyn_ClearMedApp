import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@mantine/core/styles.css';
import './index.css';
import { MantineProvider } from '@mantine/core';
import App from './App.jsx';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // cache data for 5 minutes before refetching
			retry: 1, // retry failed requests once
		},
	},
});

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<MantineProvider>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</MantineProvider>
		</QueryClientProvider>
	</StrictMode>,
);
