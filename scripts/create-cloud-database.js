const { Client, Databases, ID, Permission, Role } = require('appwrite');

const client = new Client()
  .setEndpoint('https://appwrite.nozdog.xyz/v1')
  .setProject('695585ac003bbff13197');

// Adicionar a API key como header
client.headers['X-Appwrite-Key'] = 'standard_cebaa313b92b46e9de9994970b4b29017855e59729ed494e987cb80b421d6136f1d41d8b65fbe5a1cf5df4e6ad90eb1a89b0f15221858518b690cec27c3c4ba00fdedcd3cd972f4508d857ebece8d60afe2ede0d92ed28f0bed35d21c7f9343f67cea887137218f8b2e69df5e9e91af1dc823d767f1b5325e005e6e1d69c161e';

const databases = new Databases(client);

async function createCloudDatabase() {
  try {
    console.log('🚀 Criando banco de dados no servidor Appwrite em nuvem...\n');

    // 1. Criar banco de dados principal
    console.log('📦 1. Criando banco de dados principal...');
    let database;
    try {
      database = await databases.create('estudeaqui_db', 'Banco de dados principal do EstudeAqui');
      console.log('✅ Banco criado:', database.$id);
    } catch (error) {
      if (error.code === 409) {
        console.log('✅ Banco já existe, usando ID: estudeaqui_db');
        database = { $id: 'estudeaqui_db' };
      } else {
        throw error;
      }
    }

    // 2. Coleção de Usuários
    console.log('\n👥 2. Criando coleção de Usuários...');
    let usersCollection;
    try {
      usersCollection = await databases.createCollection(
        database.$id,
        ID.unique(),
        'users',
        'Dados dos usuários da plataforma',
        [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );
      console.log('✅ Coleção users criada:', usersCollection.$id);
    } catch (error) {
      if (error.code === 409) {
        console.log('✅ Coleção users já existe');
        usersCollection = { $id: 'users' };
      } else {
        throw error;
      }
    }

    // Atributos da coleção users
    console.log('   📝 Adicionando atributos...');
    try {
      await databases.createStringAttribute(database.$id, usersCollection.$id, 'name', 255, true);
      await databases.createStringAttribute(database.$id, usersCollection.$id, 'email', 255, true);
      await databases.createStringAttribute(database.$id, usersCollection.$id, 'avatar', 500, false);
      await databases.createStringAttribute(database.$id, usersCollection.$id, 'bio', 1000, false);
      await databases.createStringAttribute(database.$id, usersCollection.$id, 'phone', 20, false);
      await databases.createStringAttribute(database.$id, usersCollection.$id, 'level', 50, false);
      await databases.createIntegerAttribute(database.$id, usersCollection.$id, 'xp', false);
      await databases.createStringAttribute(database.$id, usersCollection.$id, 'preferences', 2000, false);
      console.log('✅ Atributos da coleção users criados');
    } catch (error) {
      console.log('⚠️  Atributos já existem ou erro:', error.message);
    }

    // 3. Coleção de Cursos
    console.log('\n📚 3. Criando coleção de Cursos...');
    let coursesCollection;
    try {
      coursesCollection = await databases.createCollection(
        database.$id,
        ID.unique(),
        'courses',
        'Cursos disponíveis na plataforma',
        [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );
      console.log('✅ Coleção courses criada:', coursesCollection.$id);
    } catch (error) {
      if (error.code === 409) {
        console.log('✅ Coleção courses já existe');
        coursesCollection = { $id: 'courses' };
      } else {
        throw error;
      }
    }

    // Atributos da coleção courses
    console.log('   📝 Adicionando atributos...');
    try {
      await databases.createStringAttribute(database.$id, coursesCollection.$id, 'title', 255, true);
      await databases.createStringAttribute(database.$id, coursesCollection.$id, 'description', 5000, true);
      await databases.createStringAttribute(database.$id, coursesCollection.$id, 'thumbnail', 500, false);
      await databases.createStringAttribute(database.$id, coursesCollection.$id, 'category', 100, true);
      await databases.createStringAttribute(database.$id, coursesCollection.$id, 'level', 50, true);
      await databases.createStringAttribute(database.$id, coursesCollection.$id, 'instructor', 255, false);
      await databases.createStringAttribute(database.$id, coursesCollection.$id, 'instructorId', 255, false);
      await databases.createIntegerAttribute(database.$id, coursesCollection.$id, 'duration', false);
      await databases.createIntegerAttribute(database.$id, coursesCollection.$id, 'lessonsCount', false);
      await databases.createFloatAttribute(database.$id, coursesCollection.$id, 'price', false);
      await databases.createFloatAttribute(database.$id, coursesCollection.$id, 'rating', false);
      await databases.createIntegerAttribute(database.$id, coursesCollection.$id, 'enrolledCount', false);
      await databases.createBooleanAttribute(database.$id, coursesCollection.$id, 'published', false);
      await databases.createStringAttribute(database.$id, coursesCollection.$id, 'tags', 1000, false);
      await databases.createStringAttribute(database.$id, coursesCollection.$id, 'requirements', 2000, false);
      await databases.createStringAttribute(database.$id, coursesCollection.$id, 'objectives', 2000, false);
      console.log('✅ Atributos da coleção courses criados');
    } catch (error) {
      console.log('⚠️  Atributos já existem ou erro:', error.message);
    }

    // 4. Coleção de Lições/Aulas
    console.log('\n🎥 4. Criando coleção de Lições...');
    let lessonsCollection;
    try {
      lessonsCollection = await databases.createCollection(
        database.$id,
        ID.unique(),
        'lessons',
        'Lições e aulas dos cursos',
        [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );
      console.log('✅ Coleção lessons criada:', lessonsCollection.$id);
    } catch (error) {
      if (error.code === 409) {
        console.log('✅ Coleção lessons já existe');
        lessonsCollection = { $id: 'lessons' };
      } else {
        throw error;
      }
    }

    // Atributos da coleção lessons
    console.log('   📝 Adicionando atributos...');
    try {
      await databases.createStringAttribute(database.$id, lessonsCollection.$id, 'title', 255, true);
      await databases.createStringAttribute(database.$id, lessonsCollection.$id, 'description', 2000, true);
      await databases.createStringAttribute(database.$id, lessonsCollection.$id, 'content', 10000, false);
      await databases.createStringAttribute(database.$id, lessonsCollection.$id, 'videoUrl', 500, false);
      await databases.createStringAttribute(database.$id, lessonsCollection.$id, 'videoDuration', 50, false);
      await databases.createStringAttribute(database.$id, lessonsCollection.$id, 'courseId', 255, true);
      await databases.createIntegerAttribute(database.$id, lessonsCollection.$id, 'order', true);
      await databases.createStringAttribute(database.$id, lessonsCollection.$id, 'type', 50, false);
      await databases.createBooleanAttribute(database.$id, lessonsCollection.$id, 'free', false);
      await databases.createStringAttribute(database.$id, lessonsCollection.$id, 'resources', 2000, false);
      await databases.createStringAttribute(database.$id, lessonsCollection.$id, 'transcript', 10000, false);
      console.log('✅ Atributos da coleção lessons criados');
    } catch (error) {
      console.log('⚠️  Atributos já existem ou erro:', error.message);
    }

    // 5. Coleção de Progresso do Usuário
    console.log('\n📈 5. Criando coleção de Progresso...');
    let progressCollection;
    try {
      progressCollection = await databases.createCollection(
        database.$id,
        ID.unique(),
        'progress',
        'Progresso dos usuários nos cursos',
        [
          Permission.read(Role.users()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );
      console.log('✅ Coleção progress criada:', progressCollection.$id);
    } catch (error) {
      if (error.code === 409) {
        console.log('✅ Coleção progress já existe');
        progressCollection = { $id: 'progress' };
      } else {
        throw error;
      }
    }

    // Atributos da coleção progress
    console.log('   📝 Adicionando atributos...');
    try {
      await databases.createStringAttribute(database.$id, progressCollection.$id, 'userId', 255, true);
      await databases.createStringAttribute(database.$id, progressCollection.$id, 'courseId', 255, true);
      await databases.createStringAttribute(database.$id, progressCollection.$id, 'lessonId', 255, false);
      await databases.createBooleanAttribute(database.$id, progressCollection.$id, 'completed', false);
      await databases.createIntegerAttribute(database.$id, progressCollection.$id, 'watchTime', false);
      await databases.createIntegerAttribute(database.$id, progressCollection.$id, 'totalTime', false);
      await databases.createFloatAttribute(database.$id, progressCollection.$id, 'percentage', false);
      await databases.createStringAttribute(database.$id, progressCollection.$id, 'lastPosition', 100, false);
      await databases.createStringAttribute(database.$id, progressCollection.$id, 'notes', 2000, false);
      await databases.createStringAttribute(database.$id, progressCollection.$id, 'status', 50, false);
      console.log('✅ Atributos da coleção progress criados');
    } catch (error) {
      console.log('⚠️  Atributos já existem ou erro:', error.message);
    }

    // 6. Coleção de Inscrições
    console.log('\n🎫 6. Criando coleção de Inscrições...');
    let enrollmentsCollection;
    try {
      enrollmentsCollection = await databases.createCollection(
        database.$id,
        ID.unique(),
        'enrollments',
        'Inscrições dos usuários nos cursos',
        [
          Permission.read(Role.users()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );
      console.log('✅ Coleção enrollments criada:', enrollmentsCollection.$id);
    } catch (error) {
      if (error.code === 409) {
        console.log('✅ Coleção enrollments já existe');
        enrollmentsCollection = { $id: 'enrollments' };
      } else {
        throw error;
      }
    }

    // Atributos da coleção enrollments
    console.log('   📝 Adicionando atributos...');
    try {
      await databases.createStringAttribute(database.$id, enrollmentsCollection.$id, 'userId', 255, true);
      await databases.createStringAttribute(database.$id, enrollmentsCollection.$id, 'courseId', 255, true);
      await databases.createStringAttribute(database.$id, enrollmentsCollection.$id, 'status', 50, false);
      await databases.createFloatAttribute(database.$id, enrollmentsCollection.$id, 'progress', false);
      await databases.createStringAttribute(database.$id, enrollmentsCollection.$id, 'enrolledAt', 100, false);
      await databases.createStringAttribute(database.$id, enrollmentsCollection.$id, 'completedAt', 100, false);
      await databases.createStringAttribute(database.$id, enrollmentsCollection.$id, 'certificateId', 255, false);
      await databases.createFloatAttribute(database.$id, enrollmentsCollection.$id, 'finalGrade', false);
      console.log('✅ Atributos da coleção enrollments criados');
    } catch (error) {
      console.log('⚠️  Atributos já existem ou erro:', error.message);
    }

    // 7. Coleção de Certificados
    console.log('\n🏆 7. Criando coleção de Certificados...');
    let certificatesCollection;
    try {
      certificatesCollection = await databases.createCollection(
        database.$id,
        ID.unique(),
        'certificates',
        'Certificados emitidos para usuários',
        [
          Permission.read(Role.users()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );
      console.log('✅ Coleção certificates criada:', certificatesCollection.$id);
    } catch (error) {
      if (error.code === 409) {
        console.log('✅ Coleção certificates já existe');
        certificatesCollection = { $id: 'certificates' };
      } else {
        throw error;
      }
    }

    // Atributos da coleção certificates
    console.log('   📝 Adicionando atributos...');
    try {
      await databases.createStringAttribute(database.$id, certificatesCollection.$id, 'userId', 255, true);
      await databases.createStringAttribute(database.$id, certificatesCollection.$id, 'courseId', 255, true);
      await databases.createStringAttribute(database.$id, certificatesCollection.$id, 'certificateUrl', 500, false);
      await databases.createStringAttribute(database.$id, certificatesCollection.$id, 'issuedAt', 100, false);
      await databases.createStringAttribute(database.$id, certificatesCollection.$id, 'certificateCode', 100, true);
      await databases.createFloatAttribute(database.$id, certificatesCollection.$id, 'finalGrade', false);
      await databases.createStringAttribute(database.$id, certificatesCollection.$id, 'verificationUrl', 500, false);
      console.log('✅ Atributos da coleção certificates criados');
    } catch (error) {
      console.log('⚠️  Atributos já existem ou erro:', error.message);
    }

    // 8. Coleção de Avaliações
    console.log('\n⭐ 8. Criando coleção de Avaliações...');
    let reviewsCollection;
    try {
      reviewsCollection = await databases.createCollection(
        database.$id,
        ID.unique(),
        'reviews',
        'Avaliações dos cursos pelos usuários',
        [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );
      console.log('✅ Coleção reviews criada:', reviewsCollection.$id);
    } catch (error) {
      if (error.code === 409) {
        console.log('✅ Coleção reviews já existe');
        reviewsCollection = { $id: 'reviews' };
      } else {
        throw error;
      }
    }

    // Atributos da coleção reviews
    console.log('   📝 Adicionando atributos...');
    try {
      await databases.createStringAttribute(database.$id, reviewsCollection.$id, 'userId', 255, true);
      await databases.createStringAttribute(database.$id, reviewsCollection.$id, 'courseId', 255, true);
      await databases.createIntegerAttribute(database.$id, reviewsCollection.$id, 'rating', true);
      await databases.createStringAttribute(database.$id, reviewsCollection.$id, 'comment', 2000, false);
      await databases.createStringAttribute(database.$id, reviewsCollection.$id, 'reviewedAt', 100, false);
      await databases.createBooleanAttribute(database.$id, reviewsCollection.$id, 'verified', false);
      console.log('✅ Atributos da coleção reviews criados');
    } catch (error) {
      console.log('⚠️  Atributos já existem ou erro:', error.message);
    }

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

createCloudDatabase();
