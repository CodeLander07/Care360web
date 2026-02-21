"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { extractLumaFromFrame } from "@/lib/rppg/signal-processor";
import type { RppgHealthReport } from "@/lib/rppg/types";

const CAPTURE_DURATION_MS = 30_000;
const TARGET_FPS = 30;
const TARGET_WIDTH = 360;
const TARGET_HEIGHT = 240;
const MOTION_THRESHOLD = 15;

export function CameraCapture({
  onComplete,
  onStateChange,
}: {
  onComplete: (report: RppgHealthReport, processedSignal: number[]) => void;
  onStateChange?: (phase: string, message?: string, signalStrength?: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "capturing" | "processing" | "complete">("idle");
  const [progress, setProgress] = useState(0);
  const [signalStrength, setSignalStrength] = useState(0);
  const [motionDetected, setMotionDetected] = useState(false);
  const lumaBufferRef = useRef<number[]>([]);
  const lastLumaRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const workerRef = useRef<Worker | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  }, []);

  const startCapture = useCallback(async () => {
    setError(null);
    setPhase("capturing");
    onStateChange?.("capturing", "Starting camera...");
    lumaBufferRef.current = [];
    lastLumaRef.current = 0;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: TARGET_WIDTH },
          height: { ideal: TARGET_HEIGHT },
          frameRate: { ideal: TARGET_FPS },
          facingMode: "user",
        },
        audio: false,
      });
      streamRef.current = stream;
      setHasPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      startTimeRef.current = Date.now();
      const processFrame = () => {
        if (!video.videoWidth || !video.videoHeight) {
          animationRef.current = requestAnimationFrame(processFrame);
          return;
        }
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const luma = extractLumaFromFrame(
          imageData.data,
          canvas.width,
          canvas.height
        );
        lumaBufferRef.current.push(luma);

        const delta = Math.abs(luma - lastLumaRef.current);
        lastLumaRef.current = luma;
        if (delta > MOTION_THRESHOLD && lumaBufferRef.current.length > 10) {
          setMotionDetected(true);
          onStateChange?.("capturing", "Too much motion. Hold still.", 0);
        } else {
          setMotionDetected(false);
        }

        const strength = Math.min(1, delta * 2);
        setSignalStrength(strength);
        onStateChange?.("capturing", undefined, strength);

        const elapsed = Date.now() - startTimeRef.current;
        const pct = Math.min(100, (elapsed / CAPTURE_DURATION_MS) * 100);
        setProgress(pct);

        if (elapsed >= CAPTURE_DURATION_MS) {
          stopStream();
          setPhase("processing");
          onStateChange?.("processing", "Analyzing signal...");

          const worker = new Worker("/rppg-worker.js");
          workerRef.current = worker;
          worker.postMessage({
            lumaSeries: lumaBufferRef.current,
            fps: Math.min(TARGET_FPS, lumaBufferRef.current.length / (elapsed / 1000)),
          });
          worker.onmessage = (ev) => {
            if (ev.data?.type === "result") {
              worker.terminate();
              workerRef.current = null;
              onComplete(ev.data.report, ev.data.report.processedSignal || []);
              setPhase("complete");
              onStateChange?.("complete");
            }
          };
          worker.onerror = () => {
            setError("Processing failed");
            setPhase("idle");
            onStateChange?.("error", "Processing failed");
          };
          return;
        }
        animationRef.current = requestAnimationFrame(processFrame);
      };
      animationRef.current = requestAnimationFrame(processFrame);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Camera access denied");
      setPhase("idle");
      onStateChange?.("error", "Camera access denied");
    }
  }, [onComplete, onStateChange, stopStream]);

  useEffect(() => {
    return () => {
      stopStream();
      workerRef.current?.terminate();
    };
  }, [stopStream]);

  return (
    <div className="space-y-6">
      <div className="relative aspect-video max-w-md overflow-hidden rounded-2xl border border-white/10 bg-black">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          playsInline
          muted
          style={{ display: phase === "capturing" ? "block" : "none" }}
        />
        <canvas ref={canvasRef} className="hidden" />
        {phase === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-8 w-8 text-teal"
              >
                <path d="M15 10h4.553a2 2 0 0 1 1.789 2.894l-3.5 7A2 2 0 0 1 17.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 0 0-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h2.5" />
              </svg>
            </div>
            <p className="text-sm text-text-secondary">
              Place your fingertip over the camera lens. Cover the flashlight if available. Hold still for 30 seconds.
            </p>
          </div>
        )}
        {phase === "capturing" && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3">
            <div className="mb-2 flex items-center justify-between text-xs text-white">
              <span>Signal: {Math.round(signalStrength * 100)}%</span>
              {motionDetected && (
                <span className="text-amber-400">Hold still</span>
              )}
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full bg-teal transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        {phase === "processing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal border-t-transparent" />
            <p className="text-sm text-text-secondary">Analyzing heart rate...</p>
          </div>
        )}
      </div>
      {error && (
        <p className="text-center text-sm text-error">{error}</p>
      )}
      {phase === "idle" && (
        <button
          type="button"
          onClick={startCapture}
          className="w-full rounded-full bg-teal py-3.5 text-sm font-medium text-white transition-colors hover:bg-teal/90"
        >
          Start measurement
        </button>
      )}
      <p className="text-center text-xs text-text-muted">
        This is not a medical device. For informational use only.
      </p>
    </div>
  );
}
