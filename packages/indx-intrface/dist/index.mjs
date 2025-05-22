// src/context/SearchContext.tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var SearchContext = createContext(void 0);
var SearchProvider = ({ children, email, password, url, dataset }) => {
  const [state, setState] = useState({
    query: "",
    results: null,
    isLoading: false,
    filters: {},
    rangeFilters: {},
    facetStats: {}
  });
  const [initialFacetStats, setInitialFacetStats] = useState({});
  const [fixedFacetStats, setFixedFacetStats] = useState({});
  const [lastQueryText, setLastQueryText] = useState("");
  const [rangeBounds, setRangeBounds] = useState({});
  const [lastValueFilters, setLastValueFilters] = useState({});
  const setRangeFilter = useCallback((field, min, max) => {
    console.log(`setRangeFilter for field: ${field}, min: ${min}, max: ${max}`);
    setState((prev) => ({
      ...prev,
      rangeFilters: {
        ...prev.rangeFilters,
        [field]: { min, max }
      }
    }));
  }, []);
  const [token, setToken] = useState(null);
  const [showFacets] = useState(true);
  const [filterableFields, setFilterableFields] = useState([]);
  const [facetableFields, setFacetableFields] = useState([]);
  const setQuery = useCallback((query) => {
    setState((prev) => ({
      ...prev,
      query,
      filters: {},
      // reset value filters
      rangeFilters: {}
      // reset range filters
    }));
  }, []);
  const toggleFilter = useCallback((field, value) => {
    setState((prev) => {
      const currentValues = prev.filters?.[field] || [];
      const updatedValues = currentValues.includes(value) ? currentValues.filter((v) => v !== value) : [...currentValues, value];
      return {
        ...prev,
        filters: {
          ...prev.filters,
          [field]: updatedValues
        }
      };
    });
  }, []);
  async function combineFilters(filters, url2, dataset2, token2) {
    if (filters.length === 0)
      return null;
    if (filters.length === 1)
      return filters[0];
    let current = filters[0];
    for (let i = 1; i < filters.length; i++) {
      const response = await fetch(`${url2}/api/CombineFilters/${dataset2}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token2}`
        },
        body: JSON.stringify({
          A: current,
          B: filters[i],
          AndMode: true
        })
      });
      if (!response.ok) {
        const err = await response.json();
        console.error("CombineFilters failed:", err);
        throw new Error("CombineFilters failed");
      }
      current = await response.json();
      console.log("Intermediate combined filter result:", current);
    }
    return current;
  }
  const search = useCallback(async () => {
    if (!token)
      return;
    console.log("Triggering search...");
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      let filterProxy = null;
      const filterEntries = Object.entries(state.filters ?? {});
      const valueFilterResponsesNested = await Promise.all(
        filterEntries.map(async ([field, values]) => {
          return await Promise.all(
            values.map(
              (value) => fetch(`${url}/api/CreateValueFilter/${dataset}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ FieldName: field, Value: value })
              }).then((res) => res.json())
            )
          );
        })
      );
      const valueFilterResponses = valueFilterResponsesNested.flat();
      const rangeFilterEntries = Object.entries(state.rangeFilters ?? {});
      console.log("Applying range filters:", JSON.stringify(state.rangeFilters, null, 2));
      const rangeFilterResponses = await Promise.all(
        rangeFilterEntries.map(
          ([field, { min, max }]) => fetch(`${url}/api/CreateRangeFilter/${dataset}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ FieldName: field, LowerLimit: min, UpperLimit: max })
          }).then((res) => res.json())
        )
      );
      const allFilters = [...valueFilterResponses, ...rangeFilterResponses].filter(
        (f) => f && typeof f.hashString === "string"
      );
      console.log("\u{1F9EA} All filters being combined:", JSON.stringify(allFilters, null, 2));
      if (allFilters.length === 0) {
        console.log("No valid filters found.");
      }
      filterProxy = await combineFilters(allFilters, url, dataset, token);
      console.log("Sending search filterProxy:", filterProxy);
      const searchResponse = await fetch(`${url}/api/Search/${dataset}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          text: state.query,
          maxNumberOfRecordsToReturn: 10,
          ...filterProxy ? { filter: filterProxy } : {},
          ...showFacets ? { enableFacets: true } : {}
        })
      });
      console.log("Final search body:", {
        text: state.query,
        filter: filterProxy
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
      let newFacetStats = {};
      if (searchData.facets) {
        for (const [field, values] of Object.entries(searchData.facets)) {
          if (Array.isArray(values) && values.length > 0) {
            const numericValues = values.map((v) => Number(v.key)).filter((v) => !isNaN(v));
            if (numericValues.length > 0) {
              newFacetStats[field] = {
                min: Math.min(...numericValues),
                max: Math.max(...numericValues)
              };
            }
          }
        }
      }
      const queryChanged = state.query !== lastQueryText;
      const valueFiltersChanged = JSON.stringify(state.filters) !== JSON.stringify(lastValueFilters);
      let mergedFacetStats;
      if (queryChanged) {
        mergedFacetStats = { ...initialFacetStats, ...newFacetStats };
        setFixedFacetStats(mergedFacetStats);
        setLastQueryText(state.query);
      } else {
        mergedFacetStats = { ...fixedFacetStats, ...newFacetStats };
      }
      if (queryChanged || valueFiltersChanged) {
        const updatedBounds = { ...rangeBounds };
        for (const [field, stats] of Object.entries(newFacetStats)) {
          updatedBounds[field] = stats;
        }
        setRangeBounds(updatedBounds);
        setLastValueFilters(state.filters);
      }
      setState((prev) => ({
        ...prev,
        results: documents,
        facets: searchData.facets || null,
        facetStats: mergedFacetStats,
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
  }, [state.query, state.filters, state.rangeFilters, token, showFacets, url, dataset, initialFacetStats, fixedFacetStats, lastQueryText, lastValueFilters, rangeBounds]);
  React.useEffect(() => {
    if (state.query.trim()) {
      search();
    } else {
      setState((prev) => ({ ...prev, results: null }));
    }
  }, [state.query, state.filters, state.rangeFilters, search]);
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
        setToken(data.token);
        const [filterableRes, facetableRes] = await Promise.all([
          fetch(`${url}/api/GetFilterableFields/${dataset}`, {
            method: "GET",
            headers: {
              "accept": "text/plain",
              "Authorization": `Bearer ${data.token}`
            }
          }),
          fetch(`${url}/api/GetFacetableFields/${dataset}`, {
            method: "GET",
            headers: {
              "accept": "text/plain",
              "Authorization": `Bearer ${data.token}`
            }
          })
        ]);
        const filterable = await filterableRes.json();
        const facetable = await facetableRes.json();
        setFilterableFields(filterable || []);
        setFacetableFields(facetable || []);
        const blankSearchResponse = await fetch(`${url}/api/Search/${dataset}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${data.token}`
          },
          body: JSON.stringify({
            text: "",
            maxNumberOfRecordsToReturn: 0,
            enableFacets: true
          })
        });
        const blankSearchData = await blankSearchResponse.json();
        const newFacetStats = {};
        if (blankSearchData.facets) {
          for (const [field, values] of Object.entries(blankSearchData.facets)) {
            if (Array.isArray(values) && values.length > 0) {
              const numericValues = values.map((v) => Number(v.key)).filter((v) => !isNaN(v));
              if (numericValues.length > 0) {
                newFacetStats[field] = {
                  min: Math.min(...numericValues),
                  max: Math.max(...numericValues)
                };
              }
            }
          }
        }
        setInitialFacetStats(newFacetStats);
        setRangeBounds(newFacetStats);
        setState((prev) => ({
          ...prev,
          facetStats: newFacetStats
        }));
      } catch (err) {
        console.error("Login failed:", err);
      }
    };
    login();
  }, [email, password, url, dataset]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SearchContext.Provider,
      {
        value: {
          state: {
            ...state,
            filterableFields,
            facetableFields,
            rangeBounds
          },
          setQuery,
          toggleFilter,
          setRangeFilter
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

// src/components/FilterPanel.tsx
import { Range } from "react-range";
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
var FilterPanel = ({ field, label, filterType, displayType }) => {
  const {
    state: { facets, filterableFields, facetableFields, filters, rangeFilters, facetStats, rangeBounds },
    toggleFilter,
    setRangeFilter
  } = useSearchContext();
  if (!filterableFields?.includes(field) || !facetableFields?.includes(field)) {
    const missing = [];
    if (!filterableFields?.includes(field))
      missing.push("filterable");
    if (!facetableFields?.includes(field))
      missing.push("facetable");
    return /* @__PURE__ */ jsxs3("div", { style: { color: "red" }, children: [
      'Cannot render filter for "',
      field,
      '": missing ',
      missing.join(" and "),
      "."
    ] });
  }
  if (filterType === "value") {
    const facetValues = facets?.[field];
    if (!facetValues || !Array.isArray(facetValues))
      return null;
    const selectedValues = filters?.[field] ?? [];
    return /* @__PURE__ */ jsxs3("fieldset", { children: [
      /* @__PURE__ */ jsx4("legend", { children: label || field }),
      /* @__PURE__ */ jsx4("ul", { children: facetValues.map((facet, index) => /* @__PURE__ */ jsx4("li", { children: /* @__PURE__ */ jsxs3("label", { children: [
        /* @__PURE__ */ jsx4(
          "input",
          {
            type: "checkbox",
            checked: selectedValues.includes(facet.key),
            onChange: () => toggleFilter(field, facet.key)
          }
        ),
        facet.key,
        " (",
        facet.value,
        ")"
      ] }) }, index)) })
    ] });
  }
  if (filterType === "range") {
    const actualMin = rangeBounds?.[field]?.min ?? 0;
    const actualMax = rangeBounds?.[field]?.max ?? 1e3;
    const currentMin = rangeFilters?.[field]?.min ?? actualMin;
    const currentMax = rangeFilters?.[field]?.max ?? actualMax;
    const handleRangeChange = (values) => {
      const [min, max] = values;
      if (!isNaN(min) && !isNaN(max) && min <= max) {
        if (min !== actualMin || max !== actualMax) {
          setRangeFilter(field, min, max);
        } else {
          setRangeFilter(field, actualMin, actualMax);
        }
      }
    };
    if (displayType === "slider") {
      return /* @__PURE__ */ jsxs3("fieldset", { children: [
        /* @__PURE__ */ jsx4("legend", { children: label || field }),
        /* @__PURE__ */ jsxs3("div", { style: { padding: "1rem 0" }, children: [
          /* @__PURE__ */ jsx4(
            Range,
            {
              step: 1,
              min: actualMin,
              max: actualMax,
              values: [currentMin, currentMax],
              onChange: handleRangeChange,
              renderTrack: ({ props, children }) => /* @__PURE__ */ jsx4(
                "div",
                {
                  ...props,
                  style: {
                    ...props.style,
                    height: "6px",
                    width: "100%",
                    backgroundColor: "#ccc"
                  },
                  children
                }
              ),
              renderThumb: ({ props, index }) => {
                const { key, ...rest } = props;
                return /* @__PURE__ */ jsx4(
                  "div",
                  {
                    ...rest,
                    style: {
                      ...props.style,
                      height: "20px",
                      width: "20px",
                      backgroundColor: "#999",
                      borderRadius: "50%"
                    }
                  },
                  key
                );
              }
            }
          ),
          /* @__PURE__ */ jsxs3("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }, children: [
            /* @__PURE__ */ jsx4("span", { children: currentMin }),
            /* @__PURE__ */ jsx4("span", { children: currentMax })
          ] })
        ] })
      ] });
    }
    const handleMinChange = (e) => {
      const input = e.target.value;
      if (input === "")
        return;
      const value = Number(input);
      if (!isNaN(value) && value <= currentMax) {
        setRangeFilter(field, value, currentMax);
      }
    };
    const handleMaxChange = (e) => {
      const input = e.target.value;
      if (input === "")
        return;
      const value = Number(input);
      if (!isNaN(value) && value >= currentMin) {
        setRangeFilter(field, currentMin, value);
      }
    };
    return /* @__PURE__ */ jsxs3("fieldset", { children: [
      /* @__PURE__ */ jsx4("legend", { children: label || field }),
      /* @__PURE__ */ jsxs3("label", { children: [
        "Min:",
        /* @__PURE__ */ jsx4(
          "input",
          {
            type: "number",
            value: currentMin,
            onChange: handleMinChange
          }
        )
      ] }),
      /* @__PURE__ */ jsxs3("label", { children: [
        "Max:",
        /* @__PURE__ */ jsx4(
          "input",
          {
            type: "number",
            value: currentMax,
            onChange: handleMaxChange
          }
        )
      ] })
    ] });
  }
  return null;
};
export {
  FilterPanel,
  SearchInput,
  SearchProvider,
  SearchResults,
  useSearchContext as useSearch
};
//# sourceMappingURL=index.mjs.map