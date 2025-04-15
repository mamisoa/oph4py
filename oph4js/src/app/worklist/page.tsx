"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersTable } from "./components/tables/UsersTable";

export default function WorklistPage() {
  // State for users data
  const [users, setUsers] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [userPageIndex, setUserPageIndex] = useState(0);
  const userPageSize = 10; // Changed from state to constant since it's not being changed
  const [userLoading, setUserLoading] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userSortColumn, setUserSortColumn] = useState("last_name");
  const [userSortDirection, setUserSortDirection] = useState<"asc" | "desc">("asc");

  // Fetch users data
  const fetchUsers = async () => {
    setUserLoading(true);
    try {
      const response = await fetch(
        `/api/users?limit=${userPageSize}&offset=${userPageIndex * userPageSize}${userSearchTerm ? `&search=${userSearchTerm}` : ""}&sortColumn=${userSortColumn}&sortDirection=${userSortDirection}`
      );
      const data = await response.json();
      setUsers(data.users);
      setUserCount(data.count);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setUserLoading(false);
    }
  };

  // Effect to fetch users when params change
  useEffect(() => {
    fetchUsers();
  }, [userPageIndex, userPageSize, userSortColumn, userSortDirection]);

  // Handle user actions
  const handleUserSearch = (searchTerm: string) => {
    setUserSearchTerm(searchTerm);
    setUserPageIndex(0);
    fetchUsers();
  };

  const handleUserSort = (column: string, direction: "asc" | "desc") => {
    setUserSortColumn(column);
    setUserSortDirection(direction);
  };

  const handleUserPageChange = (page: number) => {
    setUserPageIndex(page);
  };

  const handleViewUser = (id: number) => {
    console.log("View user:", id);
    // Implement view user logic
  };

  const handleEditUser = (id: number) => {
    console.log("Edit user:", id);
    // Implement edit user logic
  };

  const handleDeleteUser = (id: number) => {
    console.log("Delete user:", id);
    // Implement delete user logic
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Worklist Management</h1>
        <div className="space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            New Item
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            Refresh
          </button>
        </div>
      </div>
      
      <Tabs defaultValue="worklist" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="worklist">Worklist</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="worklist">
          <Card>
            <CardHeader>
              <CardTitle>Worklist Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Search</label>
                    <input
                      type="text"
                      placeholder="Search patients..."
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <select className="w-full rounded-md border border-gray-300 px-3 py-2">
                      <option value="">All Statuses</option>
                      <option value="requested">Requested</option>
                      <option value="processing">Processing</option>
                      <option value="done">Done</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Date Range</label>
                    <input
                      type="date"
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Provider</label>
                    <select className="w-full rounded-md border border-gray-300 px-3 py-2">
                      <option value="">All Providers</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="rounded-md border">
                <div className="px-4 py-3 bg-gray-50 border-b font-medium grid grid-cols-12 gap-4">
                  <div className="col-span-1">ID</div>
                  <div className="col-span-2">Patient</div>
                  <div className="col-span-2">Procedure</div>
                  <div className="col-span-1">Laterality</div>
                  <div className="col-span-2">Provider</div>
                  <div className="col-span-2">Requested</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Actions</div>
                </div>
                
                <div className="divide-y">
                  <div className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50">
                    <div className="col-span-1 text-gray-600">1</div>
                    <div className="col-span-2">Sample Patient</div>
                    <div className="col-span-2 text-gray-600">Visual Field</div>
                    <div className="col-span-1 text-gray-600">Both</div>
                    <div className="col-span-2 text-gray-600">Dr. Smith</div>
                    <div className="col-span-2 text-gray-600">2023-01-01 10:00</div>
                    <div className="col-span-1">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        Requested
                      </span>
                    </div>
                    <div className="col-span-1 flex space-x-1">
                      <button className="p-1 text-blue-600 hover:text-blue-800">
                        Edit
                      </button>
                      <button className="p-1 text-red-600 hover:text-red-800">
                        Cancel
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50">
                    <div className="col-span-1 text-gray-600">2</div>
                    <div className="col-span-2">John Doe</div>
                    <div className="col-span-2 text-gray-600">OCT Macula</div>
                    <div className="col-span-1 text-gray-600">Right</div>
                    <div className="col-span-2 text-gray-600">Dr. Johnson</div>
                    <div className="col-span-2 text-gray-600">2023-01-02 14:30</div>
                    <div className="col-span-1">
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        Processing
                      </span>
                    </div>
                    <div className="col-span-1 flex space-x-1">
                      <button className="p-1 text-blue-600 hover:text-blue-800">
                        Edit
                      </button>
                      <button className="p-1 text-red-600 hover:text-red-800">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Showing 2 of 2 results
                </div>
                <div className="flex space-x-1">
                  <button
                    disabled
                    className="px-3 py-1 rounded bg-gray-100 text-gray-400"
                  >
                    Previous
                  </button>
                  <button
                    disabled
                    className="px-3 py-1 rounded bg-gray-100 text-gray-400"
                  >
                    Next
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <UsersTable
                users={users}
                count={userCount}
                pageIndex={userPageIndex}
                pageSize={userPageSize}
                onPageChange={handleUserPageChange}
                onSearch={handleUserSearch}
                onSort={handleUserSort}
                onView={handleViewUser}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                loading={userLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 