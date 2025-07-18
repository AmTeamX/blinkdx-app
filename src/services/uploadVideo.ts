// src/services/uploadVideo.ts

import axiosInstance from "@/lib/axiosInstance";

/**
 * Uploads a video file to the backend.
 * @param file The video file to upload.
 * @returns Promise resolving to the uploaded video's details (or a success message).
 * @throws An error if the upload fails.
 */
export async function uploadVideo(file: File): Promise<any> { // You might want to define a specific response type from your API
    try {
        const formData = new FormData();
        formData.append('file', file); // 'file' should match the name expected by your FastAPI endpoint

        const url = '/video/'; // Your FastAPI endpoint for video upload

        // Set a very long timeout for large video uploads (e.g., 5 minutes = 300,000 ms)
        // You can adjust this based on expected upload times.
        const UPLOAD_TIMEOUT = 300000; // 5 minutes

        console.log(`[uploadVideo] Starting upload for ${file.name}. Timeout: ${UPLOAD_TIMEOUT}ms`);

        const response = await axiosInstance.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Important for file uploads
            },
            timeout: UPLOAD_TIMEOUT,
            // You can add onUploadProgress here if you want a progress bar:
            // onUploadProgress: (progressEvent) => {
            //   const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            //   console.log(`Upload progress for ${file.name}: ${percentCompleted}%`);
            //   // You'd typically update a React state with this percentage
            // }
        });

        console.log('[uploadVideo] Upload successful:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('[uploadVideo] Error during video upload:', error);
        if (error.response) {
            console.error('[uploadVideo] Response data:', error.response.data);
            console.error('[uploadVideo] Response status:', error.response.status);
        } else if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
            throw new Error('Video upload timed out. The file might be too large or network too slow.');
        }
        throw error;
    }
}