interface Stats {
    momentumChange: { x: number; y: number; z: number };
    energyChange: number;
    velocities: Array<{ x: number; y: number; z: number }>;
  }
  
  interface StatsDisplayProps {
    stats: Stats | null;
  }
  
  const StatsDisplay = ({ stats }: StatsDisplayProps) => {
    if (!stats) return null;
  
    const formatNumber = (num: number) => {
      const formatted = Math.abs(num).toFixed(4);
      return (
        <span className="inline-flex w-20 justify-end katex-font">
          {num < 0 ? "−" : ""}
          {formatted}
        </span>
      );
    };
  
    return (
      <div className="w-full overflow-x-auto">
        <style>
          {`
            @import url('https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css');
            .katex-font {
              font-family: KaTeX_Main, serif;
            }
          `}
        </style>
        <div className="inline-flex min-w-max gap-x-6 text-zinc-300 katex-font">
          {/* Right Column: Velocities */}
          <div className="space-y-2">
            {stats.velocities.map((velocity, i) => (
              <div key={i} className="text-lg flex items-baseline">
                <span className="font-semibold math-italic mr-2">
                  v<sub>{i + 1}</sub>:
                </span>
                <span className="whitespace-nowrap">
                  (<span className="contents">{formatNumber(velocity.x)}</span>,
                  <span className="contents">{formatNumber(velocity.y)}</span>,
                  <span className="contents">{formatNumber(velocity.z)}</span>)
                </span>
              </div>
            ))}
          </div>
          {/* Left Column: Momentum & Energy */}
          <div className="space-y-2">
            <div className="text-lg flex items-baseline">
              <span className="mr-2">Δp:</span>
              <span className="whitespace-nowrap">
                (
                <span className="contents">
                  {formatNumber(stats.momentumChange.x)}
                </span>
                ,
                <span className="contents">
                  {formatNumber(stats.momentumChange.y)}
                </span>
                ,
                <span className="contents">
                  {formatNumber(stats.momentumChange.z)}
                </span>
                )
              </span>
            </div>
            <div className="text-lg flex items-baseline">
              <span className="mr-2">ΔE:</span>
              {formatNumber(stats.energyChange)}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default StatsDisplay;