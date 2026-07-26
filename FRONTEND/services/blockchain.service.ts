import { apiClient } from "@/lib/api-client"
import { PaginatedResponse, BlockchainTransaction } from "@/lib/types"

// Valid sortBy values per GET /blockchain/transactions docs
type BlockchainTransactionSortBy = "anchoredAt" | "invoiceNumber"

interface BlockchainTransactionParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: BlockchainTransactionSortBy;
    order?: "asc" | "desc";
}

export const blockchainService = {
    getTransactions: async (params?: BlockchainTransactionParams): Promise<PaginatedResponse<BlockchainTransaction>> => {
        // Enforce valid sortBy only
        const cleanParams = params ? { ...params } : {}
        if (cleanParams.sortBy && !["anchoredAt", "invoiceNumber"].includes(cleanParams.sortBy)) {
            delete cleanParams.sortBy
            delete cleanParams.order
        }
        const response = await apiClient.get<PaginatedResponse<BlockchainTransaction>>("/blockchain/transactions", { params: cleanParams })
        return response.data
    },
}
