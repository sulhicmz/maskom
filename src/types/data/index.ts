import { StaticImageData } from "next/image";

export interface BaseDataItem {
  id: number;
  page: string;
}

export interface MenuItem {
  id: number;
  title: string;
  link: string;
  has_dropdown: boolean;
  sub_menus?: {
    link: string;
    title: string;
  }[];
}

export interface FeedbackItem extends BaseDataItem {
  avatar: StaticImageData;
  name: string;
  designation: string;
  desc: string;
  rating: string;
}

export interface FaqItem extends BaseDataItem {
  question: string;
  answer: string;
}

export interface PriceDetailItem {
  id: number;
  sub_title: string;
  price: number;
  btn: string;
  feature: string[];
  currency?: string;
  price_label?: string;
  note?: string;
}

export interface PriceItem extends BaseDataItem {
  price_details: PriceDetailItem[];
}

export interface FeatureItem extends BaseDataItem {
  icon: string;
  title: string;
  desc: string;
}

export interface ProcessItem extends BaseDataItem {
  img: StaticImageData;
  count: string;
  title: string;
  desc: string;
}

export interface CauseItem extends BaseDataItem {
  icon: string;
  title: string;
  desc: string;
}

export interface WiFiDevice {
  id: number;
  name: string;
  ip: string;
  status: "Online" | "Offline";
}

export interface WebsiteTemplate {
  id: number;
  name: string;
  preview: string;
}

export interface AIStep {
  id: number;
  title: string;
  content: string;
}

export interface BlogCommentItem {
  id: number;
  avatar: StaticImageData;
  name: string;
  date: string;
  content: string;
}

export interface TeamMember {
  id: number;
  img: StaticImageData;
  title: string;
  designation: string;
}

export interface InnerBlogPost {
  id: number;
  thumb: StaticImageData;
  title: string;
  desc: string;
  date: string;
  user: string;
  tag: string;
}

export interface FaqDetail {
  id: number;
  title: string;
  desc: string;
}

export interface InnerFaqItem {
  id: number;
  faq_details: FaqDetail[];
}

export interface SocialLink {
  url: string;
  iconClass: string;
  ariaLabel: string;
  target?: "_blank" | "_self";
}

export interface NavigationItem {
  url: string;
  label: string;
  target?: "_blank" | "_self";
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export type RelationshipType = "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";

export interface DataRelationship {
  sourceCollection: string;
  targetCollection: string;
  sourceField: string;
  targetField: string;
  type: RelationshipType;
  optional?: boolean;
}

export interface RelationshipValidationError {
  relationship: DataRelationship;
  error: string;
  sourceItemId?: string;
  targetId?: string;
}

export interface ReferentialIntegrityResult {
  isValid: boolean;
  errors: RelationshipValidationError[];
  relationshipsValidated: number;
}
