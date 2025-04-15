"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown, 
  MoreHorizontal,
  Eye, 
  Edit, 
  Trash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Prisma } from "@/generated/prisma";
import React from "react";

// Define User type based on Prisma schema
type User = Prisma.AuthUserGetPayload<{
  include: {
    membership: true;
    gender: true;
  };
}>;

interface UsersTableProps {
  users: User[];
  count: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSearch: (searchTerm: string) => void;
  onSort: (column: string, direction: "asc" | "desc") => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  loading: boolean;
}

const getMembershipBadge = (membership?: string) => {
  switch (membership) {
    case "admin":
      return <Badge variant="outline" className="bg-red-100 text-red-800">Admin</Badge>;
    case "doctor":
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">Doctor</Badge>;
    case "nurse":
      return <Badge variant="outline" className="bg-green-100 text-green-800">Nurse</Badge>;
    case "technician":
      return <Badge variant="outline" className="bg-purple-100 text-purple-800">Technician</Badge>;
    case "patient":
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">Patient</Badge>;
    default:
      return <Badge variant="outline">{membership || "Unknown"}</Badge>;
  }
};

export function UsersTable({
  users,
  count,
  pageIndex,
  pageSize,
  onPageChange,
  onSearch,
  onSort,
  onView,
  onEdit,
  onDelete,
  loading,
}: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [sortColumn, setSortColumn] = useState<string>("last_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (column: string) => {
    const direction = sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortDirection(direction);
    onSort(column, direction);
  };

  const toggleRowExpansion = (id: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const pageCount = Math.ceil(count / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search users by name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={handleSearch} variant="outline" size="sm">
            Search
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing {pageIndex * pageSize + 1}-
            {Math.min((pageIndex + 1) * pageSize, count)} of {count}
          </span>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("id")}
                >
                  ID
                  {sortColumn === "id" && (
                    <ChevronDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="min-w-[150px]">
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("last_name")}
                >
                  Name
                  {sortColumn === "last_name" && (
                    <ChevronDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("email")}
                >
                  Email
                  {sortColumn === "email" && (
                    <ChevronDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead>Username</TableHead>
              <TableHead>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("membership")}
                >
                  Role
                  {sortColumn === "membership" && (
                    <ChevronDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <React.Fragment key={user.id}>
                  <TableRow 
                    onClick={() => toggleRowExpansion(user.id)}
                  >
                    <TableCell>{user.id}</TableCell>
                    <TableCell className="font-medium">
                      {user.last_name}, {user.first_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.username || "—"}</TableCell>
                    <TableCell>
                      {user.membership ? getMembershipBadge(user.membership.membership) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(user.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(user.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit user
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(user.id)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete user
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {expandedRows[user.id] && (
                    <TableRow key={`${user.id}-expanded`}>
                      <TableCell colSpan={6} className="bg-gray-50 p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">User Details</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="font-medium">Full Name:</span> {user.last_name}, {user.first_name} {user.maiden_name ? `(${user.maiden_name})` : ""}</p>
                              <p><span className="font-medium">Email:</span> {user.email}</p>
                              <p><span className="font-medium">Username:</span> {user.username || "—"}</p>
                              <p><span className="font-medium">Gender:</span> {user.gender?.sex || "—"}</p>
                              <p><span className="font-medium">Date of Birth:</span> {user.dob ? new Date(user.dob).toLocaleDateString() : "—"}</p>
                              <p><span className="font-medium">Role:</span> {user.membership?.membership || "—"}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">System Information</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="font-medium">ID:</span> {user.id}</p>
                              <p><span className="font-medium">UID:</span> {user.uid}</p>
                              <p><span className="font-medium">Created:</span> {new Date(user.createdOn).toLocaleString()}</p>
                              {user.modifiedOn && (
                                <p><span className="font-medium">Last Modified:</span> {new Date(user.modifiedOn).toLocaleString()}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {pageIndex + 1} of {Math.max(1, pageCount)}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={pageIndex === pageCount - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
} 