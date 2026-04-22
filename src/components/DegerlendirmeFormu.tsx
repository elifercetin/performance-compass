import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Kriter } from "@/types/kriter";
import {
  ClipboardCheck,
  Info,
  Save,
  CheckCircle2,
  Calendar,
  User,
  Briefcase,
} from "lucide-react";

const OLCEK = [
  { value: "1", label: "Hiçbir Zaman\nGöstermez" },
  { value: "2", label: "Nadiren\nGösterir" },
  { value: "3", label: "Genelde\nGösterir" },
  { value: "4", label: "Çoğunlukla\nGösterir" },
  { value: "5", label: "Her Zaman\nGösterir" },
] as const;

interface Props {
  kriterler: Kriter[];
  donem: string;
  onDonemChange: (d: string) => void;
  donemler: string[];
  readOnly?: boolean;
}

export default function DegerlendirmeFormu({
  kriterler,
  donem,
  onDonemChange,
  donemler,
  readOnly = false,
}: Props) {
  const [puanlar, setPuanlar] = useState<Record<string, number>>({});
  const [aciklama, setAciklama] = useState("");
  const [yorumlar, setYorumlar] = useState<Record<string, string>>({});
  const [acikGosterge, setAcikGosterge] = useState<Kriter | null>(null);

  // Sabit bilgi alanları (filtre değil, sadece gösterim)
  const personelAdi = "Ahmet Yılmaz";
  const pozisyon = "Bakım Teknisyeni";

  const aktifKriterler = useMemo(
    () => kriterler.filter((k) => k.aktif),
    [kriterler]
  );

  const gruplar = useMemo(() => {
    const map = new Map<string, Kriter[]>();
    aktifKriterler.forEach((k) => {
      if (!map.has(k.kriterGrubu)) map.set(k.kriterGrubu, []);
      map.get(k.kriterGrubu)!.push(k);
    });
    return Array.from(map.entries());
  }, [aktifKriterler]);

  const toplamKriter = aktifKriterler.length;
  const doldurulmus = Object.keys(puanlar).length;
  const tamamlanmaYuzdesi = toplamKriter > 0 ? Math.round((doldurulmus / toplamKriter) * 100) : 0;

  const toplamPuan = useMemo(
    () => Object.values(puanlar).reduce((s, v) => s + v, 0),
    [puanlar]
  );
  const ortalamaPuan =
    doldurulmus > 0 ? (toplamPuan / doldurulmus).toFixed(2) : "0.00";

  const handlePuanChange = (kriterId: string, value: string) => {
    setPuanlar((prev) => ({ ...prev, [kriterId]: Number(value) }));
  };

  const handleYorumChange = (kriterId: string, value: string) => {
    setYorumlar((prev) => ({ ...prev, [kriterId]: value }));
  };

  const tumDolduruldu = doldurulmus === toplamKriter && toplamKriter > 0;

  const handleKaydet = () => {
    toast({
      title: "Değerlendirme kaydedildi",
      description: `${personelAdi || "Personel"} için değerlendirme taslak olarak kaydedildi.`,
    });
  };

  const handleTamamla = () => {
    if (!tumDolduruldu) return;
    toast({
      title: "Değerlendirme tamamlandı",
      description: `${personelAdi || "Personel"} için değerlendirme başarıyla tamamlandı.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <ClipboardCheck className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Kriter Bazlı Performans Değerlendirme Formu
          </h2>
        </div>
        <p className="text-sm text-muted-foreground ml-12">
          Mavi yaka çalışanlar için KBBPYS kapsamında bireysel performans değerlendirmesi yapınız.
        </p>
      </div>

      {/* Info Card - sadece bilgi gösterimi */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Dönem */}
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Dönem
              </div>
              <p className="text-sm font-medium text-foreground">{donem}</p>
            </div>

            {/* Pozisyon */}
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                Pozisyon
              </div>
              <p className="text-sm font-medium text-foreground">{pozisyon}</p>
            </div>

            {/* Personel */}
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Değerlendirilen Personel
              </div>
              <p className="text-sm font-medium text-foreground">{personelAdi}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Tamamlanma Durumu
            </span>
            <span className="text-sm font-semibold text-primary">
              {doldurulmus}/{toplamKriter} kriter · %{tamamlanmaYuzdesi}
            </span>
          </div>
          <Progress value={tamamlanmaYuzdesi} className="h-2.5" />
        </CardContent>
      </Card>

      {/* Criteria Groups */}
      {gruplar.length === 0 && (
        <Card className="shadow-sm">
          <CardContent className="py-12 text-center text-muted-foreground">
            Aktif kriter bulunamadı. Lütfen önce Kriter Havuzu'ndan kriter tanımlayınız.
          </CardContent>
        </Card>
      )}

      {gruplar.map(([grupAdi, grupKriterleri]) => {
        const grupDoldurulmus = grupKriterleri.filter((k) => puanlar[k.id] != null).length;
        return (
          <Card key={grupAdi} className="shadow-sm overflow-hidden">
            <CardHeader className="pb-3 bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">
                  {grupAdi}
                </CardTitle>
                <Badge
                  variant={
                    grupDoldurulmus === grupKriterleri.length
                      ? "default"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {grupDoldurulmus}/{grupKriterleri.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {grupKriterleri.map((kriter) => (
                  <div
                    key={kriter.id}
                    className="px-5 py-4 space-y-3"
                  >
                    {/* Kriter header */}
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {kriter.kriterAdi}
                          </span>
                          {kriter.davranisGostergeleri &&
                            kriter.davranisGostergeleri.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setAcikGosterge(kriter)}
                                className="inline-flex items-center justify-center h-5 w-5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                aria-label="Davranış göstergelerini görüntüle"
                              >
                                <Info className="h-3.5 w-3.5" />
                              </button>
                            )}
                        </div>
                      </div>
                    </div>

                    {/* Rating scale */}
                    <RadioGroup
                      value={puanlar[kriter.id]?.toString() ?? ""}
                      onValueChange={(v) => handlePuanChange(kriter.id, v)}
                      className="flex flex-wrap gap-1"
                      disabled={readOnly}
                    >
                      {OLCEK.map((o) => {
                        const selected =
                          puanlar[kriter.id]?.toString() === o.value;
                        return (
                          <Label
                            key={o.value}
                            className={`flex items-center gap-1.5 cursor-pointer rounded-lg border px-3 py-2 text-xs transition-colors ${
                              selected
                                ? "border-primary bg-primary/10 text-primary font-medium"
                                : "border-border bg-background text-muted-foreground hover:border-primary/40"
                            } ${readOnly ? "opacity-60 cursor-not-allowed" : ""}`}
                          >
                            <RadioGroupItem
                              value={o.value}
                              className="sr-only"
                            />
                            <span className="font-semibold">{o.value}</span>
                            <span className="hidden sm:inline">
                              {o.label}
                            </span>
                          </Label>
                        );
                      })}
                    </RadioGroup>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Genel Açıklama */}
      {gruplar.length > 0 && (
        <>
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-foreground">
                Genel Açıklama
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={aciklama}
                onChange={(e) => setAciklama(e.target.value)}
                placeholder="Personel hakkında genel değerlendirmenizi giriniz..."
                className="min-h-[100px] resize-y"
                disabled={readOnly}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="shadow-sm">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleKaydet}
                  disabled={readOnly}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Kaydet
                </Button>
                <Button
                  onClick={handleTamamla}
                  disabled={readOnly || !tumDolduruldu}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Değerlendirmeyi Tamamla
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Davranış Göstergeleri Modal */}
      <Dialog open={!!acikGosterge} onOpenChange={(o) => !o && setAcikGosterge(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Davranış Göstergeleri
            </DialogTitle>
            {acikGosterge && (
              <p className="text-sm text-muted-foreground pt-1">
                {acikGosterge.kriterAdi}
              </p>
            )}
          </DialogHeader>
          {acikGosterge && (
            <ul className="space-y-2 pt-2">
              {acikGosterge.davranisGostergeleri.map((g, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm"
                >
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span className="text-muted-foreground">{g}</span>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
