import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import CadastroTipoScreen from './src/screens/CadastroTipoScreen';
import CadastroAlunoScreen from './src/screens/CadastroAlunoScreen';
import CadastroMedicoScreen from './src/screens/CadastroMedicoScreen';
import EsqueciSenhaScreen from './src/screens/EsqueciSenhaScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerStyle: { backgroundColor: '#4703D0' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            >
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="EsqueciSenha"
                    component={EsqueciSenhaScreen}
                    options={{ title: 'Recuperar senha' }}
                />
                <Stack.Screen
                    name="CadastroTipo"
                    component={CadastroTipoScreen}
                    options={{ title: 'Criar conta' }}
                />
                <Stack.Screen
                    name="CadastroAluno"
                    component={CadastroAlunoScreen}
                    options={{ title: 'Cadastro de Aluno' }}
                />
                <Stack.Screen
                    name="CadastroMedico"
                    component={CadastroMedicoScreen}
                    options={{ title: 'Cadastro de Médico' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}