import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Upload, Star } from "lucide-react";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/api/catalog";
import { fetchCategories } from "@/lib/api/catalog";
import { uploadFile } from "@/lib/api/storage";
import { createLog } from "@/lib/api/admin";
import type { Product, Category } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/admin/produtos")({
  head: () => ({ meta: [{ title: "Produtos — Formosa Grill Admin" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      toast.error("Erro ao carregar produtos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = products.filter(
    (p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      (p.descricao ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (data: Partial<Product>, id?: string) => {
    try {
      if (id) {
        await updateProduct(id, data);
        await createLog({ action: "Produto atualizado", entity: "products", entityId: id, details: data });
        toast.success("Produto atualizado!");
      } else {
        const created = await createProduct(data);
        await createLog({ action: "Produto criado", entity: "products", entityId: created.id, details: data });
        toast.success("Produto criado!");
      }
      setDialogOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      toast.error("Erro ao salvar produto.");
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este produto?")) return;
    try {
      await deleteProduct(id);
      await createLog({ action: "Produto excluído", entity: "products", entityId: id });
      toast.success("Produto excluído!");
      await load();
    } catch (err) {
      toast.error("Erro ao excluir produto.");
      console.error(err);
    }
  };

  const toggleDisponivel = async (p: Product) => {
    try {
      await updateProduct(p.id, { disponivel: !p.disponivel });
      setProducts((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, disponivel: !x.disponivel } : x))
      );
    } catch (err) {
      toast.error("Erro ao atualizar.");
      console.error(err);
    }
  };

  const toggleDestaque = async (p: Product) => {
    try {
      await updateProduct(p.id, { destaque: !p.destaque });
      setProducts((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, destaque: !x.destaque } : x))
      );
    } catch (err) {
      toast.error("Erro ao atualizar.");
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">Produtos</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Produto
            </Button>
          </DialogTrigger>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Editar Produto" : "Novo Produto"}</DialogTitle>
              </DialogHeader>
              <ProductForm
                product={editing}
                categories={categories}
                onSave={handleSave}
                onCancel={() => { setDialogOpen(false); setEditing(null); }}
              />
            </DialogContent>
          </Dialog>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar produtos…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="text-muted-foreground">Carregando…</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left font-semibold">Imagem</th>
                <th className="p-3 text-left font-semibold">Nome</th>
                <th className="p-3 text-left font-semibold">Categoria</th>
                <th className="p-3 text-left font-semibold">Preço</th>
                <th className="p-3 text-center font-semibold">Destaque</th>
                <th className="p-3 text-center font-semibold">Disponível</th>
                <th className="p-3 text-center font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3">
                    {p.imagem ? (
                      <img src={p.imagem} alt={p.nome} className="h-12 w-12 rounded-lg object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-muted" />
                    )}
                  </td>
                  <td className="p-3 font-medium">{p.nome}</td>
                  <td className="p-3 text-muted-foreground">
                    {categories.find((c) => c.id === p.categoria)?.nome ?? "—"}
                  </td>
                  <td className="p-3">
                    {p.preco ? Number(p.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"}
                  </td>
                  <td className="p-3 text-center">
                    <button onClick={() => toggleDestaque(p)}>
                      <Star className={`mx-auto h-4 w-4 ${p.destaque ? "fill-gold text-gold" : "text-muted-foreground"}`} />
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    <Switch checked={p.disponivel} onCheckedChange={() => toggleDisponivel(p)} />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => { setEditing(p); setDialogOpen(true); }}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ProductForm({
  product,
  categories,
  onSave,
  onCancel,
}: {
  product: Product | null;
  categories: Category[];
  onSave: (data: Partial<Product>, id?: string) => void;
  onCancel: () => void;
}) {
  const [nome, setNome] = useState(product?.nome ?? "");
  const [descricao, setDescricao] = useState(product?.descricao ?? "");
  const [preco, setPreco] = useState(product?.preco?.toString() ?? "");
  const [categoria, setCategoria] = useState(product?.categoria ?? "");
  const [imagem, setImagem] = useState(product?.imagem ?? "");
  const [destaque, setDestaque] = useState(product?.destaque ?? false);
  const [disponivel, setDisponivel] = useState(product?.disponivel ?? true);
  const [ordem, setOrdem] = useState(product?.ordem?.toString() ?? "0");
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile("PRODUCTS", file);
      setImagem(url);
      toast.success("Imagem enviada!");
    } catch (err) {
      toast.error("Erro no upload.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(
      {
        nome,
        descricao: descricao || null,
        preco: preco ? parseFloat(preco) : null,
        categoria: categoria || null,
        imagem: imagem || null,
        destaque,
        disponivel,
        ordem: parseInt(ordem) || 0,
      },
      product?.id
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="nome">Nome *</Label>
          <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="preco">Preço</Label>
          <Input id="preco" type="number" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} />
        </div>
      </div>

      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Categoria</Label>
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="ordem">Ordem</Label>
          <Input id="ordem" type="number" value={ordem} onChange={(e) => setOrdem(e.target.value)} />
        </div>
      </div>

      <div>
        <Label>Imagem</Label>
        <div className="flex items-center gap-4">
          {imagem && <img src={imagem} alt="Preview" className="h-20 w-20 rounded-lg border border-border object-cover" />}
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent">
            <Upload className="h-4 w-4" />
            {uploading ? "Enviando…" : "Upload"}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={destaque} onCheckedChange={setDestaque} />
          Destaque
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={disponivel} onCheckedChange={setDisponivel} />
          Disponível
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{product ? "Salvar" : "Criar"}</Button>
      </div>
    </form>
  );
}
