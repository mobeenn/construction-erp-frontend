export default function EmployeeModal({
   isOpen,

   onClose,

   children,
}) {
   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
         <div className="bg-white w-[800px] rounded-lg p-6">
            <div className="flex justify-between items-center mb-5">
               <h2 className="text-xl font-bold">Employee</h2>

               <button onClick={onClose}>X</button>
            </div>

            {children}
         </div>
      </div>
   );
}
