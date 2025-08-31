// Notification types - define manually until Prisma client is regenerated
export enum NotificationType {
  BOOK_DUE_REMINDER = 'BOOK_DUE_REMINDER',
  BOOK_OVERDUE = 'BOOK_OVERDUE',
  NEW_BOOK_AVAILABLE = 'NEW_BOOK_AVAILABLE',
  RESERVATION_READY = 'RESERVATION_READY',
  REVIEW_REPLY = 'REVIEW_REPLY',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT'
}

// List types - define manually until Prisma client is regenerated
export enum ListType {
  FAVORITES = 'FAVORITES',
  WISHLIST = 'WISHLIST',
  READING = 'READING',
  COMPLETED = 'COMPLETED'
}

// Loan status - define manually until Prisma client is regenerated
export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE',
  LOST = 'LOST'
}

// Reservation status - define manually until Prisma client is regenerated
export enum ReservationStatus {
  PENDING = 'PENDING',
  READY = 'READY',
  FULFILLED = 'FULFILLED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}