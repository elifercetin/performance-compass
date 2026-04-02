import { useState, useCallback } from "react";
import { Kriter, KriterTipi, KRITER_TIPLERI, VARSAYILAN_KRITERLER } from "@/types/kriter";

// Generate initial criteria from the default map
const INITIAL_KRITERLER: Kriter[] = [];
let idCounter = 1;
for (const tip of KRITER_TIPLERI) {
  for (const ad of VARSAYILAN_KRITERLER[tip]) {
    INITIAL_KRITERLER.push({
      id: String(idCounter++),
      kriterTipi: tip,
      kriterAdi: ad,
      tanim: "",
      aktif: true,
      kullanimda: false,
      agirlikPuani: 0,
    });
  }
}

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
