import { API_URL, headers } from '../config/api';
import { Group, Category, Product } from '../types';

// --- DATA FETCHING ---

export const fetchAllData = async (userId: string): Promise<Group[]> => {
    try {
        const response = await fetch(`${API_URL}/data/${userId}`, { headers });
        if (!response.ok) return [];
        const data = await response.json();
        return data as Group[];
    } catch (error) {
        console.error('Fetch data error:', error);
        return [];
    }
};

// --- GROUP OPERATIONS ---

export const addGroup = async (userId: string, group: Omit<Group, 'id' | 'categories'>) => {
    try {
        const response = await fetch(`${API_URL}/groups`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ userId, group }),
        });
        const data = await response.json();
        return data.id;
    } catch (error) {
        console.error('Add group error:', error);
        throw error;
    }
};

export const updateGroup = async (userId: string, groupId: string, updates: Partial<Group>) => {
    try {
        await fetch(`${API_URL}/groups/${groupId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ updates }),
        });
    } catch (error) {
        console.error('Update group error:', error);
        throw error;
    }
};

export const deleteGroup = async (userId: string, groupId: string) => {
    try {
        await fetch(`${API_URL}/groups/${groupId}`, {
            method: 'DELETE',
            headers,
        });
    } catch (error) {
        console.error('Delete group error:', error);
        throw error;
    }
};

// --- CATEGORY OPERATIONS ---

export const addCategory = async (userId: string, groupId: string, category: Omit<Category, 'id' | 'products'>) => {
    try {
        const response = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ groupId, category }),
        });
        const data = await response.json();
        return data.id;
    } catch (error) {
        console.error('Add category error:', error);
        throw error;
    }
};

export const updateCategory = async (userId: string, groupId: string, categoryId: string, updates: Partial<Category>) => {
    try {
        await fetch(`${API_URL}/categories/${categoryId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ updates }),
        });
    } catch (error) {
        console.error('Update category error:', error);
        throw error;
    }
};

export const deleteCategory = async (userId: string, groupId: string, categoryId: string) => {
    try {
        await fetch(`${API_URL}/categories/${categoryId}`, {
            method: 'DELETE',
            headers,
        });
    } catch (error) {
        console.error('Delete category error:', error);
        throw error;
    }
};

// --- PRODUCT OPERATIONS ---

export const addProduct = async (userId: string, groupId: string, categoryId: string, product: Omit<Product, 'id'>) => {
    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ categoryId, product }),
        });
        const data = await response.json();
        return data.id;
    } catch (error) {
        console.error('Add product error:', error);
        throw error;
    }
};

export const updateProduct = async (userId: string, groupId: string, categoryId: string, productId: string, updates: Partial<Product>) => {
    try {
        await fetch(`${API_URL}/products/${productId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ updates }),
        });
    } catch (error) {
        console.error('Update product error:', error);
        throw error;
    }
};

export const deleteProduct = async (userId: string, groupId: string, categoryId: string, productId: string) => {
    try {
        await fetch(`${API_URL}/products/${productId}`, {
            method: 'DELETE',
            headers,
        });
    } catch (error) {
        console.error('Delete product error:', error);
        throw error;
    }
};

// --- USER SETTINGS (Wedding Date) ---

export const updateUserWeddingDate = async (userId: string, dateIsoString: string) => {
    try {
        await fetch(`${API_URL}/user/update`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ username: userId, updates: { weddingDate: dateIsoString } }),
        });
    } catch (error) {
        console.error('Update wedding date error:', error);
    }
};

export const getUserWeddingDate = async (userId: string): Promise<string | null> => {
    try {
        const response = await fetch(`${API_URL}/user/${userId}`, { headers });
        if (response.ok) {
            const user = await response.json();
            return user.weddingDate || null;
        }
        return null;
    } catch (error) {
        console.error('Get wedding date error:', error);
        return null;
    }
};
