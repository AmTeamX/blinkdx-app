import axiosInstance from "@/lib/axiosInstance";
import { Video } from "@/types/video";

/**
 * Fetches a list of all videos from the API.
 * @param skip Number of items to skip for pagination (default 0).
 * @param limit Maximum number of items to return (default 100).
 * @returns Promise resolving to an array of Video objects.
 * @throws An error if the API call fails.
 */
export async function getAllVideos(skip: number = 0, limit: number = 100): Promise<Video[]> {
    try {
        const url = `/videos?skip=${skip}&limit=${limit}`;
        console.log(`[getAllVideos] Requesting: ${axiosInstance.defaults.baseURL}${url}`);
        const response = await axiosInstance.get<Video[]>(url); // Expects an array of Video objects
        console.log(`[getAllVideos] Received ${response.data.length} videos.`);
        return response.data;
    } catch (error: any) {
        console.error('[getAllVideos] Error fetching video list:', error);
        if (error.response) {
            console.error('[getAllVideos] Response data:', error.response.data);
            console.error('[getAllVideos] Response status:', error.response.status);
        }
        throw error;
    }
}