import { useState } from 'react';
import { Hospital } from 'iconsax-react';
import { MdOutlineDashboard } from 'react-icons/md';
import { FaUserDoctor } from 'react-icons/fa6';
import { BsFileEarmarkPerson } from 'react-icons/bs';
import { Group } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';

const routeNames = {
	'/': 'Dashboard',
	'/doctors': 'Doctors',
	'/patients': 'Patients',
};

export default function Navigation({ children, onSubmit }) {
	const { pathname } = useLocation();
	const pageName = routeNames[pathname] ?? pathname;
	const [term, setTerm] = useState('');

	const handleChange = (event) => {
		setTerm(event.target.value);
	};
	return (
		<div className="flex h-screen">
			<aside className="w-52 bg-white border-r border-stone-100 flex flex-col shrink-0">
				<div className="px-5 py-4 border-b border-stone-100">
					<div className="flex items-center gap-2.5">
						<div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
							<Hospital
								size={24}
								color="white"
							/>
						</div>
						<div className="p-1">
							<div className="text-lg font-medium leading-none">ClearMed</div>
							<div className="text-sm text-stone-400 mt-0.5">Clinic Portal</div>
						</div>
					</div>
				</div>

				<nav className="py-3 text-left gap-2">
					<div className="text-sm font-bold text-stone-300 uppercase tracking-widest mb-1 px-2.5 ">
						Main
					</div>
					<ul className="py-1">
						<li className="hover:bg-emerald-100 p-1">
							<Link
								to="/"
								className="py-2 display flex flex-row items-center gap-1 mx-1"
							>
								<MdOutlineDashboard />
								Dashboard
							</Link>
						</li>
						<li className="hover:bg-emerald-100 p-1">
							<Link
								to="/doctors"
								className="py-2 display flex flex-row items-center gap-1 mx-1"
							>
								<FaUserDoctor /> Doctors
							</Link>
						</li>
						<li className="hover:bg-emerald-100 p-1">
							<Link
								to="/patients"
								className="py-2 display flex flex-row items-center gap-1 mx-1"
							>
								<BsFileEarmarkPerson /> Patients
							</Link>
						</li>
					</ul>
				</nav>
			</aside>

			<div className="flex flex-col flex-1">
				<header className="flex flex-row justify-between px-5 py-4 border-b border-stone-100 items-center shrink-0 bg-white h-20.5">
					<div className="pl-2 pt-2">
						<h2>{pageName}</h2>
					</div>
					<div>
						<form onSubmit={onSubmit}>
							<input
								type="search"
								placeholder="Search..."
								value={term}
								className="border rounded-md w-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
								onChange={handleChange}
							/>
						</form>
					</div>
					<div className="rounded-full bg-emerald-200 p-1">
						<div>AD</div>
					</div>
				</header>

				<main className="flex-1 overflow-auto p-5">{children}</main>
			</div>
		</div>
	);
}
