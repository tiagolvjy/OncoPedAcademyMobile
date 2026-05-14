import { useState } from 'react';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import app from '../config/firebase';

let aiModel: any = null;

try {
    const ai = getAI(app, { backend: new GoogleAIBackend() });
    aiModel = getGenerativeModel(ai, { model: 'gemini-2.5-flash' });
} catch (error) {
    console.warn('Firebase AI não disponível:', error);
}

export function useAI() {
    const [aiLoading, setAiLoading] = useState(false);

    const generateResponse = async (query: string, userName: string): Promise<string> => {
        if (!aiModel) {
            return getFallbackResponse(query, userName);
        }

        setAiLoading(true);
        try {
            const prompt = `Você é um assistente educacional da plataforma OncoPed Academy, especializada em oncologia pediátrica.

Responda de forma direta e objetiva, sem frases introdutórias como "Compreendo sua preocupação" ou "Olá!".
Vá direto ao conteúdo educacional.
Máximo 3 parágrafos curtos.
Finalize sugerindo explorar os cursos da plataforma sobre o tema.
Responda sempre em português brasileiro.

Usuário: ${userName}
Pergunta: ${query}`;

            const result = await aiModel.generateContent(prompt);
            const response = result.response.text();
            setAiLoading(false);
            return response || getFallbackResponse(query, userName);
        } catch (error) {
            console.error('Erro Gemini:', error);
            setAiLoading(false);
            return getFallbackResponse(query, userName);
        }
    };

    return {
        isAvailable: !!aiModel,
        generateResponse,
        aiLoading,
    };
}

function getFallbackResponse(query: string, userName: string): string {
    const q = query.toLowerCase();

    if (q.includes('leucemia') || q.includes('lla')) {
        return `Olá ${userName}! A Leucemia Linfoide Aguda (LLA) é o câncer mais comum na infância. Recomendo explorar os cursos disponíveis na plataforma sobre diagnóstico e tratamento de leucemias pediátricas para aprofundar seus conhecimentos.`;
    }
    if (q.includes('neuroblastoma')) {
        return `Olá ${userName}! O Neuroblastoma é um tumor sólido extracraniano comum em crianças. Origina-se do sistema nervoso simpático e tem apresentação clínica variável. Confira os conteúdos disponíveis sobre tumores sólidos pediátricos.`;
    }
    if (q.includes('imunoterapia')) {
        return `Olá ${userName}! A imunoterapia tem revolucionado o tratamento oncológico pediátrico, com avanços significativos em CAR-T cells e anticorpos monoclonais. Explore os cursos sobre novas terapias na plataforma.`;
    }
    if (q.includes('diagnóstico') || q.includes('diagnostico')) {
        return `Olá ${userName}! O diagnóstico precoce é fundamental na oncologia pediátrica. Sinais como palidez, febre persistente, dor óssea e linfonodomegalias devem ser investigados. Recomendo os conteúdos sobre sinais de alerta na plataforma.`;
    }
    if (q.includes('tratamento') || q.includes('protocolo')) {
        return `Olá ${userName}! Os protocolos de tratamento em oncologia pediátrica são padronizados e incluem quimioterapia, cirurgia, radioterapia e, cada vez mais, terapias-alvo. Explore os cursos sobre protocolos terapêuticos disponíveis.`;
    }
    if (q.includes('efeitos') || q.includes('tardios')) {
        return `Olá ${userName}! Os efeitos tardios do tratamento oncológico pediátrico incluem alterações cardíacas, endócrinas, neurocognitivas e risco de segundas neoplasias. O acompanhamento a longo prazo é essencial.`;
    }

    return `Olá ${userName}! Encontrei conteúdos relacionados a "${query}". Recomendo explorar os cursos destacados abaixo para aprimorar seus conhecimentos em oncologia pediátrica.`;
}