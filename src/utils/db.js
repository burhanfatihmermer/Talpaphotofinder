// Simple client-side IndexedDB wrapper for storing event photos and computed face descriptors
const DB_NAME = 'SpotlightEventPhotoDB';
const DB_VERSION = 1;
const PHOTO_STORE = 'photos';

export function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(PHOTO_STORE)) {
        db.createObjectStore(PHOTO_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Add a photo to the database
export async function addPhoto(photo) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PHOTO_STORE], 'readwrite');
    const store = transaction.objectStore(PHOTO_STORE);
    const request = store.add(photo);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Get all photos from the database
export async function getAllPhotos() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PHOTO_STORE], 'readonly');
    const store = transaction.objectStore(PHOTO_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Clear all photos from the database
export async function clearAllPhotos() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PHOTO_STORE], 'readwrite');
    const store = transaction.objectStore(PHOTO_STORE);
    const request = store.clear();

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Delete a single photo by ID
export async function deletePhoto(id) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PHOTO_STORE], 'readwrite');
    const store = transaction.objectStore(PHOTO_STORE);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}
