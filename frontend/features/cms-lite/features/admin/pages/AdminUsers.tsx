import { useEffect, useState } from "react";
import { useBackend } from "../../../shared/hooks/useBackend";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Form";
import { Modal } from "../../../shared/components/Modal";
import ImportValidationModal from "../../../shared/components/ImportValidationModal";
import { LoadingSpinner } from "../../../shared/components/Loading";
import { ErrorState } from "../../../shared/components/ErrorState";
import { Users as UsersIcon, Plus, Trash2, Pencil, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logger } from "../../../shared/utils/logger";

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminUsers() {
  const backend = useBackend();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "editor" as "owner" | "editor",
  });
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [exportFields, setExportFields] = useState({
    id: true,
    email: true,
    role: true,
    createdAt: true,
    updatedAt: true,
  });
  const [importFile, setImportFile] = useState<string>("");
  const [updateExisting, setUpdateExisting] = useState(false);
  const [importValidationModalOpen, setImportValidationModalOpen] = useState(false);
  const [parsedImportData, setParsedImportData] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    logger.load("users", "database/users table");
    try {
      const response = await backend.users.list();
      setUsers(response.users);
      logger.loaded("users", "database", response.users.length);
    } catch (err: any) {
      logger.error("mengambil", "users", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    logger.save("user baru", "database/users table", formData);
    try {
      await backend.users.create(formData);
      logger.saved("user baru", "database/users table");
      toast({ title: "Success", description: "User created successfully" });
      setIsFormOpen(false);
      resetForm();
      loadUsers();
    } catch (err: any) {
      logger.error("menyimpan", "user", err);
      toast({
        title: "Error",
        description: err.message || "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    
    logger.update("user", "database/users table", { id: editingUser.id });
    try {
      await backend.users.update({
        id: editingUser.id,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      logger.updated("user", "database/users table");
      toast({ title: "Success", description: "User updated successfully" });
      setIsFormOpen(false);
      setEditingUser(null);
      resetForm();
      loadUsers();
    } catch (err: any) {
      logger.error("update", "user", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    logger.delete("user", "database/users table", userId);
    try {
      await backend.users.deleteUser({ id: userId });
      logger.deleted("user", "database/users table");
      toast({ title: "Success", description: "User deleted successfully" });
      loadUsers();
    } catch (err: any) {
      logger.error("menghapus", "user", err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      role: "editor",
    });
  };

  const openEditForm = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: "",
      role: user.role as "owner" | "editor",
    });
    setIsFormOpen(true);
  };

  const openCreateForm = () => {
    setEditingUser(null);
    resetForm();
    setIsFormOpen(true);
  };

  const handleExport = async () => {
    try {
      const fields = Object.entries(exportFields)
        .filter(([_, enabled]) => enabled)
        .map(([field]) => field);

      if (fields.length === 0) {
        toast({ title: "Error", description: "Please select at least one field", variant: "destructive" });
        return;
      }

      const response = await backend.users.exportJSON({ fields });
      const json = JSON.stringify(response.users, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Success", description: "Users exported successfully" });
      setIsExportOpen(false);
    } catch (err: any) {
      console.error("Failed to export users:", err);
      toast({ title: "Error", description: err.message || "Failed to export users", variant: "destructive" });
    }
  };

  const handleImport = async () => {
    try {
      if (!importFile) {
        toast({ title: "Error", description: "Please provide JSON data", variant: "destructive" });
        return;
      }

      const users = JSON.parse(importFile);
      if (!Array.isArray(users)) {
        toast({ title: "Error", description: "Invalid JSON format. Expected an array of users", variant: "destructive" });
        return;
      }

      setParsedImportData(users);
      setIsImportOpen(false);
      setImportValidationModalOpen(true);
    } catch (err: any) {
      console.error("Failed to parse JSON:", err);
      toast({ title: "Error", description: err.message || "Failed to parse JSON", variant: "destructive" });
    }
  };

  const handleConfirmImport = async (selectedItems: any[]) => {
    try {
      const result = await backend.users.importJSON({ users: selectedItems, updateExisting });
      
      const messages = [];
      if (result.imported > 0) messages.push(`${result.imported} imported`);
      if (result.updated > 0) messages.push(`${result.updated} updated`);
      if (result.failed > 0) messages.push(`${result.failed} failed`);
      
      toast({
        title: "Import Complete",
        description: messages.join(", "),
        variant: result.failed > 0 ? "destructive" : "default",
      });

      if (result.errors.length > 0) {
        console.error("Import errors:", result.errors);
      }

      setImportValidationModalOpen(false);
      setParsedImportData([]);
      setImportFile("");
      setUpdateExisting(false);
      loadUsers();
    } catch (err: any) {
      console.error("Failed to import users:", err);
      toast({ title: "Error", description: err.message || "Failed to import users", variant: "destructive" });
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UsersIcon className="h-8 w-8" />
          User Management
        </h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsExportOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="secondary" onClick={() => setIsImportOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={openCreateForm}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === "owner"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditForm(user)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingUser(null);
          resetForm();
        }}
        title={editingUser ? "Edit User" : "Create User"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(value) =>
                setFormData({ ...formData, email: value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Password {editingUser && "(leave blank to keep current)"}
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(value) =>
                setFormData({ ...formData, password: value })
              }
              required={!editingUser}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as "owner" | "editor",
                })
              }
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="editor">Editor</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsFormOpen(false);
                setEditingUser(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={editingUser ? handleUpdate : handleCreate}>
              {editingUser ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Export Users"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select the fields you want to export:
          </p>
          <div className="space-y-2">
            {Object.entries(exportFields).map(([field, enabled]) => (
              <div key={field} className="flex items-center">
                <input
                  type="checkbox"
                  id={`export-${field}`}
                  checked={enabled}
                  onChange={(e) =>
                    setExportFields({ ...exportFields, [field]: e.target.checked })
                  }
                  className="mr-3 h-4 w-4"
                />
                <label htmlFor={`export-${field}`} className="capitalize">
                  {field}
                </label>
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="secondary" onClick={() => setIsExportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isImportOpen}
        onClose={() => {
          setIsImportOpen(false);
          setImportFile("");
          setUpdateExisting(false);
        }}
        title="Import Users"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Paste JSON data
            </label>
            <textarea
              value={importFile}
              onChange={(e) => setImportFile(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground font-mono text-xs"
              rows={10}
              placeholder='[{"email": "user@example.com", "role": "editor", "password": "secret123"}]'
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="update-existing"
              checked={updateExisting}
              onChange={(e) => setUpdateExisting(e.target.checked)}
              className="mr-3 h-4 w-4"
            />
            <label htmlFor="update-existing" className="text-sm">
              Update existing users (by email)
            </label>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
            <strong>Note:</strong> Import format must be an array of objects with email, role, and password fields.
          </div>
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => {
                setIsImportOpen(false);
                setImportFile("");
                setUpdateExisting(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleImport}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>
      </Modal>

      <ImportValidationModal
        isOpen={importValidationModalOpen}
        onClose={() => {
          setImportValidationModalOpen(false);
          setParsedImportData([]);
        }}
        onConfirm={handleConfirmImport}
        items={parsedImportData}
        entityType="user"
        validateItem={(item) => {
          const errors = [];
          if (!item.email) errors.push({ field: "email", message: "Email is required" });
          if (!item.role || !["owner", "editor"].includes(item.role)) {
            errors.push({ field: "role", message: "Role must be 'owner' or 'editor'" });
          }
          if (!item.password && !updateExisting) {
            errors.push({ field: "password", message: "Password is required for new users" });
          }
          return { isValid: errors.length === 0, errors };
        }}
      />
    </div>
  );
}
