import { useTexture } from "@react-three/drei";
import type { Card as CardModel } from "shared";
import { assets } from "./assets.js";

const CARD_WIDTH = 1;
const CARD_HEIGHT = 1.4;
const CARD_DEPTH = 0.06;
const EDGE_COLOR = "#efe6c8";

type Card3DProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
  selected?: boolean;
  onClick?: () => void;
} & ({ faceDown: true; card?: CardModel } | { faceDown?: false; card: CardModel });

export function Card3D(props: Card3DProps) {
  const { position, rotation = [0, 0, 0], selected = false, onClick } = props;

  const frontImage =
    props.faceDown || !props.card
      ? assets.cardBack
      : assets.cards[props.card.type].image;

  const frontTexture = useTexture(frontImage);
  const backTexture = useTexture(assets.cardBack);

  return (
    <group position={position} rotation={rotation}>
      <mesh
        castShadow
        receiveShadow
        position={[0, selected ? 0.18 : 0, 0]}
        onClick={
          onClick
            ? (event) => {
                event.stopPropagation();
                onClick();
              }
            : undefined
        }
        onPointerOver={
          onClick
            ? (event) => {
                event.stopPropagation();
                document.body.style.cursor = "pointer";
              }
            : undefined
        }
        onPointerOut={
          onClick ? () => (document.body.style.cursor = "auto") : undefined
        }
      >
        <boxGeometry args={[CARD_WIDTH, CARD_DEPTH, CARD_HEIGHT]} />
        <meshStandardMaterial attach="material-0" color={EDGE_COLOR} />
        <meshStandardMaterial attach="material-1" color={EDGE_COLOR} />
        <meshStandardMaterial attach="material-2" map={frontTexture} />
        <meshStandardMaterial attach="material-3" map={backTexture} />
        <meshStandardMaterial attach="material-4" color={EDGE_COLOR} />
        <meshStandardMaterial attach="material-5" color={EDGE_COLOR} />
      </mesh>
      {selected && (
        <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.62, 0.7, 32]} />
          <meshBasicMaterial color="#02bbf7" />
        </mesh>
      )}
    </group>
  );
}
