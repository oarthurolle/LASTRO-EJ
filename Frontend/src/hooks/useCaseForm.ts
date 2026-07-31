// src/hooks/useCaseForm.ts
import { useState, useEffect } from "react";
import { type Case, type CaseInput } from "../types/case";
import { getAdminCaseById, createCase, updateCase, deleteCase, ApiError } from "../services/casesApi";

interface UseCaseFormResult {
  campos: {
    clientName: string; setClientName: (v: string) => void;
    serviceCategory: string; setServiceCategory: (v: string) => void;
    projectDate: string; setProjectDate: (v: string) => void;
    problem: string; setProblem: (v: string) => void;
    solution: string; setSolution: (v: string) => void;
    result: string; setResult: (v: string) => void;
    testimonial: string; setTestimonial: (v: string) => void;
    coverImageUrl: string; setCoverImageUrl: (v: string) => void;
    status: "DRAFT" | "PUBLISHED"; setStatus: (v: "DRAFT" | "PUBLISHED") => void;
  };
  erros: Record<string, boolean>;
  carregandoCase: boolean;
  salvando: boolean;
  erroSalvar: string;
  editando: boolean;
  salvar: (publicar: boolean) => Promise<boolean>;
  excluir: () => Promise<boolean>;
}

export function useCaseForm(id?: string): UseCaseFormResult {
  const editando = !!id;

  const [clientName, setClientName] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [projectDate, setProjectDate] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [result, setResult] = useState("");
  const [testimonial, setTestimonial] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");

  const [erros, setErros] = useState<Record<string, boolean>>({});
  const [carregandoCase, setCarregandoCase] = useState<boolean>(editando);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [erroSalvar, setErroSalvar] = useState<string>("");

  useEffect(() => {
    if (!editando || !id) return;
    getAdminCaseById(Number(id))
      .then((c: Case) => {
        setClientName(c.clientName);
        setServiceCategory(c.serviceCategory);
        setProjectDate(c.projectDate);
        setProblem(c.problem);
        setSolution(c.solution);
        setResult(c.result);
        setTestimonial(c.testimonial ?? "");
        setCoverImageUrl(c.coverImageUrl);
        setStatus(c.status ?? "DRAFT");
      })
      .catch(() => setErroSalvar("Não foi possível carregar este case para edição."))
      .finally(() => setCarregandoCase(false));
  }, [editando, id]);

  function validar(): boolean {
    const novosErros: Record<string, boolean> = {
      clientName: !clientName.trim(),
      serviceCategory: !serviceCategory,
      projectDate: !projectDate,
      problem: !problem.trim(),
      solution: !solution.trim(),
      result: !result.trim(),
    };
    setErros(novosErros);
    return !Object.values(novosErros).some(Boolean);
  }

  async function salvar(publicar: boolean): Promise<boolean> {
    if (!validar()) return false;
    setSalvando(true);
    setErroSalvar("");

    const payload: CaseInput = {
      clientName: clientName.trim(),
      serviceCategory,
      projectDate,
      problem: problem.trim(),
      solution: solution.trim(),
      result: result.trim(),
      testimonial: testimonial.trim() || undefined,
      coverImageUrl: coverImageUrl.trim(),
      status: publicar ? "PUBLISHED" : "DRAFT",
    };

    try {
      if (editando && id) {
        await updateCase(Number(id), payload);
      } else {
        await createCase(payload);
      }
      return true;
    } catch (e) {
      setErroSalvar(e instanceof ApiError ? e.message : "Erro ao salvar o case. Tente novamente.");
      return false;
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(): Promise<boolean> {
    if (!id) return false;
    try {
      await deleteCase(Number(id));
      return true;
    } catch (e) {
      setErroSalvar(e instanceof ApiError ? e.message : "Erro ao excluir o case.");
      return false;
    }
  }

  return {
    campos: {
      clientName, setClientName,
      serviceCategory, setServiceCategory,
      projectDate, setProjectDate,
      problem, setProblem,
      solution, setSolution,
      result, setResult,
      testimonial, setTestimonial,
      coverImageUrl, setCoverImageUrl,
      status, setStatus,
    },
    erros,
    carregandoCase,
    salvando,
    erroSalvar,
    editando,
    salvar,
    excluir,
  };
}