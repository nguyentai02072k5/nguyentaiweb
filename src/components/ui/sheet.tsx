"use client"

/**
 * sheet.tsx — Drawer trượt từ CẠNH màn hình (RT-9 / RT2-3).
 *
 * KHÔNG copy dialog.tsx: dialog cho modal-GIỮA (translate -50%), còn Sheet là
 * drawer dính cạnh (inset-y-0). Dùng chung Radix `Dialog` primitive để có sẵn
 * focus-trap + Esc + aria-modal, nhưng bố cục + animation là slide-cạnh.
 *
 * QUAN TRỌNG: KHÔNG dùng Portal. Content render INLINE trong cây React để token
 * scope `.course-app` (var(--surface)/var(--ink)/var(--border)) cascade xuống
 * được — Portal về document.body sẽ nằm NGOÀI scope, mất màu teal-dark.
 * Focus-trap + overlay fixed vẫn hoạt động bình thường không cần Portal.
 */

import * as React from "react"
import { XIcon } from "lucide-react"
import { Dialog as SheetPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/60 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

const SIDE_CLASSES = {
  left: "inset-y-0 left-0 h-full border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
  right:
    "inset-y-0 right-0 h-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
} as const

function SheetContent({
  className,
  children,
  side = "left",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: keyof typeof SIDE_CLASSES
  showCloseButton?: boolean
}) {
  return (
    // Không Portal (xem doc đầu file): render inline để giữ scope .course-app.
    <>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex w-[85vw] max-w-sm flex-col gap-4 p-5 shadow-lg outline-none",
          "duration-300 ease-out data-[state=closed]:animate-out data-[state=open]:animate-in",
          SIDE_CLASSES[side],
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            aria-label="Đóng"
            className="absolute top-4 right-4 rounded-md opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current [&_svg]:size-5"
          >
            <XIcon />
            <span className="sr-only">Đóng</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-base font-semibold", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm opacity-70", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
}
