"use client";
import { useState, useEffect } from "react";

export function useBankCreator() {
  const [bankCreator, setBankCreator] = useState({
    sprites: [],
    palette: Array(32).fill("#000000"),
  });

  useEffect(() => {
    // Load bank data from local storage if it exists
    const savedBankData = localStorage.getItem("bankCreator");
    if (savedBankData) {
      setBankCreator(JSON.parse(savedBankData));
    }
  }, []);

  useEffect(() => {
    // Save bank data to local storage whenever it changes
    localStorage.setItem("bankCreator", JSON.stringify(bankCreator));
  }, [bankCreator]);

  const clearBank = () => {
    localStorage.removeItem("bankCreator");
    setBankCreator({ sprites: [], palette: Array(32).fill("#000000") });
  };

  return { bankCreator, setBankCreator, clearBank };
}
