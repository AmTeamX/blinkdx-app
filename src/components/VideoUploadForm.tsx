'use client';

import axiosInstance from '@/lib/axiosInstance';
import { createPatient } from '@/services/patientService';
import { Patient, Video } from '@/types/types';
import { FormEvent, useRef, useState } from 'react';

interface VideoUploadFormProps {
    // Pass the list of existing patients down from the server component
    patients: Patient[];
    // The server action to call on success
    onUploadSuccess: () => Promise<void>;
}

export default function VideoUploadForm({ patients, onUploadSuccess }: VideoUploadFormProps) {
    const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id.toString() || 'new');
    const [newPatientName, setNewPatientName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Ref for the file input to reset it after upload
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!file) {
            setError('Please select a video file to upload.');
            return;
        }
        if (selectedPatientId === 'new' && !newPatientName.trim()) {
            setError('Please enter a name for the new patient.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            let patientIdToUpload = selectedPatientId;

            // Step 1: Create a new patient if needed
            if (selectedPatientId === 'new') {
                const newPatient = await createPatient(newPatientName.trim());
                patientIdToUpload = newPatient.id.toString();
                console.log(`Created new patient with ID: ${patientIdToUpload}`);
            }

            // Step 2: Upload the video for the patient
            await uploadVideoForPatient(patientIdToUpload, file);

            setSuccessMessage(`Video uploaded successfully for patient! Refreshing list...`);

            // Step 3: Trigger the server action to revalidate the page data
            await onUploadSuccess();

            // Reset form state
            setFile(null);
            setNewPatientName('');
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Clear the file input
            }
            // Hide success message after a delay
            setTimeout(() => setSuccessMessage(null), 4000);

        } catch (err: any) {
            console.error('Upload process failed:', err);
            setError(err.response?.data?.detail || err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-10">
            {/* Uploading Modal */}
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 shadow-lg text-center">
                        <span className="text-xl font-bold">Uploading...</span>
                        <div className="mt-4">
                            <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                        </div>
                    </div>
                </div>
            )}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload a New Video</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="patient-select" className="block text-sm font-medium text-gray-700">
                        Select Patient
                    </label>
                    <select
                        id="patient-select"
                        value={selectedPatientId}
                        onChange={(e) => setSelectedPatientId(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        {patients.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.researchID}
                            </option>
                        ))}
                        <option value="new">-- Create New Patient --</option>
                    </select>
                </div>

                {selectedPatientId === 'new' && (
                    <div>
                        <label htmlFor="new-patient-name" className="block text-sm font-medium text-gray-700">
                            New Patient Name
                        </label>
                        <input
                            type="text"
                            id="new-patient-name"
                            value={newPatientName}
                            onChange={(e) => setNewPatientName(e.target.value)}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            placeholder="e.g., John Doe"
                        />
                    </div>
                )}

                <div>
                    <label htmlFor="video-file" className="block text-sm font-medium text-gray-700">
                        Video File
                    </label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        id="video-file"
                        accept="video/*"
                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                >
                    {isLoading ? 'Uploading...' : 'Upload Video'}
                </button>

                {successMessage && <div className="text-green-600 text-sm">{successMessage}</div>}
                {error && <div className="text-red-600 text-sm">{error}</div>}
            </form>
        </div>
    );
}

/**
 * Uploads a video file for a specific patient.
 * @param patientId The ID of the patient to upload the video for.
 * @param file The video file to upload.
 * @returns Promise resolving to the uploaded Video object.
 * @throws An error if the upload fails.
 */
async function uploadVideoForPatient(patientId: string, file: File): Promise<Video> {
    try {
        const url = `/patient/${patientId}/video/`;
        console.log(`[uploadVideoForPatient] Requesting POST to: ${axiosInstance.defaults.baseURL}${url}`);

        // Create FormData and verify file
        if (!file) {
            throw new Error('No file provided for upload');
        }

        console.log(`[uploadVideoForPatient] File details:`, {
            name: file.name,
            type: file.type,
            size: file.size
        });

        const formData = new FormData();
        formData.append('video', file);  // Changed from 'file' to 'video' - check what your backend expects

        // Add any additional required fields
        // formData.append('patient_id', patientId);
        // formData.append('some_other_field', 'value');

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                // Add any required headers like authorization
            },
            // Add timeout if needed
            timeout: 1800000
        };

        console.log('[uploadVideoForPatient] Sending request with form data:', formData);

        const response = await axiosInstance.post<Video>(url, formData, config);
        console.log(`[uploadVideoForPatient] Successfully uploaded video for patient ${patientId}:`, response.data);
        return response.data;
    } catch (error: any) {
        console.error(`[uploadVideoForPatient] Error uploading video for patient ${patientId}:`, error);

        if (error.response) {
            console.error('[uploadVideoForPatient] Response status:', error.response.status);
            console.error('[uploadVideoForPatient] Response data:', error.response.data);

            // Handle 422 specifically
            if (error.response.status === 422) {
                const errors = error.response.data?.detail || error.response.data?.errors;
                if (Array.isArray(errors)) {
                    throw new Error(errors.map(e => `${e.loc ? e.loc.join('.') + ' ' : ''}${e.msg}`).join('\n'));
                } else if (typeof errors === 'string') {
                    throw new Error(errors);
                } else if (error.response.data?.detail) {
                    throw new Error(JSON.stringify(error.response.data.detail));
                }
            }
        }

        throw new Error(error.message || 'Failed to upload video');
    }
}