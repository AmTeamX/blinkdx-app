// src/app/result/[videoId]/page.tsx
// This file does NOT need 'use client' anymore.
// It will be a Server Component by default.

import VideoDisplay from '@/components/VideoDisplay'; // Import your new client component

interface VideoPageProps {
    params: {
        videoId: string;
    };
}

// Make this component async to safely access params
export default async function VideoPage({ params }: VideoPageProps) {
    // Parse videoId on the server
    const videoId = parseInt(await (params.videoId), 10);

    if (isNaN(videoId)) {
        // Handle invalid videoId (e.g., redirect to a 404 page or show an error)
        return <div>Error: Invalid video ID provided in URL.</div>;
    }

    // Pass the parsed videoId down to the Client Component
    return <VideoDisplay videoId={videoId} />;
}