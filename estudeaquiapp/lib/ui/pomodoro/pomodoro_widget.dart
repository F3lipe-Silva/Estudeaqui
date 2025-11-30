import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async';
import '../../state/study_state_provider.dart';

class PomodoroWidget extends ConsumerStatefulWidget {
  @override
  ConsumerState<PomodoroWidget> createState() => _PomodoroWidgetState();
}

class _PomodoroWidgetState extends ConsumerState<PomodoroWidget> {
  @override
  void initState() {
    super.initState();
    // Set up timer when widget is initialized
    final pomodoroState = ref.read(studyStateProvider).pomodoroState;
    _startTimerIfActive(pomodoroState);
  }

  void _startTimerIfActive(PomodoroState state) {
    if (state.status == PomodoroStatus.idle) return;

    Future.delayed(Duration.zero, () {
      _startTimer();
    });
  }

  Timer? _timer;
  bool _isRunning = false;

  void _startTimer() {
    if (_isRunning) return;
    _isRunning = true;

    _timer = Timer.periodic(Duration(seconds: 1), (timer) {
      final currentState = ref.read(studyStateProvider).pomodoroState;
      
      if (currentState.status == PomodoroStatus.idle || 
          currentState.status == PomodoroStatus.paused) {
        _timer?.cancel();
        _isRunning = false;
        return;
      }

      if (currentState.timeRemaining <= 1) {
        _timer?.cancel();
        _isRunning = false;
        _handleTimerEnd();
        return;
      }

      ref.read(studyStateProvider.notifier).updatePomodoroState(
        ref.read(studyStateProvider).pomodoroState.copyWith(
          timeRemaining: ref.read(studyStateProvider).pomodoroState.timeRemaining - 1,
        ),
      );
    });
  }

  void _handleTimerEnd() {
    final currentState = ref.read(studyStateProvider).pomodoroState;
    final pomodoroSettings = ref.read(studyStateProvider).data.pomodoroSettings;

    if (currentState.status == PomodoroStatus.focus) {
      // Handle task completion
      int nextTaskIndex = currentState.currentTaskIndex ?? 0;
      nextTaskIndex++;

      if (nextTaskIndex < pomodoroSettings.tasks.length) {
        // More tasks available
        ref.read(studyStateProvider.notifier).updatePomodoroState(
          ref.read(studyStateProvider).pomodoroState.copyWith(
            currentTaskIndex: nextTaskIndex,
            timeRemaining: pomodoroSettings.tasks[nextTaskIndex].duration,
          ),
        );
      } else {
        // All focus tasks completed - transition to break
        int newCycle = currentState.currentCycle + 1;
        bool isLongBreak = newCycle % pomodoroSettings.cyclesUntilLongBreak == 0;

        ref.read(studyStateProvider.notifier).updatePomodoroState(
          ref.read(studyStateProvider).pomodoroState.copyWith(
            status: isLongBreak ? PomodoroStatus.longBreak : PomodoroStatus.shortBreak,
            timeRemaining: isLongBreak
                ? pomodoroSettings.longBreakDuration
                : pomodoroSettings.shortBreakDuration,
            currentCycle: newCycle,
            pomodorosCompletedToday: ref.read(studyStateProvider).pomodoroState.pomodorosCompletedToday + 1,
          ),
        );

        // Start break timer
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _startTimer();
        });
      }
    } else if (currentState.status == PomodoroStatus.shortBreak || 
               currentState.status == PomodoroStatus.longBreak) {
      // Break completed - back to focus
      ref.read(studyStateProvider.notifier).updatePomodoroState(
        ref.read(studyStateProvider).pomodoroState.copyWith(
          status: PomodoroStatus.focus,
          timeRemaining: pomodoroSettings.tasks.first.duration,
          currentTaskIndex: 0,
        ),
      );

      // Start focus timer
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _startTimer();
      });
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final pomodoroState = ref.watch(studyStateProvider.select((value) => value.pomodoroState));
    final pomodoroSettings = ref.watch(studyStateProvider.select((value) => value.data.pomodoroSettings));

    String statusText = '';
    Color statusColor = Colors.grey;
    
    switch (pomodoroState.status) {
      case PomodoroStatus.idle:
        statusText = 'Parado';
        statusColor = Colors.grey;
        break;
      case PomodoroStatus.focus:
        statusText = 'Foco';
        statusColor = Colors.red;
        break;
      case PomodoroStatus.shortBreak:
        statusText = 'Pausa Curta';
        statusColor = Colors.green;
        break;
      case PomodoroStatus.longBreak:
        statusText = 'Pausa Longa';
        statusColor = Colors.blue;
        break;
      case PomodoroStatus.paused:
        statusText = 'Pausado';
        statusColor = Colors.orange;
        break;
    }

    String currentTaskName = '';
    if (pomodoroState.currentTaskIndex != null && 
        pomodoroState.currentTaskIndex! < pomodoroSettings.tasks.length) {
      currentTaskName = pomodoroSettings.tasks[pomodoroState.currentTaskIndex!].name;
    }

    String timeString = _formatTime(pomodoroState.timeRemaining);

    return Card(
      elevation: 8,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        statusText,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: statusColor,
                        ),
                      ),
                      if (currentTaskName.isNotEmpty)
                        Text(
                          currentTaskName,
                          style: TextStyle(
                            fontSize: 14,
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                        ),
                    ],
                  ),
                ),
                Container(
                  padding: EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    timeString,
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: TextButton.icon(
                    onPressed: () {
                      if (pomodoroState.status == PomodoroStatus.idle) {
                        // Start the first task
                        ref.read(studyStateProvider.notifier).updatePomodoroState(
                          ref.read(studyStateProvider).pomodoroState.copyWith(
                            status: PomodoroStatus.focus,
                            timeRemaining: pomodoroSettings.tasks.first.duration,
                            currentTaskIndex: 0,
                            currentCycle: 0,
                            pomodorosCompletedToday: 0,
                          ),
                        );
                      } else if (pomodoroState.status == PomodoroStatus.paused) {
                        // Resume from paused
                        ref.read(studyStateProvider.notifier).updatePomodoroState(
                          ref.read(studyStateProvider).pomodoroState.copyWith(
                            status: PomodoroStatus.focus,
                          ),
                        );
                      } else if (pomodoroState.status == PomodoroStatus.focus ||
                                 pomodoroState.status == PomodoroStatus.shortBreak ||
                                 pomodoroState.status == PomodoroStatus.longBreak) {
                        // Pause
                        ref.read(studyStateProvider.notifier).updatePomodoroState(
                          ref.read(studyStateProvider).pomodoroState.copyWith(
                            status: PomodoroStatus.paused,
                          ),
                        );
                      }
                    },
                    icon: Icon(
                      pomodoroState.status == PomodoroStatus.paused || 
                      (pomodoroState.status != PomodoroStatus.idle && 
                       pomodoroState.status != PomodoroStatus.focus &&
                       pomodoroState.status != PomodoroStatus.shortBreak &&
                       pomodoroState.status != PomodoroStatus.longBreak)
                          ? Icons.play_arrow
                          : Icons.pause,
                    ),
                    label: Text(
                      pomodoroState.status == PomodoroStatus.paused || 
                      (pomodoroState.status != PomodoroStatus.idle && 
                       pomodoroState.status != PomodoroStatus.focus &&
                       pomodoroState.status != PomodoroStatus.shortBreak &&
                       pomodoroState.status != PomodoroStatus.longBreak)
                          ? 'Iniciar'
                          : 'Pausar',
                    ),
                  ),
                ),
                SizedBox(width: 8),
                Expanded(
                  child: TextButton.icon(
                    onPressed: () {
                      // Reset the timer
                      ref.read(studyStateProvider.notifier).updatePomodoroState(
                        PomodoroState(
                          status: PomodoroStatus.idle,
                          timeRemaining: 0,
                          currentCycle: 0,
                          pomodorosCompletedToday: 0,
                          key: ref.read(studyStateProvider).pomodoroState.key + 1,
                        ),
                      );
                    },
                    icon: Icon(Icons.stop),
                    label: Text('Parar'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatTime(int seconds) {
    int minutes = (seconds ~/ 60).toInt();
    int remainingSeconds = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${remainingSeconds.toString().padLeft(2, '0')}';
  }
}