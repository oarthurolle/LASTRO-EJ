import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  FileText,
  LoaderCircle,
  Search,
  UserRound,
} from "lucide-react";
import { fetchApi, parseApiResponse } from "../../auth/api";
import { sanitizeBlogHtml } from "../../utils/sanitizeHtml";
import type {
  BlogPageResponse,
  BlogPostCard,
  BlogPostDetail,
} from "./types";
import "./Blog.css";

const CATEGORIES = [
  "Finanças",
  "Gestão",
  "Mercado",
  "Empreendedorismo",
  "LASTRO",
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function readingTime(content: string) {
  const text = new DOMParser().parseFromString(content, "text/html").body
    .textContent;
  return Math.max(1, Math.ceil((text?.split(/\s+/).filter(Boolean).length ?? 0) / 200));
}

function BlogCard({ post }: { post: BlogPostCard }) {
  return (
    <article className="blog-card">
      <a className="blog-card__media" href={`/blog/${post.slug}`}>
        {post.coverImageUrl ? (
          <img src={post.coverImageUrl} alt="" />
        ) : (
          <FileText size={34} />
        )}
      </a>
      <div className="blog-card__body">
        <span className="blog-card__category">
          {post.category || "Conteúdo LASTRO"}
        </span>
        <h2>
          <a href={`/blog/${post.slug}`}>{post.title}</a>
        </h2>
        <p>{post.summary}</p>
        <div className="blog-card__meta">
          <span>
            <UserRound size={14} />
            {post.author}
          </span>
          <span>
            <CalendarDays size={14} />
            {formatDate(post.publishedAt)}
          </span>
        </div>
        <a className="blog-card__read" href={`/blog/${post.slug}`}>
          Ler artigo
          <ArrowRight size={15} />
        </a>
      </div>
    </article>
  );
}

function BlogListing() {
  const [posts, setPosts] = useState<BlogPostCard[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({
      page: String(page),
      size: "9",
      sort: "publishedAt,desc",
    });
    if (search) params.set("search", search);
    if (category) params.set("category", category);

    void fetchApi(`/api/public/posts?${params}`)
      .then((response) => parseApiResponse<BlogPageResponse>(response))
      .then((response) => {
        if (!active) return;
        setPosts(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
        setError("");
      })
      .catch(() => {
        if (active) setError("Não foi possível carregar os artigos agora.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [category, page, search]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setPage(0);
    setSearch(searchInput.trim());
  }

  function selectCategory(nextCategory: string) {
    setLoading(true);
    setPage(0);
    setCategory(nextCategory);
  }

  return (
    <div className="blog-page">
      <header className="blog-hero">
        <div className="container">
          <span>CONHECIMENTO QUE GERA LASTRO</span>
          <h1>Ideias para decisões mais seguras.</h1>
          <p>
            Conteúdos sobre finanças, gestão e mercado produzidos pela equipe
            da LASTRO.
          </p>
        </div>
      </header>

      <section className="blog-content container">
        <div className="blog-toolbar">
          <div className="blog-toolbar__top">
            <form className="blog-search" onSubmit={submitSearch}>
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                value={searchInput}
                placeholder="Busque por título, tema ou palavra-chave"
                aria-label="Buscar artigos"
                onChange={(event) => setSearchInput(event.target.value)}
              />
              <button type="submit">Buscar</button>
            </form>

            <p className="blog-results" aria-live="polite">
              <strong>{totalElements}</strong>
              {totalElements === 1
                ? " artigo encontrado"
                : " artigos encontrados"}
            </p>
          </div>

          <div className="blog-toolbar__bottom">
            <span>Filtrar por tema</span>

            <div className="blog-filters" role="group" aria-label="Filtrar por categoria">
              <button
                type="button"
                className={!category ? "is-active" : ""}
                onClick={() => selectCategory("")}
              >
                Todos
              </button>

              {CATEGORIES.map((item) => (
                <button
                  type="button"
                  className={category === item ? "is-active" : ""}
                  key={item}
                  onClick={() => selectCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="blog-state">
            <LoaderCircle className="is-spinning" size={28} />
            <strong>Carregando artigos</strong>
          </div>
        ) : error ? (
          <div className="blog-state">
            <FileText size={29} />
            <strong>{error}</strong>
            <span>Confirme a conexão e tente novamente.</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="blog-state">
            <Search size={29} />
            <strong>Nenhum artigo encontrado</strong>
            <span>Tente outro termo ou categoria.</span>
          </div>
        ) : (
          <div className="blog-grid">
            {posts.map((post) => (
              <BlogCard post={post} key={post.id} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="blog-pagination" aria-label="Paginação do blog">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => {
                setLoading(true);
                setPage((current) => current - 1);
              }}
            >
              <ArrowLeft size={16} />
              Anterior
            </button>
            <span>
              Página {page + 1} de {totalPages}
            </span>
            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => {
                setLoading(true);
                setPage((current) => current + 1);
              }}
            >
              Próxima
              <ArrowRight size={16} />
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}

function BlogArticle({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    void fetchApi(`/api/public/posts/${encodeURIComponent(slug)}`)
      .then((response) => parseApiResponse<BlogPostDetail>(response))
      .then((response) => {
        if (active) setPost(response);
      })
      .catch(() => {
        if (active) setError("Este artigo não está disponível.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    const previousTitle = document.title;
    document.title = `${post.title} | LASTRO`;
    return () => {
      document.title = previousTitle;
    };
  }, [post]);

  const safeContent = useMemo(
    () => (post ? sanitizeBlogHtml(post.content) : ""),
    [post],
  );

  if (loading) {
    return (
      <div className="blog-article-state">
        <LoaderCircle className="is-spinning" size={30} />
        <strong>Carregando artigo</strong>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-article-state">
        <FileText size={32} />
        <h1>{error}</h1>
        <a href="/blog">
          <ArrowLeft size={16} />
          Voltar para o blog
        </a>
      </div>
    );
  }

  return (
    <article className="blog-article">
      <header className="blog-article__header">
        <div className="container">
          <a href="/blog" className="blog-article__back">
            <ArrowLeft size={16} />
            Voltar para o blog
          </a>
          <span>{post.category || "Conteúdo LASTRO"}</span>
          <h1>{post.title}</h1>
          <p>{post.summary}</p>
          <div className="blog-article__meta">
            <span>
              <UserRound size={15} />
              {post.author}
            </span>
            <span>
              <CalendarDays size={15} />
              {formatDate(post.publishedAt)}
            </span>
            <span>
              <Clock3 size={15} />
              {readingTime(post.content)} min de leitura
            </span>
          </div>
        </div>
      </header>

      {post.coverImageUrl && (
        <div className="blog-article__cover container">
          <img src={post.coverImageUrl} alt="" />
        </div>
      )}

      <div
        className="blog-article__body"
        dangerouslySetInnerHTML={{ __html: safeContent }}
      />
    </article>
  );
}

export default function Blog() {
  const path = window.location.pathname.replace(/\/+$/, "");
  const slug = path.startsWith("/blog/") ? decodeURIComponent(path.slice(6)) : "";
  return slug ? <BlogArticle slug={slug} /> : <BlogListing />;
}