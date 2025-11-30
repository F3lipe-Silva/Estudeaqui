import 'package:uuid/uuid.dart';
import 'topic.dart';

class SubjectTemplate {
  String id;
  String userId;
  String name;
  List<TemplateSubject> subjects;

  SubjectTemplate({
    required this.id,
    required this.userId,
    required this.name,
    required this.subjects,
  });

  factory SubjectTemplate.create({
    String? id,
    required String userId,
    required String name,
    required List<TemplateSubject> subjects,
  }) {
    return SubjectTemplate(
      id: id ?? Uuid().v4(),
      userId: userId,
      name: name,
      subjects: subjects,
    );
  }

  SubjectTemplate copyWith({
    String? id,
    String? userId,
    String? name,
    List<TemplateSubject>? subjects,
  }) {
    return SubjectTemplate(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      name: name ?? this.name,
      subjects: subjects ?? this.subjects,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'name': name,
      'subjects': subjects.map((s) => s.toJson()).toList(),
    };
  }

  factory SubjectTemplate.fromJson(Map<String, dynamic> json) {
    return SubjectTemplate(
      id: json['id'] ?? Uuid().v4(),
      userId: json['user_id'],
      name: json['name'],
      subjects: (json['subjects'] as List).map((e) => TemplateSubject.fromJson(e)).toList(),
    );
  }
}

class TemplateSubject {
  String name;
  String color;
  String? description;
  int? studyDuration;
  String? materialUrl;
  int revisionProgress;
  List<TemplateTopic> topics;

  TemplateSubject({
    required this.name,
    required this.color,
    this.description,
    this.studyDuration,
    this.materialUrl,
    required this.revisionProgress,
    required this.topics,
  });

  TemplateSubject copyWith({
    String? name,
    String? color,
    String? description,
    int? studyDuration,
    String? materialUrl,
    int? revisionProgress,
    List<TemplateTopic>? topics,
  }) {
    return TemplateSubject(
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
      'name': name,
      'color': color,
      'description': description,
      'study_duration': studyDuration,
      'material_url': materialUrl,
      'revision_progress': revisionProgress,
      'topics': topics.map((t) => t.toJson()).toList(),
    };
  }

  factory TemplateSubject.fromJson(Map<String, dynamic> json) {
    return TemplateSubject(
      name: json['name'],
      color: json['color'],
      description: json['description'],
      studyDuration: json['study_duration'],
      materialUrl: json['material_url'],
      revisionProgress: json['revision_progress'] ?? 0,
      topics: (json['topics'] as List).map((e) => TemplateTopic.fromJson(e)).toList(),
    );
  }
}

class TemplateTopic {
  String name;
  int order;
  bool isCompleted;

  TemplateTopic({
    required this.name,
    required this.order,
    required this.isCompleted,
  });

  TemplateTopic copyWith({
    String? name,
    int? order,
    bool? isCompleted,
  }) {
    return TemplateTopic(
      name: name ?? this.name,
      order: order ?? this.order,
      isCompleted: isCompleted ?? this.isCompleted,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'order': order,
      'is_completed': isCompleted,
    };
  }

  factory TemplateTopic.fromJson(Map<String, dynamic> json) {
    return TemplateTopic(
      name: json['name'],
      order: json['order'] ?? 0,
      isCompleted: json['is_completed'] ?? false,
    );
  }
}