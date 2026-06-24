import { useCallback, useEffect, useRef, useState } from 'react';
import { FilesetResolver, PoseLandmarker, type PoseLandmarkerResult } from '@mediapipe/tasks-vision';

/**
 * Loads a MediaPipe PoseLandmarker that runs fully ON-DEVICE in the browser
 * (WASM + GPU/CPU). The WASM runtime and the model are fetched from public
 * CDNs once; raw webcam frames never leave the device.
 */

// Pin the WASM CDN to the installed @mediapipe/tasks-vision version.
const WASM_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';
// "lite" model: smallest/fastest, good enough for posture coaching.
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

export type PoseStatus = 'loading' | 'ready' | 'error';

export function usePoseLandmarker() {
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const [status, setStatus] = useState<PoseStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_CDN);
        // Try GPU first; fall back to CPU if the GPU delegate is unavailable.
        let lm: PoseLandmarker;
        try {
          lm = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
            runningMode: 'VIDEO',
            numPoses: 1,
          });
        } catch {
          lm = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' },
            runningMode: 'VIDEO',
            numPoses: 1,
          });
        }
        if (cancelled) {
          lm.close();
          return;
        }
        landmarkerRef.current = lm;
        setStatus('ready');
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load the posture model.');
          setStatus('error');
        }
      }
    };

    init();
    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, []);

  /** Run detection on the current video frame. `timestampMs` must be monotonically increasing. */
  const detect = useCallback((video: HTMLVideoElement, timestampMs: number): PoseLandmarkerResult | null => {
    if (!landmarkerRef.current) return null;
    try {
      return landmarkerRef.current.detectForVideo(video, timestampMs);
    } catch {
      return null;
    }
  }, []);

  return { status, error, detect };
}
