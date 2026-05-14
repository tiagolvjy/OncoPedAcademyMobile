import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    ActivityIndicator, TouchableOpacity, TextInput, Alert, Image, Modal, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import CourseServicesMobile, { Module, Lesson } from '../services/courses';
import QuestionnaireServicesMobile, { Questionnaire } from '../services/questionnaires';
import CommentsService, { Comment } from '../services/comments';
import WatchLaterService from '../services/watchLater';
import FavoritesService from '../services/favorites';
import PlaylistsService, { Playlist } from '../services/playlists';

type DetailTab = 'conteudo' | 'questionarios' | 'certificado';

export default function CourseDetailScreen({ route }: any) {
    const { course } = route.params;
    const { user, userData } = useAuth();
    const navigation = useNavigation<any>();

    const [modules, setModules] = useState<(Module & { lessons?: Lesson[] })[]>([]);
    const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedModule, setExpandedModule] = useState<string | null>(null);
    const [tab, setTab] = useState<DetailTab>('conteudo');
    const [newComment, setNewComment] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [isWatchLater, setIsWatchLater] = useState(false);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);
    const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
    const [editingText, setEditingText] = useState('');
    const [showCommentModal, setShowCommentModal] = useState(false);

    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        if (!user) return;
        const [modulesRes, questRes, commentsRes, favIds, watchIds, playlistsRes] = await Promise.all([
            CourseServicesMobile.getModules(course.id),
            QuestionnaireServicesMobile.getByCourse(course.id),
            CommentsService.getByCourse(course.id),
            FavoritesService.getByUser(user.uid),
            WatchLaterService.getByUser(user.uid),
            PlaylistsService.getByUser(user.uid),
        ]);

        if (modulesRes.success && modulesRes.modules) {
            const withLessons = await Promise.all(
                modulesRes.modules.map(async (mod) => {
                    const lessonsRes = await CourseServicesMobile.getLessons(course.id, mod.id);
                    return { ...mod, lessons: lessonsRes.lessons ?? [] };
                })
            );
            setModules(withLessons);
        }
        if (questRes.success && questRes.questionnaires) setQuestionnaires(questRes.questionnaires);
        setComments(commentsRes);
        setIsFavorite(favIds.includes(course.id));
        setIsWatchLater(watchIds.includes(course.id));
        setPlaylists(playlistsRes);
        setLoading(false);
    };

    const handleToggleFavorite = async () => {
        if (!user) return;
        const result = await FavoritesService.toggle(user.uid, course.id);
        setIsFavorite(result);
    };

    const handleToggleWatchLater = async () => {
        if (!user) return;
        const result = await WatchLaterService.toggle(user.uid, course.id);
        setIsWatchLater(result);
        Alert.alert(result ? 'Adicionado' : 'Removido',
            result ? 'Curso salvo para assistir mais tarde.' : 'Curso removido da lista.');
    };

    const handleAddComment = async () => {
        if (!user || !newComment.trim()) return;
        const success = await CommentsService.add({
            userId: user.uid,
            userName: userData?.name ?? 'Usuário',
            userPhoto: userData?.photoURL,
            courseId: course.id,
            text: newComment.trim(),
            createdAt: new Date().toISOString(),
        });
        if (success) {
            setNewComment('');
            const updated = await CommentsService.getByCourse(course.id);
            setComments(updated);
        }
    };

    const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0);
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <ScrollView contentContainerStyle={styles.container} bounces={false} keyboardShouldPersistTaps="handled">
                {/* BANNER */}
                <View style={styles.banner}>
                    {course.coverImage ? (
                        <Image source={{ uri: course.coverImage }} style={styles.bannerImage} resizeMode="cover" />
                    ) : (
                        <View style={styles.bannerPlaceholder}>
                            <Ionicons name="book" size={40} color="#fff" />
                        </View>
                    )}
                    <View style={styles.bannerOverlay}>
                        <Text style={styles.bannerTitle}>{course.title}</Text>
                        <Text style={styles.bannerDesc} numberOfLines={2}>{course.description}</Text>
                        <Text style={styles.bannerAuthor}>Criado por: {course.authorName}</Text>
                        <View style={styles.bannerMeta}>
                            <View style={styles.bannerMetaItem}>
                                <Ionicons name="layers-outline" size={14} color="#fff" />
                                <Text style={styles.bannerMetaText}>{modules.length} tópicos</Text>
                            </View>
                            <View style={styles.bannerMetaItem}>
                                <Ionicons name="time-outline" size={14} color="#fff" />
                                <Text style={styles.bannerMetaText}>{course.duration}h</Text>
                            </View>
                        </View>
                        <View style={[styles.typeBadge, course.verified ? styles.typeBadgeOfficial : styles.typeBadgeCommunity]}>
                            <Text style={styles.typeBadgeText}>
                                {course.verified ? 'Curso Oficial' : 'Curso da Comunidade'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ACTION BUTTONS */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionBtn} onPress={handleToggleFavorite}>
                        <Ionicons name={isFavorite ? 'star' : 'star-outline'} size={22} color="#D4A017" />
                        <Text style={styles.actionText}>{isFavorite ? 'Favoritado' : 'Favoritar'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={handleToggleWatchLater}>
                        <Ionicons name={isWatchLater ? 'bookmark' : 'bookmark-outline'} size={22} color="#2563EB" />
                        <Text style={styles.actionText}>{isWatchLater ? 'Salvo' : 'Assistir depois'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => setShowPlaylistPicker(true)}>
                        <Ionicons name="add-circle-outline" size={22} color="#0D9488" />
                        <Text style={styles.actionText}>Playlist</Text>
                    </TouchableOpacity>
                </View>

                {/* TABS */}
                <View style={styles.tabContainer}>
                    {(['conteudo', 'questionarios', 'certificado'] as DetailTab[]).map(t => (
                        <TouchableOpacity key={t} style={styles.tab} onPress={() => setTab(t)}>
                            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                                {t === 'conteudo' ? 'Conteúdo' : t === 'questionarios' ? 'Questionários' : 'Certificado'}
                            </Text>
                            {tab === t && <View style={styles.tabBar} />}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* TAB: CONTEÚDO */}
                {tab === 'conteudo' && (
                    <View style={styles.section}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 20 }} />
                        ) : modules.length === 0 ? (
                            <View style={styles.emptyCard}>
                                <Text style={styles.emptyText}>Nenhum módulo disponível.</Text>
                            </View>
                        ) : (
                            modules.map((mod, index) => (
                                <View key={mod.id} style={styles.moduleCard}>
                                    <TouchableOpacity style={styles.moduleHeader}
                                        onPress={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}>
                                        <Text style={styles.moduleTitle}>Tópico {index + 1}: {mod.title}</Text>
                                        <Ionicons name={expandedModule === mod.id ? 'chevron-up' : 'chevron-down'} size={20} color="#666" />
                                    </TouchableOpacity>
                                    {expandedModule === mod.id && mod.lessons && (
                                        <View style={styles.lessonsContainer}>
                                            {mod.lessons.map((lesson) => (
                                                <TouchableOpacity key={lesson.id} style={styles.lessonItem}
                                                    onPress={() => navigation.navigate('Lesson', { lesson, course })}>
                                                    <Ionicons name={lesson.videoURL ? 'play-circle' : 'document-text-outline'} size={18} color="#2563EB" />
                                                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                                                    {lesson.duration > 0 && <Text style={styles.lessonDuration}>{lesson.duration} min</Text>}
                                                </TouchableOpacity>
                                            ))}
                                            {mod.lessons.length === 0 && <Text style={styles.noLessons}>Nenhuma aula neste módulo.</Text>}
                                        </View>
                                    )}
                                </View>
                            ))
                        )}
                    </View>
                )}

                {/* TAB: QUESTIONÁRIOS */}
                {tab === 'questionarios' && (
                    <View style={styles.section}>
                        {questionnaires.length === 0 ? (
                            <View style={styles.emptyCard}>
                                <Text style={styles.emptyText}>Nenhum questionário disponível.</Text>
                            </View>
                        ) : (
                            questionnaires.map((q) => (
                                <TouchableOpacity key={q.id} style={styles.quizCard}
                                    onPress={() => navigation.navigate('Quiz', { questionnaire: q })}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.quizTitle}>{q.title}</Text>
                                        <Text style={styles.quizType}>
                                            {q.type === 'pre_content' ? 'Nivelamento' : q.type === 'post_content' ? 'Avaliação final' : 'Geral'}
                                        </Text>
                                    </View>
                                    <Ionicons name="play-circle" size={28} color="#2563EB" />
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                )}

                {/* TAB: CERTIFICADO */}
                {tab === 'certificado' && (
                    <View style={styles.section}>
                        <View style={styles.certCard}>
                            <Ionicons
                                name={course.hasCertificate ? 'ribbon' : 'ribbon-outline'}
                                size={40}
                                color={course.hasCertificate ? '#D4A017' : '#ccc'}
                            />
                            <Text style={styles.certTitle}>Certificado</Text>
                            {course.hasCertificate ? (
                                <Text style={styles.certDesc}>
                                    Conclua o curso e seja aprovado na avaliação final para receber seu certificado digital.
                                </Text>
                            ) : (
                                <Text style={styles.certDesc}>
                                    Este curso <Text style={styles.certBold}>NÃO</Text> oferece certificado.
                                </Text>
                            )}
                        </View>
                    </View>
                )}

                {/* COMENTÁRIOS */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Comentários ({comments.length})</Text>

                    {comments.map((c) => (
                        <TouchableOpacity
                            key={c.id}
                            style={styles.commentItem}
                            onLongPress={() => {
                                if (c.userId === user?.uid) {
                                    setSelectedComment(c);
                                    setEditingText(c.text);
                                    setShowCommentModal(true);
                                }
                            }}
                            activeOpacity={c.userId === user?.uid ? 0.7 : 1}
                        >
                            <View style={styles.commentAvatar}>
                                {c.userPhoto ? (
                                    <Image source={{ uri: c.userPhoto }} style={styles.commentAvatarImg} />
                                ) : (
                                    <Text style={styles.commentAvatarText}>{c.userName.charAt(0)}</Text>
                                )}
                            </View>
                            <View style={styles.commentContent}>
                                <View style={styles.commentHeaderRow}>
                                    <Text style={styles.commentAuthor}>{c.userName}</Text>
                                    {c.userId === user?.uid && (
                                        <Text style={styles.commentOwnerHint}>Segure para editar</Text>
                                    )}
                                </View>
                                <Text style={styles.commentText}>{c.text}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}

                    <Text style={styles.commentLabel}>Sua Mensagem</Text>
                    <TextInput
                        style={styles.commentInput}
                        placeholder="O que você achou deste tópico?"
                        placeholderTextColor="#aaa"
                        multiline
                        value={newComment}
                        onChangeText={setNewComment}
                    />
                    <TouchableOpacity style={styles.commentBtn} onPress={handleAddComment}>
                        <Text style={styles.commentBtnText}>Adicionar comentário</Text>
                    </TouchableOpacity>
                </View>

                {/* MODAL EDITAR/EXCLUIR COMENTÁRIO */}
                    <Modal visible={showCommentModal} transparent animationType="fade">
                        <View style={styles.commentModalOverlay}>
                            <View style={styles.commentModalCard}>
                                <Text style={styles.commentModalTitle}>Editar comentário</Text>
                                <TextInput
                                    style={styles.commentModalInput}
                                    value={editingText}
                                    onChangeText={setEditingText}
                                    multiline
                                    autoFocus
                                    placeholderTextColor="#aaa"
                                />
                                <View style={styles.commentModalButtons}>
                                    <TouchableOpacity
                                        style={styles.commentModalDelete}
                                        onPress={() => {
                                            Alert.alert('Excluir comentário?', 'Esta ação não pode ser desfeita.', [
                                                { text: 'Cancelar', style: 'cancel' },
                                                {
                                                    text: 'Excluir',
                                                    style: 'destructive',
                                                    onPress: async () => {
                                                        if (selectedComment?.id) {
                                                            await CommentsService.delete(selectedComment.id);
                                                            setComments(prev => prev.filter(c => c.id !== selectedComment.id));
                                                            setShowCommentModal(false);
                                                            setSelectedComment(null);
                                                        }
                                                    },
                                                },
                                            ]);
                                        }}>
                                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.commentModalCancel}
                                        onPress={() => { setShowCommentModal(false); setSelectedComment(null); }}>
                                        <Text style={styles.commentModalCancelText}>Cancelar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.commentModalSave}
                                        onPress={async () => {
                                            if (!editingText.trim() || !selectedComment?.id) return;
                                            await CommentsService.update(selectedComment.id, editingText.trim());
                                            setComments(prev => prev.map(c =>
                                                c.id === selectedComment.id ? { ...c, text: editingText.trim() } : c
                                            ));
                                            setShowCommentModal(false);
                                            setSelectedComment(null);
                                        }}>
                                        <Text style={styles.commentModalSaveText}>Salvar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                
                {/* MODAL ADICIONAR À PLAYLIST */}
                <Modal visible={showPlaylistPicker} transparent animationType="fade">
                    <View style={styles.playlistModalOverlay}>
                        <View style={styles.playlistModalCard}>
                            <Text style={styles.playlistModalTitle}>Adicionar à Playlist</Text>
                            {playlists.length === 0 ? (
                                <Text style={styles.playlistModalEmpty}>Nenhuma playlist criada ainda.</Text>
                            ) : (
                                playlists.map((pl) => {
                                    const alreadyAdded = pl.courseIds?.includes(course.id);
                                    return (
                                        <TouchableOpacity key={pl.id} style={styles.playlistModalItem}
                                            onPress={async () => {
                                                if (!pl.id) return;
                                                const newIds = alreadyAdded
                                                    ? (pl.courseIds ?? []).filter((id: string) => id !== course.id)
                                                    : [...(pl.courseIds ?? []), course.id];
                                                await PlaylistsService.addCourse(pl.id, newIds);
                                                // Atualiza playlists locais
                                                setPlaylists(prev => prev.map(p =>
                                                    p.id === pl.id ? { ...p, courseIds: newIds } : p
                                                ));
                                                Alert.alert(
                                                    alreadyAdded ? 'Removido' : 'Adicionado',
                                                    alreadyAdded ? `Curso removido de "${pl.name}".` : `Curso adicionado à "${pl.name}".`
                                                );
                                            }}>
                                            <Ionicons
                                                name={alreadyAdded ? 'checkmark-circle' : 'add-circle-outline'}
                                                size={22}
                                                color={alreadyAdded ? '#0D9488' : '#2563EB'}
                                            />
                                            <Text style={styles.playlistModalItemText}>{pl.name}</Text>
                                            {alreadyAdded && <Text style={styles.playlistModalAdded}>Adicionado</Text>}
                                        </TouchableOpacity>
                                    );
                                })
                            )}
                            <TouchableOpacity style={styles.playlistModalClose}
                                onPress={() => setShowPlaylistPicker(false)}>
                                <Text style={styles.playlistModalCloseText}>Fechar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
    </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#F0F4F8' },

    // BANNER
    banner: { height: 260, position: 'relative' },
    bannerImage: { width: '100%',  height: '100%', resizeMode: 'cover' },
    bannerPlaceholder: { width: '100%', height: '100%', backgroundColor: '#0A1628', justifyContent: 'center', alignItems: 'center' },
    bannerOverlay: { position: 'absolute',top: 0, bottom: 0, left: 0, right: 0, padding: 16, paddingTop: 50, justifyContent: 'flex-end', backgroundColor: 'rgba(10,22,40,0.5)' },
    bannerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
    bannerDesc: { fontSize: 12, color: '#ccc', marginBottom: 4 },
    bannerAuthor: { fontSize: 12, color: '#B0BEC5', marginBottom: 8 },
    bannerMeta: { flexDirection: 'row', gap: 16, marginBottom: 8 },
    bannerMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    bannerMetaText: { fontSize: 12, color: '#fff' },
    typeBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    typeBadgeOfficial: { backgroundColor: '#2563EB' },
    typeBadgeCommunity: { backgroundColor: '#D4A017' },
    typeBadgeText: { fontSize: 11, fontWeight: '600', color: '#fff' },

    // ACTIONS
    actionRow: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 20, gap: 24 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    actionText: { fontSize: 13, color: '#555', fontWeight: '500' },

    // TABS
    tabContainer: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
    tab: { marginRight: 20, paddingVertical: 12, alignItems: 'center' },
    tabText: { fontSize: 14, color: '#999', fontWeight: '500' },
    tabTextActive: { color: '#2563EB', fontWeight: '700' },
    tabBar: { width: '100%', height: 3, backgroundColor: '#2563EB', borderRadius: 2, marginTop: 4 },

    // SECTION
    section: { padding: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0A1628', marginBottom: 12 },

    // MODULES
    moduleCard: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 8, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
    moduleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
    moduleTitle: { fontSize: 14, fontWeight: '600', color: '#0A1628', flex: 1 },
    lessonsContainer: { paddingHorizontal: 14, paddingBottom: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    lessonItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
    lessonTitle: { flex: 1, fontSize: 13, color: '#333' },
    lessonDuration: { fontSize: 12, color: '#999' },
    noLessons: { fontSize: 13, color: '#999', paddingVertical: 10 },

    // QUIZ
    quizCard: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#2563EB', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
    quizTitle: { fontSize: 14, fontWeight: '600', color: '#0A1628' },
    quizType: { fontSize: 12, color: '#2563EB', marginTop: 2 },

    // CERTIFICATE
    certCard: { backgroundColor: '#fff', borderRadius: 14, padding: 24, alignItems: 'center', gap: 8 },
    certTitle: { fontSize: 18, fontWeight: '700', color: '#0A1628' },
    certDesc: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },
    certBold: { fontWeight: 'bold', color: '#ef4444' },

    // COMMENTS
    commentItem: { flexDirection: 'row', marginBottom: 14, gap: 10 },
    commentAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center' },
    commentAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    commentContent: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 10 },
    commentAuthor: { fontSize: 13, fontWeight: '700', color: '#0A1628', marginBottom: 2 },
    commentText: { fontSize: 13, color: '#555', lineHeight: 18 },
    commentLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 8, marginBottom: 6 },
    commentInput: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#ddd', padding: 12, height: 80, fontSize: 14, color: '#333', textAlignVertical: 'top', marginBottom: 10 },
    commentBtn: { backgroundColor: '#0A1628', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
    commentBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    commentHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
    commentOwnerHint: { fontSize: 10, color: '#bbb', fontStyle: 'italic' },
    commentModalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center', padding: 24,
    },
    commentModalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '100%' },
    commentModalTitle: { fontSize: 18, fontWeight: '700', color: '#0A1628', marginBottom: 12 },
    commentModalInput: {
        borderWidth: 1, borderColor: '#ddd', borderRadius: 10, backgroundColor: '#fafafa',
        padding: 12, minHeight: 80, fontSize: 14, color: '#333',
        textAlignVertical: 'top', marginBottom: 16,
    },
    commentModalButtons: { flexDirection: 'row', alignItems: 'center' },
    commentModalDelete: { padding: 8, marginRight: 'auto' },
    commentModalCancel: { paddingVertical: 10, paddingHorizontal: 16 },
    commentModalCancelText: { color: '#999', fontSize: 15, fontWeight: '600' },
    commentModalSave: { backgroundColor: '#2563EB', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
    commentModalSaveText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    commentAvatarImg: { width: 36, height: 36, borderRadius: 18 },

    // EMPTY
    emptyCard: { backgroundColor: '#fff', borderRadius: 10, padding: 20, alignItems: 'center' },
    emptyText: { fontSize: 14, color: '#888' },

    // PLAYLIST MODAL
    playlistModalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center', padding: 24,
    },
    playlistModalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '100%' },
    playlistModalTitle: { fontSize: 18, fontWeight: '700', color: '#0A1628', marginBottom: 16 },
    playlistModalEmpty: { fontSize: 14, color: '#999', textAlign: 'center', paddingVertical: 20 },
    playlistModalItem: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    },
    playlistModalItemText: { flex: 1, fontSize: 15, color: '#333' },
    playlistModalAdded: { fontSize: 12, color: '#0D9488', fontWeight: '600' },
    playlistModalClose: { paddingVertical: 14, alignItems: 'center', marginTop: 8 },
    playlistModalCloseText: { fontSize: 15, color: '#2563EB', fontWeight: '600' },
}) as any;