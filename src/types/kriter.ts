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
  kriterGrubu: string;
  kriterAdi: string;
  seviye: number; // 1-4
  seviyeTanimi: string;
  davranisGostergeleri: string[];
  donem: string;
  aktif: boolean;
  kullanimda: boolean;
  agirlikPuani: number;
}

/** Default kriter grupları */
export const VARSAYILAN_KRITER_GRUPLARI = [
  "İş Güvenliği ve Kurallara Uyum",
  "Teknik Bilgi ve Beceri",
  "İş Performansı",
  "İş Disiplini",
  "Davranışsal Kriterler",
];

/** Seviye tanım seçenekleri */
export const SEVIYE_TANIMLARI = ["Yetersiz", "Geliştirilmeli", "Yeterli", "Örnek Düzey"];

/** Default criteria */
export const VARSAYILAN_KRITERLER: Array<Omit<Kriter, "id" | "kullanimda" | "agirlikPuani" | "donem">> = [
  {
    kriterGrubu: "İş Güvenliği ve Kurallara Uyum",
    kriterAdi: "KKD Kullanımı",
    seviye: 3,
    seviyeTanimi: "Yeterli",
    aktif: true,
    davranisGostergeleri: ["KKD'leri düzenli kullanıyor", "Bakım ve kontrolünü yapıyor"],
  },
  {
    kriterGrubu: "İş Güvenliği ve Kurallara Uyum",
    kriterAdi: "İş Güvenliği Prosedürlerine Uyum",
    seviye: 3,
    seviyeTanimi: "Yeterli",
    aktif: true,
    davranisGostergeleri: ["Prosedürlere uyuyor", "Tehlikeli durumları raporluyor"],
  },
  {
    kriterGrubu: "Teknik Bilgi ve Beceri",
    kriterAdi: "Makine/Ekipman Kullanma Becerisi",
    seviye: 3,
    seviyeTanimi: "Yeterli",
    aktif: true,
    davranisGostergeleri: ["Doğru ve verimli kullanıyor", "Arıza müdahalesi yapabiliyor"],
  },
  {
    kriterGrubu: "Teknik Bilgi ve Beceri",
    kriterAdi: "Yeni Beceriler Öğrenme İsteği",
    seviye: 3,
    seviyeTanimi: "Yeterli",
    aktif: true,
    davranisGostergeleri: ["Aktif olarak eğitimlere katılıyor", "Öğreniyor"],
  },
  {
    kriterGrubu: "İş Performansı",
    kriterAdi: "İş Planına Uyum",
    seviye: 3,
    seviyeTanimi: "Yeterli",
    aktif: true,
    davranisGostergeleri: ["Plana uygun çalışıyor", "Görevlerini zamanında tamamlıyor"],
  },
  {
    kriterGrubu: "İş Performansı",
    kriterAdi: "İşin Kalite Kriterlerine Uyumu",
    seviye: 3,
    seviyeTanimi: "Yeterli",
    aktif: true,
    davranisGostergeleri: ["Standartlara uygun iş çıkarıyor"],
  },
  {
    kriterGrubu: "İş Disiplini",
    kriterAdi: "İşe Devam/Devamsızlık Düzeyi",
    seviye: 3,
    seviyeTanimi: "Yeterli",
    aktif: true,
    davranisGostergeleri: ["Düzenli devam ediyor"],
  },
  {
    kriterGrubu: "Davranışsal Kriterler",
    kriterAdi: "Aktif Dinleme ve İletişim",
    seviye: 3,
    seviyeTanimi: "Yeterli",
    aktif: true,
    davranisGostergeleri: ["Etkili iletişim kuruyor", "Geri bildirimlere açık"],
  },
];
