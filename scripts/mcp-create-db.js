const https = require('https');

const APPWRITE_ENDPOINT = 'https://appwrite.nozdog.xyz/v1';
const PROJECT_ID = '695585ac003bbff13197';
const API_KEY = 'standard_cebaa313b92b46e9de9994970b4b29017855e59729ed494e987cb80b421d6136f1d41d8b65fbe5a1cf5df4e6ad90eb1a89b0f15221858518b690cec27c3c4ba00fdedcd3cd972f4508d857ebece8d60afe2ede0d92ed28f0bed35d21c7f9343f67cea887137218f8b2e69df5e9e91af1dc823d767f1b5325e005e6e1d69c161e';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'appwrite.nozdog.xyz',
      port: 443,
      path: `/v1${path}`,
      method: method,
      headers: {
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      // Ignorar certificado SSL autoassinado
      rejectUnauthorized: false
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${json.message || body}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${body}`));
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function createDatabase() {
  try {
    console.log('🚀 Criando banco de dados usando API REST do Appwrite...\n');

    // 1. Criar banco de dados
    console.log('📦 1. Criando banco de dados principal...');
    try {
      const database = await makeRequest('/databases', 'POST', {
        databaseId: 'estudeaqui_db',
        name: 'Banco de dados principal do EstudeAqui'
      });
      console.log('✅ Banco criado:', database.$id);
    } catch (error) {
      if (error.message.includes('409')) {
        console.log('✅ Banco já existe');
      } else {
        throw error;
      }
    }

    // 2. Criar coleção users
    console.log('\n👥 2. Criando coleção de Usuários...');
    try {
      const usersCollection = await makeRequest('/databases/estudeaqui_db/collections', 'POST', {
        collectionId: 'users',
        name: 'Usuários da plataforma',
        permissions: [
          'read("any")',
          'create("users")',
          'update("users")',
          'delete("users")'
        ]
      });
      console.log('✅ Coleção users criada:', usersCollection.$id);
    } catch (error) {
      if (error.message.includes('409')) {
        console.log('✅ Coleção users já existe');
      } else {
        throw error;
      }
    }

    // Atributos da coleção users
    console.log('   📝 Adicionando atributos...');
    const userAttributes = [
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'avatar', type: 'string', size: 500, required: false },
      { key: 'bio', type: 'string', size: 1000, required: false },
      { key: 'phone', type: 'string', size: 20, required: false },
      { key: 'level', type: 'string', size: 50, required: false },
      { key: 'xp', type: 'integer', required: false },
      { key: 'preferences', type: 'string', size: 2000, required: false }
    ];

    for (const attr of userAttributes) {
      try {
        await makeRequest(`/databases/estudeaqui_db/collections/users/attributes/${attr.type}`, 'POST', {
          ...attr,
          default: attr.required ? null : '',
          array: false
        });
      } catch (error) {
        if (!error.message.includes('409')) {
          console.log(`⚠️  Erro ao criar atributo ${attr.key}:`, error.message);
        }
      }
    }
    console.log('✅ Atributos da coleção users criados');

    // 3. Criar coleção courses
    console.log('\n📚 3. Criando coleção de Cursos...');
    try {
      const coursesCollection = await makeRequest('/databases/estudeaqui_db/collections', 'POST', {
        collectionId: 'courses',
        name: 'Cursos disponíveis na plataforma',
        permissions: [
          'read("any")',
          'create("users")',
          'update("users")',
          'delete("users")'
        ]
      });
      console.log('✅ Coleção courses criada:', coursesCollection.$id);
    } catch (error) {
      if (error.message.includes('409')) {
        console.log('✅ Coleção courses já existe');
      } else {
        throw error;
      }
    }

    // Atributos da coleção courses
    console.log('   📝 Adicionando atributos...');
    const courseAttributes = [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 5000, required: true },
      { key: 'thumbnail', type: 'string', size: 500, required: false },
      { key: 'category', type: 'string', size: 100, required: true },
      { key: 'level', type: 'string', size: 50, required: true },
      { key: 'instructor', type: 'string', size: 255, required: false },
      { key: 'instructorId', type: 'string', size: 255, required: false },
      { key: 'duration', type: 'integer', required: false },
      { key: 'lessonsCount', type: 'integer', required: false },
      { key: 'price', type: 'float', required: false },
      { key: 'rating', type: 'float', required: false },
      { key: 'enrolledCount', type: 'integer', required: false },
      { key: 'published', type: 'boolean', required: false },
      { key: 'tags', type: 'string', size: 1000, required: false },
      { key: 'requirements', type: 'string', size: 2000, required: false },
      { key: 'objectives', type: 'string', size: 2000, required: false }
    ];

    for (const attr of courseAttributes) {
      try {
        await makeRequest(`/databases/estudeaqui_db/collections/courses/attributes/${attr.type}`, 'POST', {
          ...attr,
          default: attr.required ? null : '',
          array: false
        });
      } catch (error) {
        if (!error.message.includes('409')) {
          console.log(`⚠️  Erro ao criar atributo ${attr.key}:`, error.message);
        }
      }
    }
    console.log('✅ Atributos da coleção courses criados');

    // 4. Criar coleção lessons
    console.log('\n🎥 4. Criando coleção de Lições...');
    try {
      const lessonsCollection = await makeRequest('/databases/estudeaqui_db/collections', 'POST', {
        collectionId: 'lessons',
        name: 'Lições e aulas dos cursos',
        permissions: [
          'read("any")',
          'create("users")',
          'update("users")',
          'delete("users")'
        ]
      });
      console.log('✅ Coleção lessons criada:', lessonsCollection.$id);
    } catch (error) {
      if (error.message.includes('409')) {
        console.log('✅ Coleção lessons já existe');
      } else {
        throw error;
      }
    }

    // Atributos da coleção lessons
    console.log('   📝 Adicionando atributos...');
    const lessonAttributes = [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 2000, required: true },
      { key: 'content', type: 'string', size: 10000, required: false },
      { key: 'videoUrl', type: 'string', size: 500, required: false },
      { key: 'videoDuration', type: 'string', size: 50, required: false },
      { key: 'courseId', type: 'string', size: 255, required: true },
      { key: 'order', type: 'integer', required: true },
      { key: 'type', type: 'string', size: 50, required: false },
      { key: 'free', type: 'boolean', required: false },
      { key: 'resources', type: 'string', size: 2000, required: false },
      { key: 'transcript', type: 'string', size: 10000, required: false }
    ];

    for (const attr of lessonAttributes) {
      try {
        await makeRequest(`/databases/estudeaqui_db/collections/lessons/attributes/${attr.type}`, 'POST', {
          ...attr,
          default: attr.required ? null : '',
          array: false
        });
      } catch (error) {
        if (!error.message.includes('409')) {
          console.log(`⚠️  Erro ao criar atributo ${attr.key}:`, error.message);
        }
      }
    }
    console.log('✅ Atributos da coleção lessons criados');

    // 5. Criar coleção progress
    console.log('\n📈 5. Criando coleção de Progresso...');
    try {
      const progressCollection = await makeRequest('/databases/estudeaqui_db/collections', 'POST', {
        collectionId: 'progress',
        name: 'Progresso dos usuários nos cursos',
        permissions: [
          'read("users")',
          'create("users")',
          'update("users")',
          'delete("users")'
        ]
      });
      console.log('✅ Coleção progress criada:', progressCollection.$id);
    } catch (error) {
      if (error.message.includes('409')) {
        console.log('✅ Coleção progress já existe');
      } else {
        throw error;
      }
    }

    // Atributos da coleção progress
    console.log('   📝 Adicionando atributos...');
    const progressAttributes = [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'courseId', type: 'string', size: 255, required: true },
      { key: 'lessonId', type: 'string', size: 255, required: false },
      { key: 'completed', type: 'boolean', required: false },
      { key: 'watchTime', type: 'integer', required: false },
      { key: 'totalTime', type: 'integer', required: false },
      { key: 'percentage', type: 'float', required: false },
      { key: 'lastPosition', type: 'string', size: 100, required: false },
      { key: 'notes', type: 'string', size: 2000, required: false },
      { key: 'status', type: 'string', size: 50, required: false }
    ];

    for (const attr of progressAttributes) {
      try {
        await makeRequest(`/databases/estudeaqui_db/collections/progress/attributes/${attr.type}`, 'POST', {
          ...attr,
          default: attr.required ? null : '',
          array: false
        });
      } catch (error) {
        if (!error.message.includes('409')) {
          console.log(`⚠️  Erro ao criar atributo ${attr.key}:`, error.message);
        }
      }
    }
    console.log('✅ Atributos da coleção progress criados');

    // 6. Criar coleção enrollments
    console.log('\n🎫 6. Criando coleção de Inscrições...');
    try {
      const enrollmentsCollection = await makeRequest('/databases/estudeaqui_db/collections', 'POST', {
        collectionId: 'enrollments',
        name: 'Inscrições dos usuários nos cursos',
        permissions: [
          'read("users")',
          'create("users")',
          'update("users")',
          'delete("users")'
        ]
      });
      console.log('✅ Coleção enrollments criada:', enrollmentsCollection.$id);
    } catch (error) {
      if (error.message.includes('409')) {
        console.log('✅ Coleção enrollments já existe');
      } else {
        throw error;
      }
    }

    // Atributos da coleção enrollments
    console.log('   📝 Adicionando atributos...');
    const enrollmentAttributes = [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'courseId', type: 'string', size: 255, required: true },
      { key: 'status', type: 'string', size: 50, required: false },
      { key: 'progress', type: 'float', required: false },
      { key: 'enrolledAt', type: 'string', size: 100, required: false },
      { key: 'completedAt', type: 'string', size: 100, required: false },
      { key: 'certificateId', type: 'string', size: 255, required: false },
      { key: 'finalGrade', type: 'float', required: false }
    ];

    for (const attr of enrollmentAttributes) {
      try {
        await makeRequest(`/databases/estudeaqui_db/collections/enrollments/attributes/${attr.type}`, 'POST', {
          ...attr,
          default: attr.required ? null : '',
          array: false
        });
      } catch (error) {
        if (!error.message.includes('409')) {
          console.log(`⚠️  Erro ao criar atributo ${attr.key}:`, error.message);
        }
      }
    }
    console.log('✅ Atributos da coleção enrollments criados');

    // 7. Criar coleção certificates
    console.log('\n🏆 7. Criando coleção de Certificados...');
    try {
      const certificatesCollection = await makeRequest('/databases/estudeaqui_db/collections', 'POST', {
        collectionId: 'certificates',
        name: 'Certificados emitidos para usuários',
        permissions: [
          'read("users")',
          'create("users")',
          'update("users")',
          'delete("users")'
        ]
      });
      console.log('✅ Coleção certificates criada:', certificatesCollection.$id);
    } catch (error) {
      if (error.message.includes('409')) {
        console.log('✅ Coleção certificates já existe');
      } else {
        throw error;
      }
    }

    // Atributos da coleção certificates
    console.log('   📝 Adicionando atributos...');
    const certificateAttributes = [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'courseId', type: 'string', size: 255, required: true },
      { key: 'certificateUrl', type: 'string', size: 500, required: false },
      { key: 'issuedAt', type: 'string', size: 100, required: false },
      { key: 'certificateCode', type: 'string', size: 100, required: true },
      { key: 'finalGrade', type: 'float', required: false },
      { key: 'verificationUrl', type: 'string', size: 500, required: false }
    ];

    for (const attr of certificateAttributes) {
      try {
        await makeRequest(`/databases/estudeaqui_db/collections/certificates/attributes/${attr.type}`, 'POST', {
          ...attr,
          default: attr.required ? null : '',
          array: false
        });
      } catch (error) {
        if (!error.message.includes('409')) {
          console.log(`⚠️  Erro ao criar atributo ${attr.key}:`, error.message);
        }
      }
    }
    console.log('✅ Atributos da coleção certificates criados');

    // 8. Criar coleção reviews
    console.log('\n⭐ 8. Criando coleção de Avaliações...');
    try {
      const reviewsCollection = await makeRequest('/databases/estudeaqui_db/collections', 'POST', {
        collectionId: 'reviews',
        name: 'Avaliações dos cursos pelos usuários',
        permissions: [
          'read("any")',
          'create("users")',
          'update("users")',
          'delete("users")'
        ]
      });
      console.log('✅ Coleção reviews criada:', reviewsCollection.$id);
    } catch (error) {
      if (error.message.includes('409')) {
        console.log('✅ Coleção reviews já existe');
      } else {
        throw error;
      }
    }

    // Atributos da coleção reviews
    console.log('   📝 Adicionando atributos...');
    const reviewAttributes = [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'courseId', type: 'string', size: 255, required: true },
      { key: 'rating', type: 'integer', required: true },
      { key: 'comment', type: 'string', size: 2000, required: false },
      { key: 'reviewedAt', type: 'string', size: 100, required: false },
      { key: 'verified', type: 'boolean', required: false }
    ];

    for (const attr of reviewAttributes) {
      try {
        await makeRequest(`/databases/estudeaqui_db/collections/reviews/attributes/${attr.type}`, 'POST', {
          ...attr,
          default: attr.required ? null : '',
          array: false
        });
      } catch (error) {
        if (!error.message.includes('409')) {
          console.log(`⚠️  Erro ao criar atributo ${attr.key}:`, error.message);
        }
      }
    }
    console.log('✅ Atributos da coleção reviews criados');

    console.log('\n🎉 Banco de dados criado com sucesso no servidor em nuvem!');
    console.log('\n📋 Estrutura criada:');
    console.log('   👥 users - Usuários da plataforma');
    console.log('   📚 courses - Cursos disponíveis');
    console.log('   🎥 lessons - Lições e aulas');
    console.log('   📈 progress - Progresso dos usuários');
    console.log('   🎫 enrollments - Inscrições nos cursos');
    console.log('   🏆 certificates - Certificados emitidos');
    console.log('   ⭐ reviews - Avaliações dos cursos');

    console.log('\n🌐 Acesse o painel em: https://appwrite.nozdog.xyz/console');
    console.log('📊 Database ID: estudeaqui_db');
    console.log('🔗 Seu aplicativo agora está conectado ao servidor em nuvem!');

  } catch (error) {
    console.error('❌ Erro durante a criação:', error.message);
  }
}

createDatabase();
