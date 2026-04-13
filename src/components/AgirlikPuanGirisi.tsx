import { useState, useMemo, useCallback, useEffect } from "react";
import { Kriter, VARSAYILAN_KRITER_GRUPLARI } from "@/types/kriter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Save, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  kriterler: Kriter[];
  onSave: (kriterler: Kriter[]) => void;
  readOnly: boolean;
  donem: string;
  onDonemChange: (d: string) => void;
  donemler: string[];
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

  const toplam = useMemo(
    () => aktifKriterler.reduce((sum, k) => sum + k.agirlikPuani, 0),
    [aktifKriterler]
  );

  const isComplete = toplam === 100;

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
      {/* Top bar with period + total */}
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
              <span className="text-sm font-medium whitespace-nowrap">Toplam:</span>
              <div className="flex-1 relative">
                <Progress
                  value={Math.min(toplam, 100)}
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
                %{toplam}
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

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Kriter Grubu</TableHead>
              <TableHead>Kriter Adı</TableHead>
              <TableHead className="text-center w-[140px]">Ağırlık (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aktifKriterler.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-12">
                  Aktif kriter bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              aktifKriterler.map((k) => (
                <TableRow key={k.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="text-sm text-muted-foreground">{k.kriterGrubu}</TableCell>
                  <TableCell className="font-medium text-sm">{k.kriterAdi}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-xs text-muted-foreground">%</span>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={k.agirlikPuani}
                        onChange={(e) => handleWeightChange(k.id, e.target.value)}
                        className="w-[72px] text-center h-9"
                        disabled={readOnly}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground bg-muted/30 flex justify-between">
          <span>Toplam {aktifKriterler.length} aktif kriter</span>
        </div>
      </div>

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
