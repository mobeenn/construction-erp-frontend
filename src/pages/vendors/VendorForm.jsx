import { useState } from "react";

import { createVendor } from "../../services/vendorService";
import { useToast } from "../../components/ui/ToastContext";
import Button from "../../components/ui/Button";

const empty = { companyName: "", contactPerson: "", phone: "", email: "", address: "" };

export default function VendorForm({ loadVendors }) {
   const toast = useToast();
   const [form, setForm] = useState(empty);
   const [saving, setSaving] = useState(false);

   const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
   };

   const submit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         await createVendor(form);
         setForm(empty);
         toast.success("Vendor created successfully.");
         loadVendors();
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to create vendor.");
      } finally {
         setSaving(false);
      }
   };

   return (
      <form onSubmit={submit} className="space-y-5">
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Company name">
               <input name="companyName" className="input" placeholder="Supplier name" value={form.companyName} onChange={handleChange} required />
            </Field>
            <Field label="Contact person">
               <input name="contactPerson" className="input" placeholder="Full name" value={form.contactPerson} onChange={handleChange} />
            </Field>
            <Field label="Phone">
               <input name="phone" className="input" placeholder="Phone number" value={form.phone} onChange={handleChange} />
            </Field>
            <Field label="Email">
               <input name="email" type="email" className="input" placeholder="name@company.com" value={form.email} onChange={handleChange} />
            </Field>
            <Field label="Address">
               <input name="address" className="input sm:col-span-2" placeholder="Street, city" value={form.address} onChange={handleChange} />
            </Field>
         </div>
         <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={saving}>
               Create Vendor
            </Button>
         </div>
      </form>
   );
}

function Field({ label, children }) {
   return (
      <label className="block">
         <span className="field-label">{label}</span>
         {children}
      </label>
   );
}
