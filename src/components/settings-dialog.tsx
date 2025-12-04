"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Settings, Trash2, Keyboard } from "lucide-react";
import { useStudy } from "@/contexts/study-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { INITIAL_SUBJECTS } from "@/lib/data";
// import { KeyboardShortcutsHelp } from "@/hooks/use-keyboard-shortcuts";

export function SettingsDialog() {
    const { dispatch } = useStudy();
    const { user } = useAuth();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);

    const handleResetData = () => {
        if (confirm("Tem certeza? Isso apagará todos os seus dados de estudo locais. Essa ação não pode ser desfeita.")) {
            if (user) {
                localStorage.removeItem(`estudeaqui_data_${user.id}`);
            }
            dispatch({ type: 'SET_STATE', payload: { subjects: INITIAL_SUBJECTS, studyLog: [], lastStudiedDate: null, streak: 0, studySequence: null, sequenceIndex: 0, templates: [] } });
            toast({
                title: "Dados resetados",
                description: "Seus dados foram limpos com sucesso.",
            });
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Configurações">
                    <Settings className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Configurações</DialogTitle>
                    <DialogDescription>
                        Gerencie suas preferências e dados.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Keyboard className="h-4 w-4" />
                            <h4 className="text-sm font-medium">Atalhos de Teclado</h4>
                        </div>
                        <div className="border rounded-lg p-4 bg-muted/30">
                            <div className="text-sm text-muted-foreground space-y-1">
                                <p>• <kbd className="px-1 py-0.5 text-xs bg-muted border rounded">Ctrl+1</kbd> a <kbd className="px-1 py-0.5 text-xs bg-muted border rounded">Ctrl+6</kbd> - Navegar entre abas</p>
                                <p>• <kbd className="px-1 py-0.5 text-xs bg-muted border rounded">Ctrl+Shift+N</kbd> - Nova matéria</p>
                                <p>• <kbd className="px-1 py-0.5 text-xs bg-muted border rounded">Ctrl+Shift+S</kbd> - Salvar template</p>
                                <p>• <kbd className="px-1 py-0.5 text-xs bg-muted border rounded">Ctrl+Shift+L</kbd> - Carregar template</p>
                                <p>• <kbd className="px-1 py-0.5 text-xs bg-muted border rounded">Ctrl+Shift+D</kbd> - Alternar tema</p>
                                <p>• <kbd className="px-1 py-0.5 text-xs bg-muted border rounded">Ctrl+Shift+Q</kbd> - Sair</p>
                                <p>• <kbd className="px-1 py-0.5 text-xs bg-muted border rounded">Ctrl+6</kbd> - Ir para Pomodoro</p>
                                <p>• <kbd className="px-1 py-0.5 text-xs bg-muted border rounded">Ctrl+Shift+P</kbd> - Abrir seletor Pomodoro</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg bg-destructive/10 border-destructive/20">
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-destructive">Zona de Perigo</h4>
                            <p className="text-xs text-muted-foreground">
                                Apagar todos os dados salvos localmente.
                            </p>
                        </div>
                        <Button variant="destructive" size="sm" onClick={handleResetData}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Resetar Dados
                        </Button>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Fechar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
