export interface User {
  id:            string;
  userId:        string;
  role:          'ADMIN' | 'UPLOADER';
  districtScope: string | null;
  isActive:      boolean;
  createdAt:     string;
}
