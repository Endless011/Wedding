import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Group, Category, Product } from '../types';

const USERS_COLLECTION = 'users';

const GROUPS_COLLECTION = 'groups';
const CATEGORIES_COLLECTION = 'categories';
const PRODUCTS_COLLECTION = 'products';

// Helper: Generate unique ID
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Helper: Get Paths
const getGroupsPath = (userId: string) =>
    `${USERS_COLLECTION}/${userId}/${GROUPS_COLLECTION}`;
const getCategoriesPath = (userId: string, groupId: string) =>
    `${getGroupsPath(userId)}/${groupId}/${CATEGORIES_COLLECTION}`;
const getProductsPath = (userId: string, groupId: string, categoryId: string) =>
    `${getCategoriesPath(userId, groupId)}/${categoryId}/${PRODUCTS_COLLECTION}`;

// --- FETCH & REALTIME ---

export const subscribeToGroupsChanges = (
    userId: string,
    callback: (groups: Group[]) => void
) => {
    const groupsRef = collection(db, getGroupsPath(userId));

    return onSnapshot(groupsRef, async (groupSnap) => {
        try {
            const groups = await Promise.all(groupSnap.docs.map(async (groupDoc) => {
                const groupData = groupDoc.data();
                const currentGroupId = groupDoc.id;

                // Fetch Categories
                const categoriesRef = collection(db, getCategoriesPath(userId, currentGroupId));
                const categorySnap = await getDocs(categoriesRef);

                const categories = await Promise.all(categorySnap.docs.map(async (catDoc) => {
                    const catData = catDoc.data();
                    const currentCatId = catDoc.id;

                    // Fetch Products
                    const productsRef = collection(db, getProductsPath(userId, currentGroupId, currentCatId));
                    const productSnap = await getDocs(productsRef);

                    const products: Product[] = productSnap.docs.map(p => ({
                        id: p.id,
                        name: p.data().name || '',
                        brand: p.data().brand,
                        price: p.data().price,
                        purchasedQuantity: p.data().purchasedQuantity || 0,
                        notes: p.data().notes,
                        isPurchased: p.data().isPurchased || false,
                    }));

                    return {
                        id: currentCatId,
                        name: catData.name || '',
                        description: catData.description,
                        targetQuantity: catData.targetQuantity || 1,
                        isCompleted: catData.isCompleted || false,
                        products: products
                    } as Category;
                }));

                return {
                    id: currentGroupId,
                    name: groupData.name || '',
                    icon: groupData.icon || '📦',
                    color: groupData.color || '#E8B4BC',
                    categories: categories
                } as Group;
            }));

            callback(groups);
        } catch (error) {
            console.error('Error fetching deep hierarchy:', error);
        }
    });
};

// --- GROUP OPERATIONS ---

export const addGroup = async (userId: string, group: Omit<Group, 'id' | 'categories'>) => {
    const newId = generateId();
    await setDoc(doc(db, getGroupsPath(userId), newId), {
        ...group,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    return newId;
};

export const updateGroup = async (userId: string, groupId: string, updates: Partial<Group>) => {
    const { categories, id, ...cleanUpdates } = updates as any;
    await updateDoc(doc(db, getGroupsPath(userId), groupId), {
        ...cleanUpdates,
        updatedAt: Timestamp.now(),
    });
};

export const createGroupWithHierarchy = async (userId: string, groupData: any) => {
    const batch = writeBatch(db);

    // 1. Create Group
    const newGroupId = generateId();
    const groupRef = doc(db, getGroupsPath(userId), newGroupId);
    batch.set(groupRef, {
        name: groupData.name,
        icon: groupData.icon,
        color: groupData.color,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    });

    // 2. Create Categories & Products
    if (groupData.categories) {
        groupData.categories.forEach((cat: any) => {
            const newCatId = generateId();
            const catRef = doc(db, getCategoriesPath(userId, newGroupId), newCatId);
            batch.set(catRef, {
                name: cat.name,
                description: cat.description || '',
                targetQuantity: cat.targetQuantity || 1,
                isCompleted: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            if (cat.products) {
                cat.products.forEach((prod: any) => {
                    const newProdId = generateId();
                    const prodRef = doc(db, getProductsPath(userId, newGroupId, newCatId), newProdId);
                    batch.set(prodRef, {
                        ...prod,
                        purchasedQuantity: 0,
                        isPurchased: false,
                        createdAt: Timestamp.now(),
                        updatedAt: Timestamp.now()
                    });
                });
            }
        });
    }

    await batch.commit();
    return newGroupId;
};

export const deleteGroup = async (userId: string, groupId: string) => {
    // Collect all references first
    const refsToDelete: any[] = [];

    // Group Ref
    refsToDelete.push(doc(db, getGroupsPath(userId), groupId));

    // Categories
    const categoriesRef = collection(db, getCategoriesPath(userId, groupId));
    const catSnap = await getDocs(categoriesRef);

    for (const catDoc of catSnap.docs) {
        refsToDelete.push(catDoc.ref);

        // Products
        const productsRef = collection(db, getProductsPath(userId, groupId, catDoc.id));
        const prodSnap = await getDocs(productsRef);
        prodSnap.docs.forEach(p => refsToDelete.push(p.ref));
    }

    // Commit in batches of 500
    const CHUNK_SIZE = 500;
    for (let i = 0; i < refsToDelete.length; i += CHUNK_SIZE) {
        const batch = writeBatch(db);
        const chunk = refsToDelete.slice(i, i + CHUNK_SIZE);
        chunk.forEach(ref => batch.delete(ref));
        await batch.commit();
    }
};

// Helper to touch Group timestamp to trigger listener
const touchGroup = async (userId: string, groupId: string) => {
    try {
        await updateDoc(doc(db, getGroupsPath(userId), groupId), {
            updatedAt: Timestamp.now()
        });
    } catch (e) {
        console.error("Failed to touch group", e);
    }
};

// --- CATEGORY OPERATIONS ---

export const addCategory = async (userId: string, groupId: string, category: Omit<Category, 'id' | 'products'>) => {
    const newId = generateId();
    await setDoc(doc(db, getCategoriesPath(userId, groupId), newId), {
        ...category,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    // Trigger update
    await touchGroup(userId, groupId);
    return newId;
};

export const updateCategory = async (userId: string, groupId: string, categoryId: string, updates: Partial<Category>) => {
    const { products, id, ...cleanUpdates } = updates as any;
    await updateDoc(doc(db, getCategoriesPath(userId, groupId), categoryId), {
        ...cleanUpdates,
        updatedAt: Timestamp.now(),
    });
    await touchGroup(userId, groupId);
};

export const deleteCategory = async (userId: string, groupId: string, categoryId: string) => {
    const productsRef = collection(db, getProductsPath(userId, groupId, categoryId));
    const prodSnap = await getDocs(productsRef);

    for (const p of prodSnap.docs) {
        await deleteDoc(p.ref);
    }

    await deleteDoc(doc(db, getCategoriesPath(userId, groupId), categoryId));
    await touchGroup(userId, groupId);
};

// --- PRODUCT OPERATIONS ---

export const addProduct = async (userId: string, groupId: string, categoryId: string, product: Omit<Product, 'id'>) => {
    const newId = generateId();
    await setDoc(doc(db, getProductsPath(userId, groupId, categoryId), newId), {
        ...product,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    await touchGroup(userId, groupId);
    return newId;
};

export const updateProduct = async (userId: string, groupId: string, categoryId: string, productId: string, updates: Partial<Product>) => {
    const { id, ...cleanUpdates } = updates as any;
    await updateDoc(doc(db, getProductsPath(userId, groupId, categoryId), productId), {
        ...cleanUpdates,
        updatedAt: Timestamp.now(),
    });
    await touchGroup(userId, groupId);
};

export const deleteProduct = async (userId: string, groupId: string, categoryId: string, productId: string) => {
    await deleteDoc(doc(db, getProductsPath(userId, groupId, categoryId), productId));
    await touchGroup(userId, groupId);
};

// --- USER SETTINGS ---

export const updateUserWeddingDate = async (userId: string, dateIsoString: string) => {
    await setDoc(doc(db, USERS_COLLECTION, userId), {
        weddingDate: dateIsoString,
        updatedAt: Timestamp.now()
    }, { merge: true });
};

export const getUserWeddingDate = async (userId: string): Promise<string | null> => {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (userDoc.exists()) {
        return userDoc.data().weddingDate || null;
    }
    return null;
};
