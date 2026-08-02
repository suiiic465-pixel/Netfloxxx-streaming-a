import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  collection,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL
} from 'firebase/storage';
import { auth, db, storage } from './firebase';
import { MediaItem } from '../types';

/**
 * Upload a file (Video or Thumbnail Image) to Firebase Storage with real-time progress callbacks.
 * Returns the public download URL upon completion.
 */
export async function uploadFileToStorage(
  file: File,
  folderPath: string,
  onProgress?: (progressPercent: number) => void
): Promise<string> {
  const sanitizeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueStoragePath = `${folderPath}/${Date.now()}_${sanitizeFileName}`;
  const storageRef = ref(storage, uniqueStoragePath);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) {
          onProgress(percent);
        }
      },
      (error) => {
        console.error('Firebase Storage upload error:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

/**
 * Save a new title metadata record to Firestore collection 'titles'.
 */
export async function createTitleInFirestore(titleData: Omit<MediaItem, 'id'>) {
  const titlesCollection = collection(db, 'titles');
  const docRef = await addDoc(titlesCollection, {
    ...titleData,
    createdAt: serverTimestamp(),
    uploadedAt: new Date().toISOString()
  });
  return docRef.id;
}

/**
 * Update an existing title record in Firestore.
 */
export async function updateTitleInFirestore(id: string, updatedData: Partial<MediaItem>) {
  const titleDocRef = doc(db, 'titles', id);
  await updateDoc(titleDocRef, {
    ...updatedData,
    updatedAt: serverTimestamp()
  });
}

/**
 * Delete a title record from Firestore.
 */
export async function deleteTitleFromFirestore(id: string) {
  const titleDocRef = doc(db, 'titles', id);
  await deleteDoc(titleDocRef);
}

/**
 * Listen in real-time to the 'titles' collection in Firestore.
 * Invokes callback whenever documents are added, updated, or removed.
 */
export function subscribeToTitles(onData: (items: MediaItem[]) => void) {
  const titlesCollection = collection(db, 'titles');
  const q = query(titlesCollection);

  return onSnapshot(
    q,
    (snapshot) => {
      const items: MediaItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const genresList = data.genres || (data.genre ? [data.genre] : ['Action']);
        return {
          id: docSnap.id,
          title: data.title || 'Untitled',
          type: data.type === 'series' ? 'series' : 'movie',
          year: data.year || new Date().getFullYear(),
          duration: data.duration || '1h 45m',
          rating: data.rating || '98% Match',
          ageRating: (data.ageRating || data.rating || 'TV-MA') as any,
          resolution: data.resolution || '4K Ultra HD',
          genres: genresList,
          description: data.description || '',
          tagline: data.tagline || '',
          backdropUrl: data.backdropUrl || data.posterUrl || '',
          posterUrl: data.posterUrl || '',
          trailerVideoUrl: data.trailerVideoUrl || '',
          cast: data.cast || ['Watch PY Originals'],
          isTrending: data.isTrending ?? true,
          isNewRelease: data.isNewRelease ?? true,
        };
      });
      onData(items);
    },
    (error) => {
      console.warn('Firestore subscription notice (titles collection):', error);
      onData([]);
    }
  );
}

/**
 * Authentication Helpers for Watch PY Admin Panel
 */
export async function loginAdminUser(email: string, pass: string) {
  return await signInWithEmailAndPassword(auth, email, pass);
}

export async function createAdminUser(email: string, pass: string) {
  return await createUserWithEmailAndPassword(auth, email, pass);
}

export async function loginAnonymousAdminUser() {
  return await signInAnonymously(auth);
}

export async function logoutAdminUser() {
  return await signOut(auth);
}

export function subscribeToAuthState(onUserChanged: (user: User | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    onUserChanged(user);
  });
}

export interface FirestoreUserRecord {
  uid: string;
  email: string;
  createdAt: string;
  status: 'Active' | 'Suspended';
  avatar?: string;
  displayName?: string;
}

/**
  * Save/update a user record in the Firestore 'users' collection with doc ID = user UID.
  */
export async function saveUserToFirestore(uid: string, email: string) {
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      uid,
      email,
      createdAt: new Date().toISOString(),
      createdAtTimestamp: serverTimestamp(),
      status: 'Active'
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore write user record notice:', err);
  }
}

/**
  * Update user avatar and display name in Firestore user document.
  */
export async function updateUserAvatarInFirestore(uid: string, avatarUrl: string, displayName?: string) {
  try {
    const userDocRef = doc(db, 'users', uid);
    const updateData: any = { avatar: avatarUrl, updatedAt: new Date().toISOString() };
    if (displayName) updateData.displayName = displayName;
    await setDoc(userDocRef, updateData, { merge: true });
  } catch (err) {
    console.warn('Firestore update avatar notice:', err);
    throw err;
  }
}

/**
  * Save downloaded title IDs to Firestore under user document.
  */
export async function saveUserDownloadsToFirestore(uid: string, downloadIds: string[]) {
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      downloads: downloadIds,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore update downloads notice:', err);
  }
}

/**
  * Subscribe to a specific user's Firestore document.
  */
export function subscribeToUserProfileDoc(uid: string, onUpdate: (data: any) => void) {
  const userDocRef = doc(db, 'users', uid);
  return onSnapshot(
    userDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data());
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.warn('User profile doc subscription notice:', err);
      onUpdate(null);
    }
  );
}

/**
  * Register a new user with Email/Password and store in Firestore 'users' collection.
  */
export async function registerUserWithEmail(email: string, pass: string) {
  const userCred = await createUserWithEmailAndPassword(auth, email, pass);
  if (userCred.user) {
    await saveUserToFirestore(userCred.user.uid, userCred.user.email || email);
  }
  return userCred;
}

/**
  * Log in user with Email and Password.
  */
export async function loginUserWithEmail(email: string, pass: string) {
  return await signInWithEmailAndPassword(auth, email, pass);
}

/**
  * Subscribe to real-time updates from 'users' collection in Firestore.
  */
export function subscribeToRegisteredUsers(onUsersChanged: (users: FirestoreUserRecord[]) => void) {
  const usersColl = collection(db, 'users');
  const q = query(usersColl);

  return onSnapshot(
    q,
    (snapshot) => {
      const userList: FirestoreUserRecord[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          uid: data.uid || d.id,
          email: data.email || 'user@watchpy.com',
          createdAt: data.createdAt || new Date().toISOString(),
          status: data.status || 'Active'
        };
      });

      // Sort by newest created
      userList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      onUsersChanged(userList);
    },
    (error) => {
      console.warn('Firestore users subscription notice:', error);
      onUsersChanged([]);
    }
  );
}

/**
 * Check whether a user has Admin permissions in Firestore or environment config.
 */
export async function checkIsAdminUser(user: any): Promise<boolean> {
  if (!user) return false;

  // 1. Check environment variable VITE_ADMIN_UID
  const adminUidEnv = (import.meta as any).env?.VITE_ADMIN_UID;
  if (adminUidEnv && user.uid === adminUidEnv) {
    return true;
  }

  try {
    // 2. Check if user document exists in 'admins' collection
    const adminDocRef = doc(db, 'admins', user.uid);
    const adminSnap = await getDoc(adminDocRef);
    if (adminSnap.exists()) {
      return true;
    }

    // 3. Check if user document in 'users' collection has role == 'admin' or isAdmin == true
    const userDocRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      if (data?.role === 'admin' || data?.isAdmin === true) {
        return true;
      }
    }
  } catch (err) {
    console.warn('Error verifying admin permissions in Firestore:', err);
  }

  return false;
}

/**
 * Record new Admin account in 'admins' and 'users' Firestore collections.
 */
export async function promoteUserToAdmin(uid: string, email: string) {
  try {
    const adminDocRef = doc(db, 'admins', uid);
    await setDoc(adminDocRef, {
      uid,
      email,
      role: 'admin',
      createdAt: new Date().toISOString(),
      createdAtTimestamp: serverTimestamp()
    }, { merge: true });

    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      uid,
      email,
      role: 'admin',
      isAdmin: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Error registering admin record:', err);
  }
}
