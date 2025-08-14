"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ProtectedPage } from "@/components/AuthWrapper";
import { VideoComparisonTable } from "@/components/VideoComparisonTable";
import { getPatientById, getVideosForPatient } from "@/services/patientService";
import { Patient } from "@/types/Patient";
import { Video } from "@/types/types";

export default function PatientVideoPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params?.patientId as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    if (!patientId) {
      setError("Invalid patient ID");
      setLoading(false);
      return;
    }

    const fetchPatientData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [patientData, videosData] = await Promise.all([
          getPatientById(patientId),
          getVideosForPatient(patientId),
        ]);

        setPatient(patientData);
        setVideos(videosData);
      } catch (err: any) {
        console.error("Error fetching patient data:", err);
        setError(err.message || "Failed to load patient data");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  const handleBackToDirectory = () => {
    router.push("/");
  };

  // Filter videos based on search
  const filteredVideos = videos.filter((video) =>
    video.filePath.toLowerCase().includes(searchFilter.toLowerCase()),
  );

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-gray-100 py-10 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-gray-600 text-lg">
                  Loading patient data...
                </span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
              <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <div className="mb-4">
                  <svg
                    className="mx-auto h-12 w-12 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-red-600 mb-4">
                  Failed to Load Patient Data
                </h1>
                <p className="text-gray-700 mb-6">
                  Could not retrieve information for patient with ID:{" "}
                  {patientId}.
                </p>
                <p className="text-sm text-gray-500 mb-6">Error: {error}</p>
                <div className="space-y-3">
                  <button
                    onClick={handleBackToDirectory}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Return to Patient Directory
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {!loading && !error && patient && (
            <>
              <div className="mb-10">
                <button
                  onClick={handleBackToDirectory}
                  className="text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span>Back to Patient Directory</span>
                </button>

                <h1 className="text-4xl font-extrabold text-gray-900 mt-4">
                  Research ID:{" "}
                  <span className="text-blue-700">{patient.researchID}</span>
                </h1>

                <div className="flex items-center mt-2">
                  <p className="text-lg text-gray-600 ml-4">
                    {videos.length} video{videos.length !== 1 ? "s" : ""}
                  </p>
                  {videos.length > 0 && (
                    <span className="ml-4 text-sm text-gray-500">
                      ({filteredVideos.length} showing)
                    </span>
                  )}
                </div>
              </div>

              {videos.length > 0 ? (
                <>
                  <div className="mb-6 flex justify-between items-center">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Filter videos..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[250px]"
                      />
                      <svg
                        className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>

                  {filteredVideos.length > 0 ? (
                    <VideoComparisonTable videos={filteredVideos} />
                  ) : (
                    <div className="text-center text-gray-500 text-lg py-16 bg-white rounded-lg shadow-md">
                      No videos match your search criteria.
                      <button
                        onClick={() => setSearchFilter("")}
                        className="block mx-auto mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Clear Filter
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-gray-500 text-lg py-16 bg-white rounded-lg shadow-md">
                  <div className="mb-4">
                    <svg
                      className="mx-auto h-16 w-16 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="mb-4">
                    No videos have been uploaded for this patient yet.
                  </p>
                  <button
                    onClick={handleBackToDirectory}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Upload Videos
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}
