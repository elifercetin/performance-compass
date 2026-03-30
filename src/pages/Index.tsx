import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useKriterStore } from "@/hooks/useKriterStore";
import KriterHavuzu from "@/components/KriterHavuzu";
import AgirlikPuanGirisi from "@/components/AgirlikPuanGirisi";
import { BookOpen, Link2, ArrowLeft, CheckCircle } from "lucide-react";

const DONEMLER = ["2025", "2024", "2023"];
const CURRENT_DONEM = "2025";

export default function Index() {
  const [donem, setDonem] = useState(CURRENT_DONEM);
  const readOnly = donem !== CURRENT_DONEM;
  const { kriterler, addKriter, updateKriter, deleteKriter, toggleAktif, setKriterler } =
    useKriterStore();

  const handleSaveWeights = useCallback(
    (updated: typeof kriterler) => {
      setKriterler(updated);
    },
    [setKriterler]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <CheckCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Performans Yönetimi
              </h1>
              <p className="text-sm text-muted-foreground">
                KBBPYS · Kriter havuzu, ağırlık atama ve değerlendirme
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {readOnly && (
              <Badge variant="secondary" className="text-xs">
                Salt Okunur
              </Badge>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Dönem:</span>
              <Select value={donem} onValueChange={setDonem}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DONEMLER.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="havuz" className="space-y-6">
          <TabsList className="grid w-full max-w-xl grid-cols-2">
            <TabsTrigger value="havuz" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Kriter Havuzu
            </TabsTrigger>
            <TabsTrigger value="agirlik" className="gap-2">
              <Link2 className="h-4 w-4" />
              Ağırlık Puan Girişi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="havuz">
            <KriterHavuzu
              kriterler={kriterler}
              onAdd={addKriter}
              onUpdate={updateKriter}
              onDelete={deleteKriter}
              onToggleAktif={toggleAktif}
              readOnly={readOnly}
            />
          </TabsContent>

          <TabsContent value="agirlik">
            <AgirlikPuanGirisi
              kriterler={kriterler}
              onSave={handleSaveWeights}
              readOnly={readOnly}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
