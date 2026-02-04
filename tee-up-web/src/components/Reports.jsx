import { useState, useEffect, useRef } from 'react';
import { getAllReports, reviewReport } from '../api/reportsApi';
import './Reports.css';

function Reports() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const [showReportDetailsModal, setShowReportDetailsModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const dropdownRefs = useRef({});
  const buttonRefs = useRef({});

  // Fetch reports from API
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const status = statusFilter === 'all' ? '' : statusFilter;
      const type = typeFilter === 'all' ? '' : (typeFilter === 'user' ? 'User' : typeFilter === 'listing' ? 'Listing' : '');
      const response = await getAllReports(searchTerm, status, type);
      setReports(response.result || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.response?.data?.error || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  // Fetch reports on mount and when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchReports();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, typeFilter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest('.actions-dropdown-menu') || 
          event.target.closest('.dropdown-item') ||
          event.target.closest('.actions-dropdown-toggle')) {
        return;
      }
      
      if (openDropdown !== null) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const toggleDropdown = (reportId, event) => {
    event?.stopPropagation();
    if (openDropdown === reportId) {
      setOpenDropdown(null);
    } else {
      // Calculate position for dropdown
      const button = event?.currentTarget || buttonRefs.current[reportId];
      if (button) {
        const rect = button.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right
        });
      }
      setOpenDropdown(reportId);
    }
  };

  const handleResolve = async (reportId) => {
    if (!window.confirm('Are you sure you want to resolve this report?')) {
      setOpenDropdown(null);
      return;
    }

    try {
      setActionLoading(reportId);
      await reviewReport(reportId, 'resolved');
      await fetchReports();
      setOpenDropdown(null);
    } catch (err) {
      console.error('Error resolving report:', err);
      alert(err.response?.data?.error || 'Failed to resolve report');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismiss = async (reportId) => {
    if (!window.confirm('Are you sure you want to dismiss this report?')) {
      setOpenDropdown(null);
      return;
    }

    try {
      setActionLoading(reportId);
      await reviewReport(reportId, 'dismissed');
      await fetchReports();
      setOpenDropdown(null);
    } catch (err) {
      console.error('Error dismissing report:', err);
      alert(err.response?.data?.error || 'Failed to dismiss report');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (report) => {
    setOpenDropdown(null);
    setSelectedReport(report);
    setShowReportDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    const statusClass = `status-badge status-${status}`;
    return (
      <span className={statusClass}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    if (!type) return null;
    const typeClass = `type-badge type-${type}`;
    return (
      <span className={typeClass}>
        {type === 'user' ? 'User' : 'Listing'}
      </span>
    );
  };

  // Map backend data structure to frontend format
  const mapReportData = (report) => {
    const isListing = report.report_type === 'Listing';
    // Parse listing images if it's a JSON string
    let listingImages = [];
    if (report.reported_listing_image) {
      try {
        listingImages = typeof report.reported_listing_image === 'string' 
          ? JSON.parse(report.reported_listing_image) 
          : report.reported_listing_image;
        if (!Array.isArray(listingImages)) {
          listingImages = [];
        }
      } catch (e) {
        listingImages = [];
      }
    }
    
    return {
      id: report.report_id,
      report_id: report.report_id,
      reported_type: isListing ? 'listing' : 'user',
      reported_id: isListing ? report.reported_listing_id : report.reported_user_id,
      reported_title: isListing ? report.reported_listing_title : report.reported_user_name,
      reporter_id: report.reporter_id,
      reporter_name: report.reporter_name,
      reporter_email: report.reporter_email,
      reason: report.reason,
      status: report.status,
      reviewed_by: report.reviewer_name,
      reviewed_by_role: report.reviewer_role,
      reviewed_at: report.reviewed_at,
      created_at: report.created_at,
      photo_url: report.photo_url,
      reported_listing_image: listingImages
    };
  };

  // Sort reports
  const sortedReports = [...reports]
    .map(mapReportData)
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'id':
          aValue = a.report_id;
          bValue = b.report_id;
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  if (loading) {
    return (
      <div className="reports-page">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          fontSize: '16px',
          color: '#666'
        }}>
          Loading reports...
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1 className="page-title">Reports Management</h1>
        <p className="page-subtitle">Review and manage user reports</p>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#FEE2E2',
          color: '#DC2626',
          padding: '12px 16px',
          borderRadius: '12px',
          marginBottom: '16px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {error}
        </div>
      )}

      <div className="reports-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="filters-row">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>

          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="user">User Reports</option>
            <option value="listing">Listing Reports</option>
          </select>
        </div>
      </div>

      <div className="reports-table-container">
        <table className="reports-table">
          <thead>
            <tr>
              <th 
                className={`sortable ${sortBy === 'id' ? 'sorted' : ''}`}
                onClick={() => handleSort('id')}
              >
                Report ID {getSortIcon('id')}
              </th>
              <th>Type</th>
              <th>Reported Item</th>
              <th>Reporter</th>
              <th>Reason</th>
              <th 
                className={`sortable ${sortBy === 'status' ? 'sorted' : ''}`}
                onClick={() => handleSort('status')}
              >
                Status {getSortIcon('status')}
              </th>
              <th>Reviewed By</th>
              <th 
                className={`sortable ${sortBy === 'created_at' ? 'sorted' : ''}`}
                onClick={() => handleSort('created_at')}
              >
                Created Date {getSortIcon('created_at')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedReports.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-results">
                  No reports found matching your criteria.
                </td>
              </tr>
            ) : (
              sortedReports.map((report) => (
                <tr key={report.id}>
                  <td className="report-id">R{report.report_id}</td>
                  <td>
                    <span className={`type-badge type-${report.reported_type}`}>
                      {report.reported_type === 'user' ? 'User' : 'Listing'}
                    </span>
                  </td>
                  <td className="reported-item">
                    <div className="item-name">{report.reported_title}</div>
                    <div className="item-id">ID: {report.reported_id}</div>
                  </td>
                  <td>
                    <div className="reporter-name">{report.reporter_name}</div>
                    <div className="reporter-id">ID: {report.reporter_id}</div>
                  </td>
                  <td className="reason-cell">
                    <div className="reason-text" title={report.reason}>
                      {report.reason.length > 50 
                        ? `${report.reason.substring(0, 50)}...` 
                        : report.reason}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge status-${report.status}`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    {report.reviewed_by ? (
                      <div>
                        <div className="reviewer-name">{report.reviewed_by}</div>
                        {report.reviewed_by_role && (
                          <div className="reviewer-role">
                            {report.reviewed_by_role === 'superadmin' ? 'Super Admin' : 
                             report.reviewed_by_role === 'admin' ? 'Admin' : 
                             report.reviewed_by_role}
                          </div>
                        )}
                        <div className="review-date">{formatDate(report.reviewed_at)}</div>
                      </div>
                    ) : (
                      <span className="not-reviewed">Not reviewed</span>
                    )}
                  </td>
                  <td>{formatDate(report.created_at)}</td>
                  <td>
                    <div 
                      className="actions-dropdown-container"
                      ref={el => dropdownRefs.current[report.id] = el}
                    >
                      <button
                        className="actions-dropdown-toggle"
                        ref={el => buttonRefs.current[report.id] = el}
                        onClick={(e) => toggleDropdown(report.id, e)}
                        disabled={actionLoading === report.id}
                        aria-label="Actions"
                      >
                        {actionLoading === report.id ? (
                          <span>...</span>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <circle cx="10" cy="4" r="1.5"/>
                            <circle cx="10" cy="10" r="1.5"/>
                            <circle cx="10" cy="16" r="1.5"/>
                          </svg>
                        )}
                      </button>
                      {openDropdown === report.id && (
                        <div 
                          className="actions-dropdown-menu"
                          style={{
                            position: 'fixed',
                            top: `${dropdownPosition.top}px`,
                            right: `${dropdownPosition.right}px`,
                            zIndex: 9999
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button 
                            className="dropdown-item" 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleViewDetails(report);
                            }}
                          >
                            View Details
                          </button>
                          {(report.status === 'pending' || report.status === 'reviewed') && (
                            <>
                              <button 
                                className="dropdown-item" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleResolve(report.report_id);
                                }}
                                disabled={actionLoading === report.id}
                              >
                                Resolve
                              </button>
                              <button 
                                className="dropdown-item" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDismiss(report.report_id);
                                }}
                                disabled={actionLoading === report.id}
                              >
                                Dismiss
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="reports-summary">
        <div className="summary-item">
          <span className="summary-label">Total Reports:</span>
          <span className="summary-value">{reports.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Pending:</span>
          <span className="summary-value status-pending">
            {reports.filter(r => r.status === 'pending').length}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Reviewed:</span>
          <span className="summary-value status-reviewed">
            {reports.filter(r => r.status === 'reviewed').length}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Resolved:</span>
          <span className="summary-value status-resolved">
            {reports.filter(r => r.status === 'resolved').length}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Dismissed:</span>
          <span className="summary-value status-dismissed">
            {reports.filter(r => r.status === 'dismissed').length}
          </span>
        </div>
      </div>

      {/* Report Details Modal */}
      {showReportDetailsModal && selectedReport && (
        <div className="modal-overlay" onClick={() => setShowReportDetailsModal(false)}>
          <div className="modal-content report-details-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setShowReportDetailsModal(false)}
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <div className="modal-scroll">
              <h2 className="modal-title">Report Details</h2>
              
              <div className="report-details-content">
                {/* Report Header */}
                <div className="report-details-header">
                  <div className="report-id-badge">
                    Report #{selectedReport.report_id}
                  </div>
                  <div className="report-badges">
                    {getTypeBadge(selectedReport.reported_type)}
                    {getStatusBadge(selectedReport.status)}
                  </div>
                </div>

                {/* Report Reason */}
                <div className="report-reason-section">
                  <h3 className="section-title">Report Reason</h3>
                  <p className="reason-text-full">{selectedReport.reason || 'No reason provided'}</p>
                </div>

                {/* Reporter Information */}
                <div className="report-details-section">
                  <h3 className="section-title">Reporter Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Name:</span>
                      <span className="info-value">{selectedReport.reporter_name || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{selectedReport.reporter_email || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">User ID:</span>
                      <span className="info-value">{selectedReport.reporter_id || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Reported Item Information */}
                <div className="report-details-section">
                  <h3 className="section-title">
                    {selectedReport.reported_type === 'listing' ? 'Reported Listing' : 'Reported User'}
                  </h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Name/Title:</span>
                      <span className="info-value">{selectedReport.reported_title || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">ID:</span>
                      <span className="info-value">{selectedReport.reported_id || 'N/A'}</span>
                    </div>
                    {selectedReport.reported_type === 'listing' && selectedReport.reported_listing_image && selectedReport.reported_listing_image.length > 0 && (
                      <div className="info-item full-width">
                        <span className="info-label">Listing Images:</span>
                        <div className="listing-images-grid">
                          {selectedReport.reported_listing_image.slice(0, 3).map((image, idx) => (
                            <img 
                              key={idx}
                              src={image} 
                              alt={`Listing ${idx + 1}`}
                              className="listing-thumbnail"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Report Photo */}
                {selectedReport.photo_url && (
                  <div className="report-details-section">
                    <h3 className="section-title">Report Photo</h3>
                    <div className="report-photo-container">
                      <img 
                        src={selectedReport.photo_url} 
                        alt="Report evidence"
                        className="report-photo"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                      <div 
                        className="report-photo-placeholder"
                        style={{ display: selectedReport.photo_url ? 'none' : 'flex' }}
                      >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                          <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Review Information */}
                {selectedReport.reviewed_by && (
                  <div className="report-details-section">
                    <h3 className="section-title">Review Information</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Reviewed By:</span>
                        <div className="reviewer-info">
                          <span className="info-value">{selectedReport.reviewed_by || 'N/A'}</span>
                          {selectedReport.reviewed_by_role && (
                            <span className={`reviewer-role-badge role-${selectedReport.reviewed_by_role}`}>
                              {selectedReport.reviewed_by_role === 'superadmin' ? 'Super Admin' : 
                               selectedReport.reviewed_by_role === 'admin' ? 'Admin' : 
                               selectedReport.reviewed_by_role}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Reviewed At:</span>
                        <span className="info-value">{formatDate(selectedReport.reviewed_at)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Report Metadata */}
                <div className="report-details-section">
                  <h3 className="section-title">Report Metadata</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Report ID:</span>
                      <span className="info-value">#{selectedReport.report_id}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Created At:</span>
                      <span className="info-value">{formatDate(selectedReport.created_at)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Status:</span>
                      <span className="info-value">{getStatusBadge(selectedReport.status)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {(selectedReport.status === 'pending' || selectedReport.status === 'reviewed') && (
                  <div className="report-actions">
                    <button
                      className="modal-button-secondary"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to resolve this report?')) {
                          handleResolve(selectedReport.report_id);
                          setShowReportDetailsModal(false);
                        }
                      }}
                      disabled={actionLoading === selectedReport.report_id}
                    >
                      Resolve Report
                    </button>
                    <button
                      className="modal-button-secondary"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to dismiss this report?')) {
                          handleDismiss(selectedReport.report_id);
                          setShowReportDetailsModal(false);
                        }
                      }}
                      disabled={actionLoading === selectedReport.report_id}
                    >
                      Dismiss Report
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;

