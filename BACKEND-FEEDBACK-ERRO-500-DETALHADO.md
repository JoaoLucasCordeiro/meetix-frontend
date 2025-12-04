# 🔴 URGENTE - Erro 500 no Endpoint de Listagem de Feedbacks

**Data**: 04/12/2025  
**Status**: ❌ CRÍTICO - Endpoint retornando 500  
**Observação**: Endpoint de estatísticas funcionando ✅, mas listagem com erro ❌

---

## 🚨 Resumo do Problema

O endpoint `GET /api/feedback/event/{eventId}` está retornando **erro 500**, mas o endpoint de estatísticas `GET /api/feedbacks/event/{eventId}/stats` está **funcionando perfeitamente**.

Isso indica que:
- ✅ A autenticação está correta
- ✅ O usuário é organizador (senão stats também daria 403)
- ✅ O evento existe no banco
- ❌ **Problema específico no endpoint de listagem**

---

## 📡 Detalhes dos Requests

### ❌ Endpoint com Erro (Listagem)
```
GET http://localhost:8081/api/feedback/event/b91d2e03-1213-4ac5-a302-55df2fddbf87
Authorization: Bearer {token}

Response:
Status: 500 Internal Server Error
Body: { 
  "message": "Erro interno no servidor. Por favor, tente novamente mais tarde.", 
  "status": 500 
}
```

### ✅ Endpoint Funcionando (Estatísticas)
```
GET http://localhost:8081/api/feedbacks/event/b91d2e03-1213-4ac5-a302-55df2fddbf87/stats
Authorization: Bearer {token}

Response:
Status: 200 OK
Body: {
  "total": 1,
  "averageRating": 5,
  "rating1": 0,
  "rating2": 0,
  "rating3": 0,
  "rating4": 0,
  "rating5": 1
}
```

**Observação Importante**: As estatísticas mostram que **existe 1 feedback com rating 5** no banco de dados. Logo, o endpoint de listagem deveria retornar esse feedback.

---

## 🔍 Análise Detalhada

### Dados do Console (Frontend)
```javascript
// Tentativa 1
📡 [API] Buscando feedbacks do evento: b91d2e03-1213-4ac5-a302-55df2fddbf87
❌ [API] Erro ao buscar feedbacks: { message: "Erro interno...", status: 500 }
⚠️ Endpoint de feedbacks ainda não implementado no backend

// Tentativa 2 (retry automático)
📡 [API] Buscando estatísticas de feedbacks do backend...
✅ [API] Estatísticas carregadas: { total: 1, averageRating: 5, ... }

// Conclusão
❌ Listagem: ERRO 500
✅ Estatísticas: SUCESSO (mostra 1 feedback existente)
```

### Comparação Entre Endpoints

| Aspecto | Listagem | Estatísticas |
|---------|----------|--------------|
| **Endpoint** | `/api/feedback/event/{id}` | `/api/feedbacks/event/{id}/stats` |
| **Status** | ❌ 500 | ✅ 200 |
| **Controller** | `FeedbackController` | `FeedbacksController` |
| **Singular/Plural** | feedback (singular) | feedbacks (plural) |
| **Autenticação** | ✅ Token válido | ✅ Token válido |
| **Autorização** | ❓ Deve ser OK | ✅ Passou |
| **Acesso ao Banco** | ❓ Problema aqui | ✅ Funcionando |

---

## 🔎 Possíveis Causas do Erro 500

### 1. **Controller/Método Não Implementado** ⚠️ PROVÁVEL
O método `getEventFeedbacks` pode não estar implementado no `FeedbackController`.

```java
@RestController
@RequestMapping("/api/feedback")  // SINGULAR
public class FeedbackController {
    
    // ESTE MÉTODO PODE ESTAR FALTANDO:
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<FeedbackResponseDTO>> getEventFeedbacks(
        @PathVariable UUID eventId,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        // IMPLEMENTAÇÃO NECESSÁRIA
    }
}
```

**Nota**: O endpoint de estatísticas usa `/api/feedbacks` (plural), mas a listagem usa `/api/feedback` (singular). São controllers diferentes?

### 2. **Erro na Query do Repository** ⚠️ PROVÁVEL
A query que busca os feedbacks pode estar com problema:

```java
// Pode estar faltando ou com erro:
List<EventFeedback> findByEventIdOrderBySentAtDesc(UUID eventId);

// Ou
List<EventFeedback> findByEvent_EventIdOrderBySentAtDesc(UUID eventId);
```

### 3. **Erro ao Mapear para DTO**
O método que converte `EventFeedback` para `FeedbackResponseDTO` pode estar falhando:

```java
private FeedbackResponseDTO toResponseDTO(EventFeedback feedback) {
    // Pode estar tentando acessar campo nulo
    // Ex: feedback.getUser() retornando null
    // Ex: feedback.getFeedbackType() retornando null
}
```

### 4. **Join Faltando na Entity**
A entidade `EventFeedback` pode não ter o `@ManyToOne` configurado corretamente:

```java
@Entity
public class EventFeedback {
    @ManyToOne(fetch = FetchType.LAZY)  // Pode causar LazyInitializationException
    @JoinColumn(name = "user_id")
    private User user;
    
    // Precisa de EAGER ou fetch manual:
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;
}
```

---

## 🛠️ Checklist de Debugging (Backend)

### Passo 1: Verificar se o Método Existe
```bash
# Procurar no código
grep -r "getEventFeedbacks" src/
grep -r "/event/{eventId}" src/
grep -r "@GetMapping.*event.*eventId" src/
```

Se não encontrar nada, o método não está implementado! ⚠️

### Passo 2: Verificar Logs do Backend
```bash
# Iniciar aplicação e observar logs
./mvnw spring-boot:run

# Logs esperados ao fazer request:
INFO: Received GET request: /api/feedback/event/{eventId}
INFO: User from JWT: user@example.com
ERROR: [STACK TRACE COMPLETO AQUI] <-- IMPORTANTE!
```

**ATENÇÃO**: Precisamos do **stack trace completo** do erro 500. Sem ele, é difícil diagnosticar.

### Passo 3: Adicionar Logs no Controller
```java
@GetMapping("/event/{eventId}")
public ResponseEntity<List<FeedbackResponseDTO>> getEventFeedbacks(
    @PathVariable UUID eventId,
    @AuthenticationPrincipal UserDetails userDetails
) {
    log.info("=== GET FEEDBACKS DEBUG ===");
    log.info("1. Event ID: {}", eventId);
    log.info("2. User: {}", userDetails.getUsername());
    
    try {
        log.info("3. Buscando evento...");
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        log.info("4. Evento encontrado: {}", event.getTitle());
        
        log.info("5. Verificando autorização...");
        // ... validações
        
        log.info("6. Buscando feedbacks do banco...");
        List<EventFeedback> feedbacks = feedbackRepository
            .findByEventIdOrderBySentAtDesc(eventId);
        log.info("7. Feedbacks encontrados: {}", feedbacks.size());
        
        log.info("8. Convertendo para DTO...");
        List<FeedbackResponseDTO> response = feedbacks.stream()
            .map(this::toResponseDTO)
            .collect(Collectors.toList());
        log.info("9. Conversão concluída: {} DTOs", response.size());
        
        log.info("10. Retornando resposta...");
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        log.error("❌ ERRO EM GET FEEDBACKS:", e);
        log.error("Stack trace completo:", e);
        throw e;
    }
}
```

### Passo 4: Verificar Repository
```java
@Repository
public interface EventFeedbackRepository extends JpaRepository<EventFeedback, UUID> {
    
    // Testar se este método existe:
    List<EventFeedback> findByEventIdOrderBySentAtDesc(UUID eventId);
    
    // Alternativas se o campo se chamar diferente:
    List<EventFeedback> findByEvent_EventIdOrderBySentAtDesc(UUID eventId);
    List<EventFeedback> findByEventEventIdOrderBySentAtDesc(UUID eventId);
}
```

### Passo 5: Testar Query Diretamente no Banco
```sql
-- Verificar se o feedback existe
SELECT * FROM event_feedbacks 
WHERE event_id = 'b91d2e03-1213-4ac5-a302-55df2fddbf87';

-- Verificar estrutura da tabela
\d event_feedbacks

-- Verificar relacionamentos
SELECT 
    f.feedback_id,
    f.message,
    f.rating,
    f.sent_at,
    u.name as user_name,
    e.title as event_title
FROM event_feedbacks f
JOIN users u ON f.user_id = u.user_id
JOIN events e ON f.event_id = e.event_id
WHERE f.event_id = 'b91d2e03-1213-4ac5-a302-55df2fddbf87';
```

---

## 💡 Solução Rápida - Implementar o Método

Se o método não existe, aqui está a implementação completa:

```java
@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {
    
    @Autowired
    private EventFeedbackRepository feedbackRepository;
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EventAdminRepository eventAdminRepository;
    
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<FeedbackResponseDTO>> getEventFeedbacks(
        @PathVariable UUID eventId,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("=== GET EVENT FEEDBACKS ===");
        log.info("Event ID: {}", eventId);
        log.info("User: {}", userDetails.getUsername());
        
        try {
            // 1. Verificar se evento existe
            Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
            
            // 2. Obter usuário do token
            User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
            
            // 3. Verificar se é organizador ou admin
            boolean isCreator = event.getCreatedBy().equals(user.getUserId());
            boolean isAdmin = eventAdminRepository.existsByEventIdAndUserId(
                eventId, 
                user.getUserId()
            );
            
            if (!isCreator && !isAdmin) {
                throw new ForbiddenException(
                    "Apenas o organizador pode ver os feedbacks deste evento"
                );
            }
            
            // 4. Buscar feedbacks
            List<EventFeedback> feedbacks = feedbackRepository
                .findByEventIdOrderBySentAtDesc(eventId);
            
            log.info("Found {} feedbacks", feedbacks.size());
            
            // 5. Converter para DTO
            List<FeedbackResponseDTO> response = feedbacks.stream()
                .map(feedback -> {
                    FeedbackResponseDTO dto = new FeedbackResponseDTO();
                    dto.setFeedbackId(feedback.getFeedbackId().toString());
                    dto.setMessage(feedback.getMessage());
                    dto.setFeedbackType(feedback.getFeedbackType().toString());
                    dto.setSentAt(feedback.getSentAt().toString());
                    dto.setUserName(feedback.getUser().getName());
                    dto.setRating(feedback.getRating()); // IMPORTANTE!
                    return dto;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
            
        } catch (ResourceNotFoundException e) {
            log.error("Event not found: {}", eventId);
            throw e;
        } catch (ForbiddenException e) {
            log.error("User not authorized: {}", userDetails.getUsername());
            throw e;
        } catch (Exception e) {
            log.error("Error fetching feedbacks for event {}", eventId, e);
            throw new InternalServerException("Error fetching feedbacks");
        }
    }
}
```

### Repository Necessário
```java
@Repository
public interface EventFeedbackRepository extends JpaRepository<EventFeedback, UUID> {
    
    List<EventFeedback> findByEventIdOrderBySentAtDesc(UUID eventId);
    
    boolean existsByEventIdAndUserId(UUID eventId, UUID userId);
}
```

### DTO de Resposta
```java
@Data
public class FeedbackResponseDTO {
    private String feedbackId;
    private String message;
    private String feedbackType;
    private String sentAt;
    private String userName;
    private Integer rating;  // CAMPO OBRIGATÓRIO!
}
```

---

## 🧪 Como Testar

### 1. Via Postman/Insomnia
```bash
GET http://localhost:8081/api/feedback/event/b91d2e03-1213-4ac5-a302-55df2fddbf87
Headers:
  Authorization: Bearer {seu_token_aqui}
  Content-Type: application/json
```

**Resposta Esperada (200 OK):**
```json
[
  {
    "feedbackId": "uuid-aqui",
    "message": "Comentário do participante",
    "feedbackType": "OTHER",
    "sentAt": "2025-12-04T...",
    "userName": "Nome do Participante",
    "rating": 5
  }
]
```

### 2. Via cURL
```bash
curl -X GET \
  'http://localhost:8081/api/feedback/event/b91d2e03-1213-4ac5-a302-55df2fddbf87' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json'
```

---

## 📋 O Que Precisamos do Backend

### 🔴 URGENTE
1. **Stack trace completo do erro 500**
   - Console logs quando o erro acontece
   - Exceção exata sendo lançada
   - Linha de código onde falha

2. **Confirmar se o método existe**
   - O método `getEventFeedbacks` está implementado?
   - No controller `FeedbackController` (`/api/feedback`)?
   - Com `@GetMapping("/event/{eventId}")`?

3. **Testar a query do repository**
   - O método `findByEventIdOrderBySentAtDesc` existe?
   - Retorna dados quando chamado diretamente?

### 📊 Informações Adicionais
4. **Estrutura do banco**
   ```sql
   \d event_feedbacks
   ```

5. **Dados de teste**
   ```sql
   SELECT * FROM event_feedbacks 
   WHERE event_id = 'b91d2e03-1213-4ac5-a302-55df2fddbf87';
   ```

---

## 🎯 Resumo

| Item | Status | Observação |
|------|--------|------------|
| Estatísticas | ✅ Funcionando | Mostra 1 feedback no banco |
| Listagem | ❌ Erro 500 | Deveria retornar esse 1 feedback |
| Autenticação | ✅ OK | Senão stats também falharia |
| Autorização | ✅ OK | Usuário é organizador |
| **Causa Provável** | ⚠️ | Método não implementado ou erro na query/DTO |

**Ação Necessária**: 
1. Verificar se método existe no controller
2. Fornecer stack trace completo do erro
3. Testar query no banco de dados

---

## 📞 Informações de Contexto

**Frontend Esperando**:
```typescript
Array<{
  feedbackId: string;
  message: string;
  feedbackType: string;
  sentAt: string;
  userName: string;
  rating: number;
}>
```

**Endpoint Frontend**: `src/lib/api.ts` (linha ~495)  
**Página**: `src/pages/EventManagePage.tsx` (aba Feedbacks)

**Backend deve implementar**: `FeedbackController.getEventFeedbacks()`

---

**Prioridade**: 🔴 CRÍTICA  
**Impacto**: Organizadores não conseguem ver feedbacks recebidos  
**Status**: Aguardando stack trace do backend

**Última atualização**: 04/12/2025 - ERRO 500 PERSISTINDO
