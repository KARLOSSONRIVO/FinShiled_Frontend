"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Search, Filter, Edit, Trash2, ShieldAlert, CheckCircle, UserCheck, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface SimulatedEmployee {
    id: string
    username: string
    email: string
    role: "COMPANY_MANAGER" | "COMPANY_USER"
    status: "ACTIVE" | "INACTIVE"
    createdAt: string
}

const seedEmployees: SimulatedEmployee[] = [
    {
        id: "EMP-001",
        username: "jane_doe",
        email: "jane.doe@acme.com",
        role: "COMPANY_MANAGER",
        status: "ACTIVE",
        createdAt: "2026-01-15T08:30:00Z"
    },
    {
        id: "EMP-002",
        username: "john_smith",
        email: "john.smith@acme.com",
        role: "COMPANY_USER",
        status: "ACTIVE",
        createdAt: "2026-02-10T14:45:00Z"
    },
    {
        id: "EMP-003",
        username: "alice_jones",
        email: "alice.jones@acme.com",
        role: "COMPANY_USER",
        status: "INACTIVE",
        createdAt: "2026-03-01T09:15:00Z"
    }
]

export default function AdminEmployeesPage() {
    const [employees, setEmployees] = useState<SimulatedEmployee[]>([])
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    
    // Dialog states
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState<SimulatedEmployee | null>(null)
    
    // Form fields
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [role, setRole] = useState<"COMPANY_MANAGER" | "COMPANY_USER">("COMPANY_USER")
    const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE")

    // Load & seed employees
    useEffect(() => {
        const saved = localStorage.getItem("finshield_simulated_employees")
        if (saved) {
            try {
                setEmployees(JSON.parse(saved))
            } catch {
                setEmployees(seedEmployees)
                localStorage.setItem("finshield_simulated_employees", JSON.stringify(seedEmployees))
            }
        } else {
            setEmployees(seedEmployees)
            localStorage.setItem("finshield_simulated_employees", JSON.stringify(seedEmployees))
        }
    }, [])

    const saveEmployees = (updatedList: SimulatedEmployee[]) => {
        setEmployees(updatedList)
        localStorage.setItem("finshield_simulated_employees", JSON.stringify(updatedList))
    }

    // CRUD - Create
    const handleCreateEmployee = (e: React.FormEvent) => {
        e.preventDefault()
        if (!username || !email) {
            toast.error("Please fill in all fields.")
            return
        }

        const emailExists = employees.some(emp => emp.email.toLowerCase() === email.toLowerCase())
        if (emailExists) {
            toast.error("An employee with this email already exists.")
            return
        }

        const newEmp: SimulatedEmployee = {
            id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
            username: username.trim().toLowerCase(),
            email: email.trim().toLowerCase(),
            role,
            status,
            createdAt: new Date().toISOString()
        }

        saveEmployees([...employees, newEmp])
        toast.success(`Created employee account for ${newEmp.username}`)
        
        // Reset form & close
        setUsername("")
        setEmail("")
        setRole("COMPANY_USER")
        setStatus("ACTIVE")
        setIsCreateOpen(false)
    }

    // CRUD - Edit
    const openEditDialog = (employee: SimulatedEmployee) => {
        setSelectedEmployee(employee)
        setUsername(employee.username)
        setEmail(employee.email)
        setRole(employee.role)
        setStatus(employee.status)
        setIsEditOpen(true)
    }

    const handleEditEmployee = (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedEmployee) return

        const updated = employees.map(emp => {
            if (emp.id === selectedEmployee.id) {
                return {
                    ...emp,
                    username: username.trim().toLowerCase(),
                    email: email.trim().toLowerCase(),
                    role,
                    status
                }
            }
            return emp
        })

        saveEmployees(updated)
        toast.success(`Updated employee details for ${username}`)
        setIsEditOpen(false)
        setSelectedEmployee(null)
    }

    // CRUD - Toggle Status
    const handleToggleStatus = (id: string) => {
        const updated = employees.map(emp => {
            if (emp.id === id) {
                const newStatus: "ACTIVE" | "INACTIVE" = emp.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
                toast.success(`Employee ${emp.username} is now ${newStatus.toLowerCase()}`)
                return { ...emp, status: newStatus }
            }
            return emp
        })
        saveEmployees(updated)
    }

    // CRUD - Delete
    const handleDeleteEmployee = (id: string, name: string) => {
        const filtered = employees.filter(emp => emp.id !== id)
        saveEmployees(filtered)
        toast.success(`Removed employee: ${name}`)
    }

    // Filtered list
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const matchesSearch = emp.username.toLowerCase().includes(search.toLowerCase()) ||
                emp.email.toLowerCase().includes(search.toLowerCase())
            const matchesStatus = statusFilter === "ALL" || emp.status === statusFilter
            return matchesSearch && matchesStatus
        })
    }, [employees, search, statusFilter])

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString()
        } catch {
            return "—"
        }
    }

    const formatRole = (roleStr: string) => {
        return roleStr === "COMPANY_MANAGER" ? "Manager" : "Employee"
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-normal tracking-tight">Employee Management</h2>
                    <p className="text-sm text-muted-foreground">Add, update, and manage your company employees and access levels.</p>
                </div>
                <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium"
                    onClick={() => setIsCreateOpen(true)}
                >
                    <Plus className="h-4 w-4" />
                    Add Employee
                </Button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by username or email..."
                        className="pl-9 bg-background border border-border focus-visible:ring-0 focus-visible:border-black/20"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 border border-border text-sm px-6 h-10">
                            <Filter className="h-4 w-4" />
                            Status: {statusFilter}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setStatusFilter("ALL")}>Show All</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("ACTIVE")}>Active Only</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("INACTIVE")}>Suspended Only</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Employees Table */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b border-border/50">
                            <TableHead className="px-4 py-4 text-center font-bold text-base text-foreground">Employee ID</TableHead>
                            <TableHead className="px-4 py-4 text-center font-bold text-base text-foreground">Username</TableHead>
                            <TableHead className="px-4 py-4 text-center font-bold text-base text-foreground">Email</TableHead>
                            <TableHead className="px-4 py-4 text-center font-bold text-base text-foreground">Role</TableHead>
                            <TableHead className="px-4 py-4 text-center font-bold text-base text-foreground">Date Added</TableHead>
                            <TableHead className="px-4 py-4 text-center font-bold text-base text-foreground">Status</TableHead>
                            <TableHead className="px-4 py-4 text-center font-bold text-base text-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEmployees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No employees found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredEmployees.map((emp) => (
                                <TableRow key={emp.id} className="h-16 hover:bg-muted/30 transition-colors border-b border-border/50">
                                    <TableCell className="px-4 text-center font-semibold text-foreground text-sm">
                                        {emp.id}
                                    </TableCell>
                                    <TableCell className="px-4 text-center font-bold text-foreground text-base">
                                        {emp.username}
                                    </TableCell>
                                    <TableCell className="px-4 text-center text-foreground text-sm font-medium">
                                        {emp.email}
                                    </TableCell>
                                    <TableCell className="px-4 text-center">
                                        <Badge variant={emp.role === "COMPANY_MANAGER" ? "default" : "secondary"} className="font-semibold text-xs">
                                            {formatRole(emp.role)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-4 text-center text-muted-foreground text-sm">
                                        {formatDate(emp.createdAt)}
                                    </TableCell>
                                    <TableCell className="px-4 text-center">
                                        <div className={`px-3 py-1 rounded-md text-[10px] font-bold w-fit mx-auto uppercase tracking-wider text-white ${emp.status === "ACTIVE" ? "bg-emerald-600" : "bg-red-600"}`}>
                                            {emp.status === "ACTIVE" ? "Active" : "Suspended"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0"
                                                onClick={() => openEditDialog(emp)}
                                                title="Edit Employee"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className={`h-8 w-8 p-0 ${emp.status === "ACTIVE" ? "text-amber-500 hover:text-amber-600" : "text-emerald-500 hover:text-emerald-600"}`}
                                                onClick={() => handleToggleStatus(emp.id)}
                                                title={emp.status === "ACTIVE" ? "Suspend Account" : "Activate Account"}
                                            >
                                                {emp.status === "ACTIVE" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                                onClick={() => handleDeleteEmployee(emp.id, emp.username)}
                                                title="Delete Employee"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[420px] rounded-xl border border-border">
                    <DialogHeader>
                        <DialogTitle>Add New Employee</DialogTitle>
                        <DialogDescription>Create a simulated employee record for compliance management.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateEmployee} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-username">Username</Label>
                            <Input
                                id="create-username"
                                placeholder="eg. alex_smith"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-email">Email</Label>
                            <Input
                                id="create-email"
                                type="email"
                                placeholder="eg. alex@acme.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-role">Access Role</Label>
                            <Select
                                value={role}
                                onValueChange={(val: any) => setRole(val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="COMPANY_USER">Employee (Upload & view invoices)</SelectItem>
                                    <SelectItem value="COMPANY_MANAGER">Manager (Full organization reviews)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-status">Initial Status</Label>
                            <Select
                                value={status}
                                onValueChange={(val: any) => setStatus(val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="INACTIVE">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="submit" className="w-full bg-[#00C28C] hover:bg-[#00C28C]/90 text-white font-bold h-11 rounded-lg">
                                Create Employee
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[420px] rounded-xl border border-border">
                    <DialogHeader>
                        <DialogTitle>Edit Employee Details</DialogTitle>
                        <DialogDescription>Update username, email, role or status parameters.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditEmployee} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-username">Username</Label>
                            <Input
                                id="edit-username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-role">Access Role</Label>
                            <Select
                                value={role}
                                onValueChange={(val: any) => setRole(val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="COMPANY_USER">Employee (Upload & view invoices)</SelectItem>
                                    <SelectItem value="COMPANY_MANAGER">Manager (Full organization reviews)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-status">Status</Label>
                            <Select
                                value={status}
                                onValueChange={(val: any) => setStatus(val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="INACTIVE">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="submit" className="w-full bg-[#00C28C] hover:bg-[#00C28C]/90 text-white font-bold h-11 rounded-lg">
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
