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
  aktif: boolean;
  kullanimda: boolean;
  agirlikPuani: number;
}

/** 3-level structure: Kriter Tipi → Üst Kriter → Kriter Adı (detay) */
export const VARSAYILAN_KRITERLER: Record<KriterTipi, Record<string, string[]>> = {
  "İş Güvenliği ve Kurallara Uyum": {
    "KKD Kullanımı": [
      "Görevine uygun kask, eldiven, gözlük, kulaklık gibi kişisel koruyucu ekipmanları eksiksiz ve düzenli olarak kullanmak",
      "KKD'lerin bakım ve kontrolünü zamanında yapmak",
    ],
    "İş Güvenliği Prosedürlerine Uyum": [
      "Çalışma alanındaki güvenlik talimatlarına ve prosedürlerine uymak",
      "Tehlikeli durum ve davranışları raporlamak",
    ],
    "Kaza ve Olay Geçmişi": [
      "Dönem içinde iş kazası veya ramak kala olay kaydının bulunmaması",
      "Geçmiş olaylardan ders çıkararak önlem almak",
    ],
    "İSG Farkındalık Düzeyi": [
      "İSG eğitimlerine düzenli katılım sağlamak",
      "Çalışma arkadaşlarını güvenlik konusunda uyarmak ve bilinçlendirmek",
    ],
  },
  "Teknik Bilgi ve Beceri": {
    "Makine/Ekipman Kullanma Becerisi": [
      "Sorumlu olduğu makine ve ekipmanları doğru ve verimli şekilde kullanmak",
      "Arıza durumlarında ilk müdahaleyi yapabilmek",
    ],
    "Yeni Beceriler Öğrenme İsteği": [
      "Yeni teknoloji ve yöntemlere açık olmak ve öğrenme çabası göstermek",
      "Eğitim ve gelişim fırsatlarına aktif katılım sağlamak",
    ],
    "Sertifikasyon/Donanım Düzeyi": [
      "Göreviyle ilgili gerekli sertifika ve belgelere sahip olmak",
      "Sertifikaların geçerlilik sürelerini takip etmek ve yenilemek",
    ],
    "Mevzuat ve Standart Bilgisi": [
      "İlgili yasal mevzuat ve kalite standartlarını bilmek",
      "Güncel mevzuat değişikliklerini takip etmek",
    ],
  },
  "İş Performansı": {
    "İş Planına Uyum": [
      "Verilen görevleri planlanan süre içinde tamamlamak",
      "İş programına ve önceliklendirmeye uymak",
    ],
    "İşin Kalite Kriterlerine Uyumu": [
      "Üretilen iş veya hizmetin kalite standartlarına uygun olması",
      "Kalite kontrol süreçlerine aktif katılım sağlamak",
    ],
    "Hata Oranı": [
      "İş süreçlerinde hata oranını minimum düzeyde tutmak",
      "Yapılan hataları tekrarlamamak ve düzeltici aksiyon almak",
    ],
    "Verimlilik Düzeyi": [
      "Kaynakları etkin ve verimli kullanmak",
      "Birim zamanda beklenen üretim/hizmet miktarını karşılamak",
    ],
  },
  "İş Disiplini": {
    "İşe Devam/Devamsızlık Düzeyi": [
      "Mazeret dışı devamsızlık yapmamak",
      "İzin kullanımlarını planlı ve düzenli yapmak",
    ],
    "İşe Zamanında Gelme ve İş Saatlerine Uyum": [
      "Vardiya ve mesai saatlerine uygun şekilde işbaşı yapmak",
      "Mola sürelerine uymak ve iş saatlerini etkin kullanmak",
    ],
    "Kurum Değerlerine Uyum": [
      "Kurum kültürü ve değerlerine uygun davranış sergilemek",
      "İş yeri kurallarına ve etik ilkelere uymak",
    ],
  },
  "Davranışsal Kriterler": {
    "Aktif Dinleme ve İletişim": [
      "İş arkadaşları ve yöneticileriyle etkili iletişim kurmak",
      "Geri bildirimlere açık olmak ve yapıcı iletişim sağlamak",
    ],
    "Dayanıklılık, Esneklik ve Çeviklik": [
      "Değişen iş koşullarına hızlı uyum sağlamak",
      "Stresli durumlarda soğukkanlılığını korumak ve çözüm odaklı olmak",
    ],
    "Çevre Bilinci": [
      "Çevre koruma kurallarına uymak ve atık yönetimini doğru uygulamak",
      "Enerji ve kaynak tasarrufuna dikkat etmek",
    ],
  },
};
