import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/models.dart';
import '../../state/study_state_provider.dart';

class HistoryTab extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final studyData = ref.watch(studyStateProvider.select((value) => value.data));

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Histórico de Estudos',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 16),
          
          if (studyData.studyLog.isEmpty)
            Expanded(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.history_outlined,
                      size: 64,
                      color: Colors.grey[400],
                    ),
                    SizedBox(height: 16),
                    Text(
                      'Nenhuma sessão registrada',
                      style: TextStyle(
                        color: Colors.grey[600],
                        fontSize: 16,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Registre sessões de estudo para ver o histórico',
                      style: TextStyle(
                        color: Colors.grey[500],
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            Expanded(
              child: ListView.builder(
                itemCount: studyData.studyLog.length,
                itemBuilder: (context, index) {
                  final log = studyData.studyLog[index];
                  final subject = studyData.subjects.firstWhere(
                    (s) => s.id == log.subjectId,
                    orElse: () => Subject.create(
                      userId: '',
                      name: 'Desconhecido',
                      color: '#CCCCCC',
                    ),
                  );
                  
                  return _buildStudyLogCard(context, ref, log, subject);
                },
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildStudyLogCard(BuildContext context, WidgetRef ref, StudyLogEntry log, Subject subject) {
    return Card(
      elevation: 2,
      margin: EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: Color(int.parse(subject.color.replaceFirst('#', '0xFF'))),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          subject.name,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ),
                      Text(
                        log.formattedDate,
                        style: TextStyle(
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                  if (log.duration > 0)
                    Row(
                      children: [
                        Icon(Icons.timelapse, size: 16, color: Colors.grey),
                        SizedBox(width: 4),
                        Text(
                          '${log.duration} min',
                          style: TextStyle(
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  if (log.startPage != null && log.endPage != null)
                    Row(
                      children: [
                        Icon(Icons.book, size: 16, color: Colors.grey),
                        SizedBox(width: 4),
                        Text(
                          'Páginas: ${log.startPage} - ${log.endPage}',
                          style: TextStyle(
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  if (log.questionsTotal > 0)
                    Row(
                      children: [
                        Icon(Icons.question_answer, size: 16, color: Colors.grey),
                        SizedBox(width: 4),
                        Text(
                          '${log.questionsCorrect}/${log.questionsTotal} questões corretas (${log.accuracy.toStringAsFixed(1)}%)',
                          style: TextStyle(
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  if (log.topicId != null)
                    Row(
                      children: [
                        Icon(Icons.check_circle, size: 16, color: Colors.grey),
                        SizedBox(width: 4),
                        Text(
                          'Tópico associado',
                          style: TextStyle(
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                ],
              ),
            ),
            PopupMenuButton<String>(
              onSelected: (String value) {
                if (value == 'edit') {
                  _showEditLogDialog(context, ref, log, subject);
                } else if (value == 'delete') {
                  _showDeleteLogDialog(context, ref, log);
                }
              },
              itemBuilder: (BuildContext context) => <PopupMenuEntry<String>>[
                const PopupMenuItem<String>(
                  value: 'edit',
                  child: Text('Editar'),
                ),
                const PopupMenuItem<String>(
                  value: 'delete',
                  child: Text('Excluir', style: TextStyle(color: Colors.red)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showEditLogDialog(BuildContext context, WidgetRef ref, StudyLogEntry log, Subject subject) {
    final durationController = TextEditingController(text: log.duration.toString());
    final startPageController = TextEditingController(text: log.startPage?.toString());
    final endPageController = TextEditingController(text: log.endPage?.toString());
    final questionsTotalController = TextEditingController(text: log.questionsTotal.toString());
    final questionsCorrectController = TextEditingController(text: log.questionsCorrect.toString());

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Editar Sessão'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: durationController,
                  decoration: InputDecoration(
                    labelText: 'Duração (minutos)',
                  ),
                  keyboardType: TextInputType.number,
                ),
                SizedBox(height: 16),
                TextField(
                  controller: startPageController,
                  decoration: InputDecoration(
                    labelText: 'Página inicial (opcional)',
                  ),
                  keyboardType: TextInputType.number,
                ),
                SizedBox(height: 16),
                TextField(
                  controller: endPageController,
                  decoration: InputDecoration(
                    labelText: 'Página final (opcional)',
                  ),
                  keyboardType: TextInputType.number,
                ),
                SizedBox(height: 16),
                TextField(
                  controller: questionsTotalController,
                  decoration: InputDecoration(
                    labelText: 'Total de questões (opcional)',
                  ),
                  keyboardType: TextInputType.number,
                ),
                SizedBox(height: 16),
                TextField(
                  controller: questionsCorrectController,
                  decoration: InputDecoration(
                    labelText: 'Questões corretas (opcional)',
                  ),
                  keyboardType: TextInputType.number,
                ),
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
                final updatedLog = log.copyWith(
                  duration: int.tryParse(durationController.text) ?? log.duration,
                  startPage: startPageController.text.isNotEmpty
                      ? int.tryParse(startPageController.text)
                      : log.startPage,
                  endPage: endPageController.text.isNotEmpty
                      ? int.tryParse(endPageController.text)
                      : log.endPage,
                  questionsTotal: int.tryParse(questionsTotalController.text) ?? log.questionsTotal,
                  questionsCorrect: int.tryParse(questionsCorrectController.text) ?? log.questionsCorrect,
                );
                
                ref.read(studyStateProvider.notifier).updateStudyLog(updatedLog);
                Navigator.pop(context);
              },
              child: Text('Salvar'),
            ),
          ],
        );
      },
    );
  }

  void _showDeleteLogDialog(BuildContext context, WidgetRef ref, StudyLogEntry log) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Confirmar Exclusão'),
          content: Text('Tem certeza que deseja excluir esta sessão de estudo?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Cancelar'),
            ),
            TextButton(
              onPressed: () {
                ref.read(studyStateProvider.notifier).deleteStudyLog(log.id);
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