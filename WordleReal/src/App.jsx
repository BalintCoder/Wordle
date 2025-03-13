import { useEffect, useState } from "react";
import "./App.css";
import wordsData from "./data/words.json"; 
import axios from "axios"; 

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

export default function App() {
    const [solution, setSolution] = useState("");
    const [guesses, setGuesses] = useState(Array(MAX_GUESSES).fill(null));
    const [currentGuess, setCurrentGuess] = useState("");
    const [isGameOver, setIsGameOver] = useState(false);
    const [error, setError] = useState(""); 
    const [real, setReal] = useState(""); 
    const [warning, setWarning] = useState(""); 

    
    
    const checkWordValidity = async (word) => {
        try {
            const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            return true; 
        } catch (error) {
            return false; 
        }
    };

    useEffect(() => {
        const handleType = async (event) => {
            if (isGameOver) return;

            const key = event.key.toLowerCase();

            if (key === "enter") {
                if (currentGuess.length !== WORD_LENGTH) {
                    setError("The word must be 5 letters long!");
                    return;
                }

                
                if (!wordsData.words.includes(currentGuess)) {
                    const isValidWord = await checkWordValidity(currentGuess); 
                    if (!isValidWord) {
                        setError("Not a valid word!");
                        return;
                    } else {
                        setWarning("This word is valid but not in our list.");
                    }
                }

                setError(""); 
                setWarning(""); 
                setReal("");
                const newGuesses = [...guesses];
                newGuesses[guesses.findIndex((val) => val == null)] = currentGuess;
                setGuesses(newGuesses);
                setCurrentGuess("");

                
                if (newGuesses.every((guess) => guess !== null)) {
                    setIsGameOver(true);
                }

                if (solution === currentGuess) {
                    setIsGameOver(true);
                }
                return;
            }

            if (key === "backspace") {
                setCurrentGuess((prev) => prev.slice(0, -1));
                setError(""); 
                return;
            }

            if (!/^[a-z]$/.test(key) || currentGuess.length >= WORD_LENGTH) {
                return;
            }

            setCurrentGuess((prev) => prev + key);
        };

        window.addEventListener("keydown", handleType);
        return () => window.removeEventListener("keydown", handleType);
    }, [currentGuess, isGameOver, solution, guesses]);

    useEffect(() => {
        const randomWord = wordsData.words[Math.floor(Math.random() * wordsData.words.length)];
        setSolution(randomWord);
        setReal(randomWord); 
        
    }, []);

    return (
        <div className="container">
            <h1 className="title">Wordle</h1>
            {error && <p className="error">{error}</p>}
            {warning && <p className="warning">{warning}</p>}
            {isGameOver && <p className="solution">The correct word was: {solution}</p>}
            <div className="board">
                {guesses.map((guess, i) => {
                    const isCurrentGuess = i === guesses.findIndex((val) => val == null);
                    return (
                        <Line
                            key={i}
                            guess={isCurrentGuess ? currentGuess : guess ?? ""}
                            isFinal={!isCurrentGuess && guess !== null}
                            solution={solution}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function Line({ guess, isFinal, solution }) {
    const tiles = [];
    for (let i = 0; i < WORD_LENGTH; i++) {
        const char = guess[i];
        let className = "tile";
        if (isFinal) {
            if (char === solution[i]) {
                className += " correct";
            } else if (solution.includes(char)) {
                className += " close";
            } else {
                className += " incorrect";
            }
        }
        tiles.push(
            <div key={i} className={className}>
                {char}
            </div>
        );
    }
    return <div className="line">{tiles}</div>;
}
