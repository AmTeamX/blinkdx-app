// src/components/VideoDisplay.tsx
'use client';

import { getAllVideoAnnotations, getParamData, getSummaryData, getVideoFrames, getVideoMetadata } from '@/services/services';
import { VideoMetadata, VideoParams, VideoSummary } from '@/types/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SummaryCard } from './SummaryCard';

import {
    CategoryScale,
    ChartData,
    Chart as ChartJS,
    ChartOptions,
    Legend,
    LinearScale,
    LineElement,
    Plugin,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Chart.js registration
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface VideoDisplayProps {
    videoId: number;
}

const FRAME_LOAD_BATCH_SIZE = 1200;

interface AnnotationData {
    [key: number]: string;
}

export default function VideoDisplay({ videoId }: VideoDisplayProps) {
    // --- STATE AND REFS ---
    const [frames, setFrames] = useState<string[]>([]);
    const [allSvgAnnotations, setAllSvgAnnotations] = useState<AnnotationData>({});
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
    const [summaryData, setSummaryData] = useState<VideoSummary | null>(null);
    const [paramData, setParamData] = useState<VideoParams | null>(null);
    const [selectedParams, setSelectedParams] = useState<string[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const isFetchingDataRef = useRef(false);

    const totalFrames = metadata?.numFrames || 0;
    const displayIntervalMs = metadata?.fps ? Math.max(1000 / metadata.fps, 10) : 40;

    // --- LOGIC AND HANDLERS ---
    const fetchImageFramesInBatches = useCallback(async (currentVideoId: number, totalVideoFrames: number) => {
        for (let i = 0; i < totalVideoFrames; i += FRAME_LOAD_BATCH_SIZE) {
            const batchSize = Math.min(FRAME_LOAD_BATCH_SIZE, totalVideoFrames - i);
            try {
                const frames = await getVideoFrames(currentVideoId, i, batchSize);
                setFrames(prev => {
                    const newFrames = [...prev];
                    frames.forEach((base64, index) => {
                        if (base64) newFrames[i + index] = `data:image/jpeg;base64,${base64}`;
                    });
                    return newFrames;
                });
            } catch (error) {
                console.error(`Error loading frames ${i}-${i + batchSize}`, error);
            }
        }
    }, []);

    const handleParamSelection = useCallback((paramName: string) => {
        setSelectedParams(prev => prev.includes(paramName) ? prev.filter(n => n !== paramName) : [...prev, paramName]);
    }, []);

    const pausePlayback = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const handleVideoSeek = useCallback((frameIndex: number) => {
        pausePlayback();
        setCurrentFrameIndex(frameIndex);
    }, [pausePlayback]);

    const togglePlayPause = useCallback(() => {
        if (timerRef.current) {
            pausePlayback();
        } else {
            timerRef.current = setInterval(() => {
                setCurrentFrameIndex(prevIndex => (prevIndex + 1) % totalFrames);
            }, displayIntervalMs);
        }
    }, [displayIntervalMs, totalFrames, pausePlayback]);

    const handleNextFrame = useCallback(() => {
        pausePlayback();
        setCurrentFrameIndex(prev => Math.min(prev + 1, totalFrames - 1));
    }, [pausePlayback, totalFrames]);

    const handlePrevFrame = useCallback(() => {
        pausePlayback();
        setCurrentFrameIndex(prev => Math.max(prev - 1, 0));
    }, [pausePlayback]);

    // --- DATA LOADING ---
    useEffect(() => {
        const loadAllData = async () => {
            if (isFetchingDataRef.current) return;
            isFetchingDataRef.current = true;
            setLoading(true);
            setError(null);
            try {
                const meta = await getVideoMetadata(videoId);
                setMetadata(meta);
                const allAnnotationsArray = await getAllVideoAnnotations(videoId);
                const annotationsMap: AnnotationData = {};
                allAnnotationsArray.forEach(ann => {
                    annotationsMap[ann.offset] = ann.svgPaths;
                });
                setAllSvgAnnotations(annotationsMap);
                setFrames(Array(meta.numFrames).fill(null));
                await fetchImageFramesInBatches(videoId, meta.numFrames);
                const summary = await getSummaryData(videoId);
                setSummaryData(summary);
                const params = await getParamData(videoId);
                setParamData(params);
                if (params.columns.length > 0) {
                    const defaultSelection = [];
                    if (params.columns.includes('ro')) defaultSelection.push('ro');
                    if (params.columns.includes('lo')) defaultSelection.push('lo');
                    if (defaultSelection.length === 0 && params.columns.length > 0) {
                        defaultSelection.push(params.columns[0]);
                    }
                    setSelectedParams(defaultSelection);
                }
            } catch (err: any) {
                setError(err.message || 'Could not load video data.');
            } finally {
                setLoading(false);
                isFetchingDataRef.current = false;
            }
        };
        if (videoId !== null) {
            loadAllData();
        }
        return () => {
            pausePlayback();
            isFetchingDataRef.current = false;
        };
    }, [videoId, fetchImageFramesInBatches, pausePlayback]);

    const chartData = useMemo<ChartData<'line'>>(() => {
        const labels = Array.from({ length: totalFrames }, (_, i) => (i + 1).toString());
        const datasets = selectedParams.map((paramName, index) => {
            const data = paramData?.data[paramName] || [];
            const colors = ['rgb(75, 192, 192)', 'rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 206, 86)', 'rgb(153, 102, 255)'];
            const borderColor = colors[index % colors.length];
            return {
                label: paramName,
                data: data,
                borderColor: borderColor,
                backgroundColor: borderColor.replace('rgb', 'rgba').replace(')', ', 0.2)'),
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.1,
            };
        });
        return { labels, datasets };
    }, [selectedParams, paramData, totalFrames]);

    const chartOptions = useMemo<ChartOptions<'line'>>(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' },
            tooltip: { mode: 'index', intersect: false },
        },
        scales: {
            x: {
                title: { display: true, text: 'Frame Number' },
                min: 0,
                max: totalFrames - 1,
                ticks: {
                    stepSize: Math.ceil(totalFrames / 10)
                }
            },
            y: { title: { display: true, text: 'Value' } },
        },
        onClick: (_, elements) => {
            if (elements.length > 0) {
                handleVideoSeek(elements[0].index);
            }
        },
        onHover: (event, chartElements) => {
            if (event.native?.target) {
                (event.native.target as HTMLElement).style.cursor = chartElements[0] ? 'pointer' : 'default';
            }
        },
    }), [handleVideoSeek, totalFrames]);

    const currentFrameLinePlugin = useMemo<Plugin<'line'>>(() => ({
        id: 'currentFrameLine',
        beforeDraw(chart) {
            if (currentFrameIndex === null || totalFrames === 0) return;
            const { ctx, chartArea: { top, bottom }, scales: { x } } = chart;
            const xCoord = x.getPixelForValue(currentFrameIndex);
            if (xCoord >= x.left && xCoord <= x.right) {
                ctx.save();
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
                ctx.lineWidth = 2;
                ctx.setLineDash([6, 6]);
                ctx.moveTo(xCoord, top);
                ctx.lineTo(xCoord, bottom);
                ctx.stroke();
                ctx.restore();
            }
        },
    }), [currentFrameIndex, totalFrames]);

    // --- LOADING STATE ---
    const areFramesMissing = frames.some(f => f === null) && totalFrames > 0;
    if (loading || areFramesMissing || !metadata || !summaryData || !paramData) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-700">Loading Video Analysis...</h2>
                    <p className="text-gray-500 mt-2">Preparing frames and data for Video ID: {videoId}</p>
                    {totalFrames > 0 && <progress className="w-64 mt-4" value={frames.filter(Boolean).length} max={totalFrames} />}
                    {error && <p className="mt-4 text-red-500 font-bold">Error: {error}</p>}
                </div>
            </div>
        );
    }

    // --- RENDER ---
    const currentFrameSrc = frames[currentFrameIndex];
    const currentSvgPaths = allSvgAnnotations[currentFrameIndex] || '';

    return (
        <div className="font-sans bg-gray-50 h-screen flex flex-col p-4 gap-4">
            <header>
                <h1 className="text-3xl font-extrabold text-gray-800 text-center">
                    Video Analysis: <span className="text-blue-600">{videoId}</span>
                </h1>
            </header>

            <main className="flex-1 grid grid-cols-1 lg:grid-cols-[70%_30%] gap-4 min-h-0">
                {/* Left Column (70%) */}
                <div className="flex flex-col gap-4">
                    {/* Video Player */}
                    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col min-h-2/3">
                        <div className="relative flex-1 w-full bg-black rounded-md flex items-center justify-center text-white">
                            {currentFrameSrc ? (
                                <>
                                    <img
                                        src={currentFrameSrc}
                                        alt={`Frame ${currentFrameIndex}`}
                                        className="absolute top-0 left-0 w-full h-full object-contain"
                                    />
                                    {currentSvgPaths && (
                                        <svg
                                            viewBox={`0 0 ${metadata.width} ${metadata.height}`}
                                            className="absolute top-0 left-0 w-full h-full"
                                        >
                                            <g stroke="lime" strokeWidth="2" fill="none" dangerouslySetInnerHTML={{ __html: currentSvgPaths }} />
                                        </svg>
                                    )}
                                </>
                            ) : (
                                <p>Loading frame...</p>
                            )}
                        </div>
                        <div className="pt-4 space-y-3">
                            <input
                                type="range"
                                min="0"
                                max={totalFrames > 0 ? totalFrames - 1 : 0}
                                value={currentFrameIndex}
                                onChange={(e) => handleVideoSeek(parseInt(e.target.value, 10))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                style={{
                                    backgroundSize: `${(currentFrameIndex * 100) / (totalFrames - 1)}% 100%`
                                }}
                            />
                            <div className="flex justify-between items-center text-sm text-gray-700">
                                <span className="font-mono">Frame: {currentFrameIndex + 1} / {totalFrames}</span>
                                <span className="font-mono">Time: {(currentFrameIndex / (metadata?.fps || 30)).toFixed(2)}s</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-700">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handlePrevFrame}
                                        disabled={currentFrameIndex === 0}
                                        className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="Previous Frame"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <button
                                        onClick={togglePlayPause}
                                        className="p-2 rounded-full hover:bg-gray-200"
                                        aria-label={timerRef.current ? 'Pause' : 'Play'}
                                    >
                                        {timerRef.current ? (
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                        ) : (
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.118v3.764a1 1 0 001.555.832l3.197-1.882a1 1 0 000-1.664l-3.197-1.882z" clipRule="evenodd" /></svg>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleNextFrame}
                                        disabled={currentFrameIndex >= totalFrames - 1}
                                        className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="Next Frame"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Graph */}
                    <div className="flex-1 bg-white rounded-lg shadow-md p-4 flex flex-col min-h-0">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Eyelid Parameter Trends</h2>
                        <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                            {paramData.columns.map(paramName => (
                                <label key={paramName} className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-blue-600"
                                        checked={selectedParams.includes(paramName)}
                                        onChange={() => handleParamSelection(paramName)}
                                    />
                                    <span className="ml-1.5 text-gray-700">{paramName}</span>
                                </label>
                            ))}
                        </div>
                        <div className="relative flex-1 w-full">
                            {selectedParams.length > 0 ? (
                                <Line data={chartData} options={chartOptions} plugins={[currentFrameLinePlugin]} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">Select parameters to view graph.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column (30%) - Summary Table */}
                <div className="bg-white rounded-lg shadow-md p-4 flex flex-col min-h-0">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Blink Analysis Summary</h2>
                    <div className="flex-1 overflow-y-auto space-y-4">
                        {/* Blink Count Section */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <h3 className="font-semibold text-black mb-2">Blink Count</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <SummaryCard
                                    title="[R] Blinks"
                                    value={summaryData.data.r_n_blinks?.[0]}
                                    unit=""
                                    color="green"
                                />
                                <SummaryCard
                                    title="[L] Blinks"
                                    value={summaryData.data.l_n_blinks?.[0]}
                                    unit=""
                                    color="blue"
                                />
                                <SummaryCard
                                    title="[R] Incomplete Blinks"
                                    value={summaryData.data.r_n_incomplete_blinks?.[0]}
                                    unit=""
                                    color="green"
                                />
                                <SummaryCard
                                    title="[L] Incomplete Blinks"
                                    value={summaryData.data.l_n_incomplete_blinks?.[0]}
                                    unit=""
                                    color="blue"
                                />
                            </div>
                        </div>

                        {/* Amplitude Section */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <h3 className="font-semibold text-black mb-2">Amplitude</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <SummaryCard
                                    title="[R] Max Amplitude"
                                    value={summaryData.data.r_blink_max_amp?.[0]}
                                    unit="mm"
                                    color="green"
                                    precision={2}
                                />
                                <SummaryCard
                                    title="[L] Max Amplitude"
                                    value={summaryData.data.l_blink_max_amp?.[0]}
                                    unit="mm"
                                    color="blue"
                                    precision={2}
                                />
                            </div>
                        </div>

                        {/* Velocity Section */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <h3 className="font-semibold text-black mb-2">Velocity (mm/sec)</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <SummaryCard
                                    title="[R] Closing Peak"
                                    value={summaryData.data.r_close_peak_vel_mean?.[0]}
                                    unit=""
                                    color="green"
                                    precision={1}
                                />
                                <SummaryCard
                                    title="[L] Closing Peak"
                                    value={summaryData.data.l_close_peak_vel_mean?.[0]}
                                    unit=""
                                    color="blue"
                                    precision={1}
                                />
                                <SummaryCard
                                    title="[R] Start-Opening"
                                    value={summaryData.data.r_early_open_peak_vel_mean?.[0]}
                                    unit=""
                                    color="green"
                                    precision={1}
                                />
                                <SummaryCard
                                    title="[L] Start-Opening"
                                    value={summaryData.data.l_early_open_peak_vel_mean?.[0]}
                                    unit=""
                                    color="blue"
                                    precision={1}
                                />
                                <SummaryCard
                                    title="[R] End-Opening"
                                    value={summaryData.data.r_late_open_peak_vel_mean?.[0]}
                                    unit=""
                                    color="green"
                                    precision={1}
                                />
                                <SummaryCard
                                    title="[L] End-Opening"
                                    value={summaryData.data.l_late_open_peak_vel_mean?.[0]}
                                    unit=""
                                    color="blue"
                                    precision={1}
                                />
                                <SummaryCard
                                    title="[R] Max Velocity"
                                    value={summaryData.data.r_max_vel_mean?.[0]}
                                    unit=""
                                    color="green"
                                    precision={1}
                                />
                                <SummaryCard
                                    title="[L] Max Velocity"
                                    value={summaryData.data.l_max_vel_mean?.[0]}
                                    unit=""
                                    color="blue"
                                    precision={1}
                                />
                            </div>
                        </div>

                        {/* Lagophthalmos Section */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <h3 className="font-semibold text-black mb-2">Closed-eye Coverage (mm²)</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <SummaryCard
                                    title="[R] Min Coverage"
                                    value={summaryData.data.r_lagopthalmos_min_mm?.[0]}
                                    unit=""
                                    color="green"
                                    precision={2}
                                />
                                <SummaryCard
                                    title="[L] Min Coverage"
                                    value={summaryData.data.l_lagopthalmos_min_mm?.[0]}
                                    unit=""
                                    color="blue"
                                    precision={2}
                                />
                                <SummaryCard
                                    title="[R] Max Coverage"
                                    value={summaryData.data.r_lagopthalmos_max_mm?.[0]}
                                    unit=""
                                    color="green"
                                    precision={2}
                                />
                                <SummaryCard
                                    title="[L] Max Coverage"
                                    value={summaryData.data.l_lagopthalmos_max_mm?.[0]}
                                    unit=""
                                    color="blue"
                                    precision={2}
                                />
                                <SummaryCard
                                    title="[R] Mean Coverage"
                                    value={summaryData.data.r_lagopthalmos_mean_mm?.[0]}
                                    unit=""
                                    color="green"
                                    precision={2}
                                />
                                <SummaryCard
                                    title="[L] Mean Coverage"
                                    value={summaryData.data.l_lagopthalmos_mean_mm?.[0]}
                                    unit=""
                                    color="blue"
                                    precision={2}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}