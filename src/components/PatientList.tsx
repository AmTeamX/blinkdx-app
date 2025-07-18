// src/components/PatientList.tsx
'use client';

import PatientCard from '@/components/PatientCard';
import { Patient } from '@/types/types';
import { useEffect, useState } from 'react';

// --- SVG ICONS (no changes needed here) ---

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-gray-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);

const ClearIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-gray-500 hover:text-gray-800">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);


interface PatientListProps {
    initialPatients: Patient[];
    deleteAction: (id: number) => Promise<void>;
}

//           👇 Add default value here
export default function PatientList({ initialPatients = [], deleteAction }: PatientListProps) {
    const [query, setQuery] = useState('');
    const [filteredPatients, setFilteredPatients] = useState(initialPatients);

    useEffect(() => {
        // With the default prop, initialPatients is now always an array
        if (!query) {
            setFilteredPatients(initialPatients);
            return;
        }
        const results = initialPatients.filter((patient) =>
            // Make sure 'researchID' matches your patient data object exactly
            patient.researchID?.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredPatients(results);
    }, [query, initialPatients]);

    return (
        <>
            {/* --- BEAUTIFUL SEARCH BAR --- */}
            <div className="relative mb-10 max-w-lg mx-auto">
                {/* Search Icon */}
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <SearchIcon />
                </div>

                {/* Input Field */}
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search patient by ReachID..."
                    className="
            block w-full rounded-full border-gray-300 bg-gray-50
            py-3 pl-12 pr-12 text-base text-gray-900
            shadow-sm placeholder:text-gray-400
            focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500
            transition-all duration-200 ease-in-out
          "
                />

                {/* Clear Button (only shows when there is a query) */}
                {query && (
                    <button
                        type="button"
                        onClick={() => setQuery('')}
                        className="absolute inset-y-0 right-0 flex items-center pr-4"
                        aria-label="Clear search"
                    >
                        <ClearIcon />
                    </button>
                )}
            </div>

            {/* --- DISPLAY GRID (This section will now work correctly) --- */}
            <div className="mt-12">
                {filteredPatients.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPatients.map((patient) => (
                            <PatientCard
                                key={patient.id}
                                patient={patient}
                                deleteAction={deleteAction}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 text-lg py-10">
                        {query
                            ? `No patients found for ReachID "${query}".`
                            : 'No patients found. Create one using the form above!'}
                    </div>
                )}
            </div>
        </>
    );
}