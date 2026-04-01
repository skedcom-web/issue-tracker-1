import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box, Paper, Table, TableHead, TableBody, TableRow, TableCell,
  Button, Typography, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, Chip, Alert,
  IconButton, InputAdornment, TableContainer, Pagination,
  LinearProgress, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloseIcon from '@mui/icons-material/Close';
import { employeesApi } from '@services/api';
import type { Employee } from '@app-types/index';
import PageHeader from '@components/common/PageHeader';
import * as XLSX from 'xlsx';

// ── Types ────────────────────────────────────────────────────────
interface UploadRow {
  employeeNumber: string;
  employeeName: string;
  designation?: string;
  email?: string;
  managerEmpNo?: string;
}

interface UploadResult {
  inserted: number;
  updated: number;
  errors: string[];
}

// ── Download template ────────────────────────────────────────────
const downloadTemplate = () => {
  const wb = XLSX.utils.book_new();
  const headers = [['Employee Number', 'Employee Name', 'Designation', 'Email', 'Manager Employee No']];
  const ws = XLSX.utils.aoa_to_sheet(headers);
  ws['!cols'] = [{ wch: 20 }, { wch: 32 }, { wch: 30 }, { wch: 36 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Employee Upload');
  XLSX.writeFile(wb, 'vThink_Employee_Upload_Template.xlsx');
};

// ── Parse uploaded Excel ─────────────────────────────────────────
const parseExcel = (file: File): Promise<{ rows: UploadRow[]; errors: string[] }> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const wb   = XLSX.read(data, { type: 'array' });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const raw  = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });

      const rows: UploadRow[] = [];
      const errors: string[]  = [];

      raw.forEach((row, idx) => {
        const num  = String(row['Employee Number'] ?? '').trim();
        const name = String(row['Employee Name']   ?? '').trim();

        if (!num && !name) return; // skip blank rows

        if (!num)  { errors.push(`Row ${idx + 2}: Employee Number is required`); return; }
        if (!name) { errors.push(`Row ${idx + 2}: Employee Name is required`); return; }

        rows.push({
          employeeNumber: num,
          employeeName:   name,
          designation:    String(row['Designation']          ?? '').trim() || undefined,
          email:          String(row['Email']                ?? '').trim() || undefined,
          managerEmpNo:   String(row['Manager Employee No']  ?? '').trim() || undefined,
        });
      });

      resolve({ rows, errors });
    };
    reader.readAsArrayBuffer(file);
  });

// ────────────────────────────────────────────────────────────────
const EmployeeSetupPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Table state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);

  // Add / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<Employee | null>(null);
  const [form, setForm]           = useState({ employeeNumber: '', employeeName: '', designation: '', email: '', managerEmpNo: '' });
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState('');

  // Upload state
  const [uploadFile, setUploadFile]         = useState<File | null>(null);
  const [uploadPreview, setUploadPreview]   = useState<UploadRow[]>([]);
  const [parseErrors, setParseErrors]       = useState<string[]>([]);
  const [uploading, setUploading]           = useState(false);
  const [uploadResult, setUploadResult]     = useState<UploadResult | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const load = useCallback(async (p = 1, s = '') => {
    setLoading(true);
    try {
      const r = await employeesApi.getAll({ page: p, limit: 15, search: s || undefined });
      setEmployees(r.data.data.items);
      setTotal(r.data.data.total);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(1); }, [load]);

  const handleSearch = () => { setPage(1); load(1, search); };

  // ── File chosen ────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadResult(null);
    const { rows, errors } = await parseExcel(file);
    setUploadPreview(rows);
    setParseErrors(errors);
    setUploadModalOpen(true);
    // reset input so same file can be re-selected
    e.target.value = '';
  };

  // ── Confirm upload ─────────────────────────────────────────────
  const handleUpload = async () => {
    if (!uploadPreview.length) return;
    setUploading(true);
    try {
      const res = await employeesApi.bulkUpsert(uploadPreview);
      const d   = res.data as unknown as { data: { inserted: number; updated: number } };
      setUploadResult({ inserted: d.data.inserted, updated: d.data.updated, errors: [] });
      await load(1, search);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Upload failed';
      setUploadResult({ inserted: 0, updated: 0, errors: [msg] });
    } finally { setUploading(false); }
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
    setUploadFile(null);
    setUploadPreview([]);
    setParseErrors([]);
    setUploadResult(null);
  };

  // ── Add / Edit ─────────────────────────────────────────────────
  const sf = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const openNew = () => {
    setEditing(null);
    setForm({ employeeNumber: '', employeeName: '', designation: '', email: '', managerEmpNo: '' });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditing(emp);
    setForm({
      employeeNumber: emp.employeeNumber,
      employeeName:   emp.employeeName,
      designation:    emp.designation ?? '',
      email:          emp.email ?? '',
      managerEmpNo:   emp.managerEmpNo ?? '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.employeeNumber.trim()) { setFormError('Employee number is required'); return; }
    if (!form.employeeName.trim())   { setFormError('Employee name is required'); return; }
    setSaving(true); setFormError('');
    try {
      if (editing) { await employeesApi.update(editing.id, form); }
      else         { await employeesApi.create(form); }
      setModalOpen(false);
      await load(page, search);
    } catch (e: unknown) {
      setFormError(
        (e as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Failed to save',
      );
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete employee "${name}"? This cannot be undone.`)) return;
    try { await employeesApi.remove(id); await load(page, search); }
    catch { alert('Failed to delete employee'); }
  };

  const LIMIT = 15;

  return (
    <Box>
      {/* Hidden file input */}
      <input
        type="file"
        accept=".xlsx,.xls"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <PageHeader
        breadcrumbs={['Administration', 'Employee Setup']}
        title="Employee Setup"
        subtitle="Upload and manage employee records"
        actions={
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadTemplate}
              sx={{ fontSize: 13, fontWeight: 600 }}
            >
              Download Template
            </Button>
            <Tooltip title="Upload employees from Excel (.xlsx)">
              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ fontSize: 13, fontWeight: 600, color: '#16A34A', borderColor: '#16A34A', '&:hover': { bgcolor: '#f0fdf4', borderColor: '#16A34A' } }}
              >
                Bulk Upload
              </Button>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openNew}
              sx={{ fontSize: 13, fontWeight: 600 }}
            >
              Add Employee
            </Button>
          </Box>
        }
      />

      {/* Search bar */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search by name, number, designation…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: '#6B6B8A' }} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 320 }}
          />
          <Button variant="outlined" size="small" startIcon={<RefreshIcon />}
            onClick={() => load(page, search)}>
            Refresh
          </Button>
          <Typography sx={{ ml: 1, fontSize: 12, color: '#6B6B8A' }}>
            {total} employee{total !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Paper>

      {/* Employee table */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Emp No', 'Name', 'Designation', 'Email', 'Manager Emp No', 'Status', 'Actions']
                  .map((h) => <TableCell key={h}>{h}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: '#EBE8FC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UploadFileIcon sx={{ color: '#4F38F6', fontSize: 24 }} />
                      </Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#07003C' }}>No employees yet</Typography>
                      <Typography sx={{ fontSize: 12, color: '#6B6B8A' }}>
                        Use <strong>Bulk Upload</strong> to import from Excel or <strong>Add Employee</strong> to add one at a time
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : employees.map((emp) => (
                <TableRow key={emp.id} sx={{ '&:hover td': { bgcolor: '#F9FAFB' } }}>
                  <TableCell>
                    <Chip label={emp.employeeNumber} size="small"
                      sx={{ bgcolor: '#EBE8FC', color: '#4F38F6', fontWeight: 700, fontFamily: 'monospace', fontSize: 11 }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#07003C' }}>{emp.employeeName}</TableCell>
                  <TableCell sx={{ fontSize: 12, color: '#6B6B8A' }}>{emp.designation ?? '—'}</TableCell>
                  <TableCell sx={{ fontSize: 12, color: '#6B6B8A' }}>{emp.email ?? '—'}</TableCell>
                  <TableCell sx={{ fontSize: 12, color: '#6B6B8A' }}>{emp.managerEmpNo ?? '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={emp.active ? 'Active' : 'Inactive'} size="small"
                      sx={{
                        bgcolor: emp.active ? '#f0fdf4' : '#F3F4F6',
                        color:   emp.active ? '#16A34A'  : '#6B6B8A',
                        fontWeight: 600, fontSize: 11, height: 22, borderRadius: '99px',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" onClick={() => openEdit(emp)}
                        sx={{ color: '#6B6B8A', '&:hover': { color: '#4F38F6', bgcolor: '#EBE8FC' } }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(emp.id, emp.employeeName)}
                        sx={{ color: '#6B6B8A', '&:hover': { color: '#DC2626', bgcolor: '#fef2f2' } }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {total > LIMIT && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2.5, py: 1.5, borderTop: '1px solid #F3F4F6' }}>
            <Pagination
              count={Math.ceil(total / LIMIT)} page={page}
              onChange={(_, p) => { setPage(p); load(p, search); }}
              size="small" color="primary"
            />
          </Box>
        )}
      </Paper>

      {/* ── BULK UPLOAD MODAL ──────────────────────────────────── */}
      <Dialog open={uploadModalOpen} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <UploadFileIcon sx={{ color: '#4F38F6' }} />
            <Typography sx={{ fontSize: 17, fontWeight: 600 }}>Bulk Employee Upload</Typography>
          </Box>
          <IconButton size="small" onClick={closeUploadModal}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2 }}>
          {/* File info */}
          {uploadFile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: '#EBE8FC', borderRadius: 2, mb: 2 }}>
              <UploadFileIcon sx={{ color: '#4F38F6', fontSize: 20 }} />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#07003C' }}>{uploadFile.name}</Typography>
                <Typography sx={{ fontSize: 11, fontStyle: 'italic', color: '#9CA3AF' }}>
                  {uploadPreview.length} valid row{uploadPreview.length !== 1 ? 's' : ''} found
                  {parseErrors.length > 0 && ` · ${parseErrors.length} error${parseErrors.length !== 1 ? 's' : ''}`}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Parse errors */}
          {parseErrors.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>
                {parseErrors.length} row{parseErrors.length !== 1 ? 's' : ''} skipped due to missing required fields:
              </Typography>
              {parseErrors.slice(0, 5).map((e, i) => (
                <Typography key={i} sx={{ fontSize: 12 }}>• {e}</Typography>
              ))}
              {parseErrors.length > 5 && (
                <Typography sx={{ fontSize: 12, color: '#6B6B8A' }}>...and {parseErrors.length - 5} more</Typography>
              )}
            </Alert>
          )}

          {/* Upload result */}
          {uploadResult && (
            <Alert
              severity={uploadResult.errors.length > 0 ? 'error' : 'success'}
              icon={uploadResult.errors.length > 0 ? <ErrorOutlineIcon /> : <CheckCircleIcon />}
              sx={{ mb: 2, borderRadius: 2 }}
            >
              {uploadResult.errors.length > 0 ? (
                <Typography sx={{ fontSize: 13 }}>{uploadResult.errors[0]}</Typography>
              ) : (
                <Typography sx={{ fontSize: 13 }}>
                  ✅ Upload complete — <strong>{uploadResult.inserted}</strong> new employee{uploadResult.inserted !== 1 ? 's' : ''} added,{' '}
                  <strong>{uploadResult.updated}</strong> existing record{uploadResult.updated !== 1 ? 's' : ''} updated.
                </Typography>
              )}
            </Alert>
          )}

          {/* Preview table */}
          {uploadPreview.length > 0 && !uploadResult && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#07003C' }}>
                  Preview — {uploadPreview.length} employee{uploadPreview.length !== 1 ? 's' : ''} to upload
                </Typography>
                <Typography sx={{ fontSize: 11, fontStyle: 'italic', color: '#9CA3AF' }}>
                  Existing records will be updated, new ones will be created
                </Typography>
              </Box>
              <TableContainer sx={{ maxHeight: 340, border: '1px solid #E5E7EB', borderRadius: 2 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {['#', 'Emp No', 'Name', 'Designation', 'Email', 'Manager Emp No'].map((h) => (
                        <TableCell key={h} sx={{ bgcolor: '#F9FAFB', fontSize: 11, fontWeight: 700, color: '#6B6B8A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {uploadPreview.slice(0, 50).map((row, i) => (
                      <TableRow key={i} sx={{ '&:hover td': { bgcolor: '#F9FAFB' } }}>
                        <TableCell sx={{ fontSize: 11, color: '#9CA3AF', width: 40 }}>{i + 1}</TableCell>
                        <TableCell>
                          <Chip label={row.employeeNumber} size="small"
                            sx={{ bgcolor: '#EBE8FC', color: '#4F38F6', fontWeight: 700, fontFamily: 'monospace', fontSize: 10 }} />
                        </TableCell>
                        <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>{row.employeeName}</TableCell>
                        <TableCell sx={{ fontSize: 12, color: '#6B6B8A' }}>{row.designation ?? '—'}</TableCell>
                        <TableCell sx={{ fontSize: 12, color: '#6B6B8A' }}>{row.email ?? '—'}</TableCell>
                        <TableCell sx={{ fontSize: 12, color: '#6B6B8A' }}>{row.managerEmpNo ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {uploadPreview.length > 50 && (
                <Typography sx={{ fontSize: 11, fontStyle: 'italic', color: '#9CA3AF', mt: 0.75, textAlign: 'center' }}>
                  Showing first 50 of {uploadPreview.length} rows. All rows will be uploaded.
                </Typography>
              )}
            </>
          )}

          {uploading && <LinearProgress sx={{ mt: 2, borderRadius: 99 }} />}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={closeUploadModal} variant="outlined" color="inherit">
            {uploadResult ? 'Close' : 'Cancel'}
          </Button>
          {!uploadResult && uploadPreview.length > 0 && (
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={uploading}
              startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <UploadFileIcon />}
            >
              {uploading ? 'Uploading…' : `Upload ${uploadPreview.length} Employee${uploadPreview.length !== 1 ? 's' : ''}`}
            </Button>
          )}
          {uploadResult && uploadResult.errors.length === 0 && (
            <Button variant="contained" onClick={closeUploadModal}>
              Done
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ── ADD / EDIT MODAL ─────────────────────────────────── */}
      <Dialog open={modalOpen} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>{editing ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Grid container spacing={2.5}>
            {[
              { k: 'employeeNumber', label: 'Employee Number *', placeholder: 'e.g. VT001' },
              { k: 'employeeName',   label: 'Full Name *',        placeholder: 'e.g. Rajesh Babu' },
              { k: 'designation',    label: 'Designation',        placeholder: 'e.g. Senior Developer' },
              { k: 'email',          label: 'Email',              placeholder: 'rajesh@company.com' },
              { k: 'managerEmpNo',   label: 'Manager Employee No',placeholder: 'e.g. VT010' },
            ].map(({ k, label, placeholder }) => (
              <Grid item xs={12} sm={6} key={k}>
                <TextField
                  fullWidth size="small"
                  label={label}
                  placeholder={placeholder}
                  value={form[k as keyof typeof form]}
                  onChange={sf(k as keyof typeof form)}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setModalOpen(false)} variant="outlined" color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={18} color="inherit" /> : editing ? 'Save Changes' : 'Add Employee'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeSetupPage;
