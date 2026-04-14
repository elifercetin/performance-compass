import { useState, useMemo } from "react";
import { Kriter, VARSAYILAN_KRITER_GRUPLARI, SEVIYE_TANIMLARI } from "@/types/kriter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus, X, Search, Info, Layers } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface Props {
  kriterler: Kriter[];
  onAdd: (k: Omit<Kriter, "id" | "kullanimda">) => void;
  onUpdate: (id: string, updates: Partial<Kriter>) => void;
  onDelete: (id: string) => void;
  onToggleAktif: (id: string) => void;
  readOnly: boolean;
  donem: string;
  onDonemChange: (d: string) => void;
  donemler: string[];
}

const CURRENT_YEAR = new Date().getFullYear().toString();

const EMPTY_FORM = {
  kriterGrubu: "",
  kriterGrubuCustom: "",
  kriterAdi: "",
  donem: CURRENT_YEAR,
  aktif: true,
  agirlikPuani: 0,
  seviye: 0,
  seviyeTanimi: "",
  davranisGostergeleri: [] as string[],
};

export default function KriterHavuzu({
  kriterler, onAdd, onUpdate, onDelete, onToggleAktif, readOnly,
  donem, onDonemChange, donemler,
}: Props) {
  const [filterGrup, setFilterGrup] = useState<string>("Tumu");
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 300);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [newGosterge, setNewGosterge] = useState("");

  const allGroups = useMemo(() => {
    const set = new Set([...VARSAYILAN_KRITER_GRUPLARI, ...kriterler.map(k => k.kriterGrubu)]);
    return Array.from(set);
  }, [kriterler]);

  const filtered = useMemo(() => {
    return kriterler.filter((k) => {
      if (filterGrup !== "Tumu" && k.kriterGrubu !== filterGrup) return false;
      if (debouncedSearch) {
        const s = debouncedSearch.toLowerCase();
        if (!k.kriterAdi.toLowerCase().includes(s) && !k.kriterGrubu.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [kriterler, filterGrup, debouncedSearch]);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setNewGosterge("");
    setDialogOpen(true);
  };

  const openEdit = (k: Kriter) => {
    setEditingId(k.id);
    setForm({
      kriterGrubu: allGroups.includes(k.kriterGrubu) ? k.kriterGrubu : "__custom__",
      kriterGrubuCustom: allGroups.includes(k.kriterGrubu) ? "" : k.kriterGrubu,
      kriterAdi: k.kriterAdi,
      donem: k.donem || CURRENT_YEAR,
      aktif: k.aktif,
      agirlikPuani: k.agirlikPuani,
      seviye: k.seviye,
      seviyeTanimi: k.seviyeTanimi,
      davranisGostergeleri: [...k.davranisGostergeleri],
    });
    setNewGosterge("");
    setDialogOpen(true);
  };

  const resolvedGrup = form.kriterGrubu === "__custom__" ? form.kriterGrubuCustom : form.kriterGrubu;

  const handleSave = () => {
    if (!resolvedGrup || !form.kriterAdi || !form.donem) return;
    const data = {
      kriterGrubu: resolvedGrup,
      kriterAdi: form.kriterAdi,
      donem: form.donem,
      aktif: form.aktif,
      agirlikPuani: form.agirlikPuani,
      seviye: form.seviye,
      seviyeTanimi: form.seviyeTanimi,
      davranisGostergeleri: form.davranisGostergeleri,
    };
    if (editingId) {
      onUpdate(editingId, data);
    } else {
      onAdd(data);
    }
    setDialogOpen(false);
  };

  const addGosterge = () => {
    const text = newGosterge.trim();
    if (!text) return;
    setForm({ ...form, davranisGostergeleri: [...form.davranisGostergeleri, text] });
    setNewGosterge("");
  };

  const removeGosterge = (index: number) => {
    setForm({ ...form, davranisGostergeleri: form.davranisGostergeleri.filter((_, i) => i !== index) });
  };

  const clearFilters = () => {
    setFilterGrup("Tumu");
    setSearchText("");
  };

  const isFormValid = !!resolvedGrup && !!form.kriterAdi && !!form.donem && form.seviye > 0 && !!form.seviyeTanimi;

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Dönem</Label>
            <Select value={donem} onValueChange={onDonemChange}>
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {donemler.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Kriter Grubu</Label>
            <Select value={filterGrup} onValueChange={setFilterGrup}>
              <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Tumu">Tümü</SelectItem>
                {allGroups.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Kriter Adı</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kriter adı ara..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-[220px] pl-8"
              />
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-3.5 w-3.5" /> Temizle
            </Button>
            {!readOnly && (
              <Button onClick={openAdd} size="sm" className="shadow-sm">
                <Plus className="mr-1 h-3.5 w-3.5" /> Yeni Kriter
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Kriter Grubu</TableHead>
                <TableHead>Kriter Adı</TableHead>
                <TableHead className="text-center">Seviye</TableHead>
                <TableHead>Seviye Tanımı</TableHead>
                <TableHead className="text-center">Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Layers className="h-8 w-8 text-muted-foreground/40" />
                      <span>Kayıt bulunamadı</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((k) => (
                  <TableRow key={k.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="text-sm">{k.kriterGrubu}</TableCell>
                    <TableCell className="font-medium text-sm">
                      <div className="flex items-center gap-1.5">
                        {k.kriterAdi}
                        {k.davranisGostergeleri.length > 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <p className="text-xs font-medium mb-1">Davranış Göstergeleri:</p>
                              <ul className="text-xs space-y-0.5">
                                {k.davranisGostergeleri.map((g, gi) => (
                                  <li key={gi}>• {g}</li>
                                ))}
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-primary-foreground ${
                        k.seviye === 1 ? "bg-destructive" :
                        k.seviye === 2 ? "bg-warning" :
                        k.seviye === 3 ? "bg-primary" :
                        "bg-success"
                      }`}>
                        {k.seviye}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{k.seviyeTanimi}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={`text-xs cursor-pointer transition-colors ${
                          k.aktif
                            ? "bg-success/15 text-success hover:bg-success/25 border-success/20"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                        variant="outline"
                        onClick={() => !readOnly && onToggleAktif(k.id)}
                      >
                        {k.aktif ? "Aktif" : "Pasif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!readOnly && (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(k)}>
                              <Pencil className="h-3.5 w-3.5 text-primary" />
                            </Button>
                            {!k.kullanimda && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(k.id)}>
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground bg-muted/30">
            Toplam {filtered.length} kriter listeleniyor
          </div>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg">{editingId ? "Kriter Düzenle" : "Yeni Kriter Ekle"}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Kriter bilgilerini girin veya güncelleyin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-2">
              {/* Row 1: Kriter Grubu */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Kriter Grubu <span className="text-destructive">*</span></Label>
                <Select
                  value={form.kriterGrubu}
                  onValueChange={(v) => setForm({ ...form, kriterGrubu: v, kriterGrubuCustom: "" })}
                >
                  <SelectTrigger><SelectValue placeholder="Kriter grubu seçiniz" /></SelectTrigger>
                  <SelectContent>
                    {allGroups.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                    <SelectItem value="__custom__">+ Yeni Grup Ekle</SelectItem>
                  </SelectContent>
                </Select>
                {form.kriterGrubu === "__custom__" && (
                  <Input
                    placeholder="Yeni kriter grubu adı"
                    value={form.kriterGrubuCustom}
                    onChange={(e) => setForm({ ...form, kriterGrubuCustom: e.target.value })}
                    className="mt-2"
                  />
                )}
              </div>

              {/* Row 2: Kriter Adı */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Kriter Adı <span className="text-destructive">*</span></Label>
                <Input
                  value={form.kriterAdi}
                  onChange={(e) => setForm({ ...form, kriterAdi: e.target.value })}
                  placeholder="Kriterin adı"
                />
              </div>

              {/* Row 3: Dönem */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Dönem <span className="text-destructive">*</span></Label>
                <Select value={form.donem} onValueChange={(v) => setForm({ ...form, donem: v })}>
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {donemler.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Row 4: Seviye + Seviye Tanımı side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Seviye <span className="text-destructive">*</span></Label>
                  <Select
                    value={form.seviye ? String(form.seviye) : ""}
                    onValueChange={(v) => setForm({ ...form, seviye: parseInt(v) })}
                  >
                    <SelectTrigger><SelectValue placeholder="Seviye Seçin" /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((n) => (
                        <SelectItem key={n} value={String(n)}>Seviye {n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Seviye Tanımı <span className="text-destructive">*</span></Label>
                  <Select
                    value={form.seviyeTanimi}
                    onValueChange={(v) => setForm({ ...form, seviyeTanimi: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Seviye Tanımı Seçin" /></SelectTrigger>
                    <SelectContent>
                      {SEVIYE_TANIMLARI.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 5: Davranış Göstergeleri */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Davranış Göstergeleri</Label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Yeni davranış göstergesi ekle..."
                    value={newGosterge}
                    onChange={(e) => setNewGosterge(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addGosterge(); } }}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={addGosterge}>
                    <Plus className="mr-1 h-3.5 w-3.5" /> Ekle
                  </Button>
                </div>
                {form.davranisGostergeleri.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Henüz davranış göstergesi eklenmedi. Yukarıdaki alanı kullanarak ekleyebilirsiniz.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {form.davranisGostergeleri.map((g, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
                        <span className="text-xs text-muted-foreground font-medium">{i + 1}.</span>
                        <span className="text-sm flex-1">{g}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeGosterge(i)}>
                          <X className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
              <Button onClick={handleSave} disabled={!isFormValid} className="shadow-sm">
                Kaydet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
