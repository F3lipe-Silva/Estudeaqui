import 'package:uuid/uuid.dart';

class SchedulePlan {
  String id;
  String userId;
  String name;
  int? totalHorasSemanais;
  int? duracaoSessao;
  bool? subModoPomodoro;
  List<SessaoPorMateria>? sessoesPorMateria;

  SchedulePlan({
    required this.id,
    required this.userId,
    required this.name,
    this.totalHorasSemanais,
    this.duracaoSessao,
    this.subModoPomodoro,
    this.sessoesPorMateria,
  });

  factory SchedulePlan.create({
    String? id,
    required String userId,
    required String name,
    int? totalHorasSemanais,
    int? duracaoSessao,
    bool? subModoPomodoro,
    List<SessaoPorMateria>? sessoesPorMateria,
  }) {
    return SchedulePlan(
      id: id ?? Uuid().v4(),
      userId: userId,
      name: name,
      totalHorasSemanais: totalHorasSemanais,
      duracaoSessao: duracaoSessao,
      subModoPomodoro: subModoPomodoro,
      sessoesPorMateria: sessoesPorMateria,
    );
  }

  SchedulePlan copyWith({
    String? id,
    String? userId,
    String? name,
    int? totalHorasSemanais,
    int? duracaoSessao,
    bool? subModoPomodoro,
    List<SessaoPorMateria>? sessoesPorMateria,
  }) {
    return SchedulePlan(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      name: name ?? this.name,
      totalHorasSemanais: totalHorasSemanais ?? this.totalHorasSemanais,
      duracaoSessao: duracaoSessao ?? this.duracaoSessao,
      subModoPomodoro: subModoPomodoro ?? this.subModoPomodoro,
      sessoesPorMateria: sessoesPorMateria ?? this.sessoesPorMateria,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'name': name,
      'total_horas_semanais': totalHorasSemanais,
      'duracao_sessao': duracaoSessao,
      'sub_modo_pomodoro': subModoPomodoro,
      'sessoes_por_materia': sessoesPorMateria?.map((s) => s.toJson()).toList(),
    };
  }

  factory SchedulePlan.fromJson(Map<String, dynamic> json) {
    return SchedulePlan(
      id: json['id'] ?? Uuid().v4(),
      userId: json['user_id'],
      name: json['name'],
      totalHorasSemanais: json['total_horas_semanais'],
      duracaoSessao: json['duracao_sessao'],
      subModoPomodoro: json['sub_modo_pomodoro'],
      sessoesPorMateria: json['sessoes_por_materia'] != null
          ? (json['sessoes_por_materia'] as List).map((e) => SessaoPorMateria.fromJson(e)).toList()
          : null,
    );
  }
}

class SessaoPorMateria {
  String materiaId;
  int quantidadeSessoes;

  SessaoPorMateria({
    required this.materiaId,
    required this.quantidadeSessoes,
  });

  SessaoPorMateria copyWith({
    String? materiaId,
    int? quantidadeSessoes,
  }) {
    return SessaoPorMateria(
      materiaId: materiaId ?? this.materiaId,
      quantidadeSessoes: quantidadeSessoes ?? this.quantidadeSessoes,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'materia_id': materiaId,
      'quantidade_sessoes': quantidadeSessoes,
    };
  }

  factory SessaoPorMateria.fromJson(Map<String, dynamic> json) {
    return SessaoPorMateria(
      materiaId: json['materia_id'],
      quantidadeSessoes: json['quantidade_sessoes'],
    );
  }
}