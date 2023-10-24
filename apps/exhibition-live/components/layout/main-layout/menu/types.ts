type Item = {
  id: string;
  title: string;
  caption?: string;
  url?: string;
  disabled?: boolean;
  target?: string;
  icon?: string | React.FC<{ stroke: number; size: string }>;
  breadcrumbs?: boolean;
  chip?: {
    label: string;
    color: string;
    variant: string;
    avatar?: string;
    size?: string;
  };
};
export type MenuInterface = Item & {
  type: "item" | "group" | "collapse";
};

export type MenuItem = MenuInterface & {
  type: "item";
  url: string;
};
export type MenuCollapse = MenuInterface & {
  type: "collapse";
  children: (MenuItem | MenuGroup | MenuCollapse)[];
};

export type MenuGroup = MenuInterface & {
  type: "group";
  children: (MenuItem | MenuGroup | MenuCollapse)[];
};
