// import './App.css';
import CalculatorForm from './components/CalculatorForm'  // Обновленный путь импорта
import {createTheme, ThemeProvider} from "@mui/material";

const theme = createTheme({
    palette: {
        primary: {
            light: '#5f9787',
            main: '#219653',
            dark: '#26584a',
            contrastText: '#ffffff',
        },
        secondary: {
            light: '#ffa733',
            main: '#ff9100',
            dark: '#b26500',
            contrastText: '#353A3F',
        },
    },
    typography: {
        button: { // Here is where you can customise the button
            fontSize: 14,
            fontWeight: 700,
        },
        h1: {
            fontFamily: "Jost",
            color: '#0080fc'
        }
    }
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <div className="App">
                <header className="App-header">
                    <CalculatorForm/>
                </header>
            </div>
        </ThemeProvider>
    );
}

export default App;