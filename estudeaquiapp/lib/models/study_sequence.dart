import 'package:uuid/uuid.dart';

class StudySequence {
  String id;
  String userId;
  String name;
  List<StudySequenceItem> sequence;

  StudySequence({
    required this.id,
    required this.userId,
    required this.name,
    required this.sequence,
  });

  factory StudySequence.create({
    String? id,
    required String userId,
    required String name,
    required List<StudySequenceItem> sequence,
  }) {
    return StudySequence(
      id: id ?? Uuid().v4(),
      userId: userId,
      name: name,
      sequence: sequence,
    );
  }

  StudySequence copyWith({
    String? id,
    String? userId,
    String? name,
    List<StudySequenceItem>? sequence,
  }) {
    return StudySequence(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      name: name ?? this.name,
      sequence: sequence ?? this.sequence,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'name': name,
      'sequence': sequence.map((s) => s.toJson()).toList(),
    };
  }

  factory StudySequence.fromJson(Map<String, dynamic> json) {
    return StudySequence(
      id: json['id'] ?? Uuid().v4(),
      userId: json['user_id'],
      name: json['name'],
      sequence: (json['sequence'] as List).map((e) => StudySequenceItem.fromJson(e)).toList(),
    );
  }
}

class StudySequenceItem {
  String subjectId;
  int? totalTimeStudied; // in seconds

  StudySequenceItem({
    required this.subjectId,
    this.totalTimeStudied,
  });

  StudySequenceItem copyWith({
    String? subjectId,
    int? totalTimeStudied,
  }) {
    return StudySequenceItem(
      subjectId: subjectId ?? this.subjectId,
      totalTimeStudied: totalTimeStudied ?? this.totalTimeStudied,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'subject_id': subjectId,
      'total_time_studied': totalTimeStudied,
    };
  }

  factory StudySequenceItem.fromJson(Map<String, dynamic> json) {
    return StudySequenceItem(
      subjectId: json['subject_id'],
      totalTimeStudied: json['total_time_studied'],
    );
  }
}