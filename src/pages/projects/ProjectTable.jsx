import {
   deleteProject,
   updateProject,
   updateRevenue,
} from "../../services/projectService";

import { useState } from "react";
import { Link } from "react-router-dom";

const statuses = [
   ["planning", "Planning"],
   ["tender", "Tender"],
   ["awarded", "Awarded"],
   ["mobilization", "Mobilization"],
   ["in_progress", "In Progress"],
   ["on_hold", "On Hold"],
   ["completed", "Completed"],
   ["cancelled", "Cancelled"],
];

export default function ProjectTable({ projects, loadProjects }) {
   const [revenueForm, setRevenueForm] = useState({});

   const remove = async (id) => {
      await deleteProject(id);
      loadProjects();
   };

   const changeStatus = async (id, status) => {
      try {
         await updateProject(id, { status });
         loadProjects();
      } catch (error) {
         console.log(error);
      }
   };

   const saveRevenue = async (id, contractValue, receivedAmount) => {
      try {
         await updateRevenue(id, {
            contractValue: Number(contractValue),
            receivedAmount: Number(receivedAmount),
         });
         loadProjects();
      } catch (error) {
         console.log(error);
      }
   };

   return (
      <div className="bg-white rounded p-5 overflow-x-auto">
         <table className="w-full">
            <thead>
               <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Client</th>
                  <th>Manager</th>
                  <th>Budget</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Progress</th>
                  <th>Received</th>
                  <th>Action</th>
               </tr>
            </thead>

            <tbody>
               {projects.map((item) => (
                  <tr key={item._id} className="border-t">
                     <td>{item.projectCode}</td>
                     <td>
                        <Link to={`/projects/${item._id}`} className="text-blue-600 underline">
                           {item.name}
                        </Link>
                     </td>
                     <td>{item.client?.name || "-"}</td>
                     <td>{item.projectManager?.name || "-"}</td>
                     <td>{item.budget}</td>
                     <td>
                        <select
                           value={item.status}
                           onChange={(e) => changeStatus(item._id, e.target.value)}
                           className="border p-1 rounded"
                        >
                           {statuses.map(([v, l]) => (
                              <option key={v} value={v}>{l}</option>
                           ))}
                        </select>
                     </td>
                     <td>{item.priority || "medium"}</td>
                     <td>{item.progress || 0}%</td>
                     <td>
                        <input
                           type="number"
                           defaultValue={item.receivedAmount}
                           onChange={(e) =>
                              setRevenueForm({
                                 ...revenueForm,
                                 [item._id]: {
                                    ...revenueForm[item._id],
                                    receivedAmount: e.target.value,
                                 },
                              })
                           }
                           className="border p-1 w-28 rounded"
                        />
                     </td>
                     <td className="space-x-2">
                        <button
                           onClick={() =>
                              saveRevenue(
                                 item._id,
                                 revenueForm[item._id]?.contractValue ?? item.contractValue,
                                 revenueForm[item._id]?.receivedAmount ?? item.receivedAmount,
                              )
                           }
                           className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                           Save
                        </button>
                        <button
                           onClick={() => remove(item._id)}
                           className="bg-red-600 text-white px-3 py-1 rounded"
                        >
                           Delete
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   );
}
