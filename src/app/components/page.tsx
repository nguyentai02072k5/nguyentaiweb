"use client";

/**
 * /components - shadcn/ui primitives showcase (M1.3 verification).
 * 12 primitives demo với Aurora palette để anh check theme + a11y trước Phase 03+.
 */

import { useState } from "react";
import { toast, Toaster } from "sonner";
import { NavLogo } from "@/components/brand/prod-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const SECTIONS = [
  { id: "buttons", label: "Buttons" },
  { id: "form", label: "Form fields" },
  { id: "cards", label: "Cards" },
  { id: "badges", label: "Badges" },
  { id: "overlays", label: "Dialog + Popover" },
  { id: "calendar", label: "Calendar" },
  { id: "separator", label: "Separator" },
  { id: "skeleton", label: "Skeleton" },
  { id: "toast", label: "Sonner toast" },
  { id: "aurora-styled", label: "🎨 Aurora preview" },
];

export default function ComponentsShowcase() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="min-h-screen">
      <Toaster richColors position="top-right" />

      {/* Sticky nav */}
      <nav className="sticky top-0 z-50 border-b border-border surface-glass">
        <div className="mx-auto max-w-6xl px-6 py-4 flex flex-wrap items-center justify-between gap-2">
          <NavLogo />
          <div className="flex items-center gap-2">
            <div className="hidden md:flex flex-wrap gap-1 text-xs font-display">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="px-3 py-1.5 rounded-full hover:bg-surface-subtle transition-colors text-text-secondary hover:text-brand-violet"
                >
                  {s.label}
                </a>
              ))}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="mx-auto max-w-6xl px-6 pt-12 pb-8">
        <p className="font-display text-label uppercase text-brand-violet mb-3">
          M1.3 · shadcn/ui primitives
        </p>
        <h1 className="font-display text-display-2 mb-4">
          12 primitives với <span className="text-aurora">Aurora palette</span>
        </h1>
        <p className="font-body text-body-lg text-text-secondary max-w-2xl">
          Anh test từng primitive - focus vào colors (primary/secondary/muted),
          radius, focus ring, hover states. Có vấn đề gì báo em adjust theme.
        </p>
      </header>

      {/* ──────────────  BUTTONS  ────────────── */}
      <Section id="buttons" title="1 · Buttons" sub="6 variants × 4 sizes">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3 items-center">
            <Button>Default (primary)</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link style</Button>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="icon button">
              ✦
            </Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </Section>

      {/* ──────────────  FORM  ────────────── */}
      <Section id="form" title="2 · Form fields" sub="Input + Label">
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại Zalo</Label>
            <Input id="phone" type="tel" placeholder="0xxx xxx xxx" />
            <p className="text-body-sm text-text-tertiary">
              Tôi sẽ liên hệ Zalo xác nhận lịch
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (tùy chọn)</Label>
            <Input id="email" type="email" placeholder="email@example.com" />
            <p className="text-body-sm text-text-tertiary">
              Để gửi calendar invite
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="invalid">Validate state (aria-invalid)</Label>
            <Input
              id="invalid"
              aria-invalid
              defaultValue="invalid@bad"
              placeholder="Email lỗi"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="disabled">Disabled state</Label>
            <Input id="disabled" disabled placeholder="Không nhập được" />
          </div>
        </div>
      </Section>

      {/* ──────────────  CARDS  ────────────── */}
      <Section id="cards" title="3 · Cards" sub="Header + content + footer + action">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot AI Tư vấn</CardTitle>
              <CardDescription>
                Hiểu ngữ cảnh, tự tư vấn theo ngành, chốt đơn tự động.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-body-sm">
                <li>✓ Tự tư vấn 24/7</li>
                <li>✓ Nhận diện hình ảnh</li>
                <li>✓ Dễ tinh chỉnh</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Tìm hiểu thêm
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Card with action</CardTitle>
              <CardDescription>Action ở góc phải header</CardDescription>
              <CardAction>
                <Button size="sm" variant="ghost">
                  Edit
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <p className="text-body-sm text-text-secondary">
                Card body text - Be Vietnam Pro với dấu tiếng Việt: ợ ự ỡ ặ ẫ.
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* ──────────────  BADGES  ────────────── */}
      <Section id="badges" title="4 · Badges" sub="4 variants">
        <div className="flex flex-wrap gap-3 items-center">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge>✨ Hot</Badge>
          <Badge variant="secondary">20 phút demo</Badge>
        </div>
      </Section>

      {/* ──────────────  DIALOG + POPOVER  ────────────── */}
      <Section
        id="overlays"
        title="5 · Dialog + Popover"
        sub="Click triggers để test overlay, focus trap, ESC close"
      >
        <div className="flex flex-wrap gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xác nhận đặt lịch</DialogTitle>
                <DialogDescription>
                  Anh/chị xác nhận đặt Meet 1-1 vào T2 11/05 - 14:00 (20 phút) qua
                  Google Meet?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Hủy</Button>
                </DialogClose>
                <Button>Xác nhận</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Open Popover</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-display font-semibold">
                  Slot details
                </h4>
                <p className="text-body-sm text-text-secondary">
                  Bookings tại 14:00 sẽ block các slots 14:30, 15:00, 15:30 trong
                  cùng ngày (rule 2h forward).
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </Section>

      {/* ──────────────  CALENDAR  ────────────── */}
      <Section id="calendar" title="6 · Calendar" sub="Inline date picker (sẽ dùng cho booking)">
        <div className="rounded-xl border border-border bg-card p-4 inline-block">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md"
          />
        </div>
        <p className="text-body-sm text-text-tertiary mt-3">
          Selected:{" "}
          <code className="font-mono">
            {date ? date.toLocaleDateString("vi-VN") : "none"}
          </code>
        </p>
      </Section>

      {/* ──────────────  SEPARATOR  ────────────── */}
      <Section id="separator" title="7 · Separator" sub="Horizontal + vertical">
        <div className="space-y-3">
          <p className="text-body-sm">Section A</p>
          <Separator />
          <p className="text-body-sm">Section B</p>
        </div>
        <div className="flex h-12 items-center gap-4 mt-6">
          <span>Item 1</span>
          <Separator orientation="vertical" />
          <span>Item 2</span>
          <Separator orientation="vertical" />
          <span>Item 3</span>
        </div>
      </Section>

      {/* ──────────────  SKELETON  ────────────── */}
      <Section id="skeleton" title="8 · Skeleton" sub="Loading placeholders">
        <div className="space-y-4 max-w-md">
          <div className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </Section>

      {/* ──────────────  SONNER TOAST  ────────────── */}
      <Section
        id="toast"
        title="9 · Sonner toast"
        sub="Notifications - replace shadcn legacy toast"
      >
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => toast.success("Đã đặt lịch thành công!")}>
            Success toast
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.info("Tôi sẽ liên hệ Zalo xác nhận trong ít phút.")
            }
          >
            Info toast
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              toast.error("Slot đã có người đặt - chọn giờ khác giúp tôi.")
            }
          >
            Error toast
          </Button>
        </div>
      </Section>

      {/* ──────────────  AURORA-STYLED COMPARISON  ────────────── */}
      <Section
        id="aurora-styled"
        title="10 · Raw shadcn vs Aurora-styled (Phase 03+ preview)"
        sub="Mọi thứ ở trên chỉ là baseline shadcn với Aurora colors. Phase 03+ em layer thêm gradient + glow + animations + Space Grotesk display font + sketch decorations."
      >
        <div className="grid md:grid-cols-2 gap-10">
          {/* Button comparison */}
          <div>
            <p className="font-mono text-xs text-text-tertiary mb-4">
              ▸ BUTTON
            </p>
            <div className="space-y-6">
              <div>
                <p className="text-body-sm text-text-secondary mb-3">
                  Raw shadcn (current):
                </p>
                <Button>Đặt lịch Meet 1-1</Button>
              </div>
              <div>
                <p className="text-body-sm text-brand-violet font-semibold mb-3">
                  → Aurora-styled (Phase 03+):
                </p>
                <button
                  type="button"
                  className="group relative isolate overflow-hidden rounded-full bg-aurora animate-aurora bg-[length:200%_200%] px-8 py-4 font-display font-semibold text-white shadow-glow-violet hover:shadow-glow-pink hover:scale-105 transition-all duration-base"
                >
                  <span className="relative z-10">Đặt lịch Meet 1-1 →</span>
                  {/* Shine sweep - diagonal skew, white/25 (tinh tế), 1s ease-out */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-1/3 z-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-0 group-hover:translate-x-[450%] transition-transform duration-1000 ease-out"
                  />
                </button>
                <p className="font-mono text-xs text-text-tertiary mt-2">
                  + bg-aurora animated · shadow-glow-violet/pink · shine sweep
                  diagonal · Space Grotesk · radius full · hover scale 1.05
                </p>
                <p className="font-mono text-xs text-text-tertiary mt-1 italic">
                  Hover button trên - ánh sáng chéo trắng quét trái → phải 1s
                </p>
              </div>
            </div>
          </div>

          {/* Card comparison */}
          <div>
            <p className="font-mono text-xs text-text-tertiary mb-4">▸ CARD</p>
            <div className="space-y-6">
              <div>
                <p className="text-body-sm text-text-secondary mb-3">
                  Raw shadcn (current):
                </p>
                <Card>
                  <CardHeader>
                    <CardTitle>Chatbot AI Tư vấn</CardTitle>
                    <CardDescription>
                      Title nhỏ, padding cơ bản, không có icon hay glow.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <div>
                <p className="text-body-sm text-brand-violet font-semibold mb-3">
                  → Aurora-styled (Phase 03+):
                </p>
                <div className="group relative rounded-2xl bg-card border border-border p-8 hover:-translate-y-1 hover:shadow-glow-violet transition-all duration-base cursor-pointer">
                  <div className="size-14 rounded-xl bg-gradient-to-br from-brand-violet to-brand-pink flex items-center justify-center text-2xl mb-4 shadow-md group-hover:scale-110 transition-transform duration-base">
                    💬
                  </div>
                  <h3 className="font-display text-h-2 mb-2">
                    <span className="relative inline-block">
                      Chatbot AI Tư vấn
                      <svg
                        aria-hidden
                        className="absolute left-0 -bottom-1 w-full"
                        viewBox="0 0 200 8"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M 5 4 C 50 0, 100 8, 195 3"
                          stroke="url(#cardUnderline)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          fill="none"
                        />
                        <defs>
                          <linearGradient
                            id="cardUnderline"
                            x1="0"
                            x2="1"
                            y1="0"
                            y2="0"
                          >
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </span>
                  </h3>
                  <p className="font-body text-body-sm text-text-secondary mb-4">
                    Hiểu ngữ cảnh, tự tư vấn 24/7, nhận diện hình sản phẩm.
                  </p>
                  <ul className="space-y-2 text-body-sm">
                    <li className="flex gap-2">
                      <span className="text-brand-violet shrink-0">✓</span>{" "}
                      Tự tư vấn 24/7
                    </li>
                    <li className="flex gap-2">
                      <span className="text-brand-pink shrink-0">✓</span>{" "}
                      Nhận diện hình ảnh
                    </li>
                    <li className="flex gap-2">
                      <span className="text-brand-indigo shrink-0">✓</span>{" "}
                      Dễ tinh chỉnh
                    </li>
                  </ul>
                </div>
                <p className="font-mono text-xs text-text-tertiary mt-2">
                  + radius 2xl · gradient icon chip · h-2 display title · F1 sketch underline · hover lift + glow violet · padding 8 · 3 bullet với accent màu xen kẽ
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-surface-subtle border border-border p-5 text-body-sm font-body">
          <p className="font-display font-semibold text-text-primary mb-2">
            💡 Ý nghĩa khác biệt
          </p>
          <ul className="space-y-1 text-text-secondary">
            <li>
              • <strong>Raw shadcn</strong> = primitive accessible với đúng tone
              màu Aurora - base sạch để build lên
            </li>
            <li>
              • <strong>Aurora-styled</strong> = layer custom thêm gradient, glow,
              animations, decorations - đó là &ldquo;production look&rdquo; sẽ render ở
              landing page thật
            </li>
            <li>
              • Em luôn tái sử dụng shadcn làm base (a11y free, focus trap,
              keyboard nav...) rồi style thêm trên - không build lại từ đầu
            </li>
          </ul>
        </div>
      </Section>

      <footer className="mx-auto max-w-6xl px-6 py-12 mt-12 border-t border-border text-center text-body-sm font-body text-text-tertiary">
        12 primitives đã wire với Aurora theme + comparison example - anh check
        OK để sang M1.4
      </footer>
    </div>
  );
}

function Section({
  id,
  title,
  sub,
  children,
}: {
  id: string;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="mx-auto max-w-6xl px-6 py-12 border-t border-border scroll-mt-20"
    >
      <h2 className="font-display text-h-1 mb-1">{title}</h2>
      <p className="font-body text-body-sm text-text-secondary mb-6">{sub}</p>
      {children}
    </section>
  );
}
