import { useState, useRef, useEffect, useCallback } from 'react';
import './Listings.css';
import ListingDetailModal from './ListingDetailModal';
import { getAdminListings, getAdminListingById, updateAdminListingStatus, deleteAdminListing } from '../api/listingsApi';

// Normalize backend listing row to UI shape (id, seller, postedDate, saves, images, etc.)
function normalizeListing(row) {
  const photos = row.photos || (Array.isArray(row.photos) ? row.photos : []);
  const images = photos.map((url, i) => (typeof url === 'string' ? { id: i + 1, uri: url } : { id: (url?.id ?? i + 1), uri: url?.url ?? url }));
  return {
    id: row.listing_id ?? row.id,
    listing_id: row.listing_id,
    title: row.title ?? '',
    seller: row.seller_name ?? row.seller ?? '—',
    seller_email: row.seller_email,
    category: row.category ?? '—',
    condition: row.condition ?? '—',
    price: parseFloat(row.price) || 0,
    status: row.status ?? 'active',
    postedDate: row.date_posted ?? row.created_at ?? row.postedDate,
    saves: Number(row.total_saves) || 0,
    location: row.location ?? '—',
    views: row.views ?? 0,
    description: row.description ?? '',
    images,
    photos,
    reviews: row.reviews ?? [],
  };
}

function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const dropdownRefs = useRef({});

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdminListings({
        search: searchQuery.trim() || undefined,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        condition: conditionFilter === 'all' ? undefined : conditionFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
        location: locationFilter === 'all' ? undefined : locationFilter,
      });
      const raw = data?.result ?? (Array.isArray(data) ? data : []);
      setListings(raw.map(normalizeListing));
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load listings');
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, categoryFilter, conditionFilter, statusFilter, locationFilter]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is on a dropdown item - if so, don't close
      const isDropdownItem = event.target.closest('.dropdown-item');
      if (isDropdownItem) {
        return; // Don't close dropdown when clicking on items
      }

      Object.keys(dropdownRefs.current).forEach(key => {
        const ref = dropdownRefs.current[key];
        if (ref && !ref.contains(event.target)) {
          setOpenDropdown(null);
        }
      });
    };

    // Use a small delay to allow button clicks to fire first
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // List is already filtered by the API when fetchListings runs with current filters
  const listToSort = listings;

  // Handle column sorting
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Sort listings based on selected sort option
  const sortedListings = [...listToSort].sort((a, b) => {
    if (!sortBy) return 0;

    let comparison = 0;
    switch (sortBy) {
      case 'listingId':
        comparison = (Number(a.id) || 0) - (Number(b.id) || 0) || String(a.id).localeCompare(String(b.id));
        break;
      case 'postedDate':
        comparison = new Date(a.postedDate || 0) - new Date(b.postedDate || 0);
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'saves':
        comparison = a.saves - b.saves;
        break;
      default:
        return 0;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Get sort arrow icon
  const getSortArrow = (column) => {
    if (sortBy !== column) {
      return (
        <span className="sort-arrow sort-arrow-inactive">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 3L3 6H9L6 3Z" fill="currentColor" opacity="0.3"/>
            <path d="M6 9L3 6H9L6 9Z" fill="currentColor" opacity="0.3"/>
          </svg>
        </span>
      );
    }
    return sortDirection === 'asc' ? (
      <span className="sort-arrow sort-arrow-active">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 3L3 6H9L6 3Z" fill="currentColor"/>
        </svg>
      </span>
    ) : (
      <span className="sort-arrow sort-arrow-active">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 9L3 6H9L6 9Z" fill="currentColor"/>
        </svg>
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatPrice = (price) => {
    return `₱${price.toFixed(2)}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="status-badge status-active">Active</span>;
      case 'pending':
        return <span className="status-badge status-pending">Pending Approval</span>;
      case 'sold':
        return <span className="status-badge status-sold">Sold</span>;
      default:
        return <span className="status-badge status-active">Active</span>;
    }
  };

  const getConditionBadge = (condition) => {
    const conditionClass = condition.toLowerCase().replace(/\s+/g, '-');
    return <span className={`condition-badge condition-${conditionClass}`}>{condition}</span>;
  };

  const toggleDropdown = (listingId) => {
    setOpenDropdown(openDropdown === listingId ? null : listingId);
  };

  const handleView = async (listingId) => {
    const listing = listings.find(l => l.id === listingId || l.listing_id === listingId);
    if (listing) {
      setSelectedListing(listing);
      setOpenDropdown(null);
      return;
    }
    setOpenDropdown(null);
  };

  const handleEdit = (listingId) => {
    console.log('Edit listing:', listingId);
    setOpenDropdown(null);
  };

  const handleDelete = async (listingId) => {
    setOpenDropdown(null);
    if (!window.confirm('Delete this listing? This action cannot be undone.')) {
      return;
    }
    setActionLoading(listingId);
    try {
      await deleteAdminListing(listingId);
      await fetchListings();
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert(err.response?.data?.error || err.message || 'Failed to delete listing');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (listingId) => {
    setActionLoading(listingId);
    setOpenDropdown(null);
    try {
      await updateAdminListingStatus(listingId, 'active');
      await fetchListings();
    } catch (err) {
      console.error('Error approving listing:', err);
      alert(err.response?.data?.error || err.message || 'Failed to approve listing');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkSold = async (listingId) => {
    setActionLoading(listingId);
    setOpenDropdown(null);
    try {
      await updateAdminListingStatus(listingId, 'sold');
      await fetchListings();
    } catch (err) {
      console.error('Error marking as sold:', err);
      alert(err.response?.data?.error || err.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="listings-page">
        <div className="listings-header">
          <h1 className="page-title">Listings Management</h1>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, color: 'var(--color-text-muted)' }}>
          Loading listings…
        </div>
      </div>
    );
  }

  return (
    <div className="listings-page">
      <div className="listings-header">
        <h1 className="page-title">Listings Management</h1>
        <button className="add-listing-button" type="button" disabled>Add New Listing</button>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#FEE2E2',
          color: '#DC2626',
          padding: '12px 16px',
          borderRadius: '12px',
          marginBottom: '16px',
          fontSize: '14px',
          fontWeight: '500',
        }}>
          {error}
        </div>
      )}

      <div className="listings-filters">
        <div className="search-container">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, seller username, or listing ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <select 
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Driver">Driver</option>
              <option value="Woods">Woods</option>
              <option value="Iron">Iron</option>
              <option value="Putters">Putters</option>
              <option value="Apparel">Apparel</option>
              <option value="Accessories">Accessories</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Condition</label>
            <select 
              className="filter-select"
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
            >
              <option value="all">All Conditions</option>
              <option value="New">New</option>
              <option value="Slightly Used">Slightly Used</option>
              <option value="Well Used">Well Used</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select 
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending Approval</option>
              <option value="sold">Sold</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Location</label>
            <select 
              className="filter-select"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="all">All Locations</option>
              <option value="Los Angeles, CA">Los Angeles, CA</option>
              <option value="New York, NY">New York, NY</option>
              <option value="Miami, FL">Miami, FL</option>
              <option value="Chicago, IL">Chicago, IL</option>
              <option value="Phoenix, AZ">Phoenix, AZ</option>
            </select>
          </div>
        </div>
      </div>

      <div className="listings-table-container">
        <table className="listings-table">
          <thead>
            <tr>
              <th 
                className="sortable-header"
                onClick={() => handleSort('listingId')}
              >
                <span className="header-content">
                  Listing ID
                  {getSortArrow('listingId')}
                </span>
              </th>
              <th>Title</th>
              <th>Seller</th>
              <th>Category</th>
              <th>Condition</th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('price')}
              >
                <span className="header-content">
                  Price
                  {getSortArrow('price')}
                </span>
              </th>
              <th>Status</th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('postedDate')}
              >
                <span className="header-content">
                  Posted Date
                  {getSortArrow('postedDate')}
                </span>
              </th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('saves')}
              >
                <span className="header-content">
                  Saves
                  {getSortArrow('saves')}
                </span>
              </th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedListings.length === 0 ? (
              <tr>
                <td colSpan="11" className="no-results">
                  No listings found matching your criteria
                </td>
              </tr>
            ) : (
              sortedListings.map((listing) => (
                <tr key={listing.id}>
                  <td className="listing-id">{listing.id}</td>
                  <td className="listing-title">{listing.title}</td>
                  <td className="seller-cell">{listing.seller}</td>
                  <td>
                    <span className="category-badge">{listing.category}</span>
                  </td>
                  <td>{getConditionBadge(listing.condition)}</td>
                  <td className="price-cell">{formatPrice(listing.price)}</td>
                  <td>{getStatusBadge(listing.status)}</td>
                  <td>{formatDate(listing.postedDate)}</td>
                  <td className="number-cell">{listing.saves}</td>
                  <td className="location-cell">{listing.location}</td>
                        <td>
                          <div 
                            className="actions-dropdown-container"
                            ref={el => dropdownRefs.current[listing.id] = el}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button 
                              className="actions-dropdown-toggle"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDropdown(listing.id);
                              }}
                              aria-label="Actions"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="5" r="2" fill="currentColor"/>
                                <circle cx="12" cy="12" r="2" fill="currentColor"/>
                                <circle cx="12" cy="19" r="2" fill="currentColor"/>
                              </svg>
                            </button>
                            {openDropdown === listing.id && (
                              <div 
                                className="actions-dropdown-menu"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button 
                                  className="dropdown-item view-item"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('View button clicked for:', listing.id);
                                    // Close dropdown first
                                    setOpenDropdown(null);
                                    // Then handle view
                                    setTimeout(() => {
                                      handleView(listing.id);
                                    }, 0);
                                  }}
                                >
                                  View
                                </button>
                          <button 
                            className="dropdown-item delete-item"
                            onClick={() => handleDelete(listing.id)}
                          >
                            Delete
                          </button>
                          {listing.status === 'pending' && (
                            <button 
                              className="dropdown-item approve-item"
                              onClick={() => handleApprove(listing.id)}
                            >
                              Approve
                            </button>
                          )}
                          {listing.status === 'active' && (
                            <button 
                              className="dropdown-item sold-item"
                              onClick={() => handleMarkSold(listing.id)}
                            >
                              Mark as Sold
                            </button>
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

      <div className="listings-footer">
        <div className="results-count">
          Showing {sortedListings.length} listing{sortedListings.length !== 1 ? 's' : ''}
        </div>
      </div>

      {selectedListing && (
        <ListingDetailModal 
          listing={selectedListing} 
          onClose={() => {
            console.log('Closing modal');
            setSelectedListing(null);
          }} 
        />
      )}
    </div>
  );
}

export default Listings;

