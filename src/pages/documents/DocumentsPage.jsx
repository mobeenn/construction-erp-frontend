import { useCallback, useEffect, useMemo, useState } from "react";
import {
   FiDownload,
   FiFile,
   FiFileText,
   FiFolder,
   FiHardDrive,
   FiImage,
   FiTrash2,
   FiUploadCloud,
} from "react-icons/fi";
import { useAuth } from "../../auth/AuthContext";
import Button from "../../components/ui/Button";
import { FilterSelect, SearchInput } from "../../components/ui/Controls";
import Modal from "../../components/ui/Modal";
import { EmptyState, ErrorState, TableSkeleton } from "../../components/ui/States";
import StatusBadge from "../../components/ui/StatusBadge";
import { RowActions, TableHead, TableShell, TableWrap } from "../../components/ui/TableShell";
import {
   deleteDocument,
   downloadDocument,
   getDocuments,
   hardDeleteDocument,
   uploadDocument,
} from "../../services/documentService";

const ENTITY_TYPES = [
   { value: "project", label: "Project" },
   { value: "contract", label: "Contract" },
   { value: "client", label: "Client" },
   { value: "purchaseOrder", label: "Purchase Order" },
   { value: "grn", label: "GRN" },
   { value: "vendor", label: "Vendor" },
   { value: "interimPayment", label: "Interim Payment" },
   { value: "expense", label: "Expense" },
   { value: "employee", label: "Employee" },
   { value: "dailyReport", label: "Site Daily Report" },
];

const EMPTY_UPLOAD = {
   name: "",
   entityType: "project",
   entityId: "",
   description: "",
   file: null,
};

const fileIcon = (type = "") => {
   if (type.startsWith("image/")) return FiImage;
   if (type === "application/pdf" || type.includes("word") || type.includes("sheet")) return FiFileText;
   return FiFile;
};

const formatFileSize = (bytes) => {
   if (!bytes) return "—";
   if (bytes < 1024) return `${bytes} B`;
   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
   return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (value) => {
   if (!value) return "—";
   const date = new Date(value);
   return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
};

export default function DocumentsPage() {
   const { can } = useAuth();
   const canUpload = can("documents", "create");
   const canDelete = can("documents", "delete");
   const canView = can("documents", "view");
   const [documents, setDocuments] = useState([]);
   const [loading, setLoading] = useState(true);
   const [uploading, setUploading] = useState(false);
   const [showUpload, setShowUpload] = useState(false);
   const [filterEntityType, setFilterEntityType] = useState("");
   const [filterEntityId, setFilterEntityId] = useState("");
   const [search, setSearch] = useState("");
   const [error, setError] = useState("");
   const [uploadForm, setUploadForm] = useState(EMPTY_UPLOAD);

   const loadDocuments = useCallback(async () => {
      setLoading(true);
      setError("");
      try {
         const params = {};
         if (filterEntityType) params.entityType = filterEntityType;
         if (filterEntityId.trim()) params.entityId = filterEntityId.trim();
         const response = await getDocuments(params);
         setDocuments(response.data?.data || []);
      } catch (loadError) {
         setError(loadError.response?.data?.message || "Unable to load documents.");
      } finally {
         setLoading(false);
      }
   }, [filterEntityId, filterEntityType]);

   useEffect(() => {
      if (!canView) return undefined;
      let current = true;
      const params = {};
      if (filterEntityType) params.entityType = filterEntityType;
      if (filterEntityId.trim()) params.entityId = filterEntityId.trim();

      getDocuments(params)
         .then((response) => {
            if (!current) return;
            setDocuments(response.data?.data || []);
            setError("");
         })
         .catch((loadError) => {
            if (current) setError(loadError.response?.data?.message || "Unable to load documents.");
         })
         .finally(() => {
            if (current) setLoading(false);
         });

      return () => {
         current = false;
      };
   }, [canView, filterEntityId, filterEntityType]);

   const filteredDocuments = useMemo(() => {
      const query = search.trim().toLowerCase();
      if (!query) return documents;
      return documents.filter((doc) =>
         [doc.name, doc.description, doc.entityId, doc.entityType, doc.uploadedBy?.name]
            .some((value) => String(value || "").toLowerCase().includes(query)),
      );
   }, [documents, search]);

   const stats = useMemo(() => ({
      total: documents.length,
      images: documents.filter((doc) => doc.fileType?.startsWith("image/")).length,
      pdfs: documents.filter((doc) => doc.fileType === "application/pdf").length,
   }), [documents]);

   const closeUpload = () => {
      setShowUpload(false);
      setUploadForm(EMPTY_UPLOAD);
   };

   const handleUpload = async (event) => {
      event.preventDefault();
      if (!uploadForm.file) {
         setError("Choose a file before uploading.");
         return;
      }

      const formData = new FormData();
      formData.append("name", uploadForm.name || uploadForm.file.name);
      formData.append("entityType", uploadForm.entityType);
      formData.append("entityId", uploadForm.entityId.trim());
      formData.append("description", uploadForm.description);
      formData.append("file", uploadForm.file);

      setUploading(true);
      setError("");
      try {
         await uploadDocument(formData);
         closeUpload();
         await loadDocuments();
      } catch (uploadError) {
         setError(uploadError.response?.data?.message || "Unable to upload this document.");
      } finally {
         setUploading(false);
      }
   };

   const handleDelete = async (doc, permanent = false) => {
      const message = permanent
         ? "Permanently delete this document? This cannot be undone."
         : "Move this document to deleted items?";
      if (!window.confirm(message)) return;
      setError("");
      try {
         if (permanent) await hardDeleteDocument(doc._id);
         else await deleteDocument(doc._id);
         await loadDocuments();
      } catch (deleteError) {
         setError(deleteError.response?.data?.message || "Unable to delete this document.");
      }
   };

   const handleDownload = async (doc) => {
      setError("");
      try {
         const response = await downloadDocument(doc._id);
         const url = window.URL.createObjectURL(new Blob([response.data]));
         const link = document.createElement("a");
         link.href = url;
         link.download = doc.name || "document";
         document.body.appendChild(link);
         link.click();
         link.remove();
         window.URL.revokeObjectURL(url);
      } catch (downloadError) {
         setError(downloadError.response?.data?.message || "Unable to download this document.");
      }
   };

   const uploadFooter = (
      <>
         <Button variant="secondary" onClick={closeUpload}>Cancel</Button>
         <Button variant="primary" icon={FiUploadCloud} type="submit" form="document-upload-form" loading={uploading}>
            Upload document
         </Button>
      </>
   );

   const documentActions = (doc) => (
      <div className="flex flex-wrap items-center gap-2">
         {canView && doc.url && (
            <Button variant="ghost" size="sm" icon={FiDownload} onClick={() => handleDownload(doc)} aria-label={`Download ${doc.name}`}>
               Download
            </Button>
         )}
         {canDelete && (
            <>
               <Button variant="ghost" size="sm" icon={FiTrash2} onClick={() => handleDelete(doc)} aria-label={`Delete ${doc.name}`}>
                  Delete
               </Button>
               <Button variant="ghost" size="sm" className="text-[#c23b3b]" onClick={() => handleDelete(doc, true)} aria-label={`Permanently delete ${doc.name}`}>
                  Permanent
               </Button>
            </>
         )}
      </div>
   );

   if (!canView) {
      return (
         <div className="surface-card p-8 text-center">
            <h1 className="text-lg font-bold text-ink-900">Documents are restricted</h1>
            <p className="mt-2 text-sm text-ink-500">Your role does not have permission to view the document library.</p>
         </div>
      );
   }

   return (
      <div className="space-y-4">
         <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
               <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-500">Workspace / Library</p>
               <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">Documents</h1>
               <p className="mt-1 text-sm text-ink-500">Project files, site records and company documents in one place.</p>
            </div>
            {canUpload && (
               <Button variant="primary" icon={FiUploadCloud} onClick={() => setShowUpload(true)}>
                  Upload document
               </Button>
            )}
         </header>

         {error && documents.length > 0 && (
            <div role="alert" className="rounded-2xl border border-[rgba(224,82,82,0.2)] bg-[rgba(224,82,82,0.06)] px-4 py-3 text-sm font-medium text-[#b83e3e]">
               {error}
            </div>
         )}

         <section aria-label="Document summary" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SummaryCard icon={FiFolder} label="Total documents" value={stats.total} />
            <SummaryCard icon={FiImage} label="Photos & images" value={stats.images} />
            <SummaryCard icon={FiFileText} label="PDF files" value={stats.pdfs} />
         </section>

         <section className="surface-card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[minmax(15rem,1fr)_minmax(11rem,0.6fr)_minmax(12rem,0.7fr)_auto]">
            <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, entity or uploader…" />
            <FilterSelect
               value={filterEntityType}
               onChange={(event) => {
                  setLoading(true);
                  setFilterEntityType(event.target.value);
               }}
               options={[{ value: "", label: "All entity types" }, ...ENTITY_TYPES]}
            />
            <input
               value={filterEntityId}
               onChange={(event) => {
                  setLoading(true);
                  setFilterEntityId(event.target.value);
               }}
               onKeyDown={(event) => {
                  if (event.key === "Enter") {
                     event.preventDefault();
                     loadDocuments();
                  }
               }}
               placeholder="Related record ID"
               aria-label="Filter by related record ID"
               className="input"
            />
            <Button variant="secondary" onClick={loadDocuments} loading={loading}>Apply filters</Button>
         </section>

         {loading ? (
            <TableSkeleton rows={5} cols={5} />
         ) : error && documents.length === 0 && !showUpload ? (
            <TableShell><ErrorState message={error} onRetry={loadDocuments} /></TableShell>
         ) : filteredDocuments.length === 0 ? (
            <TableShell>
               <EmptyState
                  icon={FiFolder}
                  title={search || filterEntityId || filterEntityType ? "No matching documents" : "No documents yet"}
                  message={search || filterEntityId || filterEntityType
                     ? "Adjust your search or filters to find a document."
                     : "Upload a document and link it to a project, site record or company entity."}
                  action={canUpload ? <Button variant="primary" icon={FiUploadCloud} onClick={() => setShowUpload(true)}>Upload document</Button> : null}
               />
            </TableShell>
         ) : (
            <TableShell>
               <TableHead
                  title="Document library"
                  subtitle={`${filteredDocuments.length} document${filteredDocuments.length === 1 ? "" : "s"}`}
                  icon={FiHardDrive}
               />
               <div className="space-y-3 p-3 md:hidden">
                  {filteredDocuments.map((doc) => {
                     const Icon = fileIcon(doc.fileType);
                     return (
                        <article key={doc._id} className="rounded-2xl border border-line bg-white p-4">
                           <div className="flex items-start gap-3">
                              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-500"><Icon size={18} /></span>
                              <div className="min-w-0 flex-1">
                                 <h3 className="break-words text-sm font-bold text-ink-900">{doc.name}</h3>
                                 {doc.description && <p className="mt-1 line-clamp-2 text-xs text-ink-500">{doc.description}</p>}
                                 <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <StatusBadge status={ENTITY_TYPES.find((type) => type.value === doc.entityType)?.label || doc.entityType} />
                                    <span className="text-xs text-ink-500">{formatFileSize(doc.size)} · {formatDate(doc.createdAt)}</span>
                                 </div>
                                 <p className="mt-2 break-all text-xs text-ink-500">ID: {doc.entityId || "—"} · {doc.uploadedBy?.name || "Unknown uploader"}</p>
                              </div>
                           </div>
                           <div className="mt-3 border-t border-line pt-3">{documentActions(doc)}</div>
                        </article>
                     );
                  })}
               </div>
               <TableWrap>
                  <table className="data-table min-w-[850px]">
                     <thead>
                        <tr>
                           <th>Document</th>
                           <th>Linked record</th>
                           <th>Size</th>
                           <th>Uploaded by</th>
                           <th>Date added</th>
                           <th className="text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {filteredDocuments.map((doc) => {
                           const Icon = fileIcon(doc.fileType);
                           return (
                              <tr key={doc._id}>
                                 <td>
                                    <div className="flex min-w-0 items-center gap-3">
                                       <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-500"><Icon size={17} /></span>
                                       <div className="min-w-0">
                                          <p className="max-w-[18rem] truncate font-semibold text-ink-900">{doc.name}</p>
                                          <p className="max-w-[18rem] truncate text-xs text-ink-500">{doc.description || doc.fileType || "Document file"}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td>
                                    <StatusBadge status={ENTITY_TYPES.find((type) => type.value === doc.entityType)?.label || doc.entityType} />
                                    <p className="mt-1 max-w-[13rem] truncate font-mono text-[0.68rem] text-ink-400">{doc.entityId || "—"}</p>
                                 </td>
                                 <td>{formatFileSize(doc.size)}</td>
                                 <td>{doc.uploadedBy?.name || "Unknown"}</td>
                                 <td>{formatDate(doc.createdAt)}</td>
                                 <td><RowActions>{documentActions(doc)}</RowActions></td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
               </TableWrap>
            </TableShell>
         )}

         <Modal
            isOpen={showUpload}
            onClose={closeUpload}
            title="Upload document"
            subtitle="Add a file to the shared construction workspace."
            size="lg"
            footer={uploadFooter}
         >
            <form id="document-upload-form" onSubmit={handleUpload} className="grid gap-4 sm:grid-cols-2">
               {error && <div role="alert" className="rounded-xl border border-[rgba(224,82,82,0.2)] bg-[rgba(224,82,82,0.06)] px-3 py-2 text-sm text-[#b83e3e] sm:col-span-2">{error}</div>}
               <Field label="Document name">
                  <input
                     value={uploadForm.name}
                     onChange={(event) => setUploadForm({ ...uploadForm, name: event.target.value })}
                     placeholder={uploadForm.file?.name || "Use the file name"}
                     className="input"
                  />
               </Field>
               <Field label="Entity type" required>
                  <select
                     value={uploadForm.entityType}
                     onChange={(event) => setUploadForm({ ...uploadForm, entityType: event.target.value })}
                     className="select"
                  >
                     {ENTITY_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                  </select>
               </Field>
               <Field label="Related record ID" required>
                  <input
                     value={uploadForm.entityId}
                     onChange={(event) => setUploadForm({ ...uploadForm, entityId: event.target.value })}
                     placeholder="Paste the linked record ID"
                     className="input"
                     required
                  />
               </Field>
               <Field label="File" required>
                  <input
                     type="file"
                     onChange={(event) => setUploadForm({ ...uploadForm, file: event.target.files?.[0] || null })}
                     className="input file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:font-semibold file:text-brand-600"
                     accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                     required
                  />
               </Field>
               <Field label="Description">
                  <textarea
                     value={uploadForm.description}
                     onChange={(event) => setUploadForm({ ...uploadForm, description: event.target.value })}
                     className="input min-h-24"
                     rows={3}
                     placeholder="Add context for other team members"
                  />
               </Field>
               <p className="self-end text-xs text-ink-500">JPG, PNG, WEBP, GIF, PDF, Word, Excel or TXT · Max 25 MB</p>
            </form>
         </Modal>
      </div>
   );
}

function SummaryCard({ icon: Icon, label, value }) {
   return (
      <div className="surface-card flex items-center gap-3 p-4">
         <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-500"><Icon size={18} /></span>
         <div>
            <p className="text-xs font-semibold text-ink-500">{label}</p>
            <p className="mt-0.5 text-xl font-extrabold text-ink-900">{value}</p>
         </div>
      </div>
   );
}

function Field({ label, required, children }) {
   return (
      <label className="flex min-w-0 flex-col gap-1.5 text-xs font-semibold text-ink-600">
         <span>{label}{required && <span className="text-[#c23b3b]"> *</span>}</span>
         {children}
      </label>
   );
}
