import { useState, useEffect } from "react";

export default function Player({ player, isCurrentPlayer }) {
  const balloonColors = ["red", "blue"];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const animationInterval = setInterval(() => {
      setStep((prevStep) => (prevStep + 1) % 60);
    }, 50);

    return () => clearInterval(animationInterval);
  }, []);

  const characterColor = isCurrentPlayer ? "#FFD700" : "#A0A0A0";

  return (
    <div
      className="absolute"
      style={{
        left: `${player.x}px`,
        top: `${player.y}px`,
        width: "32px",
        height: "48px",
        transition: "left 0.1s, top 0.1s",
      }}
    >
      {/* Personaje 16 bits en SVG */}
      <svg width="32" height="48" viewBox="0 0 32 48">
        {/* Cuerpo */}
        <rect x="8" y="16" width="16" height="24" fill={characterColor} />

        {/* Cabeza */}
        <rect x="8" y="4" width="16" height="12" fill={characterColor} />

        {/* Ojos */}
        <rect x="12" y="8" width="2" height="2" fill="black" />
        <rect x="18" y="8" width="2" height="2" fill="black" />

        {/* Piernas */}
        <rect
          x="8"
          y="40"
          width="6"
          height="8"
          fill={characterColor}
          transform={`translate(0,${(step % 2) * 2})`}
        />
        <rect
          x="18"
          y="40"
          width="6"
          height="8"
          fill={characterColor}
          transform={`translate(0,${((step + 1) % 2) * 2})`}
        />

        {/* Brazos */}
        <rect
          x="4"
          y="18"
          width="4"
          height="12"
          fill={characterColor}
          transform={`rotate(${Math.sin((step * Math.PI) / 2) * 15}, 6, 18)`}
        />
        <rect
          x="24"
          y="18"
          width="4"
          height="12"
          fill={characterColor}
          transform={`rotate(${-Math.sin((step * Math.PI) / 2) * 15}, 26, 18)`}
        />
      </svg>
      {/* Balloons */}
      {[0, 1].map(
        (index) =>
          player.balloons[index] && (
            <div key={index}>
              <div
                style={{
                  position: "absolute",
                  bottom: "48px",
                  left: index === 0 ? "-12px" : "28px",
                  width: "24px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: balloonColors[index],
                  zIndex: 10,
                }}
              ></div>
              {/* Hilo del globo */}
              <div
                style={{
                  position: "absolute",
                  bottom: "48px",
                  left: index === 0 ? "0px" : "40px",
                  width: "1px",
                  height: "20px",
                  backgroundColor: " ",
                  zIndex: 9,
                }}
              ></div>
            </div>
          )
      )}

      <div
        style={{
          position: "absolute",
          bottom: "-20px",
          left: "0",
          width: "32px",
          height: "10px",
          backgroundColor: "#808080",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "flex-end",
          overflow: "hidden",
        }}
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              width: "4px",
              height: "6px",
              backgroundColor: "#606060",
              transform: `translateY(${
                Math.sin(((step + i) * Math.PI) / 2) * 2
              }px)`,
            }}
          />
        ))}
      </div>

      {/* Sierra circular con puntaje */}
      <div 
        style={{
          position: 'absolute',
          bottom: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#808080',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'visible'
        }}
      >
        {/* Dientes de la sierra */}
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            style={{
              position: 'absolute',
              width: '0',
              height: '0',
              borderLeft: '2px solid transparent',
              borderRight: '2px solid transparent',
              borderTop: '4px solid #606060',
              transformOrigin: '2px 22px',
              transform: `rotate(${i * 18 + step * 6}deg) translateY(-22px)`
            }}
          />
        ))}
        {/* Puntaje */}
        <div 
          style={{
            fontSize: '12px',
            fontWeight: 'bold',
            color: 'white',
            zIndex: 1
          }}
        >
          {player.score}
        </div>
      </div>
    </div>
  );
}
