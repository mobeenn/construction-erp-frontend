import { Link } from "react-router-dom";
import { FiArrowLeft, FiLock } from "react-icons/fi";

export default function Forbidden() {
   return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
         <div className="surface-card w-full max-w-md p-8 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[rgba(224,82,82,0.1)] text-[#E05252]">
               <FiLock size={26} />
            </span>
            <h1 className="mt-5 font-display text-xl font-extrabold text-ink-900">
               Access restricted
            </h1>
            <p className="mt-2 text-sm text-ink-500">
               You don't have permission to view this page. Contact your administrator
               if you believe this is a mistake.
            </p>
            <Link to="/" className="btn btn-primary mt-6 inline-flex">
               <FiArrowLeft size={16} />
               Back to dashboard
            </Link>
         </div>
      </div>
   );
}
