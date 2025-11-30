import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/models.dart';

class SupabaseRepository {
  final SupabaseClient _client;

  SupabaseRepository(this._client);

  // Get user's subjects
  Future<List<Subject>> getSubjects(String userId) async {
    final response = await _client
        .from('subjects')
        .select()
        .eq('user_id', userId)
        .order('name');

    return response
        .map((json) => Subject.fromJson(json))
        .toList();
  }

  // Insert or update a subject
  Future<Subject> upsertSubject(Subject subject) async {
    final response = await _client
        .from('subjects')
        .upsert({
          'id': subject.id,
          'user_id': subject.userId,
          'name': subject.name,
          'color': subject.color,
          'description': subject.description,
          'study_duration': subject.studyDuration,
          'material_url': subject.materialUrl,
          'revision_progress': subject.revisionProgress,
        })
        .select()
        .single();

    return Subject.fromJson(response);
  }

  // Delete a subject
  Future<void> deleteSubject(String subjectId) async {
    await _client.from('subjects').delete().eq('id', subjectId);
  }

  // Get topics for a subject
  Future<List<Topic>> getTopics(String subjectId) async {
    final response = await _client
        .from('topics')
        .select()
        .eq('subject_id', subjectId)
        .order('order');

    return response
        .map((json) => Topic.fromJson(json))
        .toList();
  }

  // Insert or update a topic
  Future<Topic> upsertTopic(Topic topic) async {
    final response = await _client
        .from('topics')
        .upsert({
          'id': topic.id,
          'subject_id': topic.subjectId,
          'name': topic.name,
          'order': topic.order,
          'is_completed': topic.isCompleted,
          'description': topic.description,
        })
        .select()
        .single();

    return Topic.fromJson(response);
  }

  // Delete a topic
  Future<void> deleteTopic(String topicId) async {
    await _client.from('topics').delete().eq('id', topicId);
  }

  // Get study logs for a user
  Future<List<StudyLogEntry>> getStudyLogs(String userId) async {
    final response = await _client
        .from('study_logs')
        .select()
        .eq('user_id', userId)
        .order('date', ascending: false);

    return response
        .map((json) => StudyLogEntry.fromJson(json))
        .toList();
  }

  // Insert a study log
  Future<StudyLogEntry> insertStudyLog(StudyLogEntry log) async {
    final response = await _client
        .from('study_logs')
        .insert({
          'id': log.id,
          'user_id': log.userId,
          'subject_id': log.subjectId,
          'topic_id': log.topicId,
          'date': log.date,
          'duration': log.duration,
          'start_page': log.startPage,
          'end_page': log.endPage,
          'questions_total': log.questionsTotal,
          'questions_correct': log.questionsCorrect,
          'source': log.source,
          'sequence_item_index': log.sequenceItemIndex,
        })
        .select()
        .single();

    return StudyLogEntry.fromJson(response);
  }

  // Update a study log
  Future<StudyLogEntry> updateStudyLog(StudyLogEntry log) async {
    final response = await _client
        .from('study_logs')
        .update({
          'subject_id': log.subjectId,
          'topic_id': log.topicId,
          'date': log.date,
          'duration': log.duration,
          'start_page': log.startPage,
          'end_page': log.endPage,
          'questions_total': log.questionsTotal,
          'questions_correct': log.questionsCorrect,
          'source': log.source,
          'sequence_item_index': log.sequenceItemIndex,
        })
        .eq('id', log.id)
        .select()
        .single();

    return StudyLogEntry.fromJson(response);
  }

  // Delete a study log
  Future<void> deleteStudyLog(String logId) async {
    await _client.from('study_logs').delete().eq('id', logId);
  }

  // Get user's study sequence
  Future<StudySequence?> getStudySequence(String userId) async {
    final response = await _client
        .from('study_sequences')
        .select()
        .eq('user_id', userId)
        .limit(1);

    if (response.isNotEmpty) {
      return StudySequence.fromJson(response.first);
    }
    return null;
  }

  // Insert or update a study sequence
  Future<StudySequence> upsertStudySequence(StudySequence sequence) async {
    final response = await _client
        .from('study_sequences')
        .upsert({
          'id': sequence.id,
          'user_id': sequence.userId,
          'name': sequence.name,
          'sequence': sequence.sequence.map((item) => item.toJson()).toList(),
        })
        .select()
        .single();

    return StudySequence.fromJson(response);
  }

  // Get user's Pomodoro settings
  Future<PomodoroSettings?> getPomodoroSettings(String userId) async {
    final response = await _client
        .from('pomodoro_settings')
        .select()
        .eq('user_id', userId)
        .limit(1);

    if (response.isNotEmpty) {
      return PomodoroSettings.fromJson(response.first['settings']);
    }
    return null;
  }

  // Upsert Pomodoro settings
  Future<void> upsertPomodoroSettings(String userId, PomodoroSettings settings) async {
    await _client
        .from('pomodoro_settings')
        .upsert({
          'user_id': userId,
          'settings': settings.toJson(),
        });
  }

  // Get user's templates
  Future<List<SubjectTemplate>> getTemplates(String userId) async {
    final response = await _client
        .from('templates')
        .select()
        .eq('user_id', userId);

    return response
        .map((json) => SubjectTemplate.fromJson(json))
        .toList();
  }

  // Insert or update a template
  Future<SubjectTemplate> upsertTemplate(SubjectTemplate template) async {
    final response = await _client
        .from('templates')
        .upsert({
          'id': template.id,
          'user_id': template.userId,
          'name': template.name,
          'subjects': template.subjects.map((s) => s.toJson()).toList(),
        })
        .select()
        .single();

    return SubjectTemplate.fromJson(response);
  }

  // Delete a template
  Future<void> deleteTemplate(String templateId) async {
    await _client.from('templates').delete().eq('id', templateId);
  }

  // Get user's schedule plans
  Future<List<SchedulePlan>> getSchedulePlans(String userId) async {
    final response = await _client
        .from('schedule_plans')
        .select()
        .eq('user_id', userId);

    return response
        .map((json) => SchedulePlan.fromJson(json))
        .toList();
  }

  // Insert or update a schedule plan
  Future<SchedulePlan> upsertSchedulePlan(SchedulePlan plan) async {
    final response = await _client
        .from('schedule_plans')
        .upsert({
          'id': plan.id,
          'user_id': plan.userId,
          'name': plan.name,
          'total_horas_semanais': plan.totalHorasSemanais,
          'duracao_sessao': plan.duracaoSessao,
          'sub_modo_pomodoro': plan.subModoPomodoro,
          'sessoes_por_materia': plan.sessoesPorMateria?.map((s) => s.toJson()).toList(),
        })
        .select()
        .single();

    return SchedulePlan.fromJson(response);
  }

  // Delete a schedule plan
  Future<void> deleteSchedulePlan(String planId) async {
    await _client.from('schedule_plans').delete().eq('id', planId);
  }
}