import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen({ navigation }: any) {

    useEffect(() => {
        const timer = setTimeout(async () => {
            const seen = await AsyncStorage.getItem('@onboarding_done');
            if (seen) {
                navigation.replace('Login');
            } else {
                navigation.replace('Onboarding');
            }
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <LinearGradient
            colors={['#0D2137', '#172F50', '#1A3A5C']}
            style={styles.container}
        >
            <Image
                source={require('../../assets/logoOncoPedAcademy.png')}
                style={styles.logo}
                resizeMode="contain"
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 260,
        height: 200,
    },
});