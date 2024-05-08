type Person = { firstname: string; surname: string };
type VoicePerformer = Person & { voice: "Sopran" | "Alt" | "Tenor" | "Bass" };
type InstrumentalPerformer = Person & { instrument: string };

type Performer = VoicePerformer | InstrumentalPerformer;

type Conductor = Person & { baton: string };
type Ensemble = { name: string; conductor: Conductor };

type Performance = {
  name: string;
  location: string;
  date: string;
  duration: number;
  performers: {
    ensemble: Ensemble[];
    soloists: Performer[];
  };
};

const bashMesse: Performance = {
  name: "Aufführung der Messe in h-Moll von Johann Sebastian Bach",
  date: "2022-06-25",
  location: "St. Thomas Kirche, Leipzig",
  duration: 120,
  performers: {
    soloists: [
      {
        surname: "Mustermann",
        firstname: "Erika",
        voice: "Sopran",
      },
      {
        surname: "Musterfrau",
        firstname: "Max",
        instrument: "Harfe",
      },
    ],
    ensemble: [
      {
        name: "Thomanerchor Leipzig",
        conductor: {
          surname: "Gardiner",
          firstname: "John Eliot",
          baton: "Holz",
        },
      },
      {
        name: "Robert-Schumann-Philharmonie Chemnitz",
        conductor: {
          surname: "Masur",
          firstname: "Kurt",
          baton: "Kunststoff",
        },
      },
    ],
  },
};
