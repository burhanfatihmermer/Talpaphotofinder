import { useState, useEffect, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';

// Local path where the model weights are stored (copied from node_modules)
const MODEL_URL = '/models/';

// Module-level variables to ensure models are only loaded once globally
let modelsLoadedPromise = null;
let globalFaceApi = faceapi;

// Helper to rotate an image using canvas
const rotateImage = (imgElement, degrees) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const angle = (degrees * Math.PI) / 180;
    const is90or270 = degrees === 90 || degrees === 270;
    
    const w = imgElement.naturalWidth || imgElement.width || 640;
    const h = imgElement.naturalHeight || imgElement.height || 480;
    
    canvas.width = is90or270 ? h : w;
    canvas.height = is90or270 ? w : h;
    
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle);
    ctx.drawImage(imgElement, -w / 2, -h / 2);
    
    const rotatedImg = new Image();
    rotatedImg.onload = () => resolve(rotatedImg);
    rotatedImg.src = canvas.toDataURL('image/jpeg', 0.9);
  });
};

export function useFaceApi() {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  const loadModels = useCallback(async () => {
    if (modelsLoadedPromise) {
      setLoading(true);
      try {
        await modelsLoadedPromise;
        setReady(true);
        setLoading(false);
        return;
      } catch (err) {
        setError(err.message);
        setLoading(false);
        throw err;
      }
    }

    setLoading(true);
    setError(null);

    modelsLoadedPromise = (async () => {
      try {
        // Load SSD Mobilenet V1 (most accurate detector for event photos)
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        
        // Load facial landmark detector
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        
        // Load face recognition model (generates 128-d descriptor vectors)
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        
        console.log('face-api.js: Models loaded successfully from local public folder');
      } catch (err) {
        console.error('Error loading face-api models:', err);
        modelsLoadedPromise = null; // Allow retry on failure
        throw new Error('Yapay zeka modelleri yüklenirken hata oluştu: ' + err.message);
      }
    })();

    try {
      await modelsLoadedPromise;
      setReady(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load models on hook mount
  useEffect(() => {
    loadModels().catch(() => {});
  }, [loadModels]);

  /**
   * Process an image (URL or HTMLImageElement) and extract face descriptors and bounding boxes.
   * @param {string|HTMLImageElement|HTMLCanvasElement} imageSource - The source image
   * @param {object} options - Configuration options like autoRotate
   * @returns {Promise<Array|object>}
   */
  const extractFaces = useCallback(async (imageSource, options = {}) => {
    const { autoRotate = false } = options;
    if (!ready) {
      throw new Error('Modeller henüz yüklenmedi.');
    }

    let imgElement;
    let isTempImage = false;

    try {
      // If it's a base64 string or URL, create an Image element
      if (typeof imageSource === 'string') {
        imgElement = new Image();
        imgElement.crossOrigin = 'anonymous';
        imgElement.src = imageSource;
        isTempImage = true;
        
        await new Promise((resolve, reject) => {
          imgElement.onload = resolve;
          imgElement.onerror = () => reject(new Error('Görüntü yüklenemedi.'));
        });
      } else {
        imgElement = imageSource;
      }

      // Detect all faces, find landmarks, and extract descriptors
      let detections = await faceapi
        .detectAllFaces(imgElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptors();

      let rotatedDataUrl = null;

      // If autoRotate is true and no faces are detected, try rotating the image
      if (detections.length === 0 && autoRotate && isTempImage) {
        console.log("No face detected in original orientation. Trying rotated orientations...");
        const rotations = [90, 270, 180]; // Try 90 and 270 first (common orientation issues)
        for (const degrees of rotations) {
          try {
            const rotatedImg = await rotateImage(imgElement, degrees);
            const rotatedDetections = await faceapi
              .detectAllFaces(rotatedImg, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
              .withFaceLandmarks()
              .withFaceDescriptors();

            if (rotatedDetections.length > 0) {
              console.log(`Face detected successfully after rotating ${degrees} degrees!`);
              detections = rotatedDetections;
              rotatedDataUrl = rotatedImg.src;
              break;
            }
          } catch (err) {
            console.error(`Failed to process rotation by ${degrees} degrees:`, err);
          }
        }
      }

      const formatted = detections.map((det) => ({
        descriptor: Array.from(det.descriptor),
        box: {
          x: det.detection.box.x,
          y: det.detection.box.y,
          width: det.detection.box.width,
          height: det.detection.box.height,
        },
      }));

      if (autoRotate) {
        return { faces: formatted, rotatedDataUrl };
      } else {
        return formatted;
      }
    } catch (err) {
      console.error('Face extraction failed:', err);
      throw err;
    } finally {
      // Clean up if we created a temporary image element
      if (isTempImage && imgElement) {
        imgElement.onload = null;
        imgElement.onerror = null;
      }
    }
  }, [ready]);

  /**
   * Compare a single search descriptor (from selfie) against a list of photo items.
   * Returns matching photos with confidence scores.
   * @param {Array<number>} targetDescriptor - Descriptor from selfie
   * @param {Array<object>} photos - Photo list from db
   * @param {number} threshold - Match threshold (default 0.6, lower is stricter)
   */
  const matchFaces = useCallback((targetDescriptor, photos, threshold = 0.6) => {
    if (!targetDescriptor) return [];

    const targetVec = new Float32Array(targetDescriptor);
    const matches = [];

    for (const photo of photos) {
      let bestDistance = 1.0;
      let matchedFaceBox = null;

      for (const face of photo.faces) {
        const faceVec = new Float32Array(face.descriptor);
        // face-api.js euclidean distance helper
        const distance = faceapi.euclideanDistance(targetVec, faceVec);
        
        if (distance < bestDistance) {
          bestDistance = distance;
          matchedFaceBox = face.box;
        }
      }

      // If the best match is within the threshold, we have a match
      if (bestDistance < threshold) {
        // Similarity score between 0% and 100%
        const score = Math.round((1 - bestDistance) * 100);
        matches.push({
          ...photo,
          matchScore: score,
          matchedBox: matchedFaceBox,
        });
      }
    }

    // Sort by match score descending (best matches first)
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }, []);

  return {
    loading,
    ready,
    error,
    extractFaces,
    matchFaces,
    faceapi: globalFaceApi,
  };
}
