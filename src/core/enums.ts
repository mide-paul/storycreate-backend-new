enum AccessLevel {
    ALL = "all",
    ADMINISTRATOR = "administrator",
    SUPER_ADMINISTRATOR = "super_administrator",
    USER = "user",
    CREATOR = "creator",
    OWNER = "owner",
    CONTENT_CREATOR = "content_creator",
    GRAPHIC_DESIGNER = "graphic_designer",
    FINANCE_ANALYST = "finance_analyst",
    MARKETING_MANAGER = "marketing_manager",
    TECHNICAL = "technical",
  }
  
  enum Gender {
    MALE = "M",
    FEMALE = "F",
  }
  
  enum JobTypes {
    FULL_TIME = "full-time",
    PART_TIME = "part-time",
    APPRENTICESHIP = "apprenticeship",
    INTERNSHIP = "internship",
    CONTRACT = "contract",
    TEMPORARY = "temporary",
  }
  
  enum TransactionType {
    DEPOSIT = "deposit",
    WITHDRAWAL = "withdrawal",
  }
  
  enum TransactionStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
  }
  
  enum PaymentMethod {
    CARD = "card",
    BANK_TRANSFER = "bank_transfer",
    PAYPAL = "paypal",
  }
  
  enum PaymentStatus {
    UNPAID = "unpaid",
    PAID = "paid",
    REFUNDED = "refunded",
  }
  
  enum PublishStatus {
    PENDING = "pending",
    PENDING_REVIEW = "pending_review",
    UNDER_REVIEW = "under_review",
    PUBLISHED = "published",
    DRAFT = "draft",
    ARCHIVED = "archived",
    REJECTED = "rejected",
    DELETED = "deleted",
  }
  
  enum InvitationStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    PENDING_REGISTRATION = "pending_registration",
    REGISTERED = "registered",
  }
  
  enum StorycreateContentType {
    WHITEPAPER = "whitepaper",
    MEDIAKIT = "mediakit",
    CASE_STUDY = "case_study",
    PRESS_RELEASE = "press_release",
    REGULATION = "regulation",
    MEDIA = "media",
    ASSESSSMENT_SPONSORSHIP = "assessment_sponsorship",
  }
  
  enum OrderType {
    PRODUCT = "product",
    BUNDLE = "bundle",
  }
  
  enum OrderItemType {
    TRAINING = "training",
    AUDIT = "audit",
    CERTIFICATION = "certification",
    ADS = "ads",
    EBOOK = "ebook",
    RECOMMENDATION_BUNDLE = "recommendation-bundle",
    RECOMMENDATION_SINGLE = "recommendation-single",
  }
  
  enum OrderStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
  }
  
  enum PAYMENTURLS {
    LANDING_PAGE = "https://storycreate.com",
  }
  
  enum LeadType {
    INDIVIDUAL = "individual",
    COMPANY = "company",
  }
  
  enum LeadStatus {
    PENDING = "pending",
    OPEN = "open",
    CLOSED = "closed",
  }
  
  enum AdDocumentType {
    AGREEMENT = "agreement",
  }
  
  enum RequestStatus {
    PENDING = "pending",
    REQUIRES_ACTION = "requires_action",
    APPROVED = "approved",
    REJECTED = "rejected",
  }
  
  enum ProductCategory {
    COURSE = "course",
    BOOK = "book",
  }
  
  enum AdMediaType {
    IMAGE = "image",
    VIDEO = "video",
    AUDIO = "audio",
    DOCUMENT = "document",
  }
  
  enum PlanType {
    FREE = "free",
    TRIAL = "trial",
    BASIC = "basic",
    STANDARD = "standard",
    PREMIUM = "premium",
    CUSTOM = "custom",
    PAY_AS_YOU_GO = "pay_as_you_go",
  }
  
  enum AdActivityType {
    VIEW = "view",
    CLICK = "click",
    SHARE = "share",
    LIKE = "like",
    COMMENT = "comment",
    REPORT = "report",
    FLAG = "flag",
    BLOCK = "block",
    HIDE = "hide",
    UNHIDE = "unhide",
  }
  
  enum SubscriptionStatus {
    INACTIVE = "inactive",
    PENDING = "pending",
    ACTIVE = "active",
    CANCELLED = "cancelled",
    EXPIRED = "expired",
    DUE = "due",
    SUSPENDED = "suspended",
    TERMINATED = "terminated",
    FAILED = "failed",
    REFUNDED = "refunded",
    PENDING_CANCELLATION = "pending_cancellation",
    PENDING_RENEWAL = "pending_renewal",
    PENDING_REACTIVATION = "pending_reactivation",
  }
  
  enum AccessMethod {
    EMAIL_PASSWORD = "email_password",
    PHONE_PASSWORD = "phone_password",
    GOOGLE = "google",
  }
  
  // Enum definition for status
  enum UserStatus {
    Inactive = -1,
    Pending = 0,
    Active = 1,
  }
  
  enum PayoutStatus {
    PENDING = "pending",
    PAID = "paid",
    FAILED = "failed",
  }
  
  enum BankAccountStatus {
    APPROVED = "approved",
    PENDING = "pending",
    REJECTED = "rejected",
    DELETED = "deleted",
  }
  
  // enum PublishStatus {
  //   PUBLISHED = "published",
  //   DRAFT = "draft",
  //   ARCHIVED = "archived",
  // }
  
  export {
    AccessLevel,
    JobTypes,
    Gender,
    TransactionType,
    TransactionStatus,
    PaymentMethod,
    PaymentStatus,
    PublishStatus,
    InvitationStatus,
    StorycreateContentType,
    LeadStatus,
    LeadType,
    AdDocumentType,
    RequestStatus,
    ProductCategory,
    AdMediaType,
    PlanType,
    AdActivityType,
    SubscriptionStatus,
    AccessMethod,
    UserStatus,
    OrderStatus,
    OrderItemType,
    OrderType,
    PayoutStatus,
    BankAccountStatus,
    PAYMENTURLS
  };
  