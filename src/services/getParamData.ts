import axiosInstance from "@/lib/axiosInstance";
import { VideoParams } from "@/types/types";

/**
 * Fetches parameter data for a specific video across all frames.
 * @param videoId The ID of the video to fetch parameters for.
 * @returns Promise resolving to a VideoParams object.
 * @throws An error if the API call fails.
 */
export async function getParamData(videoId: number): Promise<VideoParams> {
    try {
        const url = `/video/${videoId}/params`;
        console.log(`[getParamData] Requesting: ${axiosInstance.defaults.baseURL}${url}`);
        const response = await axiosInstance.get<VideoParams>(url);
        console.log('[getParamData] Param data received:', response.data);
        return response.data;
    } catch (error: any) {
        console.error(`[getParamData] Error fetching parameter data for video ID ${videoId}:`, error);
        if (error.response) {
            console.error('[getParamData] Response data:', error.response.data);
            console.error('[getParamData] Response status:', error.response.status);
        }
        throw error;
    }
}