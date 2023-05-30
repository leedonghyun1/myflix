const API_KEY="48868ee91cda9cd4b38bfda59672bfa2";
const BASE_PATH="https://api.themoviedb.org/3";

export interface IMovie {
  id: number;
  backdrop_path: string;
  poster_path: string;
  title: string;
  overview: string;
}

export interface IGetMoviesResult {
  date: {
    maximum: string;
    minimum: string;
  };
  page: number;
  results: IMovie [];
  total_pages: number;
  total_results: number;
}

export function getMovies(){
  return fetch(`${BASE_PATH}/movie/now_playing?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}