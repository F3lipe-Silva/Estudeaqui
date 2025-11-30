import 'package:flutter/widgets.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:supabase/supabase.dart';

class SupabaseService {
  static const String _url = String.fromEnvironment('SUPABASE_URL', defaultValue: '');
  static const String _key = String.fromEnvironment('SUPABASE_ANON_KEY', defaultValue: '');
  
  late final SupabaseClient client;
  late final GoTrueClient auth;

  SupabaseService() {
    if (_url.isEmpty || _key.isEmpty) {
      throw Exception(
        'Supabase URL and Anon Key must be provided. '
        'Add them as environment variables or update SupabaseService class.',
      );
    }
    client = SupabaseClient(_url, _key);
    auth = client.auth;
  }

  // For testing purposes, if we don't have the environment variables set
  SupabaseService.forTesting(String url, String key) {
    client = SupabaseClient(url, key);
    auth = client.auth;
  }
}