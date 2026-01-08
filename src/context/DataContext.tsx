import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Group, Category, Product } from '../types';
import { useAuth } from './AuthContext';
import {
    subscribeToGroupsChanges,
    addGroup,
    updateGroup,
    deleteGroup,
    addCategory,
    updateCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    createGroupWithHierarchy
} from '../services/firebaseService';

interface DataContextType {
    groups: Group[];
    isLoading: boolean;

    // View Others
    // View Others (Legacy: targetUserId)
    targetUserId: string | null;
    setTargetUserId: (id: string | null) => void;
    isReadOnly: boolean;

    // New Guest Data
    guestGroups: Group[];
    loadGuestData: (username: string) => () => void; // Returns unsubscribe function

    // Group Ops
    createGroup: (group: Omit<Group, 'id' | 'categories'>) => Promise<string | undefined>;
    createGroupWithHierarchy: (groupData: any) => Promise<string | undefined>;
    editGroup: (groupId: string, updates: Partial<Group>) => void;
    removeGroup: (groupId: string) => void;

    // Category Ops
    createCategory: (groupId: string, category: Omit<Category, 'id' | 'products'>) => Promise<string | undefined>;
    editCategory: (groupId: string, categoryId: string, updates: Partial<Category>) => void;
    removeCategory: (groupId: string, categoryId: string) => void;

    // Product Ops
    createProduct: (groupId: string, categoryId: string, product: Omit<Product, 'id'>) => Promise<string | undefined>;
    editProduct: (groupId: string, categoryId: string, productId: string, updates: Partial<Product>) => void;
    removeProduct: (groupId: string, categoryId: string, productId: string) => void;

    // Stats
    calculateOverallProgress: () => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [targetUserId, setTargetUserId] = useState<string | null>(null);

    const { user, isAuthenticated } = useAuth();

    // If target set, we use it; otherwise fallback to logged in user
    const activeUserId = targetUserId ? targetUserId : (user?.username || '');
    const isReadOnly = !!targetUserId;

    useEffect(() => {
        // Reset target if logged out or auth changes
        if (!isAuthenticated) {
            setTargetUserId(null);
            setGroups([]);
            setIsLoading(false);
            return;
        }

        if (!activeUserId) {
            setGroups([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const unsubscribe = subscribeToGroupsChanges(activeUserId, (newGroups) => {
            setGroups(newGroups);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [isAuthenticated, activeUserId]);

    // PROTECTED Wrappers for Service Calls (Block if ReadOnly)
    const guard = (fn: () => any) => {
        if (isReadOnly) {
            console.warn('Action blocked: View Only Mode');
            return;
        }
        return fn();
    };

    const createGroup = async (group: Omit<Group, 'id' | 'categories'>) => {
        if (isReadOnly || !activeUserId) return;
        return await addGroup(activeUserId, group);
    };

    const createGroupWithHierarchyWrapper = async (groupData: any) => {
        if (isReadOnly || !activeUserId) return;
        return await createGroupWithHierarchy(activeUserId, groupData);
    };

    const editGroup = async (groupId: string, updates: Partial<Group>) => {
        if (isReadOnly || !activeUserId) return;
        await updateGroup(activeUserId, groupId, updates);
    };

    const removeGroup = async (groupId: string) => {
        if (isReadOnly || !activeUserId) return;
        await deleteGroup(activeUserId, groupId);
    };

    const createCategory = async (groupId: string, category: Omit<Category, 'id' | 'products'>) => {
        if (isReadOnly || !activeUserId) return;
        return await addCategory(activeUserId, groupId, category);
    };

    const editCategory = async (groupId: string, categoryId: string, updates: Partial<Category>) => {
        if (isReadOnly || !activeUserId) return;
        await updateCategory(activeUserId, groupId, categoryId, updates);
    };

    const removeCategory = async (groupId: string, categoryId: string) => {
        if (isReadOnly || !activeUserId) return;
        await deleteCategory(activeUserId, groupId, categoryId);
    };

    const createProduct = async (groupId: string, categoryId: string, product: Omit<Product, 'id'>) => {
        if (isReadOnly || !activeUserId) return;
        return await addProduct(activeUserId, groupId, categoryId, product);
    };

    const editProduct = async (groupId: string, categoryId: string, productId: string, updates: Partial<Product>) => {
        if (isReadOnly || !activeUserId) return;
        await updateProduct(activeUserId, groupId, categoryId, productId, updates);
    };

    const removeProduct = async (groupId: string, categoryId: string, productId: string) => {
        if (isReadOnly || !activeUserId) return;
        await deleteProduct(activeUserId, groupId, categoryId, productId);
    };

    // Calculations
    const calculateOverallProgress = () => {
        let totalTarget = 0;
        let totalPurchased = 0;

        groups.forEach(group => {
            group.categories.forEach(cat => {
                totalTarget += cat.targetQuantity || 0;
                totalPurchased += cat.products.reduce((acc, p) => acc + (p.purchasedQuantity || 0), 0);
            });
        });

        if (totalTarget === 0) return 0;
        return Math.min(100, Math.round((totalPurchased / totalTarget) * 100));
    };

    // Guest Mode Logic
    const [guestGroups, setGuestGroups] = useState<Group[]>([]);

    // We do NOT use targetUserId for Main App anymore. 
    // We might keep it if we want to support the old way, but let's separate it.
    // Actually, let's KEEP targetUserId for now but ignore it in main views if we handle it via a separate Screen.
    // Wait, the new requirement says "separate screen". So DataContext should just provide data.

    const loadGuestData = (guestUsername: string) => {
        setIsLoading(true);
        // We reuse subscribeToGroupsChanges but separate state
        const unsubscribe = subscribeToGroupsChanges(guestUsername, (fetchedGroups) => {
            setGuestGroups(fetchedGroups);
            setIsLoading(false);
        });
        return unsubscribe; // Return cleanup to the caller (GuestScreen)
    };

    return (
        <DataContext.Provider value={{
            groups,
            isLoading,
            targetUserId: null, // Deprecated/Disabled for main view
            setTargetUserId: () => { }, // Disabled
            isReadOnly: false, // Main view is never read-only now

            // New Guest Props
            guestGroups,
            loadGuestData,

            createGroup, createGroupWithHierarchy: createGroupWithHierarchyWrapper, editGroup, removeGroup,
            createCategory, editCategory, removeCategory,
            createProduct, editProduct, removeProduct,
            calculateOverallProgress
        }}>
            {children}
        </DataContext.Provider>
    );
};
