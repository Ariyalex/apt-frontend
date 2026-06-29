import React from "react";
import MutuBanptClientPage from "@/components/dashboard/mutu-banpt/mutu-banpt-client";

interface PageProps {
  params: Promise<{ category: string; stage: string }>;
}

export default async function Page({ params }: PageProps): Promise<React.JSX.Element> {
  const { category, stage } = await params;
  return <MutuBanptClientPage category={category} stage={stage} />;
}
