import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, TextInput, Alert, ActivityIndicator,
    KeyboardAvoidingView, Platform, Image, Modal,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import CommentsService, { Comment } from '../services/comments';
import WatchLaterService from '../services/watchLater';

export default function LessonScreen({ route }: any) {
    const { lesson, course } = route.params;
    const { user, userData } = useAuth();
    const videoRef = useRef<Video>(null);

    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isWatchLater, setIsWatchLater] = useState(false);
    const [loadingComments, setLoadingComments] = useState(true);
    const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
    const [editingText, setEditingText] = useState('');
    const [showCommentModal, setShowCommentModal] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!user) return;
        const [commentsRes, watchIds] = await Promise.all([
            CommentsService.getByCourse(course.id),
            WatchLaterService.getByUser(user.uid),
        ]);
        setComments(commentsRes);
        setIsWatchLater(watchIds.includes(course.id));
        setLoadingComments(false);
    };

    const handleToggleWatchLater = async () => {
        if (!user) return;
        const result = await WatchLaterService.toggle(user.uid, course.id);
        setIsWatchLater(result);
        Alert.alert(
            result ? 'Adicionado' : 'Removido',
            result ? 'Salvo para assistir mais tarde.' : 'Removido da lista.'
        );
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

    const getTimeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins} min atrás`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
        const days = Math.floor(hours / 24);
        if (days === 1) return 'Ontem';
        return `${days} dias atrás`;
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.container} bounces={false} keyboardShouldPersistTaps="handled">
                {/* VIDEO PLAYER */}
                {lesson.videoURL ? (
                    <Video
                        ref={videoRef}
                        source={{ uri: lesson.videoURL }}
                        style={styles.video}
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                        shouldPlay={false}
                    />
                ) : (
                    <View style={styles.noVideo}>
                        <Ionicons name="videocam-off-outline" size={48} color="#999" />
                        <Text style={styles.noVideoText}>Vídeo não disponível</Text>
                    </View>
                )}

                {/* LESSON INFO */}
                <View style={styles.infoSection}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    {lesson.duration > 0 && (
                        <View style={styles.durationRow}>
                            <Ionicons name="time-outline" size={14} color="#888" />
                            <Text style={styles.durationText}>{lesson.duration} minutos</Text>
                        </View>
                    )}
                </View>

                {/* ASSISTIR MAIS TARDE */}
                <View style={styles.watchLaterCard}>
                    <Ionicons name="bookmark-outline" size={22} color="#2563EB" />
                    <View style={styles.watchLaterContent}>
                        <Text style={styles.watchLaterTitle}>Assistir mais tarde</Text>
                        <Text style={styles.watchLaterDesc}>
                            Não pode ver agora? Guarde este vídeo na sua lista para assistir com calma depois.
                        </Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.watchLaterBtn} onPress={handleToggleWatchLater}>
                    <Text style={styles.watchLaterBtnText}>
                        {isWatchLater ? 'Remover da lista' : 'Adicionar à lista'}
                    </Text>
                </TouchableOpacity>

                {/* COMENTÁRIOS */}
                <View style={styles.commentsSection}>
                    <View style={styles.commentsHeader}>
                        <Ionicons name="chatbubbles-outline" size={18} color="#0A1628" />
                        <Text style={styles.commentsTitle}>Comentários ({comments.length})</Text>
                    </View>

                    {loadingComments ? (
                        <ActivityIndicator color="#2563EB" style={{ marginTop: 12 }} />
                    ) : (
                        comments.map((c) => (
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
                                        <Text style={styles.commentAvatarText}>
                                            {c.userName.charAt(0).toUpperCase()}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.commentContent}>
                                    <View style={styles.commentHeaderRow}>
                                        <Text style={styles.commentAuthor}>{c.userName}</Text>
                                        <Text style={styles.commentTime}>• {getTimeAgo(c.createdAt)}</Text>
                                    </View>
                                    <Text style={styles.commentText}>{c.text}</Text>
                                    {c.userId === user?.uid && (
                                        <Text style={styles.commentOwnerHint}>Segure para editar</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))
                    )}

                    <Text style={styles.inputLabel}>Sua Mensagem</Text>
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
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#F0F4F8' },
    video: { width: '100%', height: 220, backgroundColor: '#000' },
    noVideo: {
        width: '100%', height: 220, backgroundColor: '#172F50',
        justifyContent: 'center', alignItems: 'center', gap: 8,
    },
    noVideoText: { fontSize: 14, color: '#999' },
    infoSection: { padding: 20, backgroundColor: '#fff' },
    lessonTitle: { fontSize: 20, fontWeight: 'bold', color: '#0A1628', marginBottom: 6 },
    durationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    durationText: { fontSize: 13, color: '#888' },
    watchLaterCard: {
        flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16,
        marginTop: 16, borderRadius: 12, padding: 16, gap: 12,
        borderWidth: 1, borderColor: '#eee',
    },
    watchLaterContent: { flex: 1 },
    watchLaterTitle: { fontSize: 15, fontWeight: '700', color: '#0A1628', marginBottom: 4 },
    watchLaterDesc: { fontSize: 12, color: '#888', lineHeight: 18 },
    watchLaterBtn: {
        alignSelf: 'flex-start', marginLeft: 16, marginTop: 10,
        borderWidth: 2, borderColor: '#2563EB', borderRadius: 20,
        paddingHorizontal: 20, paddingVertical: 8,
    },
    watchLaterBtnText: { color: '#2563EB', fontWeight: '600', fontSize: 13 },
    commentsSection: { padding: 16, marginTop: 16 },
    commentsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
    commentsTitle: { fontSize: 16, fontWeight: '700', color: '#0A1628' },
    commentItem: { flexDirection: 'row', marginBottom: 16, gap: 10 },
    commentAvatar: {
        width: 38, height: 38, borderRadius: 19, backgroundColor: '#2563EB',
        justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
    },
    commentAvatarImg: { width: 38, height: 38, borderRadius: 19 },
    commentAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    commentContent: { flex: 1 },
    commentHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    commentAuthor: { fontSize: 14, fontWeight: '700', color: '#0A1628' },
    commentTime: { fontSize: 12, color: '#999' },
    commentText: { fontSize: 13, color: '#555', lineHeight: 20 },
    commentOwnerHint: { fontSize: 10, color: '#bbb', fontStyle: 'italic', marginTop: 4 },
    replyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
    replyText: { fontSize: 12, color: '#2563EB', fontWeight: '600' },
    inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 8, marginBottom: 6 },
    commentInput: {
        backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#ddd',
        padding: 12, height: 80, fontSize: 14, color: '#333', textAlignVertical: 'top', marginBottom: 10,
    },
    commentBtn: {
        backgroundColor: '#0A1628', borderRadius: 8, paddingVertical: 12,
        alignItems: 'center', marginBottom: 20,
    },
    commentBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
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
}) as any;