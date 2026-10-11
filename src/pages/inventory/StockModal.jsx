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
            className="input"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
         />

         <input
            className="input"
            placeholder="Remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
         />

         <button type="button" onClick={submit} className="btn btn-primary">
            {type}
         </button>
      </div>
   );
}
