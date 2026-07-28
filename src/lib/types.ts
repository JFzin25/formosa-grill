export type Role = "admin" | "manager" | "employee";

export interface Profile {
  id: string;
  email: string;
  nome: string | null;
  telefone: string | null;
  avatar: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
  active: boolean;
}

export interface AuthorizedEmail {
  id: string;
  email: string;
  role: Role;
  created_at: string;
  authorized_by: string | null;
  status: "active" | "inactive";
}

export interface Category {
  id: string;
  nome: string;
  ordem: number;
  ativa: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  categoria: string | null;
  nome: string;
  descricao: string | null;
  preco: number | null;
  imagem: string | null;
  destaque: boolean;
  disponivel: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryItem {
  id: string;
  titulo: string | null;
  imagem: string | null;
  ordem: number;
  ativo: boolean;
  created_at: string;
}

export interface Banner {
  id: string;
  titulo: string | null;
  subtitulo: string | null;
  imagem: string | null;
  botao: string | null;
  link: string | null;
  ativo: boolean;
  ordem: number;
  created_at: string;
}

export interface Reservation {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  data: string;
  hora: string;
  pessoas: number;
  observacoes: string | null;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
}

export interface Contact {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  mensagem: string | null;
  lida: boolean;
  created_at: string;
}

export interface Settings {
  id: string;
  logo: string | null;
  telefone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  endereco: string | null;
  mapa_url: string | null;
  horario: string | null;
  email: string | null;
  cor_primaria: string | null;
  cor_secundaria: string | null;
  created_at: string;
  updated_at: string;
}

export interface LogEntry {
  id: string;
  user_id: string | null;
  user_email: string | null;
  acao: string;
  entidade: string | null;
  entidade_id: string | null;
  detalhes: Record<string, unknown> | null;
  ip: string | null;
  navegador: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  nome: string;
  stars: number;
  text: string | null;
  approved: boolean;
  created_at: string;
}
