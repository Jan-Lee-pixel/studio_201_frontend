import { PortfolioItem } from "@/features/portfolio/services/portfolioService";

interface PortfolioListProps {
  items: PortfolioItem[];
  loading: boolean;
  onTogglePublic?: (item: PortfolioItem) => void;
  onDelete?: (item: PortfolioItem) => void;
}

export function PortfolioList({ items, loading, onTogglePublic, onDelete }: PortfolioListProps) {
  return (
    <div className="card" id="portfolio-items">
      <div className="card-header">
        <h2 className="card-title">Portfolio</h2>
      </div>
      <div className="artwork-list">
        {loading ? (
          <p className="p-4 text-sm text-gray-400 font-dm-mono">Loading portfolio…</p>
        ) : items.length === 0 ? (
          <div className="p-6 text-center" style={{ color: "var(--warm-mid)", fontSize: "12px" }}>
            <p>No portfolio items yet.</p>
            <p style={{ marginTop: "6px" }}>Upload a showcase artwork to appear on your public profile.</p>
          </div>
        ) : (
          items.map((item) => (
            <div className="artwork-row" key={item.id}>
              <div className="artwork-thumb">
                {item.mediaAssetUrl ? (
                  <img src={item.mediaAssetUrl} alt={item.title} className="artwork-thumb-image" />
                ) : (
                  <div
                    className="artwork-thumb-gradient"
                    style={{ background: "linear-gradient(135deg, var(--warm-sand), var(--terracotta))" }}
                  ></div>
                )}
              </div>
              <div className="artwork-info">
                <p className="artwork-title">{item.title}</p>
                <p className="artwork-meta">
                  {[item.year, item.medium, item.dimensions].filter(Boolean).join(" · ") || "Portfolio item"}
                </p>
              </div>
              <span className={`artwork-status ${item.isPublic ? "status-approved" : "status-draft"}`}>
                {item.isPublic ? "Public" : "Private"}
              </span>
              {(onTogglePublic || onDelete) && (
                <div className="artwork-actions">
                  {onTogglePublic && (
                    <button
                      className="action-btn"
                      title={item.isPublic ? "Make Private" : "Make Public"}
                      onClick={() => onTogglePublic(item)}
                    >
                      {item.isPublic ? "🙈" : "👁"}
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="action-btn"
                      title="Delete"
                      onClick={() => onDelete(item)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
