"use client";

import { useStudy } from '@/contexts/study-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, TrendingUp, Save, Plus, Trash2, BarChart3, Settings, Hand, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMemo, useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export default function SchedulePlanningTab() {
  const { data, dispatch } = useStudy();
  const { subjects } = data;


  const [totalHorasSemanais, setTotalHorasSemanais] = useState(21); // padrão 3h/dia

  // Novo estado para sessões semanais
  const [sessoesSemanais, setSessoesSemanais] = useState(45); // padrão 45 sessões

  // Novo estado para modo de planejamento unificado
  const [modoPlanejamento, setModoPlanejamento] = useState<'automatico' | 'manual' | 'manual-com-multiplicadores' | 'pomodoro'>('automatico');

  // Novo estado para sub-modo do pomodoro (automático ou manual)
  const [subModoPomodoro, setSubModoPomodoro] = useState<'automatico' | 'manual'>('manual');

  // Calcular duração da sessão em minutos
  const duracaoSessao = useMemo(() => {
    if (modoPlanejamento === 'pomodoro') {
      // No modo pomodoro, sessoesSemanais é a duração em minutos
      return sessoesSemanais;
    } else {
      // Nos outros modos, calcular duração baseada em horas e sessões
      if (sessoesSemanais <= 0) return 0;
      return Math.round((totalHorasSemanais * 60) / sessoesSemanais);
    }
  }, [totalHorasSemanais, sessoesSemanais, modoPlanejamento]);

  // Calcular número total de sessões
  const totalSessoesCalculadas = useMemo(() => {
    if (modoPlanejamento === 'pomodoro') {
      // No modo pomodoro, calcular sessões baseado em duração
      if (duracaoSessao <= 0) return 0;
      return Math.round((totalHorasSemanais * 60) / duracaoSessao);
    } else {
      // Nos outros modos, é o valor direto
      return sessoesSemanais;
    }
  }, [totalHorasSemanais, duracaoSessao, sessoesSemanais, modoPlanejamento]);

  // Função para lidar com mudança de modo de planejamento
  const handleModoPlanejamentoChange = (novoModo: 'automatico' | 'manual' | 'manual-com-multiplicadores' | 'pomodoro') => {
    setModoPlanejamento(novoModo);
  };

  // Função para aplicar cálculo manual
  const aplicarCalculoManual = () => {
    setHorasManuais(horasBaseMultiplicadoresManual);
    const novosInputs: {[id: string]: string} = {};
    Object.entries(horasBaseMultiplicadoresManual).forEach(([subjectId, horas]) => {
      novosInputs[subjectId] = String(horas);
    });
    setHorasManuaisInput(novosInputs);
  };

  // Estado para horas manuais por matéria (modo manual)
  const [horasManuais, setHorasManuais] = useState<{[id: string]: number}>({});

  // Estado para sessões manuais por matéria (modo pomodoro)
  const [sessoesManuais, setSessoesManuais] = useState<{[id: string]: number}>({});

  // Estado para controlar valores temporários dos inputs (permite campo vazio)
  const [horasManuaisInput, setHorasManuaisInput] = useState<{[id: string]: string}>({});

  // Estado para controlar valores temporários dos inputs de sessões
  const [sessoesManuaisInput, setSessoesManuaisInput] = useState<{[id: string]: string}>({});

  // Multiplicador padrão: 1 para cada matéria
  // Estado local para inputs de multiplicador
  const [multiplicadoresInput, setMultiplicadoresInput] = useState<{[id: string]: string}>({});

  // Estado para controlar tooltips de validação
  const [multiplicadorTooltip, setMultiplicadorTooltip] = useState<{[subjectId: string]: { show: boolean, maxValue: number }}>({});

  // Calcular multiplicador máximo permitido para cada matéria no modo automático
  const getMultiplicadorMaximo = useMemo(() => {
    return (subjectId: string) => {
      if (modoPlanejamento !== 'automatico') return 100; // Sem limite significativo nos outros modos

      const materias = subjects.length;
      if (materias === 0) return 100;

      // Calcular quanto cada matéria receberia se todas tivessem multiplicador 1
      const horasBasePorMateria = totalHorasSemanais / materias;

      // Calcular os multiplicadores atuais (excluindo a matéria que estamos calculando)
      const multiplicadoresAtuais = subjects.map(s => {
        if (s.id === subjectId) return 1; // Assumir 1 para a matéria que estamos calculando
        const inputVal = multiplicadoresInput[s.id];
        if (inputVal !== undefined) {
          const num = Number(inputVal.replace(',', '.'));
          return isNaN(num) || num <= 0 ? 1 : num;
        }
        return s.peso || 1;
      });

      // Calcular horas atuais de outras matérias
      const horasOutrasMaterias = subjects.reduce((sum, subject, idx) => {
        if (subject.id === subjectId) return sum;
        return sum + (horasBasePorMateria * multiplicadoresAtuais[idx]);
      }, 0);

      // Horas disponíveis para esta matéria
      const horasDisponiveis = totalHorasSemanais - horasOutrasMaterias;

      // Multiplicador máximo = horas disponíveis / horas base
      const maxMultiplicador = horasDisponiveis / horasBasePorMateria;

      return Math.max(0.1, Math.min(100, maxMultiplicador)); // Entre 0.1 e 100
    };
  }, [modoPlanejamento, subjects, totalHorasSemanais, multiplicadoresInput]);

  const handleInputChange = (subjectId: string, value: string) => {
    // Filtrar apenas números, vírgula e ponto
    const filteredValue = value.replace(/[^0-9.,]/g, '').replace(',', '.');

    // Limitar a valores entre 0.1 e 2 durante a digitação
    if (filteredValue !== '') {
      const numValue = Number(filteredValue);
      if (!isNaN(numValue)) {
        if (numValue > 2) {
          // Não permitir valores acima de 2
          setMultiplicadorTooltip(prev => ({
            ...prev,
            [subjectId]: { show: true, maxValue: 2 }
          }));
          return;
        } else if (numValue < 0.1 && filteredValue.length >= 3) { // Só validar mínimo se tiver pelo menos 3 caracteres (ex: "0.0")
          // Não permitir valores abaixo de 0.1
          return;
        } else {
          // Esconde tooltip se valor estiver dentro do limite
          setMultiplicadorTooltip(prev => ({
            ...prev,
            [subjectId]: { show: false, maxValue: 2 }
          }));
        }
      }
    }

    setMultiplicadoresInput(prev => ({ ...prev, [subjectId]: filteredValue }));
  };

  const handleInputCommit = (subjectId: string) => {
    const val = multiplicadoresInput[subjectId];
    if (val === undefined) return;

    // Se estiver vazio, definir valor padrão
    let finalValue = 1;
    if (val !== '') {
      const num = Number(val);
      if (!isNaN(num) && num >= 0.1 && num <= 2) {
        finalValue = num;
      }
    }

    // Atualizar o valor no input com o valor válido
    const finalStringValue = finalValue.toString();
    setMultiplicadoresInput(prev => ({ ...prev, [subjectId]: finalStringValue }));

    // Verificar se há excesso de horas antes de salvar
    if (temExcesso) {
      // Não salvar se houver excesso - manter o valor anterior
      setMultiplicadoresInput(prev => {
        const newState = { ...prev };
        delete newState[subjectId]; // Remove o input temporário para voltar ao valor salvo
        return newState;
      });
      return;
    }

    dispatch({
      type: 'UPDATE_SUBJECT',
      payload: {
        id: subjectId,
        data: { peso: finalValue }
      }
    });
  };

  // Funções para modo manual
  const handleHorasManuaisInputChange = (subjectId: string, value: string) => {
    // Atualiza o valor do input (permite vazio)
    setHorasManuaisInput(prev => ({ ...prev, [subjectId]: value }));

    // Se o valor não estiver vazio, atualiza as horas com validação
    if (value.trim() !== '') {
      const numValue = Number(value.replace(',', '.'));
      if (!isNaN(numValue) && numValue >= 0) {
        const maxPermitido = getMaxHorasParaMateria(subjectId);
        const horasLimitadas = Math.min(numValue, maxPermitido);
        setHorasManuais(prev => ({ ...prev, [subjectId]: horasLimitadas }));
      }
    } else {
      // Se vazio, mantém o valor atual mas permite edição
      setHorasManuais(prev => ({ ...prev, [subjectId]: prev[subjectId] || 0 }));
    }
  };

  const handleHorasManuaisInputBlur = (subjectId: string) => {
    const inputValue = horasManuaisInput[subjectId];

    if (!inputValue || inputValue.trim() === '') {
      // Se vazio, define como 0
      setHorasManuais(prev => ({ ...prev, [subjectId]: 0 }));
      setHorasManuaisInput(prev => ({ ...prev, [subjectId]: '0' }));
    } else {
      // Valida e limita o valor
      const numValue = Number(inputValue.replace(',', '.'));
      if (!isNaN(numValue)) {
        const maxPermitido = getMaxHorasParaMateria(subjectId);
        const horasLimitadas = Math.min(Math.max(0, numValue), maxPermitido);
        setHorasManuais(prev => ({ ...prev, [subjectId]: horasLimitadas }));
        setHorasManuaisInput(prev => ({ ...prev, [subjectId]: String(horasLimitadas) }));
      } else {
        // Se inválido, volta ao valor atual
        const currentValue = horasManuais[subjectId] || 0;
        setHorasManuaisInput(prev => ({ ...prev, [subjectId]: String(currentValue) }));
      }
    }
  };

  const handleHorasManuaisChange = (subjectId: string, horas: number) => {
    const maxPermitido = getMaxHorasParaMateria(subjectId);
    const horasLimitadas = Math.min(Math.max(0, horas), maxPermitido);
    setHorasManuais(prev => ({ ...prev, [subjectId]: horasLimitadas }));
    setHorasManuaisInput(prev => ({ ...prev, [subjectId]: String(horasLimitadas) }));
  };

  const salvarHorasManuais = () => {
    // Salvar as horas manuais no contexto
    subjects.forEach(subject => {
      const horas = horasManuais[subject.id] || 0;
      dispatch({
        type: 'UPDATE_SUBJECT',
        payload: {
          id: subject.id,
          data: { horasSemanais: horas }
        }
      });
    });
    
    // Limpar os estados temporários após salvar
    setHorasManuaisInput({});
  };

  // Funções para modo pomodoro
  const handleSessoesManuaisInputChange = (subjectId: string, value: string) => {
    // Atualiza o valor do input (permite vazio)
    setSessoesManuaisInput(prev => ({ ...prev, [subjectId]: value }));

    // Se o valor não estiver vazio, atualiza as sessões com validação de limite
    if (value.trim() !== '') {
      const numValue = Number(value.replace(',', '.'));
      if (!isNaN(numValue) && numValue >= 0) {
        // Calcular limite baseado no disponível + já alocado para esta matéria
        const sessoesAtuaisDestaMateria = sessoesManuais[subjectId] || 0;
        const maxPermitido = sessoesAtuaisDestaMateria + sessoesRestantesPomodoro;
        const sessoesLimitadas = Math.min(numValue, maxPermitido);
        setSessoesManuais(prev => ({ ...prev, [subjectId]: sessoesLimitadas }));
      }
    } else {
      // Se vazio, mantém o valor atual
      setSessoesManuais(prev => ({ ...prev, [subjectId]: prev[subjectId] || 0 }));
    }
  };

  const handleSessoesManuaisInputBlur = (subjectId: string) => {
    const inputValue = sessoesManuaisInput[subjectId];

    if (!inputValue || inputValue.trim() === '') {
      // Se vazio, define como 0
      setSessoesManuais(prev => ({ ...prev, [subjectId]: 0 }));
      setSessoesManuaisInput(prev => ({ ...prev, [subjectId]: '0' }));
    } else {
      // Valida e limita o valor baseado no disponível
      const numValue = Number(inputValue.replace(',', '.'));
      if (!isNaN(numValue)) {
        const sessoesAtuaisDestaMateria = sessoesManuais[subjectId] || 0;
        const maxPermitido = sessoesAtuaisDestaMateria + sessoesRestantesPomodoro;
        const sessoesLimitadas = Math.min(Math.max(0, numValue), maxPermitido);
        setSessoesManuais(prev => ({ ...prev, [subjectId]: sessoesLimitadas }));
        setSessoesManuaisInput(prev => ({ ...prev, [subjectId]: String(sessoesLimitadas) }));
      } else {
        // Se inválido, volta ao valor atual
        const currentValue = sessoesManuais[subjectId] || 0;
        setSessoesManuaisInput(prev => ({ ...prev, [subjectId]: String(currentValue) }));
      }
    }
  };

  const salvarSessoesManuais = () => {
    // Salvar as sessões no contexto (converter para horas)
    subjects.forEach(subject => {
      const sessoes = subModoPomodoro === 'automatico' ? getSessoesMateria(subject.id) : (sessoesManuais[subject.id] || 0);
      const horas = sessoes * (duracaoSessao / 60);
      dispatch({
        type: 'UPDATE_SUBJECT',
        payload: {
          id: subject.id,
          data: { horasSemanais: horas }
        }
      });
    });
    
    // Limpar os estados temporários após salvar (apenas no modo manual)
    if (subModoPomodoro === 'manual') {
      setSessoesManuaisInput({});
    }
  };

  // Calcular sessões restantes no modo pomodoro
  const sessoesRestantesPomodoro = useMemo(() => {
    if (modoPlanejamento !== 'pomodoro') return 0;
    
    const maxSessoes = Math.round(totalHorasSemanais * 60 / duracaoSessao);
    
    let totalDistribuidas = 0;
    if (subModoPomodoro === 'automatico') {
      // Calcular sessões automáticas inline
      const materias = subjects.length;
      if (materias > 0 && maxSessoes > 0) {
        const iniciantes = subjects.filter(s => (s.nivelConhecimento || 'intermediario') === 'iniciante');
        const intermediarios = subjects.filter(s => (s.nivelConhecimento || 'intermediario') === 'intermediario');
        const avancados = subjects.filter(s => (s.nivelConhecimento || 'intermediario') === 'avancado');

        let sessoesRestantes = maxSessoes;

        if (iniciantes.length > 0) {
          const sessoesParaIniciantes = Math.ceil(maxSessoes * 0.5);
          totalDistribuidas += sessoesParaIniciantes;
          sessoesRestantes -= sessoesParaIniciantes;
        }

        if (intermediarios.length > 0 && sessoesRestantes > 0) {
          const sessoesParaIntermediarios = Math.ceil(sessoesRestantes * 0.7);
          totalDistribuidas += sessoesParaIntermediarios;
          sessoesRestantes -= sessoesParaIntermediarios;
        }

        if (avancados.length > 0 && sessoesRestantes > 0) {
          totalDistribuidas += sessoesRestantes;
        }
      }
    } else {
      totalDistribuidas = subjects.reduce((sum, subject) => sum + (sessoesManuais[subject.id] || 0), 0);
    }
    
    return Math.max(0, maxSessoes - totalDistribuidas);
  }, [modoPlanejamento, subModoPomodoro, subjects, totalHorasSemanais, duracaoSessao, sessoesManuais]);

  // Calcular total de sessões distribuídas no modo pomodoro
  const totalSessoesDistribuidas = useMemo(() => {
    if (modoPlanejamento !== 'pomodoro') return 0;
    
    if (subModoPomodoro === 'automatico') {
      const maxSessoes = Math.round(totalHorasSemanais * 60 / duracaoSessao);
      const materias = subjects.length;
      if (materias === 0 || maxSessoes <= 0) return 0;

      const iniciantes = subjects.filter(s => (s.nivelConhecimento || 'intermediario') === 'iniciante');
      const intermediarios = subjects.filter(s => (s.nivelConhecimento || 'intermediario') === 'intermediario');
      const avancados = subjects.filter(s => (s.nivelConhecimento || 'intermediario') === 'avancado');

      let total = 0;
      let sessoesRestantes = maxSessoes;

      if (iniciantes.length > 0) {
        const sessoesParaIniciantes = Math.ceil(maxSessoes * 0.5);
        total += sessoesParaIniciantes;
        sessoesRestantes -= sessoesParaIniciantes;
      }

      if (intermediarios.length > 0 && sessoesRestantes > 0) {
        const sessoesParaIntermediarios = Math.ceil(sessoesRestantes * 0.7);
        total += sessoesParaIntermediarios;
        sessoesRestantes -= sessoesParaIntermediarios;
      }

      if (avancados.length > 0 && sessoesRestantes > 0) {
        total += sessoesRestantes;
      }

      return total;
    } else {
      return subjects.reduce((sum, subject) => sum + (sessoesManuais[subject.id] || 0), 0);
    }
  }, [modoPlanejamento, subModoPomodoro, subjects, totalHorasSemanais, duracaoSessao, sessoesManuais]);

  // Calcular máximo de sessões possíveis baseado no tempo semanal
  const maxSessoesPossiveis = useMemo(() => {
    if (modoPlanejamento !== 'pomodoro' || duracaoSessao <= 0) return 0;
    return Math.round(totalHorasSemanais * 60 / duracaoSessao);
  }, [modoPlanejamento, totalHorasSemanais, duracaoSessao]);

  // Função para obter sessões de uma matéria (considerando modo automático ou manual)
  const getSessoesMateria = (subjectId: string) => {
    if (modoPlanejamento !== 'pomodoro') return 0;
    
    if (subModoPomodoro === 'automatico') {
      const maxSessoes = Math.round(totalHorasSemanais * 60 / duracaoSessao);
      if (maxSessoes <= 0) return 0;

      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) return 0;

      const nivel = subject.nivelConhecimento || 'intermediario';
      const iniciantes = subjects.filter(s => (s.nivelConhecimento || 'intermediario') === 'iniciante');
      const intermediarios = subjects.filter(s => (s.nivelConhecimento || 'intermediario') === 'intermediario');
      const avancados = subjects.filter(s => (s.nivelConhecimento || 'intermediario') === 'avancado');

      if (nivel === 'iniciante' && iniciantes.length > 0) {
        const sessoesParaIniciantes = Math.ceil(maxSessoes * 0.5);
        const index = iniciantes.findIndex(s => s.id === subjectId);
        if (index !== -1) {
          const sessoesPorMateria = Math.floor(sessoesParaIniciantes / iniciantes.length);
          const resto = sessoesParaIniciantes % iniciantes.length;
          return sessoesPorMateria + (index < resto ? 1 : 0);
        }
      } else if (nivel === 'intermediario' && intermediarios.length > 0) {
        let sessoesRestantes = maxSessoes;
        if (iniciantes.length > 0) {
          sessoesRestantes -= Math.ceil(maxSessoes * 0.5);
        }
        if (sessoesRestantes > 0) {
          const sessoesParaIntermediarios = Math.ceil(sessoesRestantes * 0.7);
          const index = intermediarios.findIndex(s => s.id === subjectId);
          if (index !== -1) {
            const sessoesPorMateria = Math.floor(sessoesParaIntermediarios / intermediarios.length);
            const resto = sessoesParaIntermediarios % intermediarios.length;
            return sessoesPorMateria + (index < resto ? 1 : 0);
          }
        }
      } else if (nivel === 'avancado' && avancados.length > 0) {
        let sessoesRestantes = maxSessoes;
        if (iniciantes.length > 0) {
          sessoesRestantes -= Math.ceil(maxSessoes * 0.5);
        }
        if (intermediarios.length > 0 && sessoesRestantes > 0) {
          sessoesRestantes -= Math.ceil(sessoesRestantes * 0.7);
        }
        if (sessoesRestantes > 0) {
          const index = avancados.findIndex(s => s.id === subjectId);
          if (index !== -1) {
            const sessoesPorMateria = Math.floor(sessoesRestantes / avancados.length);
            const resto = sessoesRestantes % avancados.length;
            return sessoesPorMateria + (index < resto ? 1 : 0);
          }
        }
      }
      return 0;
    } else {
      return sessoesManuais[subjectId] || 0;
    }
  };

  // Calcular sessões automáticas baseado no nível de conhecimento
  const sessoesAutomaticas = useMemo(() => {
    if (modoPlanejamento !== 'pomodoro' || subModoPomodoro !== 'automatico') return {};

    const materias = subjects.length;
    if (materias === 0) return {};

    const maxSessoes = maxSessoesPossiveis;
    if (maxSessoes <= 0) return {};

    // Separar matérias por nível de conhecimento
    const iniciantes = subjects.filter(s => (s.nivelConhecimento || 'intermediario') === 'iniciante');
    const intermediarios = subjects.filter(s => (s.nivelConhecimento || 'intermediario') === 'intermediario');
    const avancados = subjects.filter(s => (s.nivelConhecimento || 'intermediario') === 'avancado');

    const resultado: {[id: string]: number} = {};

    // Distribuição por prioridade: Iniciante > Intermediário > Avançado
    const distribuirSessoes = (materias: typeof subjects, sessoesDisponiveis: number) => {
      if (materias.length === 0 || sessoesDisponiveis <= 0) return 0;
      
      const sessoesPorMateria = Math.floor(sessoesDisponiveis / materias.length);
      const resto = sessoesDisponiveis % materias.length;
      
      // Distribui sessões igualmente, com resto para as primeiras matérias
      materias.forEach((materia, index) => {
        const sessoesExtras = index < resto ? 1 : 0;
        resultado[materia.id] = sessoesPorMateria + sessoesExtras;
      });
      
      return sessoesDisponiveis;
    };

    let sessoesRestantes = maxSessoes;

    // Primeiro: Iniciantes recebem prioridade máxima
    if (iniciantes.length > 0) {
      const sessoesParaIniciantes = Math.ceil(maxSessoes * 0.5); // 50% para iniciantes
      sessoesRestantes -= distribuirSessoes(iniciantes, sessoesParaIniciantes);
    }

    // Segundo: Intermediários
    if (intermediarios.length > 0 && sessoesRestantes > 0) {
      const sessoesParaIntermediarios = Math.ceil(sessoesRestantes * 0.7); // 70% do restante
      sessoesRestantes -= distribuirSessoes(intermediarios, sessoesParaIntermediarios);
    }

    // Terceiro: Avançados recebem o que sobrar
    if (avancados.length > 0 && sessoesRestantes > 0) {
      distribuirSessoes(avancados, sessoesRestantes);
    }

    return resultado;
  }, [modoPlanejamento, subModoPomodoro, subjects, maxSessoesPossiveis]);

  // Calcular horas restantes no modo manual com validação
  const horasRestantesManual = useMemo(() => {
    if (modoPlanejamento === 'automatico') return 0;
    const totalDistribuidas = subjects.reduce((sum, subject) => {
      return sum + (horasManuais[subject.id] || 0);
    }, 0);
    return Math.max(0, totalHorasSemanais - totalDistribuidas);
  }, [modoPlanejamento, horasManuais, subjects, totalHorasSemanais]);

  // Verificar se há problemas no modo manual
  const problemasModoManual = useMemo(() => {
    if (modoPlanejamento !== 'manual') return null;

    const totalDistribuidas = subjects.reduce((sum, subject) => {
      return sum + (horasManuais[subject.id] || 0);
    }, 0);

    if (totalDistribuidas > totalHorasSemanais + 0.1) {
      return {
        tipo: 'excesso',
        mensagem: `Total distribuído (${totalDistribuidas.toFixed(1)}h) excede o limite de ${totalHorasSemanais}h`,
        severidade: 'error'
      };
    }

    return null;
  }, [modoPlanejamento, horasManuais, subjects, totalHorasSemanais]);

  // Calcular horas baseadas em multiplicadores para o modo manual
  const horasBaseMultiplicadoresManual = useMemo(() => {
    if (modoPlanejamento !== 'manual-com-multiplicadores') return {};

    const materias = subjects.length;
    if (materias === 0) return {};

    const multiplicadores = subjects.map(s => {
      // Se o usuário está digitando, prioriza o valor do input
      const inputVal = multiplicadoresInput[s.id];
      if (inputVal !== undefined) {
        const num = Number(inputVal.replace(',', '.'));
        return isNaN(num) || num <= 0 ? 1 : num;
      }
      return s.peso || 1;
    });

    // Calcular horas base (igual para todos)
    const horasBasePorMateria = totalHorasSemanais / materias;

    // Calcular horas efetivas baseado no multiplicador
    const horasEfetivas = subjects.map((s, idx) => ({
      subjectId: s.id,
      horas: horasBasePorMateria * multiplicadores[idx],
      nivel: s.nivelConhecimento || 'intermediario',
      multiplicador: multiplicadores[idx]
    }));

    // Calcular horas totais efetivas
    const horasTotaisEfetivas = horasEfetivas.reduce((sum, item) => sum + item.horas, 0);

    // Se as horas efetivas são menores que o total, distribuir o restante
    if (horasTotaisEfetivas < totalHorasSemanais) {
      const horasRestantes = totalHorasSemanais - horasTotaisEfetivas;

      // Separar matérias que têm multiplicador = 1 (podem receber horas extras)
      const materiasComMultiplicadorNormal = horasEfetivas.filter(h => h.multiplicador >= 1);

      // Dentro dessas, separar por nível de prioridade
      const iniciantesNormais = materiasComMultiplicadorNormal.filter(h => h.nivel === 'iniciante');
      const intermediariosNormais = materiasComMultiplicadorNormal.filter(h => h.nivel === 'intermediario');
      const avancadosNormais = materiasComMultiplicadorNormal.filter(h => h.nivel === 'avancado');

      // Distribuir horas restantes por prioridade
      const distribuirHorasRestantes = (materias: typeof horasEfetivas, horasParaDistribuir: number) => {
        if (materias.length === 0) return;
        const horasPorMateria = horasParaDistribuir / materias.length;
        materias.forEach(materia => {
          materia.horas += horasPorMateria;
        });
      };

      // Primeiro para iniciantes com multiplicador normal
      if (iniciantesNormais.length > 0) {
        distribuirHorasRestantes(iniciantesNormais, horasRestantes);
      }
      // Depois para intermediários com multiplicador normal
      else if (intermediariosNormais.length > 0) {
        distribuirHorasRestantes(intermediariosNormais, horasRestantes);
      }
      // Por último para avançados com multiplicador normal
      else if (avancadosNormais.length > 0) {
        distribuirHorasRestantes(avancadosNormais, horasRestantes);
      }
    }

    // Retornar objeto com subjectId -> horas
    const resultado: {[id: string]: number} = {};
    horasEfetivas.forEach(item => {
      resultado[item.subjectId] = Math.round(item.horas * 10) / 10;
    });
    return resultado;
  }, [modoPlanejamento, subjects, totalHorasSemanais, multiplicadoresInput]);

  // Calcular o máximo possível para cada matéria no modo manual
  const getMaxHorasParaMateria = useMemo(() => {
    return (subjectId: string) => {
      if (modoPlanejamento === 'automatico') return totalHorasSemanais;
      
      const horasAtuaisDestaMateria = horasManuais[subjectId] || 0;
      const totalOutrasMaterias = subjects.reduce((sum, subject) => {
        if (subject.id === subjectId) return sum;
        return sum + (horasManuais[subject.id] || 0);
      }, 0);
      
      // Máximo = horas restantes + horas já alocadas para esta matéria
      return totalHorasSemanais - totalOutrasMaterias;
    };
  }, [modoPlanejamento, horasManuais, subjects, totalHorasSemanais]);

  // Efeito para inicializar horas manuais quando ativar multiplicadores
  useEffect(() => {
    if (modoPlanejamento === 'manual-com-multiplicadores') {
      // Verifica se já tem valores significativos definidos
      const hasSignificantValues = Object.values(horasManuais).some(h => h > 0);

      if (!hasSignificantValues) {
        // Só inicializa se não há valores significativos
        setHorasManuais(horasBaseMultiplicadoresManual);
        const novosInputs: {[id: string]: string} = {};
        Object.entries(horasBaseMultiplicadoresManual).forEach(([subjectId, horas]) => {
          novosInputs[subjectId] = String(horas);
        });
        setHorasManuaisInput(novosInputs);
      }
      // Se já tem valores, mantém como estão (usuário pode ajustar)
    }
  }, [modoPlanejamento, horasBaseMultiplicadoresManual]);

  // Efeito para limpar estados quando sai do modo manual
  useEffect(() => {
    if (modoPlanejamento === 'automatico') {
      setHorasManuais({});
      setHorasManuaisInput({});
    } else if (modoPlanejamento === 'pomodoro') {
      setHorasManuais({});
      setHorasManuaisInput({});
      setSessoesManuais({});
      setSessoesManuaisInput({});
    }
  }, [modoPlanejamento]);

  // Calcula as horas por matéria com base no multiplicador (modo automático)
  const horasPorMateria = useMemo(() => {
    const materias = subjects.length;
    if (materias === 0) return [];

    const multiplicadores = subjects.map(s => {
      // Se o usuário está digitando, prioriza o valor do input
      const inputVal = multiplicadoresInput[s.id];
      if (inputVal !== undefined) {
        const num = Number(inputVal.replace(',', '.'));
        return isNaN(num) || num <= 0 ? 1 : num;
      }
      return s.peso || 1;
    });

    // Calcular horas base (igual para todos)
    const horasBasePorMateria = totalHorasSemanais / materias;

    // Calcular horas efetivas baseado no multiplicador
    const horasEfetivas = subjects.map((s, idx) => ({
      subjectId: s.id,
      horas: horasBasePorMateria * multiplicadores[idx],
      nivel: s.nivelConhecimento || 'intermediario',
      multiplicador: multiplicadores[idx]
    }));

    // Calcular horas totais efetivas
    const horasTotaisEfetivas = horasEfetivas.reduce((sum, item) => sum + item.horas, 0);

    // Se as horas efetivas são menores que o total, distribuir o restante
    if (horasTotaisEfetivas < totalHorasSemanais) {
      const horasRestantes = totalHorasSemanais - horasTotaisEfetivas;

      // Separar matérias que têm multiplicador = 1 (podem receber horas extras)
      const materiasComMultiplicadorNormal = horasEfetivas.filter(h => h.multiplicador >= 1);

      // Dentro dessas, separar por nível de prioridade
      const iniciantesNormais = materiasComMultiplicadorNormal.filter(h => h.nivel === 'iniciante');
      const intermediariosNormais = materiasComMultiplicadorNormal.filter(h => h.nivel === 'intermediario');
      const avancadosNormais = materiasComMultiplicadorNormal.filter(h => h.nivel === 'avancado');

      // Distribuir horas restantes por prioridade
      const distribuirHorasRestantes = (materias: typeof horasEfetivas, horasParaDistribuir: number) => {
        if (materias.length === 0) return;
        const horasPorMateria = horasParaDistribuir / materias.length;
        materias.forEach(materia => {
          materia.horas += horasPorMateria;
        });
      };

      // Primeiro para iniciantes com multiplicador normal
      if (iniciantesNormais.length > 0) {
        distribuirHorasRestantes(iniciantesNormais, horasRestantes);
      }
      // Depois para intermediários com multiplicador normal
      else if (intermediariosNormais.length > 0) {
        distribuirHorasRestantes(intermediariosNormais, horasRestantes);
      }
      // Por último para avançados com multiplicador normal
      else if (avancadosNormais.length > 0) {
        distribuirHorasRestantes(avancadosNormais, horasRestantes);
      }
    }

    return horasEfetivas.map(item => ({
      subjectId: item.subjectId,
      horas: Math.round(item.horas * 10) / 10
    }));
  }, [subjects, totalHorasSemanais, multiplicadoresInput]);

  // Calcula as horas por matéria para modo manual-com-multiplicadores (sem redistribuição automática)
  const horasPorMateriaManualComMultiplicadores = useMemo(() => {
    const materias = subjects.length;
    if (materias === 0) return [];

    const multiplicadores = subjects.map(s => {
      // Se o usuário está digitando, prioriza o valor do input
      const inputVal = multiplicadoresInput[s.id];
      if (inputVal !== undefined) {
        const num = Number(inputVal.replace(',', '.'));
        return isNaN(num) || num <= 0 ? 1 : num;
      }
      return s.peso || 1;
    });

    // Calcular horas base (igual para todos)
    const horasBasePorMateria = totalHorasSemanais / materias;

    // Calcular horas efetivas baseado no multiplicador (sem redistribuição)
    const horasEfetivas = subjects.map((s, idx) => ({
      subjectId: s.id,
      horas: horasBasePorMateria * multiplicadores[idx]
    }));

    return horasEfetivas.map(item => ({
      subjectId: item.subjectId,
      horas: Math.round(item.horas * 10) / 10
    }));
  }, [subjects, totalHorasSemanais, multiplicadoresInput]);

  // Verificar se há excesso de horas
  const totalHorasCalculadas = useMemo(() => {
    if (modoPlanejamento === 'manual-com-multiplicadores') {
      return horasPorMateriaManualComMultiplicadores.reduce((sum, item) => sum + item.horas, 0);
    }
    return horasPorMateria.reduce((sum, item) => sum + item.horas, 0);
  }, [horasPorMateria, horasPorMateriaManualComMultiplicadores, modoPlanejamento]);

  const horasExcedidas = totalHorasCalculadas - totalHorasSemanais;
  const temExcesso = horasExcedidas > 0.1; // tolerância de 0.1 hora para arredondamentos

  // Verificar se há horas não distribuídas no modo manual-com-multiplicadores
  const horasNaoDistribuidas = useMemo(() => {
    if (modoPlanejamento !== 'manual-com-multiplicadores') return 0;
    return Math.max(0, totalHorasSemanais - totalHorasCalculadas);
  }, [modoPlanejamento, totalHorasSemanais, totalHorasCalculadas]);

  const temHorasNaoDistribuidas = horasNaoDistribuidas > 0.1; // tolerância de 0.1 hora

  const getHorasMateria = (subjectId: string) => {
    if (modoPlanejamento === 'manual-com-multiplicadores') {
      return horasPorMateriaManualComMultiplicadores.find(h => h.subjectId === subjectId)?.horas || 0;
    }
    return horasPorMateria.find(h => h.subjectId === subjectId)?.horas || 0;
  };

  // Função para formatar tempo em horas/minutos
  const formatarTempo = (horas: number) => {
    if (horas < 1) {
      // Menos de 1 hora, mostrar em minutos
      const minutos = Math.round(horas * 60);
      return `${minutos}min`;
    } else {
      // 1 hora ou mais, mostrar horas e minutos
      const horasInteiras = Math.floor(horas);
      const minutos = Math.round((horas - horasInteiras) * 60);
      if (minutos === 0) {
        return `${horasInteiras}h`;
      } else {
        return `${horasInteiras}h ${minutos}min`;
      }
    }
  };

  const nivelLabels: Record<string, string> = {
    'iniciante': 'Iniciante',
    'intermediario': 'Intermediário',
    'avancado': 'Avançado'
  };
  const nivelColors: Record<string, string> = {
    'iniciante': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    'intermediario': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    'avancado': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Planejamento
          </h2>
          <p className="text-muted-foreground">
            Defina sua disponibilidade e distribua o tempo entre as matérias.
          </p>
        </div>

        <Card>
          <CardContent className="p-4 grid gap-4 md:grid-cols-3 items-end">
            <div className="space-y-2">
              <Label htmlFor="total-hours">Horas Semanais</Label>
              <div className="relative">
                <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="total-hours"
                  type="number"
                  min="1"
                  max="168"
                  value={totalHorasSemanais}
                  onChange={(e) => setTotalHorasSemanais(Number(e.target.value))}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total-sessions">
                {modoPlanejamento === 'pomodoro' ? 'Duração Sessão (min)' : 'Sessões Semanais'}
              </Label>
              <div className="relative">
                <Calculator className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="total-sessions"
                  type="number"
                  min="1"
                  max={modoPlanejamento === 'pomodoro' ? "120" : "200"}
                  value={sessoesSemanais}
                  onChange={(e) => setSessoesSemanais(Number(e.target.value))}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Modo de Planejamento</Label>
              <Select value={modoPlanejamento} onValueChange={handleModoPlanejamentoChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatico">Automático</SelectItem>
                  <SelectItem value="manual">Manual (Horas)</SelectItem>
                  <SelectItem value="manual-com-multiplicadores">Manual (Multiplicadores)</SelectItem>
                  <SelectItem value="pomodoro">Pomodoro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {modoPlanejamento === 'pomodoro' && (
          <div className="flex items-center gap-4 bg-muted/50 p-3 rounded-lg border">
            <span className="text-sm font-medium">Distribuição Pomodoro:</span>
            <div className="flex gap-2">
              <Button 
                variant={subModoPomodoro === 'automatico' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSubModoPomodoro('automatico')}
                className="h-8"
              >
                Automática
              </Button>
              <Button 
                variant={subModoPomodoro === 'manual' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSubModoPomodoro('manual')}
                className="h-8"
              >
                Manual
              </Button>
            </div>
            <div className="ml-auto text-xs text-muted-foreground">
              {subModoPomodoro === 'automatico' 
                ? "Distribui baseado no nível de conhecimento" 
                : "Você define o número de sessões por matéria"}
            </div>
          </div>
        )}
      </div>

      {/* Summary Bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b py-4 -mx-4 px-4 md:mx-0 md:px-0 md:border-0 md:bg-transparent">
        <Card className="border-primary/20 bg-primary/5 shadow-sm">
          <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase font-bold">Total</span>
                <span className="text-2xl font-bold text-primary">{totalHorasSemanais}h</span>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase font-bold">Sessões</span>
                <span className="text-lg font-semibold">{sessoesSemanais}</span>
              </div>
              {modoPlanejamento === 'pomodoro' && (
                <>
                  <Separator orientation="vertical" className="h-8" />
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-bold">Duração</span>
                    <span className="text-sm">{duracaoSessao} min</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex-1 w-full md:max-w-md space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progresso da Distribuição</span>
                <span className={cn(
                  "font-bold",
                  (modoPlanejamento === 'manual' && horasRestantesManual > 0) || 
                  (modoPlanejamento === 'pomodoro' && sessoesRestantesPomodoro > 0) 
                    ? "text-orange-600" 
                    : "text-green-600"
                )}>
                  {modoPlanejamento === 'manual' 
                    ? `${(totalHorasSemanais - horasRestantesManual).toFixed(1)}h usadas` 
                    : modoPlanejamento === 'pomodoro'
                    ? `${totalSessoesDistribuidas}/${maxSessoesPossiveis} sessões`
                    : "100% Automático"}
                </span>
              </div>
              <Progress 
                value={
                  modoPlanejamento === 'manual' 
                    ? ((totalHorasSemanais - horasRestantesManual) / totalHorasSemanais) * 100
                    : modoPlanejamento === 'pomodoro'
                    ? (totalSessoesDistribuidas / maxSessoesPossiveis) * 100
                    : modoPlanejamento === 'manual-com-multiplicadores'
                    ? (totalHorasCalculadas / totalHorasSemanais) * 100
                    : 100
                } 
                className="h-2"
              />
            </div>

            <div className="w-full md:w-auto flex justify-end">
               {/* Save Button Logic */}
               {modoPlanejamento === 'manual' && (
                  <Button 
                    onClick={salvarHorasManuais}
                    disabled={horasRestantesManual > 0}
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                )}
                {modoPlanejamento === 'pomodoro' && (
                  <Button 
                    onClick={salvarSessoesManuais}
                    disabled={subModoPomodoro === 'manual' && totalSessoesDistribuidas > maxSessoesPossiveis}
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warnings */}
      {problemasModoManual && (
        <Alert variant={problemasModoManual.severidade === 'error' ? 'destructive' : 'default'}>
          <AlertTitle>{problemasModoManual.severidade === 'error' ? 'Erro' : 'Aviso'}</AlertTitle>
          <AlertDescription>{problemasModoManual.mensagem}</AlertDescription>
        </Alert>
      )}
      
      {temHorasNaoDistribuidas && (
        <Alert className="bg-orange-50 border-orange-200 text-orange-800">
          <AlertTitle>Horas Livres</AlertTitle>
          <AlertDescription>
            {horasNaoDistribuidas.toFixed(1)}h não distribuídas. Ajuste os multiplicadores para usar todo o tempo.
          </AlertDescription>
        </Alert>
      )}

      {modoPlanejamento === 'pomodoro' && totalSessoesDistribuidas > maxSessoesPossiveis && (
        <Alert variant="destructive">
          <AlertTitle>Limite Excedido</AlertTitle>
          <AlertDescription>
            Você planejou {totalSessoesDistribuidas} sessões, mas só cabem {maxSessoesPossiveis} no seu horário.
          </AlertDescription>
        </Alert>
      )}

      {/* Subjects Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Matéria</TableHead>
              <TableHead className="w-[150px]">Nível</TableHead>
              <TableHead>Configuração</TableHead>
              <TableHead className="w-[150px] text-right">Resultado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Nenhuma matéria cadastrada. Adicione matérias na aba "Ciclo".
                </TableCell>
              </TableRow>
            ) : (
              subjects.map((subject) => {
                const horas = modoPlanejamento === 'manual' 
                  ? (horasManuais[subject.id] || 0)
                  : getHorasMateria(subject.id);
                
                const sessoes = modoPlanejamento === 'pomodoro'
                  ? (subModoPomodoro === 'automatico' ? getSessoesMateria(subject.id) : (sessoesManuais[subject.id] || 0))
                  : 0;

                return (
                  <TableRow key={subject.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full ring-1 ring-offset-1 ring-offset-background" 
                          style={{ backgroundColor: subject.color }}
                        />
                        <span className="font-medium">{subject.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={subject.nivelConhecimento || 'intermediario'}
                        onValueChange={(value) => dispatch({ type: 'UPDATE_SUBJECT', payload: { id: subject.id, data: { nivelConhecimento: value } } })}
                      >
                        <SelectTrigger className="h-8 w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="iniciante">Iniciante</SelectItem>
                          <SelectItem value="intermediario">Intermediário</SelectItem>
                          <SelectItem value="avancado">Avançado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {modoPlanejamento === 'manual' ? (
                        <div className="flex items-center gap-4">
                          <Input
                            type="number"
                            min="0"
                            max={getMaxHorasParaMateria(subject.id)}
                            step="0.5"
                            value={horasManuaisInput[subject.id] !== undefined ? horasManuaisInput[subject.id] : String(horasManuais[subject.id] || 0)}
                            onChange={(e) => handleHorasManuaisInputChange(subject.id, e.target.value)}
                            onBlur={() => handleHorasManuaisInputBlur(subject.id)}
                            className="h-8 w-20"
                          />
                          <input
                            type="range"
                            min="0"
                            max={getMaxHorasParaMateria(subject.id)}
                            step="0.5"
                            value={horasManuais[subject.id] || 0}
                            onChange={(e) => handleHorasManuaisChange(subject.id, Number(e.target.value))}
                            className="w-full max-w-[200px] h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      ) : modoPlanejamento === 'pomodoro' && subModoPomodoro === 'manual' ? (
                        <div className="flex items-center gap-4">
                          <Input
                            type="number"
                            min="0"
                            value={sessoesManuaisInput[subject.id] !== undefined ? sessoesManuaisInput[subject.id] : String(sessoesManuais[subject.id] || 0)}
                            onChange={(e) => handleSessoesManuaisInputChange(subject.id, e.target.value)}
                            onBlur={() => handleSessoesManuaisInputBlur(subject.id)}
                            className="h-8 w-20"
                          />
                          <input
                            type="range"
                            min="0"
                            max={Math.max(1, (sessoesManuais[subject.id] || 0) + sessoesRestantesPomodoro)}
                            step="1"
                            value={sessoesManuais[subject.id] || 0}
                            onChange={(e) => {
                                const newValue = Number(e.target.value);
                                const sessoesAtuaisDestaMateria = sessoesManuais[subject.id] || 0;
                                const maxPermitido = sessoesAtuaisDestaMateria + sessoesRestantesPomodoro;
                                const sessoesLimitadas = Math.min(newValue, maxPermitido);
                                setSessoesManuais(prev => ({ ...prev, [subject.id]: sessoesLimitadas }));
                                setSessoesManuaisInput(prev => ({ ...prev, [subject.id]: String(sessoesLimitadas) }));
                            }}
                            className="w-full max-w-[200px] h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      ) : modoPlanejamento === 'pomodoro' && subModoPomodoro === 'automatico' ? (
                        <span className="text-sm text-muted-foreground italic">Calculado automaticamente</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Label className="text-xs whitespace-nowrap">Multiplicador:</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={multiplicadoresInput[subject.id] !== undefined ? multiplicadoresInput[subject.id] : (typeof subject.peso === 'number' ? String(subject.peso) : '')}
                                onChange={e => handleInputChange(subject.id, e.target.value)}
                                onBlur={() => handleInputCommit(subject.id)}
                                onKeyDown={e => { if (e.key === 'Enter') handleInputCommit(subject.id); }}
                                className={cn("h-8 w-20", modoPlanejamento === 'automatico' && temExcesso && "border-red-300")}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Ajuste o peso desta matéria</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-primary">
                          {modoPlanejamento === 'pomodoro' ? `${sessoes} sessões` : `${horas}h`}
                        </span>
                        {modoPlanejamento === 'pomodoro' && duracaoSessao > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ~{formatarTempo(sessoes * duracaoSessao / 60)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
