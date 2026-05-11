import { useState, useRef } from 'react';

let useLLMHook: any = null;
let LLAMA_MODEL: any = null;

try {
    const executorch = require('react-native-executorch');
    useLLMHook = executorch.useLLM;
    LLAMA_MODEL = executorch.LLAMA3_2_1B;
} catch {
    // ExecuTorch não disponível
}

export function useAI() {
    const [isAvailable] = useState(!!useLLMHook);
    const [aiResponse, setAiResponse] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [modelReady, setModelReady] = useState(false);
    const [modelLoading, setModelLoading] = useState(false);
    const llmRef = useRef<any>(null);

    // Inicializa o LLM se disponível
    if (useLLMHook && !llmRef.current) {
        try {
            llmRef.current = useLLMHook({ model: LLAMA_MODEL });
        } catch {
            llmRef.current = null;
        }
    }

    const llm = llmRef.current;

    const generateResponse = async (query: string, userName: string): Promise<string> => {
        if (!isAvailable || !llm?.isReady) {
            // Fallback sem IA real
            return getFallbackResponse(query, userName);
        }

        setAiLoading(true);
        try {
            const messages = [
                {
                    role: 'system',
                    content: `Você é um assistente educacional especializado em oncologia pediátrica da plataforma OncoPed Academy. 
                    Responda sempre em português brasileiro. 
                    Seja conciso, informativo e amigável. 
                    Quando possível, sugira cursos ou conteúdos relacionados da plataforma.
                    Não invente informações médicas — se não souber, diga que recomenda consultar um especialista.`,
                },
                {
                    role: 'user',
                    content: query,
                },
            ];

            await llm.generate(messages);
            const response = llm.response || 'Não consegui gerar uma resposta. Tente novamente.';
            setAiLoading(false);
            return response;
        } catch (error) {
            console.error('Erro na geração IA:', error);
            setAiLoading(false);
            return getFallbackResponse(query, userName);
        }
    };

    return {
        isAvailable,
        modelReady: llm?.isReady ?? false,
        modelLoading: llm?.isGenerating ?? false,
        downloadProgress: llm?.downloadProgress ?? 0,
        generateResponse,
        aiLoading,
        aiResponse: llm?.response ?? aiResponse,
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
        return `Olá ${userName}! Os efeitos tardios do tratamento oncológico pediátrico incluem alterações cardíacas, endócrinas, neurocognitivas e risco de segundas neoplasias. O acompanhamento a longo prazo é essencial. Confira os conteúdos sobre sobrevivência na plataforma.`;
    }

    return `Olá ${userName}! Encontrei conteúdos relacionados a "${query}". Com base no seu perfil, recomendo explorar os cursos destacados abaixo para aprimorar seus conhecimentos na área de oncologia pediátrica.`;
}