import { useState, useMemo, useCallback, useEffect } from "react";
import { Kriter, KriterTipi, KRITER_TIPLERI } from "@/types/kriter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Save, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  kriterler: Kriter[];
  onSave: (kriterler: Kriter[]) => void;
  readOnly: boolean;
}

interface GroupedData {
  [tip: string]: {
    [ustKriter: string]: Kriter[];
  };
}

export default function AgirlikPuanGirisi({ kriterler: initialKriterler, onSave, readOnly }: Props) {
  const [localKriterler, setLocalKriterler] = useState<Kriter[]>(initialKriterler);
  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);

  useEffect(() => {
    setLocalKriterler(initialKriterler);
    setIsDirty(false);
  }, [initialKriterler]);

  // Warn on page leave
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const aktifKriterler = useMemo(
    () => localKriterler.filter((k) => k.aktif),
    [localKriterler]
  );

  const grouped = useMemo<GroupedData>(() => {
    const result: GroupedData = {};
    for (const tip of KRITER_TIPLERI) {
      result[tip] = {};
    }
    for (const k of aktifKriterler) {
      if (!result[k.kriterTipi]) result[k.kriterTipi] = {};
      if (!result[k.kriterTipi][k.ustKriter]) result[k.kriterTipi][k.ustKriter] = [];
      result[k.kriterTipi][k.ustKriter].push(k);
    }
    return result;
  }, [aktifKriterler]);

  // Tip-level weights (sum of all sub-criteria under each tip)
  const tipTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const tip of KRITER_TIPLERI) {
      totals[tip] = aktifKriterler
        .filter((k) => k.kriterTipi === tip)
        .reduce((sum, k) => sum + k.agirlikPuani, 0);
    }
    return totals;
  }, [aktifKriterler]);

  const ustKriterTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const k of aktifKriterler) {
      const key = `${k.kriterTipi}::${k.ustKriter}`;
      totals[key] = (totals[key] || 0) + k.agirlikPuani;
    }
    return totals;
  }, [aktifKriterler]);

  const genelToplam = useMemo(
    () => Object.values(tipTotals).reduce((a, b) => a + b, 0),
    [tipTotals]
  );

  const handleWeightChange = useCallback((id: string, value: string) => {
    const num = Math.min(100, Math.max(0, parseInt(value) || 0));
    setLocalKriterler((prev) =>
      prev.map((k) => (k.id === id ? { ...k, agirlikPuani: num } : k))
    );
    setIsDirty(true);
  }, []);

  const handleSave = () => {
    onSave(localKriterler);
    setIsDirty(false);
  };

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Genel Toplam:</span>
          <Badge
            variant={genelToplam === 100 ? "default" : "destructive"}
            className="text-sm px-3 py-1"
          >
            %{genelToplam}
          </Badge>
          {genelToplam !== 100 && (
            <span className="flex items-center gap-1 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Tüm kriter tiplerinin toplamı %100 olmalıdır
            </span>
          )}
        </div>
        {!readOnly && (
          <Button onClick={handleSave} disabled={!isDirty}>
            <Save className="mr-1 h-4 w-4" /> Değişiklikleri Kaydet
          </Button>
        )}
      </div>

      {/* Accordion hierarchy */}
      <Accordion type="multiple" defaultValue={KRITER_TIPLERI.map(String)} className="space-y-2">
        {KRITER_TIPLERI.map((tip) => {
          const ustKriterMap = grouped[tip] || {};
          const ustKriterKeys = Object.keys(ustKriterMap);
          if (ustKriterKeys.length === 0) return null;

          const tipTotal = tipTotals[tip] || 0;

          return (
            <AccordionItem
              key={tip}
              value={tip}
              className="rounded-lg border border-border bg-card overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3 w-full">
                  <span className="font-semibold text-foreground">{tip}</span>
                  <Badge
                    variant={tipTotal > 0 ? "secondary" : "outline"}
                    className="ml-auto mr-4"
                  >
                    %{tipTotal}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-0">
                {ustKriterKeys.map((ustKriter) => {
                  const items = ustKriterMap[ustKriter];
                  const ustKey = `${tip}::${ustKriter}`;
                  const ustTotal = ustKriterTotals[ustKey] || 0;

                  return (
                    <div key={ustKriter} className="border-t border-border">
                      <div className="flex items-center justify-between bg-muted/50 px-6 py-2">
                        <span className="text-sm font-medium text-foreground">{ustKriter}</span>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              ustTotal === 100
                                ? "default"
                                : ustTotal > 100
                                ? "destructive"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            %{ustTotal}
                          </Badge>
                          {ustTotal !== 100 && items.length > 0 && (
                            <span className="text-xs text-destructive">
                              Alt kriterlerin toplamı %100 olmalı
                            </span>
                          )}
                        </div>
                      </div>
                      {items.map((k) => (
                        <div
                          key={k.id}
                          className="flex items-center justify-between border-t border-border/50 px-8 py-2.5"
                        >
                          <div>
                            <span className="text-sm">{k.kriterAdi}</span>
                            <p className="text-xs text-muted-foreground">{k.tanim}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">%</span>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={k.agirlikPuani}
                              onChange={(e) => handleWeightChange(k.id, e.target.value)}
                              className="w-[70px] text-center h-8"
                              disabled={readOnly}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Leave warning */}
      <AlertDialog open={showLeaveWarning} onOpenChange={setShowLeaveWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kaydedilmemiş Değişiklikler</AlertDialogTitle>
            <AlertDialogDescription>
              Kaydedilmemiş değişiklikleriniz var. Çıkmak istediğinize emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction>Çık</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
