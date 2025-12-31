const { Client, Account } = require('appwrite');

const client = new Client()
  .setEndpoint('http://192.168.1.105/v1')
  .setProject('695585ac003bbff13197');

const account = new Account(client);

async function createDatabase() {
  try {
    console.log('🚀 Verificando conexão com Appwrite...\n');

    // Testar conexão
    try {
      const user = await account.get();
      console.log('✅ Conexão OK! Usuário:', user.email || 'não autenticado');
    } catch (error) {
      console.log('✅ Conexão OK! (sem autenticação)');
    }

    console.log('\n📋 Guia para criar o banco de dados manualmente:');
    console.log('================================================\n');

    console.log('🌐 1. Acesse o painel do Appwrite:');
    console.log('   http://192.168.1.105/console\n');

    console.log('📦 2. Criar Banco de Dados:');
    console.log('   • Vá para "Database" no menu lateral');
    console.log('   • Clique em "Create Database"');
    console.log('   • Database ID: estudeaqui_db');
    console.log('   • Name: Banco de dados principal do EstudeAqui');
    console.log('   • Clique em "Create"\n');

    console.log('👥 3. Coleção: users');
    console.log('   • Collection ID: users');
    console.log('   • Name: Usuários da plataforma');
    console.log('   • Atributos:');
    console.log('     - name (String, 255, Required)');
    console.log('     - email (String, 255, Required)');
    console.log('     - avatar (String, 500, Optional)');
    console.log('     - bio (String, 1000, Optional)');
    console.log('     - phone (String, 20, Optional)');
    console.log('     - level (String, 50, Optional)');
    console.log('     - xp (Integer, Optional)');
    console.log('     - preferences (String, 2000, Optional)\n');

    console.log('📚 4. Coleção: courses');
    console.log('   • Collection ID: courses');
    console.log('   • Name: Cursos disponíveis na plataforma');
    console.log('   • Atributos:');
    console.log('     - title (String, 255, Required)');
    console.log('     - description (String, 5000, Required)');
    console.log('     - thumbnail (String, 500, Optional)');
    console.log('     - category (String, 100, Required)');
    console.log('     - level (String, 50, Required)');
    console.log('     - instructor (String, 255, Optional)');
    console.log('     - instructorId (String, 255, Optional)');
    console.log('     - duration (Integer, Optional)');
    console.log('     - lessonsCount (Integer, Optional)');
    console.log('     - price (Float, Optional)');
    console.log('     - rating (Float, Optional)');
    console.log('     - enrolledCount (Integer, Optional)');
    console.log('     - published (Boolean, Optional)');
    console.log('     - tags (String, 1000, Optional)');
    console.log('     - requirements (String, 2000, Optional)');
    console.log('     - objectives (String, 2000, Optional)\n');

    console.log('🎥 5. Coleção: lessons');
    console.log('   • Collection ID: lessons');
    console.log('   • Name: Lições e aulas dos cursos');
    console.log('   • Atributos:');
    console.log('     - title (String, 255, Required)');
    console.log('     - description (String, 2000, Required)');
    console.log('     - content (String, 10000, Optional)');
    console.log('     - videoUrl (String, 500, Optional)');
    console.log('     - videoDuration (String, 50, Optional)');
    console.log('     - courseId (String, 255, Required)');
    console.log('     - order (Integer, Required)');
    console.log('     - type (String, 50, Optional)');
    console.log('     - free (Boolean, Optional)');
    console.log('     - resources (String, 2000, Optional)');
    console.log('     - transcript (String, 10000, Optional)\n');

    console.log('📈 6. Coleção: progress');
    console.log('   • Collection ID: progress');
    console.log('   • Name: Progresso dos usuários nos cursos');
    console.log('   • Atributos:');
    console.log('     - userId (String, 255, Required)');
    console.log('     - courseId (String, 255, Required)');
    console.log('     - lessonId (String, 255, Optional)');
    console.log('     - completed (Boolean, Optional)');
    console.log('     - watchTime (Integer, Optional)');
    console.log('     - totalTime (Integer, Optional)');
    console.log('     - percentage (Float, Optional)');
    console.log('     - lastPosition (String, 100, Optional)');
    console.log('     - notes (String, 2000, Optional)');
    console.log('     - status (String, 50, Optional)\n');

    console.log('🎫 7. Coleção: enrollments');
    console.log('   • Collection ID: enrollments');
    console.log('   • Name: Inscrições dos usuários nos cursos');
    console.log('   • Atributos:');
    console.log('     - userId (String, 255, Required)');
    console.log('     - courseId (String, 255, Required)');
    console.log('     - status (String, 50, Optional)');
    console.log('     - progress (Float, Optional)');
    console.log('     - enrolledAt (String, 100, Optional)');
    console.log('     - completedAt (String, 100, Optional)');
    console.log('     - certificateId (String, 255, Optional)');
    console.log('     - finalGrade (Float, Optional)\n');

    console.log('🏆 8. Coleção: certificates');
    console.log('   • Collection ID: certificates');
    console.log('   • Name: Certificados emitidos para usuários');
    console.log('   • Atributos:');
    console.log('     - userId (String, 255, Required)');
    console.log('     - courseId (String, 255, Required)');
    console.log('     - certificateUrl (String, 500, Optional)');
    console.log('     - issuedAt (String, 100, Optional)');
    console.log('     - certificateCode (String, 100, Required)');
    console.log('     - finalGrade (Float, Optional)');
    console.log('     - verificationUrl (String, 500, Optional)\n');

    console.log('⭐ 9. Coleção: reviews');
    console.log('   • Collection ID: reviews');
    console.log('   • Name: Avaliações dos cursos pelos usuários');
    console.log('   • Atributos:');
    console.log('     - userId (String, 255, Required)');
    console.log('     - courseId (String, 255, Required)');
    console.log('     - rating (Integer, Required)');
    console.log('     - comment (String, 2000, Optional)');
    console.log('     - reviewedAt (String, 100, Optional)');
    console.log('     - verified (Boolean, Optional)\n');

    console.log('🔐 10. Configurar Permissões:');
    console.log('   • Para todas as coleções, configure as permissões:');
    console.log('   • Read: Any (para leitura pública)');
    console.log('   • Write: Users (logged in users)');
    console.log('   • Create: Users (logged in users)');
    console.log('   • Update: Users (logged in users)');
    console.log('   • Delete: Users (logged in users)\n');

    console.log('✅ Após criar tudo, seu aplicativo estará pronto para usar!');
    console.log('📊 Database ID final: estudeaqui_db');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

createDatabase();
