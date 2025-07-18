/**
 * Represents the 'data' part of the video summary response.
 * Keys are metric names (strings), values are arrays containing the metric's value.
 * The value can be a number or a string.
 */
export interface VideoSummaryData {
    [key: string]: (string | number)[];
}

export interface abnormalType {
    is_abnormal: boolean,
    status: string
}

/**
 * Represents the overall video summary response from /video/{videoID}/summary.
 */
export interface VideoSummary {
    columns: string[]; // List of metric names/headers
    data: VideoSummaryData; // Object containing the values for each metric
    abnormal: abnormalType
}