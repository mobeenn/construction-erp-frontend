import { useEffect, useState } from "react";

import { getDailyAttendance } from "../../services/attendanceService";
import { useToast } from "../../components/ui/ToastContext";
import Button from "../../components/ui/Button";
import { FiPlus } from "react-icons/fi";
import Modal from "../../components/ui/Modal";
import AttendanceForm from "./AttendanceForm";
import AttendanceTable from "./AttendanceTable";
import { TableSkeleton } from "../../components/ui/States";

export default function AttendancePage() {
   const toast = useToast();
   const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
   const [attendance, setAttendance] = useState([]);
   const [loading, setLoading] = useState(true);
   const [open, setOpen] = useState(false);

   const loadAttendance = async (showLoader = true) => {
      if (showLoader) setLoading(true);
      try {
         const res = await getDailyAttendance(date);
         setAttendance(res.data.data || []);
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to load attendance.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadAttendance();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [date]);

   return (
      <div className="space-y-4">
         <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-3">
               <span className="field-label !mb-0">Date</span>
               <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input !w-auto"
               />
            </label>
            <Button variant="primary" icon={FiPlus} onClick={() => setOpen(true)}>
               Mark Attendance
            </Button>
         </div>

         {loading ? (
            <TableSkeleton rows={5} cols={4} />
         ) : (
            <AttendanceTable attendance={attendance} />
         )}

         <Modal
            isOpen={open}
            onClose={() => setOpen(false)}
            title="Mark Attendance"
            subtitle="Record attendance for a team member."
            size="md"
         >
            <AttendanceForm
               onDone={() => {
                  setOpen(false);
                  loadAttendance(false);
               }}
            />
         </Modal>
      </div>
   );
}
