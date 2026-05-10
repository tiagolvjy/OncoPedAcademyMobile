import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CoursesScreen from '../screens/CoursesScreen';
import CourseDetailScreen from '../screens/CourseDetailScreen';
import QuizScreen from '../screens/QuizScreen';
import LessonScreen from '../screens/LessonScreen';

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
                options={{ title: 'Detalhes do Curso' }}
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
        </Stack.Navigator>
    );
}