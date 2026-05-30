# ClearMed Clinic Portal

A full-stack clinic management app for tracking doctors and patients. The dashboard gives a quick snapshot of staff availability and recently added patients. From there you can navigate to dedicated pages to add, view, and remove doctors and patients — including expanding a doctor's row to see their assigned patient list.

---

## Features

- Dashboard with live doctor and recent-patient panels
- Add / remove doctors (name, email, specialty, availability)
- Add / remove patients (name, DOB, gender, insurance status, assigned doctor)
- Expanding doctor rows to view assigned patients inline
- Doctor capacity cap — doctors with 6 or more patients are hidden from the assignment dropdown

---

## Tech Stack

### Client

| Library                          | Purpose                                                                                                                                                              |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React Router DOM**             | Client-side routing between Dashboard, Doctors, and Patients pages                                                                                                   |
| **React (useEffect / useState)** | Built-in hooks handle all data fetching — each component fetches its data on mount with `useEffect` and stores it in local `useState` |
| **Axios**                        | HTTP client for all API calls; configured with a base URL so every request routes through Vite's proxy to avoid CORS issues in development                           |
| **Mantine**                      | Component library providing the modals, tables, buttons, inputs, badges, and switches used throughout the UI                                                         |
| **Tailwind CSS**                 | Utility-first CSS for layout, spacing, and custom styling not covered by Mantine                                                                                     |
| **react-icons / iconsax-react**  | Icon sets used in the sidebar navigation                                                                                                                             |

### Server

| Library              | Purpose                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| **Express 5**        | HTTP server and REST API routing (`/ClearMed/v1/doctors`, `/ClearMed/v1/patients`)              |
| **Mongoose**         | MongoDB ODM — defines schemas for Doctors and Patients and handles all database reads/writes    |
| **dotenv**           | Loads environment variables (MongoDB connection string, port) from `.env`                       |
| **Morgan**           | HTTP request logger in `dev` mode — logs method, path, status, and response time to the console |
| **Jest + Supertest** | API integration testing — Supertest mounts the Express app without starting a real server       |
| **nodemon**          | Restarts the server automatically on file changes during development                            |

---

## Project Structure

```
BoweJordyn_ClearMedApp/
├── client/                     # React + Vite frontend
│   └── src/
│       ├── api/                # Axios API modules (doctors.js, patients.js, index.js)
│       ├── components/         # Reusable UI components (AllDoctors, AllPatients, Panels, Navigation, badges, ConfirmDeleteModal)
│       ├── context/            # React context (SearchContext)
│       ├── pages/              # Route-level page components (Dashboard, Doctors, Patients)
│       ├── assets/             # Static images/icons
│       ├── App.jsx             # Root component — defines client-side routes
│       └── main.jsx            # Entry point — mounts React, QueryClient, MantineProvider
└── server/                     # Express + Mongoose backend
    ├── app/
    │   ├── controller/         # Business logic for each resource (doctorController, patientController)
    │   ├── db/                 # MongoDB connection config
    │   ├── messages/           # Shared response message strings
    │   ├── models/             # Mongoose schemas (Doctors, Patients)
    │   ├── routes/             # Express routers (doctorRoutes, patientRoutes, index)
    │   ├── test/               # Jest + Supertest API integration tests
    │   └── index.js            # Express app factory
    └── server.js               # Entry point — connects to MongoDB and starts listening
```

Data fetching uses React's built-in `useEffect` hook in each component. Data loads on mount, and after any create or delete operation the component re-fetches to stay in sync with the server.

---

## Getting Started

### Server

```bash
cd server
cp .env.example .env   # add your MONGO_URI and PORT
npm install
npm run dev
```

### Client

```bash
cd client
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173` and proxies `/ClearMed` requests to the Express server.
