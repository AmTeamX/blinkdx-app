import axiosInstance from "@/lib/axiosInstance";

/**
 * Fetches multiple video frames as Base64 encoded strings in a single request.
 * @param videoId The ID of the video.
 * @param offset The starting frame number to retrieve.
 * @param count The number of frames to retrieve (default: 100, max recommended: 500).
 * @returns Promise resolving to an array of Base64 image strings.
 * @throws An error if the API call fails or the video is not found.
 */
export async function getVideoFrames(
    videoId: number,
    offset: number,
    count: number = 100
): Promise<string[]> {
    try {
        const url = `/video/${videoId}/frames`;
        const response = await axiosInstance.get(url, {
            params: {
                offset,
                num: Math.min(count, 1200) // Limit maximum chunk size for performance
            },
            responseType: 'text' // We'll handle the text response directly
        });

        // Assuming the server sends frames as newline-separated base64 strings
        const frames = response.data.split('\n').map(cleanBase64).filter(Boolean);
        return frames;

    } catch (error) {
        console.error(`Error fetching frames ${offset}-${offset + count} for video ID ${videoId}:`, error);
        throw error;
    }
}

/**
 * Helper function to clean Base64 strings from the API response.
 * Removes quotes and whitespace from the string.
 */
function cleanBase64(str: string): string {
    if (!str) return '';
    let clean = str.trim();
    if (clean.startsWith('"') && clean.endsWith('"')) {
        clean = clean.substring(1, clean.length - 1);
    }
    return clean;
}

/**
 * Fetches a single video frame (wrapper around getVideoFrames for backward compatibility).
 * @param videoId The ID of the video.
 * @param offset The frame number (offset) to retrieve.
 * @returns Promise resolving to a clean Base64 image string.
 */
export async function getVideoFrame(videoId: number, offset: number): Promise<string> {
    const [frame] = await getVideoFrames(videoId, offset, 1);
    return frame;
}