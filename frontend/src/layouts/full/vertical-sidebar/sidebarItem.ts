import {
  DashboardIcon,
  BrandChromeIcon,
  HelpIcon,
  MessageIcon,
  ChartBarIcon,
  CalendarIcon,
  UsersIcon,
  FileTextIcon,
  SettingsIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  BuildingIcon,
  ClipboardIcon,
  FolderIcon,
  PlusIcon
} from 'vue-tabler-icons';

export interface menu {
  header?: string;
  title?: string;
  icon?: object;
  to?: string;
  divider?: boolean;
  chip?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: menu[];
  disabled?: boolean;
  type?: string;
  subCaption?: string;
}

const sidebarItem: menu[] = [
  { header: 'Dashboard' },
  {
    title: 'Dashboard',
    icon: DashboardIcon,
    to: '/dashboard/default'
  },
  {divider: true},
  { header: 'Task Management' },
  {
    title: 'Project',
    icon: FolderIcon,
    to: '/projects',
    children: [
      {
        title: 'Create Project',
        icon: PlusIcon,
        to: '/projects/create'
      },
      {
        title: 'My Projects',
        icon: FolderIcon,
        to: '/projects'
      }
    ]
  },
  {
    title: 'Task Calendar',
    icon: CalendarIcon,
    to: '/tasks/calendar'
  },
  {
    title: 'Boards',
    icon: BrandChromeIcon,
    to: '/boards'
  },
  { divider: true },
  { header: 'Communication' },
  {
    title: 'Messages',
    icon: MessageIcon,
    to: '/messages'
  },
  {
    title: 'Team Chat',
    icon: UsersIcon,
    to: '/team-chat'
  },
  { divider: true },
  { header: 'Analytics & Reports' },
  {
    title: 'Analytics',
    icon: ChartBarIcon,
    to: '/analytics'
  },
  {
    title: 'Reports',
    icon: FileTextIcon,
    to: ''
  },
  { divider: true },
  { header: 'Finance' },
  {
    title: 'Payments',
    icon: CreditCardIcon,
    to: '/payments'
  },
  { divider: true },
  { header: 'System' },
  {
    title: 'Settings',
    icon: SettingsIcon,
    to: '/settings'
  },
  {
    title: 'Help & Support',
    icon: HelpIcon,
    to: ''
  }
];

export default sidebarItem;
