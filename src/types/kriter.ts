export const KRITER_TIPLERI = [
  "İş Güvenliği ve Kurallara Uyum",
  "Teknik Bilgi ve Beceri",
  "İş Performansı",
  "İş Disiplini",
  "Davranışsal Kriterler",
] as const;

export type KriterTipi = (typeof KRITER_TIPLERI)[number];

export interface Seviye {
  seviyeNo: number; // 1-4
  tanim: string;
  davranisGostergeleri: string[];
}

export interface Kriter {
  id: string;
  kriterGrubu: string; // was kriterTipi
  kriterAdi: string;
  seviyeler: Seviye[];
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

/** Default criteria with levels */
export const VARSAYILAN_KRITERLER: Array<Omit<Kriter, "id" | "kullanimda" | "agirlikPuani" | "donem">> = [
  {
    kriterGrubu: "İş Güvenliği ve Kurallara Uyum",
    kriterAdi: "KKD Kullanımı",
    aktif: true,
    seviyeler: [
      { seviyeNo: 1, tanim: "Yetersiz", davranisGostergeleri: ["KKD'leri hiç kullanmıyor veya sık sık eksik kullanıyor"] },
      { seviyeNo: 2, tanim: "Geliştirilmeli", davranisGostergeleri: ["KKD'leri zaman zaman eksik kullanıyor", "Uyarı gerektiriyor"] },
      { seviyeNo: 3, tanim: "Yeterli", davranisGostergeleri: ["KKD'leri düzenli kullanıyor", "Bakım ve kontrolünü yapıyor"] },
      { seviyeNo: 4, tanim: "Örnek Düzey", davranisGostergeleri: ["KKD kullanımında örnek oluyor", "Diğer çalışanları da yönlendiriyor"] },
    ],
  },
  {
    kriterGrubu: "İş Güvenliği ve Kurallara Uyum",
    kriterAdi: "İş Güvenliği Prosedürlerine Uyum",
    aktif: true,
    seviyeler: [
      { seviyeNo: 1, tanim: "Yetersiz", davranisGostergeleri: ["Güvenlik talimatlarına uymuyor", "Tehlikeli davranışlar sergiliyor"] },
      { seviyeNo: 2, tanim: "Geliştirilmeli", davranisGostergeleri: ["Prosedürlere kısmen uyuyor", "Zaman zaman ihlal yapıyor"] },
      { seviyeNo: 3, tanim: "Yeterli", davranisGostergeleri: ["Prosedürlere uyuyor", "Tehlikeli durumları raporluyor"] },
      { seviyeNo: 4, tanim: "Örnek Düzey", davranisGostergeleri: ["Proaktif olarak riskleri tespit ediyor", "Önlem alıyor"] },
    ],
  },
  {
    kriterGrubu: "Teknik Bilgi ve Beceri",
    kriterAdi: "Makine/Ekipman Kullanma Becerisi",
    aktif: true,
    seviyeler: [
      { seviyeNo: 1, tanim: "Yetersiz", davranisGostergeleri: ["Makine ve ekipmanları doğru kullanamıyor"] },
      { seviyeNo: 2, tanim: "Geliştirilmeli", davranisGostergeleri: ["Temel düzeyde kullanıyor", "Yardım gerektiriyor"] },
      { seviyeNo: 3, tanim: "Yeterli", davranisGostergeleri: ["Doğru ve verimli kullanıyor", "Arıza müdahalesi yapabiliyor"] },
      { seviyeNo: 4, tanim: "Örnek Düzey", davranisGostergeleri: ["Ekipmanları ustaca kullanıyor", "Diğerlerini eğitebiliyor"] },
    ],
  },
  {
    kriterGrubu: "Teknik Bilgi ve Beceri",
    kriterAdi: "Yeni Beceriler Öğrenme İsteği",
    aktif: true,
    seviyeler: [
      { seviyeNo: 1, tanim: "Yetersiz", davranisGostergeleri: ["Yeni teknoloji ve yöntemlere kapalı"] },
      { seviyeNo: 2, tanim: "Geliştirilmeli", davranisGostergeleri: ["Zorlandığında öğrenmeye çalışıyor"] },
      { seviyeNo: 3, tanim: "Yeterli", davranisGostergeleri: ["Aktif olarak eğitimlere katılıyor", "Öğreniyor"] },
      { seviyeNo: 4, tanim: "Örnek Düzey", davranisGostergeleri: ["Kendi kendine öğreniyor", "Öğrendiklerini paylaşıyor"] },
    ],
  },
  {
    kriterGrubu: "İş Performansı",
    kriterAdi: "İş Planına Uyum",
    aktif: true,
    seviyeler: [
      { seviyeNo: 1, tanim: "Yetersiz", davranisGostergeleri: ["Görevleri zamanında tamamlamıyor"] },
      { seviyeNo: 2, tanim: "Geliştirilmeli", davranisGostergeleri: ["Genellikle gecikiyor", "Planlama desteği gerekiyor"] },
      { seviyeNo: 3, tanim: "Yeterli", davranisGostergeleri: ["Plana uygun çalışıyor", "Görevlerini zamanında tamamlıyor"] },
      { seviyeNo: 4, tanim: "Örnek Düzey", davranisGostergeleri: ["Planın önünde gidiyor", "Ekibe yardımcı oluyor"] },
    ],
  },
  {
    kriterGrubu: "İş Performansı",
    kriterAdi: "İşin Kalite Kriterlerine Uyumu",
    aktif: true,
    seviyeler: [
      { seviyeNo: 1, tanim: "Yetersiz", davranisGostergeleri: ["Kalite standartlarını karşılayamıyor"] },
      { seviyeNo: 2, tanim: "Geliştirilmeli", davranisGostergeleri: ["Kalite seviyesi dalgalanıyor"] },
      { seviyeNo: 3, tanim: "Yeterli", davranisGostergeleri: ["Standartlara uygun iş çıkarıyor"] },
      { seviyeNo: 4, tanim: "Örnek Düzey", davranisGostergeleri: ["Kaliteyi sürekli artırıyor", "İyileştirme önerileri sunuyor"] },
    ],
  },
  {
    kriterGrubu: "İş Disiplini",
    kriterAdi: "İşe Devam/Devamsızlık Düzeyi",
    aktif: true,
    seviyeler: [
      { seviyeNo: 1, tanim: "Yetersiz", davranisGostergeleri: ["Sık devamsızlık yapıyor"] },
      { seviyeNo: 2, tanim: "Geliştirilmeli", davranisGostergeleri: ["Zaman zaman mazeret dışı devamsızlık yapıyor"] },
      { seviyeNo: 3, tanim: "Yeterli", davranisGostergeleri: ["Düzenli devam ediyor"] },
      { seviyeNo: 4, tanim: "Örnek Düzey", davranisGostergeleri: ["Tam devam", "İzin planlamasını mükemmel yapıyor"] },
    ],
  },
  {
    kriterGrubu: "Davranışsal Kriterler",
    kriterAdi: "Aktif Dinleme ve İletişim",
    aktif: true,
    seviyeler: [
      { seviyeNo: 1, tanim: "Yetersiz", davranisGostergeleri: ["İletişim kurmakta zorlanıyor"] },
      { seviyeNo: 2, tanim: "Geliştirilmeli", davranisGostergeleri: ["Temel iletişim kurabiliyor", "Geri bildirime kapalı"] },
      { seviyeNo: 3, tanim: "Yeterli", davranisGostergeleri: ["Etkili iletişim kuruyor", "Geri bildirimlere açık"] },
      { seviyeNo: 4, tanim: "Örnek Düzey", davranisGostergeleri: ["Mükemmel iletişim", "Çatışma çözümünde liderlik yapıyor"] },
    ],
  },
];
