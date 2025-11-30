import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/models.dart';
import '../../state/study_state_provider.dart';

class RevisionTab extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final studyData = ref.watch(studyStateProvider.select((value) => value.data));

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Revisão',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 16),
          
          Text(
            'Sistema de Revisão Espaçada',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          SizedBox(height: 8),
          Text(
            'Complete as revisões na sequência otimizada para melhor retenção',
            style: TextStyle(
              color: Colors.grey[600],
            ),
          ),
          SizedBox(height: 16),
          
          Expanded(
            child: studyData.subjects.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.refresh_outlined,
                          size: 64,
                          color: Colors.grey[400],
                        ),
                        SizedBox(height: 16),
                        Text(
                          'Nenhuma matéria cadastrada',
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 16,
                          ),
                        ),
                        SizedBox(height: 8),
                        Text(
                          'Adicione matérias e tópicos completos para começar a revisar',
                          style: TextStyle(
                            color: Colors.grey[500],
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    itemCount: studyData.subjects.length,
                    itemBuilder: (context, index) {
                      final subject = studyData.subjects[index];
                      final completedTopics = subject.topics.where((t) => t.isCompleted).toList();
                      
                      if (completedTopics.isEmpty) return SizedBox.shrink();
                      
                      return _buildSubjectRevisionCard(context, ref, subject, completedTopics);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubjectRevisionCard(BuildContext context, WidgetRef ref, Subject subject, List<Topic> completedTopics) {
    // For spaced repetition, we'll use a simple sequence based on completion order
    // In a real implementation, you would use a more sophisticated algorithm
    final revisionSequence = List.generate(completedTopics.length, (index) => index);
    final completedCount = subject.revisionProgress;

    return Card(
      elevation: 2,
      margin: EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        title: Row(
          children: [
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: Color(int.parse(subject.color.replaceFirst('#', '0xFF'))),
                shape: BoxShape.circle,
              ),
            ),
            SizedBox(width: 12),
            Expanded(
              child: Text(
                subject.name,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
          ],
        ),
        subtitle: Text(
          '$completedCount/${completedTopics.length} revisões completas',
          style: TextStyle(
            color: Colors.grey[600],
          ),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                // Progress bar
                LinearProgressIndicator(
                  value: completedTopics.length > 0 ? completedCount / completedTopics.length : 0,
                  backgroundColor: Colors.grey[300],
                  valueColor: AlwaysStoppedAnimation<Color>(
                    Color(int.parse(subject.color.replaceFirst('#', '0xFF'))),
                  ),
                ),
                SizedBox(height: 8),
                Text('$completedCount/${completedTopics.length} revisões'),
                
                SizedBox(height: 16),
                
                // Revision list
                if (completedTopics.isNotEmpty)
                  ListView.builder(
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    itemCount: completedTopics.length,
                    itemBuilder: (context, topicIndex) {
                      final topic = completedTopics[topicIndex];
                      final isCompleted = topicIndex < completedCount;
                      
                      return Card(
                        margin: EdgeInsets.only(bottom: 8),
                        color: isCompleted ? 
                          Color(int.parse(subject.color.replaceFirst('#', '0xFF'))).withOpacity(0.1) : 
                          null,
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: isCompleted 
                                ? Color(int.parse(subject.color.replaceFirst('#', '0xFF')))
                                : Colors.grey,
                            child: isCompleted 
                                ? Icon(Icons.check, color: Colors.white) 
                                : Text('${topicIndex + 1}'),
                          ),
                          title: Text(topic.name),
                          trailing: isCompleted ? Icon(Icons.check_circle, color: Colors.green) : null,
                          onTap: !isCompleted && topicIndex == completedCount
                              ? () {
                                  // Start revision for this topic
                                  _startRevisionForTopic(context, ref, subject, topic);
                                }
                              : null,
                          enabled: !isCompleted && topicIndex == completedCount,
                        ),
                      );
                    },
                  )
                else
                  Container(
                    padding: EdgeInsets.all(16),
                    child: Text(
                      'Complete tópicos para habilitar revisão',
                      style: TextStyle(
                        color: Colors.grey[500],
                        fontStyle: FontStyle.italic,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
              ],
            ),
          ),
          
          // Revision progress buttons
          if (completedCount < completedTopics.length)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: completedCount > 0
                          ? () {
                              // Mark current revision as complete
                              final newProgress = completedCount + 1;
                              ref.read(studyStateProvider.notifier)
                                  .setRevisionProgress(subject.id, newProgress);
                              
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Revisão avançada para ${newProgress}/${completedTopics.length}'),
                                ),
                              );
                            }
                          : null,
                      icon: Icon(Icons.arrow_forward),
                      label: Text('Marcar como Revisado'),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  void _startRevisionForTopic(BuildContext context, WidgetRef ref, Subject subject, Topic topic) {
    // In the original app, this would start a Pomodoro session for the topic
    // For now, we'll just show a dialog
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Iniciar Revisão'),
          content: Text('Deseja iniciar uma sessão de revisão para "${topic.name}"?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Cancelar'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                // In a real implementation, this would start a Pomodoro session
                // For now, we'll just mark this topic as revised
                final currentProgress = subject.revisionProgress;
                ref.read(studyStateProvider.notifier)
                    .setRevisionProgress(subject.id, currentProgress + 1);
                
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Revisão de "${topic.name}" registrada'),
                  ),
                );
              },
              child: Text('Iniciar'),
            ),
          ],
        );
      },
    );
  }
}