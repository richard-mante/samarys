import { HugeiconsIcon } from "@hugeicons/react";
import {
  Activity01Icon, Add01Icon, ArrowLeft01Icon, ArrowRight01Icon, ArrowUpRight01Icon,
  CheckmarkCircle02Icon, Clock01Icon, CreditCardIcon, CustomerService01Icon,
  DashboardSquare01Icon, DeliveryTruck01Icon, Edit01Icon, FilterHorizontalIcon,
  Home01Icon, Image01Icon, ImageAdd01Icon, Logout01Icon, Package01Icon,
  Search01Icon, Settings01Icon, ShoppingCart01Icon, Store01Icon, UserGroupIcon,
  WhatsappIcon, ShieldCheckIcon, Wallet01Icon, Task01Icon, InformationCircleIcon,
} from "@hugeicons/core-free-icons";

const icons = {
  activity: Activity01Icon, add: Add01Icon, back: ArrowLeft01Icon, next: ArrowRight01Icon,
  external: ArrowUpRight01Icon, success: CheckmarkCircle02Icon, clock: Clock01Icon,
  card: CreditCardIcon, support: CustomerService01Icon, overview: DashboardSquare01Icon,
  delivery: DeliveryTruck01Icon, edit: Edit01Icon, filter: FilterHorizontalIcon,
  home: Home01Icon, image: Image01Icon, imageAdd: ImageAdd01Icon, logout: Logout01Icon,
  product: Package01Icon, search: Search01Icon, settings: Settings01Icon,
  cart: ShoppingCart01Icon, store: Store01Icon, customers: UserGroupIcon,
  whatsapp: WhatsappIcon, security: ShieldCheckIcon, wallet: Wallet01Icon,
  orders: Task01Icon, information: InformationCircleIcon,
} as const;

export type AppIconName = keyof typeof icons;

export function AppIcon({ name, size = 18, className, strokeWidth = 1.8 }: {
  name: AppIconName; size?: number; className?: string; strokeWidth?: number;
}) {
  return <HugeiconsIcon icon={icons[name]} size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />;
}
