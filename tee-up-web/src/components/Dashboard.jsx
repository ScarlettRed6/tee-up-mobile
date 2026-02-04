import './Dashboard.css';

function Dashboard() {
  const topSellers = [
    { name: 'LebronJmaes123', rating: 4.9, sales: 128 },
    { name: 'hockeyops', rating: 4.9, sales: 95 },
    { name: 'scottiescheflerfan312', rating: 4.7, sales: 67 },
    { name: 'ilovegolf543', rating: 4.7, sales: 42 },
  ];

  const flaggedListings = {
    review: 50,
    pending: 12,
    complete: 80,
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back! Here's what's happening with your platform.</p>
      </div>
      
      <div className="metrics-grid">
        <div className="metric-card metric-card-users">
          <div className="metric-card-header">
            <div className="metric-icon metric-icon-users">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="metric-content">
            <div className="metric-label">Total Users</div>
            <div className="metric-value">54</div>
          </div>
        </div>
        
        <div className="metric-card metric-card-active">
          <div className="metric-card-header">
            <div className="metric-icon metric-icon-active">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="metric-content">
            <div className="metric-label">Active Users</div>
            <div className="metric-value">1,350</div>
          </div>
        </div>
        
        <div className="metric-card metric-card-listings">
          <div className="metric-card-header">
            <div className="metric-icon metric-icon-listings">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="9" y1="3" x2="9" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="metric-content">
            <div className="metric-label">Total Listings</div>
            <div className="metric-value">1,000</div>
          </div>
        </div>
      </div>
      
      <div className="content-grid">
        <div className="info-card">
          <div className="card-header">
            <h3 className="card-title">Top Sellers</h3>
            <button className="card-action">View All</button>
          </div>
          <ul className="seller-list">
            {topSellers.map((seller, index) => (
              <li key={index} className="seller-item">
                <div className="seller-rank-badge">{index + 1}</div>
                <div className="seller-info">
                  <div className="seller-name">{seller.name}</div>
                  <div className="seller-stats">{seller.sales} sales</div>
                </div>
                <div className="seller-rating-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span>{seller.rating}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="info-card">
          <div className="card-header">
            <h3 className="card-title">Flagged Listings</h3>
            <button className="card-action">View All</button>
          </div>
          <div className="flagged-list">
            <div className="flagged-item flagged-review">
              <div className="flagged-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flagged-content">
                <div className="flagged-count">{flaggedListings.review}</div>
                <div className="flagged-label">In Review</div>
              </div>
            </div>
            
            <div className="flagged-item flagged-pending">
              <div className="flagged-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flagged-content">
                <div className="flagged-count">{flaggedListings.pending}</div>
                <div className="flagged-label">Pending</div>
              </div>
            </div>
            
            <div className="flagged-item flagged-complete">
              <div className="flagged-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flagged-content">
                <div className="flagged-count">{flaggedListings.complete}</div>
                <div className="flagged-label">Complete</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

