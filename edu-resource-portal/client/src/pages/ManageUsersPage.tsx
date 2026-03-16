import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateUserSchema, type CreateUserData } from '@edu-portal/shared';
import { DataTable, type Column } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Badge } from '../components/common/Badge';
import { useToast } from '../components/common/Toast';
import { useAuthStore } from '../store/authStore';
import { fmtDate } from '../utils/formatters';
import api from '../services/api';
import type { User } from '../types/user.types';
import { ROLES } from '../utils/constants';

async function fetchUsers(): Promise<User[]> {
  const res = await api.get<User[]>('/admin/users');
  return res.data;
}

export function ManageUsersPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore(s => s.user);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [toggleTarget, setToggleTarget] = useState<User | null>(null);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<{ role: string; districtScope: string }>({ role: '', districtScope: '' });

  useEffect(() => {
    if (editTarget) {
      setEditForm({
        role:          editTarget.role          ?? '',
        districtScope: editTarget.districtScope ?? '',
      });
    }
  }, [editTarget]);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserData) => api.post('/admin/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('User created successfully', 'success');
      setFormOpen(false);
      reset();
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('User deleted', 'success');
      setDeleteTarget(null);
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.put(`/admin/users/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('User updated', 'success');
      setToggleTarget(null);
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, role, districtScope }: { id: string; role: string; districtScope?: string }) =>
      api.put(`/admin/users/${id}`, { role, districtScope }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('User updated successfully', 'success');
      setEditTarget(null);
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateUserData>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: { role: 'UPLOADER' },
  });

  const COLUMNS: Column<User>[] = [
    { key: 'userId', header: 'User ID', render: r => <span className="font-medium text-slate-900">{r.userId}</span> },
    {
      key: 'role',
      header: 'Role',
      render: r => <Badge variant={r.role === 'ADMIN' ? 'indigo' : 'default'}>{r.role}</Badge>,
    },
    { key: 'districtScope', header: 'District Scope', render: r => r.districtScope ?? <span className="text-slate-400 text-xs">All</span> },
    {
      key: 'isActive',
      header: 'Status',
      render: r => <Badge variant={r.isActive ? 'success' : 'danger'} dot>{r.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    { key: 'createdAt', header: 'Created', render: r => fmtDate(r.createdAt) },
  ];

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Users</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage portal user accounts and permissions</p>
        </div>
        <Button
          size="sm"
          onClick={() => { reset(); setFormOpen(true); }}
          leftIcon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Add User
        </Button>
      </div>

      <DataTable<User>
        data={users}
        columns={COLUMNS}
        keyField="id"
        loading={isLoading}
        searchPlaceholder="Search users…"
        exportFilename="users"
        emptyMessage="No users found."
        onEdit={row => {
          if (row.id === currentUser?.id) return;
          setEditTarget(row);
        }}
        actions={row => (
          <>
            <button
              onClick={() => setToggleTarget(row)}
              disabled={row.id === currentUser?.id}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title={row.isActive ? 'Deactivate' : 'Activate'}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={row.isActive
                    ? "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    : "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
              </svg>
            </button>
            <button
              onClick={() => setDeleteTarget(row)}
              disabled={row.id === currentUser?.id}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Delete"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </>
        )}
      />

      {/* Create User Modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Add New User" size="md">
        <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="px-6 py-5 flex flex-col gap-4">
          <Input
            {...register('userId')}
            label="User ID"
            required
            placeholder="Minimum 3 characters"
            error={errors.userId?.message}
          />
          <Input
            {...register('password')}
            label="Password"
            type="password"
            required
            placeholder="Minimum 8 characters"
            error={errors.password?.message}
          />
          <Select
            {...register('role')}
            label="Role"
            required
            options={ROLES}
            error={errors.role?.message}
          />
          <Input
            {...register('districtScope')}
            label="District Scope"
            placeholder="Leave blank for all districts"
            hint="Restricts uploader to a specific district"
            error={errors.districtScope?.message}
          />
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Create User</Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit User — ${editTarget?.userId}`} size="md">
        <div className="px-6 py-5 flex flex-col gap-4">
          <Select
            label="Role"
            options={ROLES}
            value={editForm.role}
            onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
          />
          <Input
            label="District Scope"
            placeholder="Leave blank for all districts"
            hint="Restricts uploader to a specific district"
            value={editForm.districtScope}
            onChange={e => setEditForm(f => ({ ...f, districtScope: e.target.value }))}
          />
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button
              loading={editMutation.isPending}
              onClick={() => {
                if (!editTarget) return;
                editMutation.mutate({
                  id: editTarget.id,
                  role: editForm.role,
                  districtScope: editForm.districtScope || undefined,
                });
              }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete User"
        message={`Delete user "${deleteTarget?.userId}"? All associated data will remain but the user will lose access.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />

      {/* Toggle Status Confirm */}
      <ConfirmDialog
        open={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={() =>
          toggleTarget && toggleMutation.mutate({ id: toggleTarget.id, isActive: !toggleTarget.isActive })
        }
        title={toggleTarget?.isActive ? 'Deactivate User' : 'Activate User'}
        message={`${toggleTarget?.isActive ? 'Deactivate' : 'Activate'} user "${toggleTarget?.userId}"?`}
        confirmLabel={toggleTarget?.isActive ? 'Deactivate' : 'Activate'}
        loading={toggleMutation.isPending}
        variant="primary"
      />
    </div>
  );
}
