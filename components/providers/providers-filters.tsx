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
      className="surface-card flex flex-col gap-4 rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(13,28,69,0.96),rgba(20,92,255,0.9)_72%,rgba(96,165,250,0.84))] p-5 text-white shadow-[0_28px_60px_rgba(12,40,104,0.18)] lg:flex-row lg:items-end"
    >
      <label className="flex-1">
        <span className="mb-2 block text-sm font-semibold text-white/76">{labels.searchLabel}</span>
        <input
          type="search"
          name="q"
          defaultValue={values.query}
          className="input-base"
          placeholder={locale === "ar" ? "مثال: كهربائي أو كريم" : "Ex: électricien ou Karim"}
        />
      </label>

      <label className="lg:w-56">
        <span className="mb-2 block text-sm font-semibold text-white/76">{labels.categoryLabel}</span>
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
        <span className="mb-2 block text-sm font-semibold text-white/76">{labels.zoneLabel}</span>
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
        <span className="mb-2 block text-sm font-semibold text-white/76">{labels.sortLabel}</span>
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
