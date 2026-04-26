import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClipboardList, Search, RotateCcw, Eye, ClipboardCheck, Users } from "lucide-react";
import DegerlendirmeFormu from "./DegerlendirmeFormu";
import { Kriter } from "@/types/kriter";

type Durum = "Bekliyor" | "Taslak" | "Tamamlandı";

interface Personel {
  id: string;
  donem: string;
  adSoyad: string;
  pozisyon: string;
  ekip: string;
  durum: Durum;
}

const MOCK_PERSONEL: Personel[] = [
  { id: "1", donem: "2025", adSoyad: "Ahmet Yılmaz", pozisyon: "Bakım Teknisyeni", ekip: "Bakım", durum: "Bekliyor" },
  { id: "2", donem: "2025", adSoyad: "Mehmet Demir", pozisyon: "Üretim Operatörü", ekip: "Üretim", durum: "Taslak" },
  { id: "3", donem: "2025", adSoyad: "Ayşe Kaya", pozisyon: "Kalite Kontrol Uzmanı", ekip: "Kalite", durum: "Tamamlandı" },
  { id: "4", donem: "2025", adSoyad: "Fatma Şahin", pozisyon: "Üretim Operatörü", ekip: "Üretim", durum: "Bekliyor" },
  { id: "5", donem: "2025", adSoyad: "Hasan Çelik", pozisyon: "Bakım Teknisyeni", ekip: "Bakım", durum: "Tamamlandı" },
  { id: "6", donem: "2025", adSoyad: "Zeynep Arslan", pozisyon: "Kalite Kontrol Uzmanı", ekip: "Kalite", durum: "Taslak" },
  { id: "7", donem: "2024", adSoyad: "Ali Vural", pozisyon: "Üretim Operatörü", ekip: "Üretim", durum: "Tamamlandı" },
];

interface Props {
  kriterler: Kriter[];
  donem: string;
  onDonemChange: (d: string) => void;
  donemler: string[];
  readOnly?: boolean;
}

const durumStyle: Record<Durum, string> = {
  Bekliyor: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100",
  Taslak: "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100",
  Tamamlandı: "bg-green-100 text-green-700 border-green-200 hover:bg-green-100",
};

export default function DegerlendirmeListesi({
  kriterler,
  donem,
  onDonemChange,
  donemler,
  readOnly = false,
}: Props) {
  const [filtreDurum, setFiltreDurum] = useState<string>("tumu");
  const [filtreAd, setFiltreAd] = useState("");
  const [aktif, setAktif] = useState<{ donem: string; durum: string; ad: string }>({
    donem,
    durum: "tumu",
    ad: "",
  });
  const [secili, setSecili] = useState<Personel | null>(null);
  const [salt, setSalt] = useState(false);

  const liste = useMemo(() => {
    return MOCK_PERSONEL.filter((p) => {
      if (p.donem !== aktif.donem) return false;
      if (aktif.durum !== "tumu" && p.durum !== aktif.durum) return false;
      if (aktif.ad && !p.adSoyad.toLowerCase().includes(aktif.ad.toLowerCase())) return false;
      return true;
    });
  }, [aktif]);

  const handleListele = () => {
    setAktif({ donem, durum: filtreDurum, ad: filtreAd });
  };

  const handleTemizle = () => {
    setFiltreDurum("tumu");
    setFiltreAd("");
    setAktif({ donem, durum: "tumu", ad: "" });
  };

  const openForm = (p: Personel, readOnlyMode: boolean) => {
    setSecili(p);
    setSalt(readOnlyMode);
  };

  return (
    <div className="space-y-4">
      {/* Filtre */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Değerlendirme Listesi</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Dönem</Label>
              <Select value={donem} onValueChange={onDonemChange}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {donemler.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Değerlendirme Durumu</Label>
              <Select value={filtreDurum} onValueChange={setFiltreDurum}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tumu">Tümü</SelectItem>
                  <SelectItem value="Bekliyor">Bekliyor</SelectItem>
                  <SelectItem value="Taslak">Taslak</SelectItem>
                  <SelectItem value="Tamamlandı">Tamamlandı</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Değerlendirilecek Personel</Label>
              <Input
                value={filtreAd}
                onChange={(e) => setFiltreAd(e.target.value)}
                placeholder="Ad Soyad ara..."
                className="h-9"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleTemizle}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Temizle
            </Button>
            <Button size="sm" onClick={handleListele}>
              <Search className="mr-1.5 h-3.5 w-3.5" />
              Listele
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Atanan Personeller</h3>
            </div>
            <Badge variant="secondary" className="text-xs">
              {liste.length} kayıt
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-[90px]">Dönem</TableHead>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>Pozisyon</TableHead>
                  <TableHead>Ekip/Birim</TableHead>
                  <TableHead className="w-[140px]">Durum</TableHead>
                  <TableHead className="w-[140px] text-right">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liste.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                      Kayıt bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  liste.map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{p.donem}</TableCell>
                      <TableCell className="font-medium text-foreground">{p.adSoyad}</TableCell>
                      <TableCell className="text-muted-foreground">{p.pozisyon}</TableCell>
                      <TableCell className="text-muted-foreground">{p.ekip}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={durumStyle[p.durum]}>
                          {p.durum}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {p.durum === "Tamamlandı" ? (
                          <Button size="sm" variant="outline" onClick={() => openForm(p, true)}>
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            Görüntüle
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => openForm(p, false)}>
                            <ClipboardCheck className="mr-1.5 h-3.5 w-3.5" />
                            Değerlendir
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Değerlendirme Formu Dialog */}
      <Dialog open={!!secili} onOpenChange={(open) => !open && setSecili(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {salt ? "Değerlendirme Görüntüle" : "Değerlendirme Yap"} — {secili?.adSoyad}
            </DialogTitle>
          </DialogHeader>
          {secili && (
            <DegerlendirmeFormu
              kriterler={kriterler}
              donem={donem}
              onDonemChange={onDonemChange}
              donemler={donemler}
              readOnly={salt || readOnly}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}