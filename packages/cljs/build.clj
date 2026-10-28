(ns build
  (:require
   [clojure.data.json :as json]
   [clojure.java.io :as io]
   [clojure.string :as str]
   [clojure.tools.build.api :as b]
   [deps-deploy.deps-deploy :as deploy]
   [tyrell.template :as template]))

(def ty-version "1.0.0-RC19")
(def ty-icons-version "1.0.0-RC19")
(def class-dir "target/classes")

;; Library configurations
(def ty-lib
  {:group-id "dev.gersak"
   :artifact-id "tyrell"
   :version ty-version
   :basis-alias :tyrell-lib
   :src-dirs ["src"]
   :resource-dirs ["resources/tyrell"]
   :jar-file (format "target/tyrell-%s.jar" ty-version)})

;; Icons ship as one jar per set; dev.gersak/tyrell depends on none of them.
;; dev.gersak/tyrell-icons is the umbrella: all sets as dependencies, plus the
;; tyrell.icons.build extract tool. :files are paths under icons/.
(def icon-sets
  [{:artifact-id "tyrell-icons-lucide"
    :description "Lucide icons as Clojure defs, for Tyrell"
    :files ["tyrell/lucide.cljc"]}
   {:artifact-id "tyrell-icons-heroicons"
    :description "Heroicons (outline, solid, mini, micro) as Clojure defs, for Tyrell"
    :files ["tyrell/heroicons"]}
   {:artifact-id "tyrell-icons-material"
    :description "Material icons (filled, outlined, round, sharp, two-tone) as Clojure defs, for Tyrell"
    :files ["tyrell/material"]}
   {:artifact-id "tyrell-icons-fontawesome"
    :description "Font Awesome 6 (solid, regular, brands) as Clojure defs, for Tyrell"
    :files ["tyrell/fav6"]}])

(def icons-umbrella
  {:artifact-id "tyrell-icons"
   :description "Every Tyrell icon set, plus tyrell.icons.build/extract to ship only the icons you use"
   :files ["tyrell/icons/build.clj"]
   :deps (map :artifact-id icon-sets)})

(def icon-jars (conj icon-sets icons-umbrella))

(defn clean [_]
  (b/delete {:path "target"}))

(defn- get-pom-path [group-id artifact-id]
  (str class-dir "/META-INF/maven/" group-id "/" artifact-id "/pom.xml"))

(defn- create-pom [lib-config]
  (let [{:keys [group-id artifact-id version basis-alias src-dirs]} lib-config
        ;; :root nil: no tools.deps root deps, so Clojure itself isn't added
        ;; to the pom. Users bring their own Clojure/ClojureScript.
        basis (b/create-basis {:root nil :aliases [basis-alias]})
        lib-symbol (symbol (str group-id "/" artifact-id))
        scm-info {:url "https://github.com/gersak/tyrell"
                  :connection "scm:git:git://github.com/gersak/tyrell.git"
                  :developer-connection "scm:git:ssh://git@github.com/gersak/tyrell.git"
                  :tag (str "v" version)}]
    (b/write-pom {:class-dir class-dir
                  :lib lib-symbol
                  :version version
                  :basis basis
                  :src-dirs src-dirs
                  :scm scm-info
                  :pom-data [[:description (if (= artifact-id "tyrell")
                                             "Modern web components library built with ClojureScript"
                                             "Pre-generated icon components for Tyrell web components library")]
                             [:url "https://github.com/gersak/tyrell"]
                             [:licenses
                              [:license
                               [:name "MIT License"]
                               [:url "https://opensource.org/licenses/MIT"]]]
                             [:developers
                              [:developer
                               [:name "Robert Gersak"]
                               [:email "r.gersak@gmail.com"]]]]})))

(defn- create-jar [lib-config]
  (let [{:keys [src-dirs resource-dirs jar-file]} lib-config]
    (b/copy-dir {:src-dirs (concat src-dirs resource-dirs)
                 :target-dir class-dir})
    (b/jar {:class-dir class-dir
            :jar-file jar-file})))

;; ============================================================================
;; GitHub Pages Build Functions
;; ============================================================================

(defn read-ty-version
  "Read the current tyrell-components version from packages/core/package.json"
  []
  (let [pkg-json-path "../core/package.json"
        pkg-json-file (io/file pkg-json-path)]
    (if (.exists pkg-json-file)
      (let [pkg-data (json/read-str (slurp pkg-json-file) :key-fn keyword)
            version (:version pkg-data)]
        (if version
          version
          (throw (ex-info "No version found in package.json"
                          {:path (.getAbsolutePath pkg-json-file)}))))
      (throw (ex-info "package.json not found"
                      {:path (.getAbsolutePath pkg-json-file)})))))

(defn regenerate-versions
  "Regenerate site/tyrell/site/versions.cljs from current Clojars + npm versions.
   Call before building the docs site so install cards display what's published."
  [_]
  (let [components-version (read-ty-version)
        path "site/tyrell/site/versions.cljs"
        content (format "(ns tyrell.site.versions
  \"Single source of truth for version strings displayed in the docs site.

   These values are regenerated by `clj -T:build regenerate-versions` from
   `packages/cljs/build.clj` (Clojars) and `packages/core/package.json` (npm)
   before each release build, so the install card always shows what's actually
   published. For dev (`npm run dev:site`) the committed defaults are used.\")

(def TYRELL_VERSION \"%s\")
(def TYRELL_COMPONENTS_VERSION \"%s\")
"
                        ty-version
                        components-version)]
    (spit path content)
    (println (format "Regenerated %s — Clojars %s, npm %s"
                     path ty-version components-version))))

(defn github-pages
  "Build and deploy the documentation site to GitHub Pages.
   Uses CDN with pinned version from tyrell-components NPM package."
  [_]
  (let [salt (template/random-string)
        ty-version (read-ty-version)
        github-root "/tyrell"] ; GitHub Pages will serve from gersak.github.io/tyrell

    ;; 1. Clean the docs directory
    (println "\n📦 Building Tyrell Components Documentation for GitHub Pages")
    (println "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    (println (format "📦 Using tyrell-components version: %s from NPM CDN" ty-version))
    (println "→ Regenerating site versions.cljs from current Clojars + npm versions...")
    (regenerate-versions nil)
    (println "→ Cleaning docs directory...")
    (b/delete {:path "../../docs"})

    ;; 2. Build JavaScript with Shadow-cljs
    (println "→ Building JavaScript with shadow-cljs...")
    (println (format "  Using salt: %s" salt))
    (println "  Starting shadow-cljs build...")
    (let [command ["npx" "shadow-cljs" "-A:dev" "release" "github"]
          _ (println (format "  Command: %s" (str/join " " command)))
          {:keys [exit out err]} (b/process {:command-args command
                                             :out :capture
                                             :err :capture})]
      (when (seq out)
        (println out))
      (when-not (zero? exit)
        (println "Shadow-cljs build failed!")
        (when (seq err)
          (println "Error output:")
          (println err))
        (throw (ex-info "Shadow-cljs build failed" {:exit exit})))
      (println "  ✓ JavaScript build completed")

      ;; Rename the output file with salt for cache-busting
      (let [original-js (io/file "../../docs/js/site.js")
            original-map (io/file "../../docs/js/site.js.map")
            salted-js (io/file (format "../../docs/js/site.%s.js" salt))
            salted-map (io/file (format "../../docs/js/site.%s.js.map" salt))]
        (when (.exists original-js)
          (.renameTo original-js salted-js)
          (println (format "  ✓ Renamed site.js to site.%s.js" salt)))
        (when (.exists original-map)
          (.renameTo original-map salted-map)
          (println (format "  ✓ Renamed site.js.map to site.%s.js.map" salt)))))

    ;; 3. Process HTML templates
    (println "→ Generating HTML files...")

    ;; Main index.html
    (template/process "resources/index.html.template"
                      "../../docs/index.html"
                      {:salt salt
                       :version ty-version
                       :root github-root})

    ;; 404.html for GitHub Pages SPA support
    (template/process "resources/index.html.template"
                      "../../docs/404.html"
                      {:salt salt
                       :version ty-version
                       :root github-root})

    ;; 4. Copy static assets
    (println "→ Copying static assets...")
    ;; Copy favicon if it exists in public directory
    (when (.exists (io/file "public/favicon.ico"))
      (io/copy (io/file "public/favicon.ico")
               (io/file "../../docs/favicon.ico"))
      (println "  ✓ Copied favicon.ico"))

    ;; Copy images directory if it exists
    (when (.exists (io/file "public/images"))
      (b/copy-dir {:src-dirs ["public/images"]
                   :target-dir "../../docs/images"})
      (println "  ✓ Copied images directory"))

    ;; Copy llms.txt for AI agent discoverability
    (when (.exists (io/file "../../llms.txt"))
      (io/copy (io/file "../../llms.txt")
               (io/file "../../docs/llms.txt"))
      (println "  ✓ Copied llms.txt"))

    ;; 5. Create .nojekyll file (tells GitHub not to process with Jekyll)
    (spit "../../docs/.nojekyll" "")
    (println "  ✓ Created .nojekyll file")

    ;; 6. Summary
    (println "\n✅ GitHub Pages build complete!")
    (println "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    (println "📁 Output directory: ../../docs/")
    (println (format "🔑 Cache-busting salt: %s" salt))
    (println (format "📦 Tyrell Components: tyrell-components@%s (CDN)" ty-version))
    (println "🌐 Will be served at: https://gersak.github.io/tyrell/")
    (println "\nGenerated files:")
    (println "  - docs/index.html (main page)")
    (println "  - docs/404.html (SPA fallback)")
    (println (format "  - docs/js/site.%s.js (ClojureScript app)" salt))
    (println "\nCDN Resources:")
    (println (format "  - https://cdn.jsdelivr.net/npm/tyrell-components@%s/css/tyrell.css" ty-version))
    (println (format "  - https://cdn.jsdelivr.net/npm/tyrell-components@%s/css/tyrell-theme.css" ty-version))
    (println (format "  - https://cdn.jsdelivr.net/npm/tyrell-components@%s/dist/tyrell.js" ty-version))
    (println "\nNext steps:")
    (println "  1. Ensure tyrell-components is published to NPM:")
    (println (format "     npm publish (current version: %s)" ty-version))
    (println "  2. Wait ~2 minutes for CDN propagation")
    (println "  3. Review the generated files in 'docs/'")
    (println "  4. Commit and push to GitHub:")
    (println "     git add docs/")
    (println "     git commit -m 'Update GitHub Pages documentation'")
    (println "     git push origin docs")
    (println "  5. GitHub Actions will deploy automatically")
    (println "")))

(defn- sync-npm-deps!
  "Pin resources/tyrell/deps.cljs to the current tyrell-components npm version
   so the jar always requests what packages/core/package.json publishes."
  []
  (let [npm-version (read-ty-version)]
    (spit "resources/tyrell/deps.cljs"
          (str "{:npm-deps {\"tyrell-components\" \"" npm-version "\"}\n"
               " :npm-deps/keep-versions true}\n"))
    (println "Pinned tyrell-components npm dep to" npm-version)))

(defn build-ty [_]
  (println "Building dev.gersak/tyrell...")
  (clean nil)
  (sync-npm-deps!)
  (create-pom ty-lib)
  (create-jar ty-lib)
  (println "Built:" (:jar-file ty-lib)))

(defn- icon-jar-paths [{:keys [artifact-id]}]
  (let [class-dir (str "target/icons/" artifact-id)]
    {:class-dir class-dir
     :pom-file (str class-dir "/META-INF/maven/dev.gersak/" artifact-id "/pom.xml")
     :jar-file (format "target/%s-%s.jar" artifact-id ty-icons-version)}))

(defn- icon-pom
  "Hand-written pom: the set jars have no dependencies, and the umbrella's
   are its siblings at the same version, which can't be resolved into a
   basis before they're published."
  [{:keys [artifact-id description deps]}]
  (str "<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<project xmlns=\"http://maven.apache.org/POM/4.0.0\">
  <modelVersion>4.0.0</modelVersion>
  <groupId>dev.gersak</groupId>
  <artifactId>" artifact-id "</artifactId>
  <version>" ty-icons-version "</version>
  <name>" artifact-id "</name>
  <description>" description "</description>
  <url>https://github.com/gersak/tyrell</url>
  <licenses>
    <license>
      <name>MIT License</name>
      <url>https://opensource.org/licenses/MIT</url>
    </license>
  </licenses>
  <scm>
    <url>https://github.com/gersak/tyrell</url>
    <connection>scm:git:git://github.com/gersak/tyrell.git</connection>
    <developerConnection>scm:git:ssh://git@github.com/gersak/tyrell.git</developerConnection>
    <tag>v" ty-icons-version "</tag>
  </scm>
  <dependencies>"
       (apply str (for [d deps]
                    (str "
    <dependency>
      <groupId>dev.gersak</groupId>
      <artifactId>" d "</artifactId>
      <version>" ty-icons-version "</version>
    </dependency>")))
       "
  </dependencies>
</project>
"))

(defn- build-icon-jar [{:keys [artifact-id files] :as spec}]
  (let [{:keys [class-dir pom-file jar-file]} (icon-jar-paths spec)]
    (doseq [f files
            :let [src (io/file "icons" f)]]
      (if (.isDirectory src)
        (b/copy-dir {:src-dirs [(.getPath src)] :target-dir (str class-dir "/" f)})
        (b/copy-file {:src (.getPath src) :target (str class-dir "/" f)})))
    (io/make-parents pom-file)
    (spit pom-file (icon-pom spec))
    (b/jar {:class-dir class-dir :jar-file jar-file})
    (println (format "Built: %s (%.1f MB)" jar-file (/ (.length (io/file jar-file)) 1048576.0)))))

(defn build-ty-icons [_]
  (println "Building dev.gersak/tyrell-icons*...")
  (clean nil)
  (run! build-icon-jar icon-jars))

(defn build-all [_]
  (build-ty nil)
  (build-ty-icons nil))

(defn install-ty [_]
  (build-ty nil)
  (b/install {:basis (b/create-basis {:aliases [:tyrell-lib]})
              :lib (symbol (str (:group-id ty-lib) "/" (:artifact-id ty-lib)))
              :version (:version ty-lib)
              :jar-file (:jar-file ty-lib)
              :class-dir class-dir})
  (println "Installed dev.gersak/tyrell to local repo"))

(defn install-ty-icons [_]
  (build-ty-icons nil)
  (let [basis (b/create-basis {:aliases [:tyrell-icons-lib]})]
    (doseq [{:keys [artifact-id] :as spec} icon-jars
            :let [{:keys [class-dir jar-file]} (icon-jar-paths spec)]]
      (b/install {:basis basis
                  :lib (symbol "dev.gersak" artifact-id)
                  :version ty-icons-version
                  :jar-file jar-file
                  :class-dir class-dir})
      (println "Installed" (str "dev.gersak/" artifact-id) "to local repo"))))

(defn install-all [_]
  (install-ty-icons nil)
  (install-ty nil))

(defn deploy-ty [_]
  (build-ty nil)
  (let [pom-path (get-pom-path (:group-id ty-lib) (:artifact-id ty-lib))]
    (deploy/deploy {:installer :remote
                    :artifact (:jar-file ty-lib)
                    :pom-file pom-path}))
  (println "Deployed dev.gersak/tyrell to Clojars"))

(defn deploy-ty-icons
  "Sets first, umbrella last: its pom points at the set jars."
  [_]
  (build-ty-icons nil)
  (doseq [{:keys [artifact-id] :as spec} icon-jars
          :let [{:keys [jar-file pom-file]} (icon-jar-paths spec)]]
    (deploy/deploy {:installer :remote
                    :artifact jar-file
                    :pom-file pom-file})
    (println "Deployed" (str "dev.gersak/" artifact-id) "to Clojars")))

(defn deploy-all [_]
  (deploy-ty-icons nil)
  (deploy-ty nil))
