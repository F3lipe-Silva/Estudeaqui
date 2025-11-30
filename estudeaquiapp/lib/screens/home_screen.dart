import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'tabs/overview_tab.dart';
import 'tabs/study_cycle_tab.dart';
import 'tabs/planning_tab.dart';
import 'tabs/schedule_tab.dart';
import 'tabs/revision_tab.dart';
import 'tabs/history_tab.dart';
import '../ui/pomodoro/pomodoro_widget.dart';
import '../state/study_state_provider.dart';
import '../theme/theme_provider.dart';
import '../services/auth_provider.dart';

class HomeScreen extends ConsumerStatefulWidget {
  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    final activeTab = ref.watch(studyStateProvider.select((value) => value.activeTab));

    return Scaffold(
      appBar: AppBar(
        title: Text('Estudaqui'),
        actions: [
          IconButton(
            icon: Icon(Icons.brightness_6),
            onPressed: () {
              ref.read(themeNotifierProvider.notifier).toggleTheme();
            },
          ),
          IconButton(
            icon: Icon(Icons.settings),
            onPressed: () {
              // TODO: Implement settings dialog
              _showSettingsDialog(context);
            },
          ),
          // IconButton(
          //   icon: Icon(Icons.logout),
          //   onPressed: () {
          //     ref.read(authStateProvider.notifier).signOut();
          //   },
          // ),
        ],
      ),
      body: Stack(
        children: [
          // Main content with tabs
          IndexedStack(
            index: _getTabIndex(activeTab),
            children: [
              OverviewTab(),
              ScheduleTab(),
              PlanningTab(),
              StudyCycleTab(),
              RevisionTab(),
              HistoryTab(),
            ],
          ),
          // Pomodoro widget at the top
          Positioned(
            top: kToolbarHeight + 10,
            left: 16,
            right: 16,
            child: PomodoroWidget(),
          ),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _getTabIndex(activeTab),
        onDestinationSelected: (int index) {
          ActiveTab newTab = _getTabFromIndex(index);
          ref.read(studyStateProvider.notifier).setActiveTab(newTab);
        },
        destinations: [
          NavigationDestination(
            icon: Icon(Icons.home),
            label: 'Visão Geral',
          ),
          NavigationDestination(
            icon: Icon(Icons.calendar_today),
            label: 'Cronograma',
          ),
          NavigationDestination(
            icon: Icon(Icons.playlist_add),
            label: 'Planejamento',
          ),
          NavigationDestination(
            icon: Icon(Icons.school),
            label: 'Ciclo de Estudo',
          ),
          NavigationDestination(
            icon: Icon(Icons.refresh),
            label: 'Revisão',
          ),
          NavigationDestination(
            icon: Icon(Icons.history),
            label: 'Histórico',
          ),
        ],
      ),
    );
  }

  int _getTabIndex(ActiveTab tab) {
    switch (tab) {
      case ActiveTab.overview:
        return 0;
      case ActiveTab.schedule:
        return 1;
      case ActiveTab.planning:
        return 2;
      case ActiveTab.cycle:
        return 3;
      case ActiveTab.revision:
        return 4;
      case ActiveTab.history:
        return 5;
    }
  }

  ActiveTab _getTabFromIndex(int index) {
    switch (index) {
      case 0:
        return ActiveTab.overview;
      case 1:
        return ActiveTab.schedule;
      case 2:
        return ActiveTab.planning;
      case 3:
        return ActiveTab.cycle;
      case 4:
        return ActiveTab.revision;
      case 5:
        return ActiveTab.history;
      default:
        return ActiveTab.overview;
    }
  }

  void _showSettingsDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Configurações'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: Icon(Icons.dark_mode),
                title: Text('Tema'),
                onTap: () {
                  // Handle theme change
                  Navigator.of(context).pop();
                },
              ),
              ListTile(
                leading: Icon(Icons.notifications),
                title: Text('Notificações'),
                onTap: () {
                  // Handle notifications
                  Navigator.of(context).pop();
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text('Fechar'),
            ),
          ],
        );
      },
    );
  }
}