"use client";

import React, { useState, useEffect } from "react";
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { formatCategoryName, formatStageName } from "@/lib/utils";
import type { IndicatorModel, AssessmentAspect } from "@/types/mutu-banpt";
import { useGetAssessmentEvaluationListQuery } from "@/store/services/assessmentEvaluationApi";
import { useGetAccreditationIndicatorStatsQuery } from "@/store/services/accreditationApi";
import { useGetIndicatorListQuery } from "@/store/services/indicatorApi";
import { useGetFileMutation } from "@/store/services/fileApi";
import { toast } from "sonner";

const mapCriteria = (criteria: string): string => {
  switch (criteria) {
    case "budaya-mutu":
      return "quality_culture";
    case "relevansi-pendidikan":
      return "education_relevance";
    case "relevansi-penelitian":
      return "research_relevance";
    case "relevansi-pkm":
      return "community_service_relevance";
    case "akuntabilitas":
      return "accountability";
    case "diferensiasi-misi":
      return "mission_differentiation";
    default:
      return criteria;
  }
};

interface MutuCategoryClientProps {
  category: string;
}

interface StageData {
  stage: string;
  indicators: IndicatorModel[];
}

export default function MutuCategoryClientPage({
  category,
}: MutuCategoryClientProps): React.JSX.Element {
  const catLabel = formatCategoryName(category);

  // Role detection
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>("");
  const [activeAkredId, setActiveAkredId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stageDataList, setStageDataList] = useState<StageData[]>([]);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [selectedAspect, setSelectedAspect] = useState<AssessmentAspect | null>(
    null,
  );
  const [selectedStageLabel, setSelectedStageLabel] = useState<string>("");
  const [drawerPage, setDrawerPage] = useState<number>(1);
  const [getFile] = useGetFileMutation();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrawerPage(1);
  }, [selectedAspect, isDrawerOpen]);

  const handleViewProof = (proofUrl: string) => {
    if (!proofUrl) return;
    const promise = getFile(proofUrl)
      .unwrap()
      .then((objectUrl) => {
        window.open(objectUrl, "_blank");
        return objectUrl;
      });

    toast.promise(promise, {
      loading: "Mengunduh file bukti...",
      success: "File berhasil dimuat!",
      error: (err: unknown) => {
        const errorObj = err as { message?: string };
        return errorObj.message || "Gagal memuat file bukti";
      },
    });
  };

  useEffect(() => {
    const raw = localStorage.getItem("userSession");
    if (raw) {
      try {
        const session = JSON.parse(raw);
        if (session.username === "admin" || session.role === "Administrator") {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setIsAdmin(true);
        }
        setUserRole(session.role || "");
      } catch {
        // ignore
      }
    }
  }, []);

  // Sync active accreditation
  useEffect(() => {
    const storedId = localStorage.getItem("active_akreditasi_id");
    if (storedId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveAkredId(storedId);
    }

    const handleActiveChange = () => {
      const newId = localStorage.getItem("active_akreditasi_id");
      if (newId) {
        setActiveAkredId(newId);
      }
    };

    window.addEventListener("active_akreditasi_change", handleActiveChange);
    return () =>
      window.removeEventListener(
        "active_akreditasi_change",
        handleActiveChange,
      );
  }, []);

  // Reset selected indicator and stage data when accreditation changes
  useEffect(() => {
    // Clear stage data list to trigger re-mapping based on new stats
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStageDataList([]);
    // Reset selected stage label for consistency

    setSelectedStageLabel("");
  }, [activeAkredId]);

  // RTK Query API Hooks
  const { data: statsRes, isFetching: isStatsFetching } =
    useGetAccreditationIndicatorStatsQuery(activeAkredId, {
      skip: !activeAkredId,
    });

  // Search indicators by criteria for the current category
  const { data: indicatorsRes, isFetching: isIndicatorsFetching } =
    useGetIndicatorListQuery(
      {
        accreditation_id: activeAkredId,
        criteria: mapCriteria(category),
        target: "input",
      },
      {
        skip: !activeAkredId,
      },
    );

  // (Removed unused all evaluations query)

  // Fetch evaluations for the selected indicator (used in the drawer)
  const { data: drawerEvalsRes, isFetching: isDrawerEvalsFetching } =
    useGetAssessmentEvaluationListQuery(
      { accreditation_id: activeAkredId, indicator_id: selectedAspect?.id },
      { skip: !selectedAspect },
    );

  // Sync loading state
  useEffect(() => {
    const isFetching =
      isStatsFetching || isDrawerEvalsFetching || isIndicatorsFetching;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(isFetching);
  }, [isStatsFetching, isDrawerEvalsFetching, isIndicatorsFetching]);

  // Map API response models to UI Component states (IndicatorTab / AssessmentAspect)
  useEffect(() => {
    if (statsRes?.data && indicatorsRes?.data) {
      const indicatorIdSet = new Set(indicatorsRes.data.map((ind) => ind.id));
      const stages = ["masukan", "proses", "luaran", "dampak"];
      const targetMap = {
        masukan: "input",
        proses: "process",
        luaran: "output",
        dampak: "impact",
      };

      const mappedList = stages.map((stg) => {
        const backendTarget = targetMap[stg as keyof typeof targetMap];

        // Filter stats by criteria, target, and matching indicator IDs
        const stageItems = statsRes.data.filter(
          (item) =>
            item.criteria === mapCriteria(category) &&
            item.target === backendTarget &&
            indicatorIdSet.has(item.indicator_id),
        );

        const mappedIndicators: IndicatorModel[] = stageItems.map(
          (item, index) => {
            const aspects: AssessmentAspect[] = [
              {
                id: item.indicator_id,
                type: "formula",
                description: item.assessment,
                complianceDescription: item.fulfillment,
                dataSource: "-",
                proofUrl: undefined,
                buktiRequired: false,
                expectationResult: 0,
                expectationFormat: "decimal",
                score: Number(item.score || 0),
                isSubmitted: true,
              },
            ];

            return {
              id: item.indicator_id,
              accreditation: { id: activeAkredId, name: "" },
              number: item.number,
              name: item.name,
              justification: "",
              criteria: mapCriteria(category),
              target: backendTarget,
              updated_at: "",
              created_at: "",
              status: "selesai" as const,
              aspects,
            };
          },
        );

        return {
          stage: stg,
          indicators: mappedIndicators,
        };
      });

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStageDataList(mappedList);
    }
  }, [statsRes, indicatorsRes, category]);

  // Role permissions
  const isAssessor = userRole === "Assessor";
  const isAuditor = userRole === "Auditor";
  const isAuthorized = isAdmin || isAssessor || isAuditor;
  const canInteract = isAdmin || isAssessor;

  if (userRole && !isAuthorized) {
    return (
      <div className="p-6">
        <div className="bg-error/10 text-error p-4 rounded-lg font-semibold text-sm">
          Akses Ditolak: Anda tidak memiliki izin untuk mengakses halaman ini.
        </div>
      </div>
    );
  }

  const getAspectScoreText = (asp: AssessmentAspect): string => {
    return asp.score !== undefined ? String(asp.score) : "0";
  };

  const handleRowClick = (asp: AssessmentAspect, stageKey: string) => {
    if (!canInteract) return;
    setSelectedAspect(asp);
    setSelectedStageLabel(formatStageName(stageKey));
    setIsDrawerOpen(true);
  };

  // Map evaluations directly from API (filtered by indicator_id server-side)
  const drawerSubmissions = (drawerEvalsRes?.data ?? []).map((ev) => ({
    id: ev.id,
    nama: ev.user?.name || "Program Studi/Unit",
    institute: ev.institute || "-",
    studyProgram: ev.study_program || "-",
    bukti: ev.proof || "",
    expectationScore: Number(ev.calculation_rule.expectation_result || 0),
    score: Number(ev.calculated_result),
    status:
      Number(ev.calculated_result) >=
      Number(ev.calculation_rule.expectation_result || 0)
        ? ("Memenuhi" as const)
        : ("Tidak Memenuhi" as const),
    createdAt: ev.created_at || new Date().toISOString(),
    updatedAt: ev.updated_at || new Date().toISOString(),
  }));

  const drawerLimit = 10;
  const totalDrawerItems = drawerSubmissions.length;
  const totalDrawerPages = Math.ceil(totalDrawerItems / drawerLimit);
  const paginatedDrawerSubmissions = drawerSubmissions.slice(
    (drawerPage - 1) * drawerLimit,
    drawerPage * drawerLimit,
  );
  const startDrawerItem =
    totalDrawerItems === 0 ? 0 : (drawerPage - 1) * drawerLimit + 1;
  const endDrawerItem = Math.min(drawerPage * drawerLimit, totalDrawerItems);

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {/* Title Header */}
      <div className="border-b border-border/40 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl capitalize">
          Evaluasi {catLabel}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Rangkuman capaian indikator mutu masukan, proses, luaran, dan dampak.
        </p>
      </div>

      {isLoading ? (
        /* Loading Skeletons */
        <div className="space-y-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-5 w-48 rounded bg-muted/40" />
              <div className="border border-border rounded-xl bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">
                        <Skeleton className="h-4 w-12 bg-muted/40" />
                      </TableHead>
                      <TableHead>
                        <Skeleton className="h-4 w-28 bg-muted/40" />
                      </TableHead>
                      <TableHead>
                        <Skeleton className="h-4 w-36 bg-muted/40" />
                      </TableHead>
                      <TableHead className="w-20 text-right">
                        <Skeleton className="h-4 w-8 ml-auto bg-muted/40" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[1, 2].map((j) => (
                      <TableRow key={j}>
                        <TableCell>
                          <Skeleton className="h-4 w-16 bg-muted/40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-3/4 bg-muted/40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-5/6 bg-muted/40" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-4 w-8 ml-auto bg-muted/40" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Actual Tables Content */
        <div className="space-y-8">
          {stageDataList.map((stageData) => {
            const stageTitle = `${formatStageName(stageData.stage)} ${catLabel}`;
            const allAspects = stageData.indicators.flatMap((ind) =>
              (ind.aspects || []).map((asp) => ({
                ...asp,
                indicatorTitle: ind.number.toLowerCase().includes("indikator")
                  ? ind.number
                  : `Indikator ${ind.number}`,
              })),
            );

            return (
              <div key={stageData.stage} className="space-y-3">
                <div className="flex flex-col">
                  <h3 className="text-xs font-bold text-foreground lowercase first-letter:uppercase tracking-wide">
                    {stageTitle}
                  </h3>
                  {canInteract && (
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      * Klik row untuk memunculkan detail pengisi indikator
                    </span>
                  )}
                </div>

                <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-muted/10">
                      <TableRow>
                        <TableHead className="w-28 font-bold text-foreground">
                          Indikator
                        </TableHead>
                        <TableHead className="font-bold text-foreground">
                          Aspek Penilaian
                        </TableHead>
                        <TableHead className="font-bold text-foreground">
                          Deskripsi Pemenuhan
                        </TableHead>
                        <TableHead className="w-24 text-right font-bold text-foreground">
                          Skor
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allAspects.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center text-muted-foreground py-6 italic"
                          >
                            Belum ada aspek penilaian terdaftar untuk tahap ini.
                          </TableCell>
                        </TableRow>
                      ) : (
                        allAspects.map((asp) => (
                          <TableRow
                            key={asp.id}
                            onClick={(): void =>
                              handleRowClick(asp, stageData.stage)
                            }
                            className={
                              canInteract
                                ? "hover:bg-muted/40 cursor-pointer transition-colors duration-150 select-none"
                                : "select-none"
                            }
                          >
                            <TableCell className="font-semibold text-foreground align-top">
                              {asp.indicatorTitle}
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-pre-line leading-relaxed align-top">
                              {asp.description}
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-pre-line leading-relaxed align-top">
                              {asp.complianceDescription}
                            </TableCell>
                            <TableCell className="text-right font-bold text-foreground align-top">
                              {getAspectScoreText(asp)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Submissions Drawer */}
      <Drawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        direction="bottom"
      >
        <DrawerContent className="max-h-[92vh] h-[92vh] p-6 bg-card border-t border-border text-xs flex flex-col">
          <DrawerHeader>
            <DrawerTitle className="text-sm font-bold text-foreground lowercase first-letter:uppercase">
              {selectedStageLabel} {catLabel}
            </DrawerTitle>
            <DrawerDescription className="text-xs text-muted-foreground">
              Daftar rekapitulasi data pengisi indikator dari berbagai program
              studi/unit kerja.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 no-scrollbar overflow-y-auto px-1 py-4">
            <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead className="font-bold text-foreground">
                      Nama
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      Institusi / Prodi
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      Bukti
                    </TableHead>
                    <TableHead className="w-32 text-center font-bold text-foreground">
                      Expectation
                    </TableHead>
                    <TableHead className="w-20 text-center font-bold text-foreground">
                      Skor
                    </TableHead>
                    <TableHead className="w-24 text-center font-bold text-foreground">
                      Status
                    </TableHead>
                    <TableHead className="w-32 text-center font-bold text-foreground">
                      Dibuat
                    </TableHead>
                    <TableHead className="w-32 text-center font-bold text-foreground">
                      Diperbarui
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isDrawerEvalsFetching ? (
                    /* Skeleton saat loading data evaluasi */
                    [1, 2, 3].map((k) => (
                      <TableRow key={k}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                          <TableCell key={c}>
                            <Skeleton className="h-4 w-full bg-muted/40" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : paginatedDrawerSubmissions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground py-8 italic"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-6 w-6 text-muted-foreground/40" />
                          <span>
                            Belum ada data evaluasi untuk indikator ini.
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedDrawerSubmissions.map((sub) => (
                      <TableRow key={sub.id} className="hover:bg-muted/10">
                        <TableCell className="font-semibold text-foreground">
                          {sub.nama}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          <div>{sub.institute}</div>
                          <div className="text-primary/80 font-medium">
                            {sub.studyProgram}
                          </div>
                        </TableCell>
                        <TableCell>
                          {sub.bukti ? (
                            <button
                              onClick={(e): void => {
                                e.stopPropagation();
                                handleViewProof(sub.bukti);
                              }}
                              className="inline-flex items-center gap-1 text-primary hover:underline font-semibold text-xs cursor-pointer"
                            >
                              Kunjungi Bukti
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          ) : (
                            <span className="text-muted-foreground italic">
                              Tidak Ada
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center font-semibold text-muted-foreground">
                          {sub.expectationScore}
                        </TableCell>
                        <TableCell className="text-center font-bold text-foreground">
                          {sub.score}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              sub.status === "Memenuhi"
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-error/10 text-error border-error/20"
                            }`}
                          >
                            {sub.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {new Date(sub.createdAt).toLocaleString("id-ID", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {new Date(sub.updatedAt).toLocaleString("id-ID", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Drawer Table Pagination Controls */}
              {!isDrawerEvalsFetching && totalDrawerItems > 0 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground select-none">
                  <div>
                    Menampilkan{" "}
                    <span className="font-semibold text-foreground">
                      {startDrawerItem}
                    </span>{" "}
                    -{" "}
                    <span className="font-semibold text-foreground">
                      {endDrawerItem}
                    </span>{" "}
                    dari{" "}
                    <span className="font-semibold text-foreground">
                      {totalDrawerItems}
                    </span>{" "}
                    data
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setDrawerPage(1)}
                      disabled={drawerPage === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setDrawerPage(drawerPage - 1)}
                      disabled={drawerPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="px-2 text-xs font-medium text-foreground">
                      Halaman {drawerPage} dari {totalDrawerPages || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setDrawerPage(drawerPage + 1)}
                      disabled={
                        drawerPage === totalDrawerPages ||
                        totalDrawerPages === 0
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setDrawerPage(totalDrawerPages)}
                      disabled={
                        drawerPage === totalDrawerPages ||
                        totalDrawerPages === 0
                      }
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DrawerFooter className="px-0 pb-0 pt-4 flex flex-row justify-end gap-3 border-t border-border/40 shrink-0">
            <DrawerClose asChild>
              <Button
                variant="outline"
                className="h-8 text-xs font-semibold px-4 cursor-pointer"
              >
                Tutup
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
