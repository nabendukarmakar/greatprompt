export function Tag({ children, color = 'var(--muted)', bg = 'var(--surface2)', style }) {
  return (
    <span
      className="tag"
      style={{ color, background: bg, border: `1px solid ${color}`, ...style }}
    >
      {children}
    </span>
  );
}
