import { Search } from '@mui/icons-material'
import { CircularProgress } from '@mui/material'
import Autocomplete, { AutocompleteProps } from '@mui/material/Autocomplete'
import { debounce } from 'lodash'
import React, {FunctionComponent, useCallback, useEffect, useState} from 'react'

import { TextField } from './TextField'

export type AutocompleteSuggestion = {
  label: string;
  value: string;
};

export type DebouncedAutocompleteProps = {
  load: (value?: string) => Promise<AutocompleteSuggestion[]>;
  placeholder: string;
  minSearchLength?: number;
  loadOnStart?: boolean;
  ready?: boolean;
} & Omit<
  AutocompleteProps<any, any, any, any>,
  'renderInput' | 'size' | 'options'
>

export const DebouncedAutocomplete: FunctionComponent<
  DebouncedAutocompleteProps
> = ({ load, title ,minSearchLength = 1, loadOnStart, ready = true, ...props }) => {
  const [suggestions, setSuggestions] = useState<
    AutocompleteSuggestion[] | undefined
  >(undefined)
  const [loading, setLoading] = useState<boolean>(false)

  const [initiallyLoaded, setInitiallyLoaded] = useState(false)

  const debouncedRequest = useCallback(
    debounce(async (value: string) => {
      const data = await load(value)
      if (data.length > 0) {
        setSuggestions(data)
      } else {
        setSuggestions(undefined)
      }
      setLoading(false)
    }, 500),
    [setLoading, setSuggestions, load]
  )

  const handleOnChange = useCallback(
      (e: any): void => {
        setLoading(true)
        const value = e.currentTarget.value
        if (value.length >=  minSearchLength) {
          debouncedRequest(e.currentTarget.value)
        }
      },
      [setLoading, debouncedRequest, minSearchLength],
  )

  useEffect(() => {
    if (loadOnStart && ready && !initiallyLoaded) {
      setLoading(true)
      load().then((data) => {
        if (data?.length > 0) {
          setSuggestions(data)
        }
        setLoading(false)
        setInitiallyLoaded(true)
      })
    }
  }, [setLoading, setSuggestions, load, initiallyLoaded, setInitiallyLoaded, loadOnStart, ready])


  return (
    <>
      <Autocomplete
        noOptionsText="No results"
        {...props}
        renderInput={(params) => (
          // @ts-ignore
          <TextField
            {...params}
              label={title}
            variant={'standard'}
            placeholder={props.placeholder}
            onChange={handleOnChange}
            InputProps={{
              ...params.InputProps,
              disabled: props.readOnly,
              startAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={16} />
                  ) : (
                    <Search fontSize="small" />
                  )}
                  {params.InputProps.startAdornment}
                </>
              ),
            }}
          />
        )}
        options={suggestions || []}
      />
    </>
  )
}
