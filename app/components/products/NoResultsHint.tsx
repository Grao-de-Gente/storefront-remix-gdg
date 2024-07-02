import { FacetFilterTracker } from '~/components/facet-filter/facet-filter-tracker';
import { ComponentProps } from 'react';


export function NoResultsHint({
  facetFilterTracker,
  ...props
}: { facetFilterTracker?: FacetFilterTracker } & ComponentProps<'div'>) {


  return (
    <div {...props}>
      <h2 className="text-2xl sm:text-4xl font-light tracking-tight text-gray-900">
        'product.noResults'
      </h2>
      {facetFilterTracker?.facetsWithValues.some((f) =>
        f.values.some((v) => v.selected),
      ) && (
        <h3 className="text-lg sm:text-2xl font-light tracking-tight text-gray-900">
          'product.filterTip'
        </h3>
      )}
    </div>
  );
}
