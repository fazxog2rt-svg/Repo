"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, UserCheck, UserX, Shield, ShieldOff, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  emailVerified?: string;
  subscriptions: Array<{ plan: { name: string } }>;
  _count: { chats: number };
}

const ROLE_COLORS: Record<string, string> = {
  USER: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  ADMIN: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  SUPER_ADMIN: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("q", search);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const users: User[] = data?.data || [];
  const pagination = data?.pagination;

  const updateMutation = useMutation({
    mutationFn: async (data: { userId: string; isActive?: boolean; role?: string }) => {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedUser(null);
      toast.success("Pengguna berhasil diupdate");
    },
    onError: () => toast.error("Gagal mengupdate pengguna"),
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
        <p className="text-muted-foreground text-sm mt-1">Kelola akun dan izin pengguna</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama atau email..."
          className="pl-9"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Pengguna", value: pagination?.total || 0 },
          { label: "Aktif", value: users.filter((u) => u.isActive).length },
          { label: "Berlangganan", value: users.filter((u) => u.subscriptions.length > 0).length },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="p-4 text-left font-medium text-muted-foreground">Pengguna</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Role</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Paket</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Chat</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Bergabung</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i} className="border-b">
                      <td colSpan={7} className="p-4">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">Tidak ada pengguna</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.image} />
                            <AvatarFallback className="text-xs">{user.name?.charAt(0) || "?"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${ROLE_COLORS[user.role] || ""}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        {user.subscriptions[0]?.plan.name || <span className="text-muted-foreground">Free</span>}
                      </td>
                      <td className="p-4 text-muted-foreground">{user._count.chats}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 text-xs ${user.isActive ? "text-green-600" : "text-red-500"}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-green-600" : "bg-red-500"}`} />
                          {user.isActive ? "Aktif" : "Dinonaktifkan"}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setSelectedUser(user); setNewRole(user.role); }}
                        >
                          Kelola
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Halaman {pagination.page} dari {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Sebelumnya
            </Button>
            <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>
              Berikutnya
            </Button>
          </div>
        </div>
      )}

      {/* User management dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(v: boolean) => !v && setSelectedUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Kelola Pengguna</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedUser.image} />
                  <AvatarFallback>{selectedUser.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Ubah Role</p>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className={`flex-1 ${selectedUser.isActive ? "border-red-500/30 text-red-500 hover:bg-red-500/5" : "border-green-500/30 text-green-600 hover:bg-green-500/5"}`}
                  onClick={() => updateMutation.mutate({ userId: selectedUser.id, isActive: !selectedUser.isActive })}
                  disabled={updateMutation.isPending}
                >
                  {selectedUser.isActive ? (
                    <><UserX className="w-4 h-4 mr-1" />Nonaktifkan</>
                  ) : (
                    <><UserCheck className="w-4 h-4 mr-1" />Aktifkan</>
                  )}
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => updateMutation.mutate({ userId: selectedUser.id, role: newRole })}
                  disabled={updateMutation.isPending || newRole === selectedUser.role}
                >
                  Simpan Role
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
