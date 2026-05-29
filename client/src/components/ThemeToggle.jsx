export default function ThemeToggle({ dark, onToggle }) {
  return (
    <button className="theme-toggle" onClick={onToggle} title={dark ? '切换亮色' : '切换暗色'}>
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
