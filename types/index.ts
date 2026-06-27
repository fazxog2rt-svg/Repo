// =============================================================
// NEXUS AI - Core Type Definitions
// =============================================================

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";
export type PlanType = "FREE" | "BASIC" | "PRO" | "PREMIUM" | "ENTERPRISE";
export type InvoiceStatus = "PENDING" | "PAID" | "EXPIRED" | "REJECTED" | "CANCELLED";
export type SubscriptionStatus = "ACTIVE" | "INACTIVE" | "CANCELLED" | "EXPIRED" | "PENDING";
export type MessageRole = "USER" | "ASSISTANT" | "SYSTEM";
export type NotificationType = "SYSTEM" | "PAYMENT" | "SUBSCRIPTION" | "CHAT" | "ADMIN";

// ============================================================
// USER
// ============================================================

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  isActive: boolean;
  isBanned: boolean;
  isSuspended: boolean;
  phone: string | null;
  bio: string | null;
  language: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
  subscription?: Subscription;
}

// ============================================================
// OPENROUTER MODEL
// ============================================================

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  architecture?: {
    modality: string;
    tokenizer: string;
    instruct_type?: string;
  };
  pricing: {
    prompt: string;
    completion: string;
    image?: string;
    request?: string;
  };
  top_provider?: {
    context_length?: number;
    max_completion_tokens?: number;
  };
  per_request_limits?: Record<string, unknown>;
}

export interface ModelGroup {
  provider: string;
  models: OpenRouterModel[];
}

// ============================================================
// CHAT
// ============================================================

export interface Chat {
  id: string;
  title: string;
  userId: string;
  folderId: string | null;
  agentId: string | null;
  modelId: string;
  isPinned: boolean;
  isArchived: boolean;
  shareToken: string | null;
  isShared: boolean;
  systemPrompt: string | null;
  temperature: number;
  maxTokens: number;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
  agent?: Agent;
}

export interface Message {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  modelId?: string;
  tokens?: number;
  isEdited: boolean;
  editedAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ============================================================
// AGENT
// ============================================================

export interface Agent {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  avatar: string | null;
  systemPrompt: string;
  modelId: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// PROMPT
// ============================================================

export interface Prompt {
  id: string;
  userId: string | null;
  title: string;
  content: string;
  category: string;
  description: string | null;
  tags: string[];
  isPublic: boolean;
  isFavorited: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// SUBSCRIPTION & BILLING
// ============================================================

export interface Plan {
  id: string;
  name: string;
  slug: string;
  type: PlanType;
  description: string | null;
  price: number;
  currency: string;
  period: string;
  monthlyTokens: number;
  features: Record<string, boolean | string | number>;
  availableModels: string[];
  maxChats: number;
  maxAgents: number;
  maxFileSize: number;
  maxStorageGB: number;
  isActive: boolean;
  sortOrder: number;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: Date | null;
  endDate: Date | null;
  tokensUsed: number;
  tokensLimit: number;
  autoRenew: boolean;
  plan?: Plan;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  bankName: string | null;
  bankAccount: string | null;
  bankOwner: string | null;
  expiredAt: Date;
  paidAt: Date | null;
  whatsappPhone: string | null;
  createdAt: Date;
  user?: User;
  plan?: Plan;
  paymentProof?: PaymentProof;
}

export interface PaymentProof {
  id: string;
  invoiceId: string;
  senderName: string;
  senderBank: string;
  amount: number;
  imageUrl: string | null;
  submittedAt: Date;
}

// ============================================================
// API RESPONSE
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================
// NOTIFICATION
// ============================================================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// ============================================================
// DASHBOARD ANALYTICS
// ============================================================

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalChats: number;
  totalMessages: number;
  totalTokensUsed: number;
  pendingPayments: number;
}

// ============================================================
// FILE
// ============================================================

export interface UploadedFile {
  id: string;
  name: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  fileType: string;
  extractedText?: string;
  createdAt: Date;
}

// ============================================================
// NAVIGATION
// ============================================================

export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  isNew?: boolean;
  children?: NavItem[];
}

// ============================================================
// COMMAND PALETTE
// ============================================================

export interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action: () => void;
  shortcut?: string;
  category: string;
}
