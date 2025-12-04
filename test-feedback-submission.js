/**
 * 🧪 SCRIPT DE TESTE MANUAL - FEEDBACK SUBMISSION
 * 
 * Execute este código no console do navegador (F12) para testar
 * o endpoint de submissão de feedback após fazer login no sistema.
 * 
 * Pré-requisitos:
 * 1. Estar logado no sistema (ter token JWT)
 * 2. Ter um evento válido com UUID conhecido
 * 3. Ser participante do evento
 * 4. Evento já deve ter terminado
 * 
 * Data: 04/12/2025
 */

// ========================================
// CONFIGURAÇÃO DO TESTE
// ========================================

// Substitua este UUID pelo ID de um evento real do seu banco de dados
const EVENT_ID = 'b91d2e03-1213-4ac5-a302-55df2fddbf87';

// Configure a avaliação (1-5) e comentário
const TEST_RATING = 5;
const TEST_COMMENT = 'Teste de feedback via console - Sistema funcionando perfeitamente! 🎉';

// ========================================
// FUNÇÕES DE TESTE
// ========================================

/**
 * 1. Verificar se usuário já deu feedback
 */
async function testCheckExistingFeedback() {
    console.log('🔍 [TESTE 1] Verificando feedback existente...');
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('❌ Token não encontrado! Faça login primeiro.');
        return false;
    }

    try {
        const response = await fetch(
            `http://localhost:8081/api/feedback/event/${EVENT_ID}/user/has-feedback`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const hasFeedback = await response.json();
        console.log('✅ [TESTE 1] Resultado:', hasFeedback);
        
        if (hasFeedback === true) {
            console.warn('⚠️ Usuário já enviou feedback para este evento.');
            console.log('💡 Dica: Teste com outro evento ou outro usuário.');
            return false;
        }
        
        console.log('✅ Usuário pode enviar feedback!');
        return true;
    } catch (error) {
        console.error('❌ [TESTE 1] Erro:', error);
        return false;
    }
}

/**
 * 2. Submeter novo feedback
 */
async function testSubmitFeedback() {
    console.log('📡 [TESTE 2] Enviando feedback...');
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('❌ Token não encontrado! Faça login primeiro.');
        return;
    }

    const payload = {
        eventId: EVENT_ID,
        rating: TEST_RATING,
        comment: TEST_COMMENT
    };

    console.log('📦 Payload:', payload);

    try {
        const response = await fetch(
            'http://localhost:8081/api/feedbacks',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }
        );

        console.log('📊 Status HTTP:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ [TESTE 2] Erro na resposta:', errorData);
            return;
        }

        const result = await response.json();
        console.log('✅ [TESTE 2] Feedback enviado com sucesso!');
        console.log('📄 Resposta completa:', result);
        console.log('🎯 Feedback ID:', result.feedbackId);
        console.log('📝 Mensagem:', result.message);
        console.log('👤 Enviado por:', result.userName);
        console.log('📅 Data:', result.sentAt);
        
    } catch (error) {
        console.error('❌ [TESTE 2] Erro na requisição:', error);
    }
}

/**
 * 3. Executar todos os testes em sequência
 */
async function runAllTests() {
    console.log('🚀 ========================================');
    console.log('🧪 INICIANDO TESTES DE FEEDBACK SUBMISSION');
    console.log('🚀 ========================================\n');

    console.log('📋 Configuração:');
    console.log('   Event ID:', EVENT_ID);
    console.log('   Rating:', TEST_RATING, '⭐'.repeat(TEST_RATING));
    console.log('   Comment:', TEST_COMMENT.substring(0, 50) + '...\n');

    // Teste 1: Verificar feedback existente
    const canSubmit = await testCheckExistingFeedback();
    console.log('\n---\n');

    if (!canSubmit) {
        console.log('⏭️ Pulando teste de submissão (usuário já enviou feedback)');
        console.log('💡 Para testar a submissão, use outro evento ou usuário.');
        return;
    }

    // Teste 2: Submeter feedback
    await testSubmitFeedback();
    
    console.log('\n🏁 ========================================');
    console.log('✅ TESTES CONCLUÍDOS');
    console.log('🏁 ========================================');
}

// ========================================
// EXECUTAR TESTES
// ========================================

console.log('📝 Script de teste carregado com sucesso!');
console.log('💡 Execute: runAllTests()');
console.log('');
console.log('Ou teste individualmente:');
console.log('  - testCheckExistingFeedback()');
console.log('  - testSubmitFeedback()');
console.log('');
console.log('⚠️ IMPORTANTE: Atualize EVENT_ID no código antes de testar!');
