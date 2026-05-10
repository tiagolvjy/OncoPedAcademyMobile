import React, { useRef, useState } from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity,
    FlatList, Dimensions, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        image: require('../../assets/logoOncoPedAcademy.png'),
        title: 'Aprenda\nOncologia Pediátrica',
        subtitle: 'Conteúdos especializados para estudantes e profissionais da saúde.',
    },
    {
        id: '2',
        image: require('../../assets/medico.png'),
        title: 'Cursos com\nespecialistas',
        subtitle: 'Aprenda com profissionais experientes e atualize seus conhecimentos.',
    },
    {
        id: '3',
        image: require('../../assets/clipboard.png'),
        title: 'Comece sua\njornada',
        subtitle: 'Cadastre-se ou entre para acessar conteúdos exclusivos e transformar seu futuro na oncologia pediátrica.',
        isCTA: true,
    },
];

export default function OnboardingScreen({ navigation }: any) {
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    const finishOnboarding = async (route: string) => {
        await AsyncStorage.setItem('@onboarding_done', 'true');
        navigation.replace(route);
    };

    const handleSkip = () => {
        finishOnboarding('Login');
    };

    const renderSlide = ({ item }: any) => (
        <View style={styles.slide}>
            {/* IMAGEM */}
            <View style={styles.imageCard}>
                <Image
                    source={item.image}
                    style={item.id === '1' ? styles.logoImage : styles.slideImage}
                    resizeMode="contain"
                />
            </View>

            {/* TEXTO */}
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>

            {/* CTA NO ÚLTIMO SLIDE */}
            {item.isCTA && (
                <View style={styles.ctaContainer}>
                    <TouchableOpacity
                        style={styles.ctaButtonPrimary}
                        onPress={() => finishOnboarding('CadastroAluno')}
                    >
                        <Text style={styles.ctaTextPrimary}>Sou Aluno</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.ctaButtonSecondary}
                        onPress={() => finishOnboarding('CadastroMedico')}
                    >
                        <Text style={styles.ctaTextSecondary}>Sou Médico</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <LinearGradient
            colors={['#C8DFF5', '#D6E8F7', '#E4F0FA']}
            style={styles.container}
        >
            {/* PULAR */}
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Pular</Text>
            </TouchableOpacity>

            {/* SLIDES */}
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            />

            {/* DOTS */}
            <View style={styles.dotsContainer}>
                {slides.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            currentIndex === index && styles.dotActive,
                        ]}
                    />
                ))}
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    skipButton: {
        position: 'absolute',
        top: 56,
        right: 24,
        zIndex: 10,
    },
    skipText: {
        fontSize: 16,
        color: '#172F50',
        fontWeight: '600',
    },
    slide: {
        width,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingTop: 80,
    },
    imageCard: {
        backgroundColor: '#f7f7f7',
        borderRadius: 20,
        padding: 24,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
        alignItems: 'center',
        justifyContent: 'center',
        width: 300,
        height: 240,
    },
    logoImage: {
        width: 240,
        height: 190,
    },
    slideImage: {
        width: 260,
        height: 210,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0A1628',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 36,
    },
    subtitle: {
        fontSize: 15,
        color: '#555',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 10,
    },
    ctaContainer: {
        width: '100%',
        marginTop: 32,
        gap: 12,
    },
    ctaButtonPrimary: {
        backgroundColor: '#2563EB',
        borderRadius: 25,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaTextPrimary: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
    },
    ctaButtonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#2563EB',
        borderRadius: 25,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaTextSecondary: {
        color: '#2563EB',
        fontSize: 17,
        fontWeight: 'bold',
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        paddingBottom: 50,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#bbb',
    },
    dotActive: {
        backgroundColor: '#172F50',
        width: 12,
        height: 12,
        borderRadius: 6,
    },
});