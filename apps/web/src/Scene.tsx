import { Canvas } from "@react-three/fiber";
import type { PlayerView } from "game-engine";
import type { Card as CardModel } from "shared";
import { Card3D } from "./Card3D.js";

const CARD_BASE_Y = 0.03;

function centeredRow(count: number, spacing: number): number[] {
  const totalWidth = (count - 1) * spacing;
  return Array.from({ length: count }, (_, i) => i * spacing - totalWidth / 2);
}

export function Scene({
  view,
  mode,
  giveSelection,
  takeSelection,
  onMarketClick,
  onHandClick,
  onCamelClick,
}: {
  view: PlayerView;
  mode: "none" | "exchange" | "sell";
  giveSelection: CardModel[];
  takeSelection: CardModel[];
  onMarketClick: (card: CardModel) => void;
  onHandClick: (card: CardModel) => void;
  onCamelClick: (card: CardModel) => void;
}) {
  const marketXs = centeredRow(view.market.length, 1.25);
  const handXs = centeredRow(view.myHand.length, 1.05);
  const opponentXs = centeredRow(view.opponentHandCount, 0.55);

  return (
    <Canvas shadows camera={{ position: [0, 8, 6.5], fov: 38 }}>
      <color attach="background" args={["#1d3f2f"]} />
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[3, 8, 4]}
        intensity={1.3}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* table */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color="#2f6b4f" />
      </mesh>

      {/* market, center of the table */}
      {view.market.map((card, i) => (
        <Card3D
          key={card.id}
          card={card}
          position={[marketXs[i]!, CARD_BASE_Y, 0]}
          selected={
            mode === "exchange" && takeSelection.some((c) => c.id === card.id)
          }
          onClick={() => onMarketClick(card)}
        />
      ))}

      {/* your hand, closest to the camera */}
      {view.myHand.map((card, i) => (
        <Card3D
          key={card.id}
          card={card}
          position={[handXs[i]!, CARD_BASE_Y, 3.2]}
          selected={giveSelection.some((c) => c.id === card.id)}
          onClick={mode !== "none" ? () => onHandClick(card) : undefined}
        />
      ))}

      {/* your camel herd: expanded during exchange, a single pile otherwise */}
      {mode === "exchange"
        ? view.myCamelHerd.map((card, i) => (
            <Card3D
              key={card.id}
              card={card}
              position={[3.3 + i * 0.18, CARD_BASE_Y, 3.2]}
              selected={giveSelection.some((c) => c.id === card.id)}
              onClick={() => onCamelClick(card)}
            />
          ))
        : view.myCamelHerd[0] && (
            <Card3D
              card={view.myCamelHerd[0]}
              position={[3.3, CARD_BASE_Y, 3.2]}
            />
          )}

      {/* opponent's hand, face-down, far side of the table */}
      {opponentXs.map((x, i) => (
        <Card3D
          key={`opponent-hand-${i}`}
          faceDown
          position={[x, CARD_BASE_Y, -3.2]}
        />
      ))}

      {/* opponent's camel herd, face-down pile */}
      {view.opponentCamelHerdCount > 0 && (
        <Card3D faceDown position={[3.3, CARD_BASE_Y, -3.2]} />
      )}
    </Canvas>
  );
}
