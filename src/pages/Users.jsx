import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiUserPlus, FiUsers } from "react-icons/fi";
import { getUsersApi, deleteUserApi } from "../api/users.api";

import UserForm from "../components/users/UserForm";
import { useToast } from "../components/ui/ToastContext";
import Button from "../components/ui/Button";
import { SearchInput, Pagination } from "../components/ui/Controls";
import { EmptyState, TableSkeleton } from "../components/ui/States";
import StatusBadge from "../components/ui/StatusBadge";
import { TableHead, TableShell, TableWrap, Avatar, RowActions } from "../components/ui/TableShell";

export default function Users() {
   const toast = useToast();
   const [users, setUsers] = useState([]);
   const [search, setSearch] = useState("");
   const [page, setPage] = useState(1);
   const [pages, setPages] = useState(1);
   const [loading, setLoading] = useState(true);
   const [showForm, setShowForm] = useState(false);
   const [editUser, setEditUser] = useState(null);

   const loadUsers = async (showLoader = true) => {
      if (showLoader) setLoading(true);
      try {
         const res = await getUsersApi({ search, page });
         setUsers(res.data.data || []);
         setPages(res.data.pages || 1);
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to load users.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadUsers();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [search, page]);

   useEffect(() => {
      setPage(1);
   }, [search]);

   const handleDelete = async (user) => {
      if (!window.confirm(`Delete user "${user.name}"?`)) return;
      try {
         await deleteUserApi(user._id);
         toast.success("User deleted.");
         loadUsers(false);
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to delete user.");
      }
   };

   return (
      <div className="space-y-4">
         <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search users…"
               className="sm:max-w-sm"
            />
            <Button
               variant="primary"
               icon={FiPlus}
               onClick={() => {
                  setEditUser(null);
                  setShowForm(true);
               }}
            >
               Add User
            </Button>
         </div>

         {loading ? (
            <TableSkeleton rows={6} cols={4} />
         ) : users.length === 0 ? (
            <TableShell>
               <EmptyState
                  icon={FiUsers}
                  title="No users found"
                  message="Add a user or adjust your search."
               />
            </TableShell>
         ) : (
            <TableShell>
               <TableHead title="Users" subtitle={`${users.length} accounts`} icon={FiUsers} />
               <TableWrap>
                  <table className="data-table">
                     <thead>
                        <tr>
                           <th>User</th>
                           <th>Email</th>
                           <th>Role</th>
                           <th>Status</th>
                           <th className="text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {users.map((u) => (
                           <tr key={u._id}>
                              <td>
                                 <div className="flex items-center gap-3">
                                    <Avatar name={u.name} />
                                    <span className="font-semibold text-ink-900">{u.name}</span>
                                 </div>
                              </td>
                              <td className="text-ink-500">{u.email}</td>
                              <td>
                                 <span className="badge badge-brand capitalize">
                                    {String(u.role || "").replace(/_/g, " ")}
                                 </span>
                              </td>
                              <td>
                                 <StatusBadge status={u.isActive === false ? "inactive" : "active"} />
                              </td>
                              <td>
                                 <RowActions>
                                    <button
                                       type="button"
                                       onClick={() => {
                                          setEditUser(u);
                                          setShowForm(true);
                                       }}
                                       className="btn btn-secondary btn-sm"
                                    >
                                       Edit
                                    </button>
                                    <button
                                       type="button"
                                       onClick={() => handleDelete(u)}
                                       className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-[rgba(224,82,82,0.1)] hover:text-[#c23b3b]"
                                       aria-label="Delete user"
                                    >
                                       <FiTrash2 size={15} />
                                    </button>
                                 </RowActions>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </TableWrap>
            </TableShell>
         )}

         <Pagination page={page} pages={pages} onChange={setPage} />

         {showForm && (
            <UserForm
               key={editUser?._id || "new-user"}
               user={editUser}
               onClose={() => setShowForm(false)}
               onSuccess={() => {
                  setShowForm(false);
                  loadUsers(false);
               }}
            />
         )}
      </div>
   );
}

void FiUserPlus;
