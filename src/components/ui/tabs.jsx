import * as React from "react";

// Créer le contexte avant de l'utiliser
const TabsContext = React.createContext(null);

const TabsList = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`inline-flex items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500 ${className}`}
      {...props}
    />
  );
});
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef(({ className, value, ...props }, ref) => {
  // We need to access the context to determine if this tab is selected
  const context = React.useContext(TabsContext);
  const isSelected = context?.value === value;

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isSelected
          ? "bg-white text-gray-950 shadow-sm"
          : "text-gray-500 hover:text-gray-900"
      } ${className}`}
      aria-selected={isSelected}
      onClick={() => context?.onValueChange(value)}  // Ajouter l'événement onClick
      {...props}
    />
  );
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef(
  ({ className, value, ...props }, ref) => {
    // We need to access the context to determine if this content should be visible
    const context = React.useContext(TabsContext);
    const isSelected = context?.value === value;

    if (!isSelected) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="tabpanel"
        tabIndex={0}
        className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 ${className}`}
        {...props}
      />
    );
  }
);
TabsContent.displayName = "TabsContent";

const Tabs = React.forwardRef(
  ({ className, value, onValueChange, defaultValue, ...props }, ref) => {
    // Gérer l'état interne si nécessaire
    const [tabValue, setTabValue] = React.useState(value || defaultValue || "");
    
    // Suivre les changements de la valeur externe
    React.useEffect(() => {
      if (value !== undefined) {
        setTabValue(value);
      }
    }, [value]);
    
    // Gestion du changement d'onglet
    const handleValueChange = React.useCallback((newValue) => {
      setTabValue(newValue);
      if (onValueChange) {
        onValueChange(newValue);
      }
    }, [onValueChange]);

    return (
      <TabsContext.Provider value={{ value: value !== undefined ? value : tabValue, onValueChange: handleValueChange }}>
        <div
          ref={ref}
          className={`${className}`}
          {...props}
        />
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = "Tabs";

export { Tabs, TabsList, TabsTrigger, TabsContent };