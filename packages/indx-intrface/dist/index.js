"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.tsx
var src_exports = {};
__export(src_exports, {
  SearchProvider: () => SearchProvider,
  useSearch: () => useSearchContext
});
module.exports = __toCommonJS(src_exports);

// src/context/SearchContext.tsx
var import_react = __toESM(require("react"));
var import_jsx_runtime = require("react/jsx-runtime");
var SearchContext = (0, import_react.createContext)(void 0);
var SearchProvider = ({ children, email, password }) => {
  const [state, setState] = (0, import_react.useState)({
    query: "",
    results: null,
    isLoading: false
  });
  const [token, setToken] = (0, import_react.useState)(null);
  const [showFacets] = (0, import_react.useState)(true);
  const setQuery = (0, import_react.useCallback)((query) => {
    setState((prev) => ({ ...prev, query }));
  }, []);
  const search = (0, import_react.useCallback)(async () => {
    if (!token)
      return;
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const searchResponse = await fetch("http://localhost:38171/api/Search/pokedex", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          text: state.query,
          maxNumberOfRecordsToReturn: 10,
          ...showFacets ? { enableFacets: true } : {}
        })
      });
      const searchData = await searchResponse.json();
      const keys = (searchData.records || []).map((record) => record.documentKey);
      const jsonResponse = await fetch("http://localhost:38171/api/GetJson/pokedex", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(keys)
      });
      const documents = await jsonResponse.json();
      setState((prev) => ({
        ...prev,
        results: documents,
        facets: searchData.facets || null,
        isLoading: false
      }));
    } catch (error) {
      console.error("Search failed:", error);
      setState((prev) => ({
        ...prev,
        results: null,
        isLoading: false
      }));
    }
  }, [state.query, token, showFacets]);
  import_react.default.useEffect(() => {
    if (state.query.trim()) {
      search();
    } else {
      setState((prev) => ({ ...prev, results: null }));
    }
  }, [state.query, search]);
  import_react.default.useEffect(() => {
    const login = async () => {
      try {
        if (!email || !password) {
          throw new Error("Missing email or password in props");
        }
        const response = await fetch(
          `http://localhost:38171/api/Login?userEmail=${encodeURIComponent(email)}&userPassWord=${encodeURIComponent(password)}`,
          {
            method: "POST",
            headers: { accept: "*/*" },
            body: ""
          }
        );
        const data = await response.json();
        console.log("Token:", data.token);
        setToken(data.token);
      } catch (err) {
        console.error("Login failed:", err);
      }
    };
    login();
  }, [email, password]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      SearchContext.Provider,
      {
        value: {
          state,
          setQuery
        },
        children
      }
    ),
    state.facets && typeof state.facets === "object" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: Object.entries(state.facets).map(([facetName, values]) => {
      if (!Array.isArray(values))
        return null;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: facetName }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: values.map((v, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
          v.key,
          ": ",
          v.value
        ] }, i)) })
      ] }, facetName);
    }) })
  ] });
};
var useSearchContext = () => {
  const context = (0, import_react.useContext)(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return context;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SearchProvider,
  useSearch
});
//# sourceMappingURL=index.js.map