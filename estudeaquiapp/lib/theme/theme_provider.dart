import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final themeNotifierProvider = StateNotifierProvider<ThemeNotifier, ThemeMode>(
  (ref) => ThemeNotifier(),
);

class ThemeNotifier extends StateNotifier<ThemeMode> {
  ThemeNotifier() : super(ThemeMode.system) {
    // Load saved theme preference from shared preferences
    _loadTheme();
  }

  void _loadTheme() async {
    // For now, we'll just use system theme
    // In a real implementation, you would load from shared preferences
  }

  void setTheme(ThemeMode themeMode) {
    state = themeMode;
  }

  void toggleTheme() {
    if (state == ThemeMode.light) {
      state = ThemeMode.dark;
    } else if (state == ThemeMode.dark) {
      state = ThemeMode.system;
    } else {
      state = ThemeMode.light;
    }
  }
}

// Custom theme extensions could be added here if needed