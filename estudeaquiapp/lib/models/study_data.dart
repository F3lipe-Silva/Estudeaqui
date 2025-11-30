import 'package:uuid/uuid.dart';
import 'subject.dart';
import 'study_log_entry.dart';
import 'study_sequence.dart';
import 'pomodoro_settings.dart';
import 'subject_template.dart';
import 'schedule_plan.dart';

class StudyData {
  List<Subject> subjects;
  List<StudyLogEntry> studyLog;
  String? lastStudiedDate;
  int streak;
  StudySequence? studySequence;
  int sequenceIndex;
  PomodoroSettings pomodoroSettings;
  List<SubjectTemplate> templates;
  List<SchedulePlan> schedulePlans;

  StudyData({
    required this.subjects,
    required this.studyLog,
    this.lastStudiedDate,
    required this.streak,
    this.studySequence,
    required this.sequenceIndex,
    required this.pomodoroSettings,
    required this.templates,
    required this.schedulePlans,
  });

  factory StudyData.empty() {
    return StudyData(
      subjects: [],
      studyLog: [],
      streak: 0,
      sequenceIndex: 0,
      pomodoroSettings: PomodoroSettings.empty(),
      templates: [],
      schedulePlans: [],
    );
  }
  
  StudyData copyWith({
    List<Subject>? subjects,
    List<StudyLogEntry>? studyLog,
    String? lastStudiedDate,
    int? streak,
    StudySequence? studySequence,
    int? sequenceIndex,
    PomodoroSettings? pomodoroSettings,
    List<SubjectTemplate>? templates,
    List<SchedulePlan>? schedulePlans,
  }) {
    return StudyData(
      subjects: subjects ?? this.subjects,
      studyLog: studyLog ?? this.studyLog,
      lastStudiedDate: lastStudiedDate ?? this.lastStudiedDate,
      streak: streak ?? this.streak,
      studySequence: studySequence ?? this.studySequence,
      sequenceIndex: sequenceIndex ?? this.sequenceIndex,
      pomodoroSettings: pomodoroSettings ?? this.pomodoroSettings,
      templates: templates ?? this.templates,
      schedulePlans: schedulePlans ?? this.schedulePlans,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'subjects': subjects.map((s) => s.toJson()).toList(),
      'studyLog': studyLog.map((s) => s.toJson()).toList(),
      'lastStudiedDate': lastStudiedDate,
      'streak': streak,
      'studySequence': studySequence?.toJson(),
      'sequenceIndex': sequenceIndex,
      'pomodoroSettings': pomodoroSettings.toJson(),
      'templates': templates.map((t) => t.toJson()).toList(),
      'schedulePlans': schedulePlans.map((s) => s.toJson()).toList(),
    };
  }

  factory StudyData.fromJson(Map<String, dynamic> json) {
    return StudyData(
      subjects: (json['subjects'] as List).map((e) => Subject.fromJson(e)).toList(),
      studyLog: (json['studyLog'] as List).map((e) => StudyLogEntry.fromJson(e)).toList(),
      lastStudiedDate: json['lastStudiedDate'],
      streak: json['streak'],
      studySequence: json['studySequence'] != null ? StudySequence.fromJson(json['studySequence']) : null,
      sequenceIndex: json['sequenceIndex'],
      pomodoroSettings: PomodoroSettings.fromJson(json['pomodoroSettings']),
      templates: (json['templates'] as List).map((e) => SubjectTemplate.fromJson(e)).toList(),
      schedulePlans: (json['schedulePlans'] as List).map((e) => SchedulePlan.fromJson(e)).toList(),
    );
  }
}