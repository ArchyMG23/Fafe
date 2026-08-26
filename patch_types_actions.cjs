const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf8');

const newTypes = `
export interface ActionCategory {
  id: string;
  slug: string;
  titleFR: string;
  titleEN: string;
  descriptionFR?: string;
  descriptionEN?: string;
  image?: string;
  icon?: string;
  colorAccent?: string;
  order: number;
  isActive: boolean;
}

export interface FAFEAction {
  id: string;
  slug: string;
  categoryId: string;
  titleFR: string;
  titleEN: string;
  shortDescriptionFR: string;
  shortDescriptionEN: string;
  fullDescriptionFR?: string;
  fullDescriptionEN?: string;
  image: string;
  gallery?: string[];
  videoUrl?: string;
  country?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'ARCHIVED';
  objectivesFR?: string[];
  objectivesEN?: string[];
  resultsFR?: string[];
  resultsEN?: string[];
  isFeatured: boolean;
  ctaTextFR?: string;
  ctaTextEN?: string;
  ctaLink?: string;
}

export interface ActionTestimonial {
  id: string;
  actionId?: string;
  photo: string;
  firstName: string;
  lastName: string;
  company: string;
  country: string;
  testimonialFR: string;
  testimonialEN: string;
  isVisible: boolean;
}

export interface ActionStatistic {
  id: string;
  value: string;
  labelFR: string;
  labelEN: string;
  icon?: string;
  prefix?: string;
  suffix?: string;
  order: number;
  isVisible: boolean;
}
`;

content = content + '\n' + newTypes;
fs.writeFileSync('src/types/index.ts', content);
