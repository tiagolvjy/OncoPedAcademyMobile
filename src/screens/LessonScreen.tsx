import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, TextInput, Alert, ActivityIndicator,
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
        <ScrollView contentContainerStyle={styles.container} bounces={false}>
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
                        <View key={c.id} style={styles.commentItem}>
                            <View style={styles.commentAvatar}>
                                <Text style={styles.commentAvatarText}>
                                    {c.userName.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.commentContent}>
                                <View style={styles.commentHeaderRow}>
                                    <Text style={styles.commentAuthor}>{c.userName}</Text>
                                    <Text style={styles.commentTime}>• {getTimeAgo(c.createdAt)}</Text>
                                </View>
                                <Text style={styles.commentText}>{c.text}</Text>
                                <TouchableOpacity style={styles.replyBtn}>
                                    <Ionicons name="return-down-forward-outline" size={14} color="#2563EB" />
                                    <Text style={styles.replyText}>Responder</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
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
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#F0F4F8' },

    // VIDEO
    video: { width: '100%', height: 220, backgroundColor: '#000' },
    noVideo: {
        width: '100%', height: 220, backgroundColor: '#172F50',
        justifyContent: 'center', alignItems: 'center', gap: 8,
    },
    noVideoText: { fontSize: 14, color: '#999' },

    // INFO
    infoSection: { padding: 20, backgroundColor: '#fff' },
    lessonTitle: { fontSize: 20, fontWeight: 'bold', color: '#0A1628', marginBottom: 6 },
    durationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    durationText: { fontSize: 13, color: '#888' },

    // WATCH LATER
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

    // COMMENTS
    commentsSection: { padding: 16, marginTop: 16 },
    commentsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
    commentsTitle: { fontSize: 16, fontWeight: '700', color: '#0A1628' },
    commentItem: { flexDirection: 'row', marginBottom: 16, gap: 10 },
    commentAvatar: {
        width: 38, height: 38, borderRadius: 19, backgroundColor: '#2563EB',
        justifyContent: 'center', alignItems: 'center',
    },
    commentAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    commentContent: { flex: 1 },
    commentHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    commentAuthor: { fontSize: 14, fontWeight: '700', color: '#0A1628' },
    commentTime: { fontSize: 12, color: '#999' },
    commentText: { fontSize: 13, color: '#555', lineHeight: 20 },
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
});