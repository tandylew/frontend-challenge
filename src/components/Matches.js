import React, { useEffect, useState } from 'react';
import './Matches.css'; // Import the CSS file for styles

const Matches = () => {
  //State variables to manage users, loading state, expanded user details, pagination, sorting, and filters
  const [user, setUser] = useState(null); // State to hold specific user details
  const [users, setUsers] = useState([]); // State to hold the list of users
  const [loading, setLoading] = useState(true); // Loading state while fetching data
  const [currentPage, setCurrentPage] = useState(1); // State to track current page number
  const [pageSize, setPageSize] = useState(10); // State to set items per page
  const [totalPages, setTotalPages] = useState(0); // State to store total number of pages
  const [sortConfig, setSortConfig] = useState({ key: 'match_level', direction: 'desc' }); // State to manage sorting configuration
  const [showAll, setShowAll] = useState(false); // Track whether "Show All" or "Hide All" is active
  const [filters, setFilters] = useState({
    firstName: '',
    lastName: '',
    email: '',
    interestedIn: '',
    minMatchesCount: '',
    minMatchLevel: '',
  }); // State to hold user filters

  // Function to calculate average match level
  const calculateAverageMatchLevel = (matches) => {
    if (!matches || matches.length === 0) return 0;
    const sum = matches.reduce((acc, match) => acc + match.match_level, 0);
    return parseFloat((sum / matches.length).toFixed(1));
  };

  // Function to determine value to sort by based on sortConfig
  const getValueToSortBy = (item, key) => {
    switch (key) {
      case 'first_name' || '':
        return item.first_name; // Handle null or undefined first_name
      case 'last_name':
        return item.last_name || ''; // Handle null or undefined last_name
      case 'email':
        return item.email || ''; // Handle null or undefined email
      case 'interested_in.length':
        return item.interested_in.length;
      case 'matches.length':
        return item.matches ? item.matches.length : 0;
      case 'match_level':
        return calculateAverageMatchLevel(item.matches);
      case 'role':
        return item.matches && item.matches.length > 0 ? item.matches[0].role : '';
      case 'org_name':
        return item.matches && item.matches.length > 0 ? item.matches[0].org_name : '';
      case 'contact_email':
        return item.matches && item.matches.length > 0 ? item.matches[0].contact_email : '';
      default:
        return '';
    }
  };

  useEffect(() => {
    async function fetchMatches() {
      try {
        const response = await fetch(`http://localhost:3000/matches_by_user?page_num=${currentPage}&page_size=${pageSize}`);
        if (!response.ok) {
          throw new Error('Error fetching matches. Ensure the backend is running and accessible.');
        }
        const data = await response.json();
        // Ensure each user has matches property even if empty
        const usersWithMatches = data.data.map(user => ({
          ...user,
          matches: user.matches || [],
          interested_in: user.interested_in || [], // Ensure interested_in is not null
        }));
        setUsers(usersWithMatches);
        setTotalPages(Math.ceil(data.total / pageSize));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching matches:', error);
        setLoading(false);
      }
    }

    fetchMatches();
  }, [currentPage, pageSize]);

  const handleClickUser = async (user) => {
    try {
      const response = await fetch(`http://localhost:3000/matches_by_user?user_id=${user.user_id}`);
      if (!response.ok) {
        throw new Error('Error fetching matches by user. Ensure the backend is running and accessible.');
      }
      const userData = await response.json(); // Assuming userData is the correct structure directly
      if (userData) {
        setUser({
          ...userData,
          matches: userData.matches || [],
          interested_in: userData.interested_in || [], // Ensure interested_in is not null
        });
      } else {
        setUser(null); // Handle case where userData is undefined
      }
    } catch (error) {
      console.error('Error fetching user matches:', error);
      setUser(null); // Reset user on error
    }
  };

  const handleGoBack = () => {
    setUser(null);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageInputChange = (e) => {
    const value = e.target.value.trim(); // Trim to handle spaces around the input
    if (value === '') {
      // If input is empty, stay on the current page
      return;
    }
    const page = parseInt(value);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    } else {
      // Handle invalid input
      console.log('Invalid page number');
    }
  };
  

  const handleToggleShowAll = () => {
    if (showAll) {
      // If currently showing all, revert to default page size
      setCurrentPage(1);
      setPageSize(10);
    } else {
      // If not showing all, fetch all matches
      setCurrentPage(1);
      setPageSize(100000); // Set a large number to fetch all matches
    }
    setShowAll(!showAll); // Toggle showAll state
  };

  const filteredUsers = [...users].filter(user => {
    // Filter by first name
    if (filters.firstName && !user.first_name.toLowerCase().includes(filters.firstName.toLowerCase())) {
      return false;
    }
    // Filter by last name
    if (filters.lastName && (!user.last_name || !user.last_name.toLowerCase().includes(filters.lastName.toLowerCase()))) {
      return false;
    }
    // Filter by email
    if (filters.email && (!user.email || !user.email.toLowerCase().includes(filters.email.toLowerCase()))) {
      return false;
    }
    // Filter by interested in
    if (filters.interestedIn && !user.interested_in.some(interest => interest.toLowerCase().includes(filters.interestedIn.toLowerCase()))) {
      return false;
    }
    // Filter by minimum matches count
    if (filters.minMatchesCount && user.matches.length < parseInt(filters.minMatchesCount)) {
      return false;
    }
    // Filter by minimum match level
    if (filters.minMatchLevel && calculateAverageMatchLevel(user.matches) < parseFloat(filters.minMatchLevel)) {
      return false;
    }
    return true;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = getValueToSortBy(a, sortConfig.key);
    const bValue = getValueToSortBy(b, sortConfig.key);
    if (sortConfig.direction === 'asc') {
      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    } else {
      if (aValue > bValue) return -1;
      if (aValue < bValue) return 1;
      return 0;
    }
  });

  const renderMatchTable = (matches) => {
    if (!matches || matches.length === 0) {
      return <p>No matches found.</p>;
    }

    return (
      <div>
        <button onClick={handleGoBack}>Go Back</button>
        <table>
          <thead>
            <tr>
              <th>Role</th>
              <th>Organization</th>
              <th>Contact Email</th>
              <th>Match Level</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => (
              <tr key={match.opp_id}>
                <td>{match.role}</td>
                <td>{match.org_name}</td>
                <td>{match.contact_email}</td>
                <td>{match.match_level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      {!user && (
      <div>
        <button onClick={handleToggleShowAll}>{showAll ? 'Hide All' : 'Show All'}</button>
        <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
      </div>)}
      {loading ? (
        <p>Loading matches...</p>
      ) : user ? (
        <div>
          <h2>
            {user.user_image && (
              <img src={user.user_image} alt={`${user.first_name} ${user.last_name}`} style={{ width: '50px', height: '50px', marginRight: '10px' }} />
            )}
            {user.first_name} {user.last_name}
          </h2>
          <p>Email: {user.email}</p>
          <p>Interested In: {user.interested_in.join(', ')}</p>
          {user.matches && user.matches.length > 0 ? (
            renderMatchTable(user.matches)
          ) : (
            <div>
              <p>No matches found for this user.</p>
              <button onClick={handleGoBack}>Go Back</button>
            </div>            
          )}
        </div>
      ) : (
        <div>
          <div>
            <input
              type="text"
              placeholder="Filter by First Name"
              value={filters.firstName}
              onChange={(e) => setFilters({ ...filters, firstName: e.target.value })}
            />
            <input
              type="text"
              placeholder="Filter by Last Name"
              value={filters.lastName}
              onChange={(e) => setFilters({ ...filters, lastName: e.target.value })}
            />
            <input
              type="text"
              placeholder="Filter by Email"
              value={filters.email}
              onChange={(e) => setFilters({ ...filters, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Filter by Interested In"
              value={filters.interestedIn}
              onChange={(e) => setFilters({ ...filters, interestedIn: e.target.value })}
            />
            <input
              type="number"
              placeholder="Min Matches Count"
              value={filters.minMatchesCount}
              onChange={(e) => setFilters({ ...filters, minMatchesCount: e.target.value })}
            />
            <input
              type="number"
              placeholder="Min Match Level"
              value={filters.minMatchLevel}
              onChange={(e) => setFilters({ ...filters, minMatchLevel: e.target.value })}
            />
            <button onClick={() => setFilters({
              firstName: '',
              lastName: '',
              email: '',
              interestedIn: '',
              minMatchesCount: '',
              minMatchLevel: '',
            })}>
              Clear Filters
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('first_name')}>First Name {sortConfig.key === 'first_name' && <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}</th>
                <th onClick={() => handleSort('last_name')}>Last Name {sortConfig.key === 'last_name' && <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}</th>
                <th>Email</th>
                <th>Interested In</th>
                <th onClick={() => handleSort('matches.length')}>Matches Count {sortConfig.key === 'matches.length' && <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}</th>
                <th onClick={() => handleSort('match_level')}>Average Level Match {sortConfig.key === 'match_level' && <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user) => (
                <tr key={user.user_id} onClick={() => handleClickUser(user)}>
                  <td>{user.first_name}</td>
                  <td>{user.last_name}</td>
                  <td>{user.email}</td>
                  <td>{user.interested_in.join(', ')}</td>
                  <td>{user.matches.length}</td>
                  <td>{calculateAverageMatchLevel(user.matches)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!user && (
      <div>
        <input
          type="text"
          value={currentPage}
          onChange={handlePageInputChange}
          style={{ width: '50px' }}
        />
          <span style={{ marginLeft: '10px' }}>Page {currentPage} of {totalPages}</span>
      </div>)}
    </div>
  );
};

export default Matches;
