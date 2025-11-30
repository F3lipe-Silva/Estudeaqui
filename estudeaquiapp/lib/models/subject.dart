import 'package:uuid/uuid.dart';
import 'topic.dart';

class Subject {
  String id;
  String userId;
  String name;
  String color;
  String? description;
  int? studyDuration;
  String? materialUrl;
  int revisionProgress;
  List<Topic> topics;

  Subject({
    required this.id,
    required this.userId,
    required this.name,
    required this.color,
    this.description,
    this.studyDuration,
    this.materialUrl,
    required this.revisionProgress,
    required this.topics,
  });

  factory Subject.create({
    required String userId,
    required String name,
    required String color,
    String? description,
    int? studyDuration,
    String? materialUrl,
  }) {
    return Subject(
      id: Uuid().v4(),
      userId: userId,
      name: name,
      color: color,
      description: description,
      studyDuration: studyDuration,
      materialUrl: materialUrl,
      revisionProgress: 0,
      topics: [],
    );
  }

  Subject copyWith({
    String? id,
    String? userId,
    String? name,
    String? color,
    String? description,
    int? studyDuration,
    String? materialUrl,
    int? revisionProgress,
    List<Topic>? topics,
  }) {
    return Subject(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      name: name ?? this.name,
      color: color ?? this.color,
      description: description ?? this.description,
      studyDuration: studyDuration ?? this.studyDuration,
      materialUrl: materialUrl ?? this.materialUrl,
      revisionProgress: revisionProgress ?? this.revisionProgress,
      topics: topics ?? this.topics,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'name': name,
      'color': color,
      'description': description,
      'study_duration': studyDuration,
      'material_url': materialUrl,
      'revision_progress': revisionProgress,
      'topics': topics.map((t) => t.toJson()).toList(),
    };
  }

  factory Subject.fromJson(Map<String, dynamic> json) {
    return Subject(
      id: json['id'] ?? Uuid().v4(),
      userId: json['user_id'],
      name: json['name'],
      color: json['color'],
      description: json['description'],
      studyDuration: json['study_duration'],
      materialUrl: json['material_url'],
      revisionProgress: json['revision_progress'] ?? 0,
      topics: (json['topics'] as List?)?.map((e) => Topic.fromJson(e)).toList() ?? [],
    );
  }
}