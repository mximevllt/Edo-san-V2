import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  AreaChart,
  BadgePercent,
  BarChart3,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  CreditCard,
  Download,
  Edit3,
  Eye,
  FileDown,
  FileUp,
  GripVertical,
  LayoutDashboard,
  Map,
  MapPin,
  Menu as MenuIcon,
  MoreHorizontal,
  PackagePlus,
  Pause,
  Plus,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  SlidersHorizontal,
  Store,
  Trash2,
  Truck,
  Upload,
  UserCircle,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  createDefaultAdminStore,
  readPublishedAdminStore,
  writePublishedAdminStore,
  type AdminStoreState,
  type ClosureState,
  type DeliverySettings,
  type OpeningHour,
  type ProductStatus,
  type StoreCategory,
  type StoreOptionGroup,
  type StoreProduct,
  type StorePromotion,
} from "@/lib/admin-store";
import { listBackOfficeCustomers } from "@/lib/api/customers.functions";
import type { BackOfficeCustomer } from "@/lib/supabase/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Back-office Edo-San Sushi" },
      {
        name: "description",
        content: "Interface de gestion Edo-San Sushi pour commandes, menu, livraison, promotions et statistiques.",
      },
    ],
  }),
  component: AdminPage,
});

type SectionId =
  | "dashboard"
  | "orders"
  | "menu"
  | "categories"
  | "options"
  | "delivery"
  | "promotions"
  | "clients"
  | "stats"
  | "hours"
  | "settings"
  | "users";

type OrderStatus = "Nouvelle" | "Acceptée" | "En préparation" | "Prête" | "En livraison" | "Terminée" | "Annulée";
type AdminProduct = StoreProduct;
type AdminCategory = StoreCategory;

type AdminOrder = {
  id: string;
  client: string;
  phone: string;
  email: string;
  address: string;
  distance: number;
  status: OrderStatus;
  channel: "Livraison" | "Retrait";
  total: number;
  payment: "Payé" | "À encaisser";
  createdAt: string;
  scheduledAt?: string;
  prepTime: number;
  notes: string;
  items: { name: string; qty: number; price: number }[];
  history: { status: OrderStatus; time: string }[];
};

type Client = BackOfficeCustomer;

const sections: { id: SectionId; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "orders", label: "Commandes", icon: ShoppingBag },
  { id: "menu", label: "Menu", icon: MenuIcon },
  { id: "categories", label: "Articles", icon: GripVertical },
  { id: "options", label: "Options & suppléments", icon: SlidersHorizontal },
  { id: "delivery", label: "Livraison", icon: Truck },
  { id: "promotions", label: "Promotions", icon: BadgePercent },
  { id: "clients", label: "Clients", icon: Users },
  { id: "stats", label: "Statistiques", icon: BarChart3 },
  { id: "hours", label: "Horaires & disponibilité", icon: CalendarClock },
  { id: "settings", label: "Paramètres", icon: Settings },
  { id: "users", label: "Utilisateurs", icon: Shield },
];

const orderStatuses: OrderStatus[] = [
  "Nouvelle",
  "Acceptée",
  "En préparation",
  "Prête",
  "En livraison",
  "Terminée",
  "Annulée",
];

const deliveryTabs = ["Tarifs", "Zones", "Carte", "Créneaux", "Performance livraison"];
const orderTabs = ["En cours", "Programmées", "Terminées", "Annulées", "Toutes"] as const;

const formatPrice = (value: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);

const toISODate = (date: Date) => date.toISOString().slice(0, 10);

function addDaysISO(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

const ordersSeed: AdminOrder[] = [
  {
    id: "CMD-1042",
    client: "Justine Martin",
    phone: "06 18 42 31 09",
    email: "justine.martin@email.com",
    address: "18 rue Marceau, Le Val",
    distance: 1.8,
    status: "Nouvelle",
    channel: "Livraison",
    total: 48.6,
    payment: "Payé",
    createdAt: "12:08",
    prepTime: 22,
    notes: "Sans gingembre, sauce soja sucrée en plus.",
    items: [
      { name: "California Saumon Cheese", qty: 2, price: 7.1 },
      { name: "Gyoza", qty: 1, price: 6.5 },
      { name: "Poke Saumon", qty: 1, price: 15.5 },
    ],
    history: [{ status: "Nouvelle", time: "12:08" }],
  },
  {
    id: "CMD-1041",
    client: "Hugo Perrin",
    phone: "06 77 10 88 41",
    email: "hugo.perrin@email.com",
    address: "Place de la mairie, Cotignac",
    distance: 7.4,
    status: "En préparation",
    channel: "Retrait",
    total: 72.4,
    payment: "À encaisser",
    createdAt: "11:54",
    prepTime: 18,
    notes: "Commande bureau, prévoir baguettes.",
    items: [
      { name: "Box Signature", qty: 1, price: 65 },
      { name: "Oasis", qty: 2, price: 2.5 },
    ],
    history: [
      { status: "Nouvelle", time: "11:54" },
      { status: "Acceptée", time: "11:56" },
      { status: "En préparation", time: "12:01" },
    ],
  },
  {
    id: "CMD-1040",
    client: "Nadia Rossi",
    phone: "06 44 23 90 11",
    email: "nadia.rossi@email.com",
    address: "Chemin des Prés, Le Val",
    distance: 3.2,
    status: "Prête",
    channel: "Livraison",
    total: 31.7,
    payment: "Payé",
    createdAt: "11:32",
    prepTime: 25,
    notes: "Appeler à l'arrivée.",
    items: [
      { name: "Maki Saumon Cheese", qty: 2, price: 5.8 },
      { name: "Soupe miso", qty: 2, price: 3 },
      { name: "Mochis Yuzu", qty: 1, price: 4.5 },
    ],
    history: [
      { status: "Nouvelle", time: "11:32" },
      { status: "Acceptée", time: "11:34" },
      { status: "En préparation", time: "11:39" },
      { status: "Prête", time: "11:58" },
    ],
  },
  {
    id: "CMD-1039",
    client: "Marc Vallon",
    phone: "06 02 50 77 65",
    email: "marc.vallon@email.com",
    address: "Rue des Aires, Montfort-sur-Argens",
    distance: 12.1,
    status: "Terminée",
    channel: "Livraison",
    total: 88.2,
    payment: "Payé",
    createdAt: "10:48",
    prepTime: 31,
    notes: "Livraison portail blanc.",
    items: [
      { name: "Torei California", qty: 2, price: 19.9 },
      { name: "Yakitori Poulet Caramel", qty: 2, price: 5.5 },
      { name: "Poke Mixte", qty: 1, price: 15.5 },
    ],
    history: [
      { status: "Nouvelle", time: "10:48" },
      { status: "Acceptée", time: "10:50" },
      { status: "Terminée", time: "11:41" },
    ],
  },
];

const clientsSeed: Client[] = [
  {
    id: "seed-justine",
    name: "Justine Martin",
    firstName: "Justine",
    lastName: "Martin",
    phone: "06 18 42 31 09",
    email: "justine.martin@email.com",
    orders: 18,
    spent: 742,
    average: 41.2,
    lastOrder: "Aujourd'hui",
    address: "18 rue Marceau, Le Val",
    status: "VIP",
    topProducts: ["California Saumon Cheese", "Gyoza", "Poke Saumon"],
  },
  {
    id: "seed-hugo",
    name: "Hugo Perrin",
    firstName: "Hugo",
    lastName: "Perrin",
    phone: "06 77 10 88 41",
    email: "hugo.perrin@email.com",
    orders: 9,
    spent: 438,
    average: 48.7,
    lastOrder: "Aujourd'hui",
    address: "Place de la mairie, Cotignac",
    status: "Régulier",
    topProducts: ["Box Signature", "Oasis"],
  },
  {
    id: "seed-nadia",
    name: "Nadia Rossi",
    firstName: "Nadia",
    lastName: "Rossi",
    phone: "06 44 23 90 11",
    email: "nadia.rossi@email.com",
    orders: 3,
    spent: 98,
    average: 32.6,
    lastOrder: "Hier",
    address: "Chemin des Prés, Le Val",
    status: "Nouveau",
    topProducts: ["Maki Saumon Cheese", "Soupe miso", "Mochis Yuzu"],
  },
  {
    id: "seed-marc",
    name: "Marc Vallon",
    firstName: "Marc",
    lastName: "Vallon",
    phone: "06 02 50 77 65",
    email: "marc.vallon@email.com",
    orders: 14,
    spent: 1094,
    average: 78.1,
    lastOrder: "Lundi",
    address: "Rue des Aires, Montfort-sur-Argens",
    status: "VIP",
    topProducts: ["Torei California", "Yakitori Poulet Caramel", "Poke Mixte"],
  },
];

const revenueData = [
  { label: "10h", ca: 180, commandes: 4 },
  { label: "11h", ca: 420, commandes: 11 },
  { label: "12h", ca: 960, commandes: 24 },
  { label: "13h", ca: 620, commandes: 15 },
  { label: "18h", ca: 520, commandes: 13 },
  { label: "19h", ca: 1180, commandes: 29 },
  { label: "20h", ca: 1340, commandes: 33 },
  { label: "21h", ca: 760, commandes: 18 },
];

const categoryRevenue = [
  { name: "Plateaux", value: 42 },
  { name: "California", value: 21 },
  { name: "Poke", value: 14 },
  { name: "Maki", value: 11 },
  { name: "Desserts", value: 6 },
  { name: "Boissons", value: 6 },
];

const pieColors = ["#d0112b", "#f4a23d", "#00cf51", "#f5f2eb", "#7b2530", "#4b5563"];

function AdminPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");
  const [orders, setOrders] = useState<AdminOrder[]>(ordersSeed);
  const [baseline, setBaseline] = useState<AdminStoreState>(() => createDefaultAdminStore());
  const [products, setProducts] = useState<AdminProduct[]>(() => baseline.products);
  const [categories, setCategories] = useState<AdminCategory[]>(() => baseline.categories);
  const [options, setOptions] = useState<StoreOptionGroup[]>(() => baseline.options);
  const [delivery, setDelivery] = useState<DeliverySettings>(() => baseline.delivery);
  const [promotions, setPromotions] = useState<StorePromotion[]>(() => baseline.promotions);
  const [hours, setHours] = useState<OpeningHour[]>(() => baseline.hours);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError, setClientsError] = useState<string | null>(null);
  const [orderView, setOrderView] = useState<"table" | "kanban">("table");
  const [orderTab, setOrderTab] = useState<(typeof orderTabs)[number]>("En cours");
  const [deliveryTab, setDeliveryTab] = useState(deliveryTabs[0]);
  const [paused, setPaused] = useState(() => baseline.paused);
  const [toast, setToast] = useState<string | null>(null);
  const [closure, setClosure] = useState<ClosureState | null>(() => baseline.closure);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const currentOrders = orders.filter((order) => !["Terminée", "Annulée"].includes(order.status));
  const todayRevenue = orders.reduce((sum, order) => sum + (order.status !== "Annulée" ? order.total : 0), 0);
  const averageBasket = todayRevenue / Math.max(1, orders.length);

  const topProducts = [...products].sort((a, b) => b.salesMonth - a.salesMonth).slice(0, 6);
  const currentDraft: AdminStoreState = {
    products,
    categories,
    options,
    delivery,
    promotions,
    hours,
    closure,
    paused,
    updatedAt: baseline.updatedAt,
  };
  const hasPendingChanges = JSON.stringify(currentDraft) !== JSON.stringify(baseline);

  const resetDraft = (next = baseline) => {
    setProducts(next.products);
    setCategories(next.categories);
    setOptions(next.options);
    setDelivery(next.delivery);
    setPromotions(next.promotions);
    setHours(next.hours);
    setClosure(next.closure);
    setPaused(next.paused);
  };

  useEffect(() => {
    const published = readPublishedAdminStore();
    setBaseline(published);
    resetDraft(published);
  }, []);

  useEffect(() => {
    setClientsLoading(true);
    setClientsError(null);
    listBackOfficeCustomers({ data: undefined })
      .then((rows) => {
        setClients(rows);
      })
      .catch((error) => {
        setClients([]);
        setClientsError(
          error instanceof Error
            ? error.message
            : "Impossible de charger les clients Supabase.",
        );
      })
      .finally(() => {
        setClientsLoading(false);
      });
  }, []);

  const confirmDraft = () => {
    const published = writePublishedAdminStore(currentDraft);
    setBaseline(published);
    resetDraft(published);
    setToast("Modifications confirmées et publiées sur le site client.");
  };

  const cancelDraft = () => {
    resetDraft();
    setToast("Modifications annulées.");
  };

  const createProduct = (categoryLabel?: string) => {
    const firstCategory = categories.find((category) => category.label === categoryLabel) ?? categories[0];
    setEditingProduct({
      id: `new-${Date.now()}`,
      name: "Nouveau produit",
      description: "Description client à renseigner",
      categoryLabel: firstCategory?.label ?? "Menu",
      internalRef: `NEW-${products.length + 1}`,
      price: 9.9,
      image: topProducts[0]?.image ?? "",
      pieces: 8,
      status: "Actif",
      salesMonth: 0,
      displayOrder: products.length + 1,
      vat: 10,
      ingredients: "Ingrédients à renseigner",
      badge: "Nouveau",
    });
  };

  const saveProduct = (product: AdminProduct) => {
    setProducts((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      return exists ? prev.map((item) => (item.id === product.id ? product : item)) : [product, ...prev];
    });
    setEditingProduct(null);
    setToast("Produit enregistré dans le prototype back-office.");
  };

  const duplicateProduct = (product: AdminProduct) => {
    const clone = {
      ...product,
      id: `${product.id}-copy-${Date.now()}`,
      name: `${product.name} copie`,
      internalRef: `${product.internalRef}-C`,
      displayOrder: products.length + 1,
    };
    setProducts((prev) => [clone, ...prev]);
    setToast("Produit dupliqué.");
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== productId));
    setToast("Produit supprimé du prototype.");
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              history: [...order.history, { status, time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) }],
            }
          : order,
      ),
    );
    setToast(`Commande ${orderId} passée en ${status.toLowerCase()}.`);
  };

  const setClosureAndStore = (next: ClosureState | null) => {
    setClosure(next);
    setToast(next ? "Fermeture prête à publier. Cliquez sur confirmer." : "Réouverture prête à publier. Cliquez sur confirmer.");
  };

  return (
    <div className="min-h-screen bg-ink text-cream">
      <AdminSidebar activeSection={activeSection} onSelect={setActiveSection} />
      <div className="min-h-screen md:pl-[280px]">
        <AdminTopbar
          activeSection={activeSection}
          paused={paused}
          onTogglePause={() => {
            setPaused((value) => !value);
            setToast(paused ? "Les commandes sont réactivées." : "Les commandes sont en pause.");
          }}
          onCreateProduct={createProduct}
          onShowOrders={() => setActiveSection("orders")}
          currentOrders={currentOrders.length}
        />

        <MobileSectionNav activeSection={activeSection} onSelect={setActiveSection} />

        <main className="px-4 pb-16 pt-5 md:px-6 xl:px-8">
          {activeSection === "dashboard" && (
            <DashboardPage
              orders={currentOrders}
              topProducts={topProducts}
              todayRevenue={todayRevenue}
              averageBasket={averageBasket}
              onOpenOrder={setSelectedOrder}
              onGoOrders={() => setActiveSection("orders")}
              paused={paused}
              closure={closure}
            />
          )}
          {activeSection === "orders" && (
            <OrdersPage
              orders={orders}
              tab={orderTab}
              view={orderView}
              onTabChange={setOrderTab}
              onViewChange={setOrderView}
              onOpenOrder={setSelectedOrder}
              onStatusChange={updateOrderStatus}
            />
          )}
          {activeSection === "menu" && (
            <MenuPage
              products={products}
              categories={categories}
              onEdit={setEditingProduct}
              onDuplicate={duplicateProduct}
              onDelete={deleteProduct}
              onCreate={createProduct}
              onToast={setToast}
            />
          )}
          {activeSection === "categories" && (
            <CategoriesPage
              categories={categories}
              products={products}
              setCategories={setCategories}
              onEditProduct={setEditingProduct}
              onCreateProduct={createProduct}
              onDeleteProduct={deleteProduct}
              onToast={setToast}
            />
          )}
          {activeSection === "options" && <OptionsPage groups={options} onChange={setOptions} onToast={setToast} />}
          {activeSection === "delivery" && (
            <DeliveryPage activeTab={deliveryTab} onTabChange={setDeliveryTab} delivery={delivery} onChange={setDelivery} />
          )}
          {activeSection === "promotions" && (
            <PromotionsPage
              products={products}
              categories={categories}
              promotions={promotions}
              onChange={setPromotions}
              onToast={setToast}
            />
          )}
          {activeSection === "clients" && (
            <ClientsPage
              clients={clients}
              loading={clientsLoading}
              error={clientsError}
              onOpenClient={setSelectedClient}
            />
          )}
          {activeSection === "stats" && <StatsPage />}
          {activeSection === "hours" && (
            <HoursPage closure={closure} onChangeClosure={setClosureAndStore} hours={hours} onChangeHours={setHours} />
          )}
          {activeSection === "settings" && <SettingsPage />}
          {activeSection === "users" && <UsersPage />}
        </main>
      </div>

      <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusChange={updateOrderStatus} />
      <ProductDrawer
        product={editingProduct}
        categories={categories}
        onClose={() => setEditingProduct(null)}
        onSave={saveProduct}
      />
      <ClientDrawer client={selectedClient} onClose={() => setSelectedClient(null)} />
      <PublishBar visible={hasPendingChanges} onCancel={cancelDraft} onConfirm={confirmDraft} />
      <Toast message={toast} />
    </div>
  );
}

function AdminSidebar({
  activeSection,
  onSelect,
}: {
  activeSection: SectionId;
  onSelect: (section: SectionId) => void;
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] border-r border-cream/10 bg-ink-elevated md:flex md:flex-col">
      <div className="border-b border-cream/10 px-6 py-5">
        <a href="/" className="flex items-center gap-3">
          <img src="/edo-assets/01-Logo-Edo-San-Sushi-blanc.png" alt="" className="h-10 w-10 object-contain" />
          <div>
            <p className="font-display text-xl leading-none text-cream">Edo-San</p>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Back-office</p>
          </div>
        </a>
      </div>
      <nav className="no-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {sections.map((section) => {
          const Icon = section.icon;
          const active = activeSection === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelect(section.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition",
                active
                  ? "bg-crimson text-crimson-foreground crimson-glow"
                  : "text-muted-foreground hover:bg-cream/5 hover:text-cream",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{section.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="border-t border-cream/10 p-4">
        <a
          href="/"
          className="flex w-full items-center justify-between rounded-xl border border-cream/15 bg-ink px-3 py-2.5 text-sm text-cream transition hover:border-crimson"
        >
          Voir le site client
          <ChevronRight className="h-4 w-4 text-crimson" />
        </a>
      </div>
    </aside>
  );
}

function AdminTopbar({
  activeSection,
  paused,
  currentOrders,
  onTogglePause,
  onCreateProduct,
  onShowOrders,
}: {
  activeSection: SectionId;
  paused: boolean;
  currentOrders: number;
  onTogglePause: () => void;
  onCreateProduct: (categoryLabel?: string) => void;
  onShowOrders: () => void;
}) {
  const sectionLabel = sections.find((section) => section.id === activeSection)?.label ?? "Back-office";
  return (
    <header className="sticky top-0 z-20 border-b border-cream/10 bg-ink/95 backdrop-blur">
      <div className="flex min-h-[76px] flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6 xl:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Edo-San Sushi</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl leading-none text-cream md:text-3xl">{sectionLabel}</h1>
            <StatusBadge tone={paused ? "warning" : "success"}>{paused ? "Commandes en pause" : "Boutique ouverte"}</StatusBadge>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <AdminButton tone={paused ? "success" : "secondary"} icon={Pause} onClick={onTogglePause}>
            {paused ? "Relancer" : "Mettre en pause"}
          </AdminButton>
          <AdminButton tone="primary" icon={PackagePlus} onClick={onCreateProduct}>
            Ajouter un produit
          </AdminButton>
          <AdminButton tone="secondary" icon={ShoppingBag} onClick={onShowOrders}>
            Voir commandes en cours
          </AdminButton>
          <button className="relative grid h-10 w-10 place-items-center rounded-full border border-cream/15 bg-ink text-cream transition hover:border-crimson">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-crimson" />
          </button>
          <button className="flex h-10 items-center gap-2 rounded-full border border-cream/15 bg-ink pl-2 pr-3 text-sm text-cream">
            <UserCircle className="h-5 w-5 text-crimson" />
            Manager
          </button>
        </div>
      </div>
    </header>
  );
}

function MobileSectionNav({
  activeSection,
  onSelect,
}: {
  activeSection: SectionId;
  onSelect: (section: SectionId) => void;
}) {
  return (
    <div className="border-b border-cream/10 bg-ink-elevated px-4 py-3 md:hidden">
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-2 text-xs font-semibold",
              activeSection === section.id
                ? "border-crimson bg-crimson text-crimson-foreground"
                : "border-cream/15 text-muted-foreground",
            )}
          >
            {section.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DashboardPage({
  orders,
  topProducts,
  todayRevenue,
  averageBasket,
  paused,
  closure,
  onOpenOrder,
  onGoOrders,
}: {
  orders: AdminOrder[];
  topProducts: AdminProduct[];
  todayRevenue: number;
  averageBasket: number;
  paused: boolean;
  closure: ClosureState | null;
  onOpenOrder: (order: AdminOrder) => void;
  onGoOrders: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Chiffre d'affaires du jour" value={formatPrice(todayRevenue)} helper="+12% vs mardi dernier" icon={CreditCard} />
        <KpiCard label="Commandes" value="42" helper={`${orders.length} en cours`} icon={ShoppingBag} />
        <KpiCard label="Panier moyen" value={formatPrice(averageBasket)} helper="Objectif 44 €" icon={AreaChart} />
        <KpiCard label="Livraisons" value="24" helper="57% des commandes" icon={Truck} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <Panel
          title="Commandes en cours"
          action={
            <button type="button" onClick={onGoOrders} className="text-sm font-semibold text-crimson">
              Tout ouvrir
            </button>
          }
        >
          <div className="space-y-3">
            {orders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => onOpenOrder(order)}
                className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-cream/10 bg-ink p-4 text-left transition hover:border-crimson"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-cream">{order.id}</p>
                    <StatusBadge tone={statusTone(order.status)}>{order.status}</StatusBadge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {order.client} · {order.channel} · {order.distance} km
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl text-cream">{formatPrice(order.total)}</p>
                  <p className="text-xs text-muted-foreground">{order.prepTime} min estimées</p>
                </div>
              </button>
            ))}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Top ventes du jour">
            <div className="space-y-3">
              {topProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-crimson/15 font-display text-sm text-crimson">
                    {index + 1}
                  </span>
                  <img src={product.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-cream">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.salesMonth} ventes ce mois</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Alertes intelligentes">
            <div className="space-y-3">
              <AlertCard tone="warning" title="Pic attendu à 20h" text="Prévoir 2 personnes en cuisine entre 19h30 et 20h45." />
              <AlertCard tone="danger" title="Stock saumon bas" text="Les produits saumon représentent 31% des ventes du soir." />
              {paused && <AlertCard tone="warning" title="Commandes en pause" text="La boutique n'accepte plus de nouvelles commandes." />}
              {closure && <AlertCard tone="danger" title="Fermeture exceptionnelle active" text={`Du ${closure.start} au ${closure.end}.`} />}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function OrdersPage({
  orders,
  tab,
  view,
  onTabChange,
  onViewChange,
  onOpenOrder,
  onStatusChange,
}: {
  orders: AdminOrder[];
  tab: (typeof orderTabs)[number];
  view: "table" | "kanban";
  onTabChange: (tab: (typeof orderTabs)[number]) => void;
  onViewChange: (view: "table" | "kanban") => void;
  onOpenOrder: (order: AdminOrder) => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}) {
  const filtered = orders.filter((order) => {
    if (tab === "Toutes") return true;
    if (tab === "En cours") return !["Terminée", "Annulée"].includes(order.status);
    if (tab === "Terminées") return order.status === "Terminée";
    if (tab === "Annulées") return order.status === "Annulée";
    return !!order.scheduledAt;
  });

  return (
    <div className="space-y-5">
      <Toolbar
        title="Pilotage des commandes"
        description="Vue service pour accepter, préparer, livrer et clôturer vite."
        right={
          <div className="flex rounded-full border border-cream/10 bg-ink p-1">
            {(["table", "kanban"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onViewChange(mode)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide",
                  view === mode ? "bg-crimson text-crimson-foreground" : "text-muted-foreground",
                )}
              >
                {mode === "table" ? "Tableau" : "Kanban"}
              </button>
            ))}
          </div>
        }
      />
      <Tabs tabs={orderTabs} active={tab} onChange={onTabChange} />
      {view === "table" ? (
        <Panel>
          <ResponsiveTable>
            <thead>
              <tr>
                <Th>Commande</Th>
                <Th>Client</Th>
                <Th>Statut</Th>
                <Th>Canal</Th>
                <Th>Distance</Th>
                <Th>Total</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-t border-cream/10">
                  <Td>
                    <button type="button" onClick={() => onOpenOrder(order)} className="font-semibold text-cream hover:text-crimson">
                      {order.id}
                    </button>
                    <p className="text-xs text-muted-foreground">{order.createdAt}</p>
                  </Td>
                  <Td>{order.client}</Td>
                  <Td>
                    <StatusBadge tone={statusTone(order.status)}>{order.status}</StatusBadge>
                  </Td>
                  <Td>{order.channel}</Td>
                  <Td>{order.distance} km</Td>
                  <Td>{formatPrice(order.total)}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-2">
                      {nextStatuses(order.status).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => onStatusChange(order.id, status)}
                          className="rounded-full border border-cream/15 px-2.5 py-1 text-xs text-cream transition hover:border-crimson"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </ResponsiveTable>
        </Panel>
      ) : (
        <div className="grid gap-4 xl:grid-cols-4">
          {orderStatuses
            .filter((status) => !["Terminée", "Annulée"].includes(status))
            .map((status) => (
              <Panel key={status} title={status}>
                <div className="space-y-3">
                  {filtered
                    .filter((order) => order.status === status)
                    .map((order) => (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => onOpenOrder(order)}
                        className="block w-full rounded-2xl border border-cream/10 bg-ink p-3 text-left transition hover:border-crimson"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-cream">{order.id}</p>
                          <p className="font-display text-lg text-cream">{formatPrice(order.total)}</p>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{order.client}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {order.channel} · {order.prepTime} min
                        </p>
                      </button>
                    ))}
                </div>
              </Panel>
            ))}
        </div>
      )}
    </div>
  );
}

function MenuPage({
  products,
  categories,
  onEdit,
  onDuplicate,
  onDelete,
  onCreate,
  onToast,
}: {
  products: AdminProduct[];
  categories: AdminCategory[];
  onEdit: (product: AdminProduct) => void;
  onDuplicate: (product: AdminProduct) => void;
  onDelete: (productId: string) => void;
  onCreate: () => void;
  onToast: (message: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Toutes");
  const [status, setStatus] = useState("Tous");
  const [sort, setSort] = useState("Ordre d'affichage");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [query, category, status, sort]);

  const filtered = products
    .filter((product) => {
      const matchesQuery = `${product.name} ${product.categoryLabel}`.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "Toutes" || product.categoryLabel === category;
      const matchesStatus = status === "Tous" || product.status === status;
      return matchesQuery && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sort === "Ventes du mois") return b.salesMonth - a.salesMonth;
      if (sort === "Prix croissant") return a.price - b.price;
      if (sort === "Prix décroissant") return b.price - a.price;
      if (sort === "Statut") return a.status.localeCompare(b.status);
      return a.displayOrder - b.displayOrder;
    });
  const paged = filtered.slice((page - 1) * 12, page * 12);
  const pageCount = Math.max(1, Math.ceil(filtered.length / 12));

  return (
    <div className="space-y-5">
      <Toolbar
        title="Menu"
        description="Préparation de carte, prix, photos, statuts et ordre d'affichage."
        right={
          <div className="flex flex-wrap gap-2">
            <AdminButton tone="secondary" icon={FileUp} onClick={() => onToast("Import CSV simulé.")}>Import CSV</AdminButton>
            <AdminButton tone="secondary" icon={FileDown} onClick={() => onToast("Export CSV simulé.")}>Export CSV</AdminButton>
            <AdminButton tone="primary" icon={Plus} onClick={onCreate}>Produit</AdminButton>
          </div>
        }
      />
      <Panel>
        <div className="grid gap-3 lg:grid-cols-[1fr_210px_170px_190px_auto]">
          <SearchField value={query} onChange={setQuery} placeholder="Rechercher un produit, une référence..." />
          <SelectLike value={category} onChange={setCategory} options={["Toutes", ...categories.map((item) => item.label)]} />
          <SelectLike value={status} onChange={setStatus} options={["Tous", "Actif", "Masqué", "Indisponible"]} />
          <SelectLike value={sort} onChange={setSort} options={["Ordre d'affichage", "Ventes du mois", "Prix croissant", "Prix décroissant", "Statut"]} />
          <AdminButton tone="secondary" icon={SlidersHorizontal} onClick={() => onToast("Actions en masse prêtes pour Supabase.")}>
            Actions en masse
          </AdminButton>
        </div>
      </Panel>
      <Panel>
        <ResponsiveTable>
          <thead>
            <tr>
              <Th>Photo</Th>
              <Th>Nom</Th>
              <Th>Catégorie</Th>
              <Th>Prix</Th>
              <Th>Statut</Th>
              <Th>Ventes mois</Th>
              <Th>Ordre</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {paged.map((product) => (
              <tr key={product.id} className="border-t border-cream/10">
                <Td>
                  <img src={product.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
                </Td>
                <Td>
                  <p className="font-semibold text-cream">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.internalRef}</p>
                </Td>
                <Td>{product.categoryLabel}</Td>
                <Td>{formatPrice(product.price)}</Td>
                <Td>
                  <StatusBadge tone={product.status === "Actif" ? "success" : product.status === "Masqué" ? "neutral" : "danger"}>
                    {product.status}
                  </StatusBadge>
                </Td>
                <Td>{product.salesMonth}</Td>
                <Td>{product.displayOrder}</Td>
                <Td>
                  <div className="flex gap-1">
                    <IconButton label="Modifier" icon={Edit3} onClick={() => onEdit(product)} />
                    <IconButton label="Dupliquer" icon={Copy} onClick={() => onDuplicate(product)} />
                    <IconButton label="Masquer" icon={Eye} onClick={() => onToast("Changement de visibilité simulé.")} />
                    <IconButton label="Supprimer" icon={Trash2} danger onClick={() => onDelete(product.id)} />
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </ResponsiveTable>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-cream/10 pt-4 text-sm text-muted-foreground">
          <span>
            {filtered.length} produit{filtered.length > 1 ? "s" : ""} · page {page}/{pageCount}
          </span>
          <div className="flex gap-2">
            <button className="rounded-full border border-cream/15 px-3 py-1.5 disabled:opacity-40" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Précédent
            </button>
            <button className="rounded-full border border-cream/15 px-3 py-1.5 disabled:opacity-40" disabled={page === pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>
              Suivant
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function CategoriesPage({
  categories,
  products,
  setCategories,
  onEditProduct,
  onCreateProduct,
  onDeleteProduct,
  onToast,
}: {
  categories: AdminCategory[];
  products: AdminProduct[];
  setCategories: (categories: AdminCategory[]) => void;
  onEditProduct: (product: AdminProduct) => void;
  onCreateProduct: (categoryLabel?: string) => void;
  onDeleteProduct: (productId: string) => void;
  onToast: (message: string) => void;
}) {
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(() => [categories[0]?.id ?? ""]);
  const orderedCategories = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    );
  };

  const moveCategory = (categoryId: string, direction: -1 | 1) => {
    const from = orderedCategories.findIndex((category) => category.id === categoryId);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= orderedCategories.length) return;
    const next = [...orderedCategories];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setCategories(next.map((category, index) => ({ ...category, displayOrder: index + 1 })));
    onToast("Nouvel ordre prêt à publier.");
  };

  const saveCategory = (category: AdminCategory) => {
    const next = [...categories];
    const index = next.findIndex((item) => item.id === category.id);
    if (index >= 0) next[index] = category;
    else next.push(category);
    setCategories(next.map((item, itemIndex) => ({ ...item, displayOrder: item.displayOrder || itemIndex + 1 })));
    setExpandedCategories((prev) => (prev.includes(category.id) ? prev : [...prev, category.id]));
    setEditingCategory(null);
    onToast("Catégorie prête à publier.");
  };

  const createCategory = () => {
    setEditingCategory({
      id: `cat-${Date.now()}`,
      label: "Nouvelle catégorie",
      description: "Description de la catégorie",
      status: "Visible",
      displayOrder: categories.length + 1,
      schedule: "Toute la journée",
      visibility: "Livraison + retrait",
    });
  };

  const deleteCategory = (categoryId: string) => {
    setCategories(categories.filter((item) => item.id !== categoryId).map((item, index) => ({ ...item, displayOrder: index + 1 })));
    setExpandedCategories((prev) => prev.filter((id) => id !== categoryId));
    onToast("Catégorie supprimée du brouillon.");
  };

  return (
    <div className="space-y-5">
      <Toolbar
        title="Articles"
        description="Catégories, ordre d'affichage et produits publiés sur le site client après confirmation."
        right={
          <div className="flex flex-wrap gap-2">
            <AdminButton tone="secondary" icon={Plus} onClick={createCategory}>Catégorie</AdminButton>
            <AdminButton tone="primary" icon={Plus} onClick={() => onCreateProduct()}>Article</AdminButton>
          </div>
        }
      />
      <div>
        <Panel title="Catégories d'articles">
          <div className="space-y-3">
            {orderedCategories.map((category, index) => {
              const categoryProducts = products
                .filter((product) => product.categoryLabel === category.label)
                .sort((a, b) => a.displayOrder - b.displayOrder);
              const expanded = expandedCategories.includes(category.id);
              return (
              <div
                key={category.id}
                className={cn(
                  "overflow-hidden rounded-3xl border bg-ink p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-crimson",
                  expanded ? "border-crimson shadow-[0_12px_36px_-22px_#d0112b]" : "border-cream/10",
                )}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="font-semibold text-cream">{category.label}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{category.description}</p>
                  </button>
                  <div className="flex gap-1">
                    <IconButton label="Monter" icon={ChevronUp} onClick={() => moveCategory(category.id, -1)} />
                    <IconButton label="Descendre" icon={ChevronDown} onClick={() => moveCategory(category.id, 1)} />
                    <IconButton label="Modifier" icon={Edit3} onClick={() => setEditingCategory(category)} />
                    <IconButton label="Supprimer" icon={Trash2} danger onClick={() => deleteCategory(category.id)} />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge tone={category.status === "Visible" ? "success" : "neutral"}>{category.status}</StatusBadge>
                  <StatusBadge tone="neutral">Ordre {index + 1}</StatusBadge>
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className="inline-flex items-center gap-1 rounded-full bg-cream/10 px-2.5 py-1 text-xs font-semibold text-muted-foreground transition hover:text-cream"
                  >
                    {categoryProducts.length} articles
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
                  </button>
                </div>
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-cream/10 pt-4 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
                      {categoryProducts.map((product) => (
                        <AdminProductCard
                          key={product.id}
                          product={product}
                          onEdit={() => onEditProduct(product)}
                          onDelete={() => onDeleteProduct(product.id)}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => onCreateProduct(category.label)}
                        className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-crimson/60 bg-crimson/5 text-crimson transition hover:-translate-y-1 hover:bg-crimson/10"
                        aria-label={`Ajouter un article dans ${category.label}`}
                      >
                        <span className="grid h-14 w-14 place-items-center rounded-full bg-crimson text-crimson-foreground crimson-glow">
                          <Plus className="h-7 w-7" />
                        </span>
                      </button>
                    </div>
                    {categoryProducts.length === 0 && (
                      <p className="mt-4 rounded-2xl border border-cream/10 bg-ink-elevated p-4 text-sm text-muted-foreground">
                        Aucun article dans cette catégorie.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </Panel>
      </div>
      <CategoryDrawer category={editingCategory} onClose={() => setEditingCategory(null)} onSave={saveCategory} />
    </div>
  );
}

function AdminProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: AdminProduct;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="group relative flex min-h-[260px] flex-col overflow-hidden rounded-2xl border border-cream/10 bg-ink-elevated transition duration-300 hover:-translate-y-1 hover:border-crimson">
      <div className="relative aspect-[5/4] overflow-hidden bg-black/40">
        <img src={product.image} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
        <div className="absolute right-2 top-2 flex gap-1">
          <IconButton label="Modifier" icon={Edit3} onClick={onEdit} />
          <IconButton label="Supprimer" icon={Trash2} danger onClick={onDelete} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base leading-tight text-cream">{product.name}</h3>
            {product.pieces ? (
              <span className="shrink-0 rounded-full border border-cream/20 bg-cream/5 px-2 py-0.5 text-[11px] font-medium text-cream/90">
                x{product.pieces}
              </span>
            ) : null}
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{product.ingredients || product.description}</p>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <span className="font-display text-xl text-cream">{formatPrice(product.price)}</span>
          <StatusBadge tone={product.status === "Actif" ? "success" : product.status === "Masqué" ? "neutral" : "danger"}>
            {product.status}
          </StatusBadge>
        </div>
      </div>
    </article>
  );
}

function OptionsPage({
  groups,
  onChange,
  onToast,
}: {
  groups: StoreOptionGroup[];
  onChange: (groups: StoreOptionGroup[]) => void;
  onToast: (message: string) => void;
}) {
  const updateGroup = (groupId: string, patch: Partial<StoreOptionGroup>) => {
    onChange(groups.map((group) => (group.id === groupId ? { ...group, ...patch } : group)));
  };

  const addGroup = () => {
    onChange([
      ...groups,
      { id: `option-${Date.now()}`, name: "Nouveau groupe", type: "Choix multiple", required: false, min: 0, max: 1, items: ["Nouvelle option"] },
    ]);
    onToast("Groupe ajouté au brouillon.");
  };

  const deleteGroup = (groupId: string) => {
    onChange(groups.filter((group) => group.id !== groupId));
    onToast("Groupe supprimé du brouillon.");
  };

  const addItem = (group: StoreOptionGroup) => updateGroup(group.id, { items: [...group.items, "Nouvelle option"] });
  const updateItem = (group: StoreOptionGroup, index: number, value: string) =>
    updateGroup(group.id, { items: group.items.map((item, itemIndex) => (itemIndex === index ? value : item)) });
  const deleteItem = (group: StoreOptionGroup, index: number) =>
    updateGroup(group.id, { items: group.items.filter((_, itemIndex) => itemIndex !== index) });

  return (
    <div className="space-y-5">
      <Toolbar title="Options & suppléments" description="Groupes réutilisables pour sauces, accompagnements, suppléments, boissons et desserts inclus." right={<AdminButton tone="primary" icon={Plus} onClick={addGroup}>Créer un groupe</AdminButton>} />
      <div className="grid gap-4 xl:grid-cols-2">
        {groups.map((group) => (
          <Panel key={group.id} title={group.name} action={<IconButton label="Supprimer le groupe" icon={Trash2} danger onClick={() => deleteGroup(group.id)} />}>
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Nom du groupe" value={group.name} onChange={(value) => updateGroup(group.id, { name: value })} />
                <SelectField label="Type" value={group.type} options={["Choix unique", "Choix multiple"]} onChange={(value) => updateGroup(group.id, { type: value as StoreOptionGroup["type"] })} />
                <NumberField label="Minimum sélectionnable" value={group.min} onChange={(value) => updateGroup(group.id, { min: value })} />
                <NumberField label="Maximum sélectionnable" value={group.max} onChange={(value) => updateGroup(group.id, { max: value })} />
              </div>
              <label className="flex items-center gap-2 text-sm text-cream">
                <input type="checkbox" checked={group.required} onChange={(event) => updateGroup(group.id, { required: event.target.checked })} />
                Groupe obligatoire
              </label>
              <div className="space-y-2">
                {group.items.map((item, index) => (
                  <div key={`${group.id}-${index}`} className="flex gap-2">
                    <input className="admin-input" value={item} onChange={(event) => updateItem(group, index, event.target.value)} />
                    <IconButton label="Supprimer" icon={Trash2} danger onClick={() => deleteItem(group, index)} />
                  </div>
                ))}
                <AdminButton tone="secondary" icon={Plus} onClick={() => addItem(group)}>Ajouter une option</AdminButton>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function DeliveryPage({
  activeTab,
  onTabChange,
  delivery,
  onChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  delivery: DeliverySettings;
  onChange: (delivery: DeliverySettings) => void;
}) {
  const update = (patch: Partial<DeliverySettings>) => onChange({ ...delivery, ...patch });
  const updateTier = (tierId: string, patch: Partial<(typeof delivery.tiers)[number]>) =>
    update({ tiers: delivery.tiers.map((tier) => (tier.id === tierId ? { ...tier, ...patch } : tier)) });
  const addTier = () => update({ tiers: [...delivery.tiers, { id: `tier-${Date.now()}`, range: "Nouvelle tranche", price: 0 }] });
  const deleteTier = (tierId: string) => update({ tiers: delivery.tiers.filter((tier) => tier.id !== tierId) });

  return (
    <div className="space-y-5">
      <Toolbar title="Livraison" description="Tarifs par distance, zones, créneaux et performance terrain." />
      <Tabs tabs={deliveryTabs} active={activeTab} onChange={onTabChange} />
      {activeTab === "Tarifs" && (
        <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <Panel title="Règles tarifaires">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Mode tarifaire" value={delivery.mode} onChange={(value) => update({ mode: value })} />
              <NumberField label="Prix fixe minimum" value={delivery.fixedMinimum} onChange={(value) => update({ fixedMinimum: value })} />
              <NumberField label="Prix par kilomètre" value={delivery.pricePerKm} onChange={(value) => update({ pricePerKm: value })} />
              <NumberField label="Distance maximale" value={delivery.maxDistance} onChange={(value) => update({ maxDistance: value })} />
              <NumberField label="Frais maximum" value={delivery.maxFee} onChange={(value) => update({ maxFee: value })} />
              <NumberField label="Minimum de commande" value={delivery.minOrder} onChange={(value) => update({ minOrder: value })} />
              <NumberField label="Livraison offerte à partir de" value={delivery.freeFrom} onChange={(value) => update({ freeFrom: value })} />
              <NumberField label="Majoration rush/météo %" value={delivery.rushMarkup} onChange={(value) => update({ rushMarkup: value })} />
            </div>
          </Panel>
          <Panel title="Tranches" action={<AdminButton tone="secondary" icon={Plus} onClick={addTier}>Tranche</AdminButton>}>
            <div className="space-y-3">
              {delivery.tiers.map((tier) => (
                <div key={tier.id} className="grid gap-2 rounded-2xl border border-cream/10 bg-ink p-3 sm:grid-cols-[1fr_120px_auto]">
                  <input className="admin-input" value={tier.range} onChange={(event) => updateTier(tier.id, { range: event.target.value })} />
                  <input className="admin-input" type="number" step="0.1" value={tier.price} onChange={(event) => updateTier(tier.id, { price: Number(event.target.value) })} />
                  <IconButton label="Supprimer" icon={Trash2} danger onClick={() => deleteTier(tier.id)} />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}
      {activeTab === "Zones" && (
        <Panel title="Zones de livraison">
          <div className="grid gap-3 md:grid-cols-3">
            {["Le Val", "Cotignac", "Montfort-sur-Argens", "Carcès", "Brignoles", "Correns"].map((zone, index) => (
              <div key={zone} className="rounded-2xl border border-cream/10 bg-ink p-4">
                <p className="font-semibold text-cream">{zone}</p>
                <p className="mt-1 text-sm text-muted-foreground">{2 + index * 1.8} km · {formatPrice(3.5 + index)}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}
      {activeTab === "Carte" && (
        <Panel title="Carte">
          <div className="grid min-h-[360px] place-items-center rounded-3xl border border-dashed border-cream/15 bg-ink text-center">
            <div>
              <Map className="mx-auto h-10 w-10 text-crimson" />
              <p className="mt-3 font-display text-2xl text-cream">Carte de zones</p>
              <p className="mt-1 text-sm text-muted-foreground">Elle sera connectée à Mapbox ou Google Maps plus tard.</p>
            </div>
          </div>
        </Panel>
      )}
      {activeTab === "Créneaux" && (
        <Panel title="Créneaux de livraison">
          <div className="grid gap-3 md:grid-cols-4">
            {["11:30", "12:00", "12:30", "19:00", "19:30", "20:00", "20:30", "21:00"].map((slot, index) => (
              <div key={slot} className="rounded-2xl border border-cream/10 bg-ink p-4">
                <p className="font-display text-2xl text-cream">{slot}</p>
                <p className="text-sm text-muted-foreground">{3 + (index % 3)} commandes max</p>
              </div>
            ))}
          </div>
        </Panel>
      )}
      {activeTab === "Performance livraison" && (
        <Panel title="Performance livraison">
          <ChartBox>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={revenueData}>
                <CartesianGrid stroke="rgba(245,242,235,.08)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(245,242,235,.55)" />
                <YAxis stroke="rgba(245,242,235,.55)" />
                <Tooltip contentStyle={{ background: "#1f1f1f", border: "1px solid rgba(245,242,235,.14)", color: "#f5f2eb" }} />
                <Bar dataKey="commandes" fill="#d0112b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>
      )}
    </div>
  );
}

function PromotionsPage({
  products,
  categories,
  promotions,
  onChange,
  onToast,
}: {
  products: AdminProduct[];
  categories: AdminCategory[];
  promotions: StorePromotion[];
  onChange: (promotions: StorePromotion[]) => void;
  onToast: (message: string) => void;
}) {
  const [editing, setEditing] = useState<StorePromotion | null>(null);

  const createPromotion = () => {
    setEditing({
      id: `promo-${Date.now()}`,
      title: "Nouvelle promotion",
      subtitle: "Offre temporaire Edo-San",
      start: toISODate(new Date()),
      end: addDaysISO(7),
      discountPercent: 15,
      productIds: [],
    });
  };

  const savePromotion = (promotion: StorePromotion) => {
    if (promotion.start > promotion.end) {
      onToast("La date de fin doit être après la date de début.");
      return;
    }
    const exists = promotions.some((item) => item.id === promotion.id);
    onChange(exists ? promotions.map((item) => (item.id === promotion.id ? promotion : item)) : [promotion, ...promotions]);
    setEditing(null);
    onToast("Promotion prête à publier. Cliquez sur confirmer.");
  };

  const deletePromotion = (promotionId: string) => {
    onChange(promotions.filter((promotion) => promotion.id !== promotionId));
    onToast("Promotion supprimée du brouillon.");
  };

  return (
    <div className="space-y-5">
      <Toolbar
        title="Promotions"
        description="Codes promo, happy hour, produit offert, livraison offerte et offres par catégorie."
        right={<AdminButton tone="primary" icon={Plus} onClick={createPromotion}>Créer une promotion</AdminButton>}
      />
      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Panel title="Promotions configurées">
          <div className="space-y-3">
            {promotions.map((promo) => (
              <div key={promo.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cream/10 bg-ink p-4">
                <div>
                  <p className="font-semibold text-cream">{promo.title}</p>
                  <p className="text-sm text-muted-foreground">
                    -{promo.discountPercent}% · {promo.start} au {promo.end} · {promo.productIds.length} articles
                  </p>
                </div>
                <div className="flex gap-1">
                  <IconButton label="Modifier" icon={Edit3} onClick={() => setEditing(promo)} />
                  <IconButton label="Supprimer" icon={Trash2} danger onClick={() => deletePromotion(promo.id)} />
                </div>
              </div>
            ))}
            {promotions.length === 0 && <p className="rounded-2xl border border-cream/10 bg-ink p-4 text-sm text-muted-foreground">Aucune promotion configurée.</p>}
          </div>
        </Panel>
        <Panel title="Publication côté client">
          <div className="rounded-3xl border border-crimson/50 bg-crimson/10 p-5">
            <p className="font-display text-3xl text-cream">Promotion</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Les promotions confirmées apparaissent automatiquement dans une catégorie Promotion avant Menus du midi,
              uniquement entre leur date de début et de fin.
            </p>
          </div>
        </Panel>
      </div>
      <PromotionDrawer
        promotion={editing}
        products={products}
        categories={categories}
        onClose={() => setEditing(null)}
        onSave={savePromotion}
      />
    </div>
  );
}

function ClientsPage({
  clients,
  loading,
  error,
  onOpenClient,
}: {
  clients: Client[];
  loading: boolean;
  error: string | null;
  onOpenClient: (client: Client) => void;
}) {
  return (
    <div className="space-y-5">
      <Toolbar title="Clients" description="Historique, adresses, notes internes, statut et valeur client." />
      {error && (
        <div className="rounded-2xl border border-[#f4a23d]/35 bg-[#f4a23d]/10 px-4 py-3 text-sm leading-relaxed text-[#f4a23d]/80">
          La base clients Supabase ne répond pas encore : {error}
        </div>
      )}
      <Panel>
        <ResponsiveTable>
          <thead>
            <tr>
              <Th>Nom</Th>
              <Th>Téléphone</Th>
              <Th>Email</Th>
              <Th>Commandes</Th>
              <Th>Total dépensé</Th>
              <Th>Panier moyen</Th>
              <Th>Dernière commande</Th>
              <Th>Adresse</Th>
              <Th>Statut</Th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr className="border-t border-cream/10">
                <Td>Chargement des clients Supabase...</Td>
                <Td> </Td>
                <Td> </Td>
                <Td> </Td>
                <Td> </Td>
                <Td> </Td>
                <Td> </Td>
                <Td> </Td>
                <Td> </Td>
              </tr>
            )}
            {clients.map((client) => (
              <tr key={client.id} className="border-t border-cream/10">
                <Td>
                  <button className="font-semibold text-cream hover:text-crimson" onClick={() => onOpenClient(client)}>{client.name}</button>
                </Td>
                <Td>{client.phone}</Td>
                <Td>{client.email}</Td>
                <Td>{client.orders}</Td>
                <Td>{formatPrice(client.spent)}</Td>
                <Td>{formatPrice(client.average)}</Td>
                <Td>{client.lastOrder}</Td>
                <Td>{client.address}</Td>
                <Td>
                  <StatusBadge tone={client.status === "VIP" ? "success" : "neutral"}>{client.status}</StatusBadge>
                </Td>
              </tr>
            ))}
            {!loading && !error && clients.length === 0 && (
              <tr className="border-t border-cream/10">
                <Td>Aucun client enregistré pour le moment.</Td>
                <Td> </Td>
                <Td> </Td>
                <Td> </Td>
                <Td> </Td>
                <Td> </Td>
                <Td> </Td>
                <Td> </Td>
                <Td> </Td>
              </tr>
            )}
          </tbody>
        </ResponsiveTable>
      </Panel>
    </div>
  );
}

function StatsPage() {
  const periods = ["Aujourd'hui", "Hier", "Cette semaine", "Semaine dernière", "Ce mois", "Mois dernier", "3 derniers mois", "12 derniers mois", "Période personnalisée"];
  const [period, setPeriod] = useState(periods[0]);
  return (
    <div className="space-y-5">
      <Toolbar
        title="Statistiques"
        description="Analyse après service: ventes, horaires forts, catégories, zones et tendances."
        right={<SelectLike value={period} onChange={setPeriod} options={periods} />}
      />
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Chiffre d'affaires et commandes">
          <ChartBox>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={revenueData}>
                <CartesianGrid stroke="rgba(245,242,235,.08)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(245,242,235,.55)" />
                <YAxis stroke="rgba(245,242,235,.55)" />
                <Tooltip contentStyle={{ background: "#1f1f1f", border: "1px solid rgba(245,242,235,.14)", color: "#f5f2eb" }} />
                <Line type="monotone" dataKey="ca" stroke="#d0112b" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="commandes" stroke="#f4a23d" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>
        <Panel title="CA par catégorie">
          <ChartBox>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={categoryRevenue} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={3}>
                  {categoryRevenue.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1f1f1f", border: "1px solid rgba(245,242,235,.14)", color: "#f5f2eb" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>
        <Panel title="Top produits">
          <InsightGrid items={["Box Signature", "California Saumon Cheese", "Poke Mixte", "Gyoza", "Mochis Yuzu", "Torei California"]} />
        </Panel>
        <Panel title="Produits en baisse">
          <InsightGrid items={["Maki Concombre", "Soupe miso saumon", "Sashimi Bar", "Oasis"]} danger />
        </Panel>
        <Panel title="Souvent achetés ensemble">
          <InsightGrid items={["Gyoza + California", "Poke + Mochi", "Plateau + Boissons", "Maki + Soupe"]} />
        </Panel>
        <Panel title="Performance par zone">
          <InsightGrid items={["Le Val 42%", "Cotignac 28%", "Brignoles 14%", "Carcès 9%"]} />
        </Panel>
      </div>
    </div>
  );
}

function HoursPage({
  closure,
  onChangeClosure,
  hours,
  onChangeHours,
}: {
  closure: ClosureState | null;
  onChangeClosure: (closure: ClosureState | null) => void;
  hours: OpeningHour[];
  onChangeHours: (hours: OpeningHour[]) => void;
}) {
  const [draft, setDraft] = useState<ClosureState>(
    closure ?? {
      start: new Date().toISOString().slice(0, 10),
      end: new Date().toISOString().slice(0, 10),
      reason: "Fermeture exceptionnelle",
    },
  );
  const updateHour = (day: string, patch: Partial<OpeningHour>) => {
    onChangeHours(hours.map((hour) => (hour.day === day ? { ...hour, ...patch } : hour)));
  };

  return (
    <div className="space-y-5">
      <Toolbar title="Horaires & disponibilité" description="Services midi/soir, pauses, fermetures, délais et capacité simultanée." />
      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <Panel title="Horaires d'ouverture">
          <div className="space-y-3">
            {hours.map((hour) => (
              <div key={hour.day} className="grid gap-3 rounded-2xl border border-cream/10 bg-ink p-3 md:grid-cols-[120px_1fr_1fr_160px]">
                <p className="font-semibold text-cream">{hour.day}</p>
                <input className="admin-input" value={hour.lunch} onChange={(event) => updateHour(hour.day, { lunch: event.target.value })} />
                <input className="admin-input" value={hour.dinner} onChange={(event) => updateHour(hour.day, { dinner: event.target.value })} />
                <input className="admin-input" type="number" value={hour.capacity} onChange={(event) => updateHour(hour.day, { capacity: Number(event.target.value) })} />
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Fermeture exceptionnelle">
          <div className="space-y-3">
            <label className="block">
              <Label>Début</Label>
              <input type="date" value={draft.start} onChange={(event) => setDraft({ ...draft, start: event.target.value })} className="admin-input" />
            </label>
            <label className="block">
              <Label>Fin incluse</Label>
              <input type="date" value={draft.end} onChange={(event) => setDraft({ ...draft, end: event.target.value })} className="admin-input" />
            </label>
            <label className="block">
              <Label>Message interne</Label>
              <input value={draft.reason} onChange={(event) => setDraft({ ...draft, reason: event.target.value })} className="admin-input" />
            </label>
            <div className="rounded-2xl border border-cream/10 bg-ink p-3 text-sm text-muted-foreground">
              {closure ? (
                <p>Fermeture active du {closure.start} au {closure.end}. Le site client affiche un écran bloquant dans ce prototype.</p>
              ) : (
                <p>Aucune fermeture active. Le site client reste commandable.</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <AdminButton tone="danger" icon={Pause} onClick={() => onChangeClosure(draft)}>
                Activer fermeture
              </AdminButton>
              <AdminButton tone="success" icon={CheckCircle2} onClick={() => onChangeClosure(null)}>
                Rouvrir maintenant
              </AdminButton>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="space-y-5">
      <Toolbar title="Paramètres" description="Informations restaurant, paiement, fiscalité, notifications et exports." />
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Restaurant">
          <div className="grid gap-3 md:grid-cols-2">
            <SettingField label="Nom" value="Edo-San Sushi" />
            <SettingField label="Téléphone" value="+33 4 94 59 29 03" />
            <SettingField label="Adresse cuisine" value="6 rue Marceau, Le Val" />
            <SettingField label="Email" value="contact@edosan-sushi.com" />
          </div>
        </Panel>
        <Panel title="Notifications">
          <InsightGrid items={["Nouvelle commande sonore", "Alerte retard préparation", "Résumé fin de service", "Alerte stock bas"]} />
        </Panel>
        <Panel title="Exports">
          <div className="flex flex-wrap gap-2">
            <AdminButton tone="secondary" icon={Download}>Export CSV ventes</AdminButton>
            <AdminButton tone="secondary" icon={Download}>Export PDF comptable</AdminButton>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function UsersPage() {
  const users = [
    { name: "Manager Edo-San", role: "Administrateur", email: "manager@edo-san.fr", status: "Actif" },
    { name: "Cuisine", role: "Préparation", email: "cuisine@edo-san.fr", status: "Actif" },
    { name: "Livreur", role: "Livraison", email: "livraison@edo-san.fr", status: "Invité" },
  ];
  return (
    <div className="space-y-5">
      <Toolbar title="Utilisateurs" description="Rôles, accès et permissions du futur back-office connecté." right={<AdminButton tone="primary" icon={Plus}>Inviter</AdminButton>} />
      <Panel>
        <ResponsiveTable>
          <thead>
            <tr>
              <Th>Nom</Th>
              <Th>Email</Th>
              <Th>Rôle</Th>
              <Th>Statut</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.email} className="border-t border-cream/10">
                <Td>{user.name}</Td>
                <Td>{user.email}</Td>
                <Td>{user.role}</Td>
                <Td><StatusBadge tone={user.status === "Actif" ? "success" : "warning"}>{user.status}</StatusBadge></Td>
                <Td><IconButton label="Options" icon={MoreHorizontal} /></Td>
              </tr>
            ))}
          </tbody>
        </ResponsiveTable>
      </Panel>
    </div>
  );
}

function CategoryDrawer({
  category,
  onClose,
  onSave,
}: {
  category: AdminCategory | null;
  onClose: () => void;
  onSave: (category: AdminCategory) => void;
}) {
  const [draft, setDraft] = useState<AdminCategory | null>(category);

  useEffect(() => {
    setDraft(category);
  }, [category]);

  if (!category || !draft) return null;

  const update = <K extends keyof AdminCategory>(key: K, value: AdminCategory[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  return (
    <SideDrawer title="Catégorie" onClose={onClose}>
      <div className="space-y-5">
        <FormSection title="Informations">
          <Field label="Nom" value={draft.label} onChange={(value) => update("label", value)} />
          <TextArea label="Description" value={draft.description} onChange={(value) => update("description", value)} />
          <Field label="Image" value={draft.image ?? ""} onChange={(value) => update("image", value)} />
          <SelectField label="Statut" value={draft.status} options={["Visible", "Masquée"]} onChange={(value) => update("status", value as AdminCategory["status"])} />
          <SelectField label="Visibilité" value={draft.visibility} options={["Livraison + retrait", "Retrait seul", "Livraison seule"]} onChange={(value) => update("visibility", value as AdminCategory["visibility"])} />
          <Field label="Horaires spécifiques" value={draft.schedule} onChange={(value) => update("schedule", value)} />
        </FormSection>
        <div className="flex justify-end gap-2">
          <AdminButton tone="secondary" onClick={onClose}>Annuler</AdminButton>
          <AdminButton tone="primary" icon={CheckCircle2} onClick={() => onSave(draft)}>Enregistrer</AdminButton>
        </div>
      </div>
    </SideDrawer>
  );
}

function PromotionDrawer({
  promotion,
  products,
  categories,
  onClose,
  onSave,
}: {
  promotion: StorePromotion | null;
  products: AdminProduct[];
  categories: AdminCategory[];
  onClose: () => void;
  onSave: (promotion: StorePromotion) => void;
}) {
  const [draft, setDraft] = useState<StorePromotion | null>(promotion);

  useEffect(() => {
    setDraft(promotion);
  }, [promotion]);

  if (!promotion || !draft) return null;

  const toggleProduct = (productId: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        productIds: prev.productIds.includes(productId)
          ? prev.productIds.filter((id) => id !== productId)
          : [...prev.productIds, productId],
      };
    });
  };

  const update = <K extends keyof StorePromotion>(key: K, value: StorePromotion[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  return (
    <SideDrawer title="Créer une promotion" onClose={onClose} width="wide">
      <div className="space-y-6">
        <FormSection title="Paramètres">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Titre de promotion" value={draft.title} onChange={(value) => update("title", value)} />
            <Field label="Sous-titre" value={draft.subtitle} onChange={(value) => update("subtitle", value)} />
            <label className="block">
              <Label>Début</Label>
              <input className="admin-input" type="date" value={draft.start} onChange={(event) => update("start", event.target.value)} />
            </label>
            <label className="block">
              <Label>Fin incluse</Label>
              <input className="admin-input" type="date" value={draft.end} onChange={(event) => update("end", event.target.value)} />
            </label>
            <NumberField label="Pourcentage de promotion" value={draft.discountPercent} onChange={(value) => update("discountPercent", Math.max(1, Math.min(90, value)))} />
          </div>
        </FormSection>

        <FormSection title="Articles concernés">
          <div className="space-y-5">
            {categories.map((category) => {
              const categoryProducts = products.filter((product) => product.categoryLabel === category.label);
              if (categoryProducts.length === 0) return null;
              return (
                <div key={category.id} className="space-y-2">
                  <p className="font-semibold text-cream">{category.label}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {categoryProducts.map((product) => {
                      const selected = draft.productIds.includes(product.id);
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => toggleProduct(product.id)}
                          className={cn(
                            "flex items-center gap-3 rounded-2xl border p-2 text-left transition",
                            selected ? "border-crimson bg-crimson/10" : "border-cream/10 bg-ink hover:border-crimson",
                          )}
                        >
                          <img src={product.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                          <span className="min-w-0 flex-1 text-sm text-cream">{product.name}</span>
                          {selected && <CheckCircle2 className="h-4 w-4 text-crimson" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </FormSection>

        <div className="sticky bottom-0 -mx-6 border-t border-cream/10 bg-ink-elevated px-6 py-4">
          <div className="flex justify-end gap-2">
            <AdminButton tone="secondary" onClick={onClose}>Annuler</AdminButton>
            <AdminButton tone="primary" icon={CheckCircle2} onClick={() => onSave(draft)}>Lancer la promotion</AdminButton>
          </div>
        </div>
      </div>
    </SideDrawer>
  );
}

function ProductDrawer({
  product,
  categories,
  onClose,
  onSave,
}: {
  product: AdminProduct | null;
  categories: AdminCategory[];
  onClose: () => void;
  onSave: (product: AdminProduct) => void;
}) {
  const [draft, setDraft] = useState<AdminProduct | null>(product);

  useEffect(() => {
    setDraft(product);
  }, [product]);

  if (!product || !draft) return null;

  const update = <K extends keyof AdminProduct>(key: K, value: AdminProduct[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  return (
    <SideDrawer title="Fiche produit" onClose={onClose} width="wide">
      <div className="space-y-6">
        <FormSection title="Identité">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Nom" value={draft.name} onChange={(value) => update("name", value)} />
            <Field label="Référence interne" value={draft.internalRef} onChange={(value) => update("internalRef", value)} />
            <SelectField label="Catégorie" value={draft.categoryLabel} options={categories.map((category) => category.label)} onChange={(value) => update("categoryLabel", value)} />
          </div>
          <TextArea label="Description client" value={draft.description} onChange={(value) => update("description", value)} />
          <TextArea label="Ingrédients" value={draft.ingredients} onChange={(value) => update("ingredients", value)} />
        </FormSection>

        <FormSection title="Photo, upload et recadrage">
          <div className="grid gap-4 md:grid-cols-[180px_1fr]">
            <img src={draft.image} alt="" className="aspect-square w-full rounded-3xl object-cover" />
            <div className="rounded-3xl border border-dashed border-cream/20 bg-ink p-5">
              <Upload className="h-6 w-6 text-crimson" />
              <p className="mt-3 text-sm font-semibold text-cream">Déposer une photo produit</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">L'upload et le recadrage seront branchés au stockage image plus tard. Ici, l'interface est prête.</p>
              <input
                type="file"
                accept="image/*"
                className="mt-4 text-xs text-muted-foreground"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) update("image", URL.createObjectURL(file));
                }}
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Prix et quantité">
          <div className="grid gap-3 md:grid-cols-3">
            <NumberField label="Prix TTC" value={draft.price} onChange={(value) => update("price", value)} />
            <NumberField label="TVA %" value={draft.vat} onChange={(value) => update("vat", value)} />
            <NumberField label="Prix barré" value={draft.strikePrice ?? 0} onChange={(value) => update("strikePrice", value)} />
            <NumberField label="Quantité par pack" value={draft.pieces ?? 1} onChange={(value) => update("pieces", value)} />
            <SelectField label="Statut" value={draft.status} options={["Actif", "Masqué", "Indisponible"]} onChange={(value) => update("status", value as ProductStatus)} />
          </div>
        </FormSection>

        <div className="sticky bottom-0 -mx-6 border-t border-cream/10 bg-ink-elevated px-6 py-4">
          <div className="flex justify-end gap-2">
            <AdminButton tone="secondary" onClick={onClose}>Annuler</AdminButton>
            <AdminButton tone="primary" icon={CheckCircle2} onClick={() => onSave(draft)}>Enregistrer</AdminButton>
          </div>
        </div>
      </div>
    </SideDrawer>
  );
}

function OrderDrawer({
  order,
  onClose,
  onStatusChange,
}: {
  order: AdminOrder | null;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}) {
  if (!order) return null;
  return (
    <SideDrawer title={order.id} onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-3xl border border-cream/10 bg-ink p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-cream">{order.client}</p>
              <p className="mt-1 text-sm text-muted-foreground">{order.phone}</p>
              <p className="text-sm text-muted-foreground">{order.email}</p>
            </div>
            <StatusBadge tone={statusTone(order.status)}>{order.status}</StatusBadge>
          </div>
          <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
            <span><MapPin className="mr-2 inline h-4 w-4 text-crimson" />{order.address}</span>
            <span>Distance : {order.distance} km · Paiement : {order.payment}</span>
          </div>
        </div>

        <Panel title="Articles">
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.name} className="flex justify-between gap-3 rounded-xl bg-ink px-3 py-2 text-sm">
                <span className="text-cream">{item.qty} × {item.name}</span>
                <span className="text-muted-foreground">{formatPrice(item.qty * item.price)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-cream/10 pt-3 font-display text-2xl text-cream">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </Panel>

        <Panel title="Remarques">
          <p className="text-sm leading-relaxed text-muted-foreground">{order.notes}</p>
        </Panel>

        <Panel title="Historique des statuts">
          <div className="space-y-3">
            {order.history.map((entry, index) => (
              <div key={`${entry.status}-${index}`} className="flex items-center justify-between rounded-xl bg-ink px-3 py-2 text-sm">
                <span className="text-cream">{entry.status}</span>
                <span className="text-muted-foreground">{entry.time}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Actions rapides">
          <div className="flex flex-wrap gap-2">
            {nextStatuses(order.status).map((status) => (
              <AdminButton key={status} tone="primary" onClick={() => onStatusChange(order.id, status)}>{status}</AdminButton>
            ))}
            <AdminButton tone="danger" onClick={() => onStatusChange(order.id, "Annulée")}>Annuler</AdminButton>
          </div>
        </Panel>
      </div>
    </SideDrawer>
  );
}

function ClientDrawer({ client, onClose }: { client: Client | null; onClose: () => void }) {
  if (!client) return null;
  return (
    <SideDrawer title={client.name} onClose={onClose}>
      <div className="space-y-5">
        <Panel title="Profil client">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Téléphone : <span className="text-cream">{client.phone}</span></p>
            <p>Email : <span className="text-cream">{client.email}</span></p>
            <p>Adresse principale : <span className="text-cream">{client.address}</span></p>
            <p>Statut : <span className="text-cream">{client.status}</span></p>
          </div>
        </Panel>
        <Panel title="Historique">
          <InsightGrid items={[`${client.orders} commandes`, `${formatPrice(client.spent)} dépensés`, `${formatPrice(client.average)} panier moyen`, `Dernière commande : ${client.lastOrder}`]} />
        </Panel>
        <Panel title="Produits préférés">
          <InsightGrid items={client.topProducts.length > 0 ? client.topProducts : ["Aucun produit favori calculé"]} />
        </Panel>
        <Panel title="Notes internes">
          <TextArea label="Note" value="Client fidèle. Préfère livraison sans appel si paiement déjà effectué." onChange={() => undefined} />
        </Panel>
      </div>
    </SideDrawer>
  );
}

function SideDrawer({
  title,
  children,
  width = "normal",
  onClose,
}: {
  title: string;
  children: ReactNode;
  width?: "normal" | "wide";
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50">
      <button aria-label="Fermer" className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside
        className={cn(
          "absolute inset-y-0 right-0 flex w-full flex-col border-l border-cream/10 bg-ink-elevated shadow-2xl",
          width === "wide" ? "max-w-4xl" : "max-w-xl",
        )}
      >
        <div className="flex items-center justify-between border-b border-cream/10 px-6 py-5">
          <h2 className="font-display text-2xl text-cream">{title}</h2>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-ink text-cream" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </aside>
    </div>
  );
}

function KpiCard({ label, value, helper, icon: Icon, warning }: { label: string; value: string; helper: string; icon: LucideIcon; warning?: boolean }) {
  return (
    <div className="rounded-3xl border border-cream/10 bg-ink-elevated p-4">
      <div className="flex items-center justify-between gap-3">
        <span className={cn("grid h-10 w-10 place-items-center rounded-full", warning ? "bg-[#f4a23d]/15 text-[#f4a23d]" : "bg-crimson/15 text-crimson")}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl leading-none text-cream">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}

function Toolbar({ title, description, right }: { title: string; description: string; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-3xl text-cream md:text-4xl">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
      </div>
      {right}
    </div>
  );
}

function Panel({ title, action, children }: { title?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-cream/10 bg-ink-elevated p-4 md:p-5">
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h3 className="font-display text-2xl text-cream">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function AdminButton({
  children,
  icon: Icon,
  tone = "secondary",
  onClick,
}: {
  children: ReactNode;
  icon?: LucideIcon;
  tone?: "primary" | "secondary" | "danger" | "success";
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
        tone === "primary" && "bg-crimson text-crimson-foreground crimson-glow hover:brightness-110",
        tone === "secondary" && "border border-cream/15 bg-ink text-cream hover:border-crimson",
        tone === "danger" && "bg-crimson/15 text-crimson hover:bg-crimson hover:text-crimson-foreground",
        tone === "success" && "bg-[#00cf51]/15 text-[#00cf51] hover:bg-[#00cf51]/25",
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

function StatusBadge({ children, tone }: { children: ReactNode; tone: "success" | "warning" | "danger" | "neutral" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "success" && "bg-[#00cf51]/15 text-[#00cf51]",
        tone === "warning" && "bg-[#f4a23d]/15 text-[#f4a23d]",
        tone === "danger" && "bg-crimson/15 text-crimson",
        tone === "neutral" && "bg-cream/10 text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

function AlertCard({ tone, title, text }: { tone: "warning" | "danger"; title: string; text: string }) {
  return (
    <div className={cn("rounded-2xl border p-3", tone === "warning" ? "border-[#f4a23d]/35 bg-[#f4a23d]/10" : "border-crimson/35 bg-crimson/10")}>
      <p className="text-sm font-semibold text-cream">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

function Tabs<T extends string>({ tabs, active, onChange }: { tabs: readonly T[]; active: T; onChange: (tab: T) => void }) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-2xl border border-cream/10 bg-ink-elevated p-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
            active === tab ? "bg-crimson text-crimson-foreground" : "text-muted-foreground hover:text-cream",
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function SearchField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="relative block">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="admin-input pl-9" />
    </label>
  );
}

function SelectLike({ value, options, onChange }: { value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="admin-input">
      {options.map((option) => (
        <option key={option} value={option} className="bg-ink text-cream">
          {option}
        </option>
      ))}
    </select>
  );
}

function ResponsiveTable({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto"><table className="min-w-full text-left text-sm">{children}</table></div>;
}

function Th({ children }: { children: ReactNode }) {
  return <th className="whitespace-nowrap px-3 py-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">{children}</th>;
}

function Td({ children }: { children: ReactNode }) {
  return <td className="whitespace-nowrap px-3 py-3 align-middle text-sm text-muted-foreground">{children}</td>;
}

function IconButton({ label, icon: Icon, danger, onClick }: { label: string; icon: LucideIcon; danger?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn("grid h-8 w-8 place-items-center rounded-full border border-cream/15 transition hover:border-crimson", danger ? "text-crimson" : "text-cream")}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input className="admin-input" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input className="admin-input" type="number" step="0.01" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea className="admin-input min-h-24 resize-y" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <select className="admin-input" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option} className="bg-ink text-cream">{option}</option>
        ))}
      </select>
    </label>
  );
}

function SettingField({ label, value, compact }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className={cn("rounded-2xl border border-cream/10 bg-ink p-3", compact && "p-2")}>
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-sm font-semibold text-cream", compact && "text-xs")}>{value}</p>
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <span className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{children}</span>;
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-3xl border border-cream/10 bg-ink p-4">
      <h3 className="font-display text-2xl text-cream">{title}</h3>
      {children}
    </section>
  );
}

function ChartBox({ children }: { children: ReactNode }) {
  return <div className="rounded-3xl border border-cream/10 bg-ink p-3">{children}</div>;
}

function InsightGrid({ items, danger }: { items: string[]; danger?: boolean }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item} className="rounded-2xl border border-cream/10 bg-ink p-3 text-sm text-cream">
          <span className={cn("mr-2 inline-block h-2 w-2 rounded-full", danger ? "bg-crimson" : "bg-[#00cf51]")} />
          {item}
        </div>
      ))}
    </div>
  );
}

function PublishBar({
  visible,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!visible) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-[55] border-t border-cream/10 bg-ink/95 px-4 py-3 backdrop-blur md:left-[280px]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <AdminButton tone="secondary" icon={X} onClick={onCancel}>Annuler</AdminButton>
        <div className="hidden text-center text-sm text-muted-foreground sm:block">
          Des modifications sont en attente. Elles ne seront visibles côté client qu'après confirmation.
        </div>
        <AdminButton tone="primary" icon={CheckCircle2} onClick={onConfirm}>Confirmer</AdminButton>
      </div>
    </div>
  );
}

function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-5 right-5 z-[60] max-w-sm rounded-2xl border border-cream/10 bg-ink-elevated px-4 py-3 text-sm text-cream shadow-2xl">
      {message}
    </div>
  );
}

function statusTone(status: OrderStatus): "success" | "warning" | "danger" | "neutral" {
  if (["Terminée", "Prête"].includes(status)) return "success";
  if (["Nouvelle", "En préparation", "En livraison"].includes(status)) return "warning";
  if (status === "Annulée") return "danger";
  return "neutral";
}

function nextStatuses(status: OrderStatus): OrderStatus[] {
  if (status === "Nouvelle") return ["Acceptée", "Annulée"];
  if (status === "Acceptée") return ["En préparation", "Annulée"];
  if (status === "En préparation") return ["Prête", "Annulée"];
  if (status === "Prête") return ["En livraison", "Terminée"];
  if (status === "En livraison") return ["Terminée"];
  return [];
}
