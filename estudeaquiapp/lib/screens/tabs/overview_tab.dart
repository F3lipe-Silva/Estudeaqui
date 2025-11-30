import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/models.dart';
import '../../state/study_state_provider.dart';

class OverviewTab extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final studyState = ref.watch(studyStateProvider);
    final studyData = studyState.data;

    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Stats Header
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildStatCard(
                      'Hoje', 
                      '${_getTodayStudyTime(studyData.studyLog) / 60}h', 
                      Icons.timelapse
                    ),
                    _buildStatCard(
                      'Semana', 
                      '${_getWeekStudyTime(studyData.studyLog) / 60}h', 
                      Icons.calendar_today
                    ),
                    _buildStatCard(
                      'Sequência', 
                      '${studyData.streak} dias', 
                      Icons.local_fire_department
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 16),
            
            // Today's Study Summary
            Text(
              'Hoje',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 8),
            _buildTodaySummary(studyData),
            
            SizedBox(height: 16),
            
            // Subjects Progress
            Text(
              'Matérias',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 8),
            _buildSubjectsList(studyData),
            
            SizedBox(height: 16),
            
            // Recent Study Logs
            Text(
              'Sessões Recentes',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 8),
            _buildRecentLogs(studyData),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, size: 30, color: Colors.blue),
        SizedBox(height: 8),
        Text(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          title,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }

  Widget _buildTodaySummary(StudyData studyData) {
    final today = DateTime.now();
    final todayLogs = studyData.studyLog.where((log) {
      final logDate = DateTime.parse(log.date.split('T')[0]);
      return logDate.isAtSameMomentAs(DateTime(today.year, today.month, today.day));
    }).toList();

    int totalTodayTime = todayLogs.fold(0, (sum, log) => sum + log.duration);
    int totalQuestions = todayLogs.fold(0, (sum, log) => sum + log.questionsTotal);
    int correctQuestions = todayLogs.fold(0, (sum, log) => sum + log.questionsCorrect);

    double accuracy = totalQuestions > 0 ? (correctQuestions / totalQuestions) * 100 : 0;

    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            Column(
              children: [
                Text(
                  '${totalTodayTime ~/ 60}h ${totalTodayTime % 60}m',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text('Estudado'),
              ],
            ),
            Column(
              children: [
                Text(
                  '${todayLogs.length}',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text('Sessões'),
              ],
            ),
            if (totalQuestions > 0)
              Column(
                children: [
                  Text(
                    '${accuracy.toStringAsFixed(1)}%',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text('Taxa de Acerto'),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubjectsList(StudyData studyData) {
    return ListView.builder(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      itemCount: studyData.subjects.length,
      itemBuilder: (context, index) {
        final subject = studyData.subjects[index];
        final completedTopics = subject.topics.where((t) => t.isCompleted).length;
        final totalTopics = subject.topics.length;

        double progress = totalTopics > 0 ? completedTopics / totalTopics : 0;

        return Card(
          elevation: 2,
          child: Padding(
            padding: const EdgeInsets.all(12.0),
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
                      Text(
                        subject.name,
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      SizedBox(height: 4),
                      LinearProgressIndicator(
                        value: progress,
                        backgroundColor: Colors.grey[300],
                        valueColor: AlwaysStoppedAnimation<Color>(
                          Color(int.parse(subject.color.replaceFirst('#', '0xFF'))),
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        '$completedTopics/$totalTopics tópicos completos',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildRecentLogs(StudyData studyData) {
    final recentLogs = studyData.studyLog.take(5).toList();

    if (recentLogs.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Text(
            'Nenhuma sessão registrada ainda',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.grey[600],
              fontStyle: FontStyle.italic,
            ),
          ),
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      itemCount: recentLogs.length,
      itemBuilder: (context, index) {
        final log = recentLogs[index];
        final subject = studyData.subjects.firstWhere(
          (s) => s.id == log.subjectId,
          orElse: () => Subject.create(userId: '', name: 'Desconhecido', color: '#CCCCCC'),
        );

        return Card(
          elevation: 2,
          child: Padding(
            padding: const EdgeInsets.all(12.0),
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
                        Text(
                          '${log.duration} min',
                          style: TextStyle(
                            color: Colors.grey[600],
                          ),
                        ),
                      if (log.questionsTotal > 0)
                        Text(
                          '${log.questionsCorrect}/${log.questionsTotal} questões',
                          style: TextStyle(
                            color: Colors.grey[600],
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  int _getTodayStudyTime(List<StudyLogEntry> logs) {
    final today = DateTime.now();
    return logs.where((log) {
      final logDate = DateTime.parse(log.date.split('T')[0]);
      return logDate.isAtSameMomentAs(DateTime(today.year, today.month, today.day));
    }).fold(0, (sum, log) => sum + log.duration);
  }

  int _getWeekStudyTime(List<StudyLogEntry> logs) {
    final now = DateTime.now();
    final startOfWeek = DateTime(now.year, now.month, now.day - now.weekday + 1);
    return logs.where((log) {
      final logDate = DateTime.parse(log.date.split('T')[0]);
      return logDate.isAtSameMomentAs(DateTime(startOfWeek.year, startOfWeek.month, startOfWeek.day)) ||
             logDate.isAfter(startOfWeek);
    }).fold(0, (sum, log) => sum + log.duration);
  }
}