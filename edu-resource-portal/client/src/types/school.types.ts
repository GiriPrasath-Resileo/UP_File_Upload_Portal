export interface School {
  id:        string;
  name:      string;
  udiseCode: string;
  boardCode: string;
  placeName: string;
  block:     string;
  district:  string;
  createdAt: string;
}

export interface SchoolListResponse {
  data:       School[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}
