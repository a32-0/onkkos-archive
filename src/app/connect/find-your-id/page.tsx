import type { Metadata } from "next";
import { PAGE_TITLES } from "@/content/app";
import { FindId } from "@/screens/connect/FindId";

export const metadata: Metadata = { title: PAGE_TITLES.findId };

export default function FindIdPage() {
  return <FindId />;
}
