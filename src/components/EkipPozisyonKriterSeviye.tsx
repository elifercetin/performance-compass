import { useMemo, useState, useRef } from "react";
import { Kriter } from "@/types/kriter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Save, FileSpreadsheet, Download, Users } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "@/hooks/use-toast";

interface Props {
  kriterler: Kriter[];
  readOnly: boolean;
  donem: string;
  onDonemChange: (d: string) => void;
  donemler: string[];
}

const EKIPLER = ["Üretim", "Bakım", "Kalite", "Lojistik"] as const;
type Ekip = (typeof EKIPLER)[number];

const EKIP_POZISYONLARI: Record<Ekip, string[]> = {
  "Üretim": ["Operatör", "Vardiya Amiri", "Üretim Sorumlusu", "Hat Lideri"],
  "Bakım": ["Mekanik Bakım Teknisyeni", "Elektrik Bakım Teknisyeni", "Bakım Şefi"],
  "Kalite": ["Kalite Kontrolcü", "Kalite Mühendisi", "Kalite Şefi"],
  "Lojistik": ["Forklift Operatörü", "Depo Sorumlusu", "Sevkiyat Elemanı"],
};

const SEVIYE_OPSIYONLARI = [1, 2, 3, 4, 5] as const;

type Matrix = Record<string, Record<string, number | "">>; // [pozisyon][kriterId] = seviye

export default function EkipPozisyonKriterSeviye({
  kriterler, readOnly, donem, onDonemChange, donemler,
}: Props) {
  const [ekip, setEkip] = useState<Ekip>("Üretim");
  const [matrix, setMatrix] = useState<Matrix>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aktifKriterler = useMemo(
    () => kriterler.filter((k) => k.aktif),
    [kriterler]
  );

  const pozisyonlar = EKIP_POZISYONLARI[ekip];

  const getValue = (poz: string, kriterId: string): number | "" => {
    return matrix[poz]?.[kriterId] ?? "";
  };

  const setValue = (poz: string, kriterId: string, val: number | "") => {
    setMatrix((prev) => ({
      ...prev,
      [poz]: { ...(prev[poz] ?? {}), [kriterId]: val },
    }));
  };

  const fillRow = (poz: string, val: number) => {
    setMatrix((prev) => {
      const row: Record<string, number | ""> = { ...(prev[poz] ?? {}) };
      aktifKriterler.forEach((k) => { row[k.id] = val; });
      return { ...prev, [poz]: row };
    });
  };

  const fillColumn = (kriterId: string, val: number) => {
    setMatrix((prev) => {
      const next: Matrix = { ...prev };
      pozisyonlar.forEach((p) => {
        next[p] = { ...(next[p] ?? {}), [kriterId]: val };
      });
      return next;
    });
  };

  const fillAll = (val: number) => {
    setMatrix((prev) => {
      const next: Matrix = { ...prev };
      pozisyonlar.forEach((p) => {
        const row: Record<string, number | ""> = { ...(next[p] ?? {}) };
        aktifKriterler.forEach((k) => { row[k.id] = val; });
        next[p] = row;
      });
      return next;
    });
  };

  const handleSave = () => {
    toast({
      title: "Kaydedildi",
      description: `${ekip} ekibi için ${pozisyonlar.length} pozisyon × ${aktifKriterler.length} kriter kaydedildi.`,
    });
  };

  const handleExport = () => {
    const headers = ["Ekip", "Pozisyon", ...aktifKriterler.map((k) => k.kriterAdi)];
    const rows = pozisyonlar.map((p) => [
      ekip,
      p,
      ...aktifKriterler.map((k) => getValue(p, k.id)),
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Seviye Tanımlama");
    XLSX.writeFile(wb, `seviye-tanimlama-${ekip}-${donem}.xlsx`);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });
      let count = 0;
      const next: Matrix = { ...matrix };
      rows.forEach((r) => {
        const poz = String(r["Pozisyon"] ?? "").trim();
        if (!poz || !pozisyonlar.includes(poz)) return;
        const row: Record<string, number | ""> = { ...(next[poz] ?? {}) };
        aktifKriterler.forEach((k) => {
          const v = r[k.kriterAdi];
          const num = parseInt(String(v));
          if (num >= 1 && num <= 5) row[k.id] = num;
        });
        next[poz] = row;
        count++;
      });
      setMatrix(next);
      toast({ title: "İçe aktarma tamamlandı", description: `${count} pozisyon güncellendi.` });
    } catch {
      toast({ title: "İçe aktarma hatası", description: "Dosya okunamadı.", variant: "destructive" });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const seviyeRenk = (val: number | "") => {
    if (val === "") return "";
    if (val <= 1) return "bg-destructive/10 text-destructive";
    if (val === 2) return "bg-warning/10 text-warning-foreground";
    if (val === 3) return "bg-primary/10 text-primary";
    return "bg-success/10 text-success";
  };

  return (
    <div className="space-y-4">
      {/* Filtreler & Aksiyonlar */}
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Dönem</Label>
          <Select value={donem} onValueChange={onDonemChange}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {donemler.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Ekip</Label>
          <Select value={ekip} onValueChange={(v) => setEkip(v as Ekip)}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {EKIPLER.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Toplu Doldur</Label>
          <Select onValueChange={(v) => fillAll(parseInt(v))}>
            <SelectTrigger className="w-[180px]" disabled={readOnly}>
              <SelectValue placeholder="Tüm hücrelere ata..." />
            </SelectTrigger>
            <SelectContent>
              {SEVIYE_OPSIYONLARI.map((s) => (
                <SelectItem key={s} value={String(s)}>Seviye {s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1 h-3.5 w-3.5" /> Excel'e Aktar
          </Button>
          {!readOnly && (
            <>
              <Button variant="outline" size="sm" onClick={handleImportClick}>
                <FileSpreadsheet className="mr-1 h-3.5 w-3.5" /> Excel'den Yükle
              </Button>
              <Button size="sm" className="shadow-sm" onClick={handleSave}>
                <Save className="mr-1 h-3.5 w-3.5" /> Kaydet
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Bilgi Kartı */}
      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm">
        <Users className="h-4 w-4 text-primary" />
        <span className="text-foreground">
          <strong>{ekip}</strong> ekibi — {pozisyonlar.length} pozisyon, {aktifKriterler.length} aktif kriter
        </span>
      </div>

      {/* Excel Benzeri Grid */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {aktifKriterler.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <span>Aktif kriter bulunamadı. Önce Kriter Havuzu'ndan kriter aktifleştiriniz.</span>
          </div>
        ) : (
          <div className="relative overflow-auto max-h-[calc(100vh-340px)]">
            <table className="border-collapse w-max min-w-full text-sm">
              <thead>
                <tr className="bg-muted/70">
                  <th className="sticky left-0 top-0 z-30 bg-muted border border-border px-3 py-2 text-left font-semibold w-[140px] min-w-[140px]">
                    Ekip
                  </th>
                  <th className="sticky left-[140px] top-0 z-30 bg-muted border border-border px-3 py-2 text-left font-semibold w-[220px] min-w-[220px]">
                    Pozisyon
                  </th>
                  {aktifKriterler.map((k) => (
                    <th
                      key={k.id}
                      className="sticky top-0 z-20 bg-muted border border-border px-2 py-2 text-center font-semibold w-[160px] min-w-[160px]"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs text-muted-foreground font-normal">{k.kriterGrubu}</span>
                        <span className="text-xs leading-tight">{k.kriterAdi}</span>
                        {!readOnly && (
                          <Select onValueChange={(v) => fillColumn(k.id, parseInt(v))}>
                            <SelectTrigger className="h-6 text-[10px] mt-1 px-1.5">
                              <SelectValue placeholder="Kolonu doldur" />
                            </SelectTrigger>
                            <SelectContent>
                              {SEVIYE_OPSIYONLARI.map((s) => (
                                <SelectItem key={s} value={String(s)} className="text-xs">Seviye {s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pozisyonlar.map((poz, ri) => (
                  <tr key={poz} className={ri % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className={`sticky left-0 z-10 border border-border px-3 py-2 font-medium ${ri % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                      {ri === 0 ? ekip : ""}
                    </td>
                    <td className={`sticky left-[140px] z-10 border border-border px-3 py-2 ${ri % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{poz}</span>
                        {!readOnly && (
                          <Select onValueChange={(v) => fillRow(poz, parseInt(v))}>
                            <SelectTrigger className="h-6 w-[60px] text-[10px] px-1.5">
                              <SelectValue placeholder="…" />
                            </SelectTrigger>
                            <SelectContent>
                              {SEVIYE_OPSIYONLARI.map((s) => (
                                <SelectItem key={s} value={String(s)} className="text-xs">Seviye {s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </td>
                    {aktifKriterler.map((k) => {
                      const val = getValue(poz, k.id);
                      return (
                        <td key={k.id} className="border border-border p-1 text-center">
                          <Select
                            value={val === "" ? "" : String(val)}
                            onValueChange={(v) => setValue(poz, k.id, parseInt(v))}
                            disabled={readOnly}
                          >
                            <SelectTrigger
                              className={`h-8 w-full text-xs justify-center font-semibold border-0 shadow-none ${seviyeRenk(val)}`}
                            >
                              <SelectValue placeholder="—" />
                            </SelectTrigger>
                            <SelectContent>
                              {SEVIYE_OPSIYONLARI.map((s) => (
                                <SelectItem key={s} value={String(s)}>Seviye {s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground bg-muted/30">
          {pozisyonlar.length} pozisyon × {aktifKriterler.length} kriter — yatay/dikey kaydırma destekli
        </div>
      </div>
    </div>
  );
}