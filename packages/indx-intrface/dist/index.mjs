// src/context/SearchContext.tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var SearchContext = createContext(void 0);
var SearchProvider = ({ children, email, password, url, dataset }) => {
  const [state, setState] = useState({
    query: "",
    results: null,
    isLoading: false
  });
  const [token, setToken] = useState(null);
  const [showFacets] = useState(true);
  const setQuery = useCallback((query) => {
    setState((prev) => ({ ...prev, query }));
  }, []);
  const search = useCallback(async () => {
    if (!token)
      return;
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const searchResponse = await fetch(`${url}/api/Search/${dataset}`, {
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
      const jsonResponse = await fetch(`${url}/api/GetJson/${dataset}`, {
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
  }, [state.query, token, showFacets, url, dataset]);
  React.useEffect(() => {
    if (state.query.trim()) {
      search();
    } else {
      setState((prev) => ({ ...prev, results: null }));
    }
  }, [state.query, search]);
  React.useEffect(() => {
    const login = async () => {
      try {
        if (!email || !password) {
          throw new Error("Missing email or password in props");
        }
        const response = await fetch(
          `${url}/api/Login?userEmail=${encodeURIComponent(email)}&userPassWord=${encodeURIComponent(password)}`,
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
  }, [email, password, url]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SearchContext.Provider,
      {
        value: {
          state,
          setQuery
        },
        children
      }
    ),
    state.facets && typeof state.facets === "object" && /* @__PURE__ */ jsx(Fragment, { children: Object.entries(state.facets).map(([facetName, values]) => {
      if (!Array.isArray(values))
        return null;
      return /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("strong", { children: facetName }),
        /* @__PURE__ */ jsx("ul", { children: values.map((v, i) => /* @__PURE__ */ jsxs("li", { children: [
          v.key,
          ": ",
          v.value
        ] }, i)) })
      ] }, facetName);
    }) })
  ] });
};
var useSearchContext = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return context;
};

// src/components/SearchInput.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
var SearchInput = ({
  className,
  placeholder = "Search...",
  autoFocus = false,
  onKeyDown,
  ...rest
}) => {
  const { state: { query }, setQuery } = useSearchContext();
  return /* @__PURE__ */ jsx2(
    "input",
    {
      type: "text",
      value: query,
      onChange: (e) => setQuery(e.target.value),
      placeholder,
      autoFocus,
      onKeyDown,
      className,
      ...rest
    }
  );
};

// src/components/SearchResults.tsx
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var SearchResults = ({ fields, customLabels }) => {
  const { state: { results } } = useSearchContext();
  if (!results || results.length === 0) {
    return /* @__PURE__ */ jsx3("p", { children: "No results found." });
  }
  return /* @__PURE__ */ jsx3("div", { children: results.map((item, index) => {
    let parsed;
    try {
      parsed = typeof item === "string" ? JSON.parse(item) : item;
    } catch {
      return /* @__PURE__ */ jsx3("div", { children: /* @__PURE__ */ jsx3("p", { children: "Invalid JSON" }) }, index);
    }
    const displayData = fields?.length ? fields.reduce((obj, key) => {
      if (key in parsed)
        obj[key] = parsed[key];
      return obj;
    }, {}) : parsed;
    return /* @__PURE__ */ jsx3("div", { children: /* @__PURE__ */ jsx3("ul", { children: Object.entries(displayData).map(([key, value]) => {
      const label = customLabels?.[key];
      return /* @__PURE__ */ jsxs2("li", { children: [
        label === "" ? "" : label ?? `${key}: `,
        String(value)
      ] }, key);
    }) }) }, index);
  }) });
};
export {
  SearchInput,
  SearchProvider,
  SearchResults,
  useSearchContext as useSearch
};
//# sourceMappingURL=index.mjs.map