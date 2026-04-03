export function Waveform() {
  return (
    <div className="waveform" aria-hidden="true">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="waveform-bar" />
      ))}
    </div>
  );
}
