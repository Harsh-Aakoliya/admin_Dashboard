// UserList.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import "./UserList.css"

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const pageSize = 10;
  const location = useLocation();
  
  useEffect(() => {
    // Fetch data from the API based on the search term
    const fetchData = async () => {
      try {
        const response = await fetch(`https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json?search=${searchTerm}`);
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [searchTerm]);

  useEffect(() => {
    // Get the search term from the URL parameter
    const urlSearchParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlSearchParams.get('search');
    setSearchTerm(searchTermFromUrl || '');
  }, [location.search]);

  const filteredUsers = users.filter(user =>
    Object.values(user).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleRowSelection = id => {
    setSelectedRows(prevRows => {
      if (prevRows.includes(id)) {
        return prevRows.filter(rowId => rowId !== id);
      } else {
        return [...prevRows, id];
      }
    });
  };

  const deleteSelectedRows = () => {
    console.log('Deleting rows:', selectedRows);
    const updatedUsers = users.filter(user => !selectedRows.includes(user.id));
    setUsers(updatedUsers);
    setSelectedRows([]);
    setSelectAll(false);
  };

  const updateUrlWithSearchTerm = term => {
    const urlSearchParams = new URLSearchParams(location.search);
    urlSearchParams.set('search', term);
    window.history.replaceState({}, '', `${location.pathname}?${urlSearchParams}`);
  };

  const handleSelectAll = () => {
    setSelectAll(prev => !prev);
    setSelectedRows(prevRows => {
      if (!selectAll) {
        return [...prevRows, ...paginatedUsers.map(user => user.id)];
      } else {
        return prevRows.filter(rowId => !paginatedUsers.map(user => user.id).includes(rowId));
      }
    });
  };

  const handleDelete = id => {
    const userToDelete = users.find(user => user.id === id);
    const updatedUsers = users.filter(user => user.id !== id);
    setUsers(updatedUsers);
    setSelectedRows(prevRows => prevRows.filter(rowId => rowId !== id));
    console.log('Deleting user:', userToDelete);
    setSelectAll(false);
  };

  const handleEdit = id => {
    const userToEdit = users.find(user => user.id === id);
    setEditingUser({ ...userToEdit });
  };

  const handleEditInputChange = e => {
    setEditingUser(prevEditingUser => ({
      ...prevEditingUser,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = () => {
    console.log('Saving edited user:', editingUser);
    
    // Update the user in the users state
    const updatedUsers = users.map(user =>
      user.id === editingUser.id ? { ...editingUser } : user
    );
    setUsers(updatedUsers);
    
    // Clear the editingUser state
    setEditingUser(null);
  };

  const handleCancel = () => {
    setEditingUser(null);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={e => {
          setSearchTerm(e.target.value);
          updateUrlWithSearchTerm(e.target.value);
        }}
      />

      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectAll}
              />
            </th>
            <th>User ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.map(user => (
            <tr
              key={user.id}
              className={selectedRows.includes(user.id) ? 'selected' : ''}
            >
              <td>
                <input
                  type="button"
                  value={"Select/Deselect"}
                  onClick={() => handleRowSelection(user.id)}
                />
              </td>
              <td>{user.id}</td>
              <td>
                {editingUser && editingUser.id === user.id ? (
                  <input
                    type="text"
                    name="name"
                    value={editingUser.name}
                    onChange={handleEditInputChange}
                  />
                ) : (
                  user.name
                )}
              </td>
              <td>
                {editingUser && editingUser.id === user.id ? (
                  <input
                    type="text"
                    name="email"
                    value={editingUser.email}
                    onChange={handleEditInputChange}
                  />
                ) : (
                  user.email
                )}
              </td>
              <td>
                {editingUser && editingUser.id === user.id ? (
                  <input
                    type="text"
                    name="role"
                    value={editingUser.role}
                    onChange={handleEditInputChange}
                  />
                ) : (
                  user.role
                )}
              </td>
              <td>
                {editingUser && editingUser.id === user.id ? (
                  <>
                    <button className="save" onClick={handleSave}>
                      Save
                    </button>
                    <button className="cancel" onClick={handleCancel}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button className="edit" onClick={() => handleEdit(user.id)}>
                      Edit
                    </button>
                    <button className="delete" onClick={() => handleDelete(user.id)}>
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination */}
      <div>
        <button onClick={() => setCurrentPage(1)}>First</button>
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        >
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button
          onClick={() =>
            setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredUsers.length / pageSize)))
          }
        >
          Next
        </button>
        <button onClick={() => setCurrentPage(Math.ceil(filteredUsers.length / pageSize))}>
          Last
        </button>
      </div>

      {/* Delete Selected Button */}
      <button onClick={deleteSelectedRows}>Delete Selected</button>
    </div>
  );
};

export default UserList;