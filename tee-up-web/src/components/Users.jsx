import { useState, useRef, useEffect } from 'react';
import './Users.css';
import { getAllUsers, suspendUser, unsuspendUser, deleteUser, getUserById, updateUser, getSuspensionLogs } from '../api/usersApi';
import { createAdmin } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import { AdminTablePageSkeleton } from './admin/AdminSkeletons';
import SuspensionLogsModal from './SuspensionLogsModal';

function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [createAdminLoading, setCreateAdminLoading] = useState(false);
  const [createAdminError, setCreateAdminError] = useState('');
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin'
  });
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userProfileLoading, setUserProfileLoading] = useState(false);
  const [userProfileError, setUserProfileError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [editUserError, setEditUserError] = useState('');
  const [editUserFormData, setEditUserFormData] = useState({
    id: null,
    name: '',
    email: '',
    bio: '',
    profile_image: null
  });
  const [editUserImagePreview, setEditUserImagePreview] = useState(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendTargetUser, setSuspendTargetUser] = useState(null);
  const [suspendFormData, setSuspendFormData] = useState({
    duration: '',
    reason: '',
    isPermanent: false
  });
  const [suspendLoading, setSuspendLoading] = useState(false);
  const [suspendError, setSuspendError] = useState('');
  const [showSuspensionLogsModal, setShowSuspensionLogsModal] = useState(false);
  const [suspensionLogs, setSuspensionLogs] = useState([]);
  const [suspensionLogsLoading, setSuspensionLogsLoading] = useState(false);
  const [suspensionLogsError, setSuspensionLogsError] = useState('');
  const [suspensionLogsUserId, setSuspensionLogsUserId] = useState(null);
  const dropdownRefs = useRef({});
  const buttonRefs = useRef({});

  // Fetch users from API
  const fetchUsers = async (search = '') => {
    try {
      setLoading(true);
      setError('');
      const response = await getAllUsers(search);
      // Backend returns the array directly; support both shapes for compatibility
      const list = Array.isArray(response) ? response : (response?.result ?? []);
      setUsers(list);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  // Refetch when search changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, userTypeFilter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on dropdown items, buttons, or the dropdown menu itself
      if (event.target.closest('.actions-dropdown-menu') || 
          event.target.closest('.dropdown-item') ||
          event.target.closest('.actions-dropdown-toggle') ||
          event.target.closest('.actions-dropdown-container')) {
        return;
      }
      
      // Close dropdown if clicking outside
      if (openDropdown !== null) {
        setOpenDropdown(null);
      }
    };

    // Use mousedown but only if dropdown is open
    if (openDropdown !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesUserType = userTypeFilter === 'all' || 
      (userTypeFilter === 'user' && (!user.role || user.role === 'user')) ||
      (userTypeFilter === 'admin' && user.role === 'admin') ||
      (userTypeFilter === 'superadmin' && user.role === 'superadmin');
    
    return matchesSearch && matchesStatus && matchesUserType;
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

  // Sort users based on selected sort option
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortBy) return 0;

    let comparison = 0;
    switch (sortBy) {
      case 'userId':
        comparison = a.id - b.id;
        break;
      case 'registrationDate':
        comparison = new Date(a.created_at || 0) - new Date(b.created_at || 0);
        break;
      case 'totalListings':
        comparison = (a.total_listings || 0) - (b.total_listings || 0);
        break;
      case 'totalSales':
        comparison = (a.total_sales || 0) - (b.total_sales || 0);
        break;
      case 'rating':
        comparison = parseFloat(a.rating || 0) - parseFloat(b.rating || 0);
        break;
      default:
        return 0;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

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
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status) => {
    if (status === 'active' || !status) {
      return <span className="status-badge status-active">Active</span>;
    }
    if (status === 'suspended') {
      return <span className="status-badge status-suspended">Suspended</span>;
    }
    return <span className="status-badge status-suspended">{status}</span>;
  };

  const getUserTypeBadge = (role) => {
    if (role === 'superadmin') {
      return <span className="user-type-badge user-type-superadmin">Super Admin</span>;
    }
    if (role === 'admin') {
      return <span className="user-type-badge user-type-admin">Admin</span>;
    }
    return <span className="user-type-badge user-type-user">User</span>;
  };

  const toggleDropdown = (userId, event) => {
    event?.stopPropagation();
    if (openDropdown === userId) {
      setOpenDropdown(null);
    } else {
      // Calculate position for dropdown
      const button = event?.currentTarget || buttonRefs.current[userId];
      if (button) {
        const rect = button.getBoundingClientRect();
        const dropdownHeight = 200; // Approximate dropdown height
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        // If not enough space below but enough space above, show above the button
        let top = rect.bottom + 8;
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
          top = rect.top - dropdownHeight - 8;
        } else if (spaceBelow < dropdownHeight) {
          // If not enough space below, position it so it fits in viewport
          top = viewportHeight - dropdownHeight - 8;
        }
        
        setDropdownPosition({
          top: Math.max(8, top), // Ensure it's at least 8px from top
          right: window.innerWidth - rect.right
        });
      }
      setOpenDropdown(userId);
    }
  };

  const handleView = async (userId) => {
    console.log('handleView called with userId:', userId);
    console.log('Current users array:', users);
    
    // Close dropdown first
    setOpenDropdown(null);
    
    // Use existing user data from the table as fallback
    const existingUser = users.find(u => u.id === userId);
    console.log('Existing user found:', existingUser);
    
    if (existingUser) {
      setSelectedUser(existingUser);
    }
    
    setUserProfileError('');
    setShowUserProfileModal(true);
    console.log('Modal state set to true');
    
    try {
      setUserProfileLoading(true);
      console.log('Fetching user by ID:', userId);
      const response = await getUserById(userId);
      console.log('User data received:', response);
      setSelectedUser(response.result || response.user || response);
    } catch (err) {
      console.error('Error fetching user details:', err);
      console.error('Error response:', err.response);
      // If we have existing user data, still show the modal with that data
      if (!existingUser) {
        setUserProfileError(err.response?.data?.message || err.message || 'Failed to load user profile');
      }
    } finally {
      setUserProfileLoading(false);
    }
  };

  const handleEdit = async (userId) => {
    setOpenDropdown(null);
    setEditUserError('');
    
    try {
      setEditUserLoading(true);
      const response = await getUserById(userId);
      const userData = response.result || response.user || response;
      
      setEditUserFormData({
        id: userData.id,
        name: userData.name || '',
        email: userData.email || '',
        bio: userData.bio || '',
        profile_image: null
      });
      setEditUserImagePreview(userData.profile_image || null);
      setShowEditUserModal(true);
    } catch (err) {
      console.error('Error fetching user for edit:', err);
      setEditUserError(err.response?.data?.message || 'Failed to load user data');
    } finally {
      setEditUserLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setEditUserError('');
    
    if (!editUserFormData.name.trim()) {
      setEditUserError('Name is required');
      return;
    }

    if (!editUserFormData.email.trim()) {
      setEditUserError('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editUserFormData.email)) {
      setEditUserError('Please enter a valid email address');
      return;
    }

    try {
      setEditUserLoading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', editUserFormData.name);
      formData.append('email', editUserFormData.email);
      formData.append('bio', editUserFormData.bio || '');
      
      if (editUserFormData.profile_image) {
        formData.append('profile_image', editUserFormData.profile_image);
      }

      await updateUser(editUserFormData.id, formData);
      
      // Reset form and close modal
      setEditUserFormData({
        id: null,
        name: '',
        email: '',
        bio: '',
        profile_image: null
      });
      setEditUserImagePreview(null);
      setShowEditUserModal(false);
      
      // Refresh users list
      await fetchUsers(searchQuery);
      
      alert('User updated successfully!');
    } catch (err) {
      console.error('Error updating user:', err);
      setEditUserError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setEditUserLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setEditUserError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setEditUserError('Image size must be less than 5MB');
        return;
      }
      
      setEditUserFormData({ ...editUserFormData, profile_image: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditUserImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSuspend = (userId) => {
    const targetUser = users.find(u => u.id === userId);
    const isAdminUser = targetUser?.role === 'admin' || targetUser?.role === 'superadmin';
    const isCurrentUserAdmin = currentUser?.role === 'admin';
    const isCurrentUserSuperAdmin = currentUser?.role === 'superadmin';
    
    // Prevent admins from suspending fellow admins
    if (isAdminUser && isCurrentUserAdmin && !isCurrentUserSuperAdmin) {
      alert('You do not have permission to suspend admin users.');
      setOpenDropdown(null);
      return;
    }

    // Open suspend modal
    setSuspendTargetUser(targetUser);
    setSuspendFormData({
      duration: '',
      reason: '',
      isPermanent: false
    });
    setSuspendError('');
    setShowSuspendModal(true);
    setOpenDropdown(null);
  };

  const handleSuspendSubmit = async (e) => {
    e.preventDefault();
    setSuspendError('');

    // Validate reason
    if (!suspendFormData.reason.trim()) {
      setSuspendError('Reason is required');
      return;
    }

    // Validate duration if not permanent
    if (!suspendFormData.isPermanent && (!suspendFormData.duration || suspendFormData.duration <= 0)) {
      setSuspendError('Please enter a valid duration (in days) or select permanent suspension');
      return;
    }

    try {
      setSuspendLoading(true);
      const duration = suspendFormData.isPermanent ? null : parseInt(suspendFormData.duration);
      await suspendUser(suspendTargetUser.id, duration, suspendFormData.reason.trim());
      
      // Reset form and close modal
      setSuspendFormData({
        duration: '',
        reason: '',
        isPermanent: false
      });
      setShowSuspendModal(false);
      setSuspendTargetUser(null);
      
      // Refresh users list
      await fetchUsers();
      alert('User suspended successfully!');
    } catch (err) {
      console.error('Error suspending user:', err);
      setSuspendError(err.response?.data?.message || 'Failed to suspend user');
    } finally {
      setSuspendLoading(false);
    }
  };

  const handleUnsuspend = async (userId) => {
    const targetUser = users.find(u => u.id === userId);
    
    if (!window.confirm(`Are you sure you want to unsuspend ${targetUser?.name || 'this user'}?`)) {
      setOpenDropdown(null);
      return;
    }

    try {
      setActionLoading(userId);
      await unsuspendUser(userId);
      // Refresh users list
      await fetchUsers();
      setOpenDropdown(null);
      alert('User unsuspended successfully!');
    } catch (err) {
      console.error('Error unsuspending user:', err);
      alert(err.response?.data?.message || 'Failed to unsuspend user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewSuspensionLogs = async (userId = null) => {
    setSuspensionLogsUserId(userId);
    setSuspensionLogsError('');
    setShowSuspensionLogsModal(true);
    setSuspensionLogsLoading(true);
    setOpenDropdown(null);

    try {
      const response = await getSuspensionLogs(userId);
      setSuspensionLogs(response.logs || []);
    } catch (err) {
      console.error('Error fetching suspension logs:', err);
      setSuspensionLogsError(err.response?.data?.error || 'Failed to load suspension logs');
      setSuspensionLogs([]);
    } finally {
      setSuspensionLogsLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    const targetUser = users.find(u => u.id === userId);
    const isAdminUser = targetUser?.role === 'admin' || targetUser?.role === 'superadmin';
    const isCurrentUserAdmin = currentUser?.role === 'admin';
    const isCurrentUserSuperAdmin = currentUser?.role === 'superadmin';
    
    // Prevent admins from deleting fellow admins
    if (isAdminUser && isCurrentUserAdmin && !isCurrentUserSuperAdmin) {
      alert('You do not have permission to delete admin users.');
      setOpenDropdown(null);
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setOpenDropdown(null);
      return;
    }

    try {
      setActionLoading(userId);
      await deleteUser(userId);
      // Refresh users list
      await fetchUsers();
      setOpenDropdown(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreateAdminError('');
    
    if (adminFormData.password !== adminFormData.confirmPassword) {
      setCreateAdminError('Passwords do not match');
      return;
    }

    if (adminFormData.password.length < 6) {
      setCreateAdminError('Password must be at least 6 characters');
      return;
    }

    try {
      setCreateAdminLoading(true);
      await createAdmin({
        name: adminFormData.name,
        email: adminFormData.email,
        password: adminFormData.password,
        role: adminFormData.role
      });
      
      // Reset form and close modal
      setAdminFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'admin'
      });
      setShowCreateAdminModal(false);
      alert('Admin created successfully!');
    } catch (err) {
      console.error('Error creating admin:', err);
      setCreateAdminError(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setCreateAdminLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="users-page">
        <AdminTablePageSkeleton variant="users" rows={6} />
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="users-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Users Management</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="add-user-button"
            onClick={() => handleViewSuspensionLogs()}
            style={{ backgroundColor: 'var(--color-info)' }}
          >
            View All Suspension Logs
          </button>
          {currentUser?.role === 'superadmin' && (
            <button 
              className="add-user-button"
              onClick={() => setShowCreateAdminModal(true)}
            >
              Create Admin
            </button>
          )}
        </div>
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

      <div className="users-filters">
        <input
          type="text"
          className="search-input"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="filters-row">
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <select 
            className="filter-select"
            value={userTypeFilter}
            onChange={(e) => setUserTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th 
                className="sortable-header"
                onClick={() => handleSort('userId')}
              >
                <span className="header-content">
                  User ID
                  {getSortArrow('userId')}
                </span>
              </th>
              <th>Email</th>
              <th>Name</th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('registrationDate')}
              >
                <span className="header-content">
                  Registration Date
                  {getSortArrow('registrationDate')}
                </span>
              </th>
              <th>Status</th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('totalListings')}
              >
                <span className="header-content">
                  Total Listings
                  {getSortArrow('totalListings')}
                </span>
              </th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('totalSales')}
              >
                <span className="header-content">
                  Total Sales
                  {getSortArrow('totalSales')}
                </span>
              </th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('rating')}
              >
                <span className="header-content">
                  Rating
                  {getSortArrow('rating')}
                </span>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-results">
                  {searchQuery ? 'No users found matching your search' : 'No users found'}
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr key={user.id}>
                  <td className="user-id">{user.id}</td>
                  <td className="email-cell">{user.email || 'N/A'}</td>
                  <td>
                    <div className="name-cell">
                      {user.name || 'N/A'}
                      {getUserTypeBadge(user.role)}
                    </div>
                  </td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>{getStatusBadge(user.status)}</td>
                  <td className="number-cell">{user.total_listings || 0}</td>
                  <td className="number-cell">{user.total_sales || 0}</td>
                  <td>
                    {user.rating > 0 ? (
                      <span className="rating-cell">
                        <span className="rating-value">{parseFloat(user.rating).toFixed(1)}</span>
                        <span className="rating-star">★</span>
                      </span>
                    ) : (
                      <span className="no-rating">-</span>
                    )}
                  </td>
                  <td style={{ position: 'relative', overflow: 'visible' }}>
                    {/* Check if current user can perform actions on this user */}
                    {(() => {
                      const isAdminUser = user.role === 'admin' || user.role === 'superadmin';
                      const isCurrentUserAdmin = currentUser?.role === 'admin';
                      const isCurrentUserSuperAdmin = currentUser?.role === 'superadmin';
                      const canPerformActions = isCurrentUserSuperAdmin || !isAdminUser || (isCurrentUserAdmin && user.id === currentUser?.id);
                      const canEdit = isCurrentUserSuperAdmin || !isAdminUser;
                      const canSuspend = isCurrentUserSuperAdmin || !isAdminUser;
                      
                      if (!canPerformActions) {
                        return (
                          <span style={{ 
                            color: 'var(--color-text-muted)', 
                            fontSize: 'var(--font-size-body-small)',
                            fontStyle: 'italic'
                          }}>
                            Restricted
                          </span>
                        );
                      }
                      
                      return (
                        <div 
                          className="actions-dropdown-container"
                          ref={el => dropdownRefs.current[user.id] = el}
                        >
                          <button 
                            className="actions-dropdown-toggle"
                            ref={el => buttonRefs.current[user.id] = el}
                            onClick={(e) => toggleDropdown(user.id, e)}
                            aria-label="Actions"
                            disabled={actionLoading === user.id}
                          >
                            {actionLoading === user.id ? (
                              <span>...</span>
                            ) : (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="5" r="2" fill="currentColor"/>
                                <circle cx="12" cy="12" r="2" fill="currentColor"/>
                                <circle cx="12" cy="19" r="2" fill="currentColor"/>
                              </svg>
                            )}
                          </button>
                          {openDropdown === user.id && (
                            <div 
                              className="actions-dropdown-menu"
                              style={{
                                position: 'fixed',
                                top: `${dropdownPosition.top}px`,
                                right: `${dropdownPosition.right}px`,
                                zIndex: 999999,
                                maxHeight: 'calc(100vh - 16px)',
                                overflowY: 'auto'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button 
                                className="dropdown-item view-item"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('View button clicked for user:', user.id);
                                  handleView(user.id);
                                }}
                                type="button"
                              >
                                View
                              </button>
                              {canEdit && (
                                <button 
                                  className="dropdown-item edit-item"
                                  onClick={() => handleEdit(user.id)}
                                >
                                  Edit
                                </button>
                              )}
                              {canSuspend && user.status !== 'suspended' && (
                                <button 
                                  className="dropdown-item suspend-item"
                                  onClick={() => handleSuspend(user.id)}
                                  disabled={actionLoading === user.id}
                                >
                                  Suspend
                                </button>
                              )}
                              {canSuspend && user.status === 'suspended' && (
                                <button 
                                  className="dropdown-item unsuspend-item"
                                  onClick={() => handleUnsuspend(user.id)}
                                  disabled={actionLoading === user.id}
                                >
                                  Unsuspend
                                </button>
                              )}
                              <button 
                                className="dropdown-item view-logs-item"
                                onClick={() => handleViewSuspensionLogs(user.id)}
                                disabled={actionLoading === user.id}
                              >
                                View Suspension Logs
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="users-footer">
        <div className="results-count">
          Showing {startIndex + 1}-{Math.min(endIndex, sortedUsers.length)} of {sortedUsers.length} users
        </div>
        {totalPages > 1 && (
          <div className="pagination-controls">
            <button
              className="pagination-button"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination-button"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      {showUserProfileModal && (
        <div className="modal-overlay" onClick={() => setShowUserProfileModal(false)}>
          <div className="modal-content user-profile-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setShowUserProfileModal(false)}
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <div className="modal-scroll">
              {!selectedUser && !userProfileLoading && !userProfileError ? (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  minHeight: '400px',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <div className="loading-spinner"></div>
                  <p style={{ color: 'var(--color-text-muted)' }}>Loading user profile...</p>
                </div>
              ) : userProfileLoading ? (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  minHeight: '400px',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <div className="loading-spinner"></div>
                  <p style={{ color: 'var(--color-text-muted)' }}>Loading user profile...</p>
                </div>
              ) : userProfileError ? (
                <div style={{
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {userProfileError}
                </div>
              ) : selectedUser ? (
                <>
                  <h2 className="modal-title">User Profile</h2>
                  
                  <div className="user-profile-content">
                    {/* Profile Header */}
                    <div className="profile-header">
                      <div className="profile-avatar-container">
                        {selectedUser.profile_image ? (
                          <img 
                            src={selectedUser.profile_image} 
                            alt={selectedUser.name || 'User'}
                            className="profile-avatar"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div 
                          className="profile-avatar-placeholder"
                          style={{ display: selectedUser.profile_image ? 'none' : 'flex' }}
                        >
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      <div className="profile-name-section">
                        <h3 className="profile-name">{selectedUser.name || 'Unknown User'}</h3>
                        <p className="profile-email">{selectedUser.email || 'No email'}</p>
                        {getUserTypeBadge(selectedUser.role)}
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="profile-stats-grid">
                      <div className="stat-card">
                        <div className="stat-value">{selectedUser.total_listings || 0}</div>
                        <div className="stat-label">Total Listings</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">{selectedUser.total_sales || 0}</div>
                        <div className="stat-label">Total Sales</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">
                          {selectedUser.rating > 0 ? parseFloat(selectedUser.rating).toFixed(1) : '-'}
                          {selectedUser.rating > 0 && <span className="stat-star">★</span>}
                        </div>
                        <div className="stat-label">Average Rating</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">{selectedUser.total_ratings || 0}</div>
                        <div className="stat-label">Total Ratings</div>
                      </div>
                    </div>

                    {/* User Details */}
                    <div className="profile-details">
                      <div className="detail-section">
                        <h4 className="detail-section-title">Account Information</h4>
                        <div className="detail-row">
                          <span className="detail-label">User ID:</span>
                          <span className="detail-value">{selectedUser.id}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Role:</span>
                          <span className="detail-value">{selectedUser.role || 'user'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Status:</span>
                          <span className="detail-value">{getStatusBadge(selectedUser.status)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Registration Date:</span>
                          <span className="detail-value">{formatDate(selectedUser.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {showCreateAdminModal && (
        <div className="modal-overlay" onClick={() => setShowCreateAdminModal(false)}>
          <div className="modal-content create-admin-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setShowCreateAdminModal(false)}
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <div className="modal-scroll">
              <h2 className="modal-title">Create New Admin</h2>
              
              {createAdminError && (
                <div style={{
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {createAdminError}
                </div>
              )}

              <form onSubmit={handleCreateAdmin} className="create-admin-form">
                <div className="form-group">
                  <label htmlFor="admin-name" className="form-label">Name</label>
                  <input
                    type="text"
                    id="admin-name"
                    className="form-input"
                    placeholder="Enter admin name"
                    value={adminFormData.name}
                    onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })}
                    required
                    disabled={createAdminLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="admin-email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="admin-email"
                    className="form-input"
                    placeholder="Enter admin email"
                    value={adminFormData.email}
                    onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                    required
                    disabled={createAdminLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="admin-role" className="form-label">Role</label>
                  <select
                    id="admin-role"
                    className="form-input"
                    value={adminFormData.role}
                    onChange={(e) => setAdminFormData({ ...adminFormData, role: e.target.value })}
                    required
                    disabled={createAdminLoading}
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="admin-password" className="form-label">Password</label>
                  <input
                    type="password"
                    id="admin-password"
                    className="form-input"
                    placeholder="Enter password (min 6 characters)"
                    value={adminFormData.password}
                    onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                    required
                    minLength={6}
                    disabled={createAdminLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="admin-confirm-password" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    id="admin-confirm-password"
                    className="form-input"
                    placeholder="Confirm password"
                    value={adminFormData.confirmPassword}
                    onChange={(e) => setAdminFormData({ ...adminFormData, confirmPassword: e.target.value })}
                    required
                    disabled={createAdminLoading}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="modal-button-secondary"
                    onClick={() => {
                      setShowCreateAdminModal(false);
                      setAdminFormData({
                        name: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                        role: 'admin'
                      });
                      setCreateAdminError('');
                    }}
                    disabled={createAdminLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="modal-button-primary"
                    disabled={createAdminLoading}
                  >
                    {createAdminLoading ? 'Creating...' : 'Create Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && (
        <div className="modal-overlay" onClick={() => setShowEditUserModal(false)}>
          <div className="modal-content create-admin-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => {
                setShowEditUserModal(false);
                setEditUserFormData({
                  id: null,
                  name: '',
                  email: '',
                  bio: '',
                  profile_image: null
                });
                setEditUserImagePreview(null);
                setEditUserError('');
              }}
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <div className="modal-scroll">
              <h2 className="modal-title">Edit User</h2>
              
              {editUserError && (
                <div style={{
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {editUserError}
                </div>
              )}

              <form onSubmit={handleUpdateUser} className="create-admin-form">
                <div className="form-group">
                  <label htmlFor="edit-user-name" className="form-label">Name</label>
                  <input
                    type="text"
                    id="edit-user-name"
                    className="form-input"
                    placeholder="Enter user name"
                    value={editUserFormData.name}
                    onChange={(e) => setEditUserFormData({ ...editUserFormData, name: e.target.value })}
                    required
                    disabled={editUserLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-user-email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="edit-user-email"
                    className="form-input"
                    placeholder="Enter user email"
                    value={editUserFormData.email}
                    onChange={(e) => setEditUserFormData({ ...editUserFormData, email: e.target.value })}
                    required
                    disabled={editUserLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-user-bio" className="form-label">Bio</label>
                  <textarea
                    id="edit-user-bio"
                    className="form-input"
                    placeholder="Enter user bio (optional)"
                    value={editUserFormData.bio}
                    onChange={(e) => setEditUserFormData({ ...editUserFormData, bio: e.target.value })}
                    rows="4"
                    disabled={editUserLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-user-image" className="form-label">Profile Image</label>
                  {editUserImagePreview && (
                    <div style={{ marginBottom: '12px' }}>
                      <img 
                        src={editUserImagePreview} 
                        alt="Preview" 
                        style={{
                          width: '100px',
                          height: '100px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid var(--color-border)'
                        }}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    id="edit-user-image"
                    className="form-input"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={editUserLoading}
                  />
                  <small style={{ 
                    display: 'block', 
                    marginTop: '4px', 
                    color: 'var(--color-text-muted)',
                    fontSize: '12px'
                  }}>
                    Optional: Upload a new profile image (max 5MB)
                  </small>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="modal-button-secondary"
                    onClick={() => {
                      setShowEditUserModal(false);
                      setEditUserFormData({
                        id: null,
                        name: '',
                        email: '',
                        bio: '',
                        profile_image: null
                      });
                      setEditUserImagePreview(null);
                      setEditUserError('');
                    }}
                    disabled={editUserLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="modal-button-primary"
                    disabled={editUserLoading}
                  >
                    {editUserLoading ? 'Updating...' : 'Update User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Suspend User Modal */}
      {showSuspendModal && suspendTargetUser && (
        <div className="modal-overlay" onClick={() => {
          if (!suspendLoading) {
            setShowSuspendModal(false);
            setSuspendFormData({ duration: '', reason: '', isPermanent: false });
            setSuspendError('');
          }
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Suspend User</h2>
              <button
                className="modal-close-button"
                onClick={() => {
                  if (!suspendLoading) {
                    setShowSuspendModal(false);
                    setSuspendFormData({ duration: '', reason: '', isPermanent: false });
                    setSuspendError('');
                  }
                }}
                disabled={suspendLoading}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'var(--color-light-gray)', borderRadius: '8px' }}>
                <strong>User:</strong> {suspendTargetUser.name} ({suspendTargetUser.email})
                <br />
                <strong>Role:</strong> {suspendTargetUser.role === 'superadmin' ? 'Super Admin' : suspendTargetUser.role === 'admin' ? 'Admin' : 'User'}
              </div>

              {suspendError && (
                <div style={{
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {suspendError}
                </div>
              )}

              <form onSubmit={handleSuspendSubmit}>
                <div className="form-group">
                  <label className="form-label">
                    <input
                      type="checkbox"
                      checked={suspendFormData.isPermanent}
                      onChange={(e) => setSuspendFormData({
                        ...suspendFormData,
                        isPermanent: e.target.checked,
                        duration: e.target.checked ? '' : suspendFormData.duration
                      })}
                      disabled={suspendLoading}
                      style={{ marginRight: '8px' }}
                    />
                    Permanent Suspension
                  </label>
                  <small style={{ 
                    display: 'block', 
                    marginTop: '4px', 
                    color: 'var(--color-text-muted)',
                    fontSize: '12px'
                  }}>
                    If checked, the user will be suspended indefinitely
                  </small>
                </div>

                {!suspendFormData.isPermanent && (
                  <div className="form-group">
                    <label htmlFor="suspend-duration" className="form-label">
                      Suspension Duration (Days) <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      id="suspend-duration"
                      className="form-input"
                      placeholder="Enter number of days"
                      min="1"
                      value={suspendFormData.duration}
                      onChange={(e) => setSuspendFormData({
                        ...suspendFormData,
                        duration: e.target.value
                      })}
                      disabled={suspendLoading}
                      required={!suspendFormData.isPermanent}
                    />
                    <small style={{ 
                      display: 'block', 
                      marginTop: '4px', 
                      color: 'var(--color-text-muted)',
                      fontSize: '12px'
                    }}>
                      Enter the number of days the user should be suspended
                    </small>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="suspend-reason" className="form-label">
                    Reason for Suspension <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <textarea
                    id="suspend-reason"
                    className="form-input"
                    placeholder="Enter the reason for suspending this user..."
                    rows="4"
                    value={suspendFormData.reason}
                    onChange={(e) => setSuspendFormData({
                      ...suspendFormData,
                      reason: e.target.value
                    })}
                    disabled={suspendLoading}
                    required
                    style={{ 
                      resize: 'vertical',
                      fontFamily: 'var(--font-family)'
                    }}
                  />
                  <small style={{ 
                    display: 'block', 
                    marginTop: '4px', 
                    color: 'var(--color-text-muted)',
                    fontSize: '12px'
                  }}>
                    This reason will be logged and visible in suspension history
                  </small>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="modal-button-secondary"
                    onClick={() => {
                      if (!suspendLoading) {
                        setShowSuspendModal(false);
                        setSuspendFormData({ duration: '', reason: '', isPermanent: false });
                        setSuspendError('');
                      }
                    }}
                    disabled={suspendLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="modal-button-primary"
                    disabled={suspendLoading}
                    style={{ backgroundColor: '#EF4444' }}
                  >
                    {suspendLoading ? 'Suspending...' : 'Suspend User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <SuspensionLogsModal
        open={showSuspensionLogsModal}
        loading={suspensionLogsLoading}
        error={suspensionLogsError}
        logs={suspensionLogs}
        userId={suspensionLogsUserId}
        onClose={() => {
          if (suspensionLogsLoading) return;
          setShowSuspensionLogsModal(false);
          setSuspensionLogs([]);
          setSuspensionLogsUserId(null);
          setSuspensionLogsError('');
        }}
      />
    </div>
  );
}

export default Users;
