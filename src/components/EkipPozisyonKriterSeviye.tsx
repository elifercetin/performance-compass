import { useMemo, useState } from "react";
import { Kriter, SEVIYE_TANIMLARI } from "@/types/kriter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, RotateCcw, Pencil, Trash2, Layers, X } from "lucide-react";
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

const SEVIYELER = [1, 2, 3, 4, 5] as const;

interface SeviyeKaydi {
  id: string;
  donem: string;
  ekip: Ekip;
  pozisyon: string;
  kriterId: string;
  kriterGrubu: string;
  kriterAdi: string;
  seviye: number;
  seviyeTanimi: string;
  davranisGostergeleri: string[];
}

interface FormState {
  donem: string;
  ekip: Ekip;
  pozisyon: string;
  kriterId: string;
  seviye: number;
  seviyeTanimi: string;
  davranisGostergeleriText: string;
}

export default function EkipPozisyonKriterSeviye({
  kriterler, readOnly, donem, onDonemChange, donemler,
}: Props) {
  // Filters
  const [filterEkip, setFilterEkip] = useState<Ekip | "">("");
  const [filterPozisyon, setFilterPozisyon] = useState<string>("");
  const [listed, setListed] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState<{ donem: string; ekip: Ekip; pozisyon: string } | null>(null);

  // Data
  const [kayitlar, setKayitlar] = useState<SeviyeKaydi[]>([]);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    donem, ekip: "Üretim", pozisyon: "", kriterId: "",
    seviye: 1, seviyeTanimi: "", davranisGostergeleriText: "",
  });

  const aktifKriterler = useMemo(() => kriterler.filter((k) => k.aktif), [kriterler]);

  const filteredPozisyonlar = filterEkip ? EKIP_POZISYONLARI[filterEkip] : [];
  const formPozisyonlar = form.ekip ? EKIP_POZISYONLARI[form.ekip] : [];

  const goruntulenenKayitlar = useMemo(() => {
    if (!listed || !appliedFilter) return [];
    return kayitlar.filter(
      (k) =>
        k.donem === appliedFilter.donem &&
        k.ekip === appliedFilter.ekip &&
        k.pozisyon === appliedFilter.pozisyon
    );
  }, [kayitlar, listed, appliedFilter]);

  const handleListele = () => {
    if (!filterEkip || !filterPozisyon) {
      toast({ title: "Eksik filtre", description: "Lütfen ekip ve pozisyon seçiniz.", variant: "destructive" });
      return;
    }
    setAppliedFilter({ donem, ekip: filterEkip, pozisyon: filterPozisyon });
    setListed(true);
  };

  const handleTemizle = () => {
    setFilterEkip("");
    setFilterPozisyon("");
    setListed(false);
    setAppliedFilter(null);
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      donem: appliedFilter?.donem ?? donem,
      ekip: (appliedFilter?.ekip ?? filterEkip ?? "Üretim") as Ekip,
      pozisyon: appliedFilter?.pozisyon ?? filterPozisyon ?? "",
      kriterId: "",
      seviye: 1,
      seviyeTanimi: SEVIYE_TANIMLARI[0],
      davranisGostergeleriText: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (k: SeviyeKaydi) => {
    setEditingId(k.id);
    setForm({
      donem: k.donem,
      ekip: k.ekip,
      pozisyon: k.pozisyon,
      kriterId: k.kriterId,
      seviye: k.seviye,
      seviyeTanimi: k.seviyeTanimi,
      davranisGostergeleriText: k.davranisGostergeleri.join("\n"),
    });
    setModalOpen(true);
  };

  const handleSil = (id: string) => {
    setKayitlar((prev) => prev.filter((k) => k.id !== id));
    toast({ title: "Silindi", description: "Eşleştirme kaydı silindi (kriter havuzu etkilenmez)." });
  };

  const handleKaydet = () => {
    if (!form.donem || !form.ekip || !form.pozisyon || !form.kriterId) {
      toast({ title: "Eksik bilgi", description: "Tüm alanları doldurun.", variant: "destructive" });
      return;
    }
    const kriter = aktifKriterler.find((k) => k.id === form.kriterId);
    if (!kriter) return;

    const duplicate = kayitlar.find(
      (k) =>
        k.id !== editingId &&
        k.donem === form.donem &&
        k.ekip === form.ekip &&
        k.pozisyon === form.pozisyon &&
        k.kriterId === form.kriterId
    );
    if (duplicate) {
      toast({
        title: "Tekrarlı kayıt",
        description: "Bu dönem + ekip + pozisyon + kriter için zaten bir kayıt mevcut.",
        variant: "destructive",
      });
      return;
    }

    const davranislar = form.davranisGostergeleriText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingId) {
      setKayitlar((prev) =>
        prev.map((k) =>
          k.id === editingId
            ? {
                ...k,
                donem: form.donem,
                ekip: form.ekip,
                pozisyon: form.pozisyon,
                kriterId: form.kriterId,
                kriterGrubu: kriter.kriterGrubu,
                kriterAdi: kriter.kriterAdi,
                seviye: form.seviye,
                seviyeTanimi: form.seviyeTanimi,
                davranisGostergeleri: davranislar,
              }
            : k
        )
      );
      toast({ title: "Güncellendi", description: "Kriter seviyesi güncellendi." });
    } else {
      const yeni: SeviyeKaydi = {
        id: crypto.randomUUID(),
        donem: form.donem,
        ekip: form.ekip,
        pozisyon: form.pozisyon,
        kriterId: form.kriterId,
        kriterGrubu: kriter.kriterGrubu,
        kriterAdi: kriter.kriterAdi,
        seviye: form.seviye,
        seviyeTanimi: form.seviyeTanimi,
        davranisGostergeleri: davranislar,
      };
      setKayitlar((prev) => [...prev, yeni]);
      toast({ title: "Eklendi", description: "Kriter seviyesi eklendi." });
    }
    setModalOpen(false);
  };

  const seviyeBadgeRenk = (s: number) => {
    if (s <= 1) return "bg-destructive/10 text-destructive border-destructive/20";
    if (s === 2) return "bg-warning/10 text-warning-foreground border-warning/20";
    if (s === 3) return "bg-primary/10 text-primary border-primary/20";
    return "bg-success/10 text-success border-success/20";
  };

  return (
    <div className="space-y-4">
      {/* Üst Filtre */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Filtre</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Dönem</Label>
            <Select value={donem} onValueChange={onDonemChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {donemler.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Ekip</Label>
            <Select value={filterEkip} onValueChange={(v) => { setFilterEkip(v as Ekip); setFilterPozisyon(""); }}>
              <SelectTrigger><SelectValue placeholder="Ekip seçiniz" /></SelectTrigger>
              <SelectContent>
                {EKIPLER.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Pozisyon</Label>
            <Select value={filterPozisyon} onValueChange={setFilterPozisyon} disabled={!filterEkip}>
              <SelectTrigger><SelectValue placeholder="Pozisyon seçiniz" /></SelectTrigger>
              <SelectContent>
                {filteredPozisyonlar.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={handleListele} className="flex-1">
              <Search className="mr-1 h-3.5 w-3.5" /> Listele
            </Button>
            <Button variant="outline" onClick={handleTemizle}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Temizle
            </Button>
          </div>
        </div>
      </div>

      {/* Liste Alanı */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-foreground">Tanımlı Kriter Seviyeleri</h3>
            {appliedFilter && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Badge variant="outline" className="font-normal">{appliedFilter.donem}</Badge>
                <Badge variant="outline" className="font-normal">{appliedFilter.ekip}</Badge>
                <Badge variant="outline" className="font-normal">{appliedFilter.pozisyon}</Badge>
              </div>
            )}
          </div>
          {!readOnly && (
            <Button size="sm" onClick={openAddModal} disabled={aktifKriterler.length === 0}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Kriter Seviyesi Ekle
            </Button>
          )}
        </div>

        {!listed ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm">
            <Search className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <span>Listelemek için dönem, ekip ve pozisyon seçip <strong>Listele</strong> butonuna basınız.</span>
          </div>
        ) : goruntulenenKayitlar.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm">
            <Layers className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <span>Bu pozisyon için henüz kriter seviyesi tanımlanmamış.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-[80px]">Dönem</TableHead>
                  <TableHead>Ekip Adı</TableHead>
                  <TableHead>Pozisyon</TableHead>
                  <TableHead>Kriter Grubu</TableHead>
                  <TableHead>Kriter Adı</TableHead>
                  <TableHead className="w-[100px] text-center">Seviye</TableHead>
                  <TableHead>Seviye Tanımı</TableHead>
                  <TableHead className="w-[120px] text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goruntulenenKayitlar.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.donem}</TableCell>
                    <TableCell>{k.ekip}</TableCell>
                    <TableCell>{k.pozisyon}</TableCell>
                    <TableCell className="text-muted-foreground">{k.kriterGrubu}</TableCell>
                    <TableCell className="font-medium">{k.kriterAdi}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`font-semibold ${seviyeBadgeRenk(k.seviye)}`}>
                        Seviye {k.seviye}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{k.seviyeTanimi}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {!readOnly && (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(k)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost" size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleSil(k.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Kriter Seviyesini Düzenle" : "Kriter Seviyesi Ekle"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Dönem</Label>
              <Select value={form.donem} onValueChange={(v) => setForm((f) => ({ ...f, donem: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {donemler.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Ekip</Label>
              <Select
                value={form.ekip}
                onValueChange={(v) => setForm((f) => ({ ...f, ekip: v as Ekip, pozisyon: "" }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EKIPLER.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Pozisyon</Label>
              <Select value={form.pozisyon} onValueChange={(v) => setForm((f) => ({ ...f, pozisyon: v }))}>
                <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                <SelectContent>
                  {formPozisyonlar.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Kriter Grubu</Label>
              <Input
                value={aktifKriterler.find((k) => k.id === form.kriterId)?.kriterGrubu ?? ""}
                placeholder="Kriter seçildiğinde dolar"
                disabled
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-medium text-muted-foreground">Kriter Adı</Label>
              <Select value={form.kriterId} onValueChange={(v) => setForm((f) => ({ ...f, kriterId: v }))}>
                <SelectTrigger><SelectValue placeholder="Kriter seçiniz" /></SelectTrigger>
                <SelectContent>
                  {aktifKriterler.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.kriterGrubu} — {k.kriterAdi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Seviye</Label>
              <Select
                value={String(form.seviye)}
                onValueChange={(v) => setForm((f) => ({ ...f, seviye: parseInt(v) }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEVIYELER.map((s) => <SelectItem key={s} value={String(s)}>Seviye {s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Seviye Tanımı</Label>
              <Select
                value={form.seviyeTanimi}
                onValueChange={(v) => setForm((f) => ({ ...f, seviyeTanimi: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                <SelectContent>
                  {SEVIYE_TANIMLARI.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Davranış Göstergeleri <span className="text-muted-foreground/70">(her satır bir gösterge)</span>
              </Label>
              <Textarea
                rows={4}
                value={form.davranisGostergeleriText}
                onChange={(e) => setForm((f) => ({ ...f, davranisGostergeleriText: e.target.value }))}
                placeholder="Örn: Prosedürlere uyuyor&#10;Tehlikeli durumları raporluyor"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              <X className="mr-1 h-3.5 w-3.5" /> İptal
            </Button>
            <Button onClick={handleKaydet}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}