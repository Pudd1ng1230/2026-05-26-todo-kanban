export default function Card({ title, description, status }) {
  return (
    <div className={`card status-${status}`}>
      <div className="card-title">{title}</div>
      {description && <div className="card-desc">{description}</div>}
    </div>
  );
}
