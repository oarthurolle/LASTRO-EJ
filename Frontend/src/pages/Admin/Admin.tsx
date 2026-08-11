import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  BookOpenText,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  ExternalLink,
  FilePenLine,
  Handshake,
  Inbox,
  LayoutDashboard,
  LogOut,
  Settings2,
  Menu,
  Newspaper,
  Plus,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import logoWhite from "../../assets/logos/logoWhite.png";
import { useAuth } from "../../auth/useAuth";
import BlogManager from "./components/BlogManager";
import PartnerManager from "./components/PartnerManager";
import TeamManager from "./components/TeamManager";
import IndicatorManager from "./components/IndicatorManager";
import CaseManager from "./components/CaseManager";
import ContactsManager from "./components/ContactsManager";
import EmailConfigManager from "./components/EmailConfigManager";
import type { AdminSection, BlogPost } from "./types";
import { formatDate, initials } from "./utils";
import "./Admin.css";

interface NavigationItem {
  id: AdminSection;
  label: string;
  icon: LucideIcon;
  available?: boolean;
  privilege?: string;
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
}

const CONTENT_NAVIGATION: NavigationItem[] = [
  { id: "dashboard", label: "Visão geral", icon: LayoutDashboard, available: true },
  {
    id: "blog",
    label: "Blog",
    icon: Newspaper,
    available: true,
    privilege: "PRIV_BLOG_ADMIN",
  },
  {
    id: "cases",
    label: "Cases de sucesso",
    icon: BriefcaseBusiness,
    available: true,
    privilege: "PRIV_CASES_ADMIN",
  },
  {
    id: "partners",
    label: "Parceiros",
    icon: Handshake,
    available: true,
    privilege: "PRIV_PARTNERS_ADMIN",
  },
  {
    id: "indicators",
    label: "Indicadores",
    icon: ChartNoAxesCombined,
    available: true,
    privilege: "PRIV_INDICATORS_ADMIN",
  },
];

const SYSTEM_NAVIGATION: NavigationItem[] = [
  {
    id: "contacts",
    label: "Contatos",
    icon: Inbox,
    available: true,
    privilege: "PRIV_CONTACTS_VIEW",
  },
  {
    id: "email",
    label: "Configurações de e-mail",
    icon: Settings2,
    available: true,
    privilege: "PRIV_COMPANY_INFO_ADMIN",
  },
  {
    id: "company",
    label: "Institucional",
    icon: Building2,
    privilege: "PRIV_COMPANY_INFO_ADMIN",
  },
  {
    id: "team",
    label: "Equipe e acessos",
    icon: UsersRound,
    available: true,
    privilege: "PRIV_USER_MANAGEMENT",
  },
];

const SECTION_LABELS: Record<AdminSection, string> = {
  dashboard: "Visão geral",
  blog: "Blog",
  cases: "Cases de sucesso",
  partners: "Parceiros",
  indicators: "Indicadores",
  contacts: "Contatos",
  company: "Informações institucionais",
  team: "Equipe e acessos",
  email: "Configurações de e-mail",
};

const PLACEHOLDER_COPY: Record<
  Exclude<AdminSection, "dashboard" | "blog" | "partners" | "team" | "cases" | "indicators" | "contacts" | "email">,
  { eyebrow: string; title: string; description: string; icon: LucideIcon }
> = {
  company: {
    eyebrow: "Diretoria",
    title: "Informações institucionais",
    description:
      "Este espaço será exclusivo da diretoria para manter informações estratégicas e institucionais da empresa.",
    icon: Building2,
  },
};

interface SidebarLinkProps {
  item: NavigationItem;
  activeSection: AdminSection;
  onNavigate: (section: AdminSection) => void;
}

function SidebarLink({
  item,
  activeSection,
  onNavigate,
}: SidebarLinkProps) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      className={`admin-sidebar__link ${
        activeSection === item.id ? "is-active" : ""
      }`}
      onClick={() => onNavigate(item.id)}
    >
      <Icon size={18} />
      <span>{item.label}</span>
      {!item.available && <small>Em breve</small>}
    </button>
  );
}

interface DashboardProps {
  posts: BlogPost[];
  onNavigate: (section: AdminSection) => void;
  userName: string;
  isDirector: boolean;
  canManageUsers: boolean;
}

function Dashboard({
  posts,
  onNavigate,
  userName,
  isDirector,
  canManageUsers,
}: DashboardProps) {
  const publishedPosts = posts.filter(
    (post) => post.status === "PUBLISHED",
  ).length;
  const drafts = posts.filter((post) => post.status === "DRAFT").length;
  const hiddenPosts = posts.filter(
    (post) => post.status === "UNPUBLISHED",
  ).length;

  const recentContent = useMemo(
    () =>
      posts
        .map((post) => ({
          id: `post-${post.id}`,
          title: post.title,
          type: "Post",
          status: post.status,
          updatedAt: post.updatedAt,
          target: "blog" as const,
        }))
        .sort(
          (first, second) =>
            new Date(second.updatedAt).getTime() -
            new Date(first.updatedAt).getTime(),
        )
        .slice(0, 5),
    [posts],
  );

  const metrics = [
    {
      label: "Posts publicados",
      value: publishedPosts,
      helper: `${posts.length} conteúdos no total`,
      icon: Newspaper,
      tone: "blue",
    },
    {
      label: "Posts cadastrados",
      value: posts.length,
      helper: "dados carregados do backend",
      icon: BookOpenText,
      tone: "violet",
    },
    {
      label: "Rascunhos",
      value: drafts,
      helper: drafts === 1 ? "item aguardando revisão" : "itens aguardando revisão",
      icon: FilePenLine,
      tone: "amber",
    },
    {
      label: "Posts ocultos",
      value: hiddenPosts,
      helper: "fora do site público",
      icon: Eye,
      tone: "green",
    },
  ];

  return (
    <section className="admin-module admin-dashboard">
      <header className="admin-dashboard__hero">
        <div>
          <span className="admin-eyebrow">
            {isDirector ? "Visão da diretoria" : "Gestão de conteúdo"}
          </span>
          <h1>Bom trabalho, {userName.split(/\s+/)[0]}.</h1>
          <p>
            {isDirector
              ? "Acompanhe o conteúdo institucional, a equipe e os acessos da LASTRO."
              : "Acompanhe o conteúdo institucional e mantenha o site da LASTRO atualizado."}
          </p>
        </div>
        <a className="admin-button admin-button--secondary" href="/" target="_blank">
          <ExternalLink size={16} />
          Ver site público
        </a>
      </header>

      <div className="admin-metrics">
        {metrics.map(({ label, value, helper, icon: Icon, tone }) => (
          <article className="admin-metric-card" key={label}>
            <div className={`admin-metric-card__icon is-${tone}`}>
              <Icon size={20} />
            </div>
            <span>{label}</span>
            <strong>{String(value).padStart(2, "0")}</strong>
            <small>{helper}</small>
          </article>
        ))}
      </div>

      <div className="admin-dashboard__grid">
        <article className="admin-card admin-recent">
          <div className="admin-section-head">
            <div>
              <span className="admin-eyebrow">Atualizações</span>
              <h2>Conteúdo recente</h2>
            </div>
            <button type="button" onClick={() => onNavigate("blog")}>
              Ver conteúdos
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="admin-recent__list">
            {recentContent.map((item) => (
              <button
                type="button"
                className="admin-recent__item"
                key={item.id}
                onClick={() => onNavigate(item.target)}
              >
                <span className="admin-recent__type">
                  <BookOpenText size={17} />
                </span>
                <span className="admin-recent__content">
                  <strong>{item.title}</strong>
                  <small>
                    {item.type} · atualizado em {formatDate(item.updatedAt)}
                  </small>
                </span>
                <span
                  className={`admin-status admin-status--${item.status.toLowerCase()}`}
                >
                  {item.status === "PUBLISHED"
                    ? "Publicado"
                    : item.status === "UNPUBLISHED"
                      ? "Oculto"
                      : "Rascunho"}
                </span>
                <ChevronRight size={17} />
              </button>
            ))}
          </div>
        </article>

        <div className="admin-dashboard__side">
          <article className="admin-card admin-quick-actions">
            <div className="admin-section-head">
              <div>
                <span className="admin-eyebrow">Atalhos</span>
                <h2>Ações rápidas</h2>
              </div>
            </div>
            <button type="button" onClick={() => onNavigate("blog")}>
              <span>
                <Plus size={17} />
              </span>
              <div>
                <strong>Novo post</strong>
                <small>Escrever para o blog</small>
              </div>
              <ArrowUpRight size={17} />
            </button>
            {canManageUsers && (
              <button type="button" onClick={() => onNavigate("team")}>
                <span>
                  <UsersRound size={17} />
                </span>
                <div>
                  <strong>Gerenciar equipe</strong>
                  <small>Revisar cargos e acessos</small>
                </div>
                <ArrowUpRight size={17} />
              </button>
            )}
          </article>

          <article className="admin-card admin-health-card">
            <div className="admin-health-card__icon">
              <Sparkles size={20} />
            </div>
            <div>
              <span>Integridade do conteúdo</span>
              <h2>Dados reais do backend</h2>
              <p>
                O painel não cria registros demonstrativos. Listas vazias
                representam o estado real do sistema.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

interface PlaceholderModuleProps {
  section: Exclude<AdminSection, "dashboard" | "blog" | "partners" | "team" | "cases" | "indicators" | "contacts" | "email">;
}

function PlaceholderModule({ section }: PlaceholderModuleProps) {
  const module = PLACEHOLDER_COPY[section];
  const Icon = module.icon;

  return (
    <section className="admin-module admin-placeholder">
      <div className="admin-placeholder__visual">
        <Icon size={28} />
        <span />
        <span />
        <span />
      </div>
      <span className="admin-eyebrow">{module.eyebrow}</span>
      <h1>{module.title}</h1>
      <p>{module.description}</p>
      <div className="admin-placeholder__notice">
        <Clock3 size={17} />
        Planejado para a próxima etapa do painel
      </div>
    </section>
  );
}

export default function Admin() {
  const { user, hasRole, hasPrivilege, logout, apiRequest } = useAuth();
  const [activeSection, setActiveSection] =
    useState<AdminSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(() =>
    hasPrivilege("PRIV_BLOG_ADMIN"),
  );
  const [postsError, setPostsError] = useState("");

  useEffect(() => {
    let active = true;

    if (!hasPrivilege("PRIV_BLOG_ADMIN")) {
      return () => {
        active = false;
      };
    }

    void (async () => {
      const firstPage = await apiRequest<PageResponse<BlogPost>>(
        "/api/admin/posts?page=0&size=50&sort=updatedAt,desc",
      );
      if (firstPage.totalPages <= 1) return firstPage.content;

      const remainingPages = await Promise.all(
        Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
          apiRequest<PageResponse<BlogPost>>(
            `/api/admin/posts?page=${index + 1}&size=50&sort=updatedAt,desc`,
          ),
        ),
      );
      return [
        ...firstPage.content,
        ...remainingPages.flatMap((page) => page.content),
      ];
    })()
      .then((allPosts) => {
        if (active) {
          setPosts(allPosts);
          setPostsError("");
        }
      })
      .catch(() => {
        if (active) {
          setPostsError("Não foi possível carregar os posts do backend.");
        }
      })
      .finally(() => {
        if (active) setPostsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [apiRequest, hasPrivilege]);

  useEffect(() => {
    if (!notification) return;

    const timeout = window.setTimeout(() => setNotification(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [notification]);

  const contentNavigation = useMemo(
    () =>
      CONTENT_NAVIGATION.filter(
        (item) => !item.privilege || hasPrivilege(item.privilege),
      ),
    [hasPrivilege],
  );

  const systemNavigation = useMemo(
    () =>
      SYSTEM_NAVIGATION.filter(
        (item) => !item.privilege || hasPrivilege(item.privilege),
      ),
    [hasPrivilege],
  );

  const userName =
    user?.presentationName?.trim() || user?.email.split("@")[0] || "Usuário";
  const userInitials = initials(userName);
  const isDirector = hasRole("DIRECTOR");
  const roleLabel = isDirector ? "Diretor(a)" : "Administrador(a)";

  function navigate(section: AdminSection) {
    setActiveSection(section);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderSection() {
    if (activeSection === "dashboard") {
      return (
        <Dashboard
          posts={posts}
          onNavigate={navigate}
          userName={userName}
          isDirector={isDirector}
          canManageUsers={hasPrivilege("PRIV_USER_MANAGEMENT")}
        />
      );
    }
    if (activeSection === "blog") {
      return (
        <BlogManager
          posts={posts}
          setPosts={setPosts}
          currentAuthor={userName}
          onNotify={setNotification}
          loading={postsLoading}
        />
      );
    }
    if (activeSection === "cases") {
      return <CaseManager onNotify={setNotification} />;
    }
    if (activeSection === "contacts") {
      return <ContactsManager onNotify={setNotification} />;
    }
    if (activeSection === "partners") {
      return <PartnerManager onNotify={setNotification} />;
    }
    if (activeSection === "team") {
      return <TeamManager onNotify={setNotification} />;
    }
    if (activeSection === "indicators") {
      return <IndicatorManager onNotify={setNotification} />;
    }
    if (activeSection === "email") {
      return <EmailConfigManager onNotify={setNotification} />;
    }

    return <PlaceholderModule section={activeSection} />;
  }

  return (
    <div className="admin-page">
      {sidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          aria-label="Fechar menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`admin-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="admin-sidebar__brand">
          <a href="/" aria-label="Voltar ao site da LASTRO">
            <img src={logoWhite} alt="" />
          </a>
          <div>
            <strong>LASTRO</strong>
            <span>Painel administrativo</span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Navegação administrativa">
          <span className="admin-sidebar__label">Conteúdo do site</span>
          {contentNavigation.map((item) => (
            <SidebarLink
              key={item.id}
              item={item}
              activeSection={activeSection}
              onNavigate={navigate}
            />
          ))}
          {systemNavigation.length > 0 && (
            <>
              <span className="admin-sidebar__label">
                {isDirector ? "Diretoria e sistema" : "Sistema"}
              </span>
              {systemNavigation.map((item) => (
                <SidebarLink
                  key={item.id}
                  item={item}
                  activeSection={activeSection}
                  onNavigate={navigate}
                />
              ))}
            </>
          )}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__profile">
            <span>{userInitials}</span>
            <div>
              <strong>{userName}</strong>
              <small>{roleLabel}</small>
            </div>
          </div>
          <button
            type="button"
            className="admin-sidebar__logout"
            onClick={() => void logout()}
          >
            <LogOut size={17} />
            Sair do painel
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__context">
            <button
              type="button"
              className="admin-topbar__menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={21} />
            </button>
            <div>
              <span>Painel administrativo</span>
              <strong>{SECTION_LABELS[activeSection]}</strong>
            </div>
          </div>
          <div className="admin-topbar__actions">
            <a href="/" target="_blank">
              <span>Visualizar site</span>
              <ExternalLink size={16} />
            </a>
            <div className="admin-topbar__avatar">{userInitials}</div>
          </div>
        </header>

        <main className="admin-content">
          {postsError && <div className="admin-request-error">{postsError}</div>}
          {renderSection()}
        </main>
      </div>

      <div
        className={`admin-toast ${notification ? "is-visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 size={19} />
        <div>
          <strong>Alteração concluída</strong>
          <span>{notification}</span>
        </div>
      </div>
    </div>
  );
}
