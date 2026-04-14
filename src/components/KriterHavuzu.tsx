import { useState, useMemo } from "react";
import { Kriter, Seviye, VARSAYILAN_KRITER_GRUPLARI } from "@/types/kriter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
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

const EMPTY_SEVIYE: Seviye = { seviyeNo: 1, tanim: "", davranisGostergeleri: [] };

const EMPTY_FORM = {
  kriterGrubu: "",
  kriterGrubuCustom: "",
  kriterAdi: "",
  donem: CURRENT_YEAR,
  aktif: true,
  agirlikPuani: 0,
  seviyeler: [{ ...EMPTY_SEVIYE }] as Seviye[],
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

  // All unique groups
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
      seviyeler: k.seviyeler.length > 0 ? [...k.seviyeler] : [{ ...EMPTY_SEVIYE }],
    });
    setDialogOpen(true);
  };

  const resolvedGrup = form.kriterGrubu === "__custom__" ? form.kriterGrubuCustom : form.kriterGrubu;

  const handleSave = () => {
    if (!resolvedGrup || !form.kriterAdi || !form.donem) return;
    const validSeviyeler = form.seviyeler.filter(s => s.tanim.trim());
    const data = {
      kriterGrubu: resolvedGrup,
      kriterAdi: form.kriterAdi,
      donem: form.donem,
      aktif: form.aktif,
      agirlikPuani: form.agirlikPuani,
      seviyeler: validSeviyeler,
    };
    if (editingId) {
      onUpdate(editingId, data);
    } else {
      onAdd(data);
    }
    setDialogOpen(false);
  };

  const addSeviye = () => {
    const nextNo = form.seviyeler.length + 1;
    if (nextNo > 4) return;
    setForm({
      ...form,
      seviyeler: [...form.seviyeler, { seviyeNo: nextNo, tanim: "", davranisGostergeleri: [] }],
    });
  };

  const removeSeviye = (index: number) => {
    const updated = form.seviyeler.filter((_, i) => i !== index).map((s, i) => ({ ...s, seviyeNo: i + 1 }));
    setForm({ ...form, seviyeler: updated });
  };

  const updateSeviye = (index: number, field: keyof Seviye, value: string | number | string[]) => {
    const updated = form.seviyeler.map((s, i) => i === index ? { ...s, [field]: value } : s);
    setForm({ ...form, seviyeler: updated });
  };

  const [newGosterge, setNewGosterge] = useState<Record<number, string>>({});

  const addGosterge = (seviyeIndex: number) => {
    const text = (newGosterge[seviyeIndex] || "").trim();
    if (!text) return;
    const updated = form.seviyeler.map((s, i) =>
      i === seviyeIndex ? { ...s, davranisGostergeleri: [...s.davranisGostergeleri, text] } : s
    );
    setForm({ ...form, seviyeler: updated });
    setNewGosterge({ ...newGosterge, [seviyeIndex]: "" });
  };

  const removeGosterge = (seviyeIndex: number, gostergeIndex: number) => {
    const updated = form.seviyeler.map((s, i) =>
      i === seviyeIndex ? { ...s, davranisGostergeleri: s.davranisGostergeleri.filter((_, gi) => gi !== gostergeIndex) } : s
    );
    setForm({ ...form, seviyeler: updated });
  };

  const clearFilters = () => {
    setFilterGrup("Tumu");
    setSearchText("");
  };

  const isFormValid = !!resolvedGrup && !!form.kriterAdi && !!form.donem && form.seviyeler.some(s => s.tanim.trim());

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
                filtered.map((k) => {
                  const sortedSeviyeler = [...k.seviyeler].sort((a, b) => a.seviyeNo - b.seviyeNo);
                  const rowCount = sortedSeviyeler.length || 1;

                  if (sortedSeviyeler.length === 0) {
                    return (
                      <TableRow key={k.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell className="text-sm">{k.kriterGrubu}</TableCell>
                        <TableCell className="font-medium text-sm">{k.kriterAdi}</TableCell>
                        <TableCell className="text-center text-muted-foreground text-xs">-</TableCell>
                        <TableCell className="text-muted-foreground text-xs">-</TableCell>
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
                          <div className="flex justify-end gap-1">
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
                    );
                  }

                  return sortedSeviyeler.map((s, i) => (
                    <TableRow
                      key={`${k.id}-${s.seviyeNo}`}
                      className={`group hover:bg-muted/30 transition-colors ${i > 0 ? "border-t border-border/50" : ""}`}
                    >
                      {i === 0 && (
                        <TableCell className="text-sm align-top" rowSpan={rowCount}>
                          {k.kriterGrubu}
                        </TableCell>
                      )}
                      {i === 0 && (
                        <TableCell className="font-medium text-sm align-top" rowSpan={rowCount}>
                          {k.kriterAdi}
                        </TableCell>
                      )}
                      <TableCell className="text-center">
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-primary-foreground ${
                          s.seviyeNo === 1 ? "bg-destructive" :
                          s.seviyeNo === 2 ? "bg-warning" :
                          s.seviyeNo === 3 ? "bg-primary" :
                          "bg-success"
                        }`}>
                          {s.seviyeNo}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <span className="font-medium">{s.tanim}</span>
                          {s.davranisGostergeleri && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="inline-block ml-1.5 h-3.5 w-3.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-xs">
                                <p className="text-xs whitespace-pre-line">{s.davranisGostergeleri}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      {i === 0 && (
                        <TableCell className="text-center align-top" rowSpan={rowCount}>
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
                      )}
                      {i === 0 && (
                        <TableCell className="text-right align-top" rowSpan={rowCount}>
                          <div className="flex justify-end gap-1">
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
                      )}
                    </TableRow>
                  ));
                })
              )}
            </TableBody>
          </Table>
          <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground bg-muted/30">
            Toplam {filtered.length} kriter listeleniyor
          </div>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg">{editingId ? "Kriter Düzenle" : "Yeni Kriter Ekle"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-2">
              {/* Kriter Grubu */}
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

              {/* Kriter Adı */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Kriter Adı <span className="text-destructive">*</span></Label>
                <Input
                  value={form.kriterAdi}
                  onChange={(e) => setForm({ ...form, kriterAdi: e.target.value })}
                  placeholder="Kriterin adı"
                />
              </div>

              {/* Dönem */}
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

              {/* Seviyeler */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Seviyeler <span className="text-destructive">*</span></Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSeviye}
                    disabled={form.seviyeler.length >= 4}
                    className="text-xs"
                  >
                    <Plus className="mr-1 h-3 w-3" /> Seviye Ekle
                  </Button>
                </div>
                <div className="space-y-3">
                  {form.seviyeler.map((s, i) => (
                    <div key={i} className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Select
                            value={String(s.seviyeNo)}
                            onValueChange={(v) => updateSeviye(i, "seviyeNo", parseInt(v))}
                          >
                            <SelectTrigger className="w-[100px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4].map((n) => (
                                <SelectItem key={n} value={String(n)}>Seviye {n}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Seviye tanımı (ör: Yeterli)"
                            value={s.tanim}
                            onChange={(e) => updateSeviye(i, "tanim", e.target.value)}
                            className="h-8 text-sm flex-1"
                          />
                        </div>
                        {form.seviyeler.length > 1 && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 ml-2" onClick={() => removeSeviye(i)}>
                            <X className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <Textarea
                        placeholder="Davranış göstergeleri (her satıra bir gösterge yazabilirsiniz)"
                        value={s.davranisGostergeleri}
                        onChange={(e) => updateSeviye(i, "davranisGostergeleri", e.target.value)}
                        className="min-h-[60px] text-sm"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
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
