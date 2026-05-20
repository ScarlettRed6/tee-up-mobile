import './AdminSkeletons.css';

function Sk({ className = '', style }) {
  return <div className={`admin-skel ${className}`.trim()} style={style} aria-hidden />;
}

/** Brief auth bootstrap — neutral (used in App.jsx for all users). */
export function AuthCheckLoadingSkeleton() {
  return (
    <div className="auth-check-loading" role="status" aria-label="Loading">
      <div className="auth-check-loading__inner">
        <Sk style={{ width: 140, height: 40, marginBottom: 28, borderRadius: 10 }} />
        <Sk style={{ width: '100%', height: 10, marginBottom: 10 }} />
        <Sk style={{ width: '72%', height: 10 }} />
      </div>
    </div>
  );
}

/** Full admin shell preview while loading (optional). */
export function AdminAuthLoadingSkeleton() {
  return (
    <div className="admin-auth-loading" role="status" aria-label="Loading admin panel">
      <header className="admin-auth-loading__header">
        <Sk style={{ width: 120, height: 32 }} />
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Sk style={{ width: 64, height: 16 }} />
          <Sk style={{ width: 64, height: 16 }} />
          <Sk className="admin-skel--circle" style={{ width: 40, height: 40 }} />
        </div>
      </header>

      <aside className="admin-auth-loading__sidebar">
        <div className="admin-skel-block" style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <Sk className="admin-skel--circle" style={{ width: 48, height: 48 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Sk style={{ width: '70%', height: 14 }} />
            <Sk style={{ width: '45%', height: 12 }} />
          </div>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <Sk key={i} style={{ width: '100%', height: 40, borderRadius: 8 }} />
        ))}
      </aside>

      <main className="admin-auth-loading__main">
        <AdminDashboardSkeleton embedded />
      </main>
    </div>
  );
}

/** Dashboard metrics + cards — use inside .dashboard or auth loading main. */
export function AdminDashboardSkeleton({ embedded = false, bodyOnly = false }) {
  const content = (
    <>
      {!embedded && !bodyOnly && (
        <header style={{ marginBottom: 'var(--spacing-4xl)' }}>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back! Here&apos;s what&apos;s happening with your platform.</p>
        </header>
      )}

      {embedded && !bodyOnly && (
        <div style={{ marginBottom: 'var(--spacing-4xl)' }}>
          <Sk style={{ width: 200, height: 36, marginBottom: 8 }} />
          <Sk style={{ width: 380, maxWidth: '100%', height: 16 }} />
        </div>
      )}

      <div className="admin-dashboard-skel__metrics">
        {[1, 2, 3].map((i) => (
          <div key={i} className="admin-skel-block admin-dashboard-skel__metric-card">
            <div className="admin-dashboard-skel__metric-top">
              <Sk className="admin-skel--circle" style={{ width: 48, height: 48, borderRadius: 12 }} />
            </div>
            <Sk style={{ width: '55%', height: 12 }} />
            <Sk style={{ width: '40%', height: 36 }} />
          </div>
        ))}
      </div>

      <div className="admin-dashboard-skel__content-grid">
        <div className="admin-skel-block admin-dashboard-skel__info-card">
          <div className="admin-dashboard-skel__card-header">
            <Sk style={{ width: 120, height: 22 }} />
            <Sk style={{ width: 72, height: 16 }} />
          </div>
          <div className="admin-dashboard-skel__list">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="admin-dashboard-skel__list-row">
                <Sk className="admin-skel--circle" style={{ width: 32, height: 32 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Sk style={{ width: '60%', height: 14 }} />
                  <Sk style={{ width: '35%', height: 12 }} />
                </div>
                <Sk className="admin-skel--pill" style={{ width: 56, height: 28 }} />
              </div>
            ))}
          </div>
        </div>

        <div className="admin-skel-block admin-dashboard-skel__info-card">
          <div className="admin-dashboard-skel__card-header">
            <Sk style={{ width: 140, height: 22 }} />
            <Sk style={{ width: 72, height: 16 }} />
          </div>
          <div className="admin-dashboard-skel__list">
            {[1, 2].map((i) => (
              <div key={i} className="admin-dashboard-skel__flagged-row">
                <Sk style={{ width: 40, height: 40, borderRadius: 12 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Sk style={{ width: 48, height: 24 }} />
                  <Sk style={{ width: 72, height: 12 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  if (embedded || bodyOnly) return content;

  return (
    <div className="dashboard" role="status" aria-label="Loading dashboard">
      {content}
    </div>
  );
}

const TABLE_PRESETS = {
  users: { columns: 9, actionButtons: 2, filterSelects: 2, filterGroups: 0 },
  listings: { columns: 11, actionButtons: 1, filterSelects: 0, filterGroups: 4 },
  reports: { columns: 9, actionButtons: 0, filterSelects: 2, filterGroups: 0, showSubtitle: true, showSummary: true },
};

/** Users / Listings / Reports table layout skeleton. */
export function AdminTablePageSkeleton({
  variant = 'users',
  pageClassName,
  rows = 6,
}) {
  const preset = TABLE_PRESETS[variant] || TABLE_PRESETS.users;
  const {
    columns,
    actionButtons,
    filterSelects,
    filterGroups,
    showSubtitle = false,
    showSummary = false,
  } = preset;

  const gridCols = `repeat(${columns}, minmax(60px, 1fr))`;
  const pageClass =
    pageClassName ||
    { users: 'users-page', listings: 'listings-page', reports: 'reports-page' }[variant] ||
    'users-page';

  return (
    <div className={pageClass} role="status" aria-label="Loading page">
      <div className="admin-table-skel__header">
        <div>
          <Sk style={{ width: variant === 'listings' ? 260 : 240, height: 36, marginBottom: showSubtitle ? 8 : 0 }} />
          {showSubtitle && <Sk style={{ width: 280, height: 16 }} />}
        </div>
        {actionButtons > 0 && (
          <div className="admin-table-skel__header-actions">
            {Array.from({ length: actionButtons }).map((_, i) => (
              <Sk key={i} style={{ width: i === 0 && variant === 'users' ? 200 : 160, height: 46, borderRadius: 12 }} />
            ))}
          </div>
        )}
      </div>

      <div className="admin-table-skel__filters">
        <Sk style={{ width: '100%', maxWidth: 500, height: 46 }} />
        {filterGroups > 0 ? (
          <div className="admin-table-skel__filters-row">
            {Array.from({ length: filterGroups }).map((_, i) => (
              <div key={i} className="admin-table-skel__filter-group">
                <Sk style={{ width: 72, height: 12 }} />
                <Sk style={{ width: 160, height: 44 }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="admin-table-skel__filters-row">
            {Array.from({ length: filterSelects }).map((_, i) => (
              <Sk key={i} style={{ width: 180, height: 44 }} />
            ))}
          </div>
        )}
      </div>

      <div className="admin-skel-block admin-table-skel__table-wrap">
        <div className="admin-table-skel__table-head" style={{ gridTemplateColumns: gridCols }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Sk key={i} style={{ height: 14, width: i === 0 ? '70%' : '85%' }} />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="admin-table-skel__table-row"
            style={{ gridTemplateColumns: gridCols }}
          >
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Sk
                key={colIdx}
                style={{
                  height: colIdx === 0 ? 14 : 12,
                  width: colIdx === columns - 1 ? '50%' : '90%',
                }}
              />
            ))}
          </div>
        ))}
        <div className="admin-table-skel__pagination">
          <Sk style={{ width: 140, height: 14 }} />
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Sk style={{ width: 88, height: 36, borderRadius: 8 }} />
            <Sk style={{ width: 100, height: 14 }} />
            <Sk style={{ width: 72, height: 36, borderRadius: 8 }} />
          </div>
        </div>
      </div>

      {showSummary && (
        <div className="admin-table-skel__summary">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="admin-table-skel__summary-item">
              <Sk style={{ width: 90, height: 12 }} />
              <Sk style={{ width: 48, height: 24 }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** @deprecated Use AdminTablePageSkeleton — kept for existing imports */
export default function PageLoadingSkeleton(props) {
  return <AdminTablePageSkeleton variant="users" rows={props?.rows ?? 6} pageClassName="users-page" />;
}
