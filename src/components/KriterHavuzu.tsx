import { useState, useMemo } from "react";
import { Kriter, KriterTipi, KRITER_TIPLERI, VARSAYILAN_KRITERLER } from "@/types/kriter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus, X, Search } from "lucide-react";
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
  kriterTipi: "" as KriterTipi | "",
  ustKriter: "",
  kriterAdi: "",
  donem: CURRENT_YEAR,
  aktif: true,
  agirlikPuani: 0,
};

export default function KriterHavuzu({
  kriterler, onAdd, onUpdate, onDelete, onToggleAktif, readOnly,
  donem, onDonemChange, donemler,
}: Props) {
  const [filterTip, setFilterTip] = useState<string>("Tumu");
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 300);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = useMemo(() => {
    return kriterler.filter((k) => {
      if (filterTip !== "Tumu" && k.kriterTipi !== filterTip) return false;
      if (debouncedSearch) {
        const s = debouncedSearch.toLowerCase();
        if (
          !k.kriterAdi.toLowerCase().includes(s) &&
          !k.ustKriter.toLowerCase().includes(s)
        ) return false;
      }
      return true;
    });
  }, [kriterler, filterTip, debouncedSearch]);

  // Get üst kriter options based on selected kriter tipi
  const ustKriterOptions = useMemo(() => {
    if (!form.kriterTipi) return [];
    const ustMap = VARSAYILAN_KRITERLER[form.kriterTipi as KriterTipi];
    return ustMap ? Object.keys(ustMap) : [];
  }, [form.kriterTipi]);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (k: Kriter) => {
    setEditingId(k.id);
    setForm({
      kriterTipi: k.kriterTipi,
      ustKriter: k.ustKriter,
      kriterAdi: k.kriterAdi,
      aktif: k.aktif,
      agirlikPuani: k.agirlikPuani,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.kriterTipi || !form.ustKriter || !form.kriterAdi) return;
    if (editingId) {
      onUpdate(editingId, form as Partial<Kriter>);
    } else {
      onAdd(form as Omit<Kriter, "id" | "kullanimda">);
    }
    setDialogOpen(false);
  };

  const clearFilters = () => {
    setFilterTip("Tumu");
    setSearchText("");
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-4">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Kriter Tipi</Label>
          <Select value={filterTip} onValueChange={setFilterTip}>
            <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Tumu">Tümü</SelectItem>
              {KRITER_TIPLERI.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Kriter Adı</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Kriter adı ara..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-[250px] pl-8"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Dönem</Label>
          <Select value={donem} onValueChange={onDonemChange}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {donemler.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={clearFilters}>
            <X className="mr-1 h-4 w-4" /> Temizle
          </Button>
          {!readOnly && (
            <Button onClick={openAdd}>
              <Plus className="mr-1 h-4 w-4" /> Yeni Kriter
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kriter Tipi</TableHead>
              <TableHead>Üst Kriter Adı</TableHead>
              <TableHead>Kriter Adı</TableHead>
              <TableHead className="text-center">Performans Atama Durumu</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Kayıt bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((k) => (
                <TableRow key={k.id}>
                  <TableCell>{k.kriterTipi}</TableCell>
                  <TableCell>{k.ustKriter}</TableCell>
                  <TableCell className="font-medium">{k.kriterAdi}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={k.aktif}
                      onCheckedChange={() => onToggleAktif(k.id)}
                      disabled={readOnly}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {!readOnly && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(k)}>
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          {k.kullanimda ? (
                            <Button variant="ghost" size="icon" disabled title="Kullanımda olan kriter silinemez">
                              <Trash2 className="h-4 w-4 text-muted-foreground/40" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon" onClick={() => onDelete(k.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
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
        <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          Toplam {filtered.length} kayıt listeleniyor
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Kriter Düzenle" : "Yeni Kriter Ekle"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Kriter Tipi *</Label>
              <Select
                value={form.kriterTipi}
                onValueChange={(v) => setForm({ ...form, kriterTipi: v as KriterTipi, ustKriter: "" })}
              >
                <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                <SelectContent>
                  {KRITER_TIPLERI.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Üst Kriter *</Label>
              <Select
                value={form.ustKriter}
                onValueChange={(v) => setForm({ ...form, ustKriter: v })}
                disabled={!form.kriterTipi}
              >
                <SelectTrigger><SelectValue placeholder="Önce kriter tipi seçiniz" /></SelectTrigger>
                <SelectContent>
                  {ustKriterOptions.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Kriter Adı *</Label>
              <Input
                value={form.kriterAdi}
                onChange={(e) => setForm({ ...form, kriterAdi: e.target.value })}
                maxLength={300}
                placeholder="Kriterin detaylı açıklaması"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
            <Button
              onClick={handleSave}
              disabled={!form.kriterTipi || !form.ustKriter || !form.kriterAdi}
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
