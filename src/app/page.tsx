// This remains a Server Component

import { deletePatient, getAllPatients } from '@/services/patientService';
import { revalidatePath } from 'next/cache';

// Import your Client Components
import PatientList from '@/components/PatientList'; // 👈 Import the new component
import VideoUploadForm from '@/components/VideoUploadForm';
import { Patient } from '@/types/Patient';

// Main Homepage component, now much simpler
export default async function PatientsListPage() {
  let patients: Patient[] = []; // Initialize with an empty array
  let error: string | null = null;

  try {
    // Fetch ALL patients, no query parameter needed
    patients = await getAllPatients();
  } catch (err: any) {
    console.error("Failed to fetch patients:", err);
    error = "Failed to load patient data. Please try again later.";
  }

  // --- SERVER ACTIONS (remain the same) ---

  async function refreshData() {
    'use server';
    revalidatePath('/');
    revalidatePath('/patients');
  }

  async function deletePatientAction(id: number) {
    'use server';
    try {
      await deletePatient(id);
      revalidatePath('/');
    } catch (error) {
      console.error("Server Action failed to delete patient:", error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-6">
          Patient Directory
        </h1>
        <p className="text-center text-lg text-gray-600 mb-10">Select a patient to view their video analyses.</p>

        <VideoUploadForm onUploadSuccess={refreshData} patients={patients} />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {/* --- Render the Client Component with the data --- */}
        {!error && (
          <PatientList
            initialPatients={patients}
            deleteAction={deletePatientAction}
          />
        )}
      </div>
    </div>
  );
}