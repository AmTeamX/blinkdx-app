
// You likely already have this or a similar interface from previous steps.
// This is the structure for each video object in the list.
export interface Video {
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

// Assuming VideoStatus is already defined like this:
export interface VideoStatus {
    status: string;
    statusDatetime: string;
    owner: string;
    id: number;
    videoID: number;
}


// ... (keep your other interfaces like VideoSummary, VideoParams, etc.)