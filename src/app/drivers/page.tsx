"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, AlertCircle, CheckCircle, Pencil, Trash2, Loader2 } from "lucide-react";

import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getBuses,
  createDriver,
  deleteDriver,
  getDrivers,
  updateDriver,
  type Bus,
  type CreateDriverPayload,
  type Driver,
  type UpdateDriverPayload,
} from "@/services/api";

interface Toast {
  type: "success" | "error";
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getEntityId = (item: { _id?: string; id?: string }) => item._id ?? item.id ?? "";

const extractDrivers = (input: unknown): Driver[] => {
  if (Array.isArray(input)) return input as Driver[];
  if (!input || typeof input !== "object") return [];

  const obj = input as { drivers?: unknown; data?: unknown };
  if (Array.isArray(obj.drivers)) return obj.drivers as Driver[];
  if (Array.isArray(obj.data)) return obj.data as Driver[];
  return [];
};

const getErrorMeta = (err: unknown, fallback: string) => {
  const status = (err as { response?: { status?: number } })?.response?.status;
  const message =
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    (err as Error)?.message ||
    fallback;
  return { status, message };
};

const validatePayload = (payload: {
  name: string;
  memberId: string;
  email?: string;
  phone?: string;
  password?: string;
}) => {
  if (payload.name.trim().length < 2) return "Name must be at least 2 characters.";
  if (!payload.memberId.trim()) return "Member ID is required.";
  if (payload.email && !EMAIL_REGEX.test(payload.email)) return "Please enter a valid email.";
  if (payload.phone && (payload.phone.length < 7 || payload.phone.length > 20)) return "Phone length must be 7 to 20 characters.";
  if (payload.password !== undefined && payload.password.length < 6) return "Password must be at least 6 characters.";
  return null;
};

const normalizeCompare = (value?: string) => (value || "").trim().toLowerCase();

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const [form, setForm] = useState<CreateDriverPayload>({
    name: "",
    memberId: "",
    email: "",
    phone: "",
    password: "",
  });
  const [editForm, setEditForm] = useState<UpdateDriverPayload>({
    name: "",
    memberId: "",
    email: "",
    phone: "",
    password: "",
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const showToast = (type: Toast["type"], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchDrivers = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const [driversRes, busesRes] = await Promise.all([getDrivers(q), getBuses()]);
      setDrivers(extractDrivers(driversRes.data));
      setBuses(Array.isArray(busesRes.data?.buses) ? busesRes.data.buses : []);
    } catch (err) {
      const { message } = getErrorMeta(err, "Failed to load drivers.");
      showToast("error", message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers(searchQuery || undefined);
  }, [fetchDrivers, searchQuery]);

  const busNumberById = useMemo(() => {
    const map = new Map<string, string>();
    buses.forEach((bus) => {
      if (bus._id) map.set(String(bus._id), bus.numberPlate);
      if (bus.id) map.set(String(bus.id), bus.numberPlate);
    });
    return map;
  }, [buses]);

  const stats = useMemo(() => {
    const assigned = drivers.filter((d) => Boolean(d.assignedBusNumber || (d.assignedBusId && busNumberById.get(String(d.assignedBusId))))).length;
    return { total: drivers.length, assigned, unassigned: drivers.length - assigned };
  }, [drivers, busNumberById]);

  const handleCreate = async () => {
    setFormError(null);
    const payload: CreateDriverPayload = {
      name: form.name.trim(),
      memberId: form.memberId.trim(),
      email: form.email?.trim() || undefined,
      phone: form.phone?.trim() || undefined,
      password: form.password.trim(),
    };

    const validationError = validatePayload(payload);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await createDriver(payload);
      const created = ((data as { driver?: Driver }).driver ?? data) as Driver;
      setDrivers((prev) => [created, ...prev]);
      setOpenCreate(false);
      setForm({ name: "", memberId: "", email: "", phone: "", password: "" });
      showToast("success", "Driver created successfully.");
    } catch (err) {
      const { message } = getErrorMeta(err, "Failed to create driver.");
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setEditError(null);
    setEditForm({
      name: driver.name,
      memberId: driver.memberId ?? "",
      email: driver.email ?? "",
      phone: driver.phone ?? "",
      password: "",
    });
    setOpenEdit(true);
  };

  const handleUpdate = async () => {
    if (!selectedDriver) return;
    setEditError(null);
    const driverId = getEntityId(selectedDriver);

    const payload: UpdateDriverPayload = {
      name: editForm.name?.trim() || undefined,
      memberId: editForm.memberId?.trim() || undefined,
      email: editForm.email?.trim() || undefined,
      phone: editForm.phone?.trim() || undefined,
      password: editForm.password?.trim() || undefined,
    };

    const validationError = validatePayload({
      name: payload.name || "",
      memberId: payload.memberId || "",
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
    });
    if (validationError) {
      setEditError(validationError);
      return;
    }

    const duplicateField = drivers
      .filter((driver) => getEntityId(driver) !== driverId)
      .find((driver) => {
        const sameMemberId = Boolean(payload.memberId) && normalizeCompare(driver.memberId) === normalizeCompare(payload.memberId);
        const sameEmail = Boolean(payload.email) && normalizeCompare(driver.email) === normalizeCompare(payload.email);
        const samePhone = Boolean(payload.phone) && normalizeCompare(driver.phone) === normalizeCompare(payload.phone);
        return sameMemberId || sameEmail || samePhone;
      });

    if (duplicateField) {
      if (normalizeCompare(duplicateField.memberId) === normalizeCompare(payload.memberId)) {
        setEditError("Member ID must be unique in your organization.");
      } else if (normalizeCompare(duplicateField.email) === normalizeCompare(payload.email)) {
        setEditError("Email must be unique in your organization.");
      } else {
        setEditError("Phone number must be unique in your organization.");
      }
      return;
    }

    try {
      setEditing(true);
      const { data } = await updateDriver(driverId, payload);
      const updated = ((data as { driver?: Driver }).driver ?? data) as Driver;

      setDrivers((prev) => prev.map((d) => (getEntityId(d) === driverId ? { ...d, ...updated } : d)));
      setOpenEdit(false);
      setSelectedDriver(null);
      showToast("success", "Driver updated successfully.");
    } catch (err) {
      const { status, message } = getErrorMeta(err, "Failed to update driver.");
      if (status === 404) {
        setOpenEdit(false);
        setSelectedDriver(null);
        await fetchDrivers(searchQuery || undefined);
        showToast("error", "Driver no longer exists. List refreshed.");
        return;
      }
      setEditError(message);
    } finally {
      setEditing(false);
    }
  };

  const requestDelete = (driver: Driver) => {
    setSelectedDriver(driver);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    if (!selectedDriver) return;

    try {
      setDeleting(true);
      const driverId = getEntityId(selectedDriver);
      await deleteDriver(driverId);
      setDrivers((prev) => prev.filter((d) => getEntityId(d) !== driverId));
      setOpenDelete(false);
      setSelectedDriver(null);
      showToast("success", "Driver deleted.");
    } catch (err) {
      const { status, message } = getErrorMeta(err, "Failed to delete driver.");
      if (status === 404) {
        setOpenDelete(false);
        setSelectedDriver(null);
        await fetchDrivers(searchQuery || undefined);
        showToast("error", "Driver was already removed. List refreshed.");
        return;
      }
      showToast("error", message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Header onToggleSidebar={() => {}} />

      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Driver Management</h1>
            <p className="text-sm text-gray-500">Create, update, search, and delete drivers.</p>
          </div>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setOpenCreate(true)}>
            <Plus className="w-4 h-4" />
            Add Driver
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-xs text-gray-500">Total Drivers</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-gray-500">Assigned</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.assigned}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-gray-500">Unassigned</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.unassigned}</p>
          </Card>
        </div>

        <Card className="p-4 border border-gray-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <Input
              placeholder="Search drivers by name, member ID, email, phone"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-10 w-full sm:w-96"
            />
            <Button variant="outline" onClick={() => setSearchInput("")}>Clear</Button>
          </div>

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Member ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Assigned Bus</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-gray-500">Loading drivers...</TableCell>
                  </TableRow>
                ) : drivers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-gray-500">No drivers found.</TableCell>
                  </TableRow>
                ) : (
                  drivers.map((driver) => {
                    const id = getEntityId(driver);
                    const assignedBus = driver.assignedBusNumber || (driver.assignedBusId ? busNumberById.get(String(driver.assignedBusId)) : undefined);
                    return (
                      <TableRow key={id || `${driver.memberId}-${driver.name}`} className="hover:bg-gray-50/60">
                        <TableCell className="font-medium text-gray-900">{driver.name}</TableCell>
                        <TableCell>{driver.memberId || "-"}</TableCell>
                        <TableCell>{driver.email || "-"}</TableCell>
                        <TableCell>{driver.phone || "-"}</TableCell>
                        <TableCell>{assignedBus || "Unassigned"}</TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditModal(driver)}>
                              <Pencil className="w-3.5 h-3.5 mr-1" />Edit
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => requestDelete(driver)}>
                              <Trash2 className="w-3.5 h-3.5 mr-1" />Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Driver</DialogTitle>
            <DialogDescription>Add a new driver account.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Name" />
            <Input value={form.memberId} onChange={(e) => setForm((p) => ({ ...p, memberId: e.target.value }))} placeholder="Member ID" />
            <Input type="email" value={form.email || ""} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email (optional)" />
            <Input value={form.phone || ""} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone (optional)" />
            <Input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="Password" />
            {formError && <p className="text-sm text-red-600">{formError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Driver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Driver</DialogTitle>
            <DialogDescription>Update driver details. Set password only if you want to reset it.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input value={editForm.name || ""} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} placeholder="Name" />
            <Input value={editForm.memberId || ""} onChange={(e) => setEditForm((p) => ({ ...p, memberId: e.target.value }))} placeholder="Member ID" />
            <Input type="email" value={editForm.email || ""} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email (optional)" />
            <Input value={editForm.phone || ""} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone (optional)" />
            <Input type="password" value={editForm.password || ""} onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))} placeholder="New password (optional)" />
            {editError && <p className="text-sm text-red-600">{editError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEdit(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={editing} className="bg-blue-600 hover:bg-blue-700 text-white">
              {editing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Driver</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Delete {selectedDriver?.name || "this driver"}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)}>Cancel</Button>
            <Button onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
