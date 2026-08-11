import type { Category, CommentKind, ContactMethod, Kind } from './catalog';

export type PostStatus = 'open' | 'fulfilled' | 'expired' | 'removed';

export type Post = {
  id: string;
  author_id: string;
  kind: Kind;
  category: Category;
  title: string;
  description: string;
  quantity_text: string | null;
  comuna: string | null;
  barrio: string | null;
  address: string | null;
  status: PostStatus;
  warning_count: number;
  created_at: string;
  updated_at: string;
  expires_at: string;
  fulfilled_at: string | null;
};

export type PostContact = {
  post_id: string;
  method: ContactMethod;
  value: string;
  notes: string | null;
};

export type PostComment = {
  id: string;
  post_id: string;
  author_id: string;
  kind: CommentKind;
  body: string;
  created_at: string;
  hidden_at: string | null;
  hidden_by: string | null;
};

/** Comentario con el nombre de quien lo escribió y el saldo de evaluaciones. */
export type CommentWithMeta = PostComment & {
  author_name: string;
  agree_count: number;
  disagree_count: number;
  /** Voto de quien está mirando: `null` si todavía no evaluó. */
  my_vote: boolean | null;
  is_mine: boolean;
};

/** Un aviso en conflicto con sus alertas, como lo ve la vista de moderación. */
export type PostWithWarnings = Post & {
  author_name: string;
  warnings: CommentWithMeta[];
};

/** Lo que muestra el listado público: sin datos de contacto. */
export type FeedPost = Pick<
  Post,
  | 'id'
  | 'kind'
  | 'category'
  | 'title'
  | 'description'
  | 'quantity_text'
  | 'comuna'
  | 'barrio'
  | 'address'
  | 'status'
  | 'warning_count'
  | 'created_at'
>;

export const FEED_COLUMNS =
  'id, kind, category, title, description, quantity_text, comuna, barrio, address, status, warning_count, created_at';
