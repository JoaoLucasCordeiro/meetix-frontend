# ✅ Feedback Submission - RESOLVIDO

## 🎉 Status: PROBLEMA CORRIGIDO

O endpoint de submissão de feedback estava retornando erro 500, mas foi **corrigido pelo backend**.

## ✅ Endpoints Funcionando
- **Verificação**: `GET /api/feedback/event/{eventUuid}/user/has-feedback`
  - Status: ✅ Funcionando
  - Retorna: `false` (boolean) quando usuário não tem feedback
  - Autenticação: JWT token necessário

## ✅ Endpoint Corrigido
- **Submissão**: `POST /api/feedbacks`
  - Status: ✅ FUNCIONANDO
  - Retorna: Objeto Feedback com feedbackId, message, feedbackType, sentAt, userName

---

## 📡 Request Details

### Endpoint
```
POST http://localhost:8081/api/feedbacks
```

### Headers Enviados
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <JWT_TOKEN>'
}
```

### Payload Enviado (JSON)
```json
{
  "eventId": "b91d2e03-1213-4ac5-a302-55df2fddbf87",
  "rating": 4,
  "comment": "Texto do comentário opcional"
}
```

**Nota**: O campo `comment` pode ser:
- `undefined` (se não houver comentário)
- String com o texto (se houver comentário)

### TypeScript Type
```typescript
interface CreateFeedbackRequest {
    eventId: string;
    rating: number;              // 1-5
    comment?: string;            // Opcional
}
```

---

## 🔍 Console Logs Observados

### Logs da Verificação (✅ Funcionando)
```
📡 [API] Verificando feedback existente para evento: b91d2e03-1213-4ac5-a302-55df2fddbf87
✅ [API] Resposta da verificação de feedback: false
```

### Logs da Submissão (❌ Erro)
```
📡 [API] Enviando feedback: 
Object { eventId: "b91d2e03-1213-4ac5-a302-55df2fddbf87", rating: 4, hasComment: true }

❌ [API] Erro ao enviar feedback: 
Object { message: "Erro interno no servidor...", status: 500 }
```

---

## 🧪 Casos de Teste

### Teste 1: Feedback com Comentário
```json
{
  "eventId": "b91d2e03-1213-4ac5-a302-55df2fddbf87",
  "rating": 4,
  "comment": "Ótimo evento, muito bem organizado!"
}
```
**Resultado**: ❌ Erro 500

### Teste 2: Feedback sem Comentário
```json
{
  "eventId": "b91d2e03-1213-4ac5-a302-55df2fddbf87",
  "rating": 5
}
```
**Resultado**: ❌ Erro 500 (assumindo comportamento idêntico)

---

## 🔎 Possíveis Causas

### 1. **Discrepância de Campo no Backend**
   - Backend espera `userId` mas frontend não envia (deveria vir do JWT)?
   - Backend espera campo diferente de `eventId`?
   - Backend espera formato diferente para `comment`?

### 2. **Problema de Validação**
   - Rating fora do range esperado (1-5)?
   - EventId não encontrado no banco?
   - Foreign key constraint?

### 3. **Problema de Autenticação**
   - Token sendo extraído corretamente no backend?
   - UserId sendo resolvido do token?

### 4. **Problema de Serialização**
   - Backend usando `@RequestBody` corretamente?
   - Jackson desserializando JSON corretamente?

---

## 🛠️ Backend Checklist

### Controller
```java
@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {
    
    @PostMapping
    public ResponseEntity<?> createFeedback(
        @RequestBody CreateFeedbackRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Verificar logs aqui
        log.info("Received feedback request: {}", request);
        log.info("User from token: {}", userDetails.getUsername());
        
        try {
            // ... lógica
        } catch (Exception e) {
            log.error("Error creating feedback", e);
            // RETORNAR STACK TRACE COMPLETO NO LOG
            throw e;
        }
    }
}
```

### DTO de Request
```java
public class CreateFeedbackRequest {
    private String eventId;  // ou UUID?
    private Integer rating;
    private String comment;  // Opcional
    
    // Getters e Setters
}
```

### Service
```java
@Service
public class FeedbackService {
    
    public Feedback createFeedback(CreateFeedbackRequest request, String userId) {
        // 1. Validar se evento existe
        Event event = eventRepository.findById(UUID.fromString(request.getEventId()))
            .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        
        // 2. Validar se usuário já deu feedback
        boolean hasFeedback = feedbackRepository.existsByEventIdAndUserId(
            UUID.fromString(request.getEventId()), 
            UUID.fromString(userId)
        );
        if (hasFeedback) {
            throw new DuplicateFeedbackException("User already gave feedback");
        }
        
        // 3. Criar feedback
        Feedback feedback = new Feedback();
        feedback.setEventId(UUID.fromString(request.getEventId()));
        feedback.setUserId(UUID.fromString(userId));
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());
        
        // 4. Salvar
        return feedbackRepository.save(feedback);
    }
}
```

---

## 📋 Próximos Passos

### Para o Backend Team:

1. **Adicionar Logs Detalhados**
   ```java
   log.info("=== FEEDBACK SUBMISSION DEBUG ===");
   log.info("Request Body: {}", request);
   log.info("User from JWT: {}", userDetails.getUsername());
   log.info("EventId: {}", request.getEventId());
   log.info("Rating: {}", request.getRating());
   log.info("Comment: {}", request.getComment());
   ```

2. **Verificar Stack Trace Completo**
   - Qual é a exceção exata sendo lançada?
   - Em qual linha do código?
   - Qual é a causa raiz?

3. **Testar Endpoint via Postman/Insomnia**
   ```bash
   POST http://localhost:8081/api/feedbacks
   Headers:
     Content-Type: application/json
     Authorization: Bearer <TOKEN>
   Body:
   {
     "eventId": "b91d2e03-1213-4ac5-a302-55df2fddbf87",
     "rating": 4,
     "comment": "Teste via Postman"
   }
   ```

4. **Verificar Configurações**
   - `@RequestBody` está presente?
   - Jackson está configurado corretamente?
   - Validações do Bean Validation (@Valid) estão passando?

5. **Verificar Database Constraints**
   - Foreign keys existem?
   - Campos NOT NULL estão sendo preenchidos?
   - Tipos de dados estão corretos (UUID vs String)?

---

## 📊 Comparação com Endpoint Funcionando

### ✅ Verificação (Funcionando)
```
GET /api/feedback/event/{eventUuid}/user/has-feedback

Backend provavelmente:
1. Extrai userId do JWT
2. Busca no banco: feedbackRepository.existsByEventIdAndUserId(eventUuid, userId)
3. Retorna boolean
```

### ❌ Submissão (Com Erro)
```
POST /api/feedbacks
Body: { eventId, rating, comment }

Backend precisa:
1. Extrair userId do JWT ✅ (funciona na verificação)
2. Validar eventId existe ❓
3. Validar se já não deu feedback ❓ (usa mesma query da verificação)
4. Criar objeto Feedback ❓
5. Salvar no banco ❓
6. Retornar Feedback criado ❓
```

**Hipótese**: O erro provavelmente está na etapa 4 ou 5 (criação/salvamento).

---

## 🔧 Testes Sugeridos

### 1. Simplificar Request (Backend)
Criar endpoint temporário de teste:
```java
@PostMapping("/test")
public ResponseEntity<?> testFeedback(@RequestBody CreateFeedbackRequest request) {
    return ResponseEntity.ok(Map.of(
        "received", request,
        "eventId", request.getEventId(),
        "rating", request.getRating(),
        "comment", request.getComment()
    ));
}
```

### 2. Verificar User do JWT
```java
@GetMapping("/me")
public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(Map.of("username", userDetails.getUsername()));
}
```

### 3. Verificar Event Existe
```java
@GetMapping("/event/{eventId}/exists")
public ResponseEntity<?> checkEvent(@PathVariable String eventId) {
    boolean exists = eventRepository.existsById(UUID.fromString(eventId));
    return ResponseEntity.ok(Map.of("exists", exists));
}
```

---

## 📞 Informações de Contato

**Frontend implementado por**: Meetix Frontend Team  
**Arquivo principal**: `src/pages/FeedbackFormPage.tsx`  
**API layer**: `src/lib/api.ts` (linha ~475)  

**Logs atualizados com informações detalhadas** ✅

---

## 🎯 Resumo

- ✅ Verificação de feedback funcionando perfeitamente
- ✅ Token JWT sendo enviado corretamente
- ✅ Frontend enviando payload correto
- ✅ **SUBMISSÃO CORRIGIDA E FUNCIONANDO**
- ✅ Backend criou novo controller FeedbacksController
- ✅ Adicionado campo rating na entidade EventFeedback
- ✅ Validações implementadas (evento existe, já terminou, é participante, não duplicar)

---

## 📝 Correções Aplicadas no Backend

### 1. Endpoint Correto Criado ✅
- Frontend chamava: `POST /api/feedbacks`
- Backend agora tem: `POST /api/feedbacks` (novo controller FeedbacksController)

### 2. DTO Correto ✅
Criado `CreateFeedbackDTO` que aceita:
```json
{
  "eventId": "uuid",
  "rating": 1-5,      // Obrigatório
  "comment": "texto"  // Opcional
}
```

### 3. Campo Rating Adicionado ✅
- ✅ Adicionado campo `rating` na entidade `EventFeedback`
- ✅ Criada migração `V17__add-rating-to-feedback.sql`
- ✅ Campo com constraint CHECK (1-5)

### 4. Validações Implementadas ✅
- ✅ Evento existe?
- ✅ Evento já terminou?
- ✅ Usuário é participante?
- ✅ Usuário já enviou feedback? (evita duplicação)
- ✅ Rating entre 1-5
- ✅ Comment máximo 1000 caracteres

### 5. Resposta de Sucesso (201 Created)
```json
{
  "feedbackId": "uuid",
  "message": "Ótimo evento!",
  "feedbackType": "OTHER",
  "sentAt": "2025-12-04T19:20:00",
  "userName": "João"
}
```

### 6. Erros Possíveis
- `404`: Evento não encontrado
- `400`: Evento ainda não terminou
- `403`: Usuário não é participante
- `400`: Usuário já enviou feedback
- `400`: Rating fora do range 1-5

**Status**: ✅ RESOLVIDO  
**Data**: 04/12/2025  
**Impacto**: Sistema de feedback pós-evento 100% funcional
