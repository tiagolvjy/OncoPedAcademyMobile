import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import CoursesNavigator from './CoursesNavigator';
import AIScreen from '../screens/AIScreen';
import ProfileNavigator from './ProfileNavigator';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerStyle: { backgroundColor: '#0A1628' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
                tabBarActiveTintColor: '#2563EB',
                tabBarInactiveTintColor: '#999',
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#eee',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 4,
                },
                tabBarIcon: ({ color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';
                    if (route.name === 'Início') iconName = 'home';
                    else if (route.name === 'Cursos') iconName = 'book';
                    else if (route.name === 'IA Dicas') iconName = 'bulb';
                    else if (route.name === 'Perfil') iconName = 'person';
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Início" component={HomeScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Cursos" component={CoursesNavigator} options={{ headerShown: false }} />
            <Tab.Screen name="IA Dicas" component={AIScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Perfil" component={ProfileNavigator} options={{ headerShown: false }} />
        </Tab.Navigator>
    );
} 