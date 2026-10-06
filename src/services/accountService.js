import api from "../api/axios";

// Account Categories
export const getAccountCategories = () => api.get("/accounts/categories");
export const createAccountCategory = (data) => api.post("/accounts/categories", data);
export const updateAccountCategory = (id, data) => api.put(`/accounts/categories/${id}`, data);
export const deleteAccountCategory = (id) => api.delete(`/accounts/categories/${id}`);

// Accounts
export const getAccounts = (params) => api.get("/accounts", { params });
export const createAccount = (data) => api.post("/accounts", data);
export const updateAccount = (id, data) => api.put(`/accounts/${id}`, data);
export const deleteAccount = (id) => api.delete(`/accounts/${id}`);

// Journal Entries
export const getJournalEntries = (params) => api.get("/accounts/journal-entries", { params });
export const getJournalEntry = (id) => api.get(`/accounts/journal-entries/${id}`);
export const createJournalEntry = (data) => api.post("/accounts/journal-entries", data);
export const updateJournalEntry = (id, data) => api.put(`/accounts/journal-entries/${id}`, data);
export const deleteJournalEntry = (id) => api.delete(`/accounts/journal-entries/${id}`);

// Customer Payments
export const getCustomerPayments = (params) => api.get("/accounts/customer-payments", { params });
export const createCustomerPayment = (data) => api.post("/accounts/customer-payments", data);
export const updateCustomerPayment = (id, data) => api.put(`/accounts/customer-payments/${id}`, data);
export const deleteCustomerPayment = (id) => api.delete(`/accounts/customer-payments/${id}`);

// Vendor Payments
export const getVendorPayments = (params) => api.get("/accounts/vendor-payments", { params });
export const createVendorPayment = (data) => api.post("/accounts/vendor-payments", data);
export const updateVendorPayment = (id, data) => api.put(`/accounts/vendor-payments/${id}`, data);
export const deleteVendorPayment = (id) => api.delete(`/accounts/vendor-payments/${id}`);

// Cash Accounts
export const getCashAccounts = () => api.get("/accounts/cash-accounts");
export const createCashAccount = (data) => api.post("/accounts/cash-accounts", data);
export const updateCashAccount = (id, data) => api.put(`/accounts/cash-accounts/${id}`, data);
export const deleteCashAccount = (id) => api.delete(`/accounts/cash-accounts/${id}`);

// Bank Accounts
export const getBankAccounts = () => api.get("/accounts/bank-accounts");
export const createBankAccount = (data) => api.post("/accounts/bank-accounts", data);
export const updateBankAccount = (id, data) => api.put(`/accounts/bank-accounts/${id}`, data);
export const deleteBankAccount = (id) => api.delete(`/accounts/bank-accounts/${id}`);

// Financial Reports
export const getGeneralLedger = (params) => api.get("/accounts/general-ledger", { params });
export const getTrialBalance = () => api.get("/accounts/trial-balance");
export const getProfitLossReport = () => api.get("/accounts/profit-loss");
export const getBalanceSheet = () => api.get("/accounts/balance-sheet");

// AR / AP
export const getAccountsReceivable = () => api.get("/accounts/accounts-receivable");
export const getAccountsPayable = () => api.get("/accounts/accounts-payable");

// Project Allocations
export const getProjectExpenseAllocation = (projectId) => api.get(`/accounts/project-expense-allocation/${projectId}`);
export const getProjectRevenueAllocation = (projectId) => api.get(`/accounts/project-revenue-allocation/${projectId}`);
