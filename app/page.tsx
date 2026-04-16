import StarField from "./components/StarField";
import CasinoRoulette from "./components/CasinoRoulette";

export default function Home() {
  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at center, #1a0a2e 0%, #0a0514 50%, #000008 100%)",
      }}
    >
      <StarField />
      <CasinoRoulette />
    </main>
  );
}
