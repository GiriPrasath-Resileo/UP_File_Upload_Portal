export interface Upload {
  id:           string;
  fileNumber:   string;
  s3Key:        string;
  s3Bucket:     string;
  district:     string;
  block:        string;
  place:        string;
  board:        string;
  schoolName:   string;
  udiseCode:    string;
  medium:       string;
  classGrade:   string;
  subject:      string;
  sampleType:   string;
  gender:       string;
  dominantHand: string;
  status:       'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  errorMessage: string | null;
  createdAt:    string;
  updatedAt:    string;
  uploadedBy:   { userId: string };
}

export interface UploadStats {
  total:          number;
  today:          number;
  schools:        number;
  nextFileNumber: string;
}

export interface UploadListResponse {
  data:       Upload[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

export interface BulkUploadResult {
  success:     number;
  failed:      { pdfFileName: string; error: string }[];
  parseErrors: { rowIndex: number; errors: string[] }[];
}
