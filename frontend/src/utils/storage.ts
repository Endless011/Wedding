import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category } from '../types';
import { initialData } from '../data/initialData';

const STORAGE_KEY = '@ceyiz_takip_data_v1';

export const saveData = async (data: Category[]) => {
    try {
        const jsonValue = JSON.stringify(data);
        await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
        console.error('Veri kaydedilirken hata oluştu', e);
    }
};

export const loadData = async (): Promise<Category[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue != null) {
            return JSON.parse(jsonValue);
        } else {
            return initialData;
        }
    } catch (e) {
        console.error('Veri yüklenirken hata oluştu', e);
        return initialData;
    }
};

export const resetData = async () => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.error('Veri sıfırlanırken hata oluştu', e);
    }
};
