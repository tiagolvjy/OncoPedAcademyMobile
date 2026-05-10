import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput,
    TouchableOpacity, ActivityIndicator, RefreshControl, Image,
    Alert, Modal, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import CourseServicesMobile, { Course } from '../services/courses';
import FavoritesService from '../services/favorites';
import PlaylistsService, { Playlist } from '../services/playlists';
import WatchLaterService from '../services/watchLater';


type TabType = 'todos' | 'playlists' | 'favoritos';

export default function CoursesScreen() {
    const navigation = useNavigation<any>();
    const { user, userData } = useAuth();
    const [tab, setTab] = useState<TabType>('todos');
    const [courses, setCourses] = useState<Course[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [playlistName, setPlaylistName] = useState('');
    const [watchLaterIds, setWatchLaterIds] = useState<string[]>([]);

    const firstName = userData?.name?.split(' ')[0] ?? 'Usuário';

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        if (!user) return;
        const [coursesRes, favIds, playlistsRes, watchIds] = await Promise.all([
            CourseServicesMobile.getPublished(),
            FavoritesService.getByUser(user.uid),
            PlaylistsService.getByUser(user.uid),
            WatchLaterService.getByUser(user.uid),
        ]);
        if (coursesRes.success && coursesRes.courses) setCourses(coursesRes.courses);
        setFavoriteIds(favIds);
        setPlaylists(playlistsRes);
        setWatchLaterIds(watchIds);
        setLoading(false);
        setRefreshing(false);
    };

    const onRefresh = useCallback(() => { setRefreshing(true); loadData(); }, []);

    const toggleFavorite = async (courseId: string) => {
        if (!user) return;
        const isFav = await FavoritesService.toggle(user.uid, courseId);
        setFavoriteIds(prev => isFav
            ? [...prev, courseId]
            : prev.filter(id => id !== courseId)
        );
    };

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.authorName.toLowerCase().includes(search.toLowerCase())
    );

    const favoriteCourses = courses.filter(c => favoriteIds.includes(c.id));

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
                        <Ionicons name="book" size={32} color="#fff" />
                    </View>
                )}
            </View>

            <View style={styles.courseInfo}>
                <Text style={styles.courseTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.courseMetaRow}>
                    <Ionicons name="time-outline" size={13} color="#888" />
                    <Text style={styles.courseMetaText}>{item.duration} horas</Text>
                </View>
                <View style={styles.courseBottom}>
                    <View style={[styles.typeBadge, item.verified ? styles.typeBadgeOfficial : styles.typeBadgeCommunity]}>
                        <Text style={styles.typeBadgeText}>
                            {item.verified ? 'Curso Oficial' : 'Comunidade'}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                        <Ionicons
                            name={favoriteIds.includes(item.id) ? 'star' : 'star-outline'}
                            size={22}
                            color="#D4A017"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderPlaylist = ({ item }: { item: Playlist }) => (
        <TouchableOpacity style={styles.playlistCard}>
            <View style={styles.playlistImagePlaceholder}>
                <Ionicons name="list" size={32} color="#fff" />
            </View>
            <Text style={styles.playlistName}>{item.name}</Text>
            <Text style={styles.playlistCount}>{item.courseIds?.length ?? 0} Vídeos</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color="#2563EB" /></View>;
    }

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.brandText}>
                        <Text style={styles.brandOnco}>OncoPed</Text> Academy
                    </Text>
                    {userData?.photoURL
                        ? <Image source={{ uri: userData.photoURL }} style={styles.avatar} />
                        : <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{firstName.charAt(0)}</Text>
                          </View>
                    }
                </View>
                <Text style={styles.headerTitle}>Cursos</Text>
            </View>

            {/* SEARCH */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={18} color="#999" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Pesquise cursos, tópicos ou instrutores..."
                        placeholderTextColor="#aaa"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            {/* TABS */}
            <View style={styles.tabContainer}>
                {(['todos', 'playlists', 'favoritos'] as TabType[]).map(t => (
                    <TouchableOpacity key={t} style={styles.tab} onPress={() => setTab(t)}>
                        <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                            {t === 'todos' ? 'Todos Cursos' : t === 'playlists' ? 'Playlists' : 'Favoritos'}
                        </Text>
                        {tab === t && <View style={styles.tabBar} />}
                    </TouchableOpacity>
                ))}
            </View>

            {/* CONTENT */}
            {tab === 'todos' && (
                <FlatList
                    data={filteredCourses}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCourse}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="book-outline" size={48} color="#ccc" />
                            <Text style={styles.emptyText}>Nenhum curso encontrado.</Text>
                        </View>
                    }
                />
            )}

            {tab === 'playlists' && (
                <ScrollView contentContainerStyle={styles.list}>
                    {/* ASSISTIR DEPOIS */}
                    <TouchableOpacity
                        style={styles.watchLaterPlaylist}
                        onPress={() => {
                            const watchLaterCourses = courses.filter(c => watchLaterIds.includes(c.id));
                            navigation.navigate('WatchLaterList', { courses: watchLaterCourses });
                        }}
                    >
                        <View style={styles.watchLaterIcon}>
                            <Ionicons name="time-outline" size={28} color="#fff" />
                        </View>
                        <View style={styles.watchLaterInfo}>
                            <Text style={styles.watchLaterTitle}>Assistir depois</Text>
                            <Text style={styles.watchLaterCount}>{watchLaterIds.length} curso(s)</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>

                    {/* CRIAR PLAYLIST */}
                    <TouchableOpacity style={styles.createPlaylistBtn} onPress={() => setShowPlaylistModal(true)}>
                        <Ionicons name="add-circle-outline" size={18} color="#2563EB" />
                        <Text style={styles.createPlaylistText}>Criar playlist</Text>
                    </TouchableOpacity>

                    {/* PLAYLISTS DO USUÁRIO */}
                    {playlists.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="list-outline" size={48} color="#ccc" />
                            <Text style={styles.emptyText}>Nenhuma playlist criada.</Text>
                        </View>
                    ) : (
                        <View style={styles.playlistGrid}>
                            {playlists.map((item) => (
                                <TouchableOpacity key={item.id} style={styles.playlistCard}>
                                    <View style={styles.playlistImagePlaceholder}>
                                        <Ionicons name="list" size={32} color="#fff" />
                                    </View>
                                    <Text style={styles.playlistName}>{item.name}</Text>
                                    <Text style={styles.playlistCount}>{item.courseIds?.length ?? 0} Vídeos</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ScrollView>
            )}

            {tab === 'favoritos' && (
                <FlatList
                    data={favoriteCourses}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCourse}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="star-outline" size={48} color="#ccc" />
                            <Text style={styles.emptyText}>Nenhum curso favoritado.</Text>
                        </View>
                    }
                />
            )}

            {/* MODAL CRIAR PLAYLIST */}
            <Modal visible={showPlaylistModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Nova Playlist</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Nome da playlist"
                            placeholderTextColor="#aaa"
                            value={playlistName}
                            onChangeText={setPlaylistName}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalBtnCancel}
                                onPress={() => { setShowPlaylistModal(false); setPlaylistName(''); }}>
                                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalBtnConfirm}
                                onPress={async () => {
                                    if (!playlistName.trim() || !user) return;
                                    await PlaylistsService.create({
                                        userId: user.uid,
                                        name: playlistName.trim(),
                                        courseIds: [],
                                        createdAt: new Date().toISOString(),
                                    });
                                    setShowPlaylistModal(false);
                                    setPlaylistName('');
                                    loadData();
                                }}>
                                <Text style={styles.modalBtnConfirmText}>Criar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F4F8' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F8' },

    // HEADER
    header: { backgroundColor: '#172F50', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    brandText: { fontSize: 18, fontWeight: '700', color: '#fff' },
    brandOnco: { color: '#0D9488' },
    avatar: { width: 36, height: 36, borderRadius: 18 },
    avatarPlaceholder: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: '#0D9488',
        justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },

    // SEARCH
    searchContainer: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#fff' },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5',
        borderRadius: 12, paddingHorizontal: 14, height: 44, gap: 8,
    },
    searchInput: { flex: 1, fontSize: 14, color: '#333' },

    // TABS
    tabContainer: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
    tab: { marginRight: 24, paddingVertical: 12, alignItems: 'center' },
    tabText: { fontSize: 14, color: '#999', fontWeight: '500' },
    tabTextActive: { color: '#2563EB', fontWeight: '700' },
    tabBar: { width: '100%', height: 3, backgroundColor: '#2563EB', borderRadius: 2, marginTop: 6 },

    // LIST
    list: { padding: 16 },

    // COURSE CARD
    courseCard: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 14, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    courseImageContainer: { height: 140 },
    courseImage: { width: '100%', height: '100%' },
    courseImagePlaceholder: { width: '100%', height: '100%', backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center' },
    courseInfo: { padding: 14 },
    courseTitle: { fontSize: 15, fontWeight: '700', color: '#0A1628', marginBottom: 6, lineHeight: 20 },
    courseMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
    courseMetaText: { fontSize: 12, color: '#888' },
    courseBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    typeBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    typeBadgeOfficial: { backgroundColor: '#EBF5FF' },
    typeBadgeCommunity: { backgroundColor: '#FFF8E1' },
    typeBadgeText: { fontSize: 11, fontWeight: '600', color: '#2563EB' },

    // PLAYLIST
    playlistCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    playlistImagePlaceholder: { height: 100, backgroundColor: '#0D9488', justifyContent: 'center', alignItems: 'center' },
    playlistName: { fontSize: 14, fontWeight: '700', color: '#0A1628', padding: 10, paddingBottom: 2 },
    playlistCount: { fontSize: 12, color: '#888', paddingHorizontal: 10, paddingBottom: 10 },
    createPlaylistBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
    createPlaylistText: { fontSize: 14, color: '#2563EB', fontWeight: '600' },
    watchLaterPlaylist: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    watchLaterIcon: {
        width: 52, height: 52, borderRadius: 12, backgroundColor: '#2563EB',
        justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    watchLaterInfo: { flex: 1 },
    watchLaterTitle: { fontSize: 16, fontWeight: '700', color: '#0A1628' },
    watchLaterCount: { fontSize: 13, color: '#888', marginTop: 2 },
    playlistGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

    // MODAL
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center', padding: 24,
    },
    modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '100%' },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#0A1628', marginBottom: 16 },
    modalInput: {
        borderWidth: 1, borderColor: '#ddd', borderRadius: 10, backgroundColor: '#fafafa',
        paddingHorizontal: 14, height: 48, fontSize: 15, color: '#333', marginBottom: 16,
    },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    modalBtnCancel: { paddingVertical: 10, paddingHorizontal: 20 },
    modalBtnCancelText: { color: '#999', fontSize: 15, fontWeight: '600' },
    modalBtnConfirm: { backgroundColor: '#2563EB', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 24 },
    modalBtnConfirmText: { color: '#fff', fontSize: 15, fontWeight: '700' },

    // EMPTY
    emptyContainer: { alignItems: 'center', paddingTop: 40, gap: 8 },
    emptyText: { fontSize: 15, color: '#999' },
});