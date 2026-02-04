import { useState, useRef, useEffect } from 'react';
import './Listings.css';
import ListingDetailModal from './ListingDetailModal';

function Listings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const dropdownRefs = useRef({});

  // Debug: Log when selectedListing changes
  useEffect(() => {
    console.log('selectedListing state changed:', selectedListing);
  }, [selectedListing]);

  // Sample listing data
  const listings = [
    {
      id: 'L001',
      title: 'TaylorMade SIM2 Driver',
      seller: 'LebronJmaes123',
      category: 'Driver',
      condition: 'Slightly Used',
      price: 18500.00,
      status: 'active',
      postedDate: '2024-01-15',
      saves: 45,
      location: 'Los Angeles, CA',
      views: 234,
      description: 'Used lightly. Excellent condition. Perfect for new players. Comes with original headcover and tool.',
      images: [{ id: 1 }, { id: 2 }, { id: 3 }],
      reviews: [
        {
          id: 1,
          heading: 'Great Driver!',
          text: 'The seller is very trustworthy and the product was exactly as described.',
          reviewer: { name: 'buyer123' }
        }
      ]
    },
    {
      id: 'L002',
      title: 'Titleist Pro V1 Golf Balls (12 pack)',
      seller: 'hockeyops',
      category: 'Accessories',
      condition: 'New',
      price: 3200.00,
      status: 'pending',
      postedDate: '2024-02-20',
      saves: 12,
      location: 'New York, NY',
      views: 89,
      description: 'Brand new, never opened. Original packaging included.',
      images: [{ id: 1 }, { id: 2 }],
      reviews: []
    },
    {
      id: 'L003',
      title: 'Callaway Apex Iron Set',
      seller: 'scottiescheflerfan312',
      category: 'Iron',
      condition: 'Well Used',
      price: 35000.00,
      status: 'active',
      postedDate: '2024-03-10',
      saves: 78,
      location: 'Miami, FL',
      views: 456,
      description: 'Well-used iron set but still in good playing condition. Some wear on the faces but grooves are still effective.',
      images: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
      reviews: []
    },
    {
      id: 'L004',
      title: 'Nike Golf Polo Shirt',
      seller: 'ilovegolf543',
      category: 'Apparel',
      condition: 'New',
      price: 2500.00,
      status: 'sold',
      postedDate: '2024-01-08',
      saves: 23,
      location: 'Chicago, IL',
      views: 167,
      description: 'Brand new with tags. Size Large. Never worn.',
      images: [{ id: 1 }],
      reviews: []
    },
    {
      id: 'L005',
      title: 'Scotty Cameron Putter',
      seller: 'tigerfan99',
      category: 'Putters',
      condition: 'Slightly Used',
      price: 22000.00,
      status: 'active',
      postedDate: '2024-02-14',
      saves: 92,
      location: 'Phoenix, AZ',
      views: 523,
      description: 'Excellent condition putter. Only used for a few rounds. Comes with original headcover.',
      images: [{ id: 1 }, { id: 2 }],
      reviews: [
        {
          id: 1,
          heading: 'Amazing Putter!',
          text: 'Great seller, fast shipping. Putter is in perfect condition.',
          reviewer: { name: 'golfer123' }
        }
      ]
    },
    {
      id: 'L006',
      title: 'Ping G425 Fairway Wood',
      seller: 'LebronJmaes123',
      category: 'Woods',
      condition: 'New',
      price: 15000.00,
      status: 'pending',
      postedDate: '2024-04-05',
      saves: 34,
      location: 'Los Angeles, CA',
      views: 145,
      description: 'Brand new in box. Never been hit. Still has plastic on head.',
      images: [{ id: 1 }, { id: 2 }, { id: 3 }],
      reviews: []
    },
    {
      id: 'L007',
      title: 'Golf Bag Stand Bag',
      seller: 'hockeyops',
      category: 'Accessories',
      condition: 'Slightly Used',
      price: 8500.00,
      status: 'active',
      postedDate: '2024-03-22',
      saves: 56,
      location: 'New York, NY',
      views: 278,
      description: 'Lightly used stand bag. All zippers work perfectly. Some minor scuffs but overall great condition.',
      images: [{ id: 1 }, { id: 2 }],
      reviews: []
    },
    {
      id: 'L008',
      title: 'Mizuno JPX921 Iron Set',
      seller: 'scottiescheflerfan312',
      category: 'Iron',
      condition: 'Slightly Used',
      price: 42000.00,
      status: 'active',
      postedDate: '2024-02-28',
      saves: 67,
      location: 'Miami, FL',
      views: 389,
      description: 'Excellent condition iron set. Used for one season. Faces show minimal wear.',
      images: [{ id: 1 }, { id: 2 }, { id: 3 }],
      reviews: []
    }
  ];

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

  const filteredListings = listings.filter(listing => {
    const matchesSearch = 
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || listing.category === categoryFilter;
    const matchesCondition = conditionFilter === 'all' || listing.condition === conditionFilter;
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || listing.location === locationFilter;
    
    return matchesSearch && matchesCategory && matchesCondition && matchesStatus && matchesLocation;
  });

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
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (!sortBy) return 0;

    let comparison = 0;
    switch (sortBy) {
      case 'listingId':
        comparison = a.id.localeCompare(b.id);
        break;
      case 'postedDate':
        comparison = new Date(a.postedDate) - new Date(b.postedDate);
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

  const handleView = (listingId) => {
    console.log('handleView called with:', listingId);
    const listing = listings.find(l => l.id === listingId);
    console.log('Found listing:', listing);
    if (listing) {
      setSelectedListing(listing);
      console.log('Setting selectedListing to:', listing);
      setOpenDropdown(null);
    } else {
      console.error('Listing not found:', listingId);
    }
  };

  const handleEdit = (listingId) => {
    console.log('Edit listing:', listingId);
    setOpenDropdown(null);
  };

  const handleApprove = (listingId) => {
    console.log('Approve listing:', listingId);
    setOpenDropdown(null);
  };

  const handleMarkSold = (listingId) => {
    console.log('Mark as sold:', listingId);
    setOpenDropdown(null);
  };

  return (
    <div className="listings-page">
      <div className="listings-header">
        <h1 className="page-title">Listings Management</h1>
        <button className="add-listing-button">Add New Listing</button>
      </div>

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
                            className="dropdown-item edit-item"
                            onClick={() => handleEdit(listing.id)}
                          >
                            Edit
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
          Showing {sortedListings.length} of {listings.length} listings
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

