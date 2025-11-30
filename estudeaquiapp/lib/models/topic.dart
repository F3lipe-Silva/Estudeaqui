import 'package:uuid/uuid.dart';

class Topic {
  String id;
  String subjectId;
  String name;
  int order;
  bool isCompleted;
  String? description;

  Topic({
    required this.id,
    required this.subjectId,
    required this.name,
    required this.order,
    required this.isCompleted,
    this.description,
  });

  factory Topic.create({
    String? id,
    required String subjectId,
    required String name,
  }) {
    return Topic(
      id: id ?? Uuid().v4(),
      subjectId: subjectId,
      name: name,
      order: 0,
      isCompleted: false,
    );
  }

  Topic copyWith({
    String? id,
    String? subjectId,
    String? name,
    int? order,
    bool? isCompleted,
    String? description,
  }) {
    return Topic(
      id: id ?? this.id,
      subjectId: subjectId ?? this.subjectId,
      name: name ?? this.name,
      order: order ?? this.order,
      isCompleted: isCompleted ?? this.isCompleted,
      description: description ?? this.description,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'subject_id': subjectId,
      'name': name,
      'order': order,
      'is_completed': isCompleted,
      'description': description,
    };
  }

  factory Topic.fromJson(Map<String, dynamic> json) {
    return Topic(
      id: json['id'] ?? Uuid().v4(),
      subjectId: json['subject_id'],
      name: json['name'],
      order: json['order'] ?? 0,
      isCompleted: json['is_completed'] ?? false,
      description: json['description'],
    );
  }
}