export const KRITER_TIPLERI = [
  "İş Güvenliği ve Kurallara Uyum",
  "Teknik Bilgi ve Beceri",
  "İş Performansı",
  "İş Disiplini",
  "Davranışsal Kriterler",
] as const;

export type KriterTipi = (typeof KRITER_TIPLERI)[number];

export interface Kriter {
  id: string;
  kriterTipi: KriterTipi;
  kriterAdi: string;
  tanim: string;
  aktif: boolean;
  kullanimda: boolean;
  agirlikPuani: number;
}

export const VARSAYILAN_KRITERLER: Record<KriterTipi, string[]> = {
  "İş Güvenliği ve Kurallara Uyum": [
    "KKD Kullanımı",
    "İş Güvenliği Prosedürlerine Uyum",
    "Kaza ve Olay Geçmişi",
    "İSG Farkındalık Düzeyi",
  ],
  "Teknik Bilgi ve Beceri": [
    "Makine/Ekipman Kullanma Becerisi",
    "Yeni Beceriler Öğrenme İsteği",
    "Sertifikasyon/Donanım Düzeyi",
    "Mevzuat ve Standart Bilgisi",
  ],
  "İş Performansı": [
    "İş Planına Uyum",
    "İşin Kalite Kriterlerine Uyumu",
    "Hata Oranı",
    "Verimlilik Düzeyi",
  ],
  "İş Disiplini": [
    "İşe Devam/Devamsızlık Düzeyi",
    "İşe Zamanında Gelme ve İş Saatlerine Uyum",
    "Kurum Değerlerine Uyum",
  ],
  "Davranışsal Kriterler": [
    "Aktif Dinleme ve İletişim",
    "Dayanıklılık, Esneklik ve Çeviklik",
    "Çevre Bilinci",
  ],
};
