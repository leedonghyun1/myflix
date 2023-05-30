import { useQuery } from "react-query";
import { IGetMoviesResult, getMovies } from "../api";
import styled from "styled-components";
import { makeImagePath } from "../utils";
import {
  motion,
  AnimatePresence,
  useScroll,
  useViewportScroll,
} from "framer-motion";
import { useState } from "react";
import { off } from "process";
import { useHistory, useRouteMatch } from "react-router-dom";

const Wrapper = styled.div`
  background-color: black;
  padding-bottom: 20px;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: conter;
  align-items: center;
`;

const Banner = styled.div<{ bgPhoto: string }>`
  height: 130vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
    url(${(props) => props.bgPhoto});
  background-size: cover;
`;

const Title = styled.h2`
  font-size: 70px;
  margin-bottom: 20px;
`;

const Overview = styled.div`
  font-size: 26px;
  width: 50%;
`;

const Slider = styled.div`
  position: relative;
  top: -100px;
`;

const Row = styled(motion.div)`
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(6, 1fr);
  position: absolute;
  width: 100%;
`;

const Box = styled(motion.div)<{ bgPhoto: string }>`
  background-color: white;
  background-image: url(${(props) => props.bgPhoto});
  background-position: center center;
  background-size: cover;
  border-radius: 10px;
  height: 150px;
  font-size: 66px;
  cursor: pointer;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;

const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  border-radius: 0 0 10px 10px;
  h4 {
    text-align: center;
    font-size: 18px;
  }
`;

const rowVars = {
  hidden: {
    x: window.outerWidth + 5,
  },
  visible: {
    x: 0,
  },
  exiting: {
    x: -window.outerWidth - 5,
  },
};
const boxVars = {
  normal: {
    scale: 1,
  },
  hover: {
    scale: 1.3,
    y: -80,
    transition: {
      delay: 0.5,
      duration: 0.1,
      type: "tween",
    },
  },
};

const infoVars = {
  hover: {
    opacity: 1,
    transition: {
      delay: 0.5,
      duration: 0.1,
      type: "tween",
    },
  },
};

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;

const BigThumbnailVideo = styled(motion.div)`
  position: absolute;
  width: 40vw;
  height: 80vh;
  left: 0;
  right: 0;
  margin: 0 auto;
  opacity: 1;
  background-color: ${(props) => props.theme.black.lighter};
`;
const BigCover = styled.div`
  width: 100%;
  height: 300px;
  background-size:cover;
  background-position: center center;
  border-radius: 10px;
  overflow: hidden;
`;
const BigTitle = styled.h3`
  color: ${(props) => props.theme.white.lighter};
  text-align: left;
  font-size: 40px;
  position: relative;
  top: -70px;
  padding-left: 20px;
`;

const BigOverview = styled.p`
  padding-left: 20px;
  color: ${(props) => props.theme.white.lighter};
  font-size: 15px;
`;

const offset = 6;

function Home() {
  const history = useHistory();
  const bigMovieMatch = useRouteMatch<{ movieId: string }>("/movie/:movieId");
  const { scrollY } = useViewportScroll();
  console.log(history);
  console.log(bigMovieMatch?.params.movieId);

  const { data, isLoading } = useQuery<IGetMoviesResult>(
    ["movies", "nowPlaying"],
    getMovies
  );
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const toggleLeaving = () => setLeaving((prev) => !prev);
  const increaseIndex = () => {
    if (data) {
      if (leaving) return;
      toggleLeaving();
      const totalMovies = data?.results.length;
      const maxIndex = Math.ceil(totalMovies / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };

  const onBoxClicked = (movieId: number) => {
    history.push(`/movie/${movieId}`);
  };

  const onOverlayClicked = () => history.push("/");
  const clickedMovie =
    bigMovieMatch?.params.movieId &&
    data?.results.find(
      (movie) => String(movie.id) === bigMovieMatch.params.movieId
    );

  return (
    <Wrapper>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner
            onClick={increaseIndex}
            bgPhoto={makeImagePath(data?.results[0].backdrop_path || "")}
          >
            <Title>{data?.results[0].title}</Title>
            <Overview>{data?.results[0].overview}</Overview>
          </Banner>
          <Slider>
            <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
              <Row
                key={index}
                variants={rowVars}
                initial="hidden"
                animate="visible"
                exit="exiting"
                transition={{
                  type: "tween",
                  duration: 2,
                }}
              >
                {data?.results
                  .slice(1)
                  .slice(offset * index, offset * index + offset)
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + ""}
                      key={movie.id}
                      onClick={() => onBoxClicked(movie.id)}
                      variants={boxVars}
                      whileHover="hover"
                      initial="normal"
                      transition={{ type: "tween" }}
                      bgPhoto={makeImagePath(movie.backdrop_path || "", "w500")}
                    >
                      <Info variants={infoVars}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
          </Slider>
          <AnimatePresence>
            {bigMovieMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClicked}
                  exit={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
                <BigThumbnailVideo
                  style={{ top: scrollY.get() + 100 }}
                  layoutId={bigMovieMatch.params.movieId}
                >
                  {clickedMovie && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, rgb(0,0,0, 0.8), transparent), url(${makeImagePath(
                            clickedMovie.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      />
                      <BigTitle>{clickedMovie.title}</BigTitle>
                      <BigOverview>{clickedMovie.overview}</BigOverview>
                    </>
                  )}
                </BigThumbnailVideo>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}
export default Home;
