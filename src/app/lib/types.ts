export type EonetCategory = {
  id: string;
  title: string;
  description?: string;
  link?: string;
};

export type EonetCategoriesResponse = {
  title?: string;
  description?: string;
  link?: string;
  categories: EonetCategory[];
};

export type EonetSource = {
  id?: string;
  url?: string;
};

export type EonetEventCategory = {
  id?: string;
  title?: string;
};

export type EonetGeometry = {
  magnitudeValue?: number | null;
  magnitudeUnit?: string | null;
  date?: string;
  type?: string;
  coordinates: any;
};

export type EonetEvent = {
  id: string;
  title: string;
  description?: string | null;
  link?: string;
  closed?: string | null;
  categories?: EonetEventCategory[];
  sources?: EonetSource[];
  geometry?: EonetGeometry[];
};

export type EonetEventDetailResponse = EonetEvent;

export type EonetGeoJsonFeature = {
  type: "Feature";
  properties: {
    id: string;
    title: string;
    description?: string | null;
    link?: string;
    closed?: string | null;
    categories?: EonetEventCategory[];
    sources?: EonetSource[];
  };
  geometry: {
    type: string;
    coordinates: any;
  };
};

export type EonetGeoJsonResponse = {
  type: "FeatureCollection";
  features: EonetGeoJsonFeature[];
};
