import api from "../api/axios";
export const getDepartments = () => api.get("/hr/departments");
export const createDepartment = (data) => api.post("/hr/departments", data);
export const updateDepartment = (id, data) => api.put(`/hr/departments/${id}`, data);
export const deleteDepartment = (id) => api.delete(`/hr/departments/${id}`);
export const getDesignations = () => api.get("/hr/designations");
export const createDesignation = (data) => api.post("/hr/designations", data);
export const updateDesignation = (id, data) => api.put(`/hr/designations/${id}`, data);
export const deleteDesignation = (id) => api.delete(`/hr/designations/${id}`);
export const getLeaveRequests = (params = {}) => api.get("/hr/leaves", { params });
export const getLeaveEmployees = () => api.get("/hr/leave-employees");
export const createLeaveRequest = (data) => api.post("/hr/leaves", data);
export const reviewLeaveRequest = (id, action, note = "") =>
   api.put(`/hr/leaves/${id}/manager-review`, { action, note });
export const approveLeaveRequest = (id, action, note = "") =>
   api.put(`/hr/leaves/${id}/hr-review`, { action, note });
export const getSalaryStructures = () => api.get("/hr/salary-structures");
export const createSalaryStructure = (data) => api.post("/hr/salary-structures", data);
export const getPayrollPeriods = () => api.get("/hr/payroll-periods");
export const createPayrollPeriod = (data) => api.post("/hr/payroll-periods", data);
export const generatePayroll = (id) => api.post(`/hr/payroll-periods/${id}/generate`);
export const getPayrollEntries = (id) => api.get(`/hr/payroll-periods/${id}/entries`);
export const updatePayrollEntry = (id, data) => api.put(`/hr/payroll-entries/${id}`, data);
export const approvePayrollPeriod = (id) => api.put(`/hr/payroll-periods/${id}/approve`);
export const getPayslip = (id) => api.get(`/hr/payroll-entries/${id}/payslip`);
export const getMyPayslips = () => api.get("/hr/my-payslips");
export const getMyPayslip = (id) => api.get(`/hr/my-payslips/${id}`);
export const getPayrollReport = (params = {}) => api.get("/hr/payroll-reports", { params });

export const getEmployees = (page = 1, limit = 10, search = "") =>
   api.get(`/employees?page=${page}&limit=${limit}&search=${search}`);

export const getEmployee = (id) => api.get(`/employees/${id}`);

export const createEmployee = (data) => api.post("/employees", data);

export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data);

export const deleteEmployee = (id) => api.delete(`/employees/${id}`);
