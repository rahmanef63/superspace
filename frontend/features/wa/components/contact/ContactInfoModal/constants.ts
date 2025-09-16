import { 
  Info,
  Image as ImageIcon, 
  FileText, 
  Link, 
  Calendar, 
  Lock,
  Users
} from "lucide-react";
import { SectionType } from "./types";

export const NAVIGATION_ITEMS = [
  { id: 'overview' as SectionType, icon: Info, label: 'Overview' },
  { id: 'media' as SectionType, icon: ImageIcon, label: 'Media' },
  { id: 'files' as SectionType, icon: FileText, label: 'Files' },
  { id: 'links' as SectionType, icon: Link, label: 'Links' },
  { id: 'events' as SectionType, icon: Calendar, label: 'Events' },
  { id: 'encryption' as SectionType, icon: Lock, label: 'Encryption' },
  { id: 'groups' as SectionType, icon: Users, label: 'Groups' },
];

export const SIDEBAR_SECTIONS = NAVIGATION_ITEMS;
