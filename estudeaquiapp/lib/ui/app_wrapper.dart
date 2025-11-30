import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../screens/home_screen.dart';
import '../services/auth_provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AppWrapper extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Bypass authentication and go directly to the app interface
    // Simulate a fake user for local development
    final fakeUser = User(
      id: 'local-user-id',
      appMetadata: {},
      userMetadata: {},
      aud: 'authenticated',
      createdAt: DateTime.now().toIso8601String(),
      email: 'offline@estudeaqui.local',
    );

    // Update auth state with fake user using the proper method
    ref.read(authStateProvider.notifier).setFakeUser(fakeUser);

    return HomeScreen();
  }
}