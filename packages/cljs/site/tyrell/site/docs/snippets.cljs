(ns tyrell.site.docs.snippets
  "Framework code tabs from one description. A docs page writes its example as
   hiccup once; this prints it as HTML, React (JSX), Reagent, Replicant and
   Datastar.

   Attribute values: string -> quoted, true -> boolean flag, false/nil -> dropped.
   Order is kept as long as the map keeps it (array-map, up to 8 entries).
   Framework-only attributes use a namespace: :jsx/onChange \"{toggle}\" appears
   in the React tab only (value printed raw); :html/…, :hiccup/… (Reagent and
   Replicant), :reagent/… and :replicant/… likewise. The Datastar tab is the
   HTML tab plus :datastar/… attributes (data-bind, data-on:…, data-attr:…),
   quoted like HTML.
   {:snippet/inline true} prints a node on one line (never shown itself)."
  (:require [clojure.string :as str]))

(def ^:private max-line
  "Characters that fit a playground code box without scrolling."
  64)

(defn- pascal
  "ty-date-picker -> DatePicker"
  [tag]
  (str/join (map str/capitalize (rest (str/split tag #"-")))))

(defn- ty-tag? [tag] (str/starts-with? tag "ty-"))

(defn- parse [[tag & more]]
  (let [[attrs kids] (if (map? (first more)) [(first more) (rest more)] [{} more])]
    [(name tag) attrs (remove nil? (mapcat #(if (seq? %) % [%]) kids))]))

(defn- attrs-for
  "Attributes visible to a printer: plain keys plus keys in its namespaces."
  [attrs nss]
  (for [[k v] attrs
        :when (and (some? v) (not (false? v)) (or (nil? (namespace k)) (contains? nss (namespace k))))]
    ;; raw: framework expressions ({…}, @atom, #(…)) print unquoted; html/ and
    ;; datastar/ are HTML attributes and stay quoted
    [(name k) v (and (some? (namespace k)) (not (#{"html" "datastar"} (namespace k))))]))

(defn- html-attr [[k v raw?]]
  (cond (true? v) (str " " k)
        raw? (str " " k "=" v)
        :else (str " " k "=\"" v "\"")))

(defn- hiccup-attrs
  "{:k \"v\" ...}; long maps go one entry per line, aligned under the first."
  [attrs nss col]
  (let [entries (for [[k v raw?] (attrs-for attrs nss)]
                  (str ":" k " " (cond (true? v) "true" raw? v :else (str "\"" v "\""))))
        one-line (str/join " " entries)]
    (when (seq entries)
      (str " {" (if (> (+ col 3 (count one-line)) max-line)
                  (str/join (str "\n" (apply str (repeat (+ col 2) " "))) entries)
                  one-line)
           "}"))))

(def ^:private markup-namespaces
  {:html #{"html"} :jsx #{"jsx"} :datastar #{"html" "datastar"}})

(defn- markup
  "HTML, JSX or Datastar. JSX renames ty-* tags to Ty* and self-closes empty
   elements; Datastar is HTML plus the :datastar/… attributes."
  [mode node indent]
  (if (string? node)
    (str indent node)
    (let [[tag attrs kids] (parse node)
          jsx? (= mode :jsx)
          name (if (and jsx? (ty-tag? tag)) (str "Ty" (pascal tag)) tag)
          as (map html-attr (attrs-for attrs (markup-namespaces mode)))
          one-line (str indent "<" name (str/join as))
          ;; the line this element would take unwrapped: the whole element for
          ;; leaves, the opening tag otherwise
          flat (cond
                 (empty? kids) (if jsx? (str one-line " />") (str one-line "></" name ">"))
                 (every? string? kids) (str one-line ">" (str/join kids) "</" name ">")
                 :else (str one-line ">"))
          ;; too wide for the code box: one attribute per line, and the closing
          ;; tag on its own line instead of trailing off the right edge
          multi? (and (seq as) (> (count flat) max-line))
          open (if multi?
                 (str indent "<" name (str/join (map #(str "\n" indent "  " (subs % 1)) as)))
                 one-line)
          close (if multi? (str "\n" indent "</" name ">") (str "</" name ">"))]
      (cond
        (empty? kids) (cond jsx? (str open (if multi? (str "\n" indent "/>") " />"))
                            :else (str open ">" close))
        (every? string? kids) (if multi?
                                (str open ">\n" indent "  " (str/join kids) close)
                                (str open ">" (str/join kids) close))
        (:snippet/inline attrs) (str open ">" (str/join " " (map #(markup mode % "") kids)) "</" name ">")
        :else (str open ">\n"
                   (str/join "\n" (map #(markup mode % (str indent "  ")) kids))
                   "\n" indent "</" name ">")))))

(defn- hiccup
  "Replicant ([:ty-x ...]) or Reagent ([:> ty/X ...]) source."
  [reagent? node indent]
  (if (string? node)
    (str indent "\"" node "\"")
    (let [[tag attrs kids] (parse node)
          head (if (and reagent? (ty-tag? tag)) (str "[:> ty/" (pascal tag)) (str "[:" tag))
          open (str indent head (hiccup-attrs attrs #{"hiccup" (if reagent? "reagent" "replicant")}
                                              (+ (count indent) (count head))))]
      (cond
        (empty? kids) (str open "]")
        (or (every? string? kids) (:snippet/inline attrs))
        (str open " " (str/join " " (map #(hiccup reagent? % "") kids)) "]")
        :else (str open "\n" (str/join "\n" (map #(hiccup reagent? % (str indent " ")) kids)) "]")))))

(defn- ty-tags [nodes]
  (->> nodes
       (mapcat #(tree-seq vector? (fn [n] (nth (parse n) 2)) %))
       (filter vector?) (map (comp first parse)) (filter ty-tag?) distinct))

(defn slug
  "\"Ada Lovelace\" -> \"ada-lovelace\" (URLs and data-signals:… keys)."
  [label]
  (-> (str/lower-case label) (str/replace #"[^a-z0-9]+" "-") (str/replace #"^-|-$" "")))

(defn signal
  "\"Email me release notes\" -> \"emailMeReleaseNotes\" (a Datastar signal)."
  [label]
  (let [[w & ws] (str/split (slug label) #"-")]
    (str/join (cons w (map str/capitalize ws)))))

(defn ds
  "A :datastar/… attribute key, e.g. (ds \"data-on:click\")."
  [attr]
  (keyword "datastar" attr))

(defn tabs
  "Code tabs [[id label lang code] ...] for code-tabs / playground.
   nodes: hiccup examples, printed in every tab. Put Datastar bindings on them
   as :datastar/… attributes. datastar: other nodes for the Datastar tab, for
   the rare case where it needs a different wrapper (e.g. a <form> for
   @post(…, {contentType: 'form'}))."
  [nodes & {:keys [datastar]}]
  (let [nodes (vec nodes)
        imports (str/join ", " (map #(str "Ty" (pascal %)) (ty-tags nodes)))]
    [["html" "HTML" "html" (str/join "\n" (map #(markup :html % "") nodes))]
     ["react" "React" "javascript"
      (str "import { " imports " } from 'tyrell-react'\n\n"
           (str/join "\n" (map #(markup :jsx % "") nodes)))]
     ["reagent" "Reagent" "clojure"
      (str "(:require [tyrell.react :as ty])\n\n" (str/join "\n\n" (map #(hiccup true % "") nodes)))]
     ["replicant" "Replicant" "clojure" (str/join "\n\n" (map #(hiccup false % "") nodes))]
     ["datastar" "Datastar" "html" (str/join "\n" (map #(markup :datastar % "") (or datastar nodes)))]]))
