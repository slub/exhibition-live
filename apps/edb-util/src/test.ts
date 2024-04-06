import fetch from "node-fetch";

const testApi = async () => {
  const response = await fetch(`http://localhost:3001/color-palette?imageUrl=${encodeURIComponent("https://pro-mnk.de/wp-content/uploads/2024/02/1_Dirk-Sommer_Erbsensuppe-Hammer-und-Ochsenkotelett-588cf9741-1812x2048.jpg")}`)
  console.log( JSON.stringify( await response.json(), null, 2 ) )
}

testApi()
