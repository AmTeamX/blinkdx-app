"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedPage } from "@/components/AuthWrapper";
import VideoDisplay from "@/components/VideoDisplay";

export default function VideoPage() {
  const router = useRouter();
  const params = useParams();
  const videoIdParam = params?.videoId;

  const [videoId, setVideoId] = useState<number | null>(null);
  const [isValidId, setIsValidId] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Validate and parse videoId
    if (!videoIdParam) {
      setIsValidId(false);
      setIsLoading(false);
      return;
    }

    const parsedId =
      typeof videoIdParam === "string"
        ? parseInt(videoIdParam, 10)
        : Number(videoIdParam);

    if (isNaN(parsedId) || parsedId <= 0) {
      setIsValidId(false);
      setIsLoading(false);
      return;
    }

    setVideoId(parsedId);
    setIsValidId(true);
    setIsLoading(false);
  }, [videoIdParam]);

  const handleBackToPatients = () => {
    router.push("/");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-gray-100">
        {/* Header with navigation */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoBack}
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
                <span>Back</span>
              </button>
              <span className="text-gray-400">|</span>
              <button
                onClick={handleBackToPatients}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Patient Directory
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
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
              <span className="text-gray-600 text-lg">Loading video...</span>
            </div>
          </div>
        )}

        {/* Error State - Invalid Video ID */}
        {!isLoading && !isValidId && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
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
                Invalid Video ID
              </h1>
              <p className="text-gray-700 mb-6">
                The video ID provided in the URL is not valid: {videoIdParam}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleBackToPatients}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Return to Patient Directory
                </button>
                <button
                  onClick={handleGoBack}
                  className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success State - Valid Video ID */}
        {!isLoading && isValidId && videoId && (
          <VideoDisplay
            videoId={videoId}
            onError={() => {
              // Handle video loading errors from the VideoDisplay component
              console.error(`Failed to load video with ID: ${videoId}`);
            }}
          />
        )}
      </div>
    </ProtectedPage>
  );
}
