import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/models.dart';
import '../repository/supabase_repository.dart';
import '../repository/local/offline_repository.dart';
import '../services/auth_provider.dart';

// Enum for active tab
enum ActiveTab {
  overview,
  schedule,
  planning,
  cycle,
  revision,
  history,
}

// Main study state
class StudyState {
  final StudyData data;
  final ActiveTab activeTab;
  final PomodoroState pomodoroState;
  final bool isLoading;

  StudyState({
    required this.data,
    required this.activeTab,
    required this.pomodoroState,
    required this.isLoading,
  });

  StudyState copyWith({
    StudyData? data,
    ActiveTab? activeTab,
    PomodoroState? pomodoroState,
    bool? isLoading,
  }) {
    return StudyState(
      data: data ?? this.data,
      activeTab: activeTab ?? this.activeTab,
      pomodoroState: pomodoroState ?? this.pomodoroState,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

// Pomodoro state
class PomodoroState {
  final PomodoroStatus status;
  final int timeRemaining; // in seconds
  final int currentCycle;
  final int pomodorosCompletedToday;
  final int key;
  final int? currentTaskIndex;
  final String? associatedItemId;
  final String? associatedItemType;

  PomodoroState({
    required this.status,
    required this.timeRemaining,
    required this.currentCycle,
    required this.pomodorosCompletedToday,
    required this.key,
    this.currentTaskIndex,
    this.associatedItemId,
    this.associatedItemType,
  });

  PomodoroState copyWith({
    PomodoroStatus? status,
    int? timeRemaining,
    int? currentCycle,
    int? pomodorosCompletedToday,
    int? key,
    int? currentTaskIndex,
    String? associatedItemId,
    String? associatedItemType,
  }) {
    return PomodoroState(
      status: status ?? this.status,
      timeRemaining: timeRemaining ?? this.timeRemaining,
      currentCycle: currentCycle ?? this.currentCycle,
      pomodorosCompletedToday: pomodorosCompletedToday ?? this.pomodorosCompletedToday,
      key: key ?? this.key,
      currentTaskIndex: currentTaskIndex ?? this.currentTaskIndex,
      associatedItemId: associatedItemId ?? this.associatedItemId,
      associatedItemType: associatedItemType ?? this.associatedItemType,
    );
  }
}

enum PomodoroStatus { idle, focus, shortBreak, longBreak, paused }

// Main study provider
final studyStateProvider = StateNotifierProvider<StudyStateNotifier, StudyState>(
  (ref) => StudyStateNotifier(
    ref.watch(authStateProvider.select((value) => value.user)),
    Supabase.instance.client,
  ),
);

class StudyStateNotifier extends StateNotifier<StudyState> {
  final User? _user;
  final SupabaseClient _supabaseClient;
  final SupabaseRepository _repository;
  final OfflineRepository _offlineRepository;

  StudyStateNotifier(this._user, this._supabaseClient)
      : _repository = SupabaseRepository(_supabaseClient),
        _offlineRepository = OfflineRepository(),
        super(
          StudyState(
            data: StudyData.empty(),
            activeTab: ActiveTab.overview,
            pomodoroState: PomodoroState(
              status: PomodoroStatus.idle,
              timeRemaining: 0,
              currentCycle: 0,
              pomodorosCompletedToday: 0,
              key: 0,
            ),
            isLoading: true,
          ),
        ) {
    // Load initial data when user is available
    if (_user != null) {
      _loadInitialData();
    } else {
      // If user is null (shouldn't happen with fake user), initialize empty
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> _loadInitialData() async {
    if (_user == null) return;

    state = state.copyWith(isLoading: true);

    try {
      // Try to load from Supabase first
      List<Subject> subjects = [];
      List<StudyLogEntry> studyLogs = [];
      PomodoroSettings? pomodoroSettings;
      StudySequence? studySequence;
      List<SubjectTemplate> templates = [];
      List<SchedulePlan> schedulePlans = [];
      bool hasOnlineData = false;

      try {
        // Load all data concurrently from Supabase
        final subjectsFuture = _repository.getSubjects(_user!.id);
        final studyLogsFuture = _repository.getStudyLogs(_user!.id);
        final pomodoroSettingsFuture = _repository.getPomodoroSettings(_user!.id);
        final studySequenceFuture = _repository.getStudySequence(_user!.id);
        final templatesFuture = _repository.getTemplates(_user!.id);
        final schedulePlansFuture = _repository.getSchedulePlans(_user!.id);

        subjects = await subjectsFuture;
        studyLogs = await studyLogsFuture;
        pomodoroSettings = await pomodoroSettingsFuture;
        studySequence = await studySequenceFuture;
        templates = await templatesFuture;
        schedulePlans = await schedulePlansFuture;

        // Load topics for each subject from Supabase
        final subjectsWithTopics = <Subject>[];
        for (final subject in subjects) {
          final topics = await _repository.getTopics(subject.id);
          subjectsWithTopics.add(subject.copyWith(topics: topics));
        }
        subjects = subjectsWithTopics;

        // Mark that we have online data
        hasOnlineData = true;
      } catch (e) {
        print('Error loading from Supabase (possibly offline): $e');
        // Continue with offline data
      }

      // If no online data was loaded, try offline storage
      if (!hasOnlineData) {
        subjects = await _offlineRepository.getSubjects(_user!.id);
        studyLogs = await _offlineRepository.getStudyLogs(_user!.id);
        pomodoroSettings = await _offlineRepository.getPomodoroSettings(_user!.id);
        studySequence = await _offlineRepository.getStudySequence(_user!.id);
        templates = await _offlineRepository.getTemplates(_user!.id);
        schedulePlans = await _offlineRepository.getSchedulePlans(_user!.id);

        // Load topics for each subject from offline storage
        final subjectsWithTopics = <Subject>[];
        for (final subject in subjects) {
          final topics = await _offlineRepository.getTopics(subject.id);
          subjectsWithTopics.add(subject.copyWith(topics: topics));
        }
        subjects = subjectsWithTopics;
      }

      // Calculate streak and last studied date from study logs
      String? lastStudiedDate;
      int streak = 0;
      if (studyLogs.isNotEmpty) {
        // Use the most recent log date
        lastStudiedDate = studyLogs.first.date;

        // Calculate streak - simplified for now
        // In a real implementation, you'd calculate this from the logs
        streak = 0; // For now, keep as 0 until we implement the full algorithm
      }

      final updatedData = StudyData(
        subjects: subjects,
        studyLog: studyLogs,
        lastStudiedDate: lastStudiedDate,
        streak: streak,
        studySequence: studySequence,
        sequenceIndex: 0, // This might need to come from the sequence data
        pomodoroSettings: pomodoroSettings ?? PomodoroSettings.empty(),
        templates: templates,
        schedulePlans: schedulePlans,
      );

      state = state.copyWith(
        data: updatedData,
        isLoading: false,
      );
    } catch (e) {
      print('Error loading initial data: $e');
      state = state.copyWith(isLoading: false);
    }
  }

  void setActiveTab(ActiveTab tab) {
    state = state.copyWith(activeTab: tab);
  }

  Future<void> addSubject(String userId, String name, String color, {String? description, int? studyDuration, String? materialUrl}) async {
    final newSubject = Subject.create(
      userId: userId,
      name: name,
      color: color,
      description: description,
      studyDuration: studyDuration,
      materialUrl: materialUrl,
    );

    // Try to save to Supabase first
    Subject savedSubject;
    try {
      savedSubject = await _repository.upsertSubject(newSubject);
    } catch (e) {
      print('Error saving subject to Supabase: $e, saving to offline storage');
      // Save to offline storage as fallback
      await _offlineRepository.upsertSubject(newSubject);
      savedSubject = newSubject;
    }

    state = state.copyWith(
      data: state.data.copyWith(
        subjects: [...state.data.subjects, savedSubject],
      ),
    );
  }

  Future<void> updateSubject(String subjectId, {String? name, String? color, String? description, int? studyDuration, String? materialUrl}) async {
    // Find the existing subject
    final subject = state.data.subjects.firstWhere((s) => s.id == subjectId);
    final updatedSubject = subject.copyWith(
      name: name ?? subject.name,
      color: color ?? subject.color,
      description: description,
      studyDuration: studyDuration,
      materialUrl: materialUrl,
    );

    // Try to save to Supabase first
    Subject savedSubject;
    try {
      savedSubject = await _repository.upsertSubject(updatedSubject);
    } catch (e) {
      print('Error saving subject to Supabase: $e, saving to offline storage');
      // Save to offline storage as fallback
      await _offlineRepository.upsertSubject(updatedSubject);
      savedSubject = updatedSubject;
    }

    state = state.copyWith(
      data: state.data.copyWith(
        subjects: state.data.subjects.map((subject) {
          if (subject.id == subjectId) {
            return savedSubject;
          }
          return subject;
        }).toList(),
      ),
    );
  }

  Future<void> deleteSubject(String subjectId) async {
    // Try to delete from Supabase first
    try {
      await _repository.deleteSubject(subjectId);
    } catch (e) {
      print('Error deleting subject from Supabase: $e, deleting from offline storage');
      // Delete from offline storage as fallback
      await _offlineRepository.deleteSubject(subjectId);
    }

    state = state.copyWith(
      data: state.data.copyWith(
        subjects: state.data.subjects.where((subject) => subject.id != subjectId).toList(),
      ),
    );
  }

  Future<void> addTopic(String subjectId, String name) async {
    final newTopic = Topic.create(
      subjectId: subjectId,
      name: name,
    );

    // Try to save to Supabase first
    Topic savedTopic;
    try {
      savedTopic = await _repository.upsertTopic(newTopic);
    } catch (e) {
      print('Error saving topic to Supabase: $e, saving to offline storage');
      // Save to offline storage as fallback
      await _offlineRepository.upsertTopic(newTopic);
      savedTopic = newTopic;
    }

    state = state.copyWith(
      data: state.data.copyWith(
        subjects: state.data.subjects.map((subject) {
          if (subject.id == subjectId) {
            return subject.copyWith(
              topics: [...subject.topics, savedTopic],
            );
          }
          return subject;
        }).toList(),
      ),
    );
  }

  Future<void> toggleTopicCompleted(String subjectId, String topicId) async {
    state = state.copyWith(
      data: state.data.copyWith(
        subjects: state.data.subjects.map((subject) {
          if (subject.id == subjectId) {
            return subject.copyWith(
              topics: subject.topics.map((topic) {
                if (topic.id == topicId) {
                  final updatedTopic = topic.copyWith(isCompleted: !topic.isCompleted);
                  // Try to save to Supabase first, fallback to offline storage
                  try {
                    _repository.upsertTopic(updatedTopic);
                  } catch (e) {
                    print('Error saving topic to Supabase: $e, saving to offline storage');
                    _offlineRepository.upsertTopic(updatedTopic);
                  }
                  return updatedTopic;
                }
                return topic;
              }).toList(),
            );
          }
          return subject;
        }).toList(),
      ),
    );
  }

  Future<void> deleteTopic(String subjectId, String topicId) async {
    // Try to delete from Supabase first
    try {
      await _repository.deleteTopic(topicId);
    } catch (e) {
      print('Error deleting topic from Supabase: $e, deleting from offline storage');
      // Delete from offline storage as fallback
      await _offlineRepository.deleteTopic(topicId);
    }

    state = state.copyWith(
      data: state.data.copyWith(
        subjects: state.data.subjects.map((subject) {
          if (subject.id == subjectId) {
            return subject.copyWith(
              topics: subject.topics.where((topic) => topic.id != topicId).toList(),
            );
          }
          return subject;
        }).toList(),
      ),
    );
  }

  Future<void> setRevisionProgress(String subjectId, int progress) async {
    state = state.copyWith(
      data: state.data.copyWith(
        subjects: state.data.subjects.map((subject) {
          if (subject.id == subjectId) {
            final updatedSubject = subject.copyWith(revisionProgress: progress);

            // For now, just update in memory since revision progress is stored in the subjects table
            // In a full implementation, you might want to save this to Supabase as well
            return updatedSubject;
          }
          return subject;
        }).toList(),
      ),
    );
  }

  Future<void> addStudyLog({
    String? id,
    required String userId,
    required String subjectId,
    String? topicId,
    String? date,
    required int duration,
    int? startPage,
    int? endPage,
    int questionsTotal = 0,
    int questionsCorrect = 0,
    String source = 'manual',
    int? sequenceItemIndex,
  }) async {
    final newLog = StudyLogEntry.create(
      id: id,
      userId: userId,
      subjectId: subjectId,
      topicId: topicId,
      date: date,
      duration: duration,
      startPage: startPage,
      endPage: endPage,
      questionsTotal: questionsTotal,
      questionsCorrect: questionsCorrect,
      source: source,
      sequenceItemIndex: sequenceItemIndex,
    );

    // Try to save to Supabase first
    StudyLogEntry savedLog;
    try {
      savedLog = await _repository.insertStudyLog(newLog);
    } catch (e) {
      print('Error saving study log to Supabase: $e, saving to offline storage');
      // Save to offline storage as fallback
      await _offlineRepository.insertStudyLog(newLog);
      savedLog = newLog;
    }

    // Update streak logic
    int newStreak = state.data.streak;
    String? newLastStudiedDate = state.data.lastStudiedDate;

    final today = DateTime.now();
    final todayString = today.toIso8601String().split('T')[0];

    if (newLastStudiedDate == null) {
      // First log entry
      newStreak = 1;
      newLastStudiedDate = todayString;
    } else {
      final lastDate = DateTime.parse(newLastStudiedDate.split('T')[0]);
      final yesterday = DateTime(today.year, today.month, today.day).subtract(const Duration(days: 1));

      if (lastDate.isAtSameMomentAs(yesterday) ||
          (DateTime(today.year, today.month, today.day).isAtSameMomentAs(DateTime.parse(newLastStudiedDate.split('T')[0]).add(const Duration(days: 1))))) {
        // Consecutive day
        newStreak = state.data.streak + 1;
      } else if (lastDate.isAtSameMomentAs(DateTime(today.year, today.month, today.day))) {
        // Same day - streak remains the same
        newStreak = state.data.streak;
      } else {
        // Not consecutive - reset to 1
        newStreak = 1;
      }
      newLastStudiedDate = todayString;
    }

    // Update study sequence if applicable
    StudySequence? newStudySequence = state.data.studySequence;
    int newSequenceIndex = state.data.sequenceIndex;

    if (newStudySequence != null && sequenceItemIndex != null) {
      final newSequence = List<StudySequenceItem>.from(newStudySequence.sequence);
      if (sequenceItemIndex < newSequence.length) {
        final itemToUpdate = newSequence[sequenceItemIndex];
        if (itemToUpdate.subjectId == subjectId) {
          final newTotalTime = (itemToUpdate.totalTimeStudied ?? 0) + duration * 60; // Convert minutes to seconds
          newSequence[sequenceItemIndex] = itemToUpdate.copyWith(totalTimeStudied: newTotalTime);

          // Check if current item is complete and advance sequence
          final subject = state.data.subjects.firstWhere((s) => s.id == subjectId);
          final timeGoal = (subject.studyDuration ?? 0) * 60; // Convert minutes to seconds

          if (sequenceItemIndex == newSequenceIndex && timeGoal > 0 && newTotalTime >= timeGoal) {
            newSequenceIndex = newSequenceIndex + 1;
          }

          // Update the sequence in Supabase
          newStudySequence = newStudySequence.copyWith(sequence: newSequence);
          try {
            await _repository.upsertStudySequence(newStudySequence);
          } catch (e) {
            print('Error saving study sequence to Supabase: $e, saving to offline storage');
            await _offlineRepository.upsertStudySequence(newStudySequence);
          }
        }
      }
    }

    state = state.copyWith(
      data: state.data.copyWith(
        studyLog: [savedLog, ...state.data.studyLog],
        streak: newStreak,
        lastStudiedDate: newLastStudiedDate,
        studySequence: newStudySequence,
        sequenceIndex: newSequenceIndex,
      ),
    );
  }

  Future<void> updateStudyLog(StudyLogEntry updatedLog) async {
    // Update in Supabase
    final savedLog = await _repository.updateStudyLog(updatedLog);

    state = state.copyWith(
      data: state.data.copyWith(
        studyLog: state.data.studyLog.map((log) {
          if (log.id == updatedLog.id) {
            return savedLog;
          }
          return log;
        }).toList(),
      ),
    );
  }

  Future<void> deleteStudyLog(String logId) async {
    // Delete from Supabase
    await _repository.deleteStudyLog(logId);

    state = state.copyWith(
      data: state.data.copyWith(
        studyLog: state.data.studyLog.where((log) => log.id != logId).toList(),
      ),
    );
  }

  Future<void> saveStudySequence(StudySequence sequence) async {
    // Save to Supabase
    final savedSequence = await _repository.upsertStudySequence(sequence);

    bool isNew = state.data.studySequence?.id != sequence.id;
    int newSequenceIndex = 0;

    if (!isNew && state.data.sequenceIndex < sequence.sequence.length) {
      newSequenceIndex = state.data.sequenceIndex;
    }

    state = state.copyWith(
      data: state.data.copyWith(
        studySequence: savedSequence,
        sequenceIndex: newSequenceIndex,
      ),
    );
  }

  Future<void> resetStudySequence() async {
    if (state.data.studySequence != null) {
      final resetSequence = state.data.studySequence!.sequence
          .map((item) => item.copyWith(totalTimeStudied: 0))
          .toList();

      final updatedSequence = state.data.studySequence!.copyWith(sequence: resetSequence);

      // Save to Supabase
      final savedSequence = await _repository.upsertStudySequence(updatedSequence);

      state = state.copyWith(
        data: state.data.copyWith(
          studySequence: savedSequence,
          sequenceIndex: 0,
        ),
      );
    }
  }

  void advanceSequence() {
    if (state.data.studySequence != null) {
      state = state.copyWith(
        data: state.data.copyWith(sequenceIndex: state.data.sequenceIndex + 1),
      );
    }
  }

  void updatePomodoroState(PomodoroState newState) {
    state = state.copyWith(
      pomodoroState: newState,
    );
  }

  Future<void> updatePomodoroSettings(PomodoroSettings settings) async {
    // Try to save to Supabase first
    try {
      await _repository.upsertPomodoroSettings(_user!.id, settings);
    } catch (e) {
      print('Error saving Pomodoro settings to Supabase: $e, saving to offline storage');
      // Save to offline storage as fallback
      await _offlineRepository.upsertPomodoroSettings(_user!.id, settings);
    }

    state = state.copyWith(
      data: state.data.copyWith(pomodoroSettings: settings),
    );
  }

  Future<void> saveTemplate(String userId, String name, List<Subject> subjects) async {
    final templateSubjects = subjects.map((s) {
      return TemplateSubject(
        name: s.name,
        color: s.color,
        description: s.description,
        studyDuration: s.studyDuration,
        materialUrl: s.materialUrl,
        revisionProgress: 0,
        topics: s.topics.map((t) => TemplateTopic(
          name: t.name,
          order: t.order,
          isCompleted: false,
        )).toList(),
      );
    }).toList();

    final newTemplate = SubjectTemplate.create(
      userId: userId,
      name: name,
      subjects: templateSubjects,
    );

    // Save to Supabase
    final savedTemplate = await _repository.upsertTemplate(newTemplate);

    state = state.copyWith(
      data: state.data.copyWith(
        templates: [...state.data.templates, savedTemplate],
      ),
    );
  }

  Future<void> deleteTemplate(String templateId) async {
    // Delete from Supabase
    await _repository.deleteTemplate(templateId);

    state = state.copyWith(
      data: state.data.copyWith(
        templates: state.data.templates.where((t) => t.id != templateId).toList(),
      ),
    );
  }

  Future<void> addSchedulePlan(SchedulePlan plan) async {
    // Save to Supabase
    final savedPlan = await _repository.upsertSchedulePlan(plan);

    state = state.copyWith(
      data: state.data.copyWith(
        schedulePlans: [...state.data.schedulePlans, savedPlan],
      ),
    );
  }

  Future<void> deleteSchedulePlan(String planId) async {
    // Delete from Supabase
    await _repository.deleteSchedulePlan(planId);

    state = state.copyWith(
      data: state.data.copyWith(
        schedulePlans: state.data.schedulePlans.where((p) => p.id != planId).toList(),
      ),
    );
  }
}