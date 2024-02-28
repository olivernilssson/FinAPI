import { LandingHeader } from "@/components/sparkles";
import HoverCard from "@/components/hover-card";

export default function Home() {
  return (
    <main className="items-center flex flex-col justify-between gap-y-16">
      <LandingHeader />
      <HoverCard />
    </main>
  );
}
