# 🐛 Relatório de Problemas no Backend - Meetix

**Data:** 04/12/2025  
**Frontend:** React + TypeScript  
**Backend:** Spring Boot (Java)

---

## ❌ Problema 1: Check-in de Ingressos (Erro 500)

### **Endpoint com problema:**
```
POST /api/tickets/{validationCode}/validate
```

### **Detalhes do erro:**
```
Request:
  Method: POST
  URL: http://localhost:8081/api/tickets/d7e4e200-b171-470f-a8eb-2b8447da862c/validate
  Headers: 
    Authorization: Bearer {JWT_TOKEN}
    Content-Type: application/json

Response:
  Status: 500 Internal Server Error
  Body: HTML error page (não JSON)
```

### **Comportamento esperado:**
```json
// Sucesso (200 OK)
{
  "ticketId": "uuid",
  "validationCode": "d7e4e200-b171-470f-a8eb-2b8447da862c",
  "userName": "João Silva",
  "eventTitle": "Workshop React",
  "eventId": "uuid",
  "ticketStatus": "USED",
  "issueDate": "2025-12-04T10:00:00",
  "checkedInAt": "2025-12-04T14:30:00"
}

// Erro esperado (400/404/409)
{
  "message": "Ticket already validated",
  "status": 409
}
```

### **Possíveis causas no backend:**

#### **1. Ticket não encontrado no banco**
```java
// EventTicketService.java - linha ~XX
Optional<EventTicket> ticketOpt = eventTicketRepository
    .findByValidationCode(validationCode);

if (ticketOpt.isEmpty()) {
    // ❌ Está lançando exceção não tratada?
    throw new TicketNotFoundException("Ticket not found");
}
```

**Verificação SQL:**
```sql
SELECT * FROM event_tickets 
WHERE validation_code = 'd7e4e200-b171-470f-a8eb-2b8447da862c';

-- Verificar relacionamentos
SELECT 
    t.ticket_id,
    t.validation_code,
    t.ticket_status,
    t.event_id,
    t.user_id,
    e.title as event_title,
    u.first_name,
    u.last_name
FROM event_tickets t
LEFT JOIN events e ON t.event_id = e.event_id
LEFT JOIN users u ON t.user_id = u.user_id
WHERE t.validation_code = 'd7e4e200-b171-470f-a8eb-2b8447da862c';
```

#### **2. Problema de serialização JSON**
```java
// EventTicket.java
@Entity
public class EventTicket {
    
    @ManyToOne
    @JoinColumn(name = "event_id")
    // ❌ Falta @JsonBackReference ou @JsonIgnore?
    private Event event;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    // ❌ Pode estar causando referência circular
    private User user;
}
```

**Solução:**
```java
@ManyToOne
@JoinColumn(name = "event_id")
@JsonBackReference("event-tickets")
private Event event;

@ManyToOne
@JoinColumn(name = "user_id")
@JsonBackReference("user-tickets")
private User user;
```

#### **3. NullPointerException não tratado**
```java
// EventTicketService.java
public EventTicket validateTicket(UUID validationCode) {
    EventTicket ticket = eventTicketRepository
        .findByValidationCode(validationCode)
        .orElseThrow(() -> new TicketNotFoundException("Ticket not found"));
    
    // ❌ Algum destes pode ser null?
    ticket.getEvent().getTitle();  // NPE se event for null
    ticket.getUser().getFirstName();  // NPE se user for null
    
    // Atualizar status
    ticket.setTicketStatus(TicketStatus.USED);
    ticket.setCheckedInAt(LocalDateTime.now());
    
    return eventTicketRepository.save(ticket);
}
```

#### **4. Exceções não mapeadas no GlobalExceptionHandler**
```java
// GlobalExceptionHandler.java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    // ✅ Tem este handler?
    @ExceptionHandler(TicketNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleTicketNotFound(TicketNotFoundException ex) {
        return ResponseEntity.status(404)
            .body(new ErrorResponse(ex.getMessage(), 404));
    }
    
    // ✅ Tem este handler genérico?
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        log.error("Erro não tratado:", ex);
        return ResponseEntity.status(500)
            .body(new ErrorResponse("Internal server error", 500));
    }
}
```

### **Debug recomendado:**

1. **Adicionar logs no controller:**
```java
@PostMapping("/{validationCode}/validate")
public ResponseEntity<EventTicket> validateTicket(@PathVariable UUID validationCode) {
    log.info("🔍 [CHECK-IN] Recebendo validação para ticket: {}", validationCode);
    
    try {
        EventTicket ticket = eventTicketService.validateTicket(validationCode);
        log.info("✅ [CHECK-IN] Ticket validado com sucesso: {}", ticket.getTicketId());
        return ResponseEntity.ok(ticket);
        
    } catch (TicketNotFoundException e) {
        log.warn("⚠️ [CHECK-IN] Ticket não encontrado: {}", validationCode);
        throw e;
        
    } catch (Exception e) {
        log.error("❌ [CHECK-IN] Erro inesperado ao validar ticket: {}", validationCode, e);
        throw e;
    }
}
```

2. **Verificar stack trace completo nos logs:**
```bash
tail -f logs/spring-boot-application.log | grep "CHECK-IN"
```

3. **Testar manualmente no Postman/Insomnia:**
```
POST http://localhost:8081/api/tickets/d7e4e200-b171-470f-a8eb-2b8447da862c/validate
Authorization: Bearer {seu_token_jwt}
```

---

## ❌ Problema 2: Verificação de Feedback (Erro 500)

### **Endpoint com problema:**
```
GET /api/feedbacks/event/{eventId}/user/has-feedback
```

### **Detalhes do erro:**
```
Request:
  Method: GET
  URL: http://localhost:8081/api/feedbacks/event/b91d2e03-1213-4ac5-a302-55df2fddbf87/user/has-feedback
  Headers: 
    Authorization: Bearer {JWT_TOKEN}

Response:
  Status: 500 Internal Server Error
  Body: HTML error page
```

### **Comportamento esperado:**
```json
// Sucesso (200 OK)
{
  "hasFeedback": true
}

// ou

{
  "hasFeedback": false
}
```

### **Possíveis causas no backend:**

#### **1. Problema na query de verificação**
```java
// FeedbackRepository.java
@Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END " +
       "FROM Feedback f " +
       "WHERE f.event.id = :eventId AND f.user.id = :userId")
boolean existsByEventIdAndUserId(@Param("eventId") UUID eventId, 
                                  @Param("userId") UUID userId);
```

**Verificação SQL:**
```sql
-- Testar query diretamente
SELECT 
    CASE WHEN COUNT(*) > 0 THEN true ELSE false END as has_feedback
FROM feedbacks f
WHERE f.event_id = 'b91d2e03-1213-4ac5-a302-55df2fddbf87'
  AND f.user_id = (SELECT user_id FROM users WHERE email = 'usuario@email.com');
```

#### **2. Problema ao extrair userId do JWT**
```java
// FeedbackService.java
public HasFeedbackResponse hasUserFeedback(UUID eventId, UUID userId) {
    // ❌ userId está chegando null?
    if (userId == null) {
        throw new IllegalArgumentException("User ID cannot be null");
    }
    
    boolean hasFeedback = feedbackRepository
        .existsByEventIdAndUserId(eventId, userId);
    
    return new HasFeedbackResponse(hasFeedback);
}
```

#### **3. Controller não está pegando userId do Authentication**
```java
// FeedbackController.java
@GetMapping("/event/{eventId}/user/has-feedback")
public ResponseEntity<HasFeedbackResponse> hasUserFeedback(
        @PathVariable UUID eventId,
        Authentication authentication) {  // ❌ Está anotado corretamente?
    
    // ❌ Está extraindo userId corretamente?
    UUID userId = UUID.fromString(authentication.getName());
    
    HasFeedbackResponse response = feedbackService.hasUserFeedback(eventId, userId);
    return ResponseEntity.ok(response);
}
```

#### **4. Falta classe de resposta (DTO)**
```java
// HasFeedbackResponse.java
@Data
@AllArgsConstructor
public class HasFeedbackResponse {
    private boolean hasFeedback;
}
```

### **Debug recomendado:**

1. **Adicionar logs detalhados:**
```java
@GetMapping("/event/{eventId}/user/has-feedback")
public ResponseEntity<HasFeedbackResponse> hasUserFeedback(
        @PathVariable UUID eventId,
        Authentication authentication) {
    
    log.info("📝 [FEEDBACK] Verificando feedback para evento: {}", eventId);
    log.info("📝 [FEEDBACK] Authentication principal: {}", authentication.getName());
    
    try {
        UUID userId = UUID.fromString(authentication.getName());
        log.info("📝 [FEEDBACK] UserId extraído: {}", userId);
        
        HasFeedbackResponse response = feedbackService.hasUserFeedback(eventId, userId);
        log.info("📝 [FEEDBACK] Resultado: hasFeedback = {}", response.isHasFeedback());
        
        return ResponseEntity.ok(response);
        
    } catch (IllegalArgumentException e) {
        log.error("❌ [FEEDBACK] Erro ao converter UUID: {}", e.getMessage());
        throw new BadRequestException("Invalid UUID format");
        
    } catch (Exception e) {
        log.error("❌ [FEEDBACK] Erro inesperado ao verificar feedback", e);
        throw e;
    }
}
```

2. **Testar query SQL isoladamente:**
```sql
-- Ver todos feedbacks de um evento
SELECT 
    f.feedback_id,
    f.event_id,
    f.user_id,
    f.rating,
    f.comment,
    u.first_name,
    u.last_name,
    e.title
FROM feedbacks f
JOIN users u ON f.user_id = u.user_id
JOIN events e ON f.event_id = e.event_id
WHERE f.event_id = 'b91d2e03-1213-4ac5-a302-55df2fddbf87';
```

3. **Verificar estrutura das tabelas:**
```sql
-- Estrutura da tabela feedbacks
DESCRIBE feedbacks;

-- Verificar constraints e foreign keys
SHOW CREATE TABLE feedbacks;
```

---

## 🔧 Checklist de Verificação Geral

### **Backend (Spring Boot)**

- [ ] Logs do application estão sendo gerados?
- [ ] `GlobalExceptionHandler` está tratando exceções?
- [ ] DTOs têm construtores corretos?
- [ ] `@JsonBackReference` e `@JsonManagedReference` configurados?
- [ ] Authentication está injetado corretamente?
- [ ] Repository queries estão corretas?
- [ ] Transações estão configuradas (`@Transactional`)?
- [ ] Banco de dados tem dados de teste válidos?
- [ ] Foreign keys estão válidas?

### **Banco de Dados**

- [ ] Tabelas existem?
- [ ] Dados de teste são válidos?
- [ ] Foreign keys não estão quebradas?
- [ ] Indices estão criados?
- [ ] Constraints não estão violadas?

### **Segurança**

- [ ] JWT está sendo validado corretamente?
- [ ] SecurityConfig permite os endpoints?
- [ ] CORS está configurado?
- [ ] Authentication está populado no contexto?

---

## 📋 Dados para Teste

### **Ticket válido para check-in:**
```
validationCode: d7e4e200-b171-470f-a8eb-2b8447da862c
```

### **Evento para feedback:**
```
eventId: b91d2e03-1213-4ac5-a302-55df2fddbf87
```

### **JWT Token:**
```
Precisa estar no header:
Authorization: Bearer {token_gerado_no_login}
```

---

## 🚀 Próximos Passos

1. ✅ **Verificar logs do Spring Boot** - Procurar stack trace completo
2. ✅ **Adicionar logs detalhados** nos controllers e services
3. ✅ **Testar queries SQL** diretamente no banco
4. ✅ **Verificar estrutura** das tabelas e relacionamentos
5. ✅ **Testar endpoints** via Postman/Insomnia com token válido
6. ✅ **Corrigir serialização JSON** se necessário
7. ✅ **Adicionar tratamento de exceções** específico

---

## 📞 Informações Adicionais

**Frontend já está preparado para:**
- ✅ Receber erros 400, 404, 409, 500
- ✅ Mostrar mensagens específicas ao usuário
- ✅ Logar detalhes no console para debug
- ✅ Retry automático quando apropriado

**O que o backend precisa fazer:**
- ❌ Retornar JSON válido (não HTML)
- ❌ Status codes corretos (4xx para erros do cliente, 5xx só em casos excepcionais)
- ❌ Mensagens de erro descritivas
- ❌ Logs detalhados para debug

---

**Criado por:** Frontend Team  
**Para:** Backend Team  
**Urgência:** Alta (funcionalidades bloqueadas)
