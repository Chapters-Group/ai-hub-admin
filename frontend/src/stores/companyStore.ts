import { create } from "zustand";
import type { Company } from "@/lib/types";

interface CompanyState {
  companies: Company[];
  selectedCompanyId: string | null;
  setCompanies: (companies: Company[]) => void;
  selectCompany: (id: string) => void;
  selectedCompany: () => Company | undefined;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: [],
  selectedCompanyId: localStorage.getItem("selectedCompanyId"),

  setCompanies: (companies) => set({ companies }),

  selectCompany: (id) => {
    localStorage.setItem("selectedCompanyId", id);
    set({ selectedCompanyId: id });
  },

  selectedCompany: () => {
    const { companies, selectedCompanyId } = get();
    return companies.find((c) => c.id === selectedCompanyId);
  },
}));
