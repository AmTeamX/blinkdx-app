// src/services/getAllVideoAnnotations.ts

import axiosInstance from "@/lib/axiosInstance";

interface ParsedAnnotationFrame {
    offset: number; // The frame number this annotation belongs to
    svgPaths: string; // The combined SVG string for this frame
}

/**
 * Fetches all SVG annotation paths for a given video ID and parses them into per-frame strings.
 * Assumes each video frame's annotation consists of 6 SVG path lines.
 * @param videoId The ID of the video.
 * @returns Promise resolving to an array of ParsedAnnotationFrame objects.
 * @throws An error if the API call fails or annotations are not found.
 */
export async function getAllVideoAnnotations(videoId: number): Promise<ParsedAnnotationFrame[]> {
    try {
        const url = `/video/${videoId}/annotations`;
        // Expecting a plain text response containing all SVG path strings
        const response = await axiosInstance.get<string>(url, {
            responseType: 'text', // Crucial for getting the raw string
        });

        const fullAnnotationString = response.data.trim();

        // Split the entire string by newline characters
        const allLines = fullAnnotationString.split('\n');

        const parsedAnnotations: ParsedAnnotationFrame[] = [];
        const pathsPerFrame = 6; // As determined from your backend's get_annotation logic (offset * 6)

        for (let i = 0; i < allLines.length; i += pathsPerFrame) {
            const frameOffset = i / pathsPerFrame; // Calculate the frame offset

            // Get the 6 lines for the current frame
            const frameLines = allLines.slice(i, i + pathsPerFrame);

            // Filter out any non-path lines (like the <47> markers) and join them
            const cleanSvgStringsForFrame = frameLines
                .filter(line => line.trim().startsWith('<path d='))
                .join('\n'); // Join them back with newlines for the innerHTML

            if (cleanSvgStringsForFrame) { // Only add if there are actual SVG paths for this frame
                parsedAnnotations.push({
                    offset: frameOffset,
                    svgPaths: cleanSvgStringsForFrame,
                });
            }
        }

        return parsedAnnotations;

    } catch (error) {
        console.error(`Error fetching all annotations for video ID ${videoId}:`, error);
        throw error;
    }
}