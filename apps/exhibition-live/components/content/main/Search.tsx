import * as React from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';
import {ParentSize} from '@visx/responsive';
import {useMemo, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {useGlobalCRUDOptions} from "../../state/useGlobalCRUDOptions";
import {SELECT} from "@tpluscode/sparql-builder";
import {primaryFields} from "../../config";
import {defaultPrefix, sladb} from "../../form/formConfigs";
import {variable} from "@rdfjs/data-model";
import {typeIRItoTypeName} from "./Dashboard";
import {orderBy, uniq, uniqBy} from "lodash";
import {fixSparqlOrder} from "../../utils/discover";
import {Chip, Grid, Skeleton} from "@mui/material";
import {withDefaultPrefix} from "../../utils/crud/makeSPARQLWherePart";
import {filterUndefOrNull} from "../../utils/core";
import {Line, LineChart, Tooltip, XAxis, YAxis} from "recharts";


const makeFilterUNION2 = (searchString: string, length: number) => {
  const filterUNION = [];
  for (let i = 0; i < length; i++) {
    const filter = ` {
      ${i === 0 ? '?entity' : `?o${i - 1}`} ?p${i} ?o${i} .
      FILTER(CONTAINS(LCASE(STR(?o${i})), "${searchString}"))
    } `;
    filterUNION.push(filter);
  }
  return filterUNION.join(' UNION ');
}

const makeFilterUNION = (searchString: string, length: number) => {
  return `?entity ?p ?o . FILTER(CONTAINS(LCASE(STR(?o)), "${searchString}"))`;
}

export const SearchBar = () => {
  const [searchText, setSearchText] = useState<string>("");
  const {crudOptions} = useGlobalCRUDOptions();
  const {selectFetch} = crudOptions || {};
  const relevantTypes = Object.keys(primaryFields).map((key) => `<${sladb(key).value}>`)
  const {data: searchResults} = useQuery(['search', searchText], async () => {
    if (!selectFetch) return [];
    const count = variable('count')
    const searchString = searchText.toLowerCase().replace(/"/g, '');
    const query = fixSparqlOrder(SELECT.DISTINCT` ?type (COUNT(?type) AS ${count}) `.WHERE`
    ?entity a ?type .
    ${makeFilterUNION(searchString, 2)}
    `.GROUP().BY` ?type `.ORDER().BY(count).build());
    return orderBy((await selectFetch(query))?.map((item) => ({
      title: typeIRItoTypeName(item.type?.value),
      score: parseInt(item.count?.value) || 0
    }), ['title'], ['desc']))
  }, {
    enabled: searchText.length > 2,
    keepPreviousData: true,
    staleTime: 1000
  });

  const {data: allExhibitions} = useQuery(['allExhibitions', searchText], async () => {
    if (!selectFetch) return [];
    const searchString = searchText.toLowerCase().replace(/"/g, '');
    const query = withDefaultPrefix(defaultPrefix, SELECT.DISTINCT`?s ?title ?to ?from `.WHERE`
    ?s a <${sladb('Exhibition').value}> .
    ?s ?p ?o .
    ?s :title ?title .
    OPTIONAL { ?s :toDateDisplay ?to }
    OPTIONAL { ?s :fromDateDisplay ?from }
    ${makeFilterUNION(searchString, 2)}
    `.build());
    return (await selectFetch(query))?.map((item) => ({
      title: item.title?.value,
      to: item.to,
      from: item.from
    }))
  }, {
    enabled: searchText.length > 2,
    keepPreviousData: true,
    staleTime: 1000
  })

  const dateValueToInt = (date: string) => {
    if (date.length === 4) return parseInt(date)
    //const format = 'DD.MM.YYYY'
    const dateParts = date.split('.');
    const year = parseInt(dateParts[2]);
    return year;
  }


  const dateScore = useMemo(() => {

    const allYears = uniq(filterUndefOrNull(allExhibitions?.flatMap((item) => [item.to?.value, item.from?.value]) || []).map(dateValueToInt))
    return orderBy(allYears.map((year) => {
      const exhibitions = allExhibitions?.filter((item) => dateValueToInt(item.to?.value || '0000') === year || dateValueToInt(item.from?.value || '0000') === year)
      const score: number = exhibitions?.length || 0;
      return {year, score}
    }), ['year'], ['asc']) as { year: number, score: number }[]
  }, [allExhibitions])

  return (
    <Grid container direction={'row'} spacing={2}>
      <Grid item xs={12}>
        <Paper
          component="form"
          sx={{p: '12px 10', display: 'flex', borderRadius: '1rem', alignItems: 'center', width: '100%'}}
        >
          <IconButton sx={{p: '10px'}} size={'large'} aria-label="menu">
            <MenuIcon sx={{fontSize: '2.5rem'}}/>
          </IconButton>
          <InputBase
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ml: 1, flex: 1, fontSize: '2.5rem'}}
            inputProps={{'aria-label': 'Such innerhalb der gesamten Datenbank'}}
          />
          <IconButton type="button" sx={{p: '10px'}} size={'large'} aria-label="search">
            <SearchIcon sx={{fontSize: '2.5rem'}}/>
          </IconButton>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} sx={{minHeight: '5em'}}>
          {searchResults?.map((item) => (
            <Grid item key={item.title}>
              <Chip color={'secondary'} label={`${item.title} (${item.score})`}/>
            </Grid>)) || null
          }
        </Grid>
        <Grid container spacing={2}>{
          <Paper
            sx={{p: '12px 10',
              transition: 'background-color 0.5s ease-in-out',
              backgroundColor: theme => `rgba(255, 255, 255, ${dateScore?.length <= 0 ? 0 : 0.8})`,
              display: 'flex', borderRadius: '1rem', alignItems: 'center', width: '100%'}}
          >
            <ParentSize>{
              ({width, height}) =>
              dateScore?.length <= 0 ? <Skeleton sx={{width, height: '300px'}} />
                : <LineChart width={width} height={300} data={dateScore}>
                <XAxis dataKey="year"/>
                <YAxis dataKey="score"/>
                <Tooltip/>
                <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{r: 8}}/>
              </LineChart>
            }
            </ParentSize>
          </Paper>
        }
        </Grid>

      </Grid>
    </Grid>

  );
}
