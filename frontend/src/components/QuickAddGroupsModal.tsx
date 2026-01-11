import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { PREDEFINED_GROUPS } from '../data/predefinedData';
import { useData } from '../context/DataContext';

interface QuickAddGroupsModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function QuickAddGroupsModal({ visible, onClose }: QuickAddGroupsModalProps) {
    const { colors } = useTheme();
    const { createGroupWithHierarchy, groups } = useData();
    const [addingMap, setAddingMap] = useState<Record<string, boolean>>({});
    const [locallyAddedGroups, setLocallyAddedGroups] = useState<string[]>([]);

    // Check if a group already exists (check both firebase groups AND locally added this session)
    const isGroupAdded = (groupName: string) => {
        const lowerName = groupName.toLowerCase();
        return groups.some(g => g.name.toLowerCase() === lowerName) || locallyAddedGroups.includes(lowerName);
    };

    const handleAddGroup = async (groupIndex: number) => {
        const groupData = PREDEFINED_GROUPS[groupIndex];

        // Prevent duplicate
        if (isGroupAdded(groupData.name)) {
            Alert.alert("Uyarı", `${groupData.name} zaten ekli!`);
            return;
        }

        setAddingMap(prev => ({ ...prev, [groupData.name]: true }));

        try {
            await createGroupWithHierarchy(groupData);
            // Add to local tracking immediately
            setLocallyAddedGroups(prev => [...prev, groupData.name.toLowerCase()]);
            Alert.alert("Başarılı", `${groupData.name} paketi eklendi!`);
        } catch (error) {
            console.error(error);
            Alert.alert("Hata", "Grup eklenirken bir sorun oluştu.");
        } finally {
            setAddingMap(prev => ({ ...prev, [groupData.name]: false }));
        }
    };

    const renderItem = ({ item, index }: { item: typeof PREDEFINED_GROUPS[0], index: number }) => {
        const isAdding = addingMap[item.name];
        const productCount = item.categories.reduce((acc, c) => acc + c.products.length, 0);
        const alreadyAdded = isGroupAdded(item.name);

        return (
            <View style={[styles.card, { backgroundColor: colors.surface, borderLeftColor: item.color, opacity: alreadyAdded ? 0.6 : 1 }]}>
                <View style={styles.cardHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                        <Text style={styles.icon}>{item.icon}</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={[styles.groupName, { color: colors.textPrimary }]}>{item.name}</Text>
                            {alreadyAdded && (
                                <View style={{ backgroundColor: colors.sage, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginLeft: 8 }}>
                                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>EKLENDİ</Text>
                                </View>
                            )}
                        </View>
                        <Text style={[styles.groupDetails, { color: colors.textSecondary }]}>
                            {item.categories.length} Kategori • {productCount} Ürün
                        </Text>
                    </View>
                </View>

                {/* Preview of Categories */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewContainer}>
                    {item.categories.map((cat, i) => (
                        <View key={i} style={[styles.previewBadge, { backgroundColor: colors.background, borderColor: colors.lightGray }]}>
                            <Text style={[styles.previewText, { color: colors.textSecondary }]}>{cat.name}</Text>
                        </View>
                    ))}
                </ScrollView>

                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: alreadyAdded ? colors.gray : item.color }]}
                    onPress={() => handleAddGroup(index)}
                    disabled={isAdding || alreadyAdded}
                >
                    {isAdding ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : alreadyAdded ? (
                        <>
                            <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={styles.addButtonText}>Zaten Eklendi</Text>
                        </>
                    ) : (
                        <>
                            <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={styles.addButtonText}>Paketi Ekle</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <Modal
            animationType="slide"
            visible={visible}
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Hazır Paketler</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={28} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={PREDEFINED_GROUPS}
                    renderItem={renderItem}
                    keyExtractor={item => item.name}
                    contentContainerStyle={styles.list}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        padding: 20, paddingTop: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: '#eee'
    },
    title: { fontSize: 22, fontWeight: 'bold' },
    closeButton: { padding: 5 },
    list: { padding: 20 },
    card: {
        borderRadius: 16, marginBottom: 20, padding: 16,
        borderLeftWidth: 4,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    iconContainer: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    icon: { fontSize: 24 },
    cardContent: { flex: 1 },
    groupName: { fontSize: 18, fontWeight: 'bold' },
    groupDetails: { fontSize: 13, marginTop: 4 },
    previewContainer: { marginBottom: 15, flexDirection: 'row' },
    previewBadge: {
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, marginRight: 8
    },
    previewText: { fontSize: 12 },
    addButton: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        paddingVertical: 12, borderRadius: 12,
    },
    addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 }
});
