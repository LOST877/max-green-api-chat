const COLORS = ['#f4a340', '#e5566a', '#8a63f0', '#3f9df2', '#34b37a', '#e46fc2'];

export default function Avatar({ name }: { name: string }) {
  const letter = name.replace(/^\+/, '').trim().charAt(0).toUpperCase() || '?';
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return (
    <div className="avatar" style={{ background: COLORS[Math.abs(hash) % COLORS.length] }}>
      {letter}
    </div>
  );
}
