class PomodoroSettings {
  List<PomodoroTask> tasks;
  int shortBreakDuration; // in seconds
  int longBreakDuration; // in seconds
  int cyclesUntilLongBreak;

  PomodoroSettings({
    required this.tasks,
    required this.shortBreakDuration,
    required this.longBreakDuration,
    required this.cyclesUntilLongBreak,
  });

  factory PomodoroSettings.empty() {
    return PomodoroSettings(
      tasks: [
        PomodoroTask(id: 'task-1', name: 'Questões', duration: 30 * 60), // 30 minutes
        PomodoroTask(id: 'task-2', name: 'Anki', duration: 10 * 60), // 10 minutes
        PomodoroTask(id: 'task-3', name: 'Lei Seca', duration: 20 * 60), // 20 minutes
      ],
      shortBreakDuration: 5 * 60, // 5 minutes
      longBreakDuration: 15 * 60, // 15 minutes
      cyclesUntilLongBreak: 4,
    );
  }

  PomodoroSettings copyWith({
    List<PomodoroTask>? tasks,
    int? shortBreakDuration,
    int? longBreakDuration,
    int? cyclesUntilLongBreak,
  }) {
    return PomodoroSettings(
      tasks: tasks ?? this.tasks,
      shortBreakDuration: shortBreakDuration ?? this.shortBreakDuration,
      longBreakDuration: longBreakDuration ?? this.longBreakDuration,
      cyclesUntilLongBreak: cyclesUntilLongBreak ?? this.cyclesUntilLongBreak,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'tasks': tasks.map((t) => t.toJson()).toList(),
      'short_break_duration': shortBreakDuration,
      'long_break_duration': longBreakDuration,
      'cycles_until_long_break': cyclesUntilLongBreak,
    };
  }

  factory PomodoroSettings.fromJson(Map<String, dynamic> json) {
    return PomodoroSettings(
      tasks: (json['tasks'] as List).map((e) => PomodoroTask.fromJson(e)).toList(),
      shortBreakDuration: json['short_break_duration'],
      longBreakDuration: json['long_break_duration'],
      cyclesUntilLongBreak: json['cycles_until_long_break'],
    );
  }
}

class PomodoroTask {
  String id;
  String name;
  int duration; // in seconds

  PomodoroTask({
    required this.id,
    required this.name,
    required this.duration,
  });

  PomodoroTask copyWith({
    String? id,
    String? name,
    int? duration,
  }) {
    return PomodoroTask(
      id: id ?? this.id,
      name: name ?? this.name,
      duration: duration ?? this.duration,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'duration': duration,
    };
  }

  factory PomodoroTask.fromJson(Map<String, dynamic> json) {
    return PomodoroTask(
      id: json['id'],
      name: json['name'],
      duration: json['duration'],
    );
  }
}