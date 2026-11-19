type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 18, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </Icon>
);
export const HeartIcon = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <Icon {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20s-7.5-4.6-7.5-10.1A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" />
  </Icon>
);
export const BagIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5.5 8h13l-1 12h-11l-1-12Z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </Icon>
);
export const ArrowRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);
export const TruckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 6.5h11v9H3zM14 9.5h4l3 3v3h-7" />
    <circle cx="7" cy="17.5" r="1.6" />
    <circle cx="17.5" cy="17.5" r="1.6" />
  </Icon>
);
export const ReturnIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 12a8 8 0 1 0 2.4-5.7" />
    <path d="M4 4v4h4" />
  </Icon>
);
export const LockIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="1.5" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </Icon>
);
export const ChatIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 5.5h15v10h-9l-4 3.5v-3.5h-2z" />
  </Icon>
);
export const SparkIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.5c.6 4.4 1.6 5.6 6 6.5-4.4.9-5.4 2.1-6 6.5-.6-4.4-1.6-5.6-6-6.5 4.4-.9 5.4-2.1 6-6.5Z" />
  </Icon>
);
export const TargetIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="7" />
    <circle cx="12" cy="12" r="3.5" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
  </Icon>
);
export const MenuIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);
export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);
export const MinusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 12h12" />
  </Icon>
);
export const PlusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 6v12M6 12h12" />
  </Icon>
);
export const CheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
);
