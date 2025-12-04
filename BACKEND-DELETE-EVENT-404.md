# 🔴 Erro 404 ao Deletar Evento - "Usuário não encontrado"

**Data**: 04/12/2025  
**Status**: ❌ BLOQUEADOR  
**Endpoint**: `DELETE /api/events/{eventId}`

---

## 🚨 Problema

Ao tentar deletar um evento, o backend retorna erro 404 com a mensagem **"Usuário não encontrado"**.

### Request
```
DELETE http://localhost:8081/api/events/87988cdd-8900-40e6-88b6-e549b2860ea9
Authorization: Bearer {token}
```

### Response
```json
{
  "status": 404,
  "message": "Usuário não encontrado",
  "timestamp": "2025-12-04T21:30:12.719394168"
}
```

---

## 🔍 Análise

### Contexto Importante
- ✅ O token JWT é válido (outros endpoints funcionam)
- ✅ Outros endpoints do mesmo usuário funcionam:
  - `GET /api/feedback/event/{id}` → Verifica autorização corretamente
  - `GET /api/feedbacks/event/{id}/stats` → Funciona perfeitamente
- ❌ Apenas `DELETE /api/events/{id}` retorna "Usuário não encontrado"

### Causa Provável
O método de deleção de evento está tentando buscar o usuário de forma diferente dos outros endpoints, provavelmente com:
- Email diferente do que está no token
- Campo user_id ao invés de email
- Query que não encontra o usuário no banco

---

## 🔎 Possíveis Causas

### 1. **Busca por Campo Errado** ⚠️ MAIS PROVÁVEL
```java
// ERRADO - Buscando por campo que não existe no UserDetails
User user = userRepository.findById(userDetails.getUsername())
    .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

// CORRETO - UserDetails.getUsername() retorna o EMAIL
User user = userRepository.findByEmail(userDetails.getUsername())
    .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
```

### 2. **Conversão de UUID Incorreta**
```java
// ERRADO - Tentando converter email para UUID
UUID userId = UUID.fromString(userDetails.getUsername()); // ❌ Email não é UUID!

// CORRETO - Buscar por email primeiro
User user = userRepository.findByEmail(userDetails.getUsername())
    .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
UUID userId = user.getUserId();
```

### 3. **Repository com Nome Errado**
```java
// Método pode não existir ou ter nome diferente
Optional<User> findByEmail(String email);  // ✅ Nome correto
Optional<User> findByUserEmail(String email);  // ❌ Nome errado
```

---

## 💡 Solução

### Controller - Deletar Evento
```java
@RestController
@RequestMapping("/api/events")
public class EventController {
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @DeleteMapping("/{eventId}")
    public ResponseEntity<?> deleteEvent(
        @PathVariable UUID eventId,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("=== DELETE EVENT ===");
        log.info("Event ID: {}", eventId);
        log.info("User from token: {}", userDetails.getUsername());
        
        try {
            // 1. BUSCAR USUÁRIO PELO EMAIL (NÃO PELO ID!)
            User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> {
                    log.error("❌ User not found with email: {}", userDetails.getUsername());
                    return new NotFoundException("Usuário não encontrado");
                });
            
            log.info("✅ User found: {} (ID: {})", user.getName(), user.getUserId());
            
            // 2. Buscar evento
            Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Evento não encontrado"));
            
            log.info("✅ Event found: {}", event.getTitle());
            
            // 3. Verificar se é o criador
            if (!event.getCreatedBy().equals(user.getUserId())) {
                log.warn("❌ User {} is not the creator of event {}", 
                    user.getUserId(), eventId);
                throw new ForbiddenException("Apenas o criador pode deletar o evento");
            }
            
            log.info("✅ User is the creator, proceeding with deletion...");
            
            // 4. Deletar evento
            eventRepository.delete(event);
            
            log.info("✅ Event deleted successfully");
            
            return ResponseEntity.ok()
                .body(Map.of("message", "Evento deletado com sucesso"));
            
        } catch (NotFoundException e) {
            log.error("❌ Not found: {}", e.getMessage());
            throw e;
        } catch (ForbiddenException e) {
            log.error("❌ Forbidden: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("❌ Error deleting event {}", eventId, e);
            throw new InternalServerException("Erro ao deletar evento");
        }
    }
}
```

### Repository
```java
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    // ESTE MÉTODO DEVE EXISTIR E ESTAR CORRETO
    Optional<User> findByEmail(String email);
    
    // Outros métodos...
}
```

---

## 🧪 Como Testar

### 1. Verificar se o método findByEmail existe
```bash
# Procurar no código
grep -r "findByEmail" src/
```

### 2. Testar o endpoint via Postman
```bash
DELETE http://localhost:8081/api/events/87988cdd-8900-40e6-88b6-e549b2860ea9
Headers:
  Authorization: Bearer {seu_token_aqui}
  Content-Type: application/json
```

**Resposta Esperada (200 OK):**
```json
{
  "message": "Evento deletado com sucesso"
}
```

### 3. Verificar logs do backend
```
=== DELETE EVENT ===
Event ID: 87988cdd-8900-40e6-88b6-e549b2860ea9
User from token: user@example.com
✅ User found: João Silva (ID: uuid-do-usuario)
✅ Event found: Nome do Evento
✅ User is the creator, proceeding with deletion...
✅ Event deleted successfully
```

---

## 📊 Comparação com Outros Endpoints

### ✅ Endpoints que Funcionam
```java
// Endpoint de Estatísticas (FUNCIONANDO)
@GetMapping("/feedbacks/event/{eventId}/stats")
public ResponseEntity<FeedbackStatsDTO> getStats(
    @PathVariable UUID eventId,
    @AuthenticationPrincipal UserDetails userDetails
) {
    // Busca usuário corretamente:
    User user = userRepository.findByEmail(userDetails.getUsername())
        .orElseThrow(...);
    // ✅ Funciona!
}
```

### ❌ Endpoint com Problema
```java
// Endpoint de Deleção (COM ERRO)
@DeleteMapping("/events/{eventId}")
public ResponseEntity<?> deleteEvent(
    @PathVariable UUID eventId,
    @AuthenticationPrincipal UserDetails userDetails
) {
    // Provavelmente está fazendo:
    User user = userRepository.findById(userDetails.getUsername())  // ❌ ERRADO!
        .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
    
    // DEVERIA SER:
    User user = userRepository.findByEmail(userDetails.getUsername())  // ✅ CORRETO!
        .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
}
```

---

## 🔍 Checklist de Debugging

### Para o Backend:

1. **Verificar o código do método deleteEvent**
   ```bash
   grep -A 20 "@DeleteMapping.*eventId" src/
   ```

2. **Procurar por "findById.*userDetails"**
   ```bash
   grep -r "findById.*userDetails" src/
   grep -r "findById.*getUsername" src/
   ```

3. **Adicionar logs detalhados**
   ```java
   log.info("UserDetails username: {}", userDetails.getUsername());
   log.info("UserDetails authorities: {}", userDetails.getAuthorities());
   
   // Antes de buscar usuário
   log.info("Searching user with email: {}", userDetails.getUsername());
   ```

4. **Testar query no banco**
   ```sql
   -- Verificar se usuário existe com o email do token
   SELECT * FROM users 
   WHERE email = 'email-do-token@example.com';
   
   -- Verificar se evento existe e quem é o criador
   SELECT 
       e.event_id,
       e.title,
       e.created_by,
       u.email as creator_email,
       u.name as creator_name
   FROM events e
   JOIN users u ON e.created_by = u.user_id
   WHERE e.event_id = '87988cdd-8900-40e6-88b6-e549b2860ea9';
   ```

---

## 🎯 Resumo

| Aspecto | Status | Observação |
|---------|--------|------------|
| **Token JWT** | ✅ Válido | Outros endpoints funcionam |
| **Usuário existe?** | ✅ Sim | Stats endpoint encontra o usuário |
| **Evento existe?** | ✅ Provavelmente | ID parece válido |
| **Método de busca** | ❌ ERRADO | Usando `findById` ao invés de `findByEmail` |
| **Campo esperado** | ❌ ERRADO | `userDetails.getUsername()` retorna EMAIL, não ID |

---

## 📝 Solução Rápida

**Alterar de:**
```java
User user = userRepository.findById(UUID.fromString(userDetails.getUsername()))
    .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
```

**Para:**
```java
User user = userRepository.findByEmail(userDetails.getUsername())
    .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
```

---

## 📞 Informações Adicionais

**Frontend enviando**: 
```javascript
DELETE /api/events/{eventId}
Authorization: Bearer {token}
```

**Token contém**:
- `sub`: email do usuário (ex: `user@example.com`)
- `authorities`: roles/permissions
- Não contém: userId diretamente

**UserDetails.getUsername()**: Retorna o campo `sub` do token (o EMAIL)

---

**Prioridade**: 🔴 ALTA  
**Impacto**: Usuários não conseguem deletar eventos criados por eles  
**Tipo**: Bug no método de busca do usuário  
**Solução**: Usar `findByEmail` ao invés de `findById`  

**Última atualização**: 04/12/2025
