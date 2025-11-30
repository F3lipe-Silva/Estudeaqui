import 'package:uuid/uuid.dart';
import 'package:intl/intl.dart';

class StudyLogEntry {
  String id;
  String userId;
  String subjectId;
  String? topicId;
  String date;
  int duration; // duration in minutes
  int? startPage;
  int? endPage;
  int questionsTotal;
  int questionsCorrect;
  String source;
  int? sequenceItemIndex;

  StudyLogEntry({
    required this.id,
    required this.userId,
    required this.subjectId,
    this.topicId,
    required this.date,
    required this.duration,
    this.startPage,
    this.endPage,
    required this.questionsTotal,
    required this.questionsCorrect,
    required this.source,
    this.sequenceItemIndex,
  });

  factory StudyLogEntry.create({
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
  }) {
    return StudyLogEntry(
      id: id ?? Uuid().v4(),
      userId: userId,
      subjectId: subjectId,
      topicId: topicId,
      date: date ?? DateTime.now().toIso8601String(),
      duration: duration,
      startPage: startPage,
      endPage: endPage,
      questionsTotal: questionsTotal,
      questionsCorrect: questionsCorrect,
      source: source,
      sequenceItemIndex: sequenceItemIndex,
    );
  }

  StudyLogEntry copyWith({
    String? id,
    String? userId,
    String? subjectId,
    String? topicId,
    String? date,
    int? duration,
    int? startPage,
    int? endPage,
    int? questionsTotal,
    int? questionsCorrect,
    String? source,
    int? sequenceItemIndex,
  }) {
    return StudyLogEntry(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      subjectId: subjectId ?? this.subjectId,
      topicId: topicId ?? this.topicId,
      date: date ?? this.date,
      duration: duration ?? this.duration,
      startPage: startPage ?? this.startPage,
      endPage: endPage ?? this.endPage,
      questionsTotal: questionsTotal ?? this.questionsTotal,
      questionsCorrect: questionsCorrect ?? this.questionsCorrect,
      source: source ?? this.source,
      sequenceItemIndex: sequenceItemIndex ?? this.sequenceItemIndex,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'subject_id': subjectId,
      'topic_id': topicId,
      'date': date,
      'duration': duration,
      'start_page': startPage,
      'end_page': endPage,
      'questions_total': questionsTotal,
      'questions_correct': questionsCorrect,
      'source': source,
      'sequence_item_index': sequenceItemIndex,
    };
  }

  factory StudyLogEntry.fromJson(Map<String, dynamic> json) {
    return StudyLogEntry(
      id: json['id'] ?? Uuid().v4(),
      userId: json['user_id'],
      subjectId: json['subject_id'],
      topicId: json['topic_id'],
      date: json['date'],
      duration: json['duration'] ?? 0,
      startPage: json['start_page'],
      endPage: json['end_page'],
      questionsTotal: json['questions_total'] ?? 0,
      questionsCorrect: json['questions_correct'] ?? 0,
      source: json['source'] ?? 'manual',
      sequenceItemIndex: json['sequence_item_index'],
    );
  }
  
  // Get formatted date string
  String get formattedDate {
    final dateTime = DateTime.parse(date);
    return DateFormat('dd/MM/yyyy').format(dateTime);
  }
  
  // Calculate accuracy percentage
  double get accuracy {
    if (questionsTotal == 0) return 0.0;
    return (questionsCorrect / questionsTotal) * 100;
  }
}