import type { Category, Locale, SortOption, Zone } from "@/lib/types";

type ProvidersFiltersProps = {
  locale: Locale;
  categories: Category[];
  zones: Zone[];
  values: {
    query?: string;
    category?: string;
    zone?: string;
    sort?: SortOption;
  };
  labels: {
    searchLabel: string;
    categoryLabel: string;
    zoneLabel: string;
    sortLabel: string;
    sortTop: string;
    sortRating: string;
    sortResponse: string;
    sortJobs: string;
    reset: string;
  };
};

export function ProvidersFilters({ locale, categories, zones, values, labels }: ProvidersFiltersProps) {
  return (
    <form
      action={`/${locale}/providers`}
      className="surface-card flex flex-col gap-4 rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(236,244,255,0.9))] p-5 lg:flex-row lg:items-end"
    >
      <label className="flex-1">
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.searchLabel}</span>
        <input
          type="search"
          name="q"
          defaultValue={values.query}
          className="input-base"
          placeholder={locale === "ar" ? "مثال: كهربائي أو كريم" : "Ex: électricien ou Karim"}
        />
      </label>

      <label className="lg:w-56">
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.categoryLabel}</span>
        <select name="category" defaultValue={values.category ?? ""} className="input-base">
          <option value="">{locale === "ar" ? "كل الفئات" : "Toutes les catégories"}</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name[locale]}
            </option>
          ))}
        </select>
      </label>

      <label className="lg:w-52">
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.zoneLabel}</span>
        <select name="zone" defaultValue={values.zone ?? ""} className="input-base">
          <option value="">{locale === "ar" ? "كل المناطق" : "Toutes les zones"}</option>
          {zones.map((zone) => (
            <option key={zone.slug} value={zone.slug}>
              {zone.name[locale]}
            </option>
          ))}
        </select>
      </label>

      <label className="lg:w-56">
        <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{labels.sortLabel}</span>
        <select name="sort" defaultValue={values.sort ?? "top"} className="input-base">
          <option value="top">{labels.sortTop}</option>
          <option value="rating">{labels.sortRating}</option>
          <option value="response">{labels.sortResponse}</option>
          <option value="jobs">{labels.sortJobs}</option>
        </select>
      </label>

      <div className="flex gap-3">
        <button type="submit" className="button-primary">
          {locale === "ar" ? "تطبيق" : "Appliquer"}
        </button>
        <a href={`/${locale}/providers`} className="button-secondary">
          {labels.reset}
        </a>
      </div>
    </form>
  );
}
