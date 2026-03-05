import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import ItemsList from './pages/inventory/ItemsList';
import NewItemForm from './pages/inventory/NewItemForm';
import CategoriesList from './pages/inventory/CategoriesList';
import UnitsList from './pages/inventory/UnitsList';
import WarehousesList from './pages/inventory/WarehousesList';
import TransactionsLog from './pages/inventory/TransactionsLog';
import TransfersList from './pages/inventory/TransfersList';
import TransferCreate from './pages/inventory/TransferCreate';
import AdjustmentsList from './pages/inventory/AdjustmentsList';
import AdjustmentCreate from './pages/inventory/AdjustmentCreate';
import CustomersList from './pages/sales/CustomersList';
import NewCustomerForm from './pages/sales/NewCustomerForm';
import OrdersList from './pages/sales/OrdersList';
import NewOrder from './pages/sales/NewOrder';
import OrderDetails from './pages/sales/OrderDetails';
import OrderEdit from './pages/sales/OrderEdit';
import CustomerDetails from './pages/sales/CustomerDetails';
import CustomerEdit from './pages/sales/CustomerEdit';
import QuotationsList from './pages/sales/QuotationsList';
import NewQuotation from './pages/sales/NewQuotation';
import QuotationDetails from './pages/sales/QuotationDetails';
import InvoicesList from './pages/sales/InvoicesList';
import InvoiceDetails from './pages/sales/InvoiceDetails';
import ReturnsList from './pages/sales/ReturnsList';
import NewReturn from './pages/sales/NewReturn';
import ReturnDetails from './pages/sales/ReturnDetails';

import PurchaseOrdersList from './pages/purchases/PurchaseOrdersList';
import VendorsList from './pages/purchases/VendorsList';
import NewPurchaseOrder from './pages/purchases/NewPurchaseOrder';
import PurchaseOrderDetails from './pages/purchases/PurchaseOrderDetails';
import PurchaseOrderEdit from './pages/purchases/PurchaseOrderEdit';
import VendorDetails from './pages/purchases/VendorDetails';
import VendorEdit from './pages/purchases/VendorEdit';
import ReceiptsList from './pages/purchases/ReceiptsList';
import NewReceipt from './pages/purchases/NewReceipt';
import ReceiptDetails from './pages/purchases/ReceiptDetails';
import VendorInvoicesList from './pages/purchases/VendorInvoicesList';
import NewVendorInvoice from './pages/purchases/NewVendorInvoice';
import VendorInvoiceDetails from './pages/purchases/VendorInvoiceDetails';
import PurchaseReturnsList from './pages/purchases/PurchaseReturnsList';
import NewPurchaseReturn from './pages/purchases/NewPurchaseReturn';

import ItemDetails from './pages/inventory/ItemDetails';
import ItemEdit from './pages/inventory/ItemEdit';

import AccountsList from './pages/accounting/AccountsList';
import JournalList from './pages/accounting/JournalList';
import ReportsPage from './pages/accounting/ReportsPage';
import EmployeesList from './pages/hr/EmployeesList';
import DepartmentsList from './pages/hr/DepartmentsList';
import AttendancePage from './pages/hr/AttendancePage';
import EmployeeUpsertPage from './pages/hr/employees/EmployeeUpsertPage';

import LeadsList from './pages/crm/LeadsList';
import ContactsList from './pages/crm/ContactsList';
import NewLeadForm from './pages/crm/NewLeadForm';
import LeadDetails from './pages/crm/LeadDetails';

import SettingsPage from './pages/settings/SettingsPage';
import UsersList from './pages/settings/users/UsersList';
import UserEditPage from './pages/settings/users/UserEditPage';
import IndustryProfilesPage from './pages/settings/IndustryProfilesPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrganizations from './pages/admin/AdminOrganizations';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="organizations" element={<AdminOrganizations />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
          </Route>

          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          {/* Inventory */}
          <Route path="/inventory/items" element={<ProtectedRoute><ItemsList /></ProtectedRoute>} />
          <Route path="/inventory/items/new" element={<ProtectedRoute><NewItemForm /></ProtectedRoute>} />
          <Route path="/inventory/items/:id" element={<ProtectedRoute><ItemDetails /></ProtectedRoute>} />
          <Route path="/inventory/items/:id/edit" element={<ProtectedRoute><ItemEdit /></ProtectedRoute>} />
          <Route path="/inventory/categories" element={<ProtectedRoute><CategoriesList /></ProtectedRoute>} />
          <Route path="/inventory/units" element={<ProtectedRoute><UnitsList /></ProtectedRoute>} />
          <Route path="/inventory/warehouses" element={<ProtectedRoute><WarehousesList /></ProtectedRoute>} />
          <Route path="/inventory/transactions" element={<ProtectedRoute><TransactionsLog /></ProtectedRoute>} />
          <Route path="/inventory/transfers" element={<ProtectedRoute><TransfersList /></ProtectedRoute>} />
          <Route path="/inventory/transfers/new" element={<ProtectedRoute><TransferCreate /></ProtectedRoute>} />
          <Route path="/inventory/adjustments" element={<ProtectedRoute><AdjustmentsList /></ProtectedRoute>} />
          <Route path="/inventory/adjustments/new" element={<ProtectedRoute><AdjustmentCreate /></ProtectedRoute>} />
          
          {/* Sales */}
          <Route path="/sales/customers" element={<ProtectedRoute><CustomersList /></ProtectedRoute>} />
          <Route path="/sales/customers/new" element={<ProtectedRoute><NewCustomerForm /></ProtectedRoute>} />
          <Route path="/sales/customers/:id" element={<ProtectedRoute><CustomerDetails /></ProtectedRoute>} />
          <Route path="/sales/customers/:id/edit" element={<ProtectedRoute><CustomerEdit /></ProtectedRoute>} />
          <Route path="/sales/orders" element={<ProtectedRoute><OrdersList /></ProtectedRoute>} />
          <Route path="/sales/orders/new" element={<ProtectedRoute><NewOrder /></ProtectedRoute>} />
          <Route path="/sales/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
          <Route path="/sales/orders/:id/edit" element={<ProtectedRoute><OrderEdit /></ProtectedRoute>} />

          {/* Sales Docs */}
          <Route path="/sales/quotations" element={<ProtectedRoute><QuotationsList /></ProtectedRoute>} />
          <Route path="/sales/quotations/new" element={<ProtectedRoute><NewQuotation /></ProtectedRoute>} />
          <Route path="/sales/quotations/:id" element={<ProtectedRoute><QuotationDetails /></ProtectedRoute>} />
          <Route path="/sales/invoices" element={<ProtectedRoute><InvoicesList /></ProtectedRoute>} />
          <Route path="/sales/invoices/:id" element={<ProtectedRoute><InvoiceDetails /></ProtectedRoute>} />
          <Route path="/sales/returns" element={<ProtectedRoute><ReturnsList /></ProtectedRoute>} />
          <Route path="/sales/returns/new" element={<ProtectedRoute><NewReturn /></ProtectedRoute>} />
          <Route path="/sales/returns/:id" element={<ProtectedRoute><ReturnDetails /></ProtectedRoute>} />
          
          {/* Purchases */}
          <Route path="/purchases/orders" element={<ProtectedRoute><PurchaseOrdersList /></ProtectedRoute>} />
          <Route path="/purchases/orders/new" element={<ProtectedRoute><NewPurchaseOrder /></ProtectedRoute>} />
          <Route path="/purchases/orders/:id" element={<ProtectedRoute><PurchaseOrderDetails /></ProtectedRoute>} />
          <Route path="/purchases/orders/:id/edit" element={<ProtectedRoute><PurchaseOrderEdit /></ProtectedRoute>} />
          <Route path="/purchases/vendors" element={<ProtectedRoute><VendorsList /></ProtectedRoute>} />
          <Route path="/purchases/vendors/:id" element={<ProtectedRoute><VendorDetails /></ProtectedRoute>} />
          <Route path="/purchases/vendors/:id/edit" element={<ProtectedRoute><VendorEdit /></ProtectedRoute>} />

          {/* Purchases Docs */}
          <Route path="/purchases/receipts" element={<ProtectedRoute><ReceiptsList /></ProtectedRoute>} />
          <Route path="/purchases/receipts/new" element={<ProtectedRoute><NewReceipt /></ProtectedRoute>} />
          <Route path="/purchases/receipts/:id" element={<ProtectedRoute><ReceiptDetails /></ProtectedRoute>} />
          <Route path="/purchases/vendor-invoices" element={<ProtectedRoute><VendorInvoicesList /></ProtectedRoute>} />
          <Route path="/purchases/vendor-invoices/new" element={<ProtectedRoute><NewVendorInvoice /></ProtectedRoute>} />
          <Route path="/purchases/vendor-invoices/:id" element={<ProtectedRoute><VendorInvoiceDetails /></ProtectedRoute>} />
          <Route path="/purchases/returns" element={<ProtectedRoute><PurchaseReturnsList /></ProtectedRoute>} />
          <Route path="/purchases/returns/new" element={<ProtectedRoute><NewPurchaseReturn /></ProtectedRoute>} />
          
          {/* Accounting */}
          <Route path="/accounting/accounts" element={<ProtectedRoute><AccountsList /></ProtectedRoute>} />
          <Route path="/accounting/journal" element={<ProtectedRoute><JournalList /></ProtectedRoute>} />
          <Route path="/accounting/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          
          {/* HR */}
          <Route path="/hr/employees" element={<ProtectedRoute><EmployeesList /></ProtectedRoute>} />
          <Route path="/hr/employees/new" element={<ProtectedRoute><EmployeeUpsertPage /></ProtectedRoute>} />
          <Route path="/hr/employees/:id" element={<ProtectedRoute><EmployeeUpsertPage /></ProtectedRoute>} />
          <Route path="/hr/departments" element={<ProtectedRoute><DepartmentsList /></ProtectedRoute>} />
          <Route path="/hr/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
          
          {/* CRM */}
          <Route path="/crm/leads" element={<ProtectedRoute><LeadsList /></ProtectedRoute>} />
          <Route path="/crm/leads/new" element={<ProtectedRoute><NewLeadForm /></ProtectedRoute>} />
          <Route path="/crm/leads/:id" element={<ProtectedRoute><LeadDetails /></ProtectedRoute>} />
          <Route path="/crm/contacts" element={<ProtectedRoute><ContactsList /></ProtectedRoute>} />
          
          {/* Settings */}
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/settings/users" element={<ProtectedRoute><UsersList /></ProtectedRoute>} />
          <Route path="/settings/users/:id" element={<ProtectedRoute><UserEditPage /></ProtectedRoute>} />
          <Route path="/settings/industry-profiles" element={<ProtectedRoute><IndustryProfilesPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
