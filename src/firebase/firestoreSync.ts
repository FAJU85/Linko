import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from './config.ts';
import {
  CreatorProfile,
  LinkItem,
  MenuItem,
  TableOrder,
  DigitalProduct,
  ProductOrder,
  CanvasBlock,
} from '../types.ts';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path,
  };
  console.warn('Firestore Warning/Info: ', JSON.stringify(errInfo));
}

/**
 * Save creator profile and canvas blocks to Firestore
 */
export async function saveCreatorToFirestore(
  userId: string,
  profile: CreatorProfile,
  blocks: CanvasBlock[],
  menuItems: MenuItem[],
  products: DigitalProduct[]
) {
  if (!userId) return;
  const path = `creators/${userId}`;
  try {
    const creatorRef = doc(db, 'creators', userId);
    await setDoc(
      creatorRef,
      {
        userId,
        name: profile.name,
        handle: profile.handle,
        bio: profile.bio || '',
        customDomain: profile.customDomain || '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save table order to Firestore
 */
export async function saveTableOrderToFirestore(order: TableOrder) {
  const path = `table_orders/${order.id}`;
  try {
    const orderRef = doc(db, 'table_orders', order.id);
    await setDoc(orderRef, {
      ...order,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
