# 📊 Guia de Configuração do Banco de Dados - EstudeAqui

## 🌐 Acesso ao Painel
**URL:** http://192.168.1.105/console  
**Projeto:** estudeaqui-fb6e7  
**Database ID:** estudeaqui_db

## 📦 Estrutura do Banco de Dados

### 1. 👥 **users** - Usuários da Plataforma
| Campo | Tipo | Tamanho | Obrigatório |
|-------|------|---------|-------------|
| name | String | 255 | ✅ |
| email | String | 255 | ✅ |
| avatar | String | 500 | ❌ |
| bio | String | 1000 | ❌ |
| phone | String | 20 | ❌ |
| level | String | 50 | ❌ |
| xp | Integer | - | ❌ |
| preferences | String | 2000 | ❌ |

### 2. 📚 **courses** - Cursos Disponíveis
| Campo | Tipo | Tamanho | Obrigatório |
|-------|------|---------|-------------|
| title | String | 255 | ✅ |
| description | String | 5000 | ✅ |
| thumbnail | String | 500 | ❌ |
| category | String | 100 | ✅ |
| level | String | 50 | ✅ |
| instructor | String | 255 | ❌ |
| instructorId | String | 255 | ❌ |
| duration | Integer | - | ❌ |
| lessonsCount | Integer | - | ❌ |
| price | Float | - | ❌ |
| rating | Float | - | ❌ |
| enrolledCount | Integer | - | ❌ |
| published | Boolean | - | ❌ |
| tags | String | 1000 | ❌ |
| requirements | String | 2000 | ❌ |
| objectives | String | 2000 | ❌ |

### 3. 🎥 **lessons** - Lições e Aulas
| Campo | Tipo | Tamanho | Obrigatório |
|-------|------|---------|-------------|
| title | String | 255 | ✅ |
| description | String | 2000 | ✅ |
| content | String | 10000 | ❌ |
| videoUrl | String | 500 | ❌ |
| videoDuration | String | 50 | ❌ |
| courseId | String | 255 | ✅ |
| order | Integer | - | ✅ |
| type | String | 50 | ❌ |
| free | Boolean | - | ❌ |
| resources | String | 2000 | ❌ |
| transcript | String | 10000 | ❌ |

### 4. 📈 **progress** - Progresso dos Usuários
| Campo | Tipo | Tamanho | Obrigatório |
|-------|------|---------|-------------|
| userId | String | 255 | ✅ |
| courseId | String | 255 | ✅ |
| lessonId | String | 255 | ❌ |
| completed | Boolean | - | ❌ |
| watchTime | Integer | - | ❌ |
| totalTime | Integer | - | ❌ |
| percentage | Float | - | ❌ |
| lastPosition | String | 100 | ❌ |
| notes | String | 2000 | ❌ |
| status | String | 50 | ❌ |

### 5. 🎫 **enrollments** - Inscrições nos Cursos
| Campo | Tipo | Tamanho | Obrigatório |
|-------|------|---------|-------------|
| userId | String | 255 | ✅ |
| courseId | String | 255 | ✅ |
| status | String | 50 | ❌ |
| progress | Float | - | ❌ |
| enrolledAt | String | 100 | ❌ |
| completedAt | String | 100 | ❌ |
| certificateId | String | 255 | ❌ |
| finalGrade | Float | - | ❌ |

### 6. 🏆 **certificates** - Certificados Emitidos
| Campo | Tipo | Tamanho | Obrigatório |
|-------|------|---------|-------------|
| userId | String | 255 | ✅ |
| courseId | String | 255 | ✅ |
| certificateUrl | String | 500 | ❌ |
| issuedAt | String | 100 | ❌ |
| certificateCode | String | 100 | ✅ |
| finalGrade | Float | - | ❌ |
| verificationUrl | String | 500 | ❌ |

### 7. ⭐ **reviews** - Avaliações dos Cursos
| Campo | Tipo | Tamanho | Obrigatório |
|-------|------|---------|-------------|
| userId | String | 255 | ✅ |
| courseId | String | 255 | ✅ |
| rating | Integer | - | ✅ |
| comment | String | 2000 | ❌ |
| reviewedAt | String | 100 | ❌ |
| verified | Boolean | - | ❌ |

## 🔐 Configuração de Permissões

Para todas as coleções, configure as seguintes permissões:

- **Read**: Any (leitura pública para cursos e lições)
- **Create**: Users (usuários logados podem criar)
- **Update**: Users (usuários logados podem atualizar)
- **Delete**: Users (usuários logados podem deletar)

## 🚀 Passo a Passo Rápido

1. **Acessar Painel**: http://192.168.1.105/console
2. **Database → Create Database**
   - ID: `estudeaqui_db`
   - Name: `Banco de dados principal do EstudeAqui`
3. **Criar Coleções**: Siga a tabela acima para cada coleção
4. **Adicionar Atributos**: Use os tipos e tamanhos especificados
5. **Configurar Permissões**: Conforme tabela de permissões

## 📝 Exemplos de Uso

### Criar um Curso
```javascript
const course = await coursesDB.create({
  title: "Curso de React",
  description: "Aprenda React do zero",
  category: "Programação",
  level: "Iniciante",
  price: 99.90,
  published: true
});
```

### Criar Lição
```javascript
const lesson = await lessonsDB.create({
  title: "Introdução ao React",
  description: "Primeiros passos",
  courseId: "course_id_here",
  order: 1,
  videoUrl: "https://video.url"
});
```

### Registrar Progresso
```javascript
const progress = await progressDB.create({
  userId: "user_id_here",
  courseId: "course_id_here",
  lessonId: "lesson_id_here",
  completed: true,
  percentage: 100
});
```

## ✅ Validação

Após criar tudo, teste com:
```bash
node scripts/create-database.js
```

Isso verificará a conexão e confirmará que tudo está pronto!
