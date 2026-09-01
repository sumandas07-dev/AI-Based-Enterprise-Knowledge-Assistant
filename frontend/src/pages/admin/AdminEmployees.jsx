import React, { useEffect, useState, useRef } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Upload, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Loader, 
  X,
  UserCheck,
  Building,
  Mail,
  UserPlus
} from 'lucide-react';
import { employeeApi } from '../../api/api';
import { Button } from '../../components/common/Button';

export const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Form & Results states
  const [formData, setFormData] = useState({ empId: '', name: '', email: '', department: '' });
  const [createdEmployeeResult, setCreatedEmployeeResult] = useState(null);
  
  const [importFile, setImportFile] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const fileInputRef = useRef(null);

  const fetchEmployees = async (query = "") => {
    setLoading(true);
    setError('');
    try {
      const data = await employeeApi.getEmployees(query);
      setEmployees(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch employee database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmployees(search);
  };

  const handleToggleStatus = async (id) => {
    try {
      await employeeApi.toggleStatus(id);
      fetchEmployees(search);
    } catch (err) {
      console.error(err);
      alert('Failed to change employee status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee? This action is permanent.')) return;
    try {
      await employeeApi.deleteEmployee(id);
      fetchEmployees(search);
    } catch (err) {
      console.error(err);
      alert('Failed to delete employee.');
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await employeeApi.createEmployee(formData);
      setCreatedEmployeeResult({
        empId: formData.empId,
        name: result.name,
        email: result.email,
        temporaryPassword: result.temporaryPassword
      });
      setShowAddModal(false);
      setFormData({ empId: '', name: '', email: '', department: '' });
      fetchEmployees();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create employee.');
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await employeeApi.updateEmployee(selectedEmployee._id, {
        name: formData.name,
        email: formData.email,
        department: formData.department
      });
      setShowEditModal(false);
      setSelectedEmployee(null);
      setFormData({ empId: '', name: '', email: '', department: '' });
      fetchEmployees();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update employee.');
    }
  };

  const handleImportEmployees = async (e) => {
    e.preventDefault();
    if (!importFile) return;
    setImporting(true);
    setImportProgress(0);
    setError('');
    setImportResult(null);

    try {
      const result = await employeeApi.importEmployees(importFile, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setImportProgress(percent);
      });
      setImportResult(result);
      setImportFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchEmployees();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to parse Excel import.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6 text-slate-100 bg-slate-950 min-h-screen space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Employee Database</h1>
          <p className="mt-1 text-slate-400">View details, create login credentials, or perform bulk uploads.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setFormData({ empId: '', name: '', email: '', department: '' });
              setError('');
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 py-2 px-4 rounded-lg font-medium text-white shadow-lg transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Add Employee
          </Button>
          <Button
            onClick={() => {
              setError('');
              setImportResult(null);
              setShowImportModal(true);
            }}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 py-2 px-4 rounded-lg border border-slate-700 font-medium text-white transition-colors"
          >
            <Upload className="h-4 w-4" />
            Import Excel
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex max-w-md gap-3 bg-slate-900 border border-slate-800 rounded-lg p-1.5 focus-within:ring-2 focus-within:ring-indigo-500/20">
        <div className="flex items-center pl-2 text-slate-500">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          placeholder="Search by name, email, department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent border-0 text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-sm"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3.5 py-1.5 rounded-md font-medium transition-colors"
        >
          Search
        </button>
      </form>

      {/* Main List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader className="h-10 w-10 animate-spin text-indigo-500" />
        </div>
      ) : employees.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-16 text-center">
          <Users className="mx-auto h-12 w-12 text-slate-600" />
          <h3 className="mt-4 text-lg font-medium text-slate-300">No employees found</h3>
          <p className="mt-2 text-sm text-slate-500">Try modifying your search filter or add a new employee profile.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/20 shadow-md">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Employee ID</th>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {employees.map((emp) => (
                <tr key={emp._id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-indigo-400 font-semibold">{emp.empId}</td>
                  <td className="px-6 py-4 font-medium text-white">{emp.name}</td>
                  <td className="px-6 py-4 text-slate-400">{emp.email}</td>
                  <td className="px-6 py-4 text-slate-400">{emp.department || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                      emp.isActive
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${emp.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                      {emp.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(emp._id)}
                        title={emp.isActive ? 'Deactivate Employee' : 'Activate Employee'}
                        className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        {emp.isActive ? <ToggleRight className="h-5 w-5 text-indigo-400" /> : <ToggleLeft className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setFormData({ empId: emp.empId || '', name: emp.name, email: emp.email, department: emp.department || '' });
                          setError('');
                          setShowEditModal(true);
                        }}
                        title="Edit Details"
                        className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(emp._id)}
                        title="Delete Profile"
                        className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Create Employee Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            {error && <div className="rounded border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">{error}</div>}
            <form onSubmit={handleCreateEmployee} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-300 font-medium">Employee ID</label>
                <input
                  type="text"
                  required
                  value={formData.empId}
                  onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="EMP001"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="jane.doe@enterprise.com"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Sales, Human Resources"
                />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" onClick={() => setShowAddModal(false)} className="bg-slate-800 text-white border border-slate-700 px-4 py-2 hover:bg-slate-700">Cancel</Button>
                <Button type="submit" className="bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-500">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Modify Employee Details</h3>
              <button onClick={() => { setShowEditModal(false); setSelectedEmployee(null); }} className="text-slate-500 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            {error && <div className="rounded border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">{error}</div>}
            <form onSubmit={handleUpdateEmployee} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-300 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" onClick={() => { setShowEditModal(false); setSelectedEmployee(null); }} className="bg-slate-800 text-white border border-slate-700 px-4 py-2 hover:bg-slate-700">Cancel</Button>
                <Button type="submit" className="bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-500">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Import Employees via Excel</h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-500 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && <div className="rounded border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">{error}</div>}

            {importResult && (
              <div className="space-y-2 border border-slate-800 bg-slate-950 p-4 rounded-lg text-xs">
                <p className="font-bold text-indigo-400">Import complete results:</p>
                <p className="text-green-400">✓ {importResult.result?.createdEmployees?.length || 0} employees added successfully.</p>
                {importResult.result?.failedEmployees?.length > 0 && (
                  <div className="text-red-400 space-y-1">
                    <p className="font-semibold">✗ Failed rows ({importResult.result.failedEmployees.length}):</p>
                    <ul className="list-disc pl-4 max-h-32 overflow-y-auto">
                      {importResult.result.failedEmployees.map((f, i) => (
                        <li key={i}>{f.row.email || f.row.name || 'Row ' + f.rowNumber}: {f.reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleImportEmployees} className="space-y-4 text-sm">
              <div className="border-2 border-dashed border-slate-800 rounded-lg p-6 text-center hover:border-indigo-500/50 transition-colors">
                <Upload className="mx-auto h-8 w-8 text-slate-500" />
                <p className="mt-2 text-slate-300">Choose Excel sheet (.xlsx, .xls)</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx,.xls"
                  onChange={(e) => setImportFile(e.target.files[0])}
                  className="mt-4 text-xs text-slate-500"
                />
              </div>

              {importing && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Uploading...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded overflow-hidden">
                    <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${importProgress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" onClick={() => setShowImportModal(false)} className="bg-slate-800 text-white border border-slate-700 px-4 py-2 hover:bg-slate-700">Close</Button>
                <Button type="submit" disabled={!importFile || importing} className="bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-500">
                  {importing ? 'Processing...' : 'Upload & Parse'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Temporary Password Success Modal */}
      {createdEmployeeResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-green-400">Employee Created Successfully</h3>
              <button onClick={() => setCreatedEmployeeResult(null)} className="text-slate-500 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Provide this temporary password to the employee. They will be prompted to reset it on their first login. This password will not be shown again.
            </p>
            <div className="border border-slate-800 bg-slate-950 p-4 rounded-lg space-y-2.5 text-sm font-medium">
              <div className="flex justify-between">
                <span className="text-slate-400">Employee ID:</span>
                <span className="text-white font-mono">{createdEmployeeResult.empId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Full Name:</span>
                <span className="text-white">{createdEmployeeResult.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-white">{createdEmployeeResult.email}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-indigo-400 font-bold">Temporary Password:</span>
                <span className="text-green-400 font-mono font-bold bg-green-500/10 px-2.5 py-1 rounded border border-green-500/20">
                  {createdEmployeeResult.temporaryPassword}
                </span>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <Button onClick={() => setCreatedEmployeeResult(null)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
