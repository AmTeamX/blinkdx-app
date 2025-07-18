// src/types/api.d.ts

// ... (keep your existing interfaces like VideoMetadata, VideoSummary etc.)

/**
 * Represents the 'data' part of the video parameters response.
 * Keys are parameter names (strings), values are arrays of numbers (one for each frame).
 */
export interface ParamData {
    [key: string]: number[];
}

/**
 * Represents the overall video parameters response from /video/{videoID}/param.
 */
export interface VideoParams {
    columns: string[]; // List of parameter names
    data: ParamData; // Object containing the arrays of values for each parameter
}