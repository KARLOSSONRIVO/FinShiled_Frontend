import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const headerWidths = ["w-24", "w-20", "w-20", "w-24", "w-20", "w-24", "w-28"]

export function AuditLogTableSkeleton() {
    return (
        <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-border/50 hover:bg-transparent">
                        {headerWidths.map((width, index) => (
                            <TableHead key={index} className="px-6 py-4">
                                <Skeleton className={cnSkeleton(width)} />
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, rowIndex) => (
                        <TableRow key={rowIndex} className="h-20 border-b border-border/50">
                            {headerWidths.map((width, cellIndex) => (
                                <TableCell key={cellIndex} className="px-6 py-4">
                                    <Skeleton className={cnSkeleton(width, cellIndex === 6 ? "h-8" : "h-5")} />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

function cnSkeleton(width: string, height = "h-4") {
    return `${height} ${width}`
}
