import { useState, useMemo, useCallback, useEffect } from "react";
import { Kriter } from "@/types/kriter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Save, AlertTriangle, CheckCircle2, ChevronDown } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

interface Props {
  kriterler: Kriter[];
  onSave: (kriterler: Kriter[]) => void;
  readOnly: boolean;
  donem: string;
  onDonemChange: (d: string) => void;
  donemler: string[];
}

interface GrupData {
  grupAdi: string;
  kriterler: Kriter[];
  toplam: number;
}

export default function AgirlikPuanGirisi({ kriterler: initialKriterler, onSave, readOnly, donem, onDonemChange, donemler }: Props) {
  const [localKriterler, setLocalKriterler] = useState<Kriter[]>(initialKriterler);
  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);

  useEffect(() => {
    setLocalKriterler(initialKriterler);
    setIsDirty(false);
  }, [initialKriterler]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const aktifKriterler = useMemo(
    () => localKriterler.filter((k) => k.aktif),
    [localKriterler]
  );

  const gruplar = useMemo<GrupData[]>(() => {
    const map = new Map<string, Kriter[]>();
    aktifKriterler.forEach((k) => {
      const list = map.get(k.kriterGrubu) || [];
      list.push(k);
      map.set(k.kriterGrubu, list);
    });
    return Array.from(map.entries()).map(([grupAdi, kriterler]) => ({
      grupAdi,
      kriterler,
      toplam: kriterler.reduce((s, k) => s + k.agirlikPuani, 0),
    }));
  }, [aktifKriterler]);

  const genelToplam = useMemo(
    () => gruplar.reduce((s, g) => s + g.toplam, 0),
    [gruplar]
  );

  const isComplete = genelToplam === 100;

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

  const allGroupNames = gruplar.map((g) => g.grupAdi);

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Label className="text-sm text-muted-foreground">Dönem:</Label>
            <Select value={donem} onValueChange={onDonemChange}>
              <SelectTrigger className="w-[110px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {donemler.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 flex-1 sm:justify-end w-full sm:w-auto">
            <div className="flex items-center gap-3 flex-1 sm:flex-initial sm:min-w-[300px]">
              <span className="text-sm font-medium whitespace-nowrap">Genel Toplam:</span>
              <div className="flex-1 relative">
                <Progress
                  value={Math.min(genelToplam, 100)}
                  className={`h-3 ${isComplete ? "[&>div]:bg-success" : "[&>div]:bg-destructive"}`}
                />
              </div>
              <Badge
                variant="outline"
                className={`text-sm font-bold px-3 py-1 min-w-[56px] justify-center transition-colors ${
                  isComplete
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-destructive/30 bg-destructive/10 text-destructive"
                }`}
              >
                %{genelToplam}
              </Badge>
            </div>

            {!isComplete && (
              <span className="hidden sm:flex items-center gap-1.5 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                Toplam %100 olmalıdır
              </span>
            )}
            {isComplete && (
              <span className="hidden sm:flex items-center gap-1.5 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" />
                Tamamlandı
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grouped accordion */}
      {gruplar.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground shadow-sm">
          Aktif kriter bulunamadı
        </div>
      ) : (
        <Accordion type="multiple" defaultValue={allGroupNames} className="space-y-3">
          {gruplar.map((grup) => (
            <AccordionItem
              key={grup.grupAdi}
              value={grup.grupAdi}
              className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between w-full pr-2">
                  <span className="font-semibold text-sm text-foreground">{grup.grupAdi}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs font-bold px-2.5 py-0.5 ${
                      grup.toplam > 0
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-muted-foreground/20 bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    %{grup.toplam}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-0">
                <div className="divide-y divide-border">
                  {grup.kriterler.map((k) => (
                    <div
                      key={k.id}
                      className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors"
                    >
                      <span className="text-sm text-foreground">{k.kriterAdi}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs text-muted-foreground">%</span>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={k.agirlikPuani}
                          onChange={(e) => handleWeightChange(k.id, e.target.value)}
                          className="w-[72px] text-center h-8 text-sm"
                          disabled={readOnly}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Save button */}
      {!readOnly && (
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={!isDirty || !isComplete}
            size="lg"
            className="shadow-sm"
          >
            <Save className="mr-2 h-4 w-4" /> Değişiklikleri Kaydet
          </Button>
        </div>
      )}

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
