import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarCheck } from "lucide-react";
import { restaurant } from "@/data/restaurant";
import { Reveal } from "./reveal";
import { createReservation } from "@/lib/api/public";

const schema = z.object({
  name: z.string().trim().min(3, "Informe seu nome completo").max(100),
  phone: z
    .string()
    .trim()
    .min(10, "Informe um telefone válido com DDD")
    .max(20, "Telefone muito longo"),
  people: z.coerce.number().int().min(1, "Mínimo de 1 pessoa").max(40, "Para grupos maiores, ligue para nós"),
  date: z.string().min(1, "Escolha a data"),
  time: z.string().min(1, "Escolha o horário"),
  notes: z.string().trim().max(500, "Máximo de 500 caracteres").optional(),
});

const field =
  "w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-gold";

export function ReservationForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = schema.safeParse(data);

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      toast.error("Confira os campos destacados.");
      return;
    }

    setErrors({});
    setSending(true);
    const r = parsed.data;

    try {
      // Salva a reserva no Supabase
      await createReservation({
        nome: r.name,
        telefone: r.phone,
        email: null,
        data: r.date,
        hora: r.time,
        pessoas: r.people,
        observacoes: r.notes ?? null,
        status: "pending",
      });

      toast.success("Reserva registrada! Nossa equipe confirmará em instantes.");
      event.currentTarget.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar reserva. Tente novamente.");
    } finally {
      setSending(false);
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Reveal className="glass-panel rounded-3xl p-6 sm:p-10">
      <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Nome completo
          </label>
          <input id="name" name="name" className={field} placeholder="Seu nome" maxLength={100} />
          {errors.name ? <p className="mt-2 text-xs text-destructive">{errors.name}</p> : null}
        </div>

        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium">
            Telefone / WhatsApp
          </label>
          <input
            id="phone"
            name="phone"
            inputMode="tel"
            className={field}
            placeholder="(99) 99999-9999"
            maxLength={20}
          />
          {errors.phone ? <p className="mt-2 text-xs text-destructive">{errors.phone}</p> : null}
        </div>

        <div>
          <label htmlFor="people" className="mb-2 block text-sm font-medium">
            Quantidade de pessoas
          </label>
          <input
            id="people"
            name="people"
            type="number"
            min={1}
            max={40}
            defaultValue={2}
            className={field}
          />
          {errors.people ? <p className="mt-2 text-xs text-destructive">{errors.people}</p> : null}
        </div>

        <div>
          <label htmlFor="date" className="mb-2 block text-sm font-medium">
            Data
          </label>
          <input id="date" name="date" type="date" min={today} className={field} />
          {errors.date ? <p className="mt-2 text-xs text-destructive">{errors.date}</p> : null}
        </div>

        <div>
          <label htmlFor="time" className="mb-2 block text-sm font-medium">
            Horário
          </label>
          <input id="time" name="time" type="time" defaultValue="19:30" className={field} />
          {errors.time ? <p className="mt-2 text-xs text-destructive">{errors.time}</p> : null}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="notes" className="mb-2 block text-sm font-medium">
            Observações (opcional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            maxLength={500}
            className={field}
            placeholder="Aniversário, preferência de mesa, área infantil..."
          />
          {errors.notes ? <p className="mt-2 text-xs text-destructive">{errors.notes}</p> : null}
        </div>

        <button
          type="submit"
          disabled={sending}
          className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-70"
          style={{ background: "var(--gradient-ember)" }}
        >
          <CalendarCheck className="h-4 w-4" />
          {sending ? "Enviando..." : "Enviar reserva"}
        </button>

        <p className="sm:col-span-2 text-center text-xs text-muted-foreground">
          A reserva é confirmada por nossa equipe pelo WhatsApp ou telefone {restaurant.phone}.
        </p>
      </form>
    </Reveal>
  );
}
