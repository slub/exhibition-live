import React, {FunctionComponent, useState} from 'react';
import {AutocompleteSuggestion, DebouncedAutocomplete} from "../DebouncedAutoComplete";
import parse from "html-react-parser";
import findPersonWithinWikidata from "../../utils/wikidata/findPersonWithinWikidata";

interface OwnProps {}

type Props = OwnProps;

const getTextFromHTML: (html: string) => null | string = (html) => {
  const
      document = (new DOMParser()).parseFromString(html, "text/html"),
      el = document.querySelector('body')
  return el?.textContent ? el.textContent.trim() : null
}

const buildLabelFromSuggestion: (suggestion: AutocompleteSuggestion) => string =
    ({label, value}) =>`${getTextFromHTML(`<html><body>${label}</body></html>`)}, wikidata: ${value}`

const WikidataAutoCompleteInput: FunctionComponent<Props> = (props) => {
  const [selected, setSelected] = useState<AutocompleteSuggestion | null>(null);

  return (
      <DebouncedAutocomplete
          load={async (searchString) => searchString
              ? (await findPersonWithinWikidata(searchString, 10)).search.map(({snippet, title}) => ({label: snippet.split('\n')[0], value: title}))
              : []}
          placeholder="Search for a human within wikidata"
          getOptionLabel={buildLabelFromSuggestion}
          renderOption={(props, option: any) => (
              <li {...props} key={option.value}>
                {parse(`<span class="debounced_autocomplete_option_label">${option.label}</span>`)}
                {option.value}
              </li>
          )}
          onChange={(_event: any, item: AutocompleteSuggestion | null) => {
              setSelected(item);
          }}
      />
  );
};

export default WikidataAutoCompleteInput;
