"use client";

import React, { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";
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
import {
  getMutuBanptData,
  formatCategoryName,
  formatStageName,
  getSubmissionsForAspect,
} from "@/dummy-data/mutu-banpt";
import { IndicatorTab, AssessmentAspect, AspectSubmission } from "@/types/mutu-banpt";

interface MutuCategoryClientProps {
  category: string;
}

interface StageData {
  stage: string;
  indicators: IndicatorTab[];
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
  const [selectedAspect, setSelectedAspect] = useState<AssessmentAspect | null>(null);
  const [selectedStageLabel, setSelectedStageLabel] = useState<string>("");

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
    const handleActiveChange = () => {
      const storedId = localStorage.getItem("active_akreditasi_id");
      if (storedId) {
        setActiveAkredId(storedId);
        setIsLoading(true);
      }
    };

    const storedId = localStorage.getItem("active_akreditasi_id");
    if (storedId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveAkredId(storedId);
    }

    window.addEventListener("active_akreditasi_change", handleActiveChange);
    return () => window.removeEventListener("active_akreditasi_change", handleActiveChange);
  }, []);

  // Fetch all 4 stages data
  useEffect(() => {
    if (category && activeAkredId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(true);
      const stages = ["masukan", "proses", "luaran", "dampak"];
      
      const timer = setTimeout(() => {
        const list = stages.map((stg) => ({
          stage: stg,
          indicators: getMutuBanptData(category, stg, activeAkredId).indicators,
        }));
        setStageDataList(list);
        setIsLoading(false);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [category, activeAkredId]);

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

  // Safe formula evaluator
  const calculateFormula = (
    expression: string,
    variables: { name: string; value: number }[]
  ): number => {
    try {
      let evalStr = expression;
      evalStr = evalStr.replace("%", "").replace(" * 100", "");

      variables.forEach((v) => {
        const regex = new RegExp(`\\b${v.name}\\b`, "g");
        evalStr = evalStr.replace(regex, v.value.toString());
      });

      const cleanStr = evalStr.replace(/[^0-9+\-*/().\s]/g, "");
      const computed = new Function(`return (${cleanStr})`)();

      if (expression.includes("* 100") || expression.includes("%")) {
        return parseFloat((computed * 100).toFixed(2));
      }
      return parseFloat(computed.toFixed(2));
    } catch {
      return 0;
    }
  };

  const getAspectScoreText = (asp: AssessmentAspect): string => {
    if (asp.type === "radio") {
      const scoreVal = asp.score ?? 0;
      return asp.expectationFormat === "percentage" ? `${scoreVal}%` : `${scoreVal}`;
    }
    if (asp.type === "formula" && asp.formula) {
      const scoreVal = calculateFormula(asp.formula.expression, asp.formula.variables);
      return asp.expectationFormat === "percentage" ? `${scoreVal}%` : `${scoreVal}`;
    }
    return "0";
  };

  const handleRowClick = (asp: AssessmentAspect, stageKey: string) => {
    if (!canInteract) return;
    setSelectedAspect(asp);
    setSelectedStageLabel(formatStageName(stageKey));
    setIsDrawerOpen(true);
  };

  // Submissions drawer helper list
  const drawerSubmissions: AspectSubmission[] = selectedAspect ? getSubmissionsForAspect(selectedAspect.id) : [];

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
                      <TableHead className="w-24"><Skeleton className="h-4 w-12 bg-muted/40" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-28 bg-muted/40" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-36 bg-muted/40" /></TableHead>
                      <TableHead className="w-20 text-right"><Skeleton className="h-4 w-8 ml-auto bg-muted/40" /></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[1, 2].map((j) => (
                      <TableRow key={j}>
                        <TableCell><Skeleton className="h-4 w-16 bg-muted/40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-3/4 bg-muted/40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-5/6 bg-muted/40" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-8 ml-auto bg-muted/40" /></TableCell>
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
              ind.aspects.map((asp) => ({
                ...asp,
                indicatorTitle: ind.title,
              }))
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
                        <TableHead className="w-28 font-bold text-foreground">Indikator</TableHead>
                        <TableHead className="font-bold text-foreground">Aspek Penilaian</TableHead>
                        <TableHead className="font-bold text-foreground">Deskripsi Pemenuhan</TableHead>
                        <TableHead className="w-24 text-right font-bold text-foreground">Skor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allAspects.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-6 italic">
                            Belum ada aspek penilaian terdaftar untuk tahap ini.
                          </TableCell>
                        </TableRow>
                      ) : (
                        allAspects.map((asp) => (
                          <TableRow
                            key={asp.id}
                            onClick={(): void => handleRowClick(asp, stageData.stage)}
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
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} direction="bottom">
        <DrawerContent className="max-h-[92vh] h-[92vh] p-6 bg-card border-t border-border text-xs flex flex-col">
          <DrawerHeader className="px-0 pt-0">
            <DrawerTitle className="text-sm font-bold text-foreground lowercase first-letter:uppercase">
              {selectedStageLabel} {catLabel}
            </DrawerTitle>
            <DrawerDescription className="text-xs text-muted-foreground">
              Daftar rekapitulasi data pengisi indikator dari berbagai program studi/unit kerja.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 no-scrollbar overflow-y-auto px-1 py-4">
            <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead className="font-bold text-foreground">Nama</TableHead>
                    <TableHead className="font-bold text-foreground">Bukti</TableHead>
                    <TableHead className="w-32 text-center font-bold text-foreground">Expectation Score</TableHead>
                    <TableHead className="w-20 text-center font-bold text-foreground">Skor</TableHead>
                    <TableHead className="w-24 text-center font-bold text-foreground">Status</TableHead>
                    <TableHead className="w-32 text-center font-bold text-foreground">Created At</TableHead>
                    <TableHead className="w-32 text-center font-bold text-foreground">Updated At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drawerSubmissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-6 italic">
                        Belum ada data pengisi masuk.
                      </TableCell>
                    </TableRow>
                  ) : (
                    drawerSubmissions.map((sub) => (
                      <TableRow key={sub.id} className="hover:bg-muted/10">
                        <TableCell className="font-semibold text-foreground">
                          {sub.nama}
                        </TableCell>
                        <TableCell>
                          <a
                            href={sub.bukti}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e): void => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-primary hover:underline font-semibold text-xs cursor-pointer"
                          >
                            Kunjungi Bukti
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </TableCell>
                        <TableCell className="text-center font-semibold text-muted-foreground">
                          {sub.expectationScore}
                        </TableCell>
                        <TableCell className="text-center font-bold text-foreground">
                          {sub.score}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/10 text-success border border-success/20">
                            {sub.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {sub.createdAt}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {sub.updatedAt}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <DrawerFooter className="px-0 pb-0 pt-4 flex flex-row justify-end gap-3 border-t border-border/40 shrink-0">
            <DrawerClose asChild>
              <Button variant="outline" className="h-8 text-xs font-semibold px-4 cursor-pointer">
                Tutup
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
