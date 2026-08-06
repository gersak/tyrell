export const fileUploadStyles = `
:host {
  display: block;
  font-family: var(--ty-font-sans);
  width: 100%;
}

.file-upload-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

/* ===== LABEL ===== */

.upload-label {
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  font-weight: var(--ty-font-medium);
  color: var(--ty-label-color);
  margin-bottom: 6px;
  padding-left: 4px;
  display: flex;
  align-items: center;
}

.required-icon {
  color: var(--ty-color-danger);
  margin-left: 4px;
  font-size: 0.75rem;
  line-height: 1;
}

/* ===== DROP ZONE ===== */

.drop-zone {
  border: 2px dashed var(--ty-border);
  border-radius: var(--ty-radius-base);
  padding: 2rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: var(--ty-local-transition, border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease);
  outline: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 140px;
  user-select: none;
}

.drop-zone:hover:not(.disabled) {
  border-color: var(--ty-input-border-hover);
  background: var(--ty-surface-content);
}

.drop-zone.focused {
  border-color: var(--ty-input-border-focus);
  box-shadow: 0 0 0 3px var(--ty-input-shadow-focus);
}

.drop-zone.drag-active {
  border-color: var(--ty-color-primary);
  border-style: solid;
  background: var(--ty-bg-primary-);
}

.drop-zone.drag-active .upload-icon {
  color: var(--ty-color-primary);
  transform: translateY(-2px);
}

.drop-zone.has-files {
  min-height: 80px;
  padding: 1.25rem 1.5rem;
}

.drop-zone.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.drop-zone.error {
  border-color: var(--ty-color-danger);
}

.drop-zone.error:not(.disabled) {
  background: var(--ty-bg-danger-);
}

/* ===== UPLOAD ICON ===== */

.upload-icon {
  color: var(--ty-text-faint);
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--ty-local-transition, color 0.15s ease, transform 0.15s ease);
  pointer-events: none;
}

.upload-icon svg {
  width: 100%;
  height: 100%;
}

/* ===== HINT TEXT ===== */

.upload-hint {
  color: var(--ty-text-soft);
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  pointer-events: none;
}

.browse-link {
  color: var(--ty-color-primary);
  font-weight: var(--ty-font-medium);
}

.upload-sub-hint {
  color: var(--ty-text-faint);
  font-size: var(--ty-font-xs);
  line-height: var(--ty-leading-xs);
  pointer-events: none;
}

/* ===== FILE LIST ===== */

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-top: 0.5rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--ty-radius-base);
  background: var(--ty-surface-content);
  border: 1px solid var(--ty-border-soft);
}

.file-icon {
  color: var(--ty-text-faint);
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
}

.file-icon svg {
  width: 100%;
  height: 100%;
}

.file-name {
  flex: 1;
  font-size: var(--ty-font-sm);
  color: var(--ty-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.file-size {
  font-size: var(--ty-font-xs);
  color: var(--ty-text-faint);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.file-remove {
  flex-shrink: 0;
  cursor: pointer;
  color: var(--ty-text-faint);
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: var(--ty-local-transition, color 0.15s ease, background-color 0.15s ease);
  border: none;
  background: none;
  padding: 0;
  outline: none;
}

.file-remove:hover {
  color: var(--ty-color-danger);
  background: var(--ty-bg-danger-);
}

.file-remove:focus-visible {
  box-shadow: 0 0 0 2px var(--ty-color-danger);
}

.file-remove svg {
  width: 12px;
  height: 12px;
}

/* ===== ERROR MESSAGE ===== */

.error-message {
  font-size: var(--ty-font-xs);
  line-height: var(--ty-leading-xs);
  color: var(--ty-color-danger);
  margin-top: 4px;
  padding-left: 4px;
}

/* ===== ACCESSIBILITY ===== */

@media (prefers-reduced-motion: reduce) {
  .drop-zone,
  .upload-icon,
  .file-remove {
    transition: none;
  }
}

@media (prefers-contrast: high) {
  .drop-zone {
    border-width: 3px;
  }
}
`
