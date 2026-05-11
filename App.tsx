import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import TabNavigator from './src/navigation/TabNavigator';

// ExecuTorch init com fallback
try {
    const { initExecutorch } = require('react-native-executorch');
    const { ExpoResourceFetcher } = require('react-native-executorch-expo-resource-fetcher');
    initExecutorch({ resourceFetcher: ExpoResourceFetcher });
    console.log('ExecuTorch inicializado com sucesso');
} catch (error) {
    console.warn('ExecuTorch não disponível (Expo Go). IA offline desabilitada.');
}

function RootNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1628' }}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return user ? <TabNavigator /> : <AuthNavigator />;
}

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <RootNavigator />
            </NavigationContainer>
        </AuthProvider>
    );
}