// HR related type definitions based on Elektraweb API architecture

export interface Employee {
    id: string
    firstName: string
    lastName: string
    title?: string
    department?: string
    email?: string
    phone?: string
    status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'
    hireDate?: string
    // RBAC or role info
    role?: string
}

export interface AttendanceLog {
    id: string
    employeeId: string
    timestamp: string // ISO 8601
    type: 'CHECK_IN' | 'CHECK_OUT' | 'BREAK_START' | 'BREAK_END'
    source: 'BIOMETRIC' | 'RFID_CARD' | 'MANUAL' | 'MOBILE_APP'
    location?: string
}

export interface HRRequest {
    id: string
    employeeId: string
    type: 'LEAVE' | 'EXPENSE' | 'ADVANCE_PAYMENT' | 'OTHER'
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    requestDate: string
    description?: string
    amount?: number // Used for Expense or Advance Payment
    approverId?: string
    approvalDate?: string
}
