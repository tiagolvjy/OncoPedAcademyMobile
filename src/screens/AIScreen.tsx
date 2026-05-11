import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, Image, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import CourseServicesMobile, { Course } from '../services/courses';
import FavoritesService from '../services/favorites';
import { useAI } from '../hooks/useAI';

const SUGGESTED_TAGS = [
    'Leucemia Linfoide Aguda',
    'Efeitos Tardios',
    'Imunoterapia',
    'Neuroblastoma',
    'Diagnóstico Precoce',
];

export default function AIScreen() {
    const { user, userData } = useAuth();
    const navigation = useNavigation<any>();
    const ai = useAI();
    const [search, setSearch] = useState('');
    const [courses, setCourses] = useState<Course[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [results, setResults] = useState<Course[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState('');

    const firstName = userData?.name?.split(' ')[0] ?? userData?.email?.split('@')[0] ?? 'Usuário';

    useFocusEffect(
        useCallback(() => {
            loadCourses();
        }, [])
    );

    const loadCourses = async () => {
        if (!user) return;
        const [coursesRes, favIds] = await Promise.all([
            CourseServicesMobile.getPublished(),
            FavoritesService.getByUser(user.uid),
        ]);
        if (coursesRes.success && coursesRes.courses) setCourses(coursesRes.courses);
        setFavoriteIds(favIds);
    };

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setResults([]);
            setHasSearched(false);
            setAiResponse('');
            return;
        }

        setLoading(true);
        setHasSearched(true);

        // Busca nos cursos
        const terms = query.toLowerCase().split(' ');
        const filtered = courses.filter(c => {
            const searchable = `${c.title} ${c.description} ${c.authorName}`.toLowerCase();
            return terms.some(term => searchable.includes(term));
        });
        setResults(filtered);

        // Gera resposta da IA (real ou fallback)
        const response = await ai.generateResponse(query, firstName);
        setAiResponse(response);

        setLoading(false);
    };

    const handleTagPress = (tag: string) => {
        setSearch(tag);
        handleSearch(tag);
    };

    const toggleFavorite = async (courseId: string) => {
        if (!user) return;
        const isFav = await FavoritesService.toggle(user.uid, courseId);
        setFavoriteIds(prev => isFav
            ? [...prev, courseId]
            : prev.filter(id => id !== courseId)
        );
    };

    const relatedSuggestions = hasSearched
        ? SUGGESTED_TAGS.filter(tag => !search.toLowerCase().includes(tag.toLowerCase())).slice(0, 3)
        : [];

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }} bounces={false}>
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
                <Text style={styles.headerTitle}>IA Dicas</Text>
            </View>

            {/* MODEL LOADING BANNER */}
            {ai.isAvailable && !ai.modelReady && (
                <View style={styles.modelLoadingBanner}>
                    <ActivityIndicator size="small" color="#2563EB" />
                    <Text style={styles.modelLoadingText}>
                        Carregando modelo de IA... {Math.round(ai.downloadProgress * 100)}%
                    </Text>
                </View>
            )}

            {/* HERO */}
            <View style={styles.hero}>
                <Text style={styles.heroTitle}>
                    Como posso ajudar na sua pesquisa hoje?
                </Text>
                <Text style={styles.heroSubtitle}>
                    Explore o conhecimento oncológico pediátrico com auxílio da nossa IA.
                </Text>

                {/* SEARCH BAR */}
                <View style={styles.searchBar}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Ex: Protocolos de tratamento para Neuroblast..."
                        placeholderTextColor="#aaa"
                        value={search}
                        onChangeText={setSearch}
                        onSubmitEditing={() => handleSearch(search)}
                        returnKeyType="search"
                    />
                    <TouchableOpacity style={styles.searchBtn} onPress={() => handleSearch(search)}>
                        <Ionicons name="search" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* TAGS */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsRow}>
                    <View style={styles.tagAI}>
                        <Ionicons name="sparkles" size={12} color="#2563EB" />
                        <Text style={styles.tagAIText}>IA SUGERE</Text>
                    </View>
                    {SUGGESTED_TAGS.map((tag) => (
                        <TouchableOpacity key={tag} style={styles.tag} onPress={() => handleTagPress(tag)}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* LOADING */}
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text style={styles.loadingText}>Analisando sua pesquisa...</Text>
                </View>
            )}

            {/* RESULTADOS DA PESQUISA */}
            {hasSearched && !loading && (
                <View style={styles.resultsSection}>
                    <Text style={styles.searchingFor}>
                        Mostrando resultados para <Text style={styles.searchTerm}>{search}</Text>
                    </Text>

                    {/* RESPOSTA DA IA */}
                    <View style={styles.aiCard}>
                        <Text style={styles.aiCardBrand}>
                            <Ionicons name="sparkles" size={14} color="#2563EB" /> IA OncoPed Academy
                            {ai.isAvailable && <Text style={styles.aiOnDevice}> (On-device)</Text>}
                        </Text>
                        <Text style={styles.aiCardText}>{aiResponse}</Text>
                    </View>

                    {/* CURSOS ENCONTRADOS */}
                    {results.map((course) => (
                        <TouchableOpacity
                            key={course.id}
                            style={styles.courseCard}
                            onPress={() => navigation.navigate('Cursos', {
                                screen: 'CourseDetail',
                                params: { course },
                            })}
                        >
                            <View style={styles.courseImageContainer}>
                                {course.coverImage ? (
                                    <Image source={{ uri: course.coverImage }} style={styles.courseImage} />
                                ) : (
                                    <View style={styles.courseImagePlaceholder}>
                                        <Ionicons name="book" size={28} color="#fff" />
                                    </View>
                                )}
                            </View>
                            <View style={styles.courseInfo}>
                                <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
                                <View style={styles.courseMetaRow}>
                                    <Ionicons name="time-outline" size={12} color="#888" />
                                    <Text style={styles.courseMetaText}>{course.duration} Horas</Text>
                                </View>
                                <View style={styles.courseBottom}>
                                    <View style={[styles.typeBadge, course.verified ? styles.typeBadgeOfficial : styles.typeBadgeCommunity]}>
                                        <Text style={styles.typeBadgeText}>
                                            {course.verified ? 'Curso Oficial' : 'Comunidade'}
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => toggleFavorite(course.id)}>
                                        <Ionicons
                                            name={favoriteIds.includes(course.id) ? 'star' : 'star-outline'}
                                            size={20}
                                            color="#D4A017"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}

                    {results.length === 0 && (
                        <View style={styles.noResults}>
                            <Ionicons name="search-outline" size={40} color="#ccc" />
                            <Text style={styles.noResultsText}>Nenhum curso encontrado para esta pesquisa.</Text>
                        </View>
                    )}

                    {/* SUGESTÕES RELACIONADAS */}
                    {relatedSuggestions.length > 0 && (
                        <View style={styles.relatedSection}>
                            <Text style={styles.relatedTitle}>
                                <Ionicons name="git-branch-outline" size={16} color="#2563EB" /> Sugestões Relacionadas
                            </Text>
                            {relatedSuggestions.map((tag) => (
                                <TouchableOpacity key={tag} style={styles.relatedItem} onPress={() => handleTagPress(tag)}>
                                    <Ionicons name="search-outline" size={16} color="#2563EB" />
                                    <Text style={styles.relatedText}>{tag}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            )}

            {/* SUGESTÕES INICIAIS (antes de pesquisar) */}
            {!hasSearched && !loading && (
                <View style={styles.suggestionsSection}>
                    <View style={styles.sectionHeaderRow}>
                        <Ionicons name="bulb-outline" size={20} color="#0A1628" />
                        <Text style={styles.sectionTitle}>Sugestões da IA</Text>
                    </View>

                    <TouchableOpacity style={styles.suggestionCard} onPress={() => handleTagPress('Medicina de Precisão')}>
                        <View style={[styles.suggestionIcon, { backgroundColor: '#EBF5FF' }]}>
                            <Ionicons name="trending-up" size={24} color="#2563EB" />
                        </View>
                        <View style={styles.suggestionContent}>
                            <Text style={styles.suggestionLabel}>TENDÊNCIA MÉDICA</Text>
                            <Text style={styles.suggestionTitle}>Avanços em Medicina de Precisão para Sarcomas</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.suggestionCard} onPress={() => handleTagPress('Diagnóstico Precoce')}>
                        <View style={[styles.suggestionIcon, { backgroundColor: '#E6F7F5' }]}>
                            <Ionicons name="eye-outline" size={24} color="#0D9488" />
                        </View>
                        <View style={styles.suggestionContent}>
                            <Text style={styles.suggestionLabel}>RECOMENDADO PARA VOCÊ</Text>
                            <Text style={styles.suggestionTitle}>Diagnóstico Precoce de Neoplasias Infantis</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.suggestionCard} onPress={() => handleTagPress('Imunoterapia')}>
                        <View style={[styles.suggestionIcon, { backgroundColor: '#FFF8E1' }]}>
                            <Ionicons name="flask-outline" size={24} color="#D4A017" />
                        </View>
                        <View style={styles.suggestionContent}>
                            <Text style={styles.suggestionLabel}>EM ALTA NA PLATAFORMA</Text>
                            <Text style={styles.suggestionTitle}>Imunoterapia em Oncologia Pediátrica</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F4F8' },

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

    // MODEL LOADING
    modelLoadingBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#EBF5FF', paddingHorizontal: 16, paddingVertical: 10,
        marginHorizontal: 16, marginTop: 12, borderRadius: 10,
    },
    modelLoadingText: { fontSize: 13, color: '#2563EB' },

    // HERO
    hero: { backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
    heroTitle: { fontSize: 22, fontWeight: 'bold', color: '#2563EB', lineHeight: 30, marginBottom: 6 },
    heroSubtitle: { fontSize: 14, color: '#666', marginBottom: 20 },

    // SEARCH
    searchBar: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5',
        borderRadius: 25, paddingLeft: 16, height: 48, marginBottom: 14,
    },
    searchInput: { flex: 1, fontSize: 14, color: '#333' },
    searchBtn: {
        width: 42, height: 42, borderRadius: 21, backgroundColor: '#2563EB',
        justifyContent: 'center', alignItems: 'center', marginRight: 3,
    },

    // TAGS
    tagsRow: { flexDirection: 'row', marginBottom: 4 },
    tagAI: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#EBF5FF', borderRadius: 16,
        paddingHorizontal: 10, paddingVertical: 6, marginRight: 8,
    },
    tagAIText: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
    tag: {
        backgroundColor: '#f0f0f0', borderRadius: 16,
        paddingHorizontal: 12, paddingVertical: 6, marginRight: 8,
    },
    tagText: { fontSize: 12, color: '#555' },

    // LOADING
    loadingContainer: { alignItems: 'center', paddingTop: 40, gap: 12 },
    loadingText: { fontSize: 14, color: '#888' },

    // RESULTS
    resultsSection: { padding: 16 },
    searchingFor: { fontSize: 13, color: '#888', marginBottom: 12 },
    searchTerm: { color: '#2563EB', fontWeight: '600' },

    // AI CARD
    aiCard: {
        backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16,
        borderLeftWidth: 4, borderLeftColor: '#2563EB',
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    aiCardBrand: { fontSize: 13, fontWeight: '700', color: '#2563EB', marginBottom: 8 },
    aiOnDevice: { fontSize: 10, color: '#0D9488' },
    aiCardText: { fontSize: 14, color: '#444', lineHeight: 22 },

    // COURSE CARD
    courseCard: {
        backgroundColor: '#fff', borderRadius: 14, marginBottom: 12,
        overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04,
        shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    courseImageContainer: { height: 120 },
    courseImage: { width: '100%', height: '100%' },
    courseImagePlaceholder: {
        width: '100%', height: '100%', backgroundColor: '#2563EB',
        justifyContent: 'center', alignItems: 'center',
    },
    courseInfo: { padding: 12 },
    courseTitle: { fontSize: 15, fontWeight: '700', color: '#0A1628', marginBottom: 6 },
    courseMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
    courseMetaText: { fontSize: 12, color: '#888' },
    courseBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    typeBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    typeBadgeOfficial: { backgroundColor: '#EBF5FF' },
    typeBadgeCommunity: { backgroundColor: '#FFF8E1' },
    typeBadgeText: { fontSize: 11, fontWeight: '600', color: '#2563EB' },

    // NO RESULTS
    noResults: { alignItems: 'center', paddingVertical: 30, gap: 8 },
    noResultsText: { fontSize: 14, color: '#999', textAlign: 'center' },

    // RELATED
    relatedSection: { marginTop: 16 },
    relatedTitle: { fontSize: 15, fontWeight: '600', color: '#2563EB', marginBottom: 10 },
    relatedItem: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    },
    relatedText: { fontSize: 14, color: '#333' },

    // SUGGESTIONS (home state)
    suggestionsSection: { padding: 16 },
    sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0A1628' },
    suggestionCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 14, padding: 16, marginBottom: 10,
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    suggestionIcon: {
        width: 48, height: 48, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    suggestionContent: { flex: 1 },
    suggestionLabel: { fontSize: 10, fontWeight: '700', color: '#2563EB', letterSpacing: 1, marginBottom: 4 },
    suggestionTitle: { fontSize: 14, fontWeight: '600', color: '#0A1628', lineHeight: 20 },
});