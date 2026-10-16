'use client';
import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, RefreshCw, AlertCircle, CheckCircle2, Volume2, Sparkles } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export default function CameraScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [error, setError] = useState('');
  const [scannedResult, setScannedResult] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const containerId = 'interactive-camera-scanner';

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880; // A5 note beep
      gain.gain.value = 0.15;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.14);
    } catch (e) {
      console.warn('Audio Context not available', e);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    let html5QrCode = null;
    let isStopped = false;

    const startScanner = async () => {
      setError('');
      setScannedResult('');
      setIsScanning(true);

      try {
        html5QrCode = new Html5Qrcode(containerId);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const edge = Math.floor(minEdge * 0.7);
            return { width: edge, height: edge };
          },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (isStopped) return;
            isStopped = true;

            playBeep();
            setScannedResult(decodedText);

            // If JSON reader card, extract code or email
            let cleanValue = decodedText;
            try {
              const parsed = JSON.parse(decodedText);
              if (parsed.code) cleanValue = parsed.code;
              else if (parsed.email) cleanValue = parsed.email;
            } catch {
              // Plain text or standard barcode
            }

            setTimeout(() => {
              if (onScanSuccess) {
                onScanSuccess(cleanValue);
              }
              handleClose();
            }, 900);
          },
          () => {
            // Frame scan without match - silently continue
          }
        );
      } catch (err) {
        console.error('Camera Scanner Error:', err);
        setError(
          'Không thể khởi động camera. Vui lòng kiểm tra quyền truy cập webcam trên trình duyệt hoặc sử dụng thiết bị có camera.'
        );
        setIsScanning(false);
      }
    };

    // Small delay to ensure modal DOM is mounted
    const timer = setTimeout(() => {
      startScanner();
    }, 250);

    return () => {
      clearTimeout(timer);
      isStopped = true;
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => html5QrCode.clear()).catch((e) => console.warn(e));
      }
    };
  }, [isOpen]);

  const handleClose = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        console.warn(e);
      }
    }
    setIsScanning(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay z-50">
      <div className="glass-panel w-full max-w-md p-6 relative border-teal-200/80 shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-xs font-bold mb-2">
            <Camera className="w-3.5 h-3.5 text-teal-600" /> QUÉT MÃ QUANG HỌC THỜI GIAN THỰC
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Quét Mã Barcode & QR</h2>
          <p className="text-xs text-slate-500">Đưa mã vạch sách hoặc mã QR thẻ độc giả vào trước camera</p>
        </div>

        {/* Scanner Viewport */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 aspect-square flex items-center justify-center border-2 border-slate-200 shadow-inner">
          <div id={containerId} className="w-full h-full"></div>

          {/* Scanner Laser & Guide Overlay */}
          {isScanning && !scannedResult && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              {/* Corner brackets */}
              <div className="w-52 h-52 border-2 border-dashed border-teal-400/80 rounded-2xl relative shadow-lg">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-teal-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-teal-400 rounded-br-lg" />

                {/* Animated Red Laser Scan Line */}
                <div className="absolute inset-x-0 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse top-1/2 -translate-y-1/2" />
              </div>
              <span className="mt-4 text-xs font-semibold text-slate-300 bg-slate-900/80 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                Đang nhận diện mã vạch & QR...
              </span>
            </div>
          )}

          {/* Success Overlay */}
          {scannedResult && (
            <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center text-white">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-2 animate-bounce" />
              <div className="text-base font-black text-white">Đã Quét Thành Công!</div>
              <div className="text-xs font-mono bg-black/40 px-3 py-1.5 rounded-lg border border-emerald-400/30 mt-2 max-w-full break-all text-emerald-200">
                {scannedResult}
              </div>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-700 font-medium">
            <Volume2 className="w-4 h-4 text-teal-600" /> Tự động phát âm thanh khi quét trúng mã
          </span>
          <button
            onClick={handleClose}
            className="btn-secondary py-1 px-3 text-xs"
          >
            Đóng Camera
          </button>
        </div>
      </div>
    </div>
  );
}
