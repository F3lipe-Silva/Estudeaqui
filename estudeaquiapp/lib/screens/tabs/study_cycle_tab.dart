import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import '../../models/models.dart';
import '../../state/study_state_provider.dart';
import '../../services/auth_provider.dart';

class StudyCycleTab extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final studyState = ref.watch(studyStateProvider);
    final studyData = studyState.data;

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Matérias e Tópicos',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 16),
          
          // Add Subject Button
          Container(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () => _showAddSubjectDialog(context, ref),
              icon: Icon(Icons.add),
              label: Text('Adicionar Matéria'),
            ),
          ),
          SizedBox(height: 16),
          
          // Subjects List
          Expanded(
            child: studyData.subjects.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.school_outlined,
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
                          'Adicione uma matéria para começar',
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
                      return _buildSubjectCard(context, ref, subject);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubjectCard(BuildContext context, WidgetRef ref, Subject subject) {
    final studyState = ref.watch(studyStateProvider);
    final authState = ref.watch(authStateProvider);

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
          '${subject.topics.where((t) => t.isCompleted).length}/${subject.topics.length} tópicos completos',
          style: TextStyle(
            color: Colors.grey[600],
          ),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                // Add Topic Form
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        decoration: InputDecoration(
                          hintText: 'Adicionar novo tópico...',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        onFieldSubmitted: (value) {
                          if (value.trim().isNotEmpty) {
                            ref.read(studyStateProvider.notifier).addTopic(
                                  subject.id,
                                  value.trim(),
                                );
                          }
                        },
                      ),
                    ),
                    SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: () {
                        final formKey = GlobalKey<FormState>();
                        final textController = TextEditingController();
                        
                        showDialog(
                          context: context,
                          builder: (context) => AlertDialog(
                            title: Text('Adicionar Tópico'),
                            content: Form(
                              key: formKey,
                              child: TextFormField(
                                controller: textController,
                                decoration: InputDecoration(
                                  labelText: 'Nome do tópico',
                                ),
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Por favor, insira o nome do tópico';
                                  }
                                  return null;
                                },
                              ),
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(context),
                                child: Text('Cancelar'),
                              ),
                              ElevatedButton(
                                onPressed: () {
                                  if (formKey.currentState!.validate()) {
                                    ref.read(studyStateProvider.notifier).addTopic(
                                          subject.id,
                                          textController.text.trim(),
                                        );
                                    Navigator.pop(context);
                                  }
                                },
                                child: Text('Adicionar'),
                              ),
                            ],
                          ),
                        );
                      },
                      child: Icon(Icons.add),
                    ),
                  ],
                ),
                SizedBox(height: 16),
                
                // Topics List
                if (subject.topics.isNotEmpty)
                  ListView.builder(
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    itemCount: subject.topics.length,
                    itemBuilder: (context, topicIndex) {
                      final topic = subject.topics[topicIndex];
                      return Card(
                        margin: EdgeInsets.only(bottom: 8),
                        child: CheckboxListTile(
                          title: Text(topic.name),
                          value: topic.isCompleted,
                          onChanged: (value) {
                            ref.read(studyStateProvider.notifier)
                                .toggleTopicCompleted(subject.id, topic.id);
                          },
                        ),
                      );
                    },
                  )
                else
                  Container(
                    padding: EdgeInsets.all(16),
                    child: Text(
                      'Nenhum tópico adicionado',
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
          Divider(),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextButton.icon(
                    onPressed: () {
                      _showEditSubjectDialog(context, ref, subject);
                    },
                    icon: Icon(Icons.edit),
                    label: Text('Editar'),
                  ),
                ),
                Expanded(
                  child: TextButton.icon(
                    onPressed: () {
                      _showDeleteSubjectDialog(context, ref, subject);
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

  void _showAddSubjectDialog(BuildContext context, WidgetRef ref) {
    final nameController = TextEditingController();
    final colorController = TextEditingController(text: '#3498db');
    final descriptionController = TextEditingController();
    final durationController = TextEditingController();
    final materialUrlController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Adicionar Matéria'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameController,
                  decoration: InputDecoration(
                    labelText: 'Nome da matéria',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
                SizedBox(height: 16),
                TextField(
                  controller: colorController,
                  decoration: InputDecoration(
                    labelText: 'Cor (ex: #3498db)',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
                SizedBox(height: 16),
                TextField(
                  controller: descriptionController,
                  decoration: InputDecoration(
                    labelText: 'Descrição (opcional)',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  maxLines: 3,
                ),
                SizedBox(height: 16),
                TextField(
                  controller: durationController,
                  decoration: InputDecoration(
                    labelText: 'Duração ideal (minutos, opcional)',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  keyboardType: TextInputType.number,
                ),
                SizedBox(height: 16),
                TextField(
                  controller: materialUrlController,
                  decoration: InputDecoration(
                    labelText: 'URL do material (opcional)',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
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
                if (nameController.text.trim().isNotEmpty) {
                  ref.read(studyStateProvider.notifier).addSubject(
                        ref.read(authStateProvider).user!.id,
                        nameController.text.trim(),
                        colorController.text.trim(),
                        description: descriptionController.text.trim().isNotEmpty
                            ? descriptionController.text.trim()
                            : null,
                        studyDuration: durationController.text.trim().isNotEmpty
                            ? int.tryParse(durationController.text.trim())
                            : null,
                        materialUrl: materialUrlController.text.trim().isNotEmpty
                            ? materialUrlController.text.trim()
                            : null,
                      );
                  Navigator.pop(context);
                }
              },
              child: Text('Adicionar'),
            ),
          ],
        );
      },
    );
  }

  void _showEditSubjectDialog(BuildContext context, WidgetRef ref, Subject subject) {
    final nameController = TextEditingController(text: subject.name);
    final colorController = TextEditingController(text: subject.color);
    final descriptionController = TextEditingController(text: subject.description ?? '');
    final durationController = TextEditingController(
      text: subject.studyDuration?.toString() ?? '',
    );
    final materialUrlController = TextEditingController(text: subject.materialUrl ?? '');

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Editar Matéria'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameController,
                  decoration: InputDecoration(
                    labelText: 'Nome da matéria',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
                SizedBox(height: 16),
                TextField(
                  controller: colorController,
                  decoration: InputDecoration(
                    labelText: 'Cor (ex: #3498db)',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
                SizedBox(height: 16),
                TextField(
                  controller: descriptionController,
                  decoration: InputDecoration(
                    labelText: 'Descrição (opcional)',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  maxLines: 3,
                ),
                SizedBox(height: 16),
                TextField(
                  controller: durationController,
                  decoration: InputDecoration(
                    labelText: 'Duração ideal (minutos, opcional)',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  keyboardType: TextInputType.number,
                ),
                SizedBox(height: 16),
                TextField(
                  controller: materialUrlController,
                  decoration: InputDecoration(
                    labelText: 'URL do material (opcional)',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
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
                ref.read(studyStateProvider.notifier).updateSubject(
                      subject.id,
                      name: nameController.text.trim(),
                      color: colorController.text.trim(),
                      description: descriptionController.text.trim().isNotEmpty
                          ? descriptionController.text.trim()
                          : null,
                      studyDuration: durationController.text.trim().isNotEmpty
                          ? int.tryParse(durationController.text.trim())
                          : null,
                      materialUrl: materialUrlController.text.trim().isNotEmpty
                          ? materialUrlController.text.trim()
                          : null,
                    );
                Navigator.pop(context);
              },
              child: Text('Salvar'),
            ),
          ],
        );
      },
    );
  }

  void _showDeleteSubjectDialog(BuildContext context, WidgetRef ref, Subject subject) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Confirmar Exclusão'),
          content: Text('Tem certeza que deseja excluir a matéria "${subject.name}"?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Cancelar'),
            ),
            TextButton(
              onPressed: () {
                ref.read(studyStateProvider.notifier).deleteSubject(subject.id);
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