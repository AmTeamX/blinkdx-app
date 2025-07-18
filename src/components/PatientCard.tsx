'use client';

import { Patient } from '@/types/types';
import Link from 'next/link';
import { useState } from 'react';

interface PatientCardProps {
    patient: Patient;
    // The Server Action is passed as a prop
    deleteAction: (id: number) => Promise<void>;
}

export default function PatientCard({ patient, deleteAction }: PatientCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const videoCount = patient.videos?.length || 0;

    const handleDelete = async (event: React.MouseEvent<HTMLButtonElement>) => {
        // Prevent the Link from navigating when the button is clicked
        event.preventDefault();
        event.stopPropagation();

        const confirmed = window.confirm(
            `Are you sure you want to delete patient "${patient.name || patient.researchID}"? This action cannot be undone.`
        );

        if (confirmed) {
            setIsDeleting(true);
            try {
                await deleteAction(patient.id);
                // No need to set isDeleting back to false, as the component will be removed from the UI upon successful revalidation.
            } catch (error) {
                console.error("Failed to delete patient:", error);
                alert("An error occurred while deleting the patient.");
                setIsDeleting(false); // Reset state on error
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 group flex flex-col justify-between h-full relative">
            <Link href={`/patients/${patient.id}`} passHref className="flex flex-col justify-between h-full">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-blue-800 group-hover:text-blue-600 transition-colors">
                        Research ID: {patient.researchID}
                    </h2>
                </div>
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <span className="text-blue-600 font-semibold text-sm group-hover:underline">
                            View Details &rarr;
                        </span>
                    </div>
                </div>
            </Link>

            {/* Delete Button */}
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors duration-200 disabled:opacity-50"
                aria-label="Delete patient"
            >
                {isDeleting ? (
                    // Simple spinner
                    <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    // Trash icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                )}
            </button>
        </div>
    );
}