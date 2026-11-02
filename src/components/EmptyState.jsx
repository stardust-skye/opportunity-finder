import { ArrowUpRight, SearchX } from "lucide-react";

function EmptyState({ onClear }) {
  return (
    <div className="empty-results">
      <span aria-hidden="true" className="empty-results-mark"><SearchX size={20} /></span>
      <h3>No opportunities match just yet.</h3>
      <p>Try a different search or remove a filter to discover more research openings.</p>
      <button className="text-link" onClick={onClear} type="button">
        Clear search and filters <ArrowUpRight aria-hidden="true" size={16} />
      </button>
    </div>
  );
}

export default EmptyState;
