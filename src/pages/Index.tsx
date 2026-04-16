import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useKriterStore } from "@/hooks/useKriterStore";
import KriterHavuzu from "@/components/KriterHavuzu";
import AgirlikPuanGirisi from "@/components/AgirlikPuanGirisi";
import DegerlendirmeFormu from "@/components/DegerlendirmeFormu";
import { BookOpen, BarChart3, CheckCircle, ClipboardCheck } from "lucide-react";

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
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
              <CheckCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Kriter Yönetimi
              </h1>
              <p className="text-sm text-muted-foreground">
                Mavi Yaka Performans Değerlendirme Sistemi
              </p>
            </div>
          </div>
          {readOnly && (
            <Badge variant="secondary" className="text-xs">
              Salt Okunur
            </Badge>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="havuz" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="havuz" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
              <BookOpen className="h-4 w-4" />
              Kriter Havuzu
            </TabsTrigger>
            <TabsTrigger value="agirlik" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
              <BarChart3 className="h-4 w-4" />
              Ağırlık Girişi
            </TabsTrigger>
            <TabsTrigger value="degerlendirme" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
              <ClipboardCheck className="h-4 w-4" />
              Değerlendirme
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
              donem={donem}
              onDonemChange={setDonem}
              donemler={DONEMLER}
            />
          </TabsContent>

          <TabsContent value="agirlik">
            <AgirlikPuanGirisi
              kriterler={kriterler}
              onSave={handleSaveWeights}
              readOnly={readOnly}
              donem={donem}
              onDonemChange={setDonem}
              donemler={DONEMLER}
            />
          </TabsContent>

          <TabsContent value="degerlendirme">
            <DegerlendirmeFormu
              kriterler={kriterler}
              readOnly={readOnly}
              donem={donem}
              onDonemChange={setDonem}
              donemler={DONEMLER}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}