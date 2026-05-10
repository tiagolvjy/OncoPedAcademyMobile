import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/ProfileScreen';
import CertificatesScreen from '../screens/CertificatesScreen';
import QuizHistoryScreen from '../screens/QuizHistoryScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

const Stack = createNativeStackNavigator();

export default function ProfileNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: '#0A1628' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            <Stack.Screen
                name="ProfileMain"
                component={ProfileScreen}
                options={{ headerShown: false, title: 'Perfil' }}
            />
            <Stack.Screen
                name="Certificates"
                component={CertificatesScreen}
                options={{ title: 'Meus Certificados' }}
            />
            <Stack.Screen
                name="QuizHistory"
                component={QuizHistoryScreen}
                options={{ title: 'Histórico de Questionários' }}
            />
            <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ title: 'Editar Perfil' }}
            />
        </Stack.Navigator>
    );
}