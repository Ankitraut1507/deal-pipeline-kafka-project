export interface DealNote {
  noteId: string;
  note: string;
  userId: string;
  createdAt: string;
}

export interface DealBase {
  id: string;
  title: string;
  sector: string;
  dealType: string;
  stage: string;
  notes?: DealNote[];
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DealUser extends DealBase {
  // Regular users can see basic deal information
  // Additional properties can be added as needed
}

export interface DealAdmin extends DealBase {
  dealValue?: number;
}

export type Deal = DealUser | DealAdmin;
