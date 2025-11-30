import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/models.dart';
import '../../state/study_state_provider.dart';
import '../../services/auth_provider.dart';

class ScheduleTab extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final studyData = ref.watch(studyStateProvider.select((value) => value.data));

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Cronograma de Estudos',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 16),
          
          Container(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () {
                _showCreateScheduleDialog(context, ref);
              },
              icon: Icon(Icons.add),
              label: Text('Criar Cronograma'),
            ),
          ),
          SizedBox(height: 16),
          
          Expanded(
            child: studyData.schedulePlans.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.calendar_month_outlined,
                          size: 64,
                          color: Colors.grey[400],
                        ),
                        SizedBox(height: 16),
                        Text(
                          'Nenhum cronograma criado',
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 16,
                          ),
                        ),
                        SizedBox(height: 8),
                        Text(
                          'Crie um cronograma para organizar seu estudo semanal',
                          style: TextStyle(
                            color: Colors.grey[500],
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    itemCount: studyData.schedulePlans.length,
                    itemBuilder: (context, index) {
                      final plan = studyData.schedulePlans[index];
                      return _buildScheduleCard(context, ref, plan);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildScheduleCard(BuildContext context, WidgetRef ref, SchedulePlan plan) {
    return Card(
      elevation: 2,
      margin: EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        title: Text(
          plan.name,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        subtitle: Text(
          plan.totalHorasSemanais != null 
              ? '${plan.totalHorasSemanais}h semanais' 
              : 'Cronograma personalizado',
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (plan.totalHorasSemanais != null)
                  Row(
                    children: [
                      Icon(Icons.schedule, size: 16),
                      SizedBox(width: 8),
                      Text('Total semanal: ${plan.totalHorasSemanais} horas'),
                    ],
                  ),
                if (plan.duracaoSessao != null)
                  Row(
                    children: [
                      Icon(Icons.timelapse, size: 16),
                      SizedBox(width: 8),
                      Text('Duração da sessão: ${plan.duracaoSessao} minutos'),
                    ],
                  ),
                if (plan.subModoPomodoro != null)
                  Row(
                    children: [
                      Icon(Icons.timer, size: 16),
                      SizedBox(width: 8),
                      Text('Modo Pomodoro: ${plan.subModoPomodoro! ? 'Ativado' : 'Desativado'}'),
                    ],
                  ),
                if (plan.sessoesPorMateria != null && plan.sessoesPorMateria!.isNotEmpty)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(height: 8),
                      Text(
                        'Distribuição por matéria:',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      ...plan.sessoesPorMateria!.map((sessao) {
                        final subject = ref.read(studyStateProvider).data.subjects
                            .firstWhere((s) => s.id == sessao.materiaId, orElse: () => 
                              Subject.create(userId: '', name: 'Matéria desconhecida', color: '#CCCCCC'));
                        return Padding(
                          padding: const EdgeInsets.only(left: 16.0),
                          child: Text('${subject.name}: ${sessao.quantidadeSessoes} sessões'),
                        );
                      }).toList(),
                    ],
                  ),
              ],
            ),
          ),
          Divider(),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextButton.icon(
                    onPressed: () {
                      // TODO: Edit schedule
                    },
                    icon: Icon(Icons.edit),
                    label: Text('Editar'),
                  ),
                ),
                Expanded(
                  child: TextButton.icon(
                    onPressed: () {
                      _showDeleteScheduleDialog(context, ref, plan);
                    },
                    icon: Icon(Icons.delete, color: Colors.red),
                    label: Text('Excluir', style: TextStyle(color: Colors.red)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showCreateScheduleDialog(BuildContext context, WidgetRef ref) {
    final nameController = TextEditingController();
    final totalHorasController = TextEditingController();
    final duracaoSessaoController = TextEditingController();
    bool subModoPomodoro = false;

    showDialog(
      context: context,
      builder: (context) {
        final studyData = ref.read(studyStateProvider).data;
        final selectedSubjects = <String, int>{};

        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: Text('Criar Novo Cronograma'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: nameController,
                      decoration: InputDecoration(
                        labelText: 'Nome do cronograma',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                    SizedBox(height: 16),
                    TextField(
                      controller: totalHorasController,
                      decoration: InputDecoration(
                        labelText: 'Total de horas semanais',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      keyboardType: TextInputType.number,
                    ),
                    SizedBox(height: 16),
                    TextField(
                      controller: duracaoSessaoController,
                      decoration: InputDecoration(
                        labelText: 'Duração da sessão (minutos)',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      keyboardType: TextInputType.number,
                    ),
                    SizedBox(height: 16),
                    SwitchListTile(
                      title: Text('Usar modo Pomodoro'),
                      value: subModoPomodoro,
                      onChanged: (value) {
                        setState(() {
                          subModoPomodoro = value;
                        });
                      },
                    ),
                    SizedBox(height: 16),
                    Text(
                      'Distribuição por matéria:',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    ...studyData.subjects.map((subject) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4.0),
                        child: Row(
                          children: [
                            Expanded(
                              flex: 3,
                              child: Text(subject.name),
                            ),
                            SizedBox(width: 8),
                            Expanded(
                              flex: 2,
                              child: TextField(
                                decoration: InputDecoration(
                                  hintText: 'Sessões',
                                  border: OutlineInputBorder(),
                                ),
                                keyboardType: TextInputType.number,
                                onChanged: (value) {
                                  if (value.isNotEmpty) {
                                    setState(() {
                                      selectedSubjects[subject.id] = int.tryParse(value) ?? 0;
                                    });
                                  } else {
                                    setState(() {
                                      selectedSubjects.remove(subject.id);
                                    });
                                  }
                                },
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text('Cancelar'),
                ),
                ElevatedButton(
                  onPressed: () {
                    if (nameController.text.trim().isNotEmpty) {
                      final sessoesPorMateria = selectedSubjects.entries
                          .where((entry) => entry.value > 0)
                          .map((entry) => SessaoPorMateria(
                                materiaId: entry.key,
                                quantidadeSessoes: entry.value,
                              ))
                          .toList();

                      final newPlan = SchedulePlan.create(
                        userId: ref.read(authStateProvider).user!.id,
                        name: nameController.text.trim(),
                        totalHorasSemanais: int.tryParse(totalHorasController.text.trim()),
                        duracaoSessao: int.tryParse(duracaoSessaoController.text.trim()),
                        subModoPomodoro: subModoPomodoro,
                        sessoesPorMateria: sessoesPorMateria.isNotEmpty ? sessoesPorMateria : null,
                      );

                      ref.read(studyStateProvider.notifier).addSchedulePlan(newPlan);
                      Navigator.pop(context);
                    }
                  },
                  child: Text('Criar'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _showDeleteScheduleDialog(BuildContext context, WidgetRef ref, SchedulePlan plan) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Confirmar Exclusão'),
          content: Text('Tem certeza que deseja excluir o cronograma "${plan.name}"?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Cancelar'),
            ),
            TextButton(
              onPressed: () {
                ref.read(studyStateProvider.notifier).deleteSchedulePlan(plan.id);
                Navigator.pop(context);
              },
              child: Text('Excluir', style: TextStyle(color: Colors.red)),
            ),
          ],
        );
      },
    );
  }
}