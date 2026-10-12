(ns tyrell.router-test
  (:require [cljs.test :refer [deftest is testing run-tests]]
            [tyrell.router :as r]))

(def tree
  "Shaped like the docs site: hash-only routes at /welcome, plain routes
   under /components, a nested child, a guide with a slash in its segment."
  (reduce r/set-component
          {:id ::r/root :segment "" :children []}
          [{:id ::landing :parent ::r/root :segment "welcome" :hash "top" :landing 20}
           {:id ::booking :parent ::r/root :segment "welcome" :hash "event-booking"}
           {:id ::components :parent ::r/root :segment "components"}
           {:id ::select :parent ::components :segment "select"}
           {:id ::inputs :parent ::components :segment "inputs"}
           {:id ::checkbox :parent ::inputs :segment "checkbox"}
           {:id ::theming :parent ::r/root :segment "guides/theming"}]))

(defn- exact [url] (filterv #(r/exact-match? tree url %) [::landing ::booking ::components ::select ::inputs ::checkbox ::theming]))

(deftest exact-match
  (testing "hash routes need their own hash"
    (is (= [::landing] (exact "/welcome#top")))
    (is (= [::booking] (exact "/welcome#event-booking"))))
  (testing "a plain route still matches when the URL carries an in-page anchor"
    (is (= [::select] (exact "/components/select")))
    (is (= [::select] (exact "/components/select#api")))
    (is (= [::theming] (exact "/guides/theming#custom-flavors"))))
  (testing "no match for a bare path that only has hash routes, or an unknown path"
    (is (= [] (exact "/welcome")))
    (is (= [] (exact "/components/nope")))))

(deftest on-path-respects-segment-boundaries
  (is (r/on-path? tree "/components/select" ::components))
  (is (r/on-path? tree "/components" ::components))
  (is (r/on-path? tree "/welcome#top" ::landing))
  (is (not (r/on-path? tree "/componentsfoo" ::components)))
  (is (not (r/on-path? tree "/components/selectx" ::select))))

(deftest redirect-target
  (testing "nothing to do when a route matches exactly"
    (is (nil? (r/redirect-target tree "/components/select")))
    (is (nil? (r/redirect-target tree "/components/select#api")))
    (is (nil? (r/redirect-target tree "/welcome#event-booking"))))
  (testing "a bare path with only hash routes goes to its best hash route"
    (is (= ::landing (r/redirect-target tree "/welcome"))))
  (testing "URLs under no route go to the landing route"
    (is (= ::landing (r/redirect-target tree "/nope")))
    (is (= ::landing (r/redirect-target tree "/componentsfoo"))))
  (testing "a path below a route stays: apps read dynamic segments (/users/123) with non-exact rendered?"
    (is (nil? (r/redirect-target tree "/components/nope")))))

(defn -main []
  (let [report (atom nil)]
    (defmethod cljs.test/report [:cljs.test/default :end-run-tests] [m]
      (println (str "\n" (:test m) " tests, " (:pass m) " passed, " (:fail m) " failed, " (:error m) " errors"))
      (reset! report m))
    (run-tests)
    (let [{:keys [fail error]} @report]
      (js/process.exit (if (zero? (+ fail error)) 0 1)))))

(set! *main-cli-fn* -main)
