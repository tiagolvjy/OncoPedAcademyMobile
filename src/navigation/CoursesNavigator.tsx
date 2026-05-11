import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CoursesScreen from '../screens/CoursesScreen';
import CourseDetailScreen from '../screens/CourseDetailScreen';
import QuizScreen from '../screens/QuizScreen';
import LessonScreen from '../screens/LessonScreen';
import WatchLaterListScreen from '../screens/WatchLaterListScreen';

const Stack = createNativeStackNavigator();

export default function CoursesNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: '#0A1628' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            <Stack.Screen
                name="CoursesList"
                component={CoursesScreen}
                options={{ headerShown: false, title: 'Cursos' }}
            />
            <Stack.Screen
                name="CourseDetail"
                component={CourseDetailScreen}
                options={{
                    title: '',
                    headerTransparent: true,
                    headerTintColor: '#fff',
                    headerStyle: { backgroundColor: 'transparent' },
                    headerShadowVisible: false,
                }}
            />
            <Stack.Screen
                name="Lesson"
                component={LessonScreen}
                options={({ route }: any) => ({
                    title: route.params?.lesson?.title ?? 'Aula',
                })}
            />
            <Stack.Screen
                name="Quiz"
                component={QuizScreen}
                options={({ route }: any) => ({
                    title: route.params?.questionnaire?.title ?? 'Questionário',
                    headerBackVisible: false,
                    gestureEnabled: false,
                })}
            />
            <Stack.Screen
                name="WatchLaterList"
                component={WatchLaterListScreen}
                options={{ title: 'Assistir mais tarde' }}
            />
        </Stack.Navigator>
    );
}