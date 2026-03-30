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
  ustKriter: string;
  kriterAdi: string;
  tanim: string;
  aktif: boolean;
  kullanimda: boolean; // geçmişte kullanıldı mı
  agirlikPuani: number;
}

export interface UstKriterMap {
  [tip: string]: string[];
}

export const UST_KRITERLER: UstKriterMap = {
  "İş Güvenliği ve Kurallara Uyum": [
    "KKD Kullanımı",
    "İSG Kurallarına Uyum",
    "Çevre ve Atık Yönetimi",
  ],
  "Teknik Bilgi ve Beceri": [
    "Makine Kullanımı",
    "Üretim Teknikleri",
    "Kalite Kontrol",
  ],
  "İş Performansı": [
    "Üretkenlik",
    "Hedef Gerçekleştirme",
    "Verimlilik",
  ],
  "İş Disiplini": [
    "Devam/Devamsızlık",
    "Mesai Uyumu",
    "İş Yeri Düzeni",
  ],
  "Davranışsal Kriterler": [
    "Takım Çalışması",
    "İletişim",
    "Sorumluluk",
  ],
};
