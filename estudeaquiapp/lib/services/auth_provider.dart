import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:supabase/supabase.dart';

final authStateProvider = StateNotifierProvider<AuthStateNotifier, AuthState>(
  (ref) => AuthStateNotifier(),
);

class AuthState {
  final User? user;
  final bool isLoading;

  AuthState({this.user, this.isLoading = false});

  AuthState copyWith({User? user, bool? isLoading}) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class AuthStateNotifier extends StateNotifier<AuthState> {
  late final GoTrueClient _auth;

  AuthStateNotifier() : super(AuthState(isLoading: false)) {
    _auth = Supabase.instance.client.auth;

    // Listen to auth state changes (for when online functionality is used)
    _auth.onAuthStateChange.listen((data) {
      final session = data.session;
      final user = session?.user;

      state = state.copyWith(
        user: user,
        isLoading: false,
      );
    });
  }

  void setFakeUser(User user) {
    state = state.copyWith(
      user: user,
      isLoading: false,
    );
  }

  Future<void> _checkInitialSession() async {
    try {
      final session = _auth.currentSession;
      final user = session?.user;

      state = state.copyWith(
        user: user,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> signInWithEmail(String email, String password) async {
    state = state.copyWith(isLoading: true);
    try {
      await _auth.signInWithPassword(
        email: email,
        password: password,
      );
      // Auth state change will be handled by the listener
    } catch (e) {
      state = state.copyWith(isLoading: false);
      rethrow;
    }
  }

  Future<void> signInWithGoogle() async {
    state = state.copyWith(isLoading: true);
    try {
      await _auth.signInWithOAuth(
        OAuthProvider.google,
        redirectTo: 'io.supabase.estudeaqui://login-callback',
      );
      // Auth state change will be handled by the listener
    } catch (e) {
      state = state.copyWith(isLoading: false);
      rethrow;
    }
  }

  Future<void> signUp(String email, String password) async {
    state = state.copyWith(isLoading: true);
    try {
      await _auth.signUp(
        email: email,
        password: password,
      );
      // Auth state change will be handled by the listener
    } catch (e) {
      state = state.copyWith(isLoading: false);
      rethrow;
    }
  }

  Future<void> signOut() async {
    state = state.copyWith(isLoading: true);
    try {
      await _auth.signOut();
      // Auth state change will be handled by the listener
    } catch (e) {
      state = state.copyWith(isLoading: false);
      rethrow;
    }
  }
}