import React from 'react';
import {
    View, Text, StyleSheet, FlatList,
    TouchableOpacity, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Course } from '../services/courses';

export default function WatchLaterListScreen({ route }: any) {
    const { courses } = route.params as { courses: Course[] };
    const navigation = useNavigation<any>();

    const renderCourse = ({ item }: { item: Course }) => (
        <TouchableOpacity
            style={styles.courseCard}
            onPress={() => navigation.navigate('CourseDetail', { course: item })}
        >
            <View style={styles.courseImageContainer}>
                {item.coverImage ? (
                    <Image source={{ uri: item.coverImage }} style={styles.courseImage} />
                ) : (
                    <View style={styles.courseImagePlaceholder}>
                        <Ionicons name="book" size={28} color="#fff" />
                    </View>
                )}
            </View>
            <View style={styles.courseInfo}>
                <Text style={styles.courseTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.courseAuthor}>Por {item.authorName}</Text>
                <View style={styles.courseMetaRow}>
                    <Ionicons name="time-outline" size={13} color="#888" />
                    <Text style={styles.courseMetaText}>{item.duration} horas</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={courses}
                keyExtractor={(item) => item.id}
                renderItem={renderCourse}
                contentContainerStyle={courses.length === 0 ? styles.center : styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="time-outline" size={48} color="#ccc" />
                        <Text style={styles.emptyTitle}>Nenhum curso salvo</Text>
                        <Text style={styles.emptySubtitle}>
                            Adicione cursos à sua lista para assistir depois.
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F4F8' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    list: { padding: 16 },
    courseCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 12, padding: 12, marginBottom: 10,
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    courseImageContainer: { width: 70, height: 70, borderRadius: 10, overflow: 'hidden', marginRight: 12 },
    courseImage: { width: '100%', height: '100%' },
    courseImagePlaceholder: { width: '100%', height: '100%', backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center' },
    courseInfo: { flex: 1 },
    courseTitle: { fontSize: 14, fontWeight: '700', color: '#0A1628', marginBottom: 2 },
    courseAuthor: { fontSize: 12, color: '#2563EB', marginBottom: 4 },
    courseMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    courseMetaText: { fontSize: 12, color: '#888' },
    emptyContainer: { alignItems: 'center', gap: 8 },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: '#999' },
    emptySubtitle: { fontSize: 14, color: '#bbb', textAlign: 'center' },
});