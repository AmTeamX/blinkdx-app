
export interface VideoMetadata {
    filePath: string;
    uploadDatetime: string;
    numFrames: number;
    milliSeconds: number;
    fps: number;
    width: number;
    height: number;
    id: number;
    statuses: VideoStatus[];
}

// If your API wraps responses, keep this
// export interface ApiResponse<T> {
//   data: T;
//   message?: string;
//   success: boolean;
// }