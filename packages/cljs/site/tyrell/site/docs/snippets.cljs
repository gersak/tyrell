(ns tyrell.site.docs.snippets
  "Framework code tabs from one description. A docs page writes its example as
   hiccup once; this prints it as HTML, React (JSX), Reagent and Replicant.

   Attribute values: string -> quoted, true -> boolean flag, false/nil -> dropped.
   Order is kept as long as the map keeps it (array-map, up to 8 entries).
   Framework-only attributes use a namespace: :jsx/onChange \"{toggle}\" appears
   in the React tab only (value printed raw); :html/…, :hiccup/… (Reagent and
   Replicant), :reagent/… and :replicant/… likewise.
   {:snippet/inline true} prints a node on one line (never shown itself)."
  (:require [clojure.string :as str]))

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
    ;; raw: framework expressions ({…}, @atom, #(…)) print unquoted; html/ stays quoted
    [(name k) v (and (some? (namespace k)) (not= "html" (namespace k)))]))

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
      (str " {" (if (> (count one-line) 56)
                  (str/join (str "\n" (apply str (repeat (+ col 2) " "))) entries)
                  one-line)
           "}"))))

(defn- markup
  "HTML or JSX. JSX renames ty-* tags to Ty* and self-closes empty elements."
  [jsx? node indent]
  (if (string? node)
    (str indent node)
    (let [[tag attrs kids] (parse node)
          name (if (and jsx? (ty-tag? tag)) (str "Ty" (pascal tag)) tag)
          as (map html-attr (attrs-for attrs #{(if jsx? "jsx" "html")}))
          ;; long attribute lists go one per line, like the hiccup maps
          open (str indent "<" name (if (> (count (str/join as)) 72)
                                       (str/join (map #(str "\n" indent "  " (subs % 1)) as))
                                       (str/join as)))]
      (cond
        (empty? kids) (if jsx? (str open " />") (str open "></" name ">"))
        (every? string? kids) (str open ">" (str/join kids) "</" name ">")
        (:snippet/inline attrs) (str open ">" (str/join " " (map #(markup jsx? % "") kids)) "</" name ">")
        :else (str open ">\n"
                   (str/join "\n" (map #(markup jsx? % (str indent "  ")) kids))
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

(defn attr-str
  "HTML attribute string for hand-written snippets (the Datastar tab)."
  [attrs]
  (str/join (map html-attr (attrs-for attrs #{"html"}))))

(defn tabs
  "Code tabs [[id label lang code] ...] for code-tabs / playground.
   nodes: hiccup examples; datastar: the Datastar tab's code, written by hand
   because its reactive attributes are the whole point of that tab."
  [nodes & {:keys [datastar]}]
  (let [nodes (vec nodes)
        imports (str/join ", " (map #(str "Ty" (pascal %)) (ty-tags nodes)))]
    (cond-> [["html" "HTML" "html" (str/join "\n" (map #(markup false % "") nodes))]
             ["react" "React" "javascript"
              (str "import { " imports " } from 'tyrell-react'\n\n"
                   (str/join "\n" (map #(markup true % "") nodes)))]
             ["reagent" "Reagent" "clojure"
              (str "(:require [tyrell.react :as ty])\n\n" (str/join "\n\n" (map #(hiccup true % "") nodes)))]
             ["replicant" "Replicant" "clojure" (str/join "\n\n" (map #(hiccup false % "") nodes))]]
      datastar (conj ["datastar" "Datastar" "html" datastar]))))
