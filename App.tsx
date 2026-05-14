import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import TabNavigator from './src/navigation/TabNavigator';


if (typeof AbortSignal.any === 'undefined') {
    // @ts-ignore
    AbortSignal.any = function (signals: AbortSignal[]): AbortSignal {
        const controller = new AbortController();
        for (const signal of signals) {
            if (signal.aborted) {
                controller.abort();
                return controller.signal;
            }
        }
        const abortHandler = () => controller.abort();
        for (const signal of signals) {
            signal.addEventListener('abort', abortHandler);
        }
        return controller.signal;
    };
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