import React from "react";
import MutuCategoryClientPage from "@/components/dashboard/mutu-banpt/mutu-category-client";

interface PageProps {
  params: Promise<{ category: string }>;
}

export default async function Page({ params }: PageProps): Promise<React.JSX.Element> {
  const { category } = await params;
  return <MutuCategoryClientPage category={category} />;
}
