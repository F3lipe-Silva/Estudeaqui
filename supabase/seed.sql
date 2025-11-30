-- Seed script para popular o banco com dados de exemplo
-- Execute este script no SQL Editor do Supabase Dashboard
-- ⚠️ ATENÇÃO: Substitua 'YOUR_USER_ID_HERE' pelo seu UUID de usuário real

-- Para encontrar seu user_id:
-- SELECT id FROM auth.users WHERE email = 'seu-email@exemplo.com';

-- Exemplo de matérias iniciais
INSERT INTO subjects (id, user_id, name, color, description, study_duration, revision_progress) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'YOUR_USER_ID_HERE', 'Direito Constitucional', '#2563EB', 'Estudo dos princípios e normas que regem a Constituição de um país', 50, 0),
  ('550e8400-e29b-41d4-a716-446655440002', 'YOUR_USER_ID_HERE', 'Direito Administrativo', '#10B981', 'Ramo do direito público que rege a função administrativa do Estado', 60, 0),
  ('550e8400-e29b-41d4-a716-446655440003', 'YOUR_USER_ID_HERE', 'Língua Portuguesa', '#F59E0B', 'Estudo da gramática, interpretação de textos e redação', 60, 0)
ON CONFLICT (id) DO NOTHING;

-- Tópicos de Direito Constitucional
INSERT INTO topics (id, subject_id, name, "order", is_completed) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'Princípios Fundamentais', 0, false),
  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'Direitos e Garantias Fundamentais', 1, false),
  ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', 'Organização do Estado', 2, false),
  ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', 'Organização dos Poderes', 3, false)
ON CONFLICT (id) DO NOTHING;

-- Tópicos de Direito Administrativo
INSERT INTO topics (id, subject_id, name, "order", is_completed) VALUES
  ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440002', 'Noções Introdutórias', 0, false),
  ('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440002', 'Princípios da Administração Pública', 1, false),
  ('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440002', 'Atos Administrativos', 2, false),
  ('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440002', 'Poderes Administrativos', 3, false)
ON CONFLICT (id) DO NOTHING;

-- Tópicos de Língua Portuguesa
INSERT INTO topics (id, subject_id, name, "order", is_completed) VALUES
  ('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440003', 'Ortografia', 0, false),
  ('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440003', 'Morfologia', 1, false),
  ('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440003', 'Sintaxe', 2, false)
ON CONFLICT (id) DO NOTHING;

-- Exemplo de configuração Pomodoro
INSERT INTO pomodoro_settings (user_id, settings) VALUES
  ('YOUR_USER_ID_HERE', '{
    "tasks": [
      {"id": "task-1", "name": "Questões", "duration": 1800},
      {"id": "task-2", "name": "Anki", "duration": 600},
      {"id": "task-3", "name": "Lei Seca", "duration": 1200}
    ],
    "shortBreakDuration": 300,
    "longBreakDuration": 900,
    "cyclesUntilLongBreak": 4
  }'::jsonb)
ON CONFLICT (user_id) DO UPDATE SET settings = EXCLUDED.settings;

-- Logs de estudo de exemplo (últimos 7 dias)
-- Substitua YOUR_USER_ID_HERE e ajuste as datas conforme necessário
