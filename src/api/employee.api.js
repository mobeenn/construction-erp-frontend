import api from "./axios";

// Get all employees
export const getEmployees = async () => {
   const res = await api.get("/employees");
   return res.data;
};

// Create employee
export const createEmployee = async (data) => {
   const res = await api.post("/employees", data);
   return res.data;
};

// Update employee
export const updateEmployee = async (id, data) => {
   const res = await api.put(`/employees/${id}`, data);
   return res.data;
};

// Delete employee
export const deleteEmployee = async (id) => {
   const res = await api.delete(`/employees/${id}`);
   return res.data;
};
