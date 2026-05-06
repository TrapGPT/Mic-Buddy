'use client';

import * as React from 'react';

const STORAGE_KEY = 'micbuddy:input-device-id';

export type AudioInputOption = {
  deviceId: string;
  label: string;
};

function rmsToPercent(rms: number): number {
  const db = 20 * Math.log10(Math.max(rms, 1e-7));
  const t = (db + 55) / 45;
  return Math.min(100, Math.max(0, t * 100));
}

export function useMicMonitor() {
  const [level, setLevel] = React.useState(0);
  const [active, setActive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [inputs, setInputs] = React.useState<AudioInputOption[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = React.useState('');

  const selectedRef = React.useRef('');
  React.useEffect(() => {
    selectedRef.current = selectedDeviceId;
  }, [selectedDeviceId]);

  const activeRef = React.useRef(false);
  React.useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const streamRef = React.useRef<MediaStream | null>(null);
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const sourceRef = React.useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const rafRef = React.useRef<number>();

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setSelectedDeviceId(stored);
        selectedRef.current = stored;
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persistDeviceId = React.useCallback((id: string) => {
    try {
      if (id) localStorage.setItem(STORAGE_KEY, id);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const refreshInputs = React.useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      return;
    }
    try {
      const raw = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = raw
        .filter((d) => d.kind === 'audioinput')
        .map((d, index) => ({
          deviceId: d.deviceId,
          label: d.label?.trim() || `Microphone ${index + 1}`,
        }));
      setInputs(audioInputs);
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    void refreshInputs();
    const md = navigator.mediaDevices;
    if (!md?.addEventListener) return;
    const onDeviceChange = () => void refreshInputs();
    md.addEventListener('devicechange', onDeviceChange);
    return () => md.removeEventListener('devicechange', onDeviceChange);
  }, [refreshInputs]);

  React.useEffect(() => {
    if (!selectedDeviceId || inputs.length === 0) return;
    if (!inputs.some((i) => i.deviceId === selectedDeviceId)) {
      setSelectedDeviceId('');
      persistDeviceId('');
      selectedRef.current = '';
    }
  }, [inputs, selectedDeviceId, persistDeviceId]);

  const cleanupCapture = React.useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    }
    sourceRef.current?.disconnect();
    analyserRef.current?.disconnect();
    sourceRef.current = null;
    analyserRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void audioCtxRef.current?.close();
    audioCtxRef.current = null;
  }, []);

  const stop = React.useCallback(() => {
    cleanupCapture();
    setActive(false);
    setLevel(0);
  }, [cleanupCapture]);

  const beginCapture = React.useCallback(
    async (deviceId: string) => {
      setError(null);

      if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setError('Microphone access is not supported in this browser.');
        return;
      }

      cleanupCapture();

      try {
        const audioConstraints: MediaTrackConstraints = {
          echoCancellation: true,
          noiseSuppression: true,
        };
        if (deviceId) {
          audioConstraints.deviceId = { exact: deviceId };
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: audioConstraints,
        });

        streamRef.current = stream;

        const ctx = new AudioContext();
        audioCtxRef.current = ctx;

        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.82;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(stream);
        sourceRef.current = source;
        source.connect(analyser);

        const buffer = new Float32Array(analyser.fftSize);

        const loop = () => {
          analyser.getFloatTimeDomainData(buffer);
          let sum = 0;
          for (let i = 0; i < buffer.length; i++) {
            const s = buffer[i];
            sum += s * s;
          }
          const rms = Math.sqrt(sum / buffer.length);
          const pct = rmsToPercent(rms);
          setLevel((prev) => prev + (pct - prev) * 0.28);
          rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);
        setActive(true);
        await refreshInputs();
      } catch (e) {
        const message =
          e instanceof Error ? e.message : 'Could not access the microphone.';
        setError(message);
        cleanupCapture();
        setActive(false);
        setLevel(0);
      }
    },
    [cleanupCapture, refreshInputs]
  );

  const start = React.useCallback(async () => {
    await beginCapture(selectedRef.current);
  }, [beginCapture]);

  const selectDevice = React.useCallback(
    (deviceId: string) => {
      setSelectedDeviceId(deviceId);
      selectedRef.current = deviceId;
      persistDeviceId(deviceId);
      if (activeRef.current) {
        void beginCapture(deviceId);
      }
    },
    [beginCapture, persistDeviceId]
  );

  React.useEffect(() => () => stop(), [stop]);

  return {
    level,
    active,
    error,
    inputs,
    selectedDeviceId,
    selectDevice,
    start,
    stop,
    refreshInputs,
  };
}
