'use client';

import { createElement, forwardRef } from 'react';
import * as elements from '@cristal/core/dist/components';
import * as generated from './generated/components.js';

export type * from './generated/components.js';

const dashed = (name: string) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
const primitive = (value: unknown) => ['string', 'number', 'boolean'].includes(typeof value);

// @lit/react only sets Stencil props from a client effect, so the server HTML would carry none of them and
// the element would upgrade with its defaults until hydration. On the server, render the tag with its props as attributes.
const withAttributes = <T>(Component: T, element: object): T => {
  if (typeof window !== 'undefined') return Component;
  const { is: tag, observedAttributes } = element as { is: string; observedAttributes: string[] };
  const observed = new Set(observedAttributes);
  return forwardRef<unknown, Record<string, unknown>>(({ className, ...props }, _ref) => {
    const attributes: Record<string, unknown> = { class: className ?? props.class };
    for (const [key, value] of Object.entries(props)) {
      if (!observed.has(dashed(key))) attributes[key] = value;
      else if (primitive(value)) attributes[dashed(key)] = value;
    }
    return createElement(tag, attributes);
  }) as T;
};

export const CrAccordion = withAttributes(generated.CrAccordion, elements.CrAccordion);
export const CrAccordionItem = withAttributes(generated.CrAccordionItem, elements.CrAccordionItem);
export const CrBox = withAttributes(generated.CrBox, elements.CrBox);
export const CrButton = withAttributes(generated.CrButton, elements.CrButton);
export const CrIconButton = withAttributes(generated.CrIconButton, elements.CrIconButton);
export const CrCard = withAttributes(generated.CrCard, elements.CrCard);
export const CrCardInput = withAttributes(generated.CrCardInput, elements.CrCardInput);
export const CrCheckbox = withAttributes(generated.CrCheckbox, elements.CrCheckbox);
export const CrGridLayout = withAttributes(generated.CrGridLayout, elements.CrGridLayout);
export const CrDialog = withAttributes(generated.CrDialog, elements.CrDialog);
export const CrDrawer = withAttributes(generated.CrDrawer, elements.CrDrawer);
export const CrInput = withAttributes(generated.CrInput, elements.CrInput);
export const CrMenu = withAttributes(generated.CrMenu, elements.CrMenu);
export const CrOtp = withAttributes(generated.CrOtp, elements.CrOtp);
export const CrSelect = withAttributes(generated.CrSelect, elements.CrSelect);
export const CrSearch = withAttributes(generated.CrSearch, elements.CrSearch);
export const CrSegmented = withAttributes(generated.CrSegmented, elements.CrSegmented);
export const CrStep = withAttributes(generated.CrStep, elements.CrStep);
export const CrStepper = withAttributes(generated.CrStepper, elements.CrStepper);
export const CrTable = withAttributes(generated.CrTable, elements.CrTable);
export const CrTagInput = withAttributes(generated.CrTagInput, elements.CrTagInput);
export const CrTextarea = withAttributes(generated.CrTextarea, elements.CrTextarea);
export const CrGridItem = withAttributes(generated.CrGridItem, elements.CrGridItem);
export const CrImage = withAttributes(generated.CrImage, elements.CrImage);
export const CrLoader = withAttributes(generated.CrLoader, elements.CrLoader);
export const CrProgress = withAttributes(generated.CrProgress, elements.CrProgress);
export const CrProgressSteps = withAttributes(generated.CrProgressSteps, elements.CrProgressSteps);
export const CrSkeleton = withAttributes(generated.CrSkeleton, elements.CrSkeleton);
export const CrToaster = withAttributes(generated.CrToaster, elements.CrToaster);
export const CrSwitch = withAttributes(generated.CrSwitch, elements.CrSwitch);
export const CrRadioGroup = withAttributes(generated.CrRadioGroup, elements.CrRadioGroup);
export const CrTabPanel = withAttributes(generated.CrTabPanel, elements.CrTabPanel);
export const CrTooltip = withAttributes(generated.CrTooltip, elements.CrTooltip);
export const CrPopover = withAttributes(generated.CrPopover, elements.CrPopover);
export const CrSlider = withAttributes(generated.CrSlider, elements.CrSlider);
export const CrFileUpload = withAttributes(generated.CrFileUpload, elements.CrFileUpload);
export const CrDatePicker = withAttributes(generated.CrDatePicker, elements.CrDatePicker);
export const CrRating = withAttributes(generated.CrRating, elements.CrRating);
export const CrAvatar = withAttributes(generated.CrAvatar, elements.CrAvatar);
export const CrAvatarGroup = withAttributes(generated.CrAvatarGroup, elements.CrAvatarGroup);
export const CrBadge = withAttributes(generated.CrBadge, elements.CrBadge);
export const CrBackground = withAttributes(generated.CrBackground, elements.CrBackground);
export const CrThemeToggle = withAttributes(generated.CrThemeToggle, elements.CrThemeToggle);
export const CrAlert = withAttributes(generated.CrAlert, elements.CrAlert);
export const CrEmptyState = withAttributes(generated.CrEmptyState, elements.CrEmptyState);
export const CrSparkline = withAttributes(generated.CrSparkline, elements.CrSparkline);
export const CrNumber = withAttributes(generated.CrNumber, elements.CrNumber);
export const CrPagination = withAttributes(generated.CrPagination, elements.CrPagination);
export const CrBreadcrumb = withAttributes(generated.CrBreadcrumb, elements.CrBreadcrumb);
export const CrCommandPalette = withAttributes(generated.CrCommandPalette, elements.CrCommandPalette);
