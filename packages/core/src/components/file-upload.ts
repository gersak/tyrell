/**
 * TyFileUpload Web Component — drop zone + file picker primitive. Replaces
 * `<input type="file">` with a styleable, drag-and-drop-capable equivalent.
 * Form-associated: participates in FormData and form.reset().
 */

import { TyComponent } from "../base/ty-component.js";
import type { PropertyChange } from "../utils/property-manager.js";
import { ensureStyles } from "../utils/styles.js";
import { fileUploadStyles } from "../styles/file-upload.js";

interface FileUploadState {
  listenersSetup: boolean;
}

export interface TyFileUploadElement extends HTMLElement {
  multiple: boolean;
  accept: string;
  name: string;
  disabled: boolean;
  required: boolean;
  label: string;
  placeholder: string;
  error: string;
  files: File[];
  form: HTMLFormElement | null;
}

const UPLOAD_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`;

const FILE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;

const X_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

export class TyFileUpload
  extends TyComponent<FileUploadState>
  implements TyFileUploadElement
{
  static formAssociated = true;

  protected static properties = {
    multiple: {
      type: "boolean" as const,
      visual: true,
      default: false,
    },
    accept: {
      type: "string" as const,
      visual: true,
      default: "",
    },
    name: {
      type: "string" as const,
      default: "",
    },
    disabled: {
      type: "boolean" as const,
      visual: true,
      default: false,
    },
    required: {
      type: "boolean" as const,
      visual: true,
      default: false,
    },
    label: {
      type: "string" as const,
      visual: true,
      default: "",
    },
    placeholder: {
      type: "string" as const,
      visual: true,
      default: "Drop files here or click to browse",
    },
    error: {
      type: "string" as const,
      visual: true,
      default: "",
    },
  };

  private _files: File[] = [];
  private _isDragging: boolean = false;
  private _listenersSetup: boolean = false;

  private _dropZoneClickHandler: ((e: Event) => void) | null = null;
  private _dropZoneKeydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private _dropZoneFocusHandler: (() => void) | null = null;
  private _dropZoneBlurHandler: (() => void) | null = null;
  private _dragoverHandler: ((e: DragEvent) => void) | null = null;
  private _dragleaveHandler: ((e: DragEvent) => void) | null = null;
  private _dropHandler: ((e: DragEvent) => void) | null = null;
  private _inputChangeHandler: ((e: Event) => void) | null = null;

  constructor() {
    super();
    ensureStyles(this.shadowRoot!, { css: fileUploadStyles, id: "ty-file-upload" });
  }

  protected onConnect(): void {}

  protected onDisconnect(): void {
    this.removeEventListeners();
  }

  protected onPropertiesChanged(_changes: PropertyChange[]): void {}

  protected onFormReset(): void {
    this._files = [];
    this.updateFormValue();
    if (this._connected) this.render();

    const fileInput = this.shadowRoot?.querySelector(
      ".file-input",
    ) as HTMLInputElement | null;
    if (fileInput) fileInput.value = "";
  }

  protected getFormValue(): FormData | string | null {
    // Native fidelity: an unnamed control is excluded from submission.
    if (this._files.length === 0 || !this.name) return null;
    const fd = new FormData();
    for (const file of this._files) {
      fd.append(this.name, file);
    }
    return fd;
  }

  /**
   * Match a file against the `accept` attribute the way native inputs do:
   * comma-separated list of `.ext`, `type/subtype` or `type/*` entries.
   * No/blank accept matches everything.
   */
  private matchesAccept(file: File): boolean {
    const accept = this.accept?.trim();
    if (!accept) return true;
    return accept.split(",").some((raw) => {
      const entry = raw.trim().toLowerCase();
      if (!entry) return false;
      if (entry.startsWith(".")) return file.name.toLowerCase().endsWith(entry);
      const type = file.type.toLowerCase();
      if (entry.endsWith("/*")) return type.startsWith(entry.slice(0, -1));
      return type === entry;
    });
  }

  get files(): File[] {
    return [...this._files];
  }

  get multiple(): boolean {
    return this.getProperty("multiple");
  }
  set multiple(v: boolean) {
    this.setProperty("multiple", v);
  }

  get accept(): string {
    return this.getProperty("accept");
  }
  set accept(v: string) {
    this.setProperty("accept", v);
  }

  get name(): string {
    return this.getProperty("name");
  }
  set name(v: string) {
    this.setProperty("name", v);
  }

  get disabled(): boolean {
    return this.getProperty("disabled");
  }
  set disabled(v: boolean) {
    this.setProperty("disabled", v);
  }

  get required(): boolean {
    return this.getProperty("required");
  }
  set required(v: boolean) {
    this.setProperty("required", v);
  }

  get label(): string {
    return this.getProperty("label");
  }
  set label(v: string) {
    this.setProperty("label", v);
  }

  get placeholder(): string {
    return this.getProperty("placeholder");
  }
  set placeholder(v: string) {
    this.setProperty("placeholder", v);
  }

  get error(): string {
    return this.getProperty("error");
  }
  set error(v: string) {
    this.setProperty("error", v);
  }

  get form(): HTMLFormElement | null {
    return this._internals.form;
  }

  private setFiles(newFiles: File[]): void {
    this._files = this.multiple ? newFiles : newFiles.slice(0, 1);
    this.updateFormValue();
    this.render();

    const detail = {
      value: this._files,
      files: this._files,
      names: this._files.map((f) => f.name),
    };

    setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent("change", { detail, bubbles: true, composed: true }),
      );
    }, 0);
  }

  private removeFile(index: number): void {
    const updated = [...this._files];
    updated.splice(index, 1);
    this.setFiles(updated);

    const fileInput = this.shadowRoot?.querySelector(
      ".file-input",
    ) as HTMLInputElement | null;
    if (fileInput) fileInput.value = "";
  }

  private setupEventListeners(): void {
    if (this._listenersSetup) return;
    const shadow = this.shadowRoot!;
    const dropZone = shadow.querySelector(".drop-zone") as HTMLElement;
    const fileInput = shadow.querySelector(".file-input") as HTMLInputElement;

    this._dropZoneClickHandler = (e: Event) => {
      if (this.disabled) return;
      if ((e.target as HTMLElement).closest(".file-remove")) return;
      fileInput.click();
    };

    this._dropZoneKeydownHandler = (e: KeyboardEvent) => {
      if (this.disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fileInput.click();
      }
    };

    this._dropZoneFocusHandler = () => {
      dropZone.classList.add("focused");
    };

    this._dropZoneBlurHandler = () => {
      dropZone.classList.remove("focused");
    };

    this._dragoverHandler = (e: DragEvent) => {
      if (this.disabled) return;
      e.preventDefault();
      e.stopPropagation();
      if (!this._isDragging) {
        this._isDragging = true;
        dropZone.classList.add("drag-active");
      }
    };

    this._dragleaveHandler = (e: DragEvent) => {
      if (!dropZone.contains(e.relatedTarget as Node)) {
        this._isDragging = false;
        dropZone.classList.remove("drag-active");
      }
    };

    this._dropHandler = (e: DragEvent) => {
      if (this.disabled) return;
      e.preventDefault();
      e.stopPropagation();
      this._isDragging = false;
      dropZone.classList.remove("drag-active");
      // The native picker filters by `accept`, but drag-and-drop bypasses the
      // dialog entirely — apply the same filter here (native inputs do too).
      const files = Array.from(e.dataTransfer?.files ?? []).filter((f) =>
        this.matchesAccept(f),
      );
      if (files.length > 0) this.setFiles(files);
    };

    this._inputChangeHandler = (e: Event) => {
      const input = e.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        this.setFiles(Array.from(input.files));
      }
    };

    dropZone.addEventListener("click", this._dropZoneClickHandler);
    dropZone.addEventListener(
      "keydown",
      this._dropZoneKeydownHandler as EventListener,
    );
    dropZone.addEventListener("focus", this._dropZoneFocusHandler);
    dropZone.addEventListener("blur", this._dropZoneBlurHandler);
    dropZone.addEventListener(
      "dragover",
      this._dragoverHandler as EventListener,
    );
    dropZone.addEventListener(
      "dragleave",
      this._dragleaveHandler as EventListener,
    );
    dropZone.addEventListener("drop", this._dropHandler as EventListener);
    fileInput.addEventListener("change", this._inputChangeHandler);

    this._listenersSetup = true;
  }

  private removeEventListeners(): void {
    if (!this._listenersSetup) return;
    const shadow = this.shadowRoot;
    if (!shadow) return;

    const dropZone = shadow.querySelector(".drop-zone");
    const fileInput = shadow.querySelector(".file-input");
    if (!dropZone || !fileInput) return;

    if (this._dropZoneClickHandler)
      dropZone.removeEventListener("click", this._dropZoneClickHandler);
    if (this._dropZoneKeydownHandler)
      dropZone.removeEventListener(
        "keydown",
        this._dropZoneKeydownHandler as EventListener,
      );
    if (this._dropZoneFocusHandler)
      dropZone.removeEventListener("focus", this._dropZoneFocusHandler);
    if (this._dropZoneBlurHandler)
      dropZone.removeEventListener("blur", this._dropZoneBlurHandler);
    if (this._dragoverHandler)
      dropZone.removeEventListener(
        "dragover",
        this._dragoverHandler as EventListener,
      );
    if (this._dragleaveHandler)
      dropZone.removeEventListener(
        "dragleave",
        this._dragleaveHandler as EventListener,
      );
    if (this._dropHandler)
      dropZone.removeEventListener("drop", this._dropHandler as EventListener);
    if (this._inputChangeHandler)
      fileInput.removeEventListener("change", this._inputChangeHandler);

    this._listenersSetup = false;
  }

  private buildDropZoneClasses(): string {
    const classes = ["drop-zone"];
    if (this._isDragging) classes.push("drag-active");
    if (this._files.length > 0) classes.push("has-files");
    if (this.disabled) classes.push("disabled");
    if (this.error) classes.push("error");
    return classes.join(" ");
  }

  private renderFileList(fileList: HTMLElement): void {
    fileList.innerHTML = "";
    for (let i = 0; i < this._files.length; i++) {
      const file = this._files[i];

      const item = document.createElement("div");
      item.className = "file-item";

      const icon = document.createElement("span");
      icon.className = "file-icon";
      icon.innerHTML = FILE_ICON;

      const name = document.createElement("span");
      name.className = "file-name";
      name.textContent = file.name;
      name.title = file.name;

      const size = document.createElement("span");
      size.className = "file-size";
      size.textContent = formatBytes(file.size);

      const removeBtn = document.createElement("button");
      removeBtn.className = "file-remove";
      removeBtn.type = "button";
      removeBtn.innerHTML = X_ICON;
      removeBtn.setAttribute("aria-label", `Remove ${file.name}`);

      const capturedIndex = i;
      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.removeFile(capturedIndex);
      });

      item.appendChild(icon);
      item.appendChild(name);
      item.appendChild(size);
      item.appendChild(removeBtn);
      fileList.appendChild(item);
    }
  }

  protected render(): void {
    const shadow = this.shadowRoot!;
    let container = shadow.querySelector(
      ".file-upload-container",
    ) as HTMLElement | null;

    if (!container) {
      container = document.createElement("div");
      container.className = "file-upload-container";

      const labelEl = document.createElement("div");
      labelEl.className = "upload-label";
      container.appendChild(labelEl);

      const dropZone = document.createElement("div");
      dropZone.className = "drop-zone";
      dropZone.setAttribute("role", "button");

      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.className = "file-input";
      fileInput.style.display = "none";
      dropZone.appendChild(fileInput);

      const uploadIcon = document.createElement("div");
      uploadIcon.className = "upload-icon";
      uploadIcon.innerHTML = UPLOAD_ICON;
      dropZone.appendChild(uploadIcon);

      const hintEl = document.createElement("div");
      hintEl.className = "upload-hint";
      dropZone.appendChild(hintEl);

      const subHintEl = document.createElement("div");
      subHintEl.className = "upload-sub-hint";
      dropZone.appendChild(subHintEl);

      container.appendChild(dropZone);

      const fileList = document.createElement("div");
      fileList.className = "file-list";
      container.appendChild(fileList);

      const errorEl = document.createElement("div");
      errorEl.className = "error-message";
      container.appendChild(errorEl);

      shadow.appendChild(container);
      this.setupEventListeners();
    }

    const labelEl = container.querySelector(".upload-label") as HTMLElement;
    if (this.label) {
      labelEl.style.display = "";
      labelEl.innerHTML = "";
      labelEl.appendChild(document.createTextNode(this.label));
      if (this.required) {
        const req = document.createElement("span");
        req.className = "required-icon";
        req.textContent = "*";
        req.setAttribute("aria-hidden", "true");
        labelEl.appendChild(req);
      }
    } else {
      labelEl.style.display = "none";
    }

    const dropZone = container.querySelector(".drop-zone") as HTMLElement;
    dropZone.className = this.buildDropZoneClasses();
    dropZone.tabIndex = this.disabled ? -1 : 0;
    dropZone.setAttribute("aria-disabled", String(this.disabled));
    dropZone.setAttribute("aria-label", this.placeholder || "Upload files");

    const fileInput = container.querySelector(
      ".file-input",
    ) as HTMLInputElement;
    fileInput.multiple = this.multiple;
    fileInput.accept = this.accept;
    fileInput.disabled = this.disabled;

    // Upload icon — hide once files are selected to give room to the compact zone
    const uploadIcon = container.querySelector(".upload-icon") as HTMLElement;
    uploadIcon.style.display = this._files.length > 0 ? "none" : "";

    const hintEl = container.querySelector(".upload-hint") as HTMLElement;
    if (this._files.length > 0) {
      hintEl.innerHTML = `<strong>${this._files.length} file${this._files.length !== 1 ? "s" : ""} selected</strong>`;
    } else {
      hintEl.innerHTML = `Drop files here or <span class="browse-link">click to browse</span>`;
    }

    const subHintEl = container.querySelector(
      ".upload-sub-hint",
    ) as HTMLElement;
    if (this.accept && this._files.length === 0) {
      subHintEl.textContent = `Accepted: ${this.accept}`;
      subHintEl.style.display = "";
    } else {
      subHintEl.style.display = "none";
    }

    const fileList = container.querySelector(".file-list") as HTMLElement;
    this.renderFileList(fileList);

    const errorEl = container.querySelector(".error-message") as HTMLElement;
    errorEl.textContent = this.error;
    errorEl.style.display = this.error ? "" : "none";
  }
}

if (!customElements.get("ty-file-upload")) {
  customElements.define("ty-file-upload", TyFileUpload);
}
