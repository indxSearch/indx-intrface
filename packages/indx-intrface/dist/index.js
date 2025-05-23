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
  ActiveFiltersPanel: () => ActiveFiltersPanel,
  RangeFilterPanel: () => RangeFilterPanel,
  SearchInput: () => SearchInput,
  SearchProvider: () => SearchProvider,
  SearchResults: () => SearchResults,
  ValueFilterPanel: () => ValueFilterPanel,
  useSearch: () => useSearchContext
});
module.exports = __toCommonJS(src_exports);

// src/context/SearchContext.tsx
var import_react = __toESM(require("react"));
var import_jsx_runtime = require("react/jsx-runtime");
var SearchContext = (0, import_react.createContext)(void 0);
var SearchProvider = ({ children, email, password, url, dataset, allowEmptySearch = false, maxResults = 10 }) => {
  const [state, setState] = (0, import_react.useState)({
    query: "",
    results: null,
    isLoading: false,
    filters: {},
    rangeFilters: {},
    facetStats: {}
  });
  const [token, setToken] = (0, import_react.useState)(null);
  const [showFacets] = (0, import_react.useState)(true);
  const [filterableFields, setFilterableFields] = (0, import_react.useState)([]);
  const [facetableFields, setFacetableFields] = (0, import_react.useState)([]);
  const [sortableFields, setSortableFields] = (0, import_react.useState)([]);
  const [initialFacetStats, setInitialFacetStats] = (0, import_react.useState)({});
  const [initialFacetKeys, setInitialFacetKeys] = (0, import_react.useState)({});
  const [fixedFacetStats, setFixedFacetStats] = (0, import_react.useState)({});
  const [lastQueryText, setLastQueryText] = (0, import_react.useState)("");
  const [rangeBounds, setRangeBounds] = (0, import_react.useState)({});
  const [lastValueFilters, setLastValueFilters] = (0, import_react.useState)({});
  const setQuery = (0, import_react.useCallback)((query) => {
    setState((prev) => ({
      ...prev,
      query,
      filters: {},
      // reset value filters
      rangeFilters: {}
      // reset range filters
    }));
  }, []);
  const toggleFilter = (0, import_react.useCallback)((field, value) => {
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
  const setRangeFilter = (0, import_react.useCallback)((field, min, max) => {
    setState((prev) => ({
      ...prev,
      rangeFilters: {
        ...prev.rangeFilters,
        [field]: { min, max }
      }
    }));
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
          useAndOperation: true
        })
      });
      if (!response.ok) {
        const err = await response.json();
        console.error("CombineFilters failed:", err);
        throw new Error("CombineFilters failed");
      }
      current = await response.json();
    }
    return current;
  }
  const search = (0, import_react.useCallback)(async () => {
    if (!token)
      return;
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
      filterProxy = await combineFilters(allFilters, url, dataset, token);
      const searchResponse = await fetch(`${url}/api/Search/${dataset}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          text: state.query,
          maxNumberOfRecordsToReturn: maxResults,
          ...filterProxy ? { filter: filterProxy } : {},
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
      const currentFacets = searchData.facets;
      let displayFacets = currentFacets;
      if (!currentFacets || Object.keys(currentFacets).length === 0) {
        displayFacets = {};
        for (const [field, keys2] of Object.entries(initialFacetKeys)) {
          displayFacets[field] = keys2.map((key) => ({ key, value: null }));
        }
      }
      setState((prev) => ({
        ...prev,
        results: documents,
        facets: displayFacets,
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
  }, [state.query, state.filters, state.rangeFilters, token, showFacets, url, dataset, initialFacetStats, fixedFacetStats, lastQueryText, lastValueFilters, rangeBounds, maxResults, initialFacetKeys]);
  const resetFilters = (0, import_react.useCallback)(() => {
    setState((prev) => ({
      ...prev,
      filters: {},
      rangeFilters: {}
    }));
  }, []);
  const resetSingleFilter = (0, import_react.useCallback)((field, value) => {
    setState((prev) => {
      const updatedFilters = { ...prev.filters };
      const updatedRangeFilters = { ...prev.rangeFilters };
      if (value !== void 0) {
        const currentValues = updatedFilters[field] || [];
        const newValues = currentValues.filter((v) => v !== value);
        if (newValues.length > 0) {
          updatedFilters[field] = newValues;
        } else {
          delete updatedFilters[field];
        }
      } else {
        delete updatedRangeFilters[field];
      }
      return {
        ...prev,
        filters: updatedFilters,
        rangeFilters: updatedRangeFilters
      };
    });
  }, []);
  import_react.default.useEffect(() => {
    if (state.query.trim() || allowEmptySearch) {
      search();
    } else {
      setState((prev) => ({ ...prev, results: null }));
    }
  }, [state.query, state.filters, state.rangeFilters, search, allowEmptySearch]);
  import_react.default.useEffect(() => {
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
        const [filterableRes, facetableRes, sortableRes] = await Promise.all([
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
          }),
          fetch(`${url}/api/GetSortableFields/${dataset}`, {
            method: "GET",
            headers: {
              "accept": "text/plain",
              "Authorization": `Bearer ${data.token}`
            }
          })
        ]);
        const filterable = await filterableRes.json();
        const facetable = await facetableRes.json();
        const sortable = await sortableRes.json();
        setFilterableFields(filterable || []);
        setFacetableFields(facetable || []);
        setSortableFields(sortable || []);
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
        const extractedFacetKeys = {};
        if (blankSearchData.facets) {
          for (const [field, values] of Object.entries(blankSearchData.facets)) {
            if (Array.isArray(values)) {
              extractedFacetKeys[field] = values.map((v) => v.key);
            }
          }
        }
        setInitialFacetKeys(extractedFacetKeys);
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    SearchContext.Provider,
    {
      value: {
        state: {
          ...state,
          filterableFields,
          facetableFields,
          sortableFields,
          rangeBounds
        },
        setQuery,
        toggleFilter,
        setRangeFilter,
        resetFilters,
        resetSingleFilter
      },
      children
    }
  ) });
};
var useSearchContext = () => {
  const context = (0, import_react.useContext)(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return context;
};

// src/components/SearchInput.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var SearchInput = ({
  className,
  placeholder = "Search...",
  autoFocus = false,
  onKeyDown,
  ...rest
}) => {
  const { state: { query }, setQuery } = useSearchContext();
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
var import_jsx_runtime3 = require("react/jsx-runtime");
var SearchResults = ({ fields, customLabels }) => {
  const { state: { results } } = useSearchContext();
  if (!results || results.length === 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { children: "No results found." });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { children: results.map((item, index) => {
    let parsed;
    try {
      parsed = typeof item === "string" ? JSON.parse(item) : item;
    } catch {
      return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { children: "Invalid JSON" }) }, index);
    }
    const displayData = fields?.length ? fields.reduce((obj, key) => {
      if (key in parsed)
        obj[key] = parsed[key];
      return obj;
    }, {}) : parsed;
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("ul", { children: Object.entries(displayData).map(([key, value]) => {
      const label = customLabels?.[key];
      return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { children: [
        label === "" ? "" : label ?? `${key}: `,
        String(value)
      ] }, key);
    }) }) }, index);
  }) });
};

// src/components/RangeFilterPanel.tsx
var import_react_range = require("react-range");
var import_jsx_runtime4 = require("react/jsx-runtime");
var RangeFilterPanel = ({
  field,
  label,
  displayType = "input"
}) => {
  const {
    state: { rangeFilters, rangeBounds },
    setRangeFilter
  } = useSearchContext();
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
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("fieldset", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("legend", { children: label || field }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { padding: "1rem 0" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          import_react_range.Range,
          {
            step: 1,
            min: actualMin,
            max: actualMax,
            values: [currentMin, currentMax],
            onChange: handleRangeChange,
            renderTrack: ({ props, children }) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
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
              return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: currentMin }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: currentMax })
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
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("fieldset", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("legend", { children: label || field }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("label", { children: [
      "Min:",
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "input",
        {
          type: "number",
          value: currentMin,
          onChange: handleMinChange
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("label", { children: [
      "Max:",
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "input",
        {
          type: "number",
          value: currentMax,
          onChange: handleMaxChange
        }
      )
    ] })
  ] });
};

// src/components/ValueFilterPanel.tsx
var import_react2 = __toESM(require("react"));
var import_jsx_runtime5 = require("react/jsx-runtime");
var ValueFilterPanel = ({
  field,
  label,
  preserveBlankFacetState = false
}) => {
  const {
    state: { facets, filterableFields, facetableFields, filters },
    toggleFilter
  } = useSearchContext();
  const preservedFacetValuesRef = import_react2.default.useRef(null);
  if (!filterableFields?.includes(field) || !facetableFields?.includes(field)) {
    const missing = [];
    if (!filterableFields?.includes(field))
      missing.push("filterable");
    if (!facetableFields?.includes(field))
      missing.push("facetable");
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { color: "red" }, children: [
      'Cannot render filter for "',
      field,
      '": missing ',
      missing.join(" and "),
      "."
    ] });
  }
  const facetValues = facets?.[field];
  if (!facetValues || !Array.isArray(facetValues))
    return null;
  const selectedValues = filters?.[field] ?? [];
  if (preserveBlankFacetState && !preservedFacetValuesRef.current && facetValues.length > 0) {
    preservedFacetValuesRef.current = facetValues.reduce((acc, f) => {
      acc[f.key] = f.value;
      return acc;
    }, {});
  }
  const mergedValuesMap = /* @__PURE__ */ new Map();
  if (preserveBlankFacetState && preservedFacetValuesRef.current) {
    for (const key in preservedFacetValuesRef.current) {
      mergedValuesMap.set(key, 0);
    }
    for (const f of facetValues) {
      mergedValuesMap.set(f.key, f.value);
    }
  } else {
    for (const f of facetValues) {
      mergedValuesMap.set(f.key, f.value);
    }
  }
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("fieldset", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("legend", { children: label || field }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("ul", { children: Array.from(mergedValuesMap.entries()).map(([key, count], index) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        "input",
        {
          type: "checkbox",
          checked: selectedValues.includes(key),
          onChange: () => toggleFilter(field, key),
          disabled: count === 0
        }
      ),
      key,
      " (",
      count,
      ")"
    ] }) }, index)) })
  ] });
};

// src/components/ActiveFiltersPanel.tsx
var import_jsx_runtime6 = require("react/jsx-runtime");
var ActiveFiltersPanel = () => {
  const {
    state: { filters, rangeFilters },
    resetFilters,
    resetSingleFilter
  } = useSearchContext();
  const hasFilters = Object.keys(filters).length > 0 || Object.keys(rangeFilters).length > 0;
  if (!hasFilters)
    return null;
  const handleResetFilters = () => {
    resetFilters();
  };
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h3", { children: "Active Filters" }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("ul", { children: [
      Object.entries(filters).map(
        ([field, values]) => values.map((value) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("button", { onClick: () => resetSingleFilter(field, value), children: [
          field,
          ": ",
          value,
          " \u274C"
        ] }) }, `${field}-${value}`))
      ),
      Object.entries(rangeFilters).map(([field, { min, max }]) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("button", { onClick: () => resetSingleFilter(field), children: [
        field,
        ": ",
        min,
        " \u2013 ",
        max,
        " \u274C"
      ] }) }, field))
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { onClick: handleResetFilters, children: "Reset" })
  ] });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ActiveFiltersPanel,
  RangeFilterPanel,
  SearchInput,
  SearchProvider,
  SearchResults,
  ValueFilterPanel,
  useSearch
});
//# sourceMappingURL=index.js.map