"use client";

import { useEffect, useState } from "react";
import { deletePatient, getAllPatients } from "@/services/patientService";

// Import your Client Components
import PatientList from "@/components/PatientList";
import VideoUploadForm from "@/components/VideoUploadForm";
import { ProtectedPage } from "@/components/AuthWrapper";
import { Patient } from "@/types/Patient";

// Main Homepage component, now much simpler
export default function PatientsListPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const fetchedPatients = await getAllPatients();
      setPatients(fetchedPatients);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch patients:", err);
      setError("Failed to load patient data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleRefreshData = async () => {
    await fetchPatients();
  };

  const handleDeletePatient = async (id: number) => {
    try {
      await deletePatient(id);
      await fetchPatients(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete patient:", error);
      setError("Failed to delete patient. Please try again.");
    }
  };

  if (loading) {
    return (
      <ProtectedPage
        fallback={
          <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <svg
                className="animate-spin h-8 w-8 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-gray-600 text-lg">Loading patients...</span>
            </div>
          </div>
        }
      >
        <div className="min-h-screen bg-gray-100 py-10 font-sans">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-6">
              Patient Directory
            </h1>
            <p className="text-center text-lg text-gray-600 mb-10">
              Select a patient to view their video analyses.
            </p>

            <VideoUploadForm
              onUploadSuccess={handleRefreshData}
              patients={patients}
            />

            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8"
                role="alert"
              >
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}

            {/* --- Render the Client Component with the data --- */}
            {!error && (
              <PatientList
                initialPatients={patients}
                deleteAction={handleDeletePatient}
              />
            )}
          </div>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-gray-100 py-10 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-6">
            Patient Directory
          </h1>
          <p className="text-center text-lg text-gray-600 mb-10">
            Select a patient to view their video analyses.
          </p>

          <VideoUploadForm
            onUploadSuccess={handleRefreshData}
            patients={patients}
          />

          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8"
              role="alert"
            >
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {/* --- Render the Client Component with the data --- */}
          {!error && (
            <PatientList
              initialPatients={patients}
              deleteAction={handleDeletePatient}
            />
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}
