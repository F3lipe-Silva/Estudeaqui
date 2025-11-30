import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../models/models.dart';
import 'local_database_helper.dart';

class OfflineRepository {
  final LocalDatabaseHelper _dbHelper = LocalDatabaseHelper();
  static const String _lastSyncKey = 'last_sync_time';
  static const String _isOnlineKey = 'is_online';

  // Get user's subjects from local storage
  Future<List<Subject>> getSubjects(String userId) async {
    try {
      return await _dbHelper.getSubjects(userId);
    } catch (e) {
      // Fallback to SharedPreferences if database fails
      final prefs = await SharedPreferences.getInstance();
      final subjectsJson = prefs.getString('subjects_$userId');
      
      if (subjectsJson != null) {
        final list = json.decode(subjectsJson) as List;
        return list.map((json) => Subject.fromJson(json)).toList();
      }
      return [];
    }
  }

  // Insert or update a subject in local storage
  Future<void> upsertSubject(Subject subject) async {
    try {
      await _dbHelper.insertSubject(subject);
    } catch (e) {
      // Fallback to SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final userId = subject.userId;
      final existingSubjectsJson = prefs.getString('subjects_$userId') ?? '[]';
      final existingSubjects = json.decode(existingSubjectsJson) as List;
      
      // Check if subject already exists to update or add
      bool found = false;
      for (int i = 0; i < existingSubjects.length; i++) {
        if (existingSubjects[i]['id'] == subject.id) {
          existingSubjects[i] = subject.toJson();
          found = true;
          break;
        }
      }
      
      if (!found) {
        existingSubjects.add(subject.toJson());
      }
      
      await prefs.setString('subjects_$userId', json.encode(existingSubjects));
    }
  }

  // Delete a subject from local storage
  Future<void> deleteSubject(String subjectId) async {
    try {
      await _dbHelper.deleteSubject(subjectId);
    } catch (e) {
      // Fallback to SharedPreferences - this is more complex as we need to find the user ID
      // For now, assume we can get user ID from the subject (would need to change implementation)
      print('OfflineRepository: Could not delete subject from local DB: $e');
    }
  }

  // Get topics for a subject from local storage
  Future<List<Topic>> getTopics(String subjectId) async {
    try {
      return await _dbHelper.getTopics(subjectId);
    } catch (e) {
      // Fallback to SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final topicsJson = prefs.getString('topics_$subjectId');
      
      if (topicsJson != null) {
        final list = json.decode(topicsJson) as List;
        return list.map((json) => Topic.fromJson(json)).toList();
      }
      return [];
    }
  }

  // Insert or update a topic in local storage
  Future<void> upsertTopic(Topic topic) async {
    try {
      await _dbHelper.insertTopic(topic);
    } catch (e) {
      // Fallback to SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final subjectId = topic.subjectId;
      final existingTopicsJson = prefs.getString('topics_$subjectId') ?? '[]';
      final existingTopics = json.decode(existingTopicsJson) as List;
      
      // Check if topic already exists to update or add
      bool found = false;
      for (int i = 0; i < existingTopics.length; i++) {
        if (existingTopics[i]['id'] == topic.id) {
          existingTopics[i] = topic.toJson();
          found = true;
          break;
        }
      }
      
      if (!found) {
        existingTopics.add(topic.toJson());
      }
      
      await prefs.setString('topics_$subjectId', json.encode(existingTopics));
    }
  }

  // Delete a topic from local storage
  Future<void> deleteTopic(String topicId) async {
    try {
      await _dbHelper.deleteTopic(topicId);
    } catch (e) {
      print('OfflineRepository: Could not delete topic from local DB: $e');
    }
  }

  // Get study logs for a user from local storage
  Future<List<StudyLogEntry>> getStudyLogs(String userId) async {
    try {
      return await _dbHelper.getStudyLogs(userId);
    } catch (e) {
      // Fallback to SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final logsJson = prefs.getString('study_logs_$userId');
      
      if (logsJson != null) {
        final list = json.decode(logsJson) as List;
        return list.map((json) => StudyLogEntry.fromJson(json)).toList();
      }
      return [];
    }
  }

  // Insert a study log in local storage
  Future<void> insertStudyLog(StudyLogEntry log) async {
    try {
      await _dbHelper.insertStudyLog(log);
    } catch (e) {
      // Fallback to SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final userId = log.userId;
      final existingLogsJson = prefs.getString('study_logs_$userId') ?? '[]';
      final existingLogs = json.decode(existingLogsJson) as List;
      
      existingLogs.add(log.toJson());
      
      await prefs.setString('study_logs_$userId', json.encode(existingLogs));
    }
  }

  // Update a study log in local storage
  Future<void> updateStudyLog(StudyLogEntry log) async {
    try {
      await _dbHelper.updateStudyLog(log);
    } catch (e) {
      // Fallback to SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final userId = log.userId;
      final existingLogsJson = prefs.getString('study_logs_$userId') ?? '[]';
      final existingLogs = json.decode(existingLogsJson) as List;
      
      // Find and update the log
      for (int i = 0; i < existingLogs.length; i++) {
        if (existingLogs[i]['id'] == log.id) {
          existingLogs[i] = log.toJson();
          break;
        }
      }
      
      await prefs.setString('study_logs_$userId', json.encode(existingLogs));
    }
  }

  // Delete a study log from local storage
  Future<void> deleteStudyLog(String logId) async {
    try {
      await _dbHelper.deleteStudyLog(logId);
    } catch (e) {
      print('OfflineRepository: Could not delete study log from local DB: $e');
    }
  }

  // Get user's study sequence from local storage
  Future<StudySequence?> getStudySequence(String userId) async {
    try {
      return await _dbHelper.getStudySequence(userId);
    } catch (e) {
      // Fallback to SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final sequenceJson = prefs.getString('study_sequence_$userId');
      
      if (sequenceJson != null) {
        final jsonMap = json.decode(sequenceJson);
        return StudySequence.fromJson(jsonMap);
      }
      return null;
    }
  }

  // Insert or update a study sequence in local storage
  Future<void> upsertStudySequence(StudySequence sequence) async {
    try {
      await _dbHelper.insertStudySequence(sequence);
    } catch (e) {
      // Fallback to SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('study_sequence_${sequence.userId}', json.encode(sequence.toJson()));
    }
  }

  // Get user's Pomodoro settings from local storage
  Future<PomodoroSettings?> getPomodoroSettings(String userId) async {
    try {
      return await _dbHelper.getPomodoroSettings(userId);
    } catch (e) {
      // Fallback to SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final settingsJson = prefs.getString('pomodoro_settings_$userId');
      
      if (settingsJson != null) {
        final jsonMap = json.decode(settingsJson);
        return PomodoroSettings.fromJson(jsonMap);
      }
      return null;
    }
  }

  // Upsert Pomodoro settings in local storage
  Future<void> upsertPomodoroSettings(String userId, PomodoroSettings settings) async {
    try {
      await _dbHelper.insertPomodoroSettings(userId, settings);
    } catch (e) {
      // Fallback to SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('pomodoro_settings_$userId', json.encode(settings.toJson()));
    }
  }

  // Get user's templates from local storage
  Future<List<SubjectTemplate>> getTemplates(String userId) async {
    try {
      return await _dbHelper.getTemplates(userId);
    } catch (e) {
      // Fallback to SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final templatesJson = prefs.getString('templates_$userId');
      
      if (templatesJson != null) {
        final list = json.decode(templatesJson) as List;
        return list.map((json) => SubjectTemplate.fromJson(json)).toList();
      }
      return [];
    }
  }

  // Insert or update a template in local storage
  Future<void> upsertTemplate(SubjectTemplate template) async {
    try {
      await _dbHelper.insertTemplate(template);
    } catch (e) {
      // Fallback to SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final userId = template.userId;
      final existingTemplatesJson = prefs.getString('templates_$userId') ?? '[]';
      final existingTemplates = json.decode(existingTemplatesJson) as List;
      
      // Check if template already exists to update or add
      bool found = false;
      for (int i = 0; i < existingTemplates.length; i++) {
        if (existingTemplates[i]['id'] == template.id) {
          existingTemplates[i] = template.toJson();
          found = true;
          break;
        }
      }
      
      if (!found) {
        existingTemplates.add(template.toJson());
      }
      
      await prefs.setString('templates_$userId', json.encode(existingTemplates));
    }
  }

  // Delete a template from local storage
  Future<void> deleteTemplate(String templateId) async {
    try {
      await _dbHelper.deleteTemplate(templateId);
    } catch (e) {
      print('OfflineRepository: Could not delete template from local DB: $e');
    }
  }

  // Get user's schedule plans from local storage
  Future<List<SchedulePlan>> getSchedulePlans(String userId) async {
    try {
      return await _dbHelper.getSchedulePlans(userId);
    } catch (e) {
      // Fallback to SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final plansJson = prefs.getString('schedule_plans_$userId');
      
      if (plansJson != null) {
        final list = json.decode(plansJson) as List;
        return list.map((json) => SchedulePlan.fromJson(json)).toList();
      }
      return [];
    }
  }

  // Insert or update a schedule plan in local storage
  Future<void> upsertSchedulePlan(SchedulePlan plan) async {
    try {
      await _dbHelper.insertSchedulePlan(plan);
    } catch (e) {
      // Fallback to SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final userId = plan.userId;
      final existingPlansJson = prefs.getString('schedule_plans_$userId') ?? '[]';
      final existingPlans = json.decode(existingPlansJson) as List;
      
      // Check if plan already exists to update or add
      bool found = false;
      for (int i = 0; i < existingPlans.length; i++) {
        if (existingPlans[i]['id'] == plan.id) {
          existingPlans[i] = plan.toJson();
          found = true;
          break;
        }
      }
      
      if (!found) {
        existingPlans.add(plan.toJson());
      }
      
      await prefs.setString('schedule_plans_$userId', json.encode(existingPlans));
    }
  }

  // Delete a schedule plan from local storage
  Future<void> deleteSchedulePlan(String planId) async {
    try {
      await _dbHelper.deleteSchedulePlan(planId);
    } catch (e) {
      print('OfflineRepository: Could not delete schedule plan from local DB: $e');
    }
  }

  // Helper methods for sync state
  Future<DateTime?> getLastSyncTime() async {
    final prefs = await SharedPreferences.getInstance();
    final timestamp = prefs.getInt(_lastSyncKey);
    return timestamp != null ? DateTime.fromMillisecondsSinceEpoch(timestamp) : null;
  }

  Future<void> setLastSyncTime(DateTime time) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_lastSyncKey, time.millisecondsSinceEpoch);
  }

  Future<bool> isOnline() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_isOnlineKey) ?? true; // Default to online
  }

  Future<void> setOnlineStatus(bool isOnline) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_isOnlineKey, isOnline);
  }

  // Clear all local data for a user
  Future<void> clearUserData(String userId) async {
    try {
      await _dbHelper.clearUserData(userId);
    } catch (e) {
      // Fallback to SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('subjects_$userId');
      await prefs.remove('topics_for_$userId'); // This would need to be implemented differently
      await prefs.remove('study_logs_$userId');
      await prefs.remove('study_sequence_$userId');
      await prefs.remove('pomodoro_settings_$userId');
      await prefs.remove('templates_$userId');
      await prefs.remove('schedule_plans_$userId');
    }
  }
}