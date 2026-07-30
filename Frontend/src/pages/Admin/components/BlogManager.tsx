import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Eye,
  FileImage,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { ApiRequestError } from "../../../auth/api";
import { useAuth } from "../../../auth/useAuth";
import {
  BLOG_CATEGORIES,
  EMPTY_BLOG_POST,
} from "../data";
import type { BlogPost, BlogPostDraft, PublicationStatus } from "../types";
import {
  formatDate,
  getReadTime,
  initials,
  slugify,
  stripHtml,
} from "../utils";
import RichTextEditor from "./RichTextEditor";
import { sanitizeBlogHtml } from "../../../utils/sanitizeHtml";

interface BlogManagerProps {
  posts: BlogPost[];
  setPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
  currentAuthor: string;
  onNotify: (message: string) => void;
  loading: boolean;
}

type BlogErrors = Partial<Record<keyof BlogPostDraft, string>>;

export default function BlogManager({
  posts,
  setPosts,
  currentAuthor,
  onNotify,
  loading,
}: BlogManagerProps) {
  const { apiRequest } = useAuth();
  const [view, setView] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<BlogPostDraft>({ ...EMPTY_BLOG_POST });
  const [errors, setErrors] = useState<BlogErrors>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | PublicationStatus>(
    "ALL",
  );
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");

  const filteredPosts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");

    return posts.filter((post) => {
      const matchesSearch =
        !normalizedSearch ||
        post.title.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
        post.author.toLocaleLowerCase("pt-BR").includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "ALL" || post.status === statusFilter;
      const matchesCategory =
        categoryFilter === "ALL" || post.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [categoryFilter, posts, search, statusFilter]);

  function updateDraft<K extends keyof BlogPostDraft>(
    field: K,
    value: BlogPostDraft[K],
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function openEditor(post?: BlogPost) {
    setEditingId(post?.id ?? null);
    setDraft(
      post
        ? {
            title: post.title,
            summary: post.summary,
            content: post.content,
            coverImageUrl: post.coverImageUrl ?? "",
            author: post.author,
            category: post.category ?? "",
            status: post.status,
          }
        : { ...EMPTY_BLOG_POST, author: currentAuthor },
    );
    setErrors({});
    setRequestError("");
    setView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeEditor() {
    setView("list");
    setEditingId(null);
    setErrors({});
    setRequestError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validate() {
    const nextErrors: BlogErrors = {};

    if (draft.title.trim().length < 5) {
      nextErrors.title = "Use pelo menos 5 caracteres no título.";
    }
    if (!draft.summary.trim()) {
      nextErrors.summary = "Escreva um resumo para o card do post.";
    }
    if (!draft.category) {
      nextErrors.category = "Selecione uma categoria.";
    }
    if (!draft.author) {
      nextErrors.author = "Selecione o autor.";
    }
    if (!stripHtml(draft.content)) {
      nextErrors.content = "Escreva o conteúdo do post.";
    }
    if (
      draft.coverImageUrl.trim() &&
      !/^https?:\/\/.+/i.test(draft.coverImageUrl.trim())
    ) {
      nextErrors.coverImageUrl = "Informe uma URL HTTP ou HTTPS válida.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function savePost(status: PublicationStatus) {
    if (!validate()) {
      onNotify("Revise os campos obrigatórios antes de salvar.");
      return;
    }

    setSubmitting(true);
    setRequestError("");

    try {
      const existingPost = editingId
        ? posts.find((post) => post.id === editingId)
        : undefined;
      if (existingPost && status === "DRAFT" && existingPost.status !== "DRAFT") {
        setRequestError(
          "Um post publicado ou oculto não pode voltar a rascunho. Use o estado oculto para removê-lo do site.",
        );
        return;
      }

      const payload = {
        title: draft.title.trim(),
        summary: draft.summary.trim(),
        content: sanitizeBlogHtml(draft.content),
        coverImageUrl: draft.coverImageUrl.trim() || null,
        category: draft.category.trim() || null,
        status: existingPost?.status ?? "DRAFT",
        version: editingId
          ? existingPost?.version
          : null,
      };
      let saved = await apiRequest<BlogPost>(
        editingId ? `/api/admin/posts/${editingId}` : "/api/admin/posts",
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );

      if (status === "PUBLISHED" && saved.status !== "PUBLISHED") {
        saved = await apiRequest<BlogPost>(
          `/api/admin/posts/${saved.id}/publish`,
          { method: "PATCH" },
        );
      } else if (status === "UNPUBLISHED" && saved.status === "PUBLISHED") {
        saved = await apiRequest<BlogPost>(
          `/api/admin/posts/${saved.id}/unpublish`,
          { method: "PATCH" },
        );
      }

      setPosts((current) =>
        editingId
          ? current.map((post) => (post.id === editingId ? saved : post))
          : [saved, ...current],
      );
      onNotify(
        saved.status === "PUBLISHED"
          ? "Post publicado com sucesso."
          : saved.status === "UNPUBLISHED"
            ? "Post ocultado do site."
            : "Rascunho salvo com sucesso.",
      );
      closeEditor();
    } catch (error) {
      setRequestError(
        error instanceof ApiRequestError || error instanceof Error
          ? error.message
          : "Não foi possível salvar o post.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function deletePost(post: BlogPost) {
    if (!window.confirm(`Excluir o post “${post.title}”?`)) return;

    setRequestError("");
    try {
      await apiRequest<void>(`/api/admin/posts/${post.id}`, {
        method: "DELETE",
      });
      setPosts((current) => current.filter((item) => item.id !== post.id));
      onNotify("Post excluído.");
    } catch (error) {
      setRequestError(
        error instanceof ApiRequestError || error instanceof Error
          ? error.message
          : "Não foi possível excluir o post.",
      );
    }
  }

  if (view === "form") {
    const readTime = getReadTime(draft.content);
    const originalPost = editingId
      ? posts.find((post) => post.id === editingId)
      : undefined;

    return (
      <section className="admin-module admin-editor-page">
        <header className="admin-editor-head">
          <div className="admin-editor-head__title">
            <button
              type="button"
              className="admin-icon-button"
              onClick={closeEditor}
              aria-label="Voltar para a lista de posts"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <span className="admin-eyebrow">Blog</span>
              <h1>{editingId ? "Editar post" : "Novo post"}</h1>
            </div>
          </div>
          <div className="admin-editor-head__actions">
            <button
              type="button"
              className="admin-button admin-button--secondary"
              disabled={submitting}
              onClick={() =>
                void savePost(originalPost?.status ?? "DRAFT")
              }
            >
              <Save size={16} />
              {originalPost ? "Salvar alterações" : "Salvar rascunho"}
            </button>
            <button
              type="button"
              className="admin-button admin-button--primary"
              disabled={submitting}
              onClick={() => void savePost("PUBLISHED")}
            >
              <Send size={16} />
              Publicar post
            </button>
          </div>
        </header>

        {requestError && (
          <div className="admin-request-error">{requestError}</div>
        )}

        <div className="admin-editor-grid">
          <div className="admin-editor-grid__main">
            <article className="admin-card admin-form-card">
              <div className="admin-card__heading">
                <div>
                  <h2>Informações gerais</h2>
                  <p>Título e contexto usados na listagem pública.</p>
                </div>
                <span className="admin-step">01</span>
              </div>

              <div className="admin-field">
                <label htmlFor="blog-title">Título do post</label>
                <input
                  id="blog-title"
                  value={draft.title}
                  maxLength={150}
                  className={errors.title ? "is-invalid" : ""}
                  placeholder="Ex.: Como organizar o fluxo de caixa da sua empresa"
                  onChange={(event) => updateDraft("title", event.target.value)}
                />
                <div className="admin-field__meta">
                  <span>
                    URL: /blog/
                    <b>{slugify(draft.title) || "titulo-do-post"}</b>
                  </span>
                  <span>{draft.title.length}/150</span>
                </div>
                {errors.title && (
                  <span className="admin-field__error">{errors.title}</span>
                )}
              </div>

              <div className="admin-field-row">
                <div className="admin-field">
                  <label htmlFor="blog-category">Categoria</label>
                  <select
                    id="blog-category"
                    value={draft.category}
                    className={errors.category ? "is-invalid" : ""}
                    onChange={(event) =>
                      updateDraft("category", event.target.value)
                    }
                  >
                    <option value="">Selecione uma categoria</option>
                    {BLOG_CATEGORIES.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <span className="admin-field__error">
                      {errors.category}
                    </span>
                  )}
                </div>
                <div className="admin-field">
                  <label htmlFor="blog-author">Autor</label>
                  <input
                    id="blog-author"
                    value={draft.author}
                    readOnly
                    aria-describedby="blog-author-hint"
                  />
                  <span id="blog-author-hint" className="admin-field__hint">
                    Identificado automaticamente pela sessão autenticada.
                  </span>
                  {errors.author && (
                    <span className="admin-field__error">{errors.author}</span>
                  )}
                </div>
              </div>

              <div className="admin-field">
                <label htmlFor="blog-summary">Resumo</label>
                <textarea
                  id="blog-summary"
                  value={draft.summary}
                  maxLength={220}
                  className={errors.summary ? "is-invalid" : ""}
                  placeholder="Escreva de uma a duas frases para apresentar o artigo."
                  onChange={(event) => updateDraft("summary", event.target.value)}
                />
                <div className="admin-field__meta admin-field__meta--right">
                  <span>{draft.summary.length}/220</span>
                </div>
                {errors.summary && (
                  <span className="admin-field__error">{errors.summary}</span>
                )}
              </div>
            </article>

            <article className="admin-card admin-form-card">
              <div className="admin-card__heading">
                <div>
                  <h2>Conteúdo do artigo</h2>
                  <p>O texto será salvo em HTML, como previsto pela API.</p>
                </div>
                <span className="admin-step">02</span>
              </div>
              <RichTextEditor
                value={draft.content}
                hasError={Boolean(errors.content)}
                onChange={(value) => updateDraft("content", value)}
              />
              <div className="admin-editor-info">
                <Clock3 size={15} />
                Tempo estimado de leitura: <b>{readTime} min</b>
              </div>
              {errors.content && (
                <span className="admin-field__error">{errors.content}</span>
              )}
            </article>
          </div>

          <aside className="admin-editor-grid__side">
            <article className="admin-card admin-form-card">
              <div className="admin-card__heading admin-card__heading--compact">
                <div>
                  <h2>Publicação</h2>
                  <p>Defina o estado deste conteúdo.</p>
                </div>
              </div>
              <div className="admin-status-selector">
                <button
                  type="button"
                  className={draft.status === "DRAFT" ? "is-active" : ""}
                  disabled={Boolean(originalPost && originalPost.status !== "DRAFT")}
                  onClick={() => updateDraft("status", "DRAFT")}
                >
                  Rascunho
                </button>
                <button
                  type="button"
                  className={draft.status === "PUBLISHED" ? "is-active" : ""}
                  onClick={() => updateDraft("status", "PUBLISHED")}
                >
                  Publicado
                </button>
                {editingId &&
                  posts.find((post) => post.id === editingId)?.status !==
                    "DRAFT" && (
                  <button
                    type="button"
                    className={draft.status === "UNPUBLISHED" ? "is-active" : ""}
                    onClick={() => updateDraft("status", "UNPUBLISHED")}
                  >
                    Oculto
                  </button>
                )}
              </div>
              <div className="admin-publish-note">
                <CalendarDays size={16} />
                <span>
                  A data de publicação será registrada automaticamente pelo
                  sistema.
                </span>
              </div>
              <button
                type="button"
                className="admin-button admin-button--primary admin-button--full"
                disabled={submitting}
                onClick={() => void savePost(draft.status)}
              >
                {submitting ? (
                  <LoaderCircle className="is-spinning" size={16} />
                ) : draft.status === "PUBLISHED" ? (
                  <Send size={16} />
                ) : (
                  <Save size={16} />
                )}
                {draft.status === "PUBLISHED"
                  ? "Publicar agora"
                  : draft.status === "UNPUBLISHED"
                    ? "Salvar como oculto"
                    : "Salvar rascunho"}
              </button>
            </article>

            <article className="admin-card admin-form-card">
              <div className="admin-card__heading admin-card__heading--compact">
                <div>
                  <h2>Imagem de capa</h2>
                  <p>Use uma URL pública HTTP ou HTTPS.</p>
                </div>
              </div>
              {draft.coverImageUrl ? (
                <div className="admin-cover-preview">
                  <img src={draft.coverImageUrl} alt="" />
                  <button
                    type="button"
                    onClick={() => updateDraft("coverImageUrl", "")}
                    aria-label="Remover imagem de capa"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <div className="admin-dropzone">
                  <FileImage size={25} />
                  <strong>Informe a URL da capa</strong>
                  <span>Recomendamos proporção 16:10</span>
                </div>
              )}
              <div className="admin-field admin-field--compact">
                <label htmlFor="blog-cover-url">URL da imagem</label>
                <input
                  id="blog-cover-url"
                  type="url"
                  value={draft.coverImageUrl}
                  maxLength={255}
                  placeholder="https://..."
                  className={errors.coverImageUrl ? "is-invalid" : ""}
                  onChange={(event) =>
                    updateDraft("coverImageUrl", event.target.value)
                  }
                />
                {errors.coverImageUrl && (
                  <span className="admin-field__error">
                    {errors.coverImageUrl}
                  </span>
                )}
              </div>
            </article>

            <article className="admin-card admin-preview">
              <div className="admin-preview__label">
                <Eye size={15} />
                Pré-visualização
              </div>
              <div className="admin-preview__media">
                {draft.coverImageUrl ? (
                  <img src={draft.coverImageUrl} alt="" />
                ) : (
                  <FileImage size={30} />
                )}
              </div>
              <div className="admin-preview__body">
                <span className="admin-preview__category">
                  {draft.category || "Categoria"}
                </span>
                <h3>{draft.title || "Título do post aparecerá aqui"}</h3>
                <p>
                  {draft.summary ||
                    "O resumo do conteúdo será exibido neste espaço."}
                </p>
                <div className="admin-preview__meta">
                  <span>{initials(draft.author || "LA")}</span>
                  {draft.author || "Autor"} · {readTime} min
                </div>
              </div>
            </article>
          </aside>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-module">
      <header className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Conteúdo</span>
          <h1>Blog</h1>
          <p>Crie e organize os artigos exibidos no site da LASTRO.</p>
        </div>
        <button
          type="button"
          className="admin-button admin-button--primary"
          onClick={() => openEditor()}
        >
          <Plus size={17} />
          Novo post
        </button>
      </header>

      <div className="admin-toolbar">
        <label className="admin-search">
          <Search size={17} />
          <span className="visually-hidden">Buscar posts</span>
          <input
            value={search}
            placeholder="Buscar por título ou autor..."
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <select
          aria-label="Filtrar por status"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as "ALL" | PublicationStatus)
          }
        >
          <option value="ALL">Todos os status</option>
          <option value="PUBLISHED">Publicados</option>
          <option value="DRAFT">Rascunhos</option>
          <option value="UNPUBLISHED">Ocultos</option>
        </select>
        <select
          aria-label="Filtrar por categoria"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          <option value="ALL">Todas as categorias</option>
          {BLOG_CATEGORIES.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </div>

      {requestError && <div className="admin-request-error">{requestError}</div>}

      <div className="admin-table-card">
        {loading ? (
          <div className="admin-empty-state">
            <LoaderCircle className="is-spinning" size={25} />
            <h2>Carregando posts</h2>
          </div>
        ) : (
        <table>
          <thead>
            <tr>
              <th>Post</th>
              <th>Categoria</th>
              <th>Autor</th>
              <th>Atualização</th>
              <th>Status</th>
              <th aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map((post) => (
              <tr key={post.id}>
                <td data-label="Post">
                  <div className="admin-content-cell">
                    <div className="admin-content-cell__image">
                      {post.coverImageUrl ? (
                        <img src={post.coverImageUrl} alt="" />
                      ) : (
                        <FileImage size={20} />
                      )}
                    </div>
                    <div>
                      <strong>{post.title}</strong>
                      <span>/{post.slug}</span>
                    </div>
                  </div>
                </td>
                <td data-label="Categoria">
                  <span className="admin-category-badge">
                    {post.category || "Sem categoria"}
                  </span>
                </td>
                <td data-label="Autor">{post.author}</td>
                <td data-label="Atualização">{formatDate(post.updatedAt)}</td>
                <td data-label="Status">
                  <span
                    className={`admin-status admin-status--${post.status.toLowerCase()}`}
                  >
                    {post.status === "PUBLISHED"
                      ? "Publicado"
                      : post.status === "UNPUBLISHED"
                        ? "Oculto"
                        : "Rascunho"}
                  </span>
                </td>
                <td>
                  <div className="admin-row-actions">
                    <button
                      type="button"
                      onClick={() => openEditor(post)}
                      aria-label={`Editar ${post.title}`}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className="is-danger"
                      onClick={() => void deletePost(post)}
                      aria-label={`Excluir ${post.title}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
        {!loading && filteredPosts.length === 0 && (
          <div className="admin-empty-state">
            <Search size={24} />
            <h2>Nenhum post encontrado</h2>
            <p>Ajuste os filtros ou crie um novo conteúdo.</p>
          </div>
        )}
      </div>
    </section>
  );
}
