'use client'
import { getSummaryData } from "@/services/getSummaryData";
import { Video, VideoSummary } from "@/types/types";
import Link from "next/link";
import { useEffect, useState } from "react";

interface VideoComparisonTableProps {
    videos: Video[];
}

export function VideoComparisonTable({ videos }: VideoComparisonTableProps) {
    const [summaries, setSummaries] = useState<Record<number, VideoSummary | null>>({});

    useEffect(() => {
        async function fetchSummaries() {
            const results: Record<number, VideoSummary | null> = {};
            await Promise.all(
                videos.map(async (video) => {
                    try {
                        const summary = await getSummaryData(video.id);
                        results[video.id] = summary;
                    } catch (error) {
                        results[video.id] = null;
                    }
                })
            );
            setSummaries(results);
        }

        if (videos.length > 0) {
            fetchSummaries();
        }
    }, [videos]);

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Video ID
                        </th> */}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Upload Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Peak Velocity during Closing Phase
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Max Blink Amplitude
                        </th>

                        {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Resolution
                        </th> */}
                        {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Duration
                        </th> */}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Abnormal Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {videos.map((video) => {
                        const lastStatus = video.statuses?.length > 0
                            ? video.statuses[video.statuses.length - 1]
                            : { status: 'Unknown', statusDatetime: '' };

                        const uploadDate = new Date(video.uploadDatetime).toLocaleDateString();
                        const duration = video.milliSeconds ? `${(video.milliSeconds / 1000).toFixed(2)}s` : 'N/A';

                        return (
                            <tr key={video.id} className="hover:bg-gray-50 transition-colors">
                                {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {video.id}
                                </td> */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${lastStatus.status === 'Ready' ? 'bg-green-100 text-green-800' :
                                            lastStatus.status === 'Error' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {lastStatus.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {uploadDate}
                                </td>
                                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {video.width}x{video.height} @ {video.fps}FPS
                                </td> */}
                                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {duration}
                                </td> */}

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {summaries[video.id]?.data ? (
                                        <>
                                            <span className="text-green-600 font-semibold mr-4">
                                                R = {Number(summaries[video.id]?.data.r_close_peak_vel_mean).toFixed(2)}
                                            </span>
                                            <span className="text-blue-600 font-semibold">
                                                L = {Number(summaries[video.id]?.data.l_close_peak_vel_mean).toFixed(2)}
                                            </span>
                                        </>
                                    ) : (
                                        'Loading...'
                                    )}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {summaries[video.id]?.data ? (
                                        <>
                                            <span className="text-green-600 font-semibold mr-4">
                                                R = {Number(summaries[video.id]?.data.r_blink_max_amp).toFixed(2)}
                                            </span>
                                            <span className="text-blue-600 font-semibold">
                                                L = {Number(summaries[video.id]?.data.l_blink_max_amp).toFixed(2)}
                                            </span>
                                        </>
                                    ) : (
                                        'Loading...'
                                    )}
                                </td>

                                <td
                                    className={`px-6 py-4 whitespace-nowrap text-sm capitalize ${summaries[video.id]?.abnormal?.is_abnormal ? 'text-red-500' : 'text-gray-500'
                                        }`}
                                >

                                    {summaries[video.id]?.abnormal?.status ?? 'Loading...'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <Link
                                        href={`/result/${video.id}`}
                                        className="text-blue-600 hover:text-blue-900 hover:underline"
                                    >
                                        View Analysis
                                    </Link>
                                    {/* <span className="mx-2 text-gray-300">|</span> */}
                                    {/* <button
                                        className="text-blue-600 hover:text-blue-900 hover:underline"
                                        onClick={() => {
                                            // Add comparison logic here
                                        }}
                                    >
                                        Compare
                                    </button> */}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}