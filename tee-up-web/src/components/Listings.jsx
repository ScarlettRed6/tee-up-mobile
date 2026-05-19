import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import './Listings.css';
import ListingDetailModal from './ListingDetailModal';
import { getAdminListings, getAdminListingById, updateAdminListingStatus, deleteAdminListing } from '../api/listingsApi';
import { PHILIPPINE_CITIES_BY_REGION } from '../constants/philippineLocations';
import { AdminTablePageSkeleton } from './admin/AdminSkeletons';
import { Alert } from './ui/alert';
import { useAppDialog } from '../hooks/useAppDialog.jsx';

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
  const { showConfirm, showAlert, AppDialogHost } = useAppDialog();
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownMenuBox, setDropdownMenuBox] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const dropdownRefs = useRef({});

  const closeActionsDropdown = useCallback(() => {
    setOpenDropdown(null);
    setDropdownMenuBox(null);
  }, []);

  const computeActionsMenuBox = useCallback((buttonEl) => {
    if (!buttonEl?.getBoundingClientRect || typeof window === 'undefined') return null;
    const rect = buttonEl.getBoundingClientRect();
    const menuWidth = Math.max(200, 180);
    const vw = window.innerWidth;
    const preferredLeft = rect.right - menuWidth;
    const left = Math.max(8, Math.min(preferredLeft, vw - menuWidth - 8));
    return {
      top: rect.bottom + 8,
      left,
      width: menuWidth,
    };
  }, []);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, conditionFilter, statusFilter, locationFilter]);

  useEffect(() => {
    if (!openDropdown) return undefined;

    const handlePointerDown = (event) => {
      if (event.target.closest('.dropdown-item')) return;
      if (event.target.closest('.listings-actions-menu-portal')) return;
      const root = dropdownRefs.current[openDropdown];
      if (root?.contains(event.target)) return;
      closeActionsDropdown();
    };

    const t = window.setTimeout(() => {
      document.addEventListener('mousedown', handlePointerDown);
    }, 0);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [openDropdown, closeActionsDropdown]);

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

  const totalPages = Math.ceil(sortedListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedListings = sortedListings.slice(startIndex, endIndex);

  useEffect(() => {
    if (sortedListings.length === 0) {
      if (currentPage !== 1) setCurrentPage(1);
      return;
    }
    const tp = Math.ceil(sortedListings.length / itemsPerPage);
    if (tp > 0 && currentPage > tp) setCurrentPage(tp);
  }, [sortedListings.length, currentPage, itemsPerPage]);

  useLayoutEffect(() => {
    if (!openDropdown) return undefined;

    const reposition = () => {
      const root = dropdownRefs.current[openDropdown];
      const btn = root?.querySelector?.('.actions-dropdown-toggle');
      if (!btn) {
        closeActionsDropdown();
        return;
      }
      setDropdownMenuBox(computeActionsMenuBox(btn));
    };

    reposition();
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [openDropdown, sortBy, sortDirection, computeActionsMenuBox, closeActionsDropdown]);

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

  const toggleDropdown = (listingId, event) => {
    if (openDropdown === listingId) {
      closeActionsDropdown();
      return;
    }
    const box = computeActionsMenuBox(event?.currentTarget);
    setDropdownMenuBox(box);
    setOpenDropdown(listingId);
  };

  const handleListingsPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleListingsNextPage = () => {
    if (totalPages > 0 && currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleView = async (listingId) => {
    const listing = listings.find(l => l.id === listingId || l.listing_id === listingId);
    if (listing) {
      setSelectedListing(listing);
      closeActionsDropdown();
      return;
    }
    closeActionsDropdown();
  };

  const handleEdit = (listingId) => {
    console.log('Edit listing:', listingId);
    closeActionsDropdown();
  };

  const handleDelete = async (listingId) => {
    closeActionsDropdown();
    const confirmed = await showConfirm({
      variant: 'danger',
      title: 'Delete this listing?',
      message: 'This action cannot be undone. The listing will be permanently removed.',
      confirmLabel: 'Delete listing',
      cancelLabel: 'Keep listing',
    });
    if (!confirmed) return;

    setActionLoading(listingId);
    try {
      await deleteAdminListing(listingId);
      await fetchListings();
    } catch (err) {
      console.error('Error deleting listing:', err);
      await showAlert({
        variant: 'danger',
        title: 'Delete failed',
        message: err.response?.data?.error || err.message || 'Failed to delete listing',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (listingId) => {
    setActionLoading(listingId);
    closeActionsDropdown();
    try {
      await updateAdminListingStatus(listingId, 'active');
      await fetchListings();
    } catch (err) {
      console.error('Error approving listing:', err);
      await showAlert({
        variant: 'danger',
        title: 'Approve failed',
        message: err.response?.data?.error || err.message || 'Failed to approve listing',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkSold = async (listingId) => {
    setActionLoading(listingId);
    closeActionsDropdown();
    try {
      await updateAdminListingStatus(listingId, 'sold');
      await fetchListings();
    } catch (err) {
      console.error('Error marking as sold:', err);
      await showAlert({
        variant: 'danger',
        title: 'Update failed',
        message: err.response?.data?.error || err.message || 'Failed to update status',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const actionMenuListing =
    openDropdown != null ? sortedListings.find((l) => l.id === openDropdown) : null;

  if (loading) {
    return (
      <div className="listings-page">
        <AdminTablePageSkeleton variant="listings" rows={6} />
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
        <Alert variant="destructive" className="app-page-alert">
          {error}
        </Alert>
      )}

      <div className="listings-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search by title, seller username, or listing ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

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
              {Object.entries(PHILIPPINE_CITIES_BY_REGION).map(([region, cities]) => (
                <optgroup key={region} label={region}>
                  {cities.map((city) => {
                    const value = `${region}, ${city}`;
                    return (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    );
                  })}
                </optgroup>
              ))}
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
              paginatedListings.map((listing) => (
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
                                toggleDropdown(listing.id, e);
                              }}
                              aria-label="Actions"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="5" r="2" fill="currentColor"/>
                                <circle cx="12" cy="12" r="2" fill="currentColor"/>
                                <circle cx="12" cy="19" r="2" fill="currentColor"/>
                              </svg>
                            </button>
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
          Showing{' '}
          {sortedListings.length === 0
            ? '0 '
            : `${startIndex + 1}-${Math.min(endIndex, sortedListings.length)} `}
          of {sortedListings.length} listing{sortedListings.length !== 1 ? 's' : ''}
        </div>
        {totalPages > 1 && (
          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-button"
              onClick={handleListingsPrevPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="pagination-button"
              onClick={handleListingsNextPage}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        )}
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

      {typeof document !== 'undefined' &&
        actionMenuListing &&
        dropdownMenuBox &&
        createPortal(
          <div
            className="actions-dropdown-menu listings-actions-menu-portal"
            style={{
              top: dropdownMenuBox.top,
              left: dropdownMenuBox.left,
              width: dropdownMenuBox.width,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="dropdown-item view-item"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleView(actionMenuListing.id);
              }}
            >
              View
            </button>
            <button
              type="button"
              className="dropdown-item delete-item"
              onClick={() => handleDelete(actionMenuListing.id)}
            >
              Delete
            </button>
            {actionMenuListing.status === 'pending' && (
              <button
                type="button"
                className="dropdown-item approve-item"
                onClick={() => handleApprove(actionMenuListing.id)}
              >
                Approve
              </button>
            )}
            {actionMenuListing.status === 'active' && (
              <button
                type="button"
                className="dropdown-item sold-item"
                onClick={() => handleMarkSold(actionMenuListing.id)}
              >
                Mark as Sold
              </button>
            )}
          </div>,
          document.body
        )}

      <AppDialogHost />
    </div>
  );
}

export default Listings;

