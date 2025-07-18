import axiosInstance from "@/lib/axiosInstance";

/**
 * Fetches SVG annotation paths for a specific video frame offset.
 * @param videoId The ID of the video.
 * @param offset The frame number (offset) to retrieve annotations for.
 * @returns Promise resolving to a string containing newline-separated SVG path elements.
 * @throws An error if the API call fails or annotations are not found.
 */
export async function getVideoAnnotation(videoId: number, offset: number): Promise<string> {
    try {
        const url = `/video/${videoId}/annotation/${offset}`;
        // Expecting plain text response containing SVG path strings
        const response = await axiosInstance.get<string>(url, {
            responseType: 'text',
        });
        console.log(response.data.trim())

        // The backend seems to return a string like: "<path d=\"...\"/>\n<path d=\"...\"/> <47>\n..."
        // We want to return this raw string for now, and handle parsing/cleaning on the frontend.
        return response.data.trim(); // Trim any extra whitespace around the whole response

    } catch (error) {
        console.error(`Error fetching annotations for video ID ${videoId}, offset ${offset}:`, error);
        // You might want to handle 404 specifically if missing annotations is common
        throw error;
    }
}