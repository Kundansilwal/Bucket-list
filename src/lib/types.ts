export type GlobalStats = {
  totalSubmissions: number;
  totalItems: number;
  waterLevel: number;
  stage: number;
  stageStart: number;
  stageEnd: number;
};

export type BucketList = {
  publicId: string;
  createdAt: string;
  items: Array<{ text: string; position: number }>;
};
