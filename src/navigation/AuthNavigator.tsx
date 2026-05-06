import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import EsqueciSenhaScreen from '../screens/EsqueciSenhaScreen';
import CadastroTipoScreen from '../screens/CadastroTipoScreen';
import CadastroAlunoScreen from '../screens/CadastroAlunoScreen';
import CadastroMedicoScreen from '../screens/CadastroMedicoScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
                headerStyle: { backgroundColor: '#4703D0' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="EsqueciSenha" component={EsqueciSenhaScreen} options={{ title: 'Recuperar senha' }} />
            <Stack.Screen name="CadastroTipo" component={CadastroTipoScreen} options={{ title: 'Criar conta' }} />
            <Stack.Screen name="CadastroAluno" component={CadastroAlunoScreen} options={{ title: 'Cadastro de Aluno' }} />
            <Stack.Screen name="CadastroMedico" component={CadastroMedicoScreen} options={{ title: 'Cadastro de Médico' }} />
        </Stack.Navigator>
    );
}