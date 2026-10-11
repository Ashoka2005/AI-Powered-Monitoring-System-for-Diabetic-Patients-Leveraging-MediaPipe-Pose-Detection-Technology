/**
 * DiaFit AI - Camera Utilities & Cross-Browser Polyfills
 * Ensures robust camera streaming across desktop, Android, iOS Safari, and PWA environments.
 */

// 1. Ensure navigator.mediaDevices and getUserMedia exist everywhere
if (typeof window !== 'undefined') {
  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {};
  }

  if (!navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia = function (constraints) {
      const legacyGetUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

      if (legacyGetUserMedia) {
        return new Promise((resolve, reject) => {
          legacyGetUserMedia.call(navigator, constraints, resolve, reject);
        });
      }

      // Check if browser is blocking due to insecure HTTP context (LAN IP over HTTP)
      const isLocalhost =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

      if (!window.isSecureContext && !isLocalhost) {
        return Promise.reject(
          new Error(
            `InsecureContext: Browser blocks camera on unencrypted HTTP (${window.location.origin}). Please access via HTTPS or localhost.`
          )
        );
      }

      return Promise.reject(
        new Error(
          'MediaDevicesUnavailable: Your browser or device does not support camera capture.'
        )
      );
    };
  }
}

/**
 * Robust Camera Controller for MediaPipe Pose Detection
 * Replaces MediaPipe's brittle Camera class with fallback-tolerant stream acquisition.
 */
export class RobustCamera {
  constructor(videoElement, options = {}) {
    this.video = videoElement;
    this.onFrame = options.onFrame || (async () => {});
    this.facingMode = options.facingMode || 'user';
    this.idealWidth = options.width || 640;
    this.idealHeight = options.height || 480;
    
    this.stream = null;
    this.isRunning = false;
    this.animationFrameId = null;
    this.lastFrameTime = -1;
  }

  async start() {
    if (!this.video) {
      throw new Error('Video element not found for camera attachment.');
    }

    // iOS Safari requirement: video must have playsInline and muted attributes
    this.video.setAttribute('playsinline', 'true');
    this.video.setAttribute('webkit-playsinline', 'true');
    this.video.muted = true;

    // Constraint attempt 1: user-specified facingMode and dimensions
    const primaryConstraints = {
      audio: false,
      video: {
        facingMode: this.facingMode,
        width: { ideal: this.idealWidth },
        height: { ideal: this.idealHeight },
      },
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(primaryConstraints);
    } catch (err1) {
      console.warn('Primary camera constraints failed, attempting fallback...', err1);
      try {
        // Constraint attempt 2: facingMode only
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: this.facingMode },
        });
      } catch (err2) {
        console.warn('FacingMode camera constraints failed, attempting basic video...', err2);
        // Constraint attempt 3: generic video fallback
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: true,
        });
      }
    }

    this.video.srcObject = this.stream;

    // Wait for video metadata to load and start playback
    await new Promise((resolve) => {
      if (this.video.readyState >= 2) {
        resolve();
      } else {
        this.video.onloadedmetadata = () => resolve();
      }
    });

    try {
      await this.video.play();
    } catch (playErr) {
      console.warn('Auto-play blocked, retrying muted...', playErr);
      this.video.muted = true;
      await this.video.play();
    }

    this.isRunning = true;

    // Frame processing loop for MediaPipe Pose
    const processLoop = async () => {
      if (!this.isRunning) return;

      if (!this.video.paused && !this.video.ended && this.video.currentTime !== this.lastFrameTime) {
        this.lastFrameTime = this.video.currentTime;
        try {
          await this.onFrame();
        } catch (frameErr) {
          console.error('Frame pose detection error:', frameErr);
        }
      }

      if (this.isRunning) {
        this.animationFrameId = requestAnimationFrame(processLoop);
      }
    };

    this.animationFrameId = requestAnimationFrame(processLoop);
    return this;
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
    }
  }
}
