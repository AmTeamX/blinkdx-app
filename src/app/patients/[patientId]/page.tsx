// src/app/patients/[patientId]/page.tsx
import { VideoComparisonTable } from '@/components/VideoComparisonTable';
import { getPatientById, getVideosForPatient } from '@/services/patientService';
import Link from 'next/link';


export default async function PatientVideoPage({ params }: { params: { patientId: string } }) {
    const { patientId } = params;

    try {
        const [patient, videos] = await Promise.all([
            getPatientById(patientId),
            getVideosForPatient(patientId)
        ]);

        return (
            <div className="min-h-screen bg-gray-100 py-10 font-sans">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-10">
                        <Link href="/" className="text-blue-600 hover:text-blue-800 hover:underline">
                            &larr; Back to Patient Directory
                        </Link>
                        <h1 className="text-4xl font-extrabold text-gray-900 mt-4">
                            Research ID: <span className="text-blue-700"> {patient.researchID}</span>
                        </h1>
                        <div className="flex items-center mt-2">
                            <p className="text-lg text-gray-600 ml-4">{videos.length} videos</p>
                        </div>
                    </div>

                    {videos.length > 0 ? (
                        <>
                            <div className="mb-6 flex justify-between items-center">
                                {/* <div className="flex space-x-2">
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                        Compare Selected
                                    </button>
                                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
                                        Export Data
                                    </button>
                                </div> */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Filter videos..."
                                        className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                            <VideoComparisonTable videos={videos} />
                        </>
                    ) : (
                        <div className="text-center text-gray-500 text-lg py-16 bg-white rounded-lg shadow-md">
                            No videos have been uploaded for this patient yet.
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
                <div className="text-center bg-white p-8 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Failed to Load Patient Data</h1>
                    <p className="text-gray-700 mb-6">Could not retrieve information for patient with ID: {patientId}.</p>
                    <Link href="/" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        Return to Patient Directory
                    </Link>
                </div>
            </div>
        );
    }
}