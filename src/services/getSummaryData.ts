import axiosInstance from "@/lib/axiosInstance";
import { VideoSummary } from "@/types/videoSummaryData";

/**
 * Fetches summary data for a specific video.
 * @param videoId The ID of the video to fetch summary for.
 * @returns Promise resolving to a VideoSummary object.
 * @throws An error if the API call fails.
 */
export async function getSummaryData(videoId: number): Promise<VideoSummary> {
    try {
        const url = `/video/${videoId}/summary`;
        console.log(`[getSummaryData] Requesting: ${axiosInstance.defaults.baseURL}${url}`);
        const response = await axiosInstance.get<VideoSummary>(url);
        console.log('[getSummaryData] Summary data received:', response.data);
        return response.data;
    } catch (error: any) {
        console.error(`[getSummaryData] Error fetching summary data for video ID ${videoId}:`, error);
        if (error.response) {
            console.error('[getSummaryData] Response data:', error.response.data);
            console.error('[getSummaryData] Response status:', error.response.status);
        }
        throw error; // Re-throw to be handled by the calling component
    }
}