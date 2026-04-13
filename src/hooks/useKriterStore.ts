import { useState, useCallback } from "react";
import { Kriter, VARSAYILAN_KRITERLER } from "@/types/kriter";

const CURRENT_YEAR = new Date().getFullYear().toString();

const INITIAL_KRITERLER: Kriter[] = VARSAYILAN_KRITERLER.map((k, i) => ({
  ...k,
  id: String(i + 1),
  donem: CURRENT_YEAR,
  kullanimda: false,
  agirlikPuani: 0,
}));

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
