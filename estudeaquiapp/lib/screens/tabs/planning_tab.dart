import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/models.dart';
import '../../state/study_state_provider.dart';
import '../../services/auth_provider.dart';

class PlanningTab extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final studyData = ref.watch(studyStateProvider.select((value) => value.data));

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Planejamento de Estudos',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 16),
          
          // Templates section
          Text(
            'Templates',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 8),
          Container(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () {
                _showCreateTemplateDialog(context, ref);
              },
              icon: Icon(Icons.add),
              label: Text('Criar Template'),
            ),
          ),
          SizedBox(height: 16),
          
          Expanded(
            child: studyData.templates.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.playlist_add_outlined,
                          size: 64,
                          color: Colors.grey[400],
                        ),
                        SizedBox(height: 16),
                        Text(
                          'Nenhum template criado',
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 16,
                          ),
                        ),
                        SizedBox(height: 8),
                        Text(
                          'Crie templates para reutilizar matérias e tópicos',
                          style: TextStyle(
                            color: Colors.grey[500],
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    itemCount: studyData.templates.length,
                    itemBuilder: (context, index) {
                      final template = studyData.templates[index];
                      return _buildTemplateCard(context, ref, template);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildTemplateCard(BuildContext context, WidgetRef ref, SubjectTemplate template) {
    return Card(
      elevation: 2,
      margin: EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        title: Text(
          template.name,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        subtitle: Text(
          '${template.subjects.length} matérias',
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Matérias no template:',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                ...template.subjects.map((subject) {
                  return Padding(
                    padding: const EdgeInsets.only(left: 16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          subject.name,
                          style: TextStyle(fontWeight: FontWeight.w500),
                        ),
                        Text(
                          '${subject.topics.length} tópicos',
                          style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                        ),
                      ],
                    ),
                  );
                }).toList(),
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
                      // Load template into current subjects
                      final newSubjects = template.subjects.map((templateSubject) {
                        return Subject.create(
                          userId: ref.read(authStateProvider).user!.id,
                          name: templateSubject.name,
                          color: templateSubject.color,
                          description: templateSubject.description,
                          studyDuration: templateSubject.studyDuration,
                          materialUrl: templateSubject.materialUrl,
                        )..topics.addAll(templateSubject.topics.map((templateTopic) {
                          return Topic.create(
                            subjectId: '', // Will be updated after subject creation
                            name: templateTopic.name,
                          );
                        }));
                      }).toList();

                      // Add subjects to state (topics will be added separately)
                      for (final subject in newSubjects) {
                        ref.read(studyStateProvider.notifier).addSubject(
                              subject.userId,
                              subject.name,
                              subject.color,
                              description: subject.description,
                              studyDuration: subject.studyDuration,
                              materialUrl: subject.materialUrl,
                            );
                      }

                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Template "${template.name}" carregado com sucesso!'),
                        ),
                      );
                    },
                    icon: Icon(Icons.download),
                    label: Text('Carregar'),
                  ),
                ),
                Expanded(
                  child: TextButton.icon(
                    onPressed: () {
                      _showDeleteTemplateDialog(context, ref, template);
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

  void _showCreateTemplateDialog(BuildContext context, WidgetRef ref) {
    final nameController = TextEditingController();
    final studyData = ref.read(studyStateProvider).data;

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Criar Novo Template'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: InputDecoration(
                  labelText: 'Nome do template',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
              SizedBox(height: 16),
              Text(
                'Matérias para incluir no template:',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              SizedBox(height: 8),
              Expanded(
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: studyData.subjects.length,
                  itemBuilder: (context, index) {
                    final subject = studyData.subjects[index];
                    return CheckboxListTile(
                      title: Text(subject.name),
                      value: true, // For simplicity, all subjects are selected by default
                      onChanged: (value) {
                        // In a real implementation, we'd track which subjects are selected
                      },
                    );
                  },
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Cancelar'),
            ),
            ElevatedButton(
              onPressed: () {
                if (nameController.text.trim().isNotEmpty && studyData.subjects.isNotEmpty) {
                  ref.read(studyStateProvider.notifier).saveTemplate(
                        ref.read(authStateProvider).user!.id,
                        nameController.text.trim(),
                        studyData.subjects,
                      );
                  Navigator.pop(context);
                }
              },
              child: Text('Criar'),
            ),
          ],
        );
      },
    );
  }

  void _showDeleteTemplateDialog(BuildContext context, WidgetRef ref, SubjectTemplate template) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Confirmar Exclusão'),
          content: Text('Tem certeza que deseja excluir o template "${template.name}"?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Cancelar'),
            ),
            TextButton(
              onPressed: () {
                ref.read(studyStateProvider.notifier).deleteTemplate(template.id);
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