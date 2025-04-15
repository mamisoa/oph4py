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
  Check, 
  Clock, 
  AlertTriangle, 
  X, 
  Eye, 
  Edit, 
  Trash 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Prisma } from "@/generated/prisma";
import { formatDistanceToNow } from "date-fns";

// Define worklistItem type based on Prisma schema
type WorklistItem = Prisma.WorklistGetPayload<{
  include: {
    patient: true;
    procedureRel: true;
    modality: true;
    sendingFacility: true;
    receivingFacility: true;
    providerDoctor: true;
    seniorDoctor: true;
  };
}>;

interface WorklistTableProps {
  items: WorklistItem[];
  count: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSearch: (searchTerm: string) => void;
  onSort: (column: string, direction: "asc" | "desc") => void;
  onStatusChange: (id: number, status: string) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  loading: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Requested":
      return "bg-blue-50 hover:bg-blue-100";
    case "Processing":
      return "bg-yellow-50 hover:bg-yellow-100";
    case "Done":
      return "bg-green-50 hover:bg-green-100";
    case "Cancelled":
      return "bg-red-50 hover:bg-red-100";
    default:
      return "";
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Requested":
      return <Badge variant="outline" className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" /> Requested</Badge>;
    case "Processing":
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" /> Processing</Badge>;
    case "Done":
      return <Badge variant="outline" className="bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" /> Done</Badge>;
    case "Cancelled":
      return <Badge variant="outline" className="bg-red-100 text-red-800"><X className="w-3 h-3 mr-1" /> Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getWaitTime = (requestedTime: Date) => {
  return formatDistanceToNow(new Date(requestedTime), { addSuffix: true });
};

export function WorklistTable({
  items,
  count,
  pageIndex,
  pageSize,
  onPageChange,
  onSearch,
  onSort,
  onStatusChange,
  onView,
  onEdit,
  onDelete,
  loading,
}: WorklistTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [sortColumn, setSortColumn] = useState<string>("requested_time");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

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
            placeholder="Search patient, procedure..."
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
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead className="min-w-[150px]">
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("patient.last_name")}
                >
                  Patient
                  {sortColumn === "patient.last_name" && (
                    <ChevronDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("procedure")}
                >
                  Procedure
                  {sortColumn === "procedure" && (
                    <ChevronDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("modality_dest")}
                >
                  Modality
                  {sortColumn === "modality_dest" && (
                    <ChevronDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead>Laterality</TableHead>
              <TableHead>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("requested_time")}
                >
                  Requested
                  {sortColumn === "requested_time" && (
                    <ChevronDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead>Wait Time</TableHead>
              <TableHead>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("status_flag")}
                >
                  Status
                  {sortColumn === "status_flag" && (
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
                <TableCell colSpan={9} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <>
                  <TableRow 
                    key={item.id} 
                    className={getStatusColor(item.status_flag)}
                    onClick={() => toggleRowExpansion(item.id)}
                  >
                    <TableCell>{item.id}</TableCell>
                    <TableCell className="font-medium">
                      {item.patient.last_name}, {item.patient.first_name}
                    </TableCell>
                    <TableCell>{item.procedureRel.exam_name}</TableCell>
                    <TableCell>{item.modality.modality_name}</TableCell>
                    <TableCell>{item.laterality}</TableCell>
                    <TableCell>
                      {new Date(item.requested_time).toLocaleString()}
                    </TableCell>
                    <TableCell>{getWaitTime(item.requested_time)}</TableCell>
                    <TableCell>{getStatusBadge(item.status_flag)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(item.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(item.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete(item.id)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              onStatusChange(item.id, "Requested");
                            }}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            Set Requested
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              onStatusChange(item.id, "Processing");
                            }}
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Set Processing
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              onStatusChange(item.id, "Done");
                            }}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Set Done
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              onStatusChange(item.id, "Cancelled");
                            }}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Set Cancelled
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {expandedRows[item.id] && (
                    <TableRow>
                      <TableCell colSpan={9} className="p-0">
                        <Card className="m-2 p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h3 className="font-semibold mb-2">Patient Details</h3>
                              <p>ID: {item.id_auth_user}</p>
                              <p>Name: {item.patient.first_name} {item.patient.last_name}</p>
                              <p>Email: {item.patient.email}</p>
                            </div>
                            <div>
                              <h3 className="font-semibold mb-2">Procedure Details</h3>
                              <p>Procedure: {item.procedureRel.exam_name}</p>
                              <p>Modality: {item.modality.modality_name}</p>
                              <p>Laterality: {item.laterality}</p>
                            </div>
                            <div>
                              <h3 className="font-semibold mb-2">Assignment</h3>
                              <p>Senior Doctor: {item.seniorDoctor.last_name}, {item.seniorDoctor.first_name}</p>
                              <p>Provider: {item.providerDoctor.last_name}, {item.providerDoctor.first_name}</p>
                            </div>
                            <div>
                              <h3 className="font-semibold mb-2">Facilities</h3>
                              <p>Sending: {item.sendingFacility.facility_name}</p>
                              <p>Receiving: {item.receivingFacility.facility_name}</p>
                              <p>Message ID: {item.message_unique_id}</p>
                            </div>
                            {item.warning && (
                              <div className="col-span-2">
                                <h3 className="font-semibold mb-2 text-yellow-600">Warning</h3>
                                <p className="text-yellow-600">{item.warning}</p>
                              </div>
                            )}
                            {item.transaction_id && (
                              <div className="col-span-2">
                                <h3 className="font-semibold mb-2">Transaction Info</h3>
                                <p>Transaction ID: {item.transaction_id}</p>
                              </div>
                            )}
                          </div>
                        </Card>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={pageIndex === 0}
        >
          Previous
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: pageCount }).map((_, i) => (
            <Button
              key={i}
              variant={pageIndex === i ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(i)}
              className="w-8 h-8 p-0"
            >
              {i + 1}
            </Button>
          ))}
        </div>
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
  );
} 