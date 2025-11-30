# Estudaqui Flutter Application

This is a Flutter version of the Estudaqui study management system, originally built with Next.js and Supabase.

## Features

- Complete study management system
- Pomodoro timer with customizable tasks
- Subject and topic tracking
- Study session logging
- Revision system with spaced repetition
- Schedule planning
- Templates for quick setup
- Dark/light mode support
- Supabase integration for data persistence

## Setup Instructions

1. Clone this repository
2. Navigate to the project directory
3. Install dependencies with `flutter pub get`
4. Add your Supabase credentials in `lib/main.dart`:
   - Replace `YOUR_SUPABASE_URL_HERE` with your Supabase project URL
   - Replace `YOUR_SUPABASE_ANON_KEY_HERE` with your Supabase anon key
5. Run the application with `flutter run`

## Running the Application

```bash
flutter run
```

## Configuration

To run this application, you need to:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Set up the required database tables based on the schema from the original Next.js application
3. Enable Row Level Security (RLS) for the tables
4. Create policies for users to access only their own data
5. Replace the placeholder credentials in `lib/main.dart` with your actual Supabase credentials

## Database Schema

The application requires the following tables in your Supabase project:

- `subjects`: Stores study subjects
- `topics`: Stores topics within subjects
- `study_logs`: Stores study session logs
- `study_sequences`: Stores study sequences
- `pomodoro_settings`: Stores user's Pomodoro timer settings
- `templates`: Stores subject templates
- `schedule_plans`: Stores study schedule plans

For the exact schema, refer to the original Next.js application's Supabase configuration.

## Project Structure

- `lib/models/`: Data models matching the Supabase schema
- `lib/services/`: Authentication and service classes
- `lib/repository/`: Supabase data access layer
- `lib/state/`: Application state management
- `lib/screens/`: UI screens
- `lib/ui/`: Reusable UI components
- `lib/theme/`: Theme management

## Dependencies

- flutter_riverpod: State management
- supabase_flutter: Supabase integration
- uuid: Generate unique IDs
- intl: Internationalization
- fl_chart: Charts and visualization
- shared_preferences: Local storage