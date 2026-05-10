import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import EsqueciSenhaScreen from '../screens/EsqueciSenhaScreen';
import CadastroTipoScreen from '../screens/CadastroTipoScreen';
import CadastroAlunoScreen from '../screens/CadastroAlunoScreen';
import CadastroMedicoScreen from '../screens/CadastroMedicoScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
                headerStyle: { backgroundColor: '#172F50' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="EsqueciSenha" component={EsqueciSenhaScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CadastroTipo" component={CadastroTipoScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CadastroAluno" component={CadastroAlunoScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CadastroMedico" component={CadastroMedicoScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}