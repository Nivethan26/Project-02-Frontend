"use client";
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Consultation {
	_id: string;
	doctor?: {
		firstName?: string;
		lastName?: string;
		speciality?: string;
	};
	date: string;
	time: string;
	status: string;
}

export default function CustomerConsultaionsPage() {
	const [consultations, setConsultations] = useState<Consultation[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [cancelTarget, setCancelTarget] = useState<any>(null);
	const [refundEligible, setRefundEligible] = useState(false);

	useEffect(() => {
		let intervalId: NodeJS.Timeout;
		let isFirstFetch = true;
		const fetchConsultations = async () => {
			setError("");
			if (isFirstFetch) setLoading(true);
			try {
				const token = localStorage.getItem("token") || sessionStorage.getItem("token");
				const response = await axios.get("http://localhost:8000/api/consultation/user", {
					headers: { Authorization: `Bearer ${token}` }
				});

				const data: Consultation[] = response.data || [];
				const now = new Date().getTime();

				const toMillis = (c: Consultation) => {
					// Ensure time is HH:mm
					const t = (c.time || "00:00").padStart(5, '0');
					const dt = new Date(`${c.date}T${t}:00`);
					return dt.getTime();
				};

				// Upcoming first (earliest first), then past (most recent past first)
				const sorted = [...data].sort((a, b) => {
					const am = toMillis(a);
					const bm = toMillis(b);
					const aUpcoming = am >= now ? 0 : 1;
					const bUpcoming = bm >= now ? 0 : 1;
					if (aUpcoming !== bUpcoming) return aUpcoming - bUpcoming; // upcoming group first
					if (aUpcoming === 0) return am - bm; // both upcoming: earliest first
					return bm - am; // both past: most recent first
				});

				setConsultations(sorted);
			} catch (err) {
				setError("Failed to load consultations");
			} finally {
				if (isFirstFetch) {
					setLoading(false);
					isFirstFetch = false;
				}
			}
		};
		fetchConsultations();
		intervalId = setInterval(fetchConsultations, 10000); // 10 seconds
		return () => clearInterval(intervalId);
	}, []);

	return (
		<ProtectedRoute role="customer">
			<div className="flex min-h-screen bg-gray-50">
				<Sidebar role="customer" />
				<main className="flex-1 ml-64 p-8">
					<div className="max-w-7xl mx-auto">
						<h1 className="text-4xl font-bold text-black mb-8">Consultation Bookings</h1>
						<p>Please plan to arrive on time and keep your appointment. If you are unable to attend, then cancel the appointment within 24 hours. Early cancellations help us offer your slot to another patient.</p>
						<div className="bg-white rounded-lg shadow p-6">
							{loading ? (
								<div className="text-black">Loading...</div>
							) : error ? (
								<div className="text-red-600">{error}</div>
							) : consultations.length === 0 ? (
								<div className="text-black">No bookings found.</div>
							) : (
								<div className="overflow-x-auto">
									<table className="min-w-full divide-y divide-gray-300">
										<thead className="bg-gray-100">
											<tr>
												<th className="px-6 py-3 text-left text-sm font-bold text-black uppercase">Doctor</th>
												<th className="px-6 py-3 text-left text-sm font-bold text-black uppercase">Speciality</th>
												<th className="px-6 py-3 text-left text-sm font-bold text-black uppercase">Date</th>
												<th className="px-6 py-3 text-left text-sm font-bold text-black uppercase">Time</th>
												  <th className="px-6 py-3 text-left text-sm font-bold text-black uppercase">Status</th>
												  <th className="px-6 py-3 text-left text-sm font-bold text-black uppercase">Action</th>
											</tr>
										</thead>
										<tbody className="bg-white divide-y divide-gray-200 text-black">
											{consultations.map((c, idx) => (
												<tr
													key={c._id || idx}
													className="hover:bg-gray-50 transition-colors"
												>
													<td className="px-6 py-4">{c.doctor?.firstName} {c.doctor?.lastName}</td>
													<td className="px-6 py-4">{c.doctor?.speciality || '-'}</td>
													<td className="px-6 py-4">{c.date}</td>
													<td className="px-6 py-4">{c.time}</td>
																								<td className="px-6 py-4">
																									<span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
																										c.status === 'confirmed' 
																											? 'bg-green-100 text-green-800 border border-green-200' 
																											: 'bg-gray-100 text-gray-800'
																									}`}>
																										{c.status === 'confirmed' && (
																											<span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
																										)}
																										{c.status}
																									</span>
																								</td>
																																			<td className="px-6 py-4">
																																				{(() => {
																																					const bookingDate = new Date(`${c.date}T${(c.time || "00:00").padStart(5, '0')}:00`);
																																					const now = new Date();
																																					const diffMs = bookingDate.getTime() - now.getTime();
																																					const diffHrs = diffMs / (1000 * 60 * 60);
																																					const canCancel = c.status === 'confirmed' && diffHrs >= 24;
																																					return (
																																						<button
																																							disabled={!canCancel}
																																							onClick={() => {
																																								setCancelTarget(c);
																																								setRefundEligible(diffHrs <= 24);
																																								setShowModal(true);
																																							}}
																																							className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 border-2 ${canCancel ? 'bg-red-500 text-white border-red-600 hover:bg-red-600 hover:border-red-700' : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'}`}
																																						>
																																							Cancel
																																						</button>
																																					);
																																				})()}
																																			</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</div>
					</div>
				</main>
			</div>
				{/* Cancel Confirmation Modal */}
						{showModal && (
							<div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
								<div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
							<h2 className="text-xl font-bold mb-4">Confirm Cancellation</h2>
							<p className="mb-4">Are you sure you want to cancel this booking?</p>
							{refundEligible && (
								<p className="mb-4 text-green-600 font-semibold">You will be refunded since you are cancelling within 24 hours of booking.</p>
							)}
							<div className="flex gap-4 justify-end">
								<button
									className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold"
									onClick={() => setShowModal(false)}
								>
									No, Keep Booking
								</button>
								<button
									className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold"
									onClick={async () => {
										if (!cancelTarget) return;
										setShowModal(false);
										setLoading(true);
										setError("");
										try {
											const token = localStorage.getItem("token") || sessionStorage.getItem("token");
											await axios.post(`http://localhost:8000/api/consultation/cancel/${cancelTarget._id}`, { refund: refundEligible }, {
												headers: { Authorization: `Bearer ${token}` }
											});
											setConsultations(prev => prev.map(item => item._id === cancelTarget._id ? { ...item, status: 'cancelled' } : item));
										} catch (err) {
											setError("Failed to cancel booking");
										} finally {
											setLoading(false);
											setCancelTarget(null);
										}
									}}
								>
									Yes, Cancel & Refund
								</button>
							</div>
						</div>
					</div>
				)}
			</ProtectedRoute>
	);
}
