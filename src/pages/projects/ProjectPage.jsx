import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
   FiActivity,
   FiAlertCircle,
   FiCheckCircle,
   FiLayers,
   FiPlus,
   FiRefreshCw,
   FiTrash2,
} from "react-icons/fi";
import { deleteProject, getProjectsFiltered, updateProject } from "../../services/projectService";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../components/ui/ToastContext";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { SearchInput, FilterSelect } from "../../components/ui/Controls";
import { EmptyState, ErrorState, TableSkeleton } from "../../components/ui/States";
import StatusBadge from "../../components/ui/StatusBadge";
import { ProgressBar } from "../../components/charts/Charts";
import { TableHead, TableShell, TableWrap, Avatar, RowActions } from "../../components/ui/TableShell";
import ProjectForm from "./ProjectForm";
import { formatMoney } from "../../utils/format";
import { KpiCard, PageHeader } from "../../components/dashboard/widgets";

const STATUS_OPTIONS = [
   { value: "", label: "All statuses" },
   { value: "planning", label: "Planning" },
   { value: "tender", label: "Tender" },
   { value: "awarded", label: "Awarded" },
   { value: "mobilization", label: "Mobilization" },
   { value: "in_progress", label: "In Progress" },
   { value: "on_hold", label: "On Hold" },
   { value: "completed", label: "Completed" },
   { value: "cancelled", label: "Cancelled" },
];

export default function ProjectPage() {
   const { can } = useAuth();
   const toast = useToast();
   const canCreate = can("projects", "create");
   const canEdit = can("projects", "edit");
   const canDelete = can("projects", "delete");

   const [projects, setProjects] = useState([]);
   const [search, setSearch] = useState("");
   const [status, setStatus] = useState("");
   const [loading, setLoading] = useState(true);
   const [formOpen, setFormOpen] = useState(false);
   const [loadError, setLoadError] = useState("");

   const loadProjects = async (showLoader = true) => {
      if (showLoader) setLoading(true);
      try {
         const params = new URLSearchParams();
         if (status) params.set("status", status);
         if (search.trim()) params.set("search", search.trim());
         const res = await getProjectsFiltered(`?${params.toString()}`);
         setProjects(res.data.data || []);
         setLoadError("");
      } catch (error) {
         const message = error.response?.data?.message || "Failed to load projects.";
         setLoadError(message);
         toast.error(message);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      let active = true;
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (search.trim()) params.set("search", search.trim());

      getProjectsFiltered(`?${params.toString()}`)
         .then((res) => {
            if (active) {
               setProjects(res.data.data || []);
               setLoadError("");
            }
         })
         .catch((error) => {
            if (!active) return;
            const message = error.response?.data?.message || "Failed to load projects.";
            setLoadError(message);
            toast.error(message);
         })
         .finally(() => {
            if (active) setLoading(false);
         });

      return () => {
         active = false;
      };
   }, [search, status, toast]);

   const changeStatus = async (id, next) => {
      try {
         await updateProject(id, { status: next });
         toast.success("Project status updated.");
         loadProjects(false);
      } catch (error) {
         toast.error(error.response?.data?.message || "Could not update status.");
      }
   };

   const remove = async (project) => {
      if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
      try {
         await deleteProject(project._id);
         toast.success("Project deleted.");
         loadProjects(false);
      } catch (error) {
         toast.error(error.response?.data?.message || "Could not delete project.");
      }
   };

   const activeCount = projects.filter((project) => project.status === "in_progress").length;
   const completedCount = projects.filter((project) => project.status === "completed").length;
   const attentionCount = projects.filter((project) =>
      ["on_hold", "delayed"].includes(project.status),
   ).length;
   const clearFilters = () => {
      setSearch("");
      setStatus("");
   };

   return (
      <div className="space-y-5">
         <PageHeader
            title="Projects"
            subtitle="Track construction delivery, budgets and progress across your portfolio."
            actions={canCreate ? (
               <Button variant="primary" icon={FiPlus} onClick={() => setFormOpen(true)}>
                  New project
               </Button>
            ) : null}
         />

         <section aria-label="Project summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Projects shown" value={projects.length} icon={FiLayers} hint={search || status ? "Matching filters" : "In your portfolio"} />
            <KpiCard label="In progress" value={activeCount} icon={FiActivity} tone="mint" hint="Currently active" />
            <KpiCard label="Completed" value={completedCount} icon={FiCheckCircle} tone="brand" hint="Delivered projects" />
            <KpiCard label="Needs attention" value={attentionCount} icon={FiAlertCircle} tone="amber" hint="On hold or delayed" />
         </section>

         <section className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-[minmax(14rem,24rem)_minmax(11rem,14rem)]">
               <SearchInput
                  value={search}
                  onChange={(e) => {
                     setLoading(true);
                     setSearch(e.target.value);
                  }}
                  placeholder="Search projects…"
               />
               <FilterSelect
                  value={status}
                  onChange={(e) => {
                     setLoading(true);
                     setStatus(e.target.value);
                  }}
                  options={STATUS_OPTIONS}
               />
            </div>
            <div className="flex flex-wrap items-center gap-2">
               {(search || status) && (
                  <Button variant="ghost" icon={FiRefreshCw} onClick={clearFilters}>
                     Clear filters
                  </Button>
               )}
               <span className="text-xs font-medium text-ink-500">
                  {projects.length} result{projects.length === 1 ? "" : "s"}
               </span>
            </div>
         </section>

         {loading ? (
            <TableSkeleton rows={5} cols={6} />
         ) : loadError ? (
            <TableShell><ErrorState message={loadError} onRetry={() => loadProjects()} /></TableShell>
         ) : projects.length === 0 ? (
            <TableShell>
               <EmptyState
                  icon={FiPlus}
                  title="No projects found"
                  message={
                     search || status
                        ? "Try adjusting your search or filters."
                        : "Create your first construction project to get started."
                  }
                  action={search || status
                     ? <Button variant="secondary" icon={FiRefreshCw} onClick={clearFilters}>Clear filters</Button>
                     : canCreate
                        ? <Button variant="primary" icon={FiPlus} onClick={() => setFormOpen(true)}>New project</Button>
                        : null}
               />
            </TableShell>
         ) : (
            <TableShell>
               <TableHead
                  title="Projects"
                  subtitle={`${projects.length} project${projects.length === 1 ? "" : "s"} in this view`}
                  icon={FiLayers}
               />
               <TableWrap>
                  <table className="data-table min-w-[800px]">
                     <thead>
                        <tr>
                           <th>Project</th>
                           <th>Client</th>
                           <th>Budget</th>
                           <th>Progress</th>
                           <th>Status</th>
                           <th className="text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {projects.map((p) => (
                           <tr key={p._id}>
                              <td>
                                 <div className="flex items-center gap-3">
                                    <Avatar name={p.name} />
                                    <div className="min-w-0">
                                       <Link
                                          to={`/projects/${p._id}`}
                                          className="block truncate font-semibold text-ink-900 hover:text-brand-500"
                                       >
                                          {p.name}
                                       </Link>
                                       <span className="text-xs text-ink-500">
                                          {p.projectCode} · {p.location || "—"}
                                       </span>
                                    </div>
                                 </div>
                              </td>
                              <td>{p.client?.name || "—"}</td>
                              <td className="font-semibold text-ink-900">
                                 {formatMoney(p.budget, { compact: true })}
                              </td>
                              <td className="min-w-[9rem]">
                                 <ProgressBar value={p.progress || 0} gradient />
                                 <span className="mt-1 block text-xs text-ink-500">
                                    {p.progress || 0}% complete
                                 </span>
                              </td>
                              <td>
                                 {canEdit ? (
                                    <select
                                       value={p.status}
                                       onChange={(e) => changeStatus(p._id, e.target.value)}
                                       className="select !w-auto !py-1.5 !text-xs"
                                    >
                                       {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                                          <option key={o.value} value={o.value}>
                                             {o.label}
                                          </option>
                                       ))}
                                    </select>
                                 ) : (
                                    <StatusBadge status={p.status} />
                                 )}
                              </td>
                              <td>
                                 <RowActions>
                                    <Link
                                       to={`/projects/${p._id}`}
                                       className="btn btn-ghost btn-sm"
                                    >
                                       Open
                                    </Link>
                                    {canDelete && (
                                       <button
                                          type="button"
                                          onClick={() => remove(p)}
                                          className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-[rgba(224,82,82,0.1)] hover:text-[#c23b3b]"
                                          aria-label="Delete project"
                                       >
                                          <FiTrash2 size={15} />
                                       </button>
                                    )}
                                 </RowActions>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </TableWrap>
            </TableShell>
         )}

         <Modal
            isOpen={formOpen}
            onClose={() => setFormOpen(false)}
            title="Create project"
            subtitle="Set up a new construction project."
            size="lg"
         >
            <ProjectForm
               loadProjects={() => {
                  setFormOpen(false);
                  loadProjects(false);
               }}
            />
         </Modal>
      </div>
   );
}
