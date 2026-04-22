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
      {/* Info Card - üst bilgi şeridi */}
      <Card className="shadow-sm">
        <CardContent className="pt-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Dönem:</div>
              <p className="text-base font-medium text-foreground">{donem}</p>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Pozisyon:</div>
              <span className="inline-block rounded-md bg-muted px-3 py-1 text-sm font-medium text-foreground">
                {pozisyon}
              </span>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Değerlendirilen Personelin Adı Soyadı:
              </div>
              <p className="text-base font-medium text-foreground">{personelAdi}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tamamlanan progress */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Tamamlanan: <span className="font-semibold text-foreground">{doldurulmus}</span> / {toplamKriter}
        </span>
        <Progress value={tamamlanmaYuzdesi} className="h-2 flex-1" />
      </div>

      {/* Criteria Groups */}
      {gruplar.length === 0 && (
        <Card className="shadow-sm">
          <CardContent className="py-12 text-center text-muted-foreground">
            Aktif kriter bulunamadı. Lütfen önce Kriter Havuzu'ndan kriter tanımlayınız.
          </CardContent>
        </Card>
      )}

      {gruplar.map(([grupAdi, grupKriterleri]) => {
        return (
          <div key={grupAdi} className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">{grupAdi}</h3>
            <div className="space-y-3">
              {grupKriterleri.map((kriter) => (
                <Card key={kriter.id} className="shadow-sm">
                  <CardContent className="p-5">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
                      {/* Sol: kriter adı + açıklama */}
                      <div className="lg:col-span-3 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-foreground">
                            {kriter.kriterAdi}
                          </span>
                          {kriter.davranisGostergeleri &&
                            kriter.davranisGostergeleri.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setAcikGosterge(kriter)}
                                className="inline-flex items-center justify-center h-5 w-5 rounded-full text-primary hover:bg-primary/10 transition-colors"
                                aria-label="Davranış göstergelerini görüntüle"
                              >
                                <Info className="h-4 w-4" />
                              </button>
                            )}
                        </div>
                        {kriter.davranisGostergeleri?.[0] && (
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {kriter.davranisGostergeleri[0]}
                          </p>
                        )}
                      </div>

                      {/* Orta: radyo daireler */}
                      <div className="lg:col-span-6">
                        <div className="text-xs text-muted-foreground mb-3">
                          Yetkinlik Tanımı
                        </div>
                        <RadioGroup
                          value={puanlar[kriter.id]?.toString() ?? ""}
                          onValueChange={(v) => handlePuanChange(kriter.id, v)}
                          className="grid grid-cols-5 gap-2"
                          disabled={readOnly}
                        >
                          {OLCEK.map((o) => {
                            const selected =
                              puanlar[kriter.id]?.toString() === o.value;
                            return (
                              <Label
                                key={o.value}
                                className={`flex flex-col items-center gap-1.5 cursor-pointer text-center ${
                                  readOnly ? "opacity-60 cursor-not-allowed" : ""
                                }`}
                              >
                                <span
                                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                                    selected
                                      ? "border-primary bg-primary"
                                      : "border-muted-foreground/40 bg-background hover:border-primary/60"
                                  }`}
                                >
                                  {selected && (
                                    <span className="h-2 w-2 rounded-full bg-primary-foreground" />
                                  )}
                                </span>
                                <RadioGroupItem
                                  value={o.value}
                                  className="sr-only"
                                />
                                <span
                                  className={`text-[11px] leading-tight whitespace-pre-line ${
                                    selected
                                      ? "text-primary font-medium"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {o.label}
                                </span>
                              </Label>
                            );
                          })}
                        </RadioGroup>
                      </div>

                      {/* Sağ: yorum */}
                      <div className="lg:col-span-3">
                        <Textarea
                          value={yorumlar[kriter.id] ?? ""}
                          onChange={(e) =>
                            handleYorumChange(kriter.id, e.target.value)
                          }
                          placeholder="Yorum ekleyiniz..."
                          className="min-h-[90px] resize-y text-sm"
                          disabled={readOnly}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
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
