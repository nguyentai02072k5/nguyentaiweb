"use client";

/**
 * faq-item.tsx — Single FAQ entry với custom AnimatePresence height/opacity.
 *
 * Pattern: Plus icon rotate-45 khi active, content slide xuống với height 0→auto + opacity.
 * A11y: native <button> giữ keyboard nav (Space/Enter), aria-expanded/aria-controls manual,
 * answer panel có role="region" để screen reader announce.
 */

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Plus } from 'lucide-react';
import type { FaqItem } from '@/content/landing';

type FaqItemProps = {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
};

export function FaqAccordionItem({ item, isOpen, onToggle }: FaqItemProps) {
  const shouldReduceMotion = useReducedMotion();
  const panelId = `faq-panel-${item.id}`;
  const buttonId = `faq-button-${item.id}`;

  return (
    <div className="overflow-hidden border-b border-border-default last:border-b-0">
      <button
        id={buttonId}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full cursor-pointer items-center gap-3 px-2 py-4 text-left font-display text-sm font-semibold text-text-primary transition-colors hover:text-brand-violet sm:text-base"
      >
        <Plus
          aria-hidden="true"
          className={`h-5 w-5 shrink-0 text-brand-violet transition-transform duration-300 ease-in-out ${
            isOpen ? 'rotate-45' : 'rotate-0'
          }`}
        />
        <span className="flex-1">{item.question}</span>
      </button>

      <AnimatePresence mode="sync" initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 0.3, ease: 'easeInOut', delay: 0.14 }
            }
          >
            <p className="w-[92%] px-2 pb-4 pt-0 font-body text-sm leading-[1.7] text-text-secondary sm:text-base">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
