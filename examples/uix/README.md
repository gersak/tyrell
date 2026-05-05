# UIx + ty-react Hybrid Example

A comprehensive example showcasing the integration of:
- **UIx** - Modern React-like ClojureScript framework
- **tyrell-react** - Clean React component wrappers (`ty/Button`, `ty/Input`, etc.)
- **dev.gersak/ty** - ClojureScript utilities and icon system
- **Tailwind CSS** - Utility-first styling (following TY color guidelines)

## 🎯 **Key Patterns Demonstrated**

### **CSS Strategy: TY for Colors, Tailwind for Everything Else**
- ✅ **TY classes** = Colors (`ty-text++`, `ty-bg-primary`, `ty-elevated`)
- ✅ **Tailwind classes** = Layout/spacing (`p-6`, `rounded-lg`, `flex`, `gap-4`)

### **Professional App Layout**
```clojure
;; ✅ GOOD: Modern grid layout with responsive sidebar
($ :div {:class "min-h-screen grid grid-cols-1 lg:grid-cols-[280px_1fr] grid-rows-[64px_1fr] ty-canvas"}
   ;; Header spans both columns
   ($ :header {:class "col-span-full ty-elevated border-b ty-border"})
   ;; Responsive sidebar with mobile overlay
   ($ :aside {:class "ty-content border-r ty-border"})
   ;; Main content area
   ($ :main {:class "overflow-auto ty-content"}))
```

### **Component Usage**
```clojure
;; ✅ GOOD: TY colors + Tailwind utilities + UIx hooks
(defui my-component [{:keys [title description]}]
  (let [[active set-active] (use-state false)]
    ($ :div {:class "ty-elevated p-6 rounded-lg max-w-md mx-auto"}
       ($ :h2 {:class "ty-text++ text-xl font-bold mb-4"} title)
       ($ ty/Button {:variant "primary" :class "w-full"} "Action"))))

### **Form Patterns**
- Real-time validation with error states
- Semantic error styling (`ty-text-danger`, `ty-border-danger`)
- Success/error feedback with proper TY color classes
- Icon integration with spacing via `gap` (no margins on icons)

## 🚀 **Development Setup**

### **Prerequisites**
- Node.js 16+
- Java 11+ (for ClojureScript compilation)

### **Installation**
```bash
# 1. Install npm dependencies
npm install

# 2. Build CSS (first time)
npm run css:build
```

### **Development (Two Terminal Setup)**

**Terminal 1 - ClojureScript:**
```bash
shadow-cljs watch app
```

**Terminal 2 - CSS (live reload):**
```bash
npm run css:watch
```

Then open http://localhost:3000

### **Production Build**
```bash
# Build optimized JavaScript
shadow-cljs release app

# Build minified CSS
npm run css:build
```

## 📁 **Project Structure**

```
src/
├── input.css              # Tailwind source
└── hello/
    ├── core.cljs          # Main app entry point
    └── views/
        └── forms.cljs     # Comprehensive form examples

public/
├── index.html             # App HTML
├── css/
│   ├── ty.css            # TY component styles (copied from main project)
│   └── app.css           # Generated Tailwind CSS
└── js/                   # Shadow-cljs output
```

## 🎨 **Views & Examples Included**

### **1. Getting Started (Home)**
- Project overview and feature highlights
- Quick statistics and project info
- Hero section with call-to-action buttons
- Feature cards showcasing key technologies

### **2. Buttons & Icons**
- Button variant demonstrations (primary, secondary, outline, ghost)
- Icon gallery with 25+ registered Lucide icons
- Interactive hover states and transitions
- Proper spacing using `gap` (no margins on icons)

### **3. Forms & Inputs**
- **Contact Form** - Full-featured form with validation, loading states, success feedback
- **Live Validation Demo** - Real-time validation as you type
- **Field Wrapper Component** - Reusable form field pattern
- **Error Handling** - Proper semantic color usage for errors

### **4. Layout & Containers**
- TY surface class demonstrations (`ty-canvas`, `ty-content`, `ty-elevated`, `ty-floating`)
- Responsive design patterns
- Container hierarchy examples
- Semantic color system usage

### **5. Modals & Overlays**
- Coming soon - Modal and overlay examples

## 🏗️ **Layout Architecture**

### **Professional App Layout**
- **Grid-based layout** with responsive sidebar (280px desktop, hidden mobile)
- **Header spanning full width** with theme toggle and status indicator  
- **Mobile-first responsive design** with overlay sidebar
- **Dark/light theme switching** with HTML class manipulation

## 🎨 **Form Examples (Legacy)**

### **1. Contact Form**
- Personal information fields with validation
- Message composition with character counting
- Priority selection dropdown
- Newsletter subscription checkbox
- Success/error state handling
- Loading states during submission

### **2. Live Validation Demo**
- Real-time field validation as you type
- Password confirmation matching
- Age and URL validation
- Visual validation status indicator
- Error highlighting with semantic colors

## 🎯 **Key Features Demonstrated**

### **UIx Integration**
- Modern React hooks (`use-state`, `use-effect`)
- Component composition with `defui`
- Event handling and state management
- Clean functional component patterns

### **ty-react Component Usage**
- `ty/Button` - Various variants and states
- `ty/Input` - Text inputs, textareas, checkboxes
- `ty/Dropdown` with `ty/Option` children
- `ty/Icon` - Icon integration without margins

### **TY + Tailwind CSS Patterns**
- Semantic surface classes (`ty-elevated`, `ty-canvas`)
- Text hierarchy (`ty-text++`, `ty-text+`, `ty-text-`)
- Semantic colors (`ty-bg-success-`, `ty-text-danger`)
- Proper spacing with Tailwind (`gap-4`, `space-y-6`)
- Responsive design (`grid-cols-1 md:grid-cols-2`)

### **Form Best Practices**
- Accessible labels and error messages
- Proper form validation patterns
- Loading and success states
- Icon usage without margins (using `gap` instead)
- Semantic color usage for different states

## 🔧 **Icon System**

Icons are registered in `hello.core/register-icons!` using the ClojureScript icon system:

```clojure
(icons/add! {"send" lucide/send
             "user" lucide/user
             "mail" lucide/mail
             "home" lucide/home
             "menu" lucide/menu
             "sun" lucide/sun
             "moon" lucide/moon})

;; Then used via ty-react wrapper:
($ ty/Icon {:name "send"})
```

**25+ Icons Available:** home, user, mail, phone, message-circle, send, check, x, alert-circle, forms, settings, menu, sun, moon, edit, square, grid, layers, play, code, zap, palette, and more.

## 📚 **Learning Resources**

- **UIx Documentation**: [GitHub](https://github.com/pitch-io/uix)
- **TY Components**: Main project documentation
- **Tailwind CSS**: [Official docs](https://tailwindcss.com)
- **CSS Guide**: See `CSS_GUIDE.md` for TY + Tailwind patterns

This example serves as a comprehensive reference for building modern ClojureScript applications with the best of both React ecosystem (via ty-react) and ClojureScript utilities (via dev.gersak/ty).
