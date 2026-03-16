import React, { useState } from 'react';
import { MermaidDiagram } from '../components/diagrams/MermaidDiagram';

type TabId = 'overview' | 'standard' | 'auth' | 'upload' | 'school' | 'admin';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Architecture' },
  { id: 'standard', label: 'Standard Flow' },
  { id: 'auth', label: 'Auth' },
  { id: 'upload', label: 'Upload' },
  { id: 'school', label: 'School Master' },
  { id: 'admin', label: 'Admin / Users' },
];

const DIAGRAMS: Record<TabId, { chart: string; title: string; description: string }> = {
  overview: {
    title: 'High-Level Architecture',
    description: 'Monorepo structure: shared schemas, React frontend, Express backend.',
    chart: `flowchart TB
    subgraph Client["Client (React)"]
      Pages["Pages"]
      Components["Components"]
      Hooks["Hooks"]
      Services["Services"]
      Store["Store"]
      Pages --> Components
      Pages --> Hooks
      Hooks --> Services
      Hooks --> Store
    end

    subgraph Shared["Shared"]
      Schemas["Zod Schemas"]
    end

    subgraph Server["Server (Express)"]
      Routes["Routes"]
      Controllers["Controllers"]
      Middleware["Middleware"]
      Svcs["Services"]
      Routes --> Middleware
      Routes --> Controllers
      Controllers --> Svcs
    end

    subgraph Data["Data"]
      Prisma["Prisma / DB"]
      S3["S3 Storage"]
    end

    Services -->|"HTTP/API"| Routes
    Svcs --> Prisma
    Svcs --> S3
    Client -.->|"Validation"| Shared
    Server -.->|"Validation"| Shared`,
  },
  standard: {
    title: 'Standard Feature Flow (All Features Follow This)',
    description: 'Page → Hook → Service → API → Route → Controller → Service → DB. Same pattern for Auth, Upload, Schools, Admin.',
    chart: `sequenceDiagram
    autonumber
    participant User
    participant Page
    participant Hook
    participant Service
    participant API
    participant Route
    participant Controller
    participant BackendService
    participant DB

    User->>Page: User action (click, submit)
    Page->>Hook: Call mutation/query
    Hook->>Service: API method (get, post, put, delete)
    Service->>API: axios request
    API->>Route: HTTP request
    Route->>Route: validate + authenticate + requireRole
    Route->>Controller: Handler
    Controller->>BackendService: Business logic
    BackendService->>DB: Prisma / S3
    DB-->>BackendService: Result
    BackendService-->>Controller: Data
    Controller-->>API: JSON response
    API-->>Service: Response
    Service-->>Hook: Data
    Hook-->>Page: Update UI (React Query + state)`,
  },
  auth: {
    title: 'Authentication Flow',
    description: 'Login: Form → useAuth → authService → /auth/login → auth.controller → auth.service → Prisma + JWT.',
    chart: `sequenceDiagram
    autonumber
    participant User
    participant LoginForm
    participant useAuth
    participant authService
    participant API
    participant authController
    participant authServiceBE
    participant Prisma

    User->>LoginForm: Submit credentials
    LoginForm->>useAuth: login(data)
    useAuth->>authService: login(data)
    authService->>API: POST /auth/login
    API->>authController: loginHandler
    authController->>authServiceBE: login(data)
    authServiceBE->>Prisma: findUnique User
    authServiceBE->>authServiceBE: bcrypt.compare
    authServiceBE->>authServiceBE: jwt.sign (access + refresh)
    authServiceBE->>Prisma: create RefreshToken
    authServiceBE-->>authController: tokens + user
    authController-->>API: Set cookies + JSON
    API-->>authService: user
    authService-->>useAuth: user
    useAuth->>useAuth: setUser, navigate /dashboard`,
  },
  upload: {
    title: 'Upload Flow (Single & Bulk)',
    description: 'UploadForm → useCreateUpload → uploadService → POST /uploads → upload.controller → upload.service → S3 + Prisma.',
    chart: `sequenceDiagram
    autonumber
    participant User
    participant UploadForm
    participant useCreateUpload
    participant uploadService
    participant API
    participant uploadController
    participant uploadServiceBE
    participant fileNumberSvc
    participant S3
    participant Prisma

    User->>UploadForm: Submit form + file
    UploadForm->>useCreateUpload: createUpload(formData, file)
    useCreateUpload->>uploadService: createUpload(formData, file)
    uploadService->>API: POST /uploads (FormData)
    API->>uploadController: createUpload (multer)
    uploadController->>uploadController: UploadFormSchema.safeParse
    uploadController->>uploadServiceBE: createUpload(parsed, file)
    uploadServiceBE->>fileNumberSvc: issueFileNumber
    fileNumberSvc->>Prisma: fileSequence update
    uploadServiceBE->>uploadServiceBE: buildS3Key
    uploadServiceBE->>S3: PutObject
    uploadServiceBE->>Prisma: create Upload record
    uploadServiceBE-->>uploadController: id, fileNumber
    uploadController-->>API: JSON
    API-->>uploadService: id, fileNumber
    uploadService-->>useCreateUpload: Success
    useCreateUpload-->>UploadForm: Close modal, refetch list`,
  },
  school: {
    title: 'School Master Flow',
    description: 'SchoolMasterPage → useSchools hooks → schoolService → /schools → school.controller → school.service → Prisma.',
    chart: `sequenceDiagram
    autonumber
    participant User
    participant SchoolMasterPage
    participant useAllSchools
    participant schoolService
    participant API
    participant schoolController
    participant schoolServiceBE
    participant Prisma

    User->>SchoolMasterPage: List / Create / Edit / Delete
    SchoolMasterPage->>useAllSchools: fetch (React Query)
    useAllSchools->>schoolService: listAllSchools(params)
    schoolService->>API: GET /schools
    API->>schoolController: listAllSchools
    schoolController->>schoolServiceBE: getAllSchools(params)
    schoolServiceBE->>Prisma: findMany School
    Prisma-->>schoolServiceBE: schools
    schoolServiceBE-->>schoolController: schools, total
    schoolController-->>API: JSON
    API-->>schoolService: data
    schoolService-->>useAllSchools: data
    useAllSchools-->>SchoolMasterPage: Render table

    Note over User,Prisma: Create/Update/Delete follow same path via POST/PUT/DELETE`,
  },
  admin: {
    title: 'Admin / Users Flow',
    description: 'ManageUsersPage → useQuery/useMutation → api → /admin/users → admin.controller → auth.service → Prisma.',
    chart: `sequenceDiagram
    autonumber
    participant User
    participant ManageUsersPage
    participant useQuery
    participant api
    participant adminController
    participant authService
    participant Prisma

    User->>ManageUsersPage: View / Create / Edit / Delete user
    ManageUsersPage->>useQuery: fetchUsers
    useQuery->>api: GET /admin/users
    api->>adminController: listUsers
    adminController->>authService: listUsers
    authService->>Prisma: findMany User
    Prisma-->>authService: users
    authService-->>adminController: users
    adminController-->>api: JSON
    api-->>useQuery: users
    useQuery-->>ManageUsersPage: Render table

    Note over User,Prisma: Create: POST /admin/users, validate(CreateUserSchema)
    Note over User,Prisma: Update: PUT /admin/users/:id
    Note over User,Prisma: Delete: DELETE /admin/users/:id
    Note over User,Prisma: All require authenticate + requireRole ADMIN`,
  },
};

export default function ArchitectureFlowPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const { chart, title, description } = DIAGRAMS[activeTab];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Architecture & Flow Diagrams</h1>
        <p className="text-[0.95rem] text-slate-600 mt-1">
          Visual guide to the codebase. All features follow the same standard flow.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-[0.95rem] font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <p className="text-[0.95rem] text-slate-600 mt-1">{description}</p>
        </div>
        <MermaidDiagram chart={chart} id={`diagram-${activeTab}`} className="min-h-[300px]" />
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-indigo-800 mb-2">Developer tip</h3>
        <p className="text-[0.95rem] text-indigo-700">
          Once you understand one flow (e.g. Auth or Upload), the same pattern applies to all others:
          <strong> Page → Hook → Service → API → Controller → Service → DB</strong>. Only the domain logic changes.
        </p>
      </div>
    </div>
  );
}
