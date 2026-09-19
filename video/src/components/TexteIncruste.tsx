import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

type Props = {
  texte: string;
};

/** Le texte incrusté en bas de l'image, façon sous-titre. */
export const TexteIncruste: React.FC<Props> = ({ texte }) => {
  const frame = useCurrentFrame();
  const entree = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: "12%",
        paddingLeft: "6%",
        paddingRight: "6%",
      }}
    >
      <div
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: 48,
          fontWeight: 700,
          lineHeight: 1.3,
          color: "white",
          textAlign: "center",
          // Contour sombre : le texte reste lisible sur une image claire
          textShadow:
            "0 2px 12px rgba(0,0,0,0.55), 0 0 3px rgba(0,0,0,0.8), 0 0 3px rgba(0,0,0,0.8)",
          opacity: entree,
          transform: `translateY(${interpolate(entree, [0, 1], [18, 0])}px)`,
        }}
      >
        {texte}
      </div>
    </AbsoluteFill>
  );
};
