import React from 'react';
import { pizzaService } from '../service/service';
import { User } from '../service/pizzaService';
import { TrashIcon } from '../icons';

interface UserListResponse {
  users: User[];
  more: boolean;
}

export default function UserManager() {
  const [userList, setUserList] = React.useState<UserListResponse>({ users: [], more: false });
  const [currentPage, setCurrentPage] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState('');
  const filterUserRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    loadUsers();
  }, [currentPage]);

  async function loadUsers() {
    try {
      const users = await pizzaService.getUsers(currentPage, 10, searchTerm || '*');
      setUserList(users);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  }

  async function handleSearch() {
    const term = filterUserRef.current?.value || '';
    setSearchTerm(term);
    setCurrentPage(0);
    try {
      const users = await pizzaService.getUsers(0, 10, term ? `*${term}*` : '*');
      setUserList(users);
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  }

  async function handleDeleteUser(user: User) {
    if (window.confirm(`Are you sure you want to delete user ${user.name}?`)) {
      try {
        if (user.id === undefined) {
            throw Error("User id undefined");
        } else {
            await pizzaService.deleteUser(user.id);
            loadUsers();
        }
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user');
      }
    }
  }

  function getRoleDisplay(user: User): string {
    if (!user.roles || user.roles.length === 0) return 'diner';
    return user.roles.map(r => r.role).join(', ');
  }

  return (
    <div className="text-start py-8 px-4 sm:px-6 lg:px-8">
      <h3 className="text-neutral-100 text-xl">Users</h3>
      <div className="bg-neutral-100 overflow-clip my-4">
        <div className="flex flex-col">
          <div className="-m-1.5 overflow-x-auto">
            <div className="p-1.5 min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="uppercase text-neutral-100 bg-slate-400 border-b-2 border-gray-500">
                    <tr>
                      {['Name', 'Email', 'Role', 'Action'].map((header) => (
                        <th key={header} scope="col" className="px-6 py-3 text-center text-xs font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {userList.users.map((user, index) => (
                      <tr key={index} className="bg-neutral-100">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-center">
                          {getRoleDisplay(user)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <button
                            type="button"
                            className="px-2 py-1 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-1 border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <TrashIcon />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="px-1 py-1" colSpan={2}>
                        <input
                          type="text"
                          ref={filterUserRef}
                          name="filterUser"
                          placeholder="Search users by name"
                          className="px-2 py-1 text-sm border border-gray-300 rounded-lg w-64"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSearch();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="ml-2 px-2 py-1 text-sm font-semibold rounded-lg border border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800"
                          onClick={handleSearch}
                        >
                          Search
                        </button>
                      </td>
                      <td colSpan={2} className="text-end text-sm font-medium px-6 py-1">
                        <button
                          className="w-12 p-1 text-sm font-semibold rounded-lg border border-transparent bg-white text-grey border-grey m-1 hover:bg-orange-200 disabled:bg-neutral-300"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage <= 0}
                        >
                          Prev
                        </button>
                        <button
                          className="w-12 p-1 text-sm font-semibold rounded-lg border border-transparent bg-white text-grey border-grey m-1 hover:bg-orange-200 disabled:bg-neutral-300"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={!userList.more}
                        >
                          Next
                        </button>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}