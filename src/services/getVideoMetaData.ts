import axiosInstance from "@/lib/axiosInstance";
import { VideoMetadata } from "@/types/videoMetadata";

/**
 * Fetches detailed metadata for a specific video.
 * @param videoId The ID of the video to fetch metadata for.
 * @returns Promise resolving to a VideoMetadata object.
 * @throws An error if the API call fails or the video is not found.
 */
export async function getVideoMetadata(videoId: number): Promise<VideoMetadata> {
    try {
        const url = `/video/${videoId}/info`;

        const response = await axiosInstance.get<VideoMetadata>(url);

        // If your API returns { data: VideoMetadata } instead of just VideoMetadata,
        // you would change the above to:
        // const response = await axiosInstance.get<ApiResponse<VideoMetadata>>(url);
        // return response.data.data;

        return response.data;
    } catch (error) {
        console.error(`Error fetching video metadata for ID ${videoId}:`, error);
        throw error;
    }
}