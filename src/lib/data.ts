import type { Subject } from './types';

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'subj-1',
    name: 'Direito Constitucional',
    color: '#2563EB',
    description: 'Estudo dos princípios e normas que regem a Constituição de um país, sua estrutura e a organização do Estado.',
    revisionProgress: 0,
    studyDuration: 50,
    topics: [
      { id: 'topic-1-0', subjectId: 'subj-1', name: 'Princípios Fundamentais', order: 0, isCompleted: true },
      { id: 'topic-1-1', subjectId: 'subj-1', name: 'Direitos e Garantias Fundamentais', order: 1, isCompleted: true },
      { id: 'topic-1-2', subjectId: 'subj-1', name: 'Organização do Estado', order: 2, isCompleted: true },
      { id: 'topic-1-3', subjectId: 'subj-1', name: 'Organização dos Poderes', order: 3, isCompleted: true },
      { id: 'topic-1-4', subjectId: 'subj-1', name: 'Defesa do Estado e das Instituições Democráticas', order: 4, isCompleted: true },
    ],
  },
  {
    id: 'subj-2',
    name: 'Direito Administrativo',
    color: '#10B981',
    description: 'Ramo do direito público que rege a função administrativa do Estado, incluindo órgãos, agentes e atividades públicas.',
    revisionProgress: 0,
    studyDuration: 60,
    topics: [
      { id: 'topic-2-0', subjectId: 'subj-2', name: 'Noções Introdutórias', order: 0, isCompleted: true },
      { id: 'topic-2-1', subjectId: 'subj-2', name: 'Princípios da Administração Pública', order: 1, isCompleted: true },
      { id: 'topic-2-2', subjectId: 'subj-2', name: 'Atos Administrativos', order: 2, isCompleted: true },
      { id: 'topic-2-3', subjectId: 'subj-2', name: 'Poderes Administrativos', order: 3, isCompleted: true },
      { id: 'topic-2-4', subjectId: 'subj-2', name: 'Controle da Administração Pública', order: 4, isCompleted: true },
      { id: 'topic-2-5', subjectId: 'subj-2', name: 'Licitações e Contratos', order: 5, isCompleted: true },
    ],
  },
  {
    id: 'subj-3',
    name: 'Língua Portuguesa',
    color: '#F59E0B',
    description: 'Estudo da gramática, interpretação de textos, redação e estilística da língua portuguesa, essencial para todos os concursos.',
    revisionProgress: 0,
    studyDuration: 60,
    topics: [
      { id: 'topic-3-0', subjectId: 'subj-3', name: 'Ortografia', order: 0, isCompleted: true },
      { id: 'topic-3-1', subjectId: 'subj-3', name: 'Morfologia', order: 1, isCompleted: true },
      { id: 'topic-3-2', subjectId: 'subj-3', name: 'Sintaxe', order: 2, isCompleted: true },
    ],
  },
];
