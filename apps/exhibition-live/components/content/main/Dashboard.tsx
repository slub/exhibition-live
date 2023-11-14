import {Avatar, Box, Card, CardContent, CardHeader, Grid, styled, Typography} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import {Search, TrendingDown, TrendingUp} from "@mui/icons-material";
import {useQuery} from "@tanstack/react-query";
import {useGlobalCRUDOptions} from "../../state/useGlobalCRUDOptions";
import {SELECT} from "@tpluscode/sparql-builder";
import {BASE_IRI, primaryFields} from "../../config";
import {sladb} from "../../form/formConfigs";
import BarReChart from "../charts/BarReChart";
import {orderBy, sortBy} from "lodash";
import {useMemo} from "react";
import {SearchBar} from "./Search";
import {ParentSize} from "@visx/responsive";


export const HeaderTitle = styled(Typography)(({theme}) => ({
  fontFamily: "'Play', sans-serif",
  fontSize: '1.5rem',
  color: 'black',
  textAlign: 'center',
  width: '100%',
  lineHeight: 0.5,
  [theme.breakpoints.up('sm')]: {
    fontSize: '2.25rem',
    lineHeight: 1.25,
    letterSpacing: 0.005
  }
}));

type OwnCardProps = {
  avatar?: string,
  title: string,
  info?: string,
  subheader: string,
  trendDirection: "up" | "down",
  children?: React.ReactNode
}
export const OwnCard = ({avatar, title, subheader, trendDirection, info, children}: OwnCardProps) => (<Card
  raised
  sx={{borderRadius: "2px", m: 1, backgroundColor: theme => `rgba(255, 255, 255, 0.8)`,}}
>
  <CardHeader
    avatar={avatar && <Avatar src={`${avatar}`}/>}
    title={<Typography variant="h6" fontFamily={"'Play', sans-serif"}>{title}</Typography>}
    subheader={(
      <Box display="flex" justifyContent="space-between">
        {subheader}
        <Box display="flex" alignItems="center">
          {info && <Typography variant="subtitle1">{info}</Typography>}
          {trendDirection === "down" ? (
            <TrendingDown sx={{ml: 1, color: theme => theme.palette.error.dark}}/>
          ) : (
            <TrendingUp sx={{ml: 1, color: theme => theme.palette.success.dark}}/>
          )}
        </Box>
      </Box>
    )}
  />
  <CardContent
    sx={{
      p: 5,
      "&.MuiCardContent-root": {
        paddingBottom: 0,
      },
    }}
  >
    {children || null}
  </CardContent>
</Card>);


export const typeIRItoTypeName = (iri: string) => {
  return iri.substring(BASE_IRI.length, iri.length)
}

export const Dashboard = (props) => {

  const {crudOptions} = useGlobalCRUDOptions()
  const {selectFetch} = crudOptions || {}
  const relevantTypes = Object.keys(primaryFields).map((key) => `<${sladb(key).value}>`)
  const {data: typeCountData} = useQuery(['typeCount'], () => {
    const query = SELECT`
      ?type (COUNT(?s) AS ?count)`.WHERE`
      VALUES ?type { ${relevantTypes.join(' ')} }
      ?s a ?type
    `.GROUP().BY` ?type `.build()
    return selectFetch(query)
  }, {enabled: !!selectFetch, refetchInterval: 1000 * 10})


  const scoreCount = useMemo(() => orderBy(typeCountData?.map((item) => ({
    title: typeIRItoTypeName(item.type?.value),
    score: parseInt(item.count?.value) || 0
  })), ['score'], ['desc']), [typeCountData])

  return (
    <Box
      sx={{
        background: 'url("./images/bg3.jpeg")',
        padding: "20px 30px 99px 30px",
        backgroundSize: "cover",
      }}
    >
      <Box sx={{marginBottom: '4rem', marginTop: '1em'}}>
        <HeaderTitle>Willkommen bei der Ausstellungsdatenbank</HeaderTitle>
      </Box>
      <Grid2
        container
        justifyContent="space-evenly"
        alignItems="center"
        sx={{p: 10}}>
        <Grid2 lg={12}>
          <SearchBar/>
        </Grid2>
        <Grid2 xs={12} sm={6} md={4} lg={4}>
          <Grid container justifyContent="space-evenly" alignItems="center">
            {scoreCount.map((item, index) => (
              <Grid item key={item.title}>
                <OwnCard title={item.title} subheader={item.score} trendDirection={"up"}>
                </OwnCard>
              </Grid>
            ))}
          </Grid>
        </Grid2>
        <Grid2 xs={12} sm={6} md={8} lg={8}>
          <OwnCard title={"Wichtigste Entitäten"} subheader={""} trendDirection={"up"}>
            <ParentSize>
              {
                ({width, height}) => (
                  <BarReChart scores={scoreCount} width={width} height={height}/>
                )
              }
            </ParentSize>
          </OwnCard>
        </Grid2>
      </Grid2>
    </Box>
  )
}
