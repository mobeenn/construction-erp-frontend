import { useState } from "react";

export default function StockModal({
   type,

   item,

   action,
}) {
   const [quantity, setQuantity] = useState("");

   const [remarks, setRemarks] = useState("");

   const submit = async () => {
      await action(item._id, {
         quantity: Number(quantity),

         remarks,
      });

      window.location.reload();
   };

   return (
      <div className="flex gap-2">
         <input
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
         />

         <input
            placeholder="Remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
         />

         <button onClick={submit} className="bg-green-600 text-white px-4">
            {type}
         </button>
      </div>
   );
}
