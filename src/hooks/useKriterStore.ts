import { useState, useCallback } from "react";
import { Kriter, KriterTipi } from "@/types/kriter";

const INITIAL_KRITERLER: Kriter[] = [
  {
    id: "1",
    kriterTipi: "İş Güvenliği ve Kurallara Uyum",
    ustKriter: "Kişisel Koruyucu Donanım (KKD) Kullanımı",
    kriterAdi: "Baret Kullanımı",
    tanim: "İş alanında baret kullanım durumu",
    aktif: true,
    kullanimda: true,
    agirlikPuani: 0,
  },
  {
    id: "2",
    kriterTipi: "İş Güvenliği ve Kurallara Uyum",
    ustKriter: "Kişisel Koruyucu Donanım (KKD) Kullanımı",
    kriterAdi: "Eldiven Kullanımı",
    tanim: "Uygun eldiven kullanım durumu",
    aktif: true,
    kullanimda: false,
    agirlikPuani: 0,
  },
  {
    id: "3",
    kriterTipi: "Teknik Bilgi ve Beceri",
    ustKriter: "Makine/Ekipman Kullanma Becerisi",
    kriterAdi: "CNC Tezgah Kullanımı",
    tanim: "CNC tezgah işletme becerisi",
    aktif: true,
    kullanimda: true,
    agirlikPuani: 0,
  },
  {
    id: "4",
    kriterTipi: "İş Performansı",
    ustKriter: "İş Planına Uyum",
    kriterAdi: "Günlük Üretim Miktarı",
    tanim: "Günlük hedeflenen üretim miktarına ulaşma",
    aktif: true,
    kullanimda: false,
    agirlikPuani: 0,
  },
  {
    id: "5",
    kriterTipi: "İş Disiplini",
    ustKriter: "İşe Devam/Devamsızlık Düzeyi",
    kriterAdi: "İşe Geliş Düzeni",
    tanim: "Düzenli işe devam durumu",
    aktif: true,
    kullanimda: false,
    agirlikPuani: 0,
  },
  {
    id: "6",
    kriterTipi: "Davranışsal Kriterler",
    ustKriter: "Aktif Dinleme ve İletişim",
    kriterAdi: "Ekip İçi Uyum",
    tanim: "Ekip üyeleriyle uyumlu çalışabilme",
    aktif: true,
    kullanimda: false,
    agirlikPuani: 0,
  },
];

export function useKriterStore() {
  const [kriterler, setKriterler] = useState<Kriter[]>(INITIAL_KRITERLER);

  const addKriter = useCallback((kriter: Omit<Kriter, "id" | "kullanimda">) => {
    setKriterler((prev) => [
      ...prev,
      { ...kriter, id: crypto.randomUUID(), kullanimda: false },
    ]);
  }, []);

  const updateKriter = useCallback((id: string, updates: Partial<Kriter>) => {
    setKriterler((prev) =>
      prev.map((k) => (k.id === id ? { ...k, ...updates } : k))
    );
  }, []);

  const deleteKriter = useCallback((id: string) => {
    setKriterler((prev) => prev.filter((k) => k.id !== id));
  }, []);

  const toggleAktif = useCallback((id: string) => {
    setKriterler((prev) =>
      prev.map((k) => (k.id === id ? { ...k, aktif: !k.aktif } : k))
    );
  }, []);

  return { kriterler, setKriterler, addKriter, updateKriter, deleteKriter, toggleAktif };
}
