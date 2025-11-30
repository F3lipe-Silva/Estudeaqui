import 'dart:convert';
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';
import 'package:estudeaquiapp/models/models.dart';

class LocalDatabaseHelper {
  static final LocalDatabaseHelper _instance = LocalDatabaseHelper._internal();
  factory LocalDatabaseHelper() => _instance;
  LocalDatabaseHelper._internal();

  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    String path = join(await getDatabasesPath(), 'estudeaqui.db');
    return await openDatabase(
      path,
      version: 1,
      onCreate: _onCreate,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    // Create subjects table
    await db.execute('''
      CREATE TABLE subjects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        description TEXT,
        study_duration INTEGER,
        material_url TEXT,
        revision_progress INTEGER DEFAULT 0
      )
    ''');

    // Create topics table
    await db.execute('''
      CREATE TABLE topics (
        id TEXT PRIMARY KEY,
        subject_id TEXT NOT NULL,
        name TEXT NOT NULL,
        order_num INTEGER NOT NULL,
        is_completed INTEGER NOT NULL DEFAULT 0,
        description TEXT,
        FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
      )
    ''');

    // Create study_logs table
    await db.execute('''
      CREATE TABLE study_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        topic_id TEXT,
        date TEXT NOT NULL,
        duration INTEGER NOT NULL,
        start_page INTEGER,
        end_page INTEGER,
        questions_total INTEGER DEFAULT 0,
        questions_correct INTEGER DEFAULT 0,
        source TEXT DEFAULT 'manual',
        sequence_item_index INTEGER,
        FOREIGN KEY (subject_id) REFERENCES subjects (id),
        FOREIGN KEY (topic_id) REFERENCES topics (id)
      )
    ''');

    // Create study_sequences table
    await db.execute('''
      CREATE TABLE study_sequences (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        sequence TEXT NOT NULL
      )
    ''');

    // Create pomodoro_settings table
    await db.execute('''
      CREATE TABLE pomodoro_settings (
        user_id TEXT PRIMARY KEY,
        settings TEXT NOT NULL
      )
    ''');

    // Create templates table
    await db.execute('''
      CREATE TABLE templates (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        subjects TEXT NOT NULL
      )
    ''');

    // Create schedule_plans table
    await db.execute('''
      CREATE TABLE schedule_plans (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        total_horas_semanais INTEGER,
        duracao_sessao INTEGER,
        sub_modo_pomodoro INTEGER,
        sessoes_por_materia TEXT
      )
    ''');
  }

  // Subjects
  Future<void> insertSubject(Subject subject) async {
    final db = await database;
    await db.insert('subjects', subject.toJson(), conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<void> updateSubject(Subject subject) async {
    final db = await database;
    await db.update('subjects', subject.toJson(),
        where: 'id = ?', whereArgs: [subject.id]);
  }

  Future<void> deleteSubject(String subjectId) async {
    final db = await database;
    await db.delete('subjects', where: 'id = ?', whereArgs: [subjectId]);
  }

  Future<List<Subject>> getSubjects(String userId) async {
    final db = await database;
    final maps = await db.query('subjects', where: 'user_id = ?', whereArgs: [userId]);

    return List.generate(maps.length, (i) {
      final subject = Subject.fromJson(maps[i]);
      // Get topics for this subject
      // Note: topics will be loaded separately due to the foreign key relationship
      return subject;
    });
  }

  // Topics
  Future<void> insertTopic(Topic topic) async {
    final db = await database;
    await db.insert('topics', {
      'id': topic.id,
      'subject_id': topic.subjectId,
      'name': topic.name,
      'order_num': topic.order,
      'is_completed': topic.isCompleted ? 1 : 0,
      'description': topic.description,
    }, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<void> updateTopic(Topic topic) async {
    final db = await database;
    await db.update('topics', {
      'subject_id': topic.subjectId,
      'name': topic.name,
      'order_num': topic.order,
      'is_completed': topic.isCompleted ? 1 : 0,
      'description': topic.description,
    }, where: 'id = ?', whereArgs: [topic.id]);
  }

  Future<void> deleteTopic(String topicId) async {
    final db = await database;
    await db.delete('topics', where: 'id = ?', whereArgs: [topicId]);
  }

  Future<List<Topic>> getTopics(String subjectId) async {
    final db = await database;
    final maps = await db.query('topics', 
        where: 'subject_id = ?', 
        whereArgs: [subjectId], 
        orderBy: 'order_num');

    return List.generate(maps.length, (i) => Topic.fromJson(maps[i]));
  }

  // Study logs
  Future<void> insertStudyLog(StudyLogEntry log) async {
    final db = await database;
    await db.insert('study_logs', log.toJson(), conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<void> updateStudyLog(StudyLogEntry log) async {
    final db = await database;
    await db.update('study_logs', log.toJson(),
        where: 'id = ?', whereArgs: [log.id]);
  }

  Future<void> deleteStudyLog(String logId) async {
    final db = await database;
    await db.delete('study_logs', where: 'id = ?', whereArgs: [logId]);
  }

  Future<List<StudyLogEntry>> getStudyLogs(String userId) async {
    final db = await database;
    final maps = await db.query('study_logs', 
        where: 'user_id = ?', 
        whereArgs: [userId], 
        orderBy: 'date DESC');

    return List.generate(maps.length, (i) => StudyLogEntry.fromJson(maps[i]));
  }

  // Study sequences
  Future<void> insertStudySequence(StudySequence sequence) async {
    final db = await database;
    await db.insert('study_sequences', {
      'id': sequence.id,
      'user_id': sequence.userId,
      'name': sequence.name,
      'sequence': json.encode(sequence.sequence.map((e) => e.toJson()).toList()),
    }, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<StudySequence?> getStudySequence(String userId) async {
    final db = await database;
    final maps = await db.query('study_sequences', where: 'user_id = ?', whereArgs: [userId]);

    if (maps.isNotEmpty) {
      final map = maps.first;
      final sequenceList = (json.decode(map['sequence'] as String) as List).map((e) => StudySequenceItem.fromJson(e)).toList();
      return StudySequence(
        id: map['id'] as String,
        userId: map['user_id'] as String,
        name: map['name'] as String,
        sequence: sequenceList,
      );
    }
    return null;
  }

  // Pomodoro settings
  Future<void> insertPomodoroSettings(String userId, PomodoroSettings settings) async {
    final db = await database;
    await db.insert('pomodoro_settings', {
      'user_id': userId,
      'settings': json.encode(settings.toJson()),
    }, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<PomodoroSettings?> getPomodoroSettings(String userId) async {
    final db = await database;
    final maps = await db.query('pomodoro_settings', where: 'user_id = ?', whereArgs: [userId]);

    if (maps.isNotEmpty) {
      return PomodoroSettings.fromJson(json.decode(maps.first['settings'] as String));
    }
    return null;
  }

  // Templates
  Future<void> insertTemplate(SubjectTemplate template) async {
    final db = await database;
    await db.insert('templates', {
      'id': template.id,
      'user_id': template.userId,
      'name': template.name,
      'subjects': json.encode(template.subjects.map((e) => e.toJson()).toList()),
    }, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<List<SubjectTemplate>> getTemplates(String userId) async {
    final db = await database;
    final maps = await db.query('templates', where: 'user_id = ?', whereArgs: [userId]);

    return List.generate(maps.length, (i) {
      final map = maps[i];
      final subjectsList = (json.decode(map['subjects'] as String) as List).map((e) => TemplateSubject.fromJson(e)).toList();
      return SubjectTemplate(
        id: map['id'] as String,
        userId: map['user_id'] as String,
        name: map['name'] as String,
        subjects: subjectsList,
      );
    });
  }

  Future<void> deleteTemplate(String templateId) async {
    final db = await database;
    await db.delete('templates', where: 'id = ?', whereArgs: [templateId]);
  }

  // Schedule plans
  Future<void> insertSchedulePlan(SchedulePlan plan) async {
    final db = await database;
    await db.insert('schedule_plans', {
      'id': plan.id,
      'user_id': plan.userId,
      'name': plan.name,
      'total_horas_semanais': plan.totalHorasSemanais,
      'duracao_sessao': plan.duracaoSessao,
      'sub_modo_pomodoro': plan.subModoPomodoro != null ? (plan.subModoPomodoro! ? 1 : 0) : null,
      'sessoes_por_materia': plan.sessoesPorMateria != null 
          ? json.encode(plan.sessoesPorMateria!.map((e) => e.toJson()).toList()) 
          : null,
    }, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<List<SchedulePlan>> getSchedulePlans(String userId) async {
    final db = await database;
    final maps = await db.query('schedule_plans', where: 'user_id = ?', whereArgs: [userId]);

    return List.generate(maps.length, (i) {
      final map = maps[i];
      final sessoesList = map['sessoes_por_materia'] != null
          ? (json.decode(map['sessoes_por_materia'] as String) as List).map((e) => SessaoPorMateria.fromJson(e)).toList()
          : null;

      return SchedulePlan(
        id: map['id'] as String,
        userId: map['user_id'] as String,
        name: map['name'] as String,
        totalHorasSemanais: map['total_horas_semanais'] as int?,
        duracaoSessao: map['duracao_sessao'] as int?,
        subModoPomodoro: map['sub_modo_pomodoro'] != null ? (map['sub_modo_pomodoro'] as int) == 1 : null,
        sessoesPorMateria: sessoesList,
      );
    });
  }

  Future<void> deleteSchedulePlan(String planId) async {
    final db = await database;
    await db.delete('schedule_plans', where: 'id = ?', whereArgs: [planId]);
  }

  // Clear all data for a user (useful for logout)
  Future<void> clearUserData(String userId) async {
    final db = await database;
    
    // Delete related data first (due to foreign key constraints)
    await db.delete('topics', where: 'subject_id IN (SELECT id FROM subjects WHERE user_id = ?)', whereArgs: [userId]);
    await db.delete('study_logs', where: 'user_id = ?', whereArgs: [userId]);
    await db.delete('subjects', where: 'user_id = ?', whereArgs: [userId]);
    await db.delete('study_sequences', where: 'user_id = ?', whereArgs: [userId]);
    await db.delete('pomodoro_settings', where: 'user_id = ?', whereArgs: [userId]);
    await db.delete('templates', where: 'user_id = ?', whereArgs: [userId]);
    await db.delete('schedule_plans', where: 'user_id = ?', whereArgs: [userId]);
  }
}